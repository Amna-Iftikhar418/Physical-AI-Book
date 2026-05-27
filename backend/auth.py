import base64
import hashlib
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from config import JWT_SECRET_KEY

_ALGORITHM = "HS256"
_TOKEN_EXPIRE_HOURS = 24

# bcrypt 4.x raises ValueError for passwords > 72 bytes; SHA-256 prehash keeps
# all inputs to exactly 44 ASCII bytes and is safe for any password length.
_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__truncate_error=False)


def _prehash(password: str) -> str:
    return base64.b64encode(hashlib.sha256(password.encode("utf-8")).digest()).decode("ascii")


def hash_password(password: str) -> str:
    return _pwd_context.hash(_prehash(password))


def verify_password(plain: str, hashed: str) -> bool:
    return _pwd_context.verify(_prehash(plain), hashed)


def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=_TOKEN_EXPIRE_HOURS)
    return jwt.encode({"sub": user_id, "exp": expire}, JWT_SECRET_KEY, algorithm=_ALGORITHM)


def verify_token(token: str) -> str:
    """Return user_id str or raise ValueError on invalid/expired token."""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[_ALGORITHM])
        sub = payload.get("sub")
        if not sub:
            raise ValueError("Token missing subject")
        return str(sub)
    except JWTError as exc:
        raise ValueError("Invalid or expired token") from exc
