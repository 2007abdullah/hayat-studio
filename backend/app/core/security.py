from datetime import datetime, timedelta, timezone
import bcrypt
import jwt
from .config import get_settings

ALGO = "HS256"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode()[:72], bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode()[:72], hashed.encode())
    except ValueError:
        return False


def create_token(subject: str, purpose: str = "access", minutes: int | None = None, **extra) -> str:
    s = get_settings()
    exp = datetime.now(timezone.utc) + timedelta(minutes=minutes or s.jwt_expire_minutes)
    return jwt.encode({"sub": subject, "purpose": purpose, "exp": exp, **extra}, s.jwt_secret, algorithm=ALGO)


def decode_token(token: str, purpose: str = "access") -> dict | None:
    try:
        data = jwt.decode(token, get_settings().jwt_secret, algorithms=[ALGO])
    except jwt.PyJWTError:
        return None
    return data if data.get("purpose") == purpose else None
