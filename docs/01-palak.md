# Palak — Resume Intelligence, Tailoring & Editor

**Branch:** `feature/tailoring-and-editor`

## Ownership

Own the core candidate generation and verification pipeline: tailoring resume content without fabricating claims, live verification checks, and the dedicated resume editor and chat interface.

## Frameworks

- Google ADK for the Coordinator, Resume Writer, and Verifier agents
- Next.js, React, TypeScript, and Tailwind CSS for the resume editor and chat UI
- FastAPI integration through the agreed API contracts

## Files

```text
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

## Implementation Tasks

1. **Coordinator Agent.** Manage workflow/session state (`user_id`, `job_id`, `resume_id`, `selected_projects`, `latest_report`) and delegate work to the appropriate sub-agents.
2. **Resume Writer Agent.** Generate resume bullets and a professional summary strictly from verified facts. Attach supporting fact IDs to every generated sentence.
3. **Verifier Agent.** Check sentence-to-fact traceability; validate numbers and technology names with deterministic checks; use an entailment check for remaining wording. Retry unsupported generations at most twice, then flag them for user review.
4. **Keyword Coach.** For each missing or partial requirement from Vanshik's matcher, suggest a rewrite only when existing facts support it. Otherwise show it as a genuine gap. Support accept/reject and re-verification.
5. **Resume & Chat APIs.** Implement tailoring task creation (`POST /jobs/{id}/tailor`), resume retrieval/update (`GET/PUT /resumes/{id}`), keyword suggestion actions, and chat routes (`POST /chat`).
6. **Resume Editor Workspace (`/resumes/[id]/edit`).** Build the interactive resume editor displaying per-bullet verification badges, fact citation popovers, and the Keyword Coach suggestion diff panel.
7. **Chat Assistant Component.** Build the floating / sidebar assistant talking to the ADK coordinator.

## Evaluation

- Create fabrication tests with deliberately incorrect metrics and technology names; measure how often the Verifier catches them versus an unverified baseline.
- Confirm each generated bullet traces to a verified fact ID.
- Confirm accepting a supported keyword suggestion triggers automatic re-verification.

## Definition of Done

A user can tailor a resume against a selected job, inspect per-bullet verification receipts in the editor, accept/reject keyword rewrites, and chat with the coordinator without unsupported claims ever being silently added.

## Coordination Contracts

- Consume Vanshik's structured requirements and matches (`/jobs/{id}`) through documented schemas.
- Harman owns the scoring logic, score dashboard (`/resumes/[id]/score`), and PDF/DOCX export.
- Vanshik owns the job ingestion screen (`/jobs/new`) and the shared `core/llm_logging.py` utility.
- Manya's profile builder and fact ledger screens (`/projects/[id]/sources`, `/projects/[id]/verify`) are completed.
