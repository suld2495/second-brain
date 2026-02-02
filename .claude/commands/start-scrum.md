---
description: Jira Scrum(Task) 이슈를 진행 중 상태로 전환합니다
agent: planner
---
사용법: `/start-scrum <issue-key>`

## 요구사항
- `<issue-key>`: 시작할 Jira 이슈 키 (예: PROJ-789)

## 단계

### 1. 이슈 정보 조회 (MCP)
`mcp__Atlassian__getJiraIssue` 호출:
```json
{
  "cloudId": "<MCP로 조회>",
  "issueIdOrKey": "<issue-key>"
}
```
- 이슈가 없으면 에러 반환
- 현재 상태 확인

### 2. 현재 활성 Scrum 확인
1. `.claude/.active-scrum` 파일이 존재하는지 확인합니다.
2. 이미 진행 중인 Scrum이 있으면 경고를 표시합니다:
   ```
   경고: 이미 진행 중인 Scrum이 있습니다: <기존-이슈-키>
   계속하려면 먼저 기존 Scrum을 완료하거나, 강제로 변경하세요.
   ```

### 3. 가용 전환(Transition) 조회 (MCP)
`mcp__Atlassian__getTransitionsForJiraIssue` 호출:
```json
{
  "cloudId": "<cloudId>",
  "issueIdOrKey": "<issue-key>"
}
```

### 4. "In Progress" 전환 실행 (MCP)
1. 전환 목록에서 "In Progress" (또는 유사한 진행 상태)를 찾습니다.
2. `mcp__Atlassian__transitionJiraIssue` 호출:
   ```json
   {
     "cloudId": "<cloudId>",
     "issueIdOrKey": "<issue-key>",
     "transition": { "id": "<transition-id>" }
   }
   ```

### 5. 로컬 상태 파일 업데이트
1. `.claude/.active-scrum` 파일에 이슈 키 저장:
   ```
   <issue-key>
   ```
2. 이 파일은 `repo-guardrails.js` 훅에서 활성 Scrum 여부를 확인하는 데 사용됩니다.

## 출력 형식
```
## Scrum 시작됨

**이슈**: <issue-key>
**제목**: <issue-summary>
**상태**: To Do → In Progress

Jira 링크: https://<site>.atlassian.net/browse/<issue-key>

이제 코드 수정이 허용됩니다.
작업 완료 후 `/done-scrum`으로 완료 처리하세요.
```

## 에러 처리
- 이슈를 찾을 수 없음: "Jira에서 이슈를 찾을 수 없습니다: <issue-key>"
- 전환 불가: "이슈를 'In Progress' 상태로 전환할 수 없습니다. 현재 상태: <current-status>"
- 이미 진행 중: "이슈가 이미 'In Progress' 상태입니다."

## 참고
- 이 커맨드를 실행해야 `repo-guardrails.js` 훅이 코드 수정을 허용합니다.
- 한 번에 하나의 Scrum만 활성화할 수 있습니다.
- cloudId는 이슈 조회 시 자동으로 확보됩니다.
