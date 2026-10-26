# Decision Records

Newest first. One record per decision. Never delete records: mark them `superseded` or `reverted` instead.
Add a new record **at the time** the decision is made, whether the AI proposed it or the user made it manually.

## Index

| ID | Date | Title | Status | Decided by |
|----|------|-------|--------|------------|
| D-012 | 2026-10-26 | Persistent Profile Hub & Two-Input Resume Matching Workspace | accepted | User (manual product principle specification) |
| D-011 | 2026-10-26 | Dual-Experience Architecture: Simple User Workflow & Faculty Technical View | accepted | User (manual context specification) |

---

### D-012: Persistent Profile Hub & Two-Input Resume Matching Workspace
- **Date**: 2026-10-26
- **Status**: accepted
- **Decided by**: User (manual product principle specification)
- **Context**: The candidate profile is the persistent foundation of Skillora, not just a settings page. Returning users should never have to repeat document ingestion or upload a resume to reuse their data. The matching workspace required two distinct inputs: Candidate info (Use My Profile vs Upload Resume) and Target Job (Paste JD vs Upload JD), with results displayed on the same screen. Verification status must carry through the entire product: Profile data -> Extracted facts -> Verification status -> Job matching -> Recommendations -> Resume generation.
- **Decision**: 
  1. Built `/profile` (Candidate Profile & Fact Hub): Editable personal details (Name, Contact, Location, Links), academic info (Degree, University, CGPA), connected GitHub account, project cards grid, and a verified vs unverified facts table with inline verify, edit, and reject controls.
  2. Enhanced `/job`: Header profile avatar links to `/profile`. Main workspace provides dual candidate inputs: `[ Use My Profile ]` (default, binding saved profile, CGPA 8.85, 2 projects, 19 facts with zero upload needed) vs `[ Upload Resume ]`. Target job provides `[ Paste JD ]` vs `[ Upload JD ]`.
  3. Clicking **"Analyze Resume"** displays the radial Job Match Score, 5-component breakdown, requirement matches (Met, Partial, Gaps), and evidence-based recommendations on the **same screen**.
  4. Traceable suggestions: In `/tailor`, every bullet explicitly identifies whether it cites a verified fact or an unverified claim, preventing unsupported metrics from being asserted as verified facts.
- **Impact**: `frontend/app/(app)/profile/page.tsx`, `frontend/app/(app)/job/page.tsx`, `frontend/app/(app)/tailor/page.tsx`, `frontend/components/AppShell.tsx`, `frontend/lib/api.ts`, `frontend/lib/store.tsx`.
- **Consequences**: Candidates establish their profile once and reuse it across multiple applications with 100% evidence traceability.
- **Reversibility**: Easy.
- **Supersedes / Related**: Extends D-011.
| D-010 | 2026-10-26 | Simplified User Journey: Direct Job-to-Score Workflow & Stage Reordering | accepted | User chose between AI options |

---

### D-011: Dual-Experience Architecture: Simple User Workflow & Faculty Technical View
- **Date**: 2026-10-26
- **Status**: accepted
- **Decided by**: User (manual context specification)
- **Context**: Skillora required two distinct experiences: (1) a friction-free user journey: Select/Upload Resume + JD -> Analyze Resume -> Understand Match Score & Gaps -> Improve Resume -> Export; and (2) an accessible technical demonstration view for faculty to inspect source ingestion, Fact Ledger verbatim citations, agent execution, and verification pipelines without forcing ordinary users to navigate sequential technical stages.
- **Decision**: 
  1. Updated landing page primary buttons (`Get Started`, `Get Started Free`, `Explore Demo`) to route directly to `/job` (the main user journey workspace).
  2. Implemented integrated Resume Selection & Upload on `/job`, showing the candidate's active profile/resume with an inline file picker to upload or change resumes on the fly.
  3. Relabeled the primary match button to **"Analyze Resume"** and the tailoring CTA to **"Improve Resume"**.
  4. Restructured `AppShell.tsx` navigation into: (a) User Workflow pills (`Match & Score`, `Match Insights`, `Improve Resume`, `Export`) and (b) Faculty Technical View pills (`Fact Ledger`, `Sources`).
  5. Added Technical Demonstration View banners to `/verify` and `/sources` with 1-click return links to the user workspace.
