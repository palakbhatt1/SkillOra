import os
from pathlib import Path

from dotenv import load_dotenv

BASE = Path(__file__).resolve().parent.parent
load_dotenv(BASE / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite")
GEMINI_MODELS = [GEMINI_MODEL] + [m.strip() for m in os.getenv("GEMINI_FALLBACKS", "").split(",") if m.strip()]
LLM_TIMEOUT = int(os.getenv("LLM_TIMEOUT", "45"))
USE_LLM = os.getenv("USE_LLM", "1") == "1" and bool(GEMINI_API_KEY)
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
DB_URL = os.getenv("DB_URL", f"sqlite:///{BASE / 'skillora.db'}")  # Postgres (docker compose) in .env; SQLite only as a no-Docker fallback
JWT_SECRET = os.getenv("JWT_SECRET", "dev-only-change-me-" + "x" * 24)
MAX_UPLOAD_MB = 15
MAX_FACTS_PER_SOURCE = 40  # documents / resumes
MAX_FACTS_GITHUB = 15  # repos stay small on purpose (cost)
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")

# LiteLLM / CrewAI / ADK all read GOOGLE_API_KEY or GEMINI_API_KEY from the environment.
if GEMINI_API_KEY:
    os.environ.setdefault("GEMINI_API_KEY", GEMINI_API_KEY)
    os.environ.setdefault("GOOGLE_API_KEY", GEMINI_API_KEY)

# keep framework telemetry/tracing off (offline-friendly, faster start)
os.environ.setdefault("CREWAI_DISABLE_TELEMETRY", "true")
os.environ.setdefault("CREWAI_DISABLE_TRACKING", "true")
os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")
os.environ.setdefault("OTEL_SDK_DISABLED", "true")
os.environ.setdefault("ANONYMIZED_TELEMETRY", "false")
