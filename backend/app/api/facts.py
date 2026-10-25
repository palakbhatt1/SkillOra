from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app import service
from app.api.deps import current_user, get_user_fact
from app.db import Fact, User, get_db, next_seq

router = APIRouter(prefix="/api/facts", tags=["facts"])


class FactPatch(BaseModel):
    status: str | None = None
    text: str | None = None


class BulkIn(BaseModel):
    project: str | None = None
    status: str = "verified"
    scope: str = "pending"


class DeclareIn(BaseModel):
    skill: str


@router.get("")
def list_facts(db: Session = Depends(get_db), user: User = Depends(current_user)):
    return [service.fact_api(f) for f in service.all_facts(db, user.id, include_rejected=True)]


@router.patch("/{fid}")
def patch_fact(fid: str, b: FactPatch, db: Session = Depends(get_db), user: User = Depends(current_user)):
    f = get_user_fact(db, fid, user)
    f.auto = 0
    if b.status:
        if b.status not in {"pending", "verified", "rejected", "stale"}:
            raise HTTPException(422, "bad status")
        f.status = b.status
    if b.text is not None:
        f.text = b.text.strip()
        f.status = "verified"
    db.commit()
    return service.fact_api(f)


@router.post("/bulk")
def bulk(b: BulkIn, db: Session = Depends(get_db), user: User = Depends(current_user)):
    """Confirm every PENDING fact in one group - one click instead of 40."""
    if b.status not in {"verified", "rejected"}:
        raise HTTPException(422, "bad status")
    q = db.query(Fact).filter(Fact.user_id == user.id)
    q = q.filter(Fact.status == "pending") if b.scope == "pending" else q.filter(Fact.status.in_(["pending", "verified", "stale"]), Fact.declared == 0)
    if b.project:
        q = q.filter(Fact.project == b.project)
    n = q.update({Fact.status: b.status, Fact.auto: 0}, synchronize_session=False)
    db.commit()
    return {"updated": n}


@router.post("/declare")
def declare(b: DeclareIn, db: Session = Depends(get_db), user: User = Depends(current_user)):
    """Self-declared skill: counts in the score at lower weight, never used to write a project bullet."""
    f = Fact(
        user_id=user.id,
        seq=next_seq(db, user.id),
        source_id=None,
        text=b.skill.strip(),
        span="",
        project="Skills",
        category="skill",
        status="verified",
        declared=1,
    )
    db.add(f)
    db.commit()
    return service.fact_api(f)
