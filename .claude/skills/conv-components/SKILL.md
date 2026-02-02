---
name: conv-components
description: Component/page conventions (structure, naming, patterns) for this repo
---

## Purpose
Apply this repo's UI component/page conventions when creating or modifying frontend code.

## Checklist
- Use existing folder/file naming patterns in the target directory.
- Keep components small; extract reusable pieces when repetition appears.
- Keep props typed; avoid `any`.

## Skill Test Override (Temporary)
- New/updated component names must end with `Babo`.
- Prefer `function` components (avoid `const X = () => ...` for this test).

## Notes
- If no clear pattern exists in the codebase yet, propose a default and document it in the relevant spec (`story.md`/`scrum.md`).