- **Impact**: `frontend/app/page.tsx`, `frontend/components/AppShell.tsx`, `frontend/app/(app)/job/page.tsx`, `frontend/app/(app)/score/page.tsx`, `frontend/app/(app)/tailor/page.tsx`, `frontend/app/(app)/verify/page.tsx`, `frontend/app/(app)/sources/page.tsx`.
- **Consequences**: First-time and returning users experience an immediate, intuitive matching and tailoring flow. Faculty can easily inspect deep-dive technical components at any time.
- **Reversibility**: Easy.
- **Supersedes / Related**: Extends and refines D-010.
| D-009 | 2026-10-26 | Interactive Project Cards Grid with Add/Edit/Delete Controls in Fact Ledger | accepted | User chose between AI options |
| D-008 | 2026-10-26 | Structured 4-Block Fact Ledger & Persistent Candidate Profile | accepted | User chose between AI options |
| D-007 | 2026-10-25 | On-Screen 11 Requirements Matrix & Live Evaluator Modal | accepted | User (manual) |
| D-006 | 2026-10-25 | Landing Page Navigation: Home, How It Works, Pricing, Resources | accepted | User (manual) |
| D-005 | 2026-10-25 | Complete Removal of Mock Data for Live Presentation | accepted | User (manual) |
| D-004 | 2026-10-25 | Official Anthropic Model Context Protocol (FastMCP) Implementation | accepted | AI proposed, User approved |
| D-003 | 2026-10-25 | 60% Mid-Term Presentation Scope (Stages 1–4 Active, Stages 5–6 Gated in UI) | accepted | User (manual) |
| D-002 | 2026-10-25 | Verifiable Career Fact Ledger with Verbatim Source Citations | accepted | User (manual) |
| D-001 | 2026-10-25 | Strict Dual-Framework Architecture (CrewAI + Google ADK Exclusively) | accepted | User (manual) |

---

### D-010: Simplified User Journey: Direct Job-to-Score Workflow & Stage Reordering
- **Date**: 2026-10-26
- **Status**: accepted
- **Decided by**: User chose between AI options (Option A) with explicit condition: "keep the landing page and rest move forward with it"
- **Context**: The existing workflow felt friction-heavy because it forced candidates through sequential stages and routed `/job` directly to `/tailor` while gating `/score` and `/export`. Candidates needed an intuitive, fast journey: Upload/Select Resume + JD -> Analyze -> Job-Fit Score & Breakdown -> Evidence Gaps -> Tailor & Export, while preserving all existing UI designs, components, and deep-dive inspection routes.
- **Options considered**:
  1. Option A (Approved): Streamlined stage routing (Sources -> Job Match -> Score & ATS -> Tailor -> Export) with direct jump actions on `/sources` and `/job`, uncommenting `/score` and `/export` in `AppShell.tsx`, and preserving the landing page completely untouched.
  2. Option B: Merged single-page accordion interface (rejected: violates constraint not to redesign existing UI).
