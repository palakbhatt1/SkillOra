from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Project, Fact, Source
from app.services.ingest import IngestService

router = APIRouter()

class FactModel(BaseModel):
    id: int
    project_id: int
    fact_type: str
    claim: str
    source_span: str
    source_file: str
    status: str

    class Config:
        from_attributes = True

class ProjectCardUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    tech_stack: Optional[str] = None
    role: Optional[str] = None

class ProjectCreate(BaseModel):
    id: Optional[int] = None
    title: str
    summary: Optional[str] = None
    tech_stack: Optional[str] = None
    role: Optional[str] = None

class ProjectResponse(BaseModel):
    id: int
    title: str
    summary: Optional[str] = None
    role: Optional[str] = None
    tech_stack: Optional[str] = None
    facts: List[FactModel] = []

    class Config:
        from_attributes = True

@router.get("", response_model=List[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    """List all projects."""
    return db.query(Project).all()

@router.post("", response_model=ProjectResponse)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    """Create a new project."""
    new_proj = Project(
        id=payload.id,
        title=payload.title,
        summary=payload.summary,
        role=payload.role,
        tech_stack=payload.tech_stack
    )
    db.add(new_proj)
    db.commit()
    db.refresh(new_proj)
    return new_proj

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    """Returns real project data and facts directly from the database."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        # Create an initial container project for this ID if requested
        project = Project(
            id=project_id,
            title="My Career Project",
            summary="Awaiting source ingestion to pre-fill project details.",
            tech_stack="Pending extraction"
        )
        db.add(project)
        db.commit()
        db.refresh(project)

    # Auto-resolve title if it's currently a placeholder like "SkillOra ATS"
    if project.title in ("SkillOra ATS", "SkillOra Demo", "My Career Project", "Project Workspace"):
        resolved_title = None

        # 1. Check if summary contains a top-level markdown heading from README
        if project.summary:
            import re
            for line in project.summary.splitlines():
                m = re.match(r"^#{1,2}\s+(.+)$", line.strip())
                if m:
                    candidate = m.group(1).strip()
                    candidate = re.sub(r"\[!\[.*?\]\(.*?\)\]\(.*?\)", "", candidate)
                    candidate = re.sub(r"!\[.*?\]\(.*?\)", "", candidate)
                    candidate = re.sub(r"\[(.*?)\]\(.*?\)", r"\1", candidate)
                    candidate = candidate.strip(" *#-_:`")
                    if len(candidate) > 2 and candidate.lower() not in ("readme", "table of contents", "overview"):
                        resolved_title = candidate
                        break

        # 2. Check for GitHub source
        if not resolved_title:
            gh_source = db.query(Source).filter(Source.project_id == project_id, Source.type == "github").first()
            if gh_source and gh_source.url_or_name:
                from app.parsers.github import GitHubParser
                _, r_name = GitHubParser.parse_repo_url(gh_source.url_or_name)
                if r_name:
                    resolved_title = r_name

        # 3. Check for document or notes source
        if not resolved_title:
            doc_source = db.query(Source).filter(Source.project_id == project_id).first()
            if doc_source and doc_source.url_or_name and doc_source.url_or_name != "production_notes.txt":
                resolved_title = doc_source.url_or_name.split(".")[0].replace("_", " ").replace("-", " ").title()

        if resolved_title:
            project.title = resolved_title
            # Also clean markdown heading from summary if it was raw
            if project.summary and project.summary.startswith("#"):
                import re
                project.summary = re.sub(r"^#{1,3}\s+[^\n]+\n*", "", project.summary).strip()
            db.commit()
            db.refresh(project)

    return project

@router.put("/{project_id}/card", response_model=ProjectResponse)
def update_project_card(project_id: int, update: ProjectCardUpdate, db: Session = Depends(get_db)):
    """Update project card information."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if update.title is not None:
        project.title = update.title
    if update.summary is not None:
        project.summary = update.summary
    if update.tech_stack is not None:
        project.tech_stack = update.tech_stack
    if update.role is not None:
        project.role = update.role

    db.commit()
    db.refresh(project)
    return project

@router.get("/{project_id}/facts", response_model=List[FactModel])
def get_project_facts(
    project_id: int, 
    status: Optional[str] = Query(None, description="Filter by status: pending, verified, stale, rejected"),
    db: Session = Depends(get_db)
):
    """Returns verified and extracted facts for a project, with optional status filter."""
    query = db.query(Fact).filter(Fact.project_id == project_id)
    if status:
        query = query.filter(Fact.status == status)
    return query.all()

@router.post("/{project_id}/ingest")
def trigger_ingest(project_id: int, db: Session = Depends(get_db)):
    """
    Triggers real ingestion on the project's sources:
    - Parses GitHub, PDFs, DOCX, PPTX, or notes
    - Deterministically extracts dependency facts
    - Runs Source Extractor for metrics and claims
    - Pre-fills the Project Card
    """
    result = IngestService.ingest_project(db, project_id)
    return result
