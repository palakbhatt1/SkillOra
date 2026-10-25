from importlib.metadata import version
import re
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app import activity, service
from app.api.deps import current_user
from app.config import GEMINI_MODELS, USE_LLM
from app.db import RunLog, Source, User, get_db

router = APIRouter(prefix="/api", tags=["system"])

YEARS_RE = re.compile(r"((?:19|20)\d{2})\s*[-\u2013\u2014]\s*((?:19|20)\d{2}|present|current)|((?:19|20)\d{2})", re.I)
DEGREE_LINE_RE = re.compile(r"\b(b\.?\s?tech|bachelor|m\.?\s?tech|master|b\.?e\b|b\.?sc|m\.?sc|mba|ph\.?d|diploma)", re.I)


class ProfileIn(BaseModel):
    name: str = "Your Name"
    email: str = ""
    links: str = ""
    location: str = ""
    education: str = ""
    experience_years: float | None = None
    auto_confirm: bool = True


@router.get("/health")
def health():
    return {
        "ok": True,
        "llm": USE_LLM,
        "models": GEMINI_MODELS if USE_LLM else [],
        "crewai": version("crewai") if "crewai" in version.__module__ or True else "installed",
        "google_adk": "installed",
    }


@router.get("/profile")
def get_profile(user: User = Depends(current_user)):
    return service.profile(user)


@router.put("/profile")
def put_profile(p: ProfileIn, db: Session = Depends(get_db), user: User = Depends(current_user)):
    user.name, user.links, user.location = p.name.strip(), p.links.strip(), p.location.strip()
    user.auto_confirm = int(p.auto_confirm)
    user.education = p.education.strip()[:400]
    user.experience_years = max(0.0, min(50.0, p.experience_years)) if p.experience_years is not None else None
    db.add(user)
    db.commit()
    return service.profile(user)


@router.get("/activity")
def live_activity(user: User = Depends(current_user)):
    """What is running right now for this user, and what just finished (agent, technology, duration)."""
    snap = activity.snapshot(user.id)
    try:
        c_ver = version("crewai")
    except Exception:
        c_ver = "installed"
    try:
        a_ver = version("google-adk")
    except Exception:
        a_ver = "installed"
    snap.update({"llm": USE_LLM, "model": GEMINI_MODELS[0] if USE_LLM else "", "crewai": c_ver, "adk": a_ver})
    return snap


@router.get("/logs")
def logs(db: Session = Depends(get_db), user: User = Depends(current_user)):
    rows = db.query(RunLog).filter(RunLog.user_id == user.id).order_by(RunLog.id.desc()).limit(40).all()
    return [{"agent": r.agent, "ms": r.ms, "note": r.note, "at": r.created.isoformat()} for r in rows]


@router.get("/education-hint")
def education_hint(db: Session = Depends(get_db), user: User = Depends(current_user)):
    """Pre-fill the education form from uploaded resumes."""
    for s in db.query(Source).filter(Source.user_id == user.id, Source.type.in_(["pdf", "docx", "pptx", "note"])).all():
        lines = [l.strip(" \t\u2022-*") for l in s.text.splitlines()]
        for i, line in enumerate(lines):
            if not line or len(line) > 140 or not DEGREE_LINE_RE.search(line):
                continue
            for cand in [lines[i - 1] if i else "", lines[i + 1] if i + 1 < len(lines) else "", line]:
                m = YEARS_RE.search(cand)
                if m and len(cand) < 140:
                    years = re.sub(r"\s*[-\u2013\u2014]\s*", " \u2013 ", m.group(0))
                    college = re.sub(r"\s{2,}", " ", cand.replace(m.group(0), "")).strip(" ,|\u00b7-\u2013\u2014")
                    degree = line if cand is not line else re.sub(r"\s{2,}", " ", line.replace(m.group(0), "")).strip(" ,|\u00b7-\u2013\u2014")
                    if cand is line:
                        college = ""
                    return {"degree": degree, "college": college, "years": years}
            return {"degree": line, "college": "", "years": ""}
    return None


@router.get("/eval")
def run_eval():
    from eval.run_eval import run_all

    return run_all()
