from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from app.api.auth import router as auth_router
from app.api.facts import router as facts_router
from app.api.jobs import router as jobs_router
from app.api.sources import router as sources_router
from app.api.system import router as system_router
from app.config import CORS_ORIGINS
from app.db import init_db
from app.parsers import InputRejected

app = FastAPI(
    title="SkillOra API",
    version="1.0",
    description="SkillOra: AI-Powered Resume Intelligence & Job Readiness Platform",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup() -> None:
    init_db()


@app.exception_handler(InputRejected)
def _rejected(_, e: InputRejected):
    return Response(
        content=f'{{"detail":"{str(e)}"}}',
        status_code=422,
        media_type="application/json",
    )


# Mount modular routers
app.include_router(auth_router)
app.include_router(system_router)
app.include_router(sources_router)
app.include_router(facts_router)
app.include_router(jobs_router)


@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "SkillOra API",
        "version": "1.0",
        "docs": "/docs",
    }
