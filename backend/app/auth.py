"""Email + password accounts. scrypt password hashing, signed JWT bearer tokens. Every API call is scoped to the token's user."""
import hashlib
import hmac
import os
import re
import time

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .config import JWT_SECRET
from .db import User, get_db

TOKEN_TTL = 60 * 60 * 24 * 7  # 7 days
_bearer = HTTPBearer(auto_error=False)
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def hash_password(pw: str) -> str:
    salt = os.urandom(16)
    h = hashlib.scrypt(pw.encode(), salt=salt, n=2**14, r=8, p=1, dklen=32)
    return f"{salt.hex()}${h.hex()}"


def check_password(pw: str, stored: str) -> bool:
    try:
        salt_hex, h_hex = stored.split("$")
        h = hashlib.scrypt(pw.encode(), salt=bytes.fromhex(salt_hex), n=2**14, r=8, p=1, dklen=32)
        return hmac.compare_digest(h.hex(), h_hex)
    except Exception:  # noqa: BLE001
        return False


def make_token(user_id: int) -> str:
    return jwt.encode({"sub": str(user_id), "exp": int(time.time()) + TOKEN_TTL}, JWT_SECRET, algorithm="HS256")


def current_user(cred: HTTPAuthorizationCredentials | None = Depends(_bearer), db: Session = Depends(get_db)) -> User:
    if not cred:
        raise HTTPException(401, "Please sign in.")
    try:
        uid = int(jwt.decode(cred.credentials, JWT_SECRET, algorithms=["HS256"])["sub"])
    except Exception:  # noqa: BLE001 - expired / tampered / malformed
        raise HTTPException(401, "Session expired. Please sign in again.") from None
    user = db.get(User, uid)
    if not user:
        raise HTTPException(401, "Account not found.")
    return user
