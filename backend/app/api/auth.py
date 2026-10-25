from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app import auth, service
from app.api.deps import current_user
from app.db import User, get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])


class SignupIn(BaseModel):
    email: str
    password: str
    name: str = ""


class LoginIn(BaseModel):
    email: str
    password: str


def _auth_payload(u: User) -> dict:
    return {"token": auth.make_token(u.id), "user": service.profile(u)}


@router.post("/signup")
def signup(b: SignupIn, db: Session = Depends(get_db)):
    email = b.email.strip().lower()
    if not auth.EMAIL_RE.match(email):
        raise HTTPException(422, "Enter a valid email address.")
    if len(b.password) < 8:
        raise HTTPException(422, "Password must be at least 8 characters.")
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(409, "An account with this email already exists. Try logging in.")
    u = User(email=email, password_hash=auth.hash_password(b.password), name=b.name.strip() or email.split("@")[0])
    db.add(u)
    db.commit()
    return _auth_payload(u)


@router.post("/login")
def login(b: LoginIn, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.email == b.email.strip().lower()).first()
    if not u or not auth.check_password(b.password, u.password_hash):
        raise HTTPException(401, "Wrong email or password.")
    return _auth_payload(u)


@router.get("/me")
def me(user: User = Depends(current_user)):
    return service.profile(user)
