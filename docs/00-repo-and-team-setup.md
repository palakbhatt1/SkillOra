# Skillora: repo, branches and ownership

One repo, one `main` branch, four people, four disjoint slices of the codebase. If everyone only edits their own files, merges stay boring.

## Team

| Person | Feature | Backend Framework | Frontend Workspace | Status |
|---|---|---|---|---|
| Palak | Resume Tailoring Engine & Verification Guard | Google ADK | `/resumes/[id]/edit`, Chat Sidebar | In progress |
| Manya | Profile Builder & Fact Extraction | CrewAI | `/projects/[id]/sources`, `/projects/[id]/verify` | Completed |
| Vanshik | Job Description Analyzer & Semantic Matcher | CrewAI & RapidFuzz | `/jobs/new`, `/jobs/[id]` | In progress |
| Harman | Explainable Scoring Engine & Document Export | Plain Python & WeasyPrint | `/resumes/[id]/score` | In progress |

Every member owns a complete vertical slice of the stack (backend service/agent + their dedicated frontend workspace + evaluation tests). With Manya's profile builder and fact verification screens delivered, the remaining scope is evenly balanced across the team.

## Repo setup

- One GitHub repo, `main` branch protected (no direct pushes, PR + review required to merge).
- Add teammates as collaborators. They branch directly off `main`.
- Branch naming: `feature/tailoring-and-editor`, `feature/profile-builder`, `feature/jd-analyzer-and-jobs`, `feature/scoring-and-reports`.
- Everyone rebases onto `main` at least once a week.
- Commit prefix by feature: `[profile-builder] add GitHub parser`.

## The rule that prevents merge conflicts

**Nobody edits a file outside their own ownership map below.** If your work needs a change to a shared file (`db/models.py`, `schemas/`), open a small, separate PR just for that change and request a team review before merging.

`api/resumes.py` is split into two router files instead of one shared file, specifically to avoid two people editing the same file:
- `api/resumes.py` — Palak: tailor, edit, keyword-suggestion routes
- `api/resume_reports.py` — Harman: score, report, export routes

Both mount under `/resumes` in `main.py` (a shared file — small PR if this needs changing).

## File ownership map

### Shared, contract files (frozen after Phase 1, changed only via small dedicated PRs with team review)
```
backend/app/db/models.py
backend/app/schemas/
backend/app/main.py
backend/app/config.py
docker-compose.yml
```

### Palak — Resume Tailoring Engine & Verification Workspace
```
backend/app/agents/adk/coordinator.py
backend/app/agents/adk/writer.py
backend/app/agents/adk/verifier.py
backend/app/services/tailor.py
backend/app/services/verify.py
backend/app/api/resumes.py
backend/app/api/chat.py
frontend/src/app/resumes/[id]/edit/
frontend/src/components/chat/
evals/fabrication/
```

### Manya — Profile Builder & Fact Ledger (Completed)
```
backend/app/agents/crew/ingest_flow.py
backend/app/parsers/
backend/app/services/ingest.py
backend/app/api/projects.py
backend/app/api/sources.py
backend/app/api/facts.py
frontend/src/app/projects/[id]/sources/
frontend/src/app/projects/[id]/verify/
```

### Vanshik — Job Description Analyzer & Semantic Matcher
```
backend/app/agents/crew/jd_flow.py
backend/app/agents/crew/match_flow.py
backend/app/services/retrieval.py
backend/app/core/llm_logging.py
backend/app/api/jobs.py
frontend/src/app/jobs/
evals/matching/
```

### Harman — Explainable Scoring & Document Export
```
backend/app/services/scoring.py
backend/app/config/scoring.yaml
backend/app/services/export.py
backend/app/api/resume_reports.py
frontend/src/app/resumes/[id]/score/
evals/scoring/
```

## When you're blocked on someone else's piece

Build against the typed schema in `backend.md` with mock data before the real endpoint exists — don't wait.

## Weekly sync

Fifteen minutes: has anyone touched a file outside their map, did `db/models.py` or `schemas/` change, is the CrewAI/ADK environment still working for everyone.
