import hashlib
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Project, Source
from app.parsers.pdf import PDFParser
from app.parsers.docx import DocxParser
from app.parsers.pptx import PptxParser
from app.parsers.notes import NotesParser

router = APIRouter()

class SourceCreateRequest(BaseModel):
    type: str  # 'github', 'notes'
    url_or_name: str
    raw_text: Optional[str] = None

class SourceResponse(BaseModel):
    id: int
    project_id: int
    type: str
    url_or_name: str
    content_hash: Optional[str] = None

    class Config:
        from_attributes = True

@router.get("/{project_id}/sources", response_model=List[SourceResponse])
def list_sources(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return db.query(Source).filter(Source.project_id == project_id).all()

@router.post("/{project_id}/sources", response_model=SourceResponse)
def add_source(project_id: int, payload: SourceCreateRequest, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        # Auto-create project if it doesn't exist
        project = Project(id=project_id, title=payload.url_or_name, summary="Auto-created project")
        db.add(project)
        db.commit()

    content = payload.raw_text or payload.url_or_name
    content_hash = hashlib.sha256(content.encode("utf-8")).hexdigest()

    # Check if this source already exists for the project
    existing = db.query(Source).filter(
        Source.project_id == project_id,
        Source.url_or_name == payload.url_or_name
    ).first()

    if existing:
        existing.raw_text = payload.raw_text
        existing.type = payload.type
        db.commit()
        db.refresh(existing)
        return existing

    new_source = Source(
        project_id=project_id,
        type=payload.type,
        url_or_name=payload.url_or_name,
        raw_text=payload.raw_text,
        content_hash=content_hash
    )
    db.add(new_source)
    db.commit()
    db.refresh(new_source)
    return new_source

@router.post("/{project_id}/sources/upload", response_model=SourceResponse)
async def upload_source_file(
    project_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        project = Project(id=project_id, title=file.filename, summary="Project created from upload")
        db.add(project)
        db.commit()

    file_bytes = await file.read()
    filename = file.filename or "upload.bin"
    ext = filename.lower().split(".")[-1]

    extracted_text = ""
    source_type = "notes"

    if ext == "pdf":
        source_type = "pdf"
        chunks = PDFParser.parse(file_bytes, filename)
        extracted_text = "\n\n".join([c["content"] for c in chunks])
    elif ext in ("docx", "doc"):
        source_type = "docx"
        chunks = DocxParser.parse(file_bytes, filename)
        extracted_text = "\n\n".join([c["content"] for c in chunks])
    elif ext in ("pptx", "ppt"):
        source_type = "pptx"
        chunks = PptxParser.parse(file_bytes, filename)
        extracted_text = "\n\n".join([c["content"] for c in chunks])
    else:
        try:
            extracted_text = file_bytes.decode("utf-8", errors="ignore")
        except Exception:
            extracted_text = ""

    content_hash = hashlib.sha256(file_bytes).hexdigest()

    new_source = Source(
        project_id=project_id,
        type=source_type,
        url_or_name=filename,
        raw_text=extracted_text,
        content_hash=content_hash
    )
    db.add(new_source)
    db.commit()
    db.refresh(new_source)
    return new_source
