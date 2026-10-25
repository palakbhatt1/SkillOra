"""Document parsing + input safety checks (Phase 1, steps 1-2: add sources, ingest & chunk)."""
import hashlib
from concurrent.futures import ThreadPoolExecutor
import io
import re

import httpx

from .config import GITHUB_TOKEN, MAX_UPLOAD_MB

ALLOWED = {"pdf", "docx", "pptx", "txt", "md", "zip"}

PII_RE = {
    "aadhaar": re.compile(r"\b\d{4}\s\d{4}\s\d{4}\b"),
    "card": re.compile(r"\b(?:\d[ -]?){13,16}\b"),
}
INJECTION_RE = re.compile(
    r"(ignore (all )?(previous|prior|above) (instructions|prompts)|disregard (the )?(system|above)|"
    r"you are now|reveal (your )?(system )?prompt|<\s*script)",
    re.I,
)


class InputRejected(ValueError):
    pass


def sha(text: str) -> str:
    return hashlib.sha256(text.encode("utf8", "ignore")).hexdigest()


def check_input(text: str, *, kind: str = "source") -> list[str]:
    """Reject prompt-injection; return non-blocking warnings (PII)."""
    if INJECTION_RE.search(text):
        raise InputRejected("Input rejected: it contains instruction-like text aimed at the AI (possible prompt injection).")
    return [f"possible {k} number found" for k, rx in PII_RE.items() if rx.search(text)]


def parse_bytes(name: str, data: bytes) -> tuple[str, str, list[str]]:
    """Return (source_type, text, hyperlink_urls). Hyperlinks matter: resumes often hide the URL behind clickable text."""
    if len(data) > MAX_UPLOAD_MB * 1024 * 1024:
        raise InputRejected(f"File larger than {MAX_UPLOAD_MB} MB.")
    ext = name.rsplit(".", 1)[-1].lower() if "." in name else "txt"
    if ext not in ALLOWED:
        raise InputRejected(f"Unsupported file type .{ext}. Allowed: PDF, DOCX, PPTX, TXT, MD.")
    if ext == "pdf":
        import pdfplumber

        with pdfplumber.open(io.BytesIO(data)) as pdf:
            text = "\n".join((p.extract_text() or "") for p in pdf.pages)
            urls = [h["uri"] for p in pdf.pages for h in (p.hyperlinks or []) if h.get("uri")]
        return "pdf", text, urls
    if ext == "docx":
        import docx

        d = docx.Document(io.BytesIO(data))
        parts = [p.text for p in d.paragraphs]
        for t in d.tables:
            for row in t.rows:
                parts.append(" | ".join(c.text.strip() for c in row.cells))
        urls = [r.target_ref for r in d.part.rels.values() if "hyperlink" in r.reltype and getattr(r, "is_external", False)]
        return "docx", "\n".join(parts), urls
    if ext == "pptx":
        from pptx import Presentation

        prs = Presentation(io.BytesIO(data))
        parts = []
        for i, slide in enumerate(prs.slides, 1):
            parts.append(f"# Slide {i}")
            for sh in slide.shapes:
                if sh.has_text_frame:
                    parts.extend(p.text for p in sh.text_frame.paragraphs)
    if ext == "zip":
        import zipfile
        parts = []
        urls = []
        try:
            with zipfile.ZipFile(io.BytesIO(data)) as z:
                manifest_names = {"requirements.txt", "pyproject.toml", "package.json", "dockerfile", "docker-compose.yml", "cargo.toml", "go.mod"}
                for n in z.namelist():
                    lower_n = n.lower().split("/")[-1]
                    if any(ign in n for ign in ["node_modules/", ".git/", "__pycache__/", "venv/", ".venv/"]):
                        continue
                    if lower_n.startswith("readme") and (lower_n.endswith(".md") or lower_n.endswith(".txt")):
                        try:
                            content = z.read(n).decode("utf8", "ignore")
                            parts.append(f"# {n}\n" + content[:6000])
                        except Exception:
                            pass
                    elif lower_n in manifest_names:
                        try:
                            content = z.read(n).decode("utf8", "ignore")
                            parts.append(f"Manifest {n}:\n" + re.sub(r"\s+", " ", content[:1500]))
                        except Exception:
                            pass
        except Exception as e:
            raise InputRejected(f"Could not parse ZIP file: {e}")
        return "code", "\n\n".join(parts), urls
    return "note", data.decode("utf8", "ignore"), []


