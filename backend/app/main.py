from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import projects, facts, sources
from app.db.database import engine
from app.db.models import Base, Project
from sqlalchemy.orm import Session
from app.db.database import SessionLocal

# Create tables
Base.metadata.create_all(bind=engine)

# Seed an initial project if none exists
db = SessionLocal()
if not db.query(Project).filter(Project.id == 1).first():
    db.add(Project(id=1, title="Project Workspace", summary="Agentic AI application for verifiable career building.", tech_stack="FastAPI, Python, Next.js"))
    db.commit()
db.close()

app = FastAPI(title="SkillOra API", description="Verifiable Career Profile & Fact Ledger Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router, prefix="/projects", tags=["projects"])
app.include_router(sources.router, prefix="/projects", tags=["sources"])
app.include_router(facts.router, prefix="/facts", tags=["facts"])

@app.get("/")
def root():
    return {"status": "ok", "message": "SkillOra API is running"}
