---
description: Jira Scrum(Task) 이슈를 완료 상태로 전환합니다
---
사용법: `/done-scrum [issue-key]`

## 요구사항
- `[issue-key]`: 완료할 Jira 이슈 키 (선택사항)
  - 생략하면 현재 활성 Scrum을 완료합니다.

## 단계

### 1. 대상 이슈 결정
1. `issue-key`가 제공되면 해당 이슈 사용
2. 제공되지 않으면 `.claude/.active-scrum` 파일에서 현재 활성 Scrum 읽기
3. 활성 Scrum도 없으면 에러 반환:
   ```
   완료할 Scrum이 없습니다. 이슈 키를 지정하거나 먼저 `/start-scrum`으로 작업을 시작하세요.
   ```

### 2. 이슈 정보 조회 (MCP)
`mcp__Atlassian__getJiraIssue` 호출:
```json
{
  "cloudId": "<MCP로 조회>",
  "issueIdOrKey": "<issue-key>"
}
```

### 3. 가용 전환(Transition) 조회 (MCP)
`mcp__Atlassian__getTransitionsForJiraIssue` 호출:
```json
{
  "cloudId": "<cloudId>",
  "issueIdOrKey": "<issue-key>"
}
```

### 4. "Done" 전환 실행 (MCP)
1. 전환 목록에서 "Done" (또는 유사한 완료 상태)를 찾습니다.
2. `mcp__Atlassian__transitionJiraIssue` 호출:
   ```json
   {
     "cloudId": "<cloudId>",
     "issueIdOrKey": "<issue-key>",
     "transition": { "id": "<transition-id>" }
   }
   ```

### 5. Git 커밋 및 푸시
1. `git status`로 변경된 파일 확인
2. 해당 스크럼에서 작업한 파일만 스테이징 (관련 없는 파일 제외)
3. 커밋 메시지 형식:
   ```
   feat(<issue-key>): <issue-summary>

   - 변경 내용 요약

   Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
   ```
4. `git push`로 원격 저장소에 푸시

### 6. 로컬 상태 정리
1. `.claude/.active-scrum` 파일 삭제 (완료한 이슈와 일치하는 경우)
2. `docs/STATUS.md` 업데이트 (선택사항)

## 출력 형식
```
## Scrum 완료

**이슈**: <issue-key>
**제목**: <issue-summary>
**상태**: In Progress → Done

Jira 링크: https://<site>.atlassian.net/browse/<issue-key>

활성 Scrum이 해제되었습니다.
`/workflow-status`로 다음 작업을 확인하세요.
```

## 에러 처리
- 이슈를 찾을 수 없음: "Jira에서 이슈를 찾을 수 없습니다: <issue-key>"
- 전환 불가: "이슈를 'Done' 상태로 전환할 수 없습니다. 현재 상태: <current-status>"
- 이미 완료됨: "이슈가 이미 'Done' 상태입니다."

## 참고
- 완료 후에는 `repo-guardrails.js` 훅이 코드 수정을 다시 차단합니다.
- 새 작업을 시작하려면 `/start-scrum`을 사용하세요.
