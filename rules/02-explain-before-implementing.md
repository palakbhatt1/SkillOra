# Explain Before Implementing

The AI must explain what it is about to do **before** doing it, and wait for approval before moving on. Never silently make a choice and keep going.

## 1. Plan before code
Before writing code, explain:

1. What you intend to change.
2. Which files and components are involved.
3. How the change fits the existing architecture.
4. Whether it could affect other parts of the application.

Inspect and approve the plan before making significant changes. Significant means multi-file edits, refactors, new dependencies, schema or API changes, and deletions. Small isolated fixes may proceed after a one-line statement of intent.

## 2. Decision checkpoints
Stop and explain whenever you face a real choice, including:

- Choosing a library, framework, tool or service.
- Choosing a pattern, data structure, state approach or folder structure.
- Changing or adding a component convention, design token, API shape or schema.
- Picking between two or more reasonable implementations.
- Deviating from an existing decision in `DECISIONS.md`.

At each checkpoint, present:

| Item | What to say |
|------|-------------|
| **Decision needed** | The question, in one sentence |
| **Options** | 2 to 3 realistic options, with trade-offs |
| **Recommendation** | Which one you suggest and why |
| **Impact** | Files, components and behaviour affected |
| **Reversibility** | How hard it is to undo later |

Then **wait for my answer** before moving on. Do not proceed on assumptions. If I do not reply to a minor choice, state the assumption you are making and flag it clearly.

## 3. Explain as you go
- After each significant step, say what was done and why, in plain language.
- If something unexpected comes up (a bug, a conflict with existing code, a constraint), stop and tell me before working around it.
- At the end of a task, give a short summary: what changed, what decisions were made, and which rules files were updated.
