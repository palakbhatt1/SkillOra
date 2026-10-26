import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app import export, orchestrator, service
from app.api.deps import current_user, get_user_fact, get_user_job
from app.config import USE_LLM
from app.db import Job, User, get_db
from app.engine.matching import fact_view

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


class JobIn(BaseModel):
    jd: str


class BulletIn(BaseModel):
    text: str


class SummaryIn(BaseModel):
    text: str


class ProfileChoice(BaseModel):
    profile: str


class AcceptIn(BaseModel):
    accept: bool


class ChatIn(BaseModel):
    message: str


@router.post("")
def create_job(b: JobIn, db: Session = Depends(get_db), user: User = Depends(current_user)):
    if len(b.jd.strip()) < 40:
        raise HTTPException(422, "Paste a fuller job description.")
    job = service.build_job(db, user.id, b.jd)
    return service.job_view(db, job)


@router.get("/latest")
def latest_job(db: Session = Depends(get_db), user: User = Depends(current_user)):
    j = db.query(Job).filter(Job.user_id == user.id).order_by(Job.id.desc()).first()
    return service.job_view(db, j) if j else None


@router.get("/{job_id}")
def get_job(job_id: int, db: Session = Depends(get_db), user: User = Depends(current_user)):
    return service.job_view(db, get_user_job(db, job_id, user))


@router.post("/{job_id}/projects/{pid}/toggle")
def toggle_project(job_id: int, pid: str, db: Session = Depends(get_db), user: User = Depends(current_user)):
    job = get_user_job(db, job_id, user)
    d = dict(job.data)
    for p in d["projects"]:
        if p["id"] == pid:
            p["picked"] = not p["picked"]
            p["manual"] = True
    job.data = d
    service.refresh_job(db, job, rewrite=True, use_llm=USE_LLM)
    return service.job_view(db, job)


@router.post("/{job_id}/resume")
def regenerate(job_id: int, db: Session = Depends(get_db), user: User = Depends(current_user)):
    job = get_user_job(db, job_id, user)
    service.refresh_job(db, job, rewrite=True, use_llm=USE_LLM)
    return service.job_view(db, job)


class AddBulletIn(BaseModel):
    project: str = "SkillOra"
    text: str
    facts: list[str] = []
    verified: bool = True


@router.post("/{job_id}/bullets")
def add_bullet(job_id: int, b: AddBulletIn, db: Session = Depends(get_db), user: User = Depends(current_user)):
    job = get_user_job(db, job_id, user)
    d = dict(job.data)
    d["history"] = (list(d.get("history", [])) + [json.loads(json.dumps(d["resume"]))])[-10:]
    r = dict(d["resume"])
    bullets = list(r.get("bullets", []))
    new_id = f"U{len(bullets) + 1}"
    bullets.append({
        "id": new_id,
        "project": b.project,
        "kind": "project",
        "text": b.text.strip(),
        "facts": b.facts,
        "verified": b.verified,
        "user": True
    })
    r["bullets"] = bullets
    d["resume"] = r
    job.data = d
    db.commit()
    return service.job_view(db, job)


@router.patch("/{job_id}/bullets/{bid}")
def edit_bullet(job_id: int, bid: str, b: BulletIn, db: Session = Depends(get_db), user: User = Depends(current_user)):
    job = get_user_job(db, job_id, user)
    d = dict(job.data)
    d["history"] = (list(d.get("history", [])) + [json.loads(json.dumps(d["resume"]))])[-10:]
    for x in d["resume"]["bullets"]:
        if x["id"] == bid:
            x["text"], x["user"] = b.text.strip(), True
    job.data = d
    db.commit()
    return service.job_view(db, job)


@router.patch("/{job_id}/summary")
def edit_summary(job_id: int, b: SummaryIn, db: Session = Depends(get_db), user: User = Depends(current_user)):
    job = get_user_job(db, job_id, user)
    d = dict(job.data)
    d["history"] = (list(d.get("history", [])) + [json.loads(json.dumps(d["resume"]))])[-10:]
    d["resume"] = {**d["resume"], "summary": b.text.strip(), "summary_user": True}
    job.data = d
    db.commit()
    return service.job_view(db, job)


