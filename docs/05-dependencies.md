# Skillora: who depends on whom

Read this before you start. It tells you what you can build immediately versus what needs another module's output, and what to mock in the meantime so development proceeds in parallel.

## The pipeline flow

```
Manya (Profile Builder & Fact Ledger)
        |  facts + project card
        v
Vanshik (JD Analyzer & Matching Workspace)
        |  matched requirements + candidate projects
        v
Palak (Resume Tailoring Engine & Editor)
        |  tailored, verified resume with claim citations
        v
Harman (Scoring Engine & Score Report Workspace)
        |  5-component evaluation & ATS export
```

Each member owns a complete vertical slice including their dedicated frontend workspace. Downstream modules can begin immediately by testing against mocked schemas until upstream endpoints are linked.

## Manya — Profile Builder & Fact Ledger (Completed)

- **Deliverables:** multi-modal parsers, Source Extractor flow, injection guardrail, and fact verification UI (`/projects/[id]/sources`, `/projects/[id]/verify`).
- **Data contracts provided:** the `Fact` schema (`id`, `project_id`, `type`, `statement`, `source_id`, `source_span`, `status`).

## Vanshik — JD Analyzer, Matching & Job Workspace

- **Depends on:** Manya's `Fact` schema to determine match retrieval targets.
- **Mock in the meantime:** a sample set of `Fact` objects matching the agreed schema.
- **Data contracts provided:** the `Requirement` schema (`text`, `kind`, `category`, `skills`, `keywords`, `matched_fact_ids`, `match_status`) and recommended project matches.
- **Frontend Workspace:** `/jobs/new` and `/jobs/[id]` for job posting and requirement analysis.

## Palak — Resume Tailoring Engine & Editor

- **Depends on:** Manya's verified facts and Vanshik's matched requirements to drive grounding and keyword gap coaching.
- **Mock in the meantime:** sample `Fact` and `Requirement` objects matching the published schemas to develop the Coordinator, Writer, and Verifier reflection loop.
- **Data contracts provided:** tailored resume structure with `resume_claims` (sentence + fact_ids + verification status).
- **Frontend Workspace:** `/resumes/[id]/edit` editor with live verification badges, citation popovers, and Keyword Coach diff panel, plus the Chat Assistant sidebar.

## Harman — Scoring, Export & Score Report Workspace

- **Depends on:** Vanshik's matched requirements and Palak's verified resume claims to evaluate coverage, alignment, and evidence strength.
- **Mock in the meantime:** mocked requirement match sets and tailored resumes to validate deterministic scoring formulas and stability tests.
- **Data contracts provided:** the `ScoreReport` schema with component receipts, explanations, and ranked recommendations.
- **Frontend Workspace:** `/resumes/[id]/score` dashboard with score meter, breakdown bars, evidence receipts, and PDF/DOCX downloads.

## Integration & Sequencing

1. **Parallel development:** everyone builds against the agreed Pydantic models in `schemas/`.
2. **Schema contracts:** `Fact` (Manya) → `Requirement` (Vanshik) → `resume_claims` (Palak) → `ScoreReport` (Harman).
3. **Stepwise integration:** connect Manya → Vanshik (swap mock facts for live ones), then Vanshik → Palak, then Palak → Harman.
4. **Shared contracts:** any change to shared models in `db/models.py` or `schemas/` follows a small pull request with team review.