- **Decision**: Implemented Option A across `AppShell.tsx`, `sources/page.tsx`, `job/page.tsx`, `score/page.tsx`, `tailor/page.tsx`, and `export/page.tsx`. Reordered workflow stages to 1: Sources, 2: Fact Ledger, 3: Job Match, 4: Score & ATS, 5: Tailor & Chat, 6: Export. Enabled live ATS score badge in header. Landing page (`frontend/app/page.tsx`) was left 100% untouched.
- **Rationale**: Preserves 100% of the UI design, styles, animations, and components while solving the UX friction and allowing both standard users and evaluators full flexibility.
- **Impact**: `frontend/components/AppShell.tsx`, `frontend/app/(app)/sources/page.tsx`, `frontend/app/(app)/job/page.tsx`, `frontend/app/(app)/score/page.tsx`, `frontend/app/(app)/tailor/page.tsx`, `frontend/app/(app)/export/page.tsx`.
- **Consequences**: User journey feels fluid and purposeful. All 6 stages remain fully accessible for faculty evaluation.
- **Reversibility**: Easy.
- **Supersedes / Related**: Supersedes D-003 (which had temporarily gated stages 5 & 6).

---

### D-009: Interactive Project Cards Grid with Add/Edit/Delete Controls in Fact Ledger
- **Date**: 2026-10-26
- **Status**: accepted
- **Decided by**: User chose between AI options (Option A)
- **Context**: Navigating multiple projects in the fact ledger previously required scrolling through all items at once. The user requested interactive project cards, a "+ Add Project" card, and inline edit/delete controls per card.
- **Options considered**:
  1. Option A (Recommended): Top Project Cards Grid with active selection, "+ Add Project" modal, and ✎ Edit / 🗑️ Delete buttons on each card.
  2. Option B: Inline expandable accordions.
- **Decision**: Implemented Option A in `frontend/app/(app)/verify/page.tsx`. Top grid renders project cards with fact counts, tech chip previews, and active selection pills. Includes a styled dashed "+ Add New Project" card with a 5-field creation modal, an Edit Project modal, and a Delete Confirmation modal.
- **Rationale**: User explicitly specified: "in the fact ledger have the projects cards, then we click on it, have a plus card tooo(to add a prj), on each card have the option to edit, delete".
- **Impact**: `frontend/app/(app)/verify/page.tsx`.
- **Consequences**: Fact ledger is organized into a clean interactive dashboard; candidates can catalog, modify, or remove projects dynamically.
- **Reversibility**: Easy.
- **Supersedes / Related**: Extends D-008.

---

### D-008: Structured 4-Block Fact Ledger & Persistent Candidate Profile
- **Date**: 2026-10-26
- **Status**: accepted
- **Decided by**: User chose between AI options (Option A)
- **Context**: The fact ledger previously rendered a flat, disjointed list of raw claims where subheadings like "System Components" became project names. Furthermore, opening a fresh session required repeatedly re-entering GitHub repositories from scratch.
- **Options considered**:
  1. Option A (Recommended): Pre-load candidate profile & verified projects into database and redesign `/verify` into a structured 4-block layout (Overview, Core Features, Results & Metrics, Tech Stack).
  2. Option B: Retain flat table and use client-side local storage caching.
- **Decision**: Implemented Option A. Restructured `frontend/app/(app)/verify/page.tsx` into 4 dedicated blocks per project (📌 Project Overview, ⚡ Core Features, 📈 Results & Metrics Achieved, 🛠️ Tech Stack Used with badges), enhanced `frontend/app/(app)/sources/page.tsx` with a persistent Candidate Profile Builder card, and seeded authentic SkillOra and AntiSoch facts into `backend/skillora.db`.
- **Rationale**: User explicitly specified: "In the fact ledger, I would like the tech stack to be mentioned... have the intro about the project present... and then arrange it into the ways like: This is the project info, this is what the project is about, these are the core features of it, these were the results which were achieved in that, and this is the tech stack which has been used."
- **Impact**: `frontend/app/(app)/verify/page.tsx`, `frontend/app/(app)/sources/page.tsx`, `frontend/lib/data.ts`, `backend/skillora.db`.
- **Consequences**: Fact ledger is executive-ready, highly readable, and projects persist across demo sessions without repetitive re-entry.
- **Reversibility**: Easy.
- **Supersedes / Related**: Related to D-002, D-005.

---

