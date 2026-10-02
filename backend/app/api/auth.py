from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.api.deps import COOKIE, get_current_user
from app.core.config import get_settings
from app.core.ratelimit import rate_limit
from app.core.security import create_token, decode_token, hash_password, verify_password
from app.db.session import get_db
from app.models.models import Order, User
from app.schemas.schemas import ForgotIn, LoginIn, RegisterIn, ResetIn, UserOut
from app.services import email as mail

router = APIRouter(prefix="/api/auth", tags=["auth"])


def set_session(response: Response, user: User) -> None:
    s = get_settings()
    response.set_cookie(COOKIE, create_token(str(user.id)), httponly=True, secure=s.cookie_secure,
                        samesite=s.cookie_samesite, max_age=s.jwt_expire_minutes * 60, path="/")


def create_client(db: Session, email: str, full_name: str, password: str, **extra) -> User:
    user = User(email=email.lower(), full_name=full_name, password_hash=hash_password(password), role="client", **extra)
    db.add(user)
    db.flush()
    # attach earlier guest orders placed with the same email
    for o in db.scalars(select(Order).where(Order.client_email == user.email, Order.user_id.is_(None))):
        o.user_id = user.id
    return user


@router.post("/register", response_model=UserOut, status_code=201, dependencies=[Depends(rate_limit("register", 10, 3600))])
def register(data: RegisterIn, response: Response, db: Session = Depends(get_db)):
    if db.scalar(select(User).where(User.email == data.email.lower())):
        raise HTTPException(409, "An account with this email already exists.")
    user = create_client(db, data.email, data.full_name, data.password, phone=data.phone, company=data.company, country=data.country)
    db.commit()
    set_session(response, user)
    return user


@router.post("/login", response_model=UserOut, dependencies=[Depends(rate_limit("login", 10, 300))])
def login(data: LoginIn, response: Response, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == data.email.lower()))
    if not user or not user.is_active or not verify_password(data.password, user.password_hash):
        raise HTTPException(401, "Incorrect email or password.")
    set_session(response, user)
    return user


@router.post("/logout", status_code=204)
def logout(response: Response):
    response.delete_cookie(COOKIE, path="/")


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@router.post("/forgot-password", status_code=202, dependencies=[Depends(rate_limit("forgot", 5, 3600))])
def forgot(data: ForgotIn, bg: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == data.email.lower()))
    if user:  # same response either way so emails can't be enumerated
        subject, html = mail.password_reset(user.email, create_token(str(user.id), "reset", minutes=30))
        bg.add_task(mail.send_email, user.email, subject, html)
    return {"detail": "If that email has an account, a reset link is on its way."}


@router.post("/reset-password", status_code=204)
def reset(data: ResetIn, db: Session = Depends(get_db)):
    payload = decode_token(data.token, "reset")
    user = db.get(User, int(payload["sub"])) if payload else None
    if not user:
        raise HTTPException(400, "This reset link is invalid or has expired.")
    user.password_hash = hash_password(data.password)
    db.commit()
