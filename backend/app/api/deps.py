from fastapi import Cookie, Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.security import decode_token
from app.db.session import get_db
from app.models.models import Order, User

COOKIE = "hs_session"


def _token_from(request: Request) -> str | None:
    auth = request.headers.get("authorization", "")
    if auth.lower().startswith("bearer "):
        return auth[7:]
    return request.cookies.get(COOKIE)


def get_optional_user(request: Request, db: Session = Depends(get_db)) -> User | None:
    tok = _token_from(request)
    data = decode_token(tok) if tok else None
    if not data:
        return None
    user = db.get(User, int(data["sub"]))
    return user if user and user.is_active else None


def get_current_user(user: User | None = Depends(get_optional_user)) -> User:
    if not user:
        raise HTTPException(401, "Please sign in to continue.")
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(403, "You do not have access to this area.")
    return user


def order_for_user(order_id: int, db: Session, user: User) -> Order:
    order = db.get(Order, order_id)
    if not order or (user.role != "admin" and order.user_id != user.id):
        raise HTTPException(404, "Order not found.")  # 404 so ids can't be probed
    return order


def order_for_user_or_token(order_id: int, db: Session, user: User | None, upload_token: str | None) -> tuple[Order, str]:
    """Returns (order, role). Allows guests who just placed the order via a scoped upload token."""
    if user:
        return order_for_user(order_id, db, user), ("admin" if user.role == "admin" else "client")
    data = decode_token(upload_token, purpose="order-upload") if upload_token else None
    if not data or int(data["sub"]) != order_id:
        raise HTTPException(401, "Please sign in to continue.")
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(404, "Order not found.")
    return order, "client"
