---
description: Jira Scrum(Task) 이슈를 완료 상태로 전환합니다
model: openai/gpt-5.1-codex-mini
---
사용법: `/done-scrum [issue-key]`

## 요구사항
- issue-key: $ARGUMENTS
  - 생략하면 현재 활성 Scrum을 완료합니다.

## 단계

### 1. 대상 이슈 결정
1. `issue-key`가 제공되면 해당 이슈 사용
2. 제공되지 않으면 `.claude/.active-scrum` 파일에서 현재 활성 Scrum 읽기
   - 규칙: 파일의 **첫 줄**을 이슈 키로 간주합니다. (예: `SC-48`)
3. 활성 Scrum도 없으면 에러 반환:
   ```
   완료할 Scrum이 없습니다. 이슈 키를 지정하거나 먼저 `/start-scrum`으로 작업을 시작하세요.
   ```

### 2. 이슈 정보 조회 (MCP)
`mcp__Atlassian__getJiraIssue` 호출:
```json
{
  "cloudId": "c8a5f969-43d0-4d12-b7bd-4464edfc51c6",
  "issueIdOrKey": "<issue-key>"
}
```

### 3. 가용 전환(Transition) 조회 (MCP)
`mcp__Atlassian__getTransitionsForJiraIssue` 호출:
```json
{
  "cloudId": "c8a5f969-43d0-4d12-b7bd-4464edfc51c6",
  "issueIdOrKey": "<issue-key>"
}
```

### 4. "완료" 전환 실행 (MCP)
1. 전환 목록에서 완료 상태 전환을 찾습니다.
   - 우선순위 1: `to.statusCategory.key == "done"`
   - 우선순위 2: `name` 또는 `to.name`이 `완료` / `Done` 과 일치
2. `mcp__Atlassian__transitionJiraIssue` 호출:
   ```json
   {
     "cloudId": "c8a5f969-43d0-4d12-b7bd-4464edfc51c6",
     "issueIdOrKey": "<issue-key>",
     "transition": { "id": "<transition-id>" }
   }
   ```

3. 이슈가 이미 완료 상태라면(예: 상태명이 `완료`) 전환은 생략하고 다음 단계로 진행합니다.

### 5. Git 커밋 및 푸시
1. `git status`로 변경된 파일 확인
2. 해당 스크럼에서 작업한 파일만 스테이징 (관련 없는 파일 제외)
3. 커밋 메시지 형식:
   ```
   feat(<issue-key>): <issue-summary>

   - 변경 내용 요약

   ```
4. `git push`로 원격 저장소에 푸시

### 6. 브랜치 머지 및 정리
1. main 브랜치로 전환:
   ```bash
   git checkout main
   git pull origin main
   ```
2. feature 브랜치 머지:
   ```bash
   git merge feature/<issue-key>
   ```
3. main 브랜치 푸시:
   ```bash
   git push origin main
   ```
4. feature 브랜치 삭제:
   ```bash
   git branch -d feature/<issue-key>
   git push origin --delete feature/<issue-key>
   ```

### 7. 로컬 상태 정리
1. `.claude/.active-scrum` 파일 정리
   - `.claude/.active-scrum`이 없으면 생략
   - 파일의 첫 줄 이슈 키가 `<issue-key>`와 **일치하면** 파일을 삭제합니다.
   - 파일이 비어있으면(공백 포함) 안전하게 삭제합니다.
   - 첫 줄 이슈 키가 다르면 삭제하지 말고 경고를 출력합니다.

   구현 예시:
   ```bash
   if [ -f .claude/.active-scrum ]; then
     active_key="$(head -n 1 .claude/.active-scrum | tr -d '\r' | xargs)"
     if [ -z "$active_key" ]; then
       rm -f .claude/.active-scrum
     elif [ "$active_key" = "<issue-key>" ]; then
       rm -f .claude/.active-scrum
     else
       echo "경고: 이미 진행 중인 Scrum이 있습니다: $active_key"
       echo "요청된 완료 대상과 달라 .active-scrum을 삭제하지 않았습니다. (요청: <issue-key>)"
     fi
   fi
   ```

## 출력 형식
```
## Scrum 완료

**이슈**: <issue-key>
**제목**: <issue-summary>
**상태**: 진행 중 → 완료

Jira 링크: https://<site>.atlassian.net/browse/<issue-key>

활성 Scrum이 해제되었습니다.
`/workflow-status`로 다음 작업을 확인하세요.
```

## 에러 처리
- 이슈를 찾을 수 없음: "Jira에서 이슈를 찾을 수 없습니다: <issue-key>"
- 전환 불가: "이슈를 '완료' 상태로 전환할 수 없습니다. 현재 상태: <current-status>"

> 참고: 이슈가 이미 완료 상태인 경우에도 로컬 상태 정리(7단계)는 수행합니다.

## 참고
- 완료 후에는 `repo-guardrails.js` 훅이 코드 수정을 다시 차단합니다.
- 새 작업을 시작하려면 `/start-scrum`을 사용하세요.
