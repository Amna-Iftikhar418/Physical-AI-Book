import base64
import hashlib
from datetime import datetime, timedelta, timezone

import bcrypt as _bcrypt
from jose import JWTError, jwt

from config import JWT_SECRET_KEY

_ALGORITHM = "HS256"
_TOKEN_EXPIRE_HOURS = 24


def _prehash(password: str) -> bytes:
    # SHA-256 + base64 → 44 ASCII bytes, safely within bcrypt's 72-byte limit.
    # passlib 1.7.4 + bcrypt 4.x is broken (detect_wrap_bug crashes on init),
    # so we use bcrypt directly and bypass passlib entirely.
    return base64.b64encode(hashlib.sha256(password.encode("utf-8")).digest())


def hash_password(password: str) -> str:
    return _bcrypt.hashpw(_prehash(password), _bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return _bcrypt.checkpw(_prehash(plain), hashed.encode("utf-8"))


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
