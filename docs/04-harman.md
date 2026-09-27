# Harman — Explainable Scoring, Recommendations & Score Report Workspace

**Branch:** `feature/scoring-and-reports`

## Ownership

Own the deterministic scoring engine, component-level explanations, prioritized improvement recommendations, score report user interface, and ATS-friendly PDF/DOCX export.

## Frameworks

- Plain Python for deterministic scoring logic
- Pydantic for validated inputs/outputs
- Jinja + WeasyPrint for PDF export
- `python-docx` for DOCX export
- Next.js, React, TypeScript, and Tailwind CSS for the Score Report workspace
- Pytest for unit and stability tests

## Files

```text
backend/app/services/scoring.py
backend/app/config/scoring.yaml
backend/app/services/export.py
backend/app/api/resume_reports.py
frontend/src/app/resumes/[id]/score/
evals/scoring/
```

## Implementation Tasks

1. **Five-component scoring framework.** Implement the component weights and formulas specified in `backend.md` section 7. Keep the weights configurable in `scoring.yaml` and document normalization and missing-data behavior.
2. **Requirement/skill alignment.** Consume Vanshik's normalized requirement matches. Use exact matching first, fuzzy matching (RapidFuzz token-set ratio > 85) second, and embedding similarity only as a last resort. Embedding matches between broad and specific concepts must receive partial credit at most.
3. **Experience relevance.** Implement the deterministic experience formula using the candidate's relevant years (`Y`) and the JD's `Expmin` / `Expmax`. Scale it to the defined component range and handle absent or ambiguous experience data explicitly.
4. **Evidence strength.** Apply the defined evidence hierarchy: verified evidence with metrics > verified evidence > user-attested evidence > unsupported evidence.
5. **Keyword coverage.** Measure normalized JD keyword coverage in the final resume. Avoid treating a keyword's presence alone as proof of competency; expose keyword coverage separately from evidence-based skill matching.
6. **Explainability.** Return component-level scores with supporting fact IDs, source quotes, matched/missing requirements, and clear reasons for partial or missing credit.
7. **Prioritized recommendations.** Estimate each gap's potential point gain by recalculating the score with that gap hypothetically resolved. Never advise adding a claim unless the fact ledger supports it.
8. **Score/report/export APIs.** Implement:
   - `POST /resumes/{id}/score`
   - `GET /resumes/{id}/report`
   - `POST /resumes/{id}/export?format=pdf|docx`
9. **Score Report Workspace UI (`/resumes/[id]/score`).** Build the frontend interface featuring the overall score radial gauge, 5-component progress bars, collapsible evidence receipts with fact quotes, actionable gap recommendations, and download buttons for PDF and DOCX.
10. **Resume export.** Generate clean, single-column, ATS-friendly PDF and DOCX documents with standard headings and no layout elements that obstruct parsing.
11. **Evaluation and stability tests.** Write unit tests for the scoring logic, repeated-input score-stability tests, and verify ATS parsing compatibility across exported documents.

## Required Tests

- Identical inputs produce identical scores across repeated runs.
- A variant such as `JS` versus `JavaScript` resolves at the fuzzy-match stage without invoking embeddings.
- A broad term such as `Machine Learning` does not fully satisfy a specific requirement such as `FastAPI`.
- Each score component includes evidence and a readable explanation.
- Unsupported claims are not recommended as resume improvements.
- PDF and DOCX exports open successfully and retain a clean, parseable structure.

## Definition of Done

A resume receives a total score and five-component breakdown with evidence for every component, a ranked list of actionable gaps, and interactive working PDF/DOCX downloads both in the API and the Score Report UI.

## Coordination Contracts

- Consume structured JD requirements and match results from Vanshik.
- Expose stable report schemas and embed seamless export functionality into the `/resumes/[id]/score` frontend workspace.
- Palak owns the resume tailoring engine and `/resumes/[id]/edit` editor; Harman provides the score report interface that evaluates the generated resume.
