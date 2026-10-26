# AI Development Rules

Rules for every AI coding tool (Cursor, Windsurf, Copilot, Claude Code, Codex, etc.).
At the start of every session, read all files in this folder, then `PROJECT_CONTEXT.md`.

| File | Purpose |
|------|---------|
| `01-core-principles.md` | DRY, KISS, YAGNI |
| `02-explain-before-implementing.md` | Plan, decision checkpoints and approval before moving on |
| `03-project-context.md` | Updating context and decisions live, including my manual decisions |
| `04-reusable-components.md` | Inspect first, consolidate duplication |
| `05-ui-reference-library.md` | How to use and maintain `Taste/` |
| `06-pre-pr-checks.md` | Language-agnostic checks required before pushing or raising a PR |
| `PROJECT_CONTEXT.md` | Per-project architecture, conventions, constraints (fill in) |
| `DECISIONS.md` | Detailed decision records (options, rationale, impact, who decided) |
| `Taste/` | UI reference screenshots with notes |

## Wiring into a tool
If a tool does not read this folder automatically, add one line to its instruction file
(`AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`):

> Read and follow every file in `rules/` before starting work.
