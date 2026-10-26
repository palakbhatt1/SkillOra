# Pre-PR Quality Checks

Before pushing changes or raising a PR, run the checks configured in the project, whatever the language or stack:

- Linting and formatting checks.
- Type checking / static analysis (for example `tsc --noEmit` for TypeScript, `mypy` or `pyright` for Python, `go vet` for Go, `cargo check` for Rust).
- Production build.
- Relevant unit and integration tests.
- E2E tests and QA checks, where configured.

Find the exact commands in `PROJECT_CONTEXT.md` (Project Commands) or the project's config (`package.json` scripts, `Makefile`, `pyproject.toml`, CI workflow files). Skip any check the project does not use.

Fix failures caused by your changes and report any checks that could not be run, and why.
Do not claim that tests passed unless they were actually executed. Quote the command and its result.
