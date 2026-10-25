from datetime import datetime

from sqlalchemy import JSON, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, sessionmaker

from .config import DB_URL


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "app_user"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(300))
    name: Mapped[str] = mapped_column(String(200), default="")
    links: Mapped[str] = mapped_column(String(300), default="")
    location: Mapped[str] = mapped_column(String(200), default="")
    experience_years: Mapped[float | None] = mapped_column(Float, nullable=True)  # optional; the experience part is only scored if known
    education: Mapped[str] = mapped_column(String(400), default="")  # "B.Tech CSE (AI), BML Munjal University, 2023-2027"
    auto_confirm: Mapped[int] = mapped_column(Integer, default=1)  # 1 = facts from my own files are confirmed on arrival (review by exception)
    created: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Source(Base):
    __tablename__ = "source"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("app_user.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(300))
    type: Mapped[str] = mapped_column(String(20))  # github | pdf | docx | pptx | note
    uri: Mapped[str] = mapped_column(String(500), default="")
    detail: Mapped[str] = mapped_column(String(300), default="")
    text: Mapped[str] = mapped_column(Text, default="")
    content_hash: Mapped[str] = mapped_column(String(64), default="")
    state: Mapped[str] = mapped_column(String(20), default="synced")  # synced | stale | processing
    updated: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    facts: Mapped[list["Fact"]] = relationship(back_populates="source", cascade="all, delete-orphan")


class Fact(Base):
    __tablename__ = "fact"
    __table_args__ = (UniqueConstraint("user_id", "seq", name="uq_fact_user_seq"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("app_user.id", ondelete="CASCADE"), index=True)
    seq: Mapped[int] = mapped_column(Integer)  # per-user counter -> the F101, F102... shown in the UI
    source_id: Mapped[int | None] = mapped_column(ForeignKey("source.id", ondelete="CASCADE"), nullable=True)
    text: Mapped[str] = mapped_column(Text)
    span: Mapped[str] = mapped_column(Text, default="")
    project: Mapped[str] = mapped_column(String(200), default="General")
    category: Mapped[str] = mapped_column(String(20), default="skill")  # skill|metric|experience|education
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending|verified|rejected|stale
    declared: Mapped[int] = mapped_column(Integer, default=0)  # 1 = self-declared skill, no source proof
    auto: Mapped[int] = mapped_column(Integer, default=0)  # 1 = confirmed automatically on ingest, still open to review
    kind: Mapped[str] = mapped_column(String(12), default="project")  # project | role | education | other
    created: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    source: Mapped["Source | None"] = relationship(back_populates="facts")

    @property
    def fid(self) -> str:
        return f"F{100 + self.seq}"


class Job(Base):
    __tablename__ = "job"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("app_user.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(200), default="")
    company: Mapped[str] = mapped_column(String(200), default="")
    jd_text: Mapped[str] = mapped_column(Text)
    data: Mapped[dict] = mapped_column(JSON, default=dict)  # analysis, matches, projects, resume, keywords
    created: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class RunLog(Base):
    """Cost/latency log per agent step (shown in the project workflow diagram)."""
    __tablename__ = "run_log"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("app_user.id", ondelete="CASCADE"), index=True, nullable=True)
    agent: Mapped[str] = mapped_column(String(80))
    ms: Mapped[int] = mapped_column(Integer, default=0)
    note: Mapped[str] = mapped_column(String(300), default="")
    created: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class LLMCache(Base):
    """Agent outputs keyed by a hash of their input: identical re-runs (demo rehearsals, re-analysing a JD) return instantly."""
    __tablename__ = "llm_cache"
    key: Mapped[str] = mapped_column(String(64), primary_key=True)
    value: Mapped[dict] = mapped_column(JSON)
    created: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


from .config import BASE, DB_URL


def _make_engine():
    import logging
    log = logging.getLogger("skillora")
    url = DB_URL
    if not url.startswith("sqlite"):
        try:
            import psycopg  # noqa: F401
            return create_engine(url, pool_pre_ping=True, pool_size=10, max_overflow=20)
        except Exception as e:
            log.warning("PostgreSQL driver (psycopg) not available: %s. Falling back to local SQLite.", e)
            url = f"sqlite:///{BASE / 'skillora.db'}"
    return create_engine(url, connect_args={"check_same_thread": False}, pool_pre_ping=True)


engine = _make_engine()
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


def init_db() -> None:
    Base.metadata.create_all(engine)
    from sqlalchemy import text

    for stmt in (  # tiny forward-only migrations for databases created before these columns existed
        "ALTER TABLE fact ADD COLUMN kind VARCHAR(12) DEFAULT 'project'",
        "ALTER TABLE fact ADD COLUMN auto INTEGER DEFAULT 0",
        "ALTER TABLE app_user ADD COLUMN auto_confirm INTEGER DEFAULT 1",
        "ALTER TABLE app_user ADD COLUMN education VARCHAR(400) DEFAULT ''",
        "ALTER TABLE app_user ADD COLUMN experience_years FLOAT",
    ):
        try:
            with engine.begin() as cx:
                cx.execute(text(stmt))
        except Exception:  # noqa: BLE001 - column already exists
            pass


def next_seq(db, user_id: int) -> int:
    from sqlalchemy import func

    return (db.query(func.max(Fact.seq)).filter(Fact.user_id == user_id).scalar() or 0) + 1


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
