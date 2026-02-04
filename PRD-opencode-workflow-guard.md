# [PRD] OpenCode 워크플로우 가드 (PRD 강제 + 보안 가드레일)

## 기본 정보

| 항목 | 값 |
|---|---|
| Jira 티켓 | SC-7 (개발 환경 구축) — 구현 귀속 / SC-6에는 정책 확정 코멘트만 남김 |
| 작성일 | 2026-01-14 |
| 상태 | Draft |
| 관련 Confluence | 워크플로우 가이드: https://flowbase.atlassian.net/wiki/spaces/1wABkA8KgX9U/pages/3506177  |

---

## 목적

OpenCode를 사용할 때 **스크럼 티켓 연동과 문서 헤더 검증 없이 코드 변경이 진행되는 것을 시스템적으로 차단**하고, Build 모드에서도 **보안/파괴성 작업을 방지**한다.

핵심 원칙:
- Plan은 기본값(상태가 없거나 build가 아니면 항상 차단)
- 제약은 자동으로 적용 (Plan 강제)
- 허용은 명시적으로만 적용 (`scrum start` 검증 통과 시 Build)
- 만료 없음. `state.json`은 세션을 넘어 유지

---

## 배경

- 세션이 바뀌면 AI가 이전 합의/명세를 잊고 작업을 시작할 수 있음
- 문서(Confluence)와 작업(Jira) 기반으로 진행하되, “사람이 기억해서 지키는 규칙”은 쉽게 깨짐
- 따라서 **도구 레벨에서** 워크플로우를 강제할 필요가 있음

---

## 목표

- 기본 모드는 Plan이며, 상태가 없으면 파일 변경을 차단
- 스크럼 티켓 연동 없이 파일 변경을 차단
- `state.json`을 생성하기 위한 **커맨드 1개** 제공 (`scrum link`)
- 스크럼 작업 문서를 템플릿으로 생성하고 헤더 검증을 수행하는 **커맨드 1개** 제공 (`scrum start`)
- 검증 통과 시에만 Build로 전환
- Build에서는 개발 흐름을 크게 끊지 않되, 아래를 방지
  - `.env` 읽기/수정
  - 프로젝트 외부 디렉토리 접근(권한 요청)
  - `rm` 사용
  - `git push` 사용(사용자가 수동 수행)
- Build 승인 상태는 만료하지 않음
- 이 작업 자체도 Jira 티켓과 PRD로 추적되며, **작업 시작 전 티켓↔PRD 링크가 연결**된다

---

## 작업 원칙(이 작업 자체)

- 이 PRD를 기반으로 실제 구현 작업을 진행한다(“PRD 없이 작업 금지” 원칙의 자기 적용).
- 구현 착수 전 아래가 충족되어야 한다.
  - Jira 티켓(예: `SC-6` 하위 Task 또는 `SC-7` 하위 Task)이 생성되어 있다.
  - PRD 문서(Confluence 또는 이 파일)가 존재한다.
  - Jira 티켓 ↔ PRD 문서 링크가 서로 연결되어 있다.
- 단, **PRD 템플릿/워크플로우/가드레일 같은 부트스트랩 문서/도구는 예외적으로 최소 단위로 먼저 만들 수 있다.**

---

## 범위 외 (Out of Scope)

- 대화 내용 자체를 분석해서 “비밀키 요청”을 완벽히 탐지/차단하는 것
  - 대신: 문서 규칙 + `.env` 차단 + push 차단 등 “유출/오염 경로” 차단을 우선
- Jira/Confluence API를 호출해 PRD 존재 여부를 실시간 검증하는 것
  - 초기에는 상태(JSON) 기반으로만 강제

---

## 요구사항

### 기능 요구사항

| ID | 요구사항 | 우선순위 |
|---|---|---|
| REQ-001 | `.opencode/state.json`이 없거나 `mode!=build`이면 `edit`(write/patch 포함) 차단 | P0 |
| REQ-002 | `workflow scrum link`로만 `state.json` 생성/갱신 (`jiraKey` 기록, `mode=plan` 유지) | P0 |
| REQ-003 | `workflow scrum start`가 `docs/scrum/<JIRA_KEY>.md`를 템플릿으로 생성 | P0 |
| REQ-004 | `workflow scrum start`가 필수 헤더(역할/요구사항/제약 사항)를 검증하고 결과를 기록 | P0 |
| REQ-005 | 검증 통과 시에만 `mode=build`로 전환 (실패 시 plan 유지) | P0 |
| REQ-006 | `state.json`은 만료 없이 세션을 넘어 유지 | P0 |

### 보안/안전 요구사항

| ID | 요구사항 | 우선순위 |
|---|---|---|
| SEC-001 | `.env`, `.env.*` 읽기/수정 금지 (OpenCode permission 레벨에서 deny) | P0 |
| SEC-002 | 프로젝트 외부 디렉토리 접근은 permission `ask`로 승인 요구 | P0 |
| SEC-003 | Build에서도 `rm` 명령은 deny | P0 |
| SEC-004 | Build에서도 `git push*`는 deny (푸시는 사용자가 수동) | P0 |

