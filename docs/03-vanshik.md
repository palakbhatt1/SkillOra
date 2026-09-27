# Vanshik — Job Description Analysis, Matching & Job Workspace

**Branch:** `feature/jd-analyzer-and-jobs`

## Ownership

Own the job-side pipeline: transform raw job descriptions into structured requirements, match each requirement against the candidate's verified fact ledger, build the shared LLM telemetry utility, and create the job analysis user interface.

## Frameworks

- CrewAI for the JD Analyzer and Matcher agents
- Python, RapidFuzz, and the agreed embedding/retrieval model
- Next.js, React, TypeScript, and Tailwind CSS for the Job workspace
- FastAPI for job endpoints

## Files

```text
backend/app/agents/crew/jd_flow.py
backend/app/agents/crew/match_flow.py
backend/app/services/retrieval.py
backend/app/core/llm_logging.py
backend/app/api/jobs.py
frontend/src/app/jobs/new/
frontend/src/app/jobs/[id]/
evals/matching/
```

## Implementation Tasks

1. **JD Analyzer Agent.** Convert raw job-description text into structured requirements with:
   - requirement text and normalized term
   - `must_have` versus `nice_to_have`
   - category: `skill`, `experience`, `education`, or `other`
   - keywords and relevant responsibilities
   - numeric experience range (`Expmin` / `Expmax`) when supported by the JD
2. **Deterministic repeat processing.** Use temperature 0 and cache parsed results by `text_hash` so identical job descriptions produce consistent structured requirements.
3. **Prompt-injection guardrail.** Treat JD content as untrusted data. Apply the shared `core/guardrail.py` check before an LLM call, delimit the JD text in the prompt, and explicitly instruct the model to extract data rather than follow instructions contained in the JD.
4. **Matcher Agent.** Match each requirement against the verified fact ledger in this order:
   - exact normalized match
   - fuzzy match using RapidFuzz token-set ratio > 85
   - embedding similarity as a last resort
5. **Match labels and evidence.** Return `met`, `partial`, or `missing` for each requirement, with matched fact IDs and explanation. Education requirements must match education facts specifically. Broad concepts such as “Machine Learning” must not fully satisfy a specific requirement such as “FastAPI”; cap broad-to-specific embedding matches at partial credit.
6. **Shared LLM logging utility.** Implement `core/llm_logging.py` as the common wrapper for token usage, estimated cost, latency, and cache hits across all agent workflows.
7. **Job Workspace UI (`/jobs/new`, `/jobs/[id]`).** Build the frontend interface to paste JD text, view requirement tags (must-have vs. nice-to-have), requirement category breakdown, and match overview with recommended projects.
8. **API.** Implement `POST /jobs` for job-analysis task creation and `GET /jobs/{id}` for structured requirements, requirement matches, and relevant project evidence.
9. **Evaluation dataset.** Create 15–20 resume/JD test pairs with manually labelled requirement matches. Report precision/recall or another clearly defined match-quality metric.

## Definition of Done

Pasting a JD in the UI returns structured requirements and evidence-backed matches against a real candidate profile. Reprocessing the same JD returns the same cached requirements, and a prompt-injection test does not alter extraction or match status.

## Coordination Contracts

- Provide Harman with normalized requirements, categories, `must_have` flags, match labels, evidence references, and `Expmin` / `Expmax`.
- Provide Palak with relevant projects/experience, requirement matches, and missing keyword gaps for resume tailoring.
- Export `core/llm_logging.py` for Palak and Manya to import in their agent pipelines.
