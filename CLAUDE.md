# AGENTS.md - 저장소 워크플로우 및 규칙

이 저장소는 명세 기반(spec-first) 프로그래밍과 Jira 기반 트래킹으로 운영한다.
에이전트는 아래 규칙을 엄격히 따른다.

## 중요

나에게 설명하는 건 무조건 한글로 설명해.

## 목차
1. 작업 트래킹 모델 (Jira)
2. Jira 중심 워크플로우
3. 완료 정의 (Definition of Done, DoD)
4. 테스트 정책 (중요)
5. 문서 규칙 (항상 업데이트)
6. 명세 우선 워크플로우 (Spec-First)
7. 기술 스택 (현재 의도)
8. MCP 관련 규칙
9. 무단 리팩터링 금지
10. OpenCode 커맨드 (작업 아이템 생성/관리)
11. 가이드 (컨벤션/지침 관리)

## 1) 작업 트래킹 모델 (Jira)
- 계층: Epic -> Story -> Scrum
- Scrum은 실행 가능한 가장 작은 작업 단위이다.
- 계획/결정/진행 상황은 채팅이 아니라 Jira에 남겨, 다음 세션에서도 안전하게 이어갈 수 있어야 한다.

## 2) Jira 중심 워크플로우
모든 작업 아이템(Epic, Story, Scrum)은 Jira에서 관리한다.
- **로컬 파일로 작업 아이템 생성/관리 금지**: Jira가 단일 소스(Single Source of Truth)
- **상태 관리**: Jira 워크플로우 (To Do → In Progress → Done)
- **계층**: Epic → Story → Task(Scrum)

Jira 프로젝트 설정은 `.claude/CLAUDE.md`를 참조한다.

## 3) 완료 정의 (Definition of Done, DoD)
Scrum이 완료(done)되려면 아래 조건을 모두 만족해야 한다.
- 테스트 추가(또는 기존 불변 테스트로 충분히 커버된다는 근거 명시)
- 로컬에서 모든 테스트 통과
- 문서 업데이트
- Jira 이슈 상태를 Done으로 전환
- `.claude/.active-scrum`을 정리(완료된 이슈 기준으로 초기화)

Story는 포함된 모든 Scrum이 완료되어야 완료된다.

## 4) 테스트 정책 (중요)
### 4.1 테스트 도구
- 단위/통합: vitest
- E2E: playwright

### 4.2 테스트 코드 불변 규칙
HUMAN의 명시적 지시 없이는 기존 테스트 코드를 수정하면 안 된다.
테스트가 실패하면 테스트를 바꾸지 말고 구현을 고쳐야 한다.

에이전트가 할 수 있는 것:
- 새로운 테스트 추가
- 새로운 테스트 파일 생성

에이전트가 하면 안 되는 것:
- 기존 테스트 assertion 수정
- 테스트 삭제 또는 약화
- 버그를 정상 동작처럼 보이게 만들기 위해 테스트를 변경

테스트 변경이 필요해 보이면:
- 테스트를 변경하지 않는다
- 관련 Jira 이슈에 "변경 제안"으로만 기록한다
- HUMAN 승인을 요청한다

권장 폴더 정책:
- `tests/stable/**` : 불변(수정 금지)
- `tests/new/**` : 현재 작업에서 추가하는 신규 테스트

## 5) 문서 규칙 (항상 업데이트)
문서는 산출물의 일부다.
Scrum 완료 시 최소 아래 문서를 업데이트한다.
- `docs/STATUS.md` (진행 보드)
- `docs/INDEX.md` (현재 존재하는 기능/사용법)
- `docs/RUNBOOK.md` (실행/테스트 방법)

세션 간 연속성을 위해:
- `docs/SESSION_HANDOFF.md`는 Scrum 완료 처리 시 반드시 업데이트한다

## 6) 명세 우선 워크플로우 (Spec-First)
Story 구현 전에:
- `story.md`를 먼저 확정한다(요구사항 + 수용 기준)
- MCP 도구/리소스/스키마 같은 "계약"이 존재하면, 구현 전에 문서로 먼저 정의한다

채팅 지시는 저장소 명세 파일을 대체하지 않는다.
새 요구사항이 생기면:
- 관련 명세 파일을 먼저 업데이트한다
- 범위 변화가 있으면 HUMAN 확인을 받는다

## 7) 기술 스택 (현재 의도)
- 언어: TypeScript
- 런타임: Node.js
- 테스트: vitest, playwright
- RAG/벡터 스토어: ChromaDB (server mode)
- MCP 서버: @modelcontextprotocol/sdk
  - `McpServer` 선호
  - tool 입력은 Zod 스키마로 정의
  - stdio transport 사용 시 로그는 stderr로 출력

## 8) MCP 관련 규칙
- stdio 모드에서 stdout에 로그를 쓰지 않는다(프로토콜 스트림 오염 방지).
- MCP tool/resource 계약은 구현 전에 문서로 먼저 정의한다.
- 가능하면 `InMemoryTransport.createLinkedPair()` 기반 통합 테스트를 추가한다.

## 9) 무단 리팩터링 금지
버그 수정은 최소 변경으로 해결한다. 관련 없는 리팩터링을 섞지 않는다.
타입 에러 억제 금지: `as any`, `@ts-ignore`, `@ts-expect-error`.

## 10) OpenCode 커맨드 (작업 아이템 생성/관리)
이 저장소는 OpenCode 커맨드를 사용하며, Jira 연동 기반으로 운영한다. 커맨드는 `.opencode/commands/*.md`에 정의된다.

### 상태/워크플로우
- `/status`: Jira 기준으로 현재 진행 상황과 다음 작업을 요약한다.
- `/start-scrum <issue-key>`: Jira 이슈를 In Progress로 전환하고 `.claude/.active-scrum`에 활성 이슈를 기록한다.

### 작업 아이템 생성
- 작업 아이템 생성/계층 관리는 Jira에서 수행한다.
- 로컬에서 Epic/Story/Scrum 디렉토리를 생성하지 않는다.

## 11) 가이드 (컨벤션/지침 관리)
1. 전반적인 코딩 컨벤션과 보안 관련 내용은 `rules`에 정의한다.
2. 구체적인 에이전트가 수행할 컨벤션 및 지침은 `skills`(온디맨드 로드)로 정의한다.
