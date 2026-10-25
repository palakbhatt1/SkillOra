import re
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app import auth
from app.db import Fact, Job, User, get_db


def current_user(user: User = Depends(auth.current_user)) -> User:
    return user


def get_user_job(db: Session, job_id: int, user: User) -> Job:
    j = db.get(Job, job_id)
    if not j or j.user_id != user.id:
        raise HTTPException(404, "Job not found")
    return j


def get_user_fact(db: Session, fid: str, user: User) -> Fact:
    m = re.fullmatch(r"F(\d+)", fid)
    f = db.query(Fact).filter(Fact.user_id == user.id, Fact.seq == int(m.group(1)) - 100).first() if m else None
    if not f:
        raise HTTPException(404, "Fact not found")
    return f
