# Project Rules

This document contains project-wide rules that must always be followed.

## Repository Workflow

- Follow `AGENTS.md` as the source of truth.
- Use the file-based Jira structure under `work/`:
  - `work/before/` - Backlog items
  - `work/in_progress/` - Active work
  - `work/done/` - Completed items
- Before implementing code changes, ensure there is an active Scrum directory in `work/in_progress/`.
- Never modify existing tests without explicit human approval.

## Jira Project Configuration

- **Atlassian Site**: flowbase (https://flowbase.atlassian.net)
- **Cloud ID**: c8a5f969-43d0-4d12-b7bd-4464edfc51c6
- **Project Key**: SC (지식베이스)
- **Issue Type Mapping**:
  - Epic → 에픽 (id: 10001)
  - Story → 스토리 (id: 10004)
  - Scrum → 작업 (id: 10003)

## Coding Conventions

- Prefer minimal, local changes; do not mix unrelated refactors.
- Do not suppress type errors (`as any`, `@ts-ignore`, `@ts-expect-error`).
- Keep comments minimal; add only when a block is non-obvious.
  - Do not include example values/usages in comments.
  - Comments must describe usage or non-obvious rationale.
  - Do not add domain-specific examples to generic code.
  - Prefer documenting domain usage in docs/specs, not in code comments.

## Security

- Do not print or commit secrets (keys, tokens, credentials, `.env`).
- Do not log sensitive user data; redact or omit.
- Validate/parse all external inputs at boundaries (API, CLI, file IO).
- Prefer least-privilege defaults; avoid widening permissions without need.

## GitHub / Repo Security

- Never commit `.env` files.
- Do not delete or edit `.env` files. If changes are required, ask for explicit HUMAN approval first.
- Never add secrets (API keys, tokens, credentials) to source code.

## Convention Skills

When a task involves a specific area, load the matching convention skill before creating or modifying code.

| File Pattern | Required Skill |
|--------------|----------------|
| `*.ts`, `*.tsx` | `conv-javascript` |
| `*.tsx` | `conv-components` (additionally) |
| `api.ts` or `/api/` paths | `conv-api` (additionally) |

Skill documentation:
- `conv-javascript`: `.claude/skills/conv-javascript/SKILL.md`
- `conv-components`: `.claude/skills/conv-components/SKILL.md`
- `conv-api`: `.claude/skills/conv-api/SKILL.md`

**Note**: This is enforced by the `skill-guard.sh` hook. Read the relevant SKILL.md before editing code files.