### D-007: On-Screen 11 Requirements Matrix & Live Evaluator Modal
- **Date**: 2026-10-25
- **Status**: accepted
- **Decided by**: User (manual)
- **Context**: Faculty evaluation rubric requires demonstrating 11 distinct agentic AI criteria. The user requested an on-screen method to present implementation status and proofs during the live demo.
- **Options considered**:
  1. Rely on verbal explanation and terminal outputs (High risk of faculty missing criteria).
  2. Add an interactive on-screen audit modal accessible from both the Landing Page and AppShell (Recommended: provides 1-click proof, live MCP tool ping, and benchmark metrics).
- **Decision**: Implemented `frontend/components/RequirementsModal.tsx` and wired it into `AppShell.tsx` and `page.tsx` with live MCP inspection and evaluation data.
- **Rationale**: User explicitly requested: "is there a way to show it all on the screen so we can just share the implementation and everything there?".
- **Impact**: `frontend/components/RequirementsModal.tsx`, `frontend/components/AppShell.tsx`, `frontend/app/page.tsx`.
- **Consequences**: Evaluator can click one button to audit the entire 11-criteria syllabus compliance with file links and live ping.
- **Reversibility**: Easy. Can toggle visibility or remove modal component.
- **Supersedes / Related**: Related to D-003, D-004.

---

### D-006: Landing Page Navigation: Home, How It Works, Pricing, Resources
- **Date**: 2026-10-25
- **Status**: accepted
- **Decided by**: User (manual)
- **Context**: The landing page navbar needed clean, intuitive links that match standard SaaS product aesthetics without text clustering.
- **Options considered**:
  1. Minimal "Home, About, Contact Us".
  2. Product-focused "Home, How It Works, Pricing, Resources" with interactive modals for pricing and resources.
- **Decision**: Implemented "Home, How It Works, Pricing, Resources" with explicit inline flex styles (`display: "flex", gap: "24px"`) and dedicated modals.
- **Rationale**: User explicitly instructed: "make it 'Home ,How It Works, Pricing, Resources'".
- **Impact**: `frontend/app/page.tsx`.
- **Consequences**: Clean, professional landing navigation with zero text-collapsing across browsers.
- **Reversibility**: Easy.
- **Supersedes / Related**: Supersedes earlier "About / Contact Us" iteration.

---

### D-005: Complete Removal of Mock Data for Live Presentation
- **Date**: 2026-10-25
- **Status**: accepted
- **Decided by**: User (manual)
- **Context**: Seed data (mock sources, dummy facts, pre-canned resume bullets) caused confusion during testing and prevented real zero-state evaluation.
- **Options considered**:
  1. Keep fallback mock data in development mode.
  2. Clear all dummy rows from `backend/skillora.db`, empty `frontend/lib/data.ts` arrays, and provide clean empty states across all screens.
- **Decision**: Completely emptied all mock rows from database and frontend seed data; added elegant empty-state cards for `/sources`, `/verify`, `/job`, `/tailor`.
- **Rationale**: User explicitly instructed: "remove mock data from the screens".
- **Impact**: `backend/skillora.db`, `frontend/lib/data.ts`, `frontend/lib/store.tsx`, all stage pages.
- **Consequences**: Screens display clean empty states until the user uploads documents or adds live inputs.
- **Reversibility**: Moderate. Can re-seed via script if needed.
- **Supersedes / Related**: None.

---

### D-004: Official Anthropic Model Context Protocol (FastMCP) Implementation
- **Date**: 2026-10-25
- **Status**: accepted
- **Decided by**: AI proposed, User approved
- **Context**: Course Criterion #2 mandates tool integration using the Model Context Protocol (MCP).
- **Options considered**:
  1. Custom internal tool calling wrapper.
  2. Official Anthropic `mcp.server.fastmcp.FastMCP` server exposing standard MCP tools and live HTTP discovery endpoint.
