# Keep Project Context and Decisions Updated

The rules files are the project's memory. Keep them accurate **at the same time** as the work, not afterwards.

## What to preserve
Use `PROJECT_CONTEXT.md` and `DECISIONS.md` to preserve:

- Architecture and technology choices.
- Reusable component conventions.
- Finalised design decisions.
- Implementation details that future sessions need.
- Known issues and constraints.

## When the AI makes a decision (with my approval)
1. Explain it first (see `02-explain-before-implementing.md`).
2. Once I approve, add a record to `DECISIONS.md` **in the same change** as the code.
3. Update the relevant section of `PROJECT_CONTEXT.md` if architecture, conventions, constraints or commands changed.

## When I make a decision manually
I will sometimes decide things myself: telling you in chat, editing code or config by hand, adding a dependency, renaming files, or overriding what you proposed. When that happens:

1. **Record it immediately**, in the same turn, in `DECISIONS.md` with "Decided by: User (manual)". Do not wait to be asked.
2. Update `PROJECT_CONTEXT.md` to match.
3. If I state the decision but not the reason, record what I said, and ask me one short question for the reason. Do not invent a rationale.
4. At the start of a session, and before significant work, check what changed since your last update (for example `git status`, `git diff`, `git log`). If I changed things by hand that are not in the rules files, tell me what you found and update the files, confirming anything unclear.
5. If my manual change conflicts with an earlier decision, do not silently overwrite it. Mark the old record as superseded and link to the new one.

## Rules for updating
- Never delete old decisions. Change their status to `superseded` or `reverted` and link to the replacement.
- Keep entries specific: name the files, components, libraries and versions involved.
- Do not record guesses, ideas or unapproved proposals as decisions. Unresolved items go under "Open Questions" in `PROJECT_CONTEXT.md`.
- If a change does not need a documentation update, say so explicitly in your end-of-task summary.
- Finish every task by listing which rules files you updated and what you changed in them.