def parse_code_folder(folder_path: str) -> tuple[str, str, str]:
    """Parses a local code directory looking for READMEs and manifest files (from original SkillOra code_folder parser)."""
    import os
    if not os.path.exists(folder_path):
        raise InputRejected(f"Folder not found: {folder_path}")
    name = os.path.basename(os.path.normpath(folder_path))
    parts = [f"# {name}"]
    manifest_names = {"requirements.txt", "pyproject.toml", "package.json", "dockerfile", "docker-compose.yml", "cargo.toml", "go.mod"}
    count = 0
    for root, dirs, files in os.walk(folder_path):
        dirs[:] = [d for d in dirs if not d.startswith(".") and d not in ("node_modules", "venv", "__pycache__", ".git")]
        for file in files:
            count += 1
            lower_f = file.lower()
            rel_path = os.path.relpath(os.path.join(root, file), folder_path)
            if lower_f.startswith("readme") and (lower_f.endswith(".md") or lower_f.endswith(".txt")):
                try:
                    with open(os.path.join(root, file), "r", encoding="utf-8", errors="ignore") as f:
                        parts.append(f"# {rel_path}\n" + f.read()[:6000])
                except Exception:
                    pass
            elif lower_f in manifest_names:
                try:
                    with open(os.path.join(root, file), "r", encoding="utf-8", errors="ignore") as f:
                        parts.append(f"Manifest {rel_path}:\n" + re.sub(r"\s+", " ", f.read()[:1500]))
                except Exception:
                    pass
    detail = f"Local code folder · {count} files"
    return name, "\n\n".join(parts), detail


# ---------------------------------------------------------------- GitHub (trimmed)
GH = "https://api.github.com"
MANIFESTS = ["requirements.txt", "pyproject.toml", "package.json", "Dockerfile", "docker-compose.yml", "go.mod", "pom.xml", "Cargo.toml"]


def parse_repo_ref(ref: str) -> tuple[str, str]:
    m = re.search(r"(?:github\.com/)?([\w.-]+)/([\w.-]+?)(?:\.git)?/?$", ref.strip())
    if not m:
        raise InputRejected("Could not read that GitHub repo. Use owner/repo or the full URL.")
    return m.group(1), m.group(2)


