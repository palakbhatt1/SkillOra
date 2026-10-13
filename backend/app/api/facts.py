from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Fact

router = APIRouter()

class FactUpdate(BaseModel):
    status: Optional[str] = None # 'verified', 'pending', 'rejected', 'stale'
    claim: Optional[str] = None
    source_span: Optional[str] = None
    fact_type: Optional[str] = None

class FactResponse(BaseModel):
    id: int
    project_id: int
    fact_type: str
    claim: str
    source_span: str
    source_file: str
    status: str

    class Config:
        from_attributes = True

@router.get("/{fact_id}", response_model=FactResponse)
def get_fact(fact_id: int, db: Session = Depends(get_db)):
    fact = db.query(Fact).filter(Fact.id == fact_id).first()
    if not fact:
        raise HTTPException(status_code=404, detail="Fact not found")
    return fact

@router.patch("/{fact_id}", response_model=FactResponse)
def update_fact(fact_id: int, update: FactUpdate, db: Session = Depends(get_db)):
    fact = db.query(Fact).filter(Fact.id == fact_id).first()
    if not fact:
        raise HTTPException(status_code=404, detail="Fact not found")

    if update.status is not None:
        fact.status = update.status
    if update.claim is not None:
        fact.claim = update.claim
    if update.source_span is not None:
        fact.source_span = update.source_span
    if update.fact_type is not None:
        fact.fact_type = update.fact_type

    db.commit()
    db.refresh(fact)
    return fact

@router.delete("/{fact_id}")
def delete_fact(fact_id: int, db: Session = Depends(get_db)):
    fact = db.query(Fact).filter(Fact.id == fact_id).first()
    if not fact:
        raise HTTPException(status_code=404, detail="Fact not found")
    db.delete(fact)
    db.commit()
    return {"status": "deleted", "id": fact_id}
