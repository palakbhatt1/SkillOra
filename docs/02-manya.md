# Manya — Profile Builder & Fact Ledger

**Branch:** `feature/profile-builder`

## Role

Own the candidate-side foundation: turn raw material (GitHub repo, documents, notes) into a verified fact ledger. This is the foundation everyone else's agents read from.

## Frameworks

- CrewAI for the **Source Extractor** agent
- Python parsers for multi-modal ingestion
- Next.js and Tailwind CSS for the Sources & Fact Verification workspaces

## Files

```text
backend/app/agents/crew/ingest_flow.py
backend/app/parsers/ (github.py, code_folder.py, pdf.py, docx.py, pptx.py, notes.py)
backend/app/services/ingest.py
backend/app/api/projects.py
backend/app/api/sources.py
backend/app/api/facts.py
frontend/src/app/projects/[id]/sources/
frontend/src/app/projects/[id]/verify/
```

## Features Implemented

1. **Parsers.** GitHub repo (README, docs, `requirements.txt`/`package.json` — extracting tech facts deterministically without LLM calls), PDF, DOCX, PPTX, and notes handler.
2. **Injection guardrail.** Uploaded documents and notes are verified through `core/guardrail.py` before reaching the LLM.
3. **Source Extractor agent.** Structured extraction yielding atomic claims (tech, component, metric, role, outcome) with verbatim quoted spans.
4. **Project Card Pre-fill.** Pre-fills project title, summary, role, and tech stack from extracted facts.
5. **Caching & Re-sync.** Content hashing to prevent redundant LLM extraction, and marking modified source facts as `stale`.
6. **API endpoints.** `POST /projects/{id}/sources`, `POST /projects/{id}/sources/upload`, `POST /projects/{id}/ingest`, `GET /projects/{id}/facts`, `PATCH /facts/{id}`.
7. **Frontend Workspaces.**
   - Add Sources view (`/projects/[id]/sources`): GitHub ingestion, multi-format file upload, and preset notes.
   - Fact Verification view (`/projects/[id]/verify`): Fact ledger table with source quotes, status filters, and Accept/Reject buttons.
8. **Tests.** Integration tests in `test_ingest.py` passing with real data.

## Definition of Done

A project with a GitHub link, uploaded documents, or typed notes can be ingested, produces a sensible pre-filled card and fact list, and every fact displays its verbatim source quote.