def _fetch_github(ref: str) -> tuple[str, str, str]:
    """High-signal slice only: description, languages, README, manifest files. Returns (name, text, detail)."""
    owner, repo = parse_repo_ref(ref)
    headers = {"Accept": "application/vnd.github+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"
    raw = {**headers, "Accept": "application/vnd.github.raw"}
    with httpx.Client(timeout=20, headers=headers, follow_redirects=True) as c:
        r = c.get(f"{GH}/repos/{owner}/{repo}")
        if r.status_code == 404:
            raise InputRejected("Repo not found (is it public?).")
        if r.status_code == 403:
            raise InputRejected("GitHub rate limit hit. Add a GITHUB_TOKEN to backend/.env and retry.")
        r.raise_for_status()
        info = r.json()
        # languages + README + every manifest in parallel (one round-trip of latency instead of ~10)
        with ThreadPoolExecutor(max_workers=10) as ex:
            f_lang = ex.submit(c.get, f"{GH}/repos/{owner}/{repo}/languages")
            f_read = ex.submit(c.get, f"{GH}/repos/{owner}/{repo}/readme", headers=raw)
            f_man = {m: ex.submit(c.get, f"{GH}/repos/{owner}/{repo}/contents/{m}", headers=raw) for m in MANIFESTS}
            langs = f_lang.result().json()
            readme = f_read.result()
            manifests = {m: f.result() for m, f in f_man.items()}
        lines = [f"# {repo}", info.get("description") or ""]
        if langs:
            lines.append("Languages: " + ", ".join(list(langs)[:6]))
        if info.get("topics"):
            lines.append("Topics: " + ", ".join(info["topics"]))
        if readme.status_code == 200:
            lines.append(readme.text[:6000])
        for m, f in manifests.items():
            if f.status_code == 200:
                lines.append(f"{m} dependencies: " + re.sub(r"\s+", " ", f.text[:1200]))
    detail = f"GitHub repo · {info.get('stargazers_count', 0)}★ · {next(iter(langs), 'n/a')}"
    return f"{owner}/{repo}", "\n".join(lines), detail


# ---------------------------------------------------------------- chunking
def chunk(text: str, size: int = 1500) -> list[str]:
    paras = [p.strip() for p in re.split(r"\n\s*\n|\n(?=#)", text) if p.strip()]
    out, cur = [], ""
    for p in paras:
        if len(cur) + len(p) > size and cur:
            out.append(cur)
            cur = ""
        cur += p + "\n"
    if cur:
        out.append(cur)
    return out


# ---------------------------------------------------------------- GitHub links found inside a document
GH_LINK_RE = re.compile(r"github\.com/([A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))(?:/([A-Za-z0-9._-]+))?", re.I)
GH_RESERVED = {"features", "sponsors", "login", "join", "about", "pricing", "topics", "marketplace", "settings", "orgs", "apps", "enterprise", "collections", "explore", "notifications", "pulls", "issues"}


def extract_github_links(text: str, urls: list[str] | None = None) -> dict:
    """{'profiles': ['hsk-2004'], 'repos': ['owner/repo']} from visible text and hidden hyperlinks."""
    profiles, repos = [], []
    for blob in [text] + (urls or []):
        for owner, repo in GH_LINK_RE.findall(blob):
            if owner.lower() in GH_RESERVED:
                continue
            repo = re.sub(r"(\.git)?[.,;:)]*$", "", repo or "")
            if repo and repo.lower() not in {"tree", "blob", "issues", "pulls", "wiki", "actions"}:
                key = f"{owner}/{repo}"
                if key.lower() not in {r.lower() for r in repos}:
                    repos.append(key)
            elif owner.lower() not in {p.lower() for p in profiles}:
                profiles.append(owner)
    # a profile that also has repo links is still worth listing; keep both
    return {"profiles": profiles[:3], "repos": repos[:10]}


def _list_user_repos(username: str, limit: int = 12) -> list[dict]:
    """Public, non-fork repos, most recently pushed first - so the user picks the few that matter."""
    headers = {"Accept": "application/vnd.github+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"
    r = httpx.get(f"{GH}/users/{username}/repos", params={"per_page": 40, "sort": "pushed", "type": "owner"}, headers=headers, timeout=20)
    if r.status_code == 404:
        raise InputRejected(f"GitHub user '{username}' not found.")
    if r.status_code == 403:
        raise InputRejected("GitHub rate limit hit. Add a GITHUB_TOKEN to backend/.env and retry.")
    r.raise_for_status()
    rows = [x for x in r.json() if not x.get("fork")]
    return [{"repo": x["full_name"], "description": x.get("description") or "", "language": x.get("language") or "", "stars": x.get("stargazers_count", 0), "pushed": (x.get("pushed_at") or "")[:10]} for x in rows[:limit]]


def _retry_github(fn, *args):
    """GitHub is occasionally slow from some networks: retry once, then explain instead of crashing."""
    for attempt in (1, 2):
        try:
            return fn(*args)
        except httpx.TransportError:  # timeouts, connection resets, DNS
            if attempt == 2:
                raise InputRejected("Could not reach GitHub (timed out). Check your internet connection and try again.") from None


def fetch_github(ref: str) -> tuple[str, str, str]:
    return _retry_github(_fetch_github, ref)


def list_user_repos(username: str, limit: int = 12) -> list[dict]:
    return _retry_github(_list_user_repos, username, limit)