@router.put("/{job_id}/profile")
def set_score_profile(job_id: int, b: ProfileChoice, db: Session = Depends(get_db), user: User = Depends(current_user)):
    from app.engine.scoring import PROFILES

    if b.profile not in PROFILES:
        raise HTTPException(422, "Unknown profile")
    job = get_user_job(db, job_id, user)
    d = dict(job.data)
    d["profile"] = b.profile
    job.data = d
    db.commit()
    return service.job_view(db, job)


@router.post("/{job_id}/undo")
def undo(job_id: int, db: Session = Depends(get_db), user: User = Depends(current_user)):
    job = get_user_job(db, job_id, user)
    d = dict(job.data)
    hist = list(d.get("history", []))
    if not hist:
        raise HTTPException(409, "Nothing to undo.")
    d["resume"], d["history"] = hist.pop(), hist
    job.data = d
    db.commit()
    return service.job_view(db, job)


@router.post("/{job_id}/keywords/{kid}")
def decide_keyword(job_id: int, kid: str, b: AcceptIn, db: Session = Depends(get_db), user: User = Depends(current_user)):
    job = get_user_job(db, job_id, user)
    d = dict(job.data)
    for k in d["keywords"]:
        if k["id"] == kid and k["state"] == "suggested":
            k["state"] = "accepted" if b.accept else "rejected"
            if b.accept and k.get("rewrite"):
                f = get_user_fact(db, k["fact"], user)
                r = dict(d["resume"])
                r["bullets"] = r["bullets"] + [{"id": f"K{kid}", "project": f.project, "text": k["rewrite"], "facts": [k["fact"]], "verified": True}]
                d["resume"] = r
    job.data = d
    db.commit()
    return service.job_view(db, job)


@router.post("/{job_id}/chat")
def chat(job_id: int, b: ChatIn, db: Session = Depends(get_db), user: User = Depends(current_user)):
    job = get_user_job(db, job_id, user)
    reply, mode = orchestrator.chat(job_id, b.message, user.id)
    db.refresh(job)
    d = dict(job.data)
    d["chat"] = d.get("chat", []) + [{"from": "user", "text": b.message}, {"from": "agent", "text": reply}]
    job.data = d
    db.commit()
    return {"reply": reply, "mode": mode, "job": service.job_view(db, job)}


@router.get("/{job_id}/export/preflight")
def preflight(job_id: int, db: Session = Depends(get_db), user: User = Depends(current_user)):
    v = service.job_view(db, get_user_job(db, job_id, user))
    bl = v["resume"]["bullets"]
    bad = [b for b in bl if not b["verified"] and not b.get("user")]
    mine = [b for b in bl if b.get("user")]
    facts = service.all_facts(db, user.id)
    checks = [
        {"ok": bool(bl), "text": f"{len(bl)} bullets, each citing a fact ID"},
        {"ok": not bad, "text": "Verifier passed every bullet" if not bad else f"{len(bad)} bullet(s) blocked by the Verifier (excluded from export)"},
        {"ok": all(f.status == "verified" for f in facts if any(f.fid in b["facts"] for b in bl)), "text": "All cited facts are verified"},
        {"ok": True, "text": f"Score locked at {v['score']['total']}/100"},
        *([{"ok": True, "text": f"{len(mine)} bullet(s) in your own wording are included (not source-checked)"}] if mine else []),
    ]
    return {"checks": checks, "bullets": len(bl), "blocked": len(bad), "score": v["score"]["total"]}


@router.get("/{job_id}/export")
def export_resume(job_id: int, format: str = "pdf", db: Session = Depends(get_db), user: User = Depends(current_user)):
    v = service.job_view(db, get_user_job(db, job_id, user))
    facts = [fact_view(f) for f in service.all_facts(db, user.id)]
    prof = service.profile(user)
    if not [b for b in v["resume"]["bullets"] if b["verified"] or b.get("user")]:
        raise HTTPException(409, "Nothing verified to export yet.")
    if format == "docx":
        return Response(
            export.to_docx(prof, v, facts),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": 'attachment; filename="SkillOra-Resume.docx"'},
        )
    return Response(
        export.to_pdf(prof, v, facts),
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="SkillOra-Resume.pdf"'},
    )