- **Decision**: Implemented `backend/app/mcp_server.py` using `FastMCP("SkillOra-MCP-Server")` exposing 4 tools (`file_parser_mcp`, `ledger_db_lookup_mcp`, `github_crawler_mcp`, `ats_calculator_mcp`) and `GET /api/mcp/tools`.
- **Rationale**: Meets the exact letter of Criterion #2 using the official open-standard MCP specification.
- **Impact**: `backend/app/mcp_server.py`, `backend/app/api/system.py`, `backend/requirements.txt`.
- **Consequences**: Any MCP-compatible agent or client can inspect and execute SkillOra tools.
- **Reversibility**: Moderate.
- **Supersedes / Related**: Criterion #2.

---

### D-003: 60% Mid-Term Presentation Scope (Stages 1–4 Active, Stages 5–6 Gated in UI)
- **Date**: 2026-10-25
- **Status**: accepted
- **Decided by**: User (manual)
- **Context**: The mid-term evaluation milestone covers 50%–60% of the course curriculum (Stages 1–4). Stages 5 (ATS Scoring) and 6 (Recruiter Export) belong to the Phase 2 final submission.
- **Options considered**:
  1. Delete Stage 5 & 6 pages and files.
  2. Comment out Stage 5 and 6 navigation links and pills in the UI while preserving all code and endpoints on disk.
- **Decision**: Commented out `/score` and `/export` from `AppShell.tsx` workflow tabs, ATS score pill, and `tailor/page.tsx` buttons, preserving all files.
- **Rationale**: User explicitly instructed: "remove stage 5 & 6 from the ui, just comment them out, dont remove them".
- **Impact**: `frontend/components/AppShell.tsx`, `frontend/app/(app)/tailor/page.tsx`.
- **Consequences**: Presentation cleanly demonstrates the 60% mid-term milestone without displaying unfinished or post-midterm screens.
- **Reversibility**: Easy. Uncomment navigation entries when starting Phase 2.
- **Supersedes / Related**: None.

---

### D-002: Verifiable Career Fact Ledger with Verbatim Source Citations
- **Date**: 2026-10-25
- **Status**: accepted
- **Decided by**: User (manual)
- **Context**: LLM resume tailoring tools frequently hallucinate metrics, titles, and technologies.
- **Options considered**:
  1. Standard prompt-engineering with system instructions to "be factual".
  2. Relational Fact Ledger storing claims with exact character offsets (`quote_span`), human-in-the-loop review, and a callback-based verifier.
- **Decision**: Built the SQLite `Fact` ledger and `verifier_callback` in Google ADK to guarantee 100% citation grounding.
- **Rationale**: Core thesis of the SkillOra project for CSE3101 Agentic AI.
- **Impact**: `backend/app/db.py`, `backend/app/engine/verify.py`, `backend/app/agents/adk_agents.py`.
- **Consequences**: Bullets that contain numbers or skills not found in verified facts are intercepted and rewritten.
- **Reversibility**: Fundamental to architecture.
- **Supersedes / Related**: Criterion #1, #5, #8.

---

### D-001: Strict Dual-Framework Architecture (CrewAI + Google ADK Exclusively)
- **Date**: 2026-10-25
- **Status**: accepted
- **Decided by**: User (manual)
- **Context**: Course rules restrict multi-agent implementations to CrewAI and Google ADK exclusively.
- **Options considered**:
  1. Use LangChain / AutoGen wrappers.
  2. Pure dual-framework implementation: CrewAI for batch ingestion, JD analysis, and matching; Google ADK for interactive tailoring and verifier callbacks.
- **Decision**: Adopted strict dual-framework exclusivity with zero third-party agent framework wrappers.
- **Rationale**: Mandated by CSE3101 course syllabus and project requirements.
- **Impact**: `backend/requirements.txt`, `backend/app/agents/`.
- **Consequences**: 100% compliance with Criterion #7.
- **Reversibility**: Fundamental to architecture.
- **Supersedes / Related**: Criterion #7.
