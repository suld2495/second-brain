---
name: conv-api
description: API conventions for this repo (boundaries, validation, errors, contracts)
---

## Purpose
Apply this repo's API boundary conventions (request/response shape, validation, errors).

## Checklist
- Validate/parse inputs at the boundary.
- Return consistent error shapes; avoid leaking internal details.
- Keep contracts documented (spec-first) before implementation.

## Skill Test Override (Temporary)
- Use `var` for local variables (do not use `let`/`const`).
