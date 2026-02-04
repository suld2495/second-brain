---
description: Jira에 Epic 이슈를 생성합니다
model: openai/gpt-5.1-codex-mini
---
사용법: `/create-epic <requirements.md> [--plan]`

## 요구사항
- 인자 중 하나는 반드시 존재하는 `.md` 파일 경로여야 합니다. (훅에서 검증)
- `--plan` 플래그는 어느 위치에나 올 수 있습니다.

## 모드
- **기본 (apply)**: Jira에 Epic 생성
- **`--plan`**: 이슈를 생성하지 않고 계획만 출력

## 단계

### 1. Jira 설정 확인
`.claude/CLAUDE.md`의 Jira 프로젝트 설정을 참조합니다:
- Cloud ID: `c8a5f969-43d0-4d12-b7bd-4464edfc51c6`
- Project Key: `SC`
- Issue Type: `에픽` (id: 10001)

### 2. 요구사항 분석
1. 요구사항 마크다운 파일을 읽습니다.
2. 제목 추출: 첫 번째 `# Title`을 사용하거나, 파일명에서 추출합니다.
3. 설명 추출: 마크다운 내용을 Jira 설명으로 변환합니다.

### 3. Jira Epic 생성 (apply 모드만, MCP)
`mcp__Atlassian__createJiraIssue` 호출:
```json
{
  "cloudId": "c8a5f969-43d0-4d12-b7bd-4464edfc51c6",
  "projectKey": "SC",
  "issueTypeName": "에픽",
  "summary": "<추출한 제목>",
  "description": "<마크다운 내용>"
}
```

### 4. 결과 출력
생성된 Jira 이슈 키와 링크를 출력합니다.

## Plan 모드 출력 형식
```
## Epic 생성 계획

**프로젝트**: SC (지식베이스)
**이슈 타입**: 에픽
**제목**: <추출한 제목>

### 설명 (미리보기)
<마크다운 내용 요약>

### 확인
- `--plan` 없이 다시 실행하면 Epic이 생성됩니다.
```

## 참고
- 로컬 파일은 생성하지 않습니다. Jira가 단일 소스입니다.
- Jira 이슈 키는 생성 후에 결정됩니다 (예: SC-123).