---

## 설계 개요

### 상태 파일

- 경로: `.opencode/state.json`
- Git: 로컬 전용(커밋하지 않음)

권장 스키마(최소):

```json
{
  "mode": "plan",
  "scrum": {
    "jiraKey": "SC-7-123",
    "linkedAt": "2026-01-14T00:00:00+09:00"
  },
  "doc": {
    "path": "docs/scrum/SC-7-123.md",
    "verified": false,
    "missingHeaders": []
  },
  "updatedAt": "2026-01-14T00:00:00+09:00"
}
```

### 동작 규칙

- `workflow scrum link` → 상태 생성/갱신, `mode=plan` 유지
- `workflow scrum start` → 문서 생성 + 헤더 검증 + 통과 시 `mode=build`
- `edit` 실행 시:
  - `state.json` 없음 → 차단
  - `mode=build` + `doc.verified=true` 이면 허용
  - 아니면 차단(에러 메시지로 “scrum link/start” 안내)
- `bash` 실행 시:
  - Plan: 기본 차단 유지(현행 정책)
  - Build: 대부분 허용하되 `rm` 및 `git push` 등 deny-list만 차단

### OpenCode 설정(권한)

- 프로젝트 루트에 `opencode.json`을 추가해 아래를 설정
  - `permission.external_directory = "ask"`
  - `permission.read`에서 `*.env` deny
  - `permission.edit`에서 `*.env` deny
  - `permission.bash`에서 `rm *` deny
  - `permission.bash`에서 `git push*` deny

---

## 작업 추적 TODO (이 PRD 기준)

### 문서/정의

- [ ] (결정) 이 작업을 Jira에서 어디에 귀속할지 확정: `SC-6` vs `SC-7`
- [ ] (필수) Jira 티켓(하위 Task 포함)에 PRD 링크를 첨부하고, PRD에도 Jira 티켓 링크를 첨부
- [ ] Confluence에 본 PRD를 링크하거나, Confluence PRD로 전사(선택)

### 구현(Plan → Build 전환 강제)

- [ ] `workflow scrum link`로 `state.json` 생성 규칙 확정
- [ ] `.gitignore`에 `.opencode/state.json` 추가
- [ ] `opencode.json` 프로젝트 설정 추가(permissions 포함)
- [ ] `.opencode/plugin/workflow-guard.ts` 플러그인 구현
  - [ ] `tool.execute.before`에서 `edit` 차단/허용
  - [ ] `tool.execute.before`에서 build 시 `bash` deny-list 차단(최소: `rm`, `git push`)
  - [ ] 만료 처리 없음(상태 유지)

### 명령어(부트스트랩)

- [ ] 스크럼 링크: `workflow scrum link --jira <KEY>`
  - [ ] 동작: `.opencode/state.json` 생성/갱신 + `mode=plan` 유지
- [ ] 스크럼 시작: `workflow scrum start --jira <KEY>`
  - [ ] 동작: `docs/scrum/<KEY>.md` 생성 + 헤더 검증 + 통과 시 `mode=build`
- [ ] 명령어 사용 예시를 워크플로우 가이드에 추가

### 검증

- [ ] `state.json` 없이 파일 수정이 차단되는지 확인
- [ ] `scrum link`만 수행 시 파일 수정이 차단되는지 확인
- [ ] `scrum start` 통과 시 파일 수정이 가능한지 확인
- [ ] 헤더 누락 시 반려되는지 확인
- [ ] Build 승인 상태에서 `rm`/`git push`가 차단되는지 확인
- [ ] `.env` read/edit가 차단되는지 확인
- [ ] 프로젝트 외부 접근 시 승인 요청이 뜨는지 확인

---

## 완료 조건 (Definition of Done)

- [ ] `state.json`이 없으면 `edit`/`write`/`patch`가 차단된다
- [ ] `scrum link`만 수행된 상태에서는 파일 수정이 차단된다
- [ ] `scrum start` 검증 통과 시 파일 수정이 가능하다
- [ ] 헤더 누락 시 `scrum start`가 반려된다
- [ ] Build에서도 `rm`과 `git push`는 차단된다
- [ ] `.env`, `.env.*` 파일 read/edit가 차단된다
- [ ] 프로젝트 외부 디렉토리 접근은 승인 요청(`ask`)이 필요하다
- [ ] `.opencode/state.json`은 Git에 커밋되지 않는다
 - [ ] `state.json`은 만료 없이 유지된다

---

## 오픈 이슈

- 헤더 검증 범위 확장 여부(추후)
  - 내용 충실도 검사, 체크리스트 확장 등
- deny-list 확장 여부(추후)
  - `git reset --hard`, `git clean -fd`, `git push --force` 등 추가 차단할지
