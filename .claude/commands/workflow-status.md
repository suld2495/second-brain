---
description: Jira 워크플로우 현황을 조회합니다
agent: planner
---
사용법: `/workflow-status [--all]`

## 옵션
- `--all`: 모든 이슈 표시 (기본값: 최근 20개)

## 단계

### 1. Atlassian 리소스 조회 (MCP)
`mcp__Atlassian__getAccessibleAtlassianResources` 호출하여 사용 가능한 Atlassian 사이트 목록을 가져옵니다.
- cloudId 확보

### 2. Jira 프로젝트 조회 (MCP)
`mcp__Atlassian__getVisibleJiraProjects` 호출:
```json
{
  "cloudId": "<cloudId>"
}
```
- 프로젝트가 여러 개면 사용자에게 선택 요청
- projectKey 확보

### 3. 현재 활성 Scrum 확인
1. `.claude/.active-scrum` 파일을 읽습니다.
2. 활성 Scrum이 있으면 해당 이슈 정보를 먼저 표시합니다.

### 4. Jira 이슈 조회 (MCP)
`mcp__Atlassian__searchJiraIssuesUsingJql` 호출:

**진행 중 (In Progress)**:
```json
{
  "cloudId": "<cloudId>",
  "jql": "project = <projectKey> AND status = 'In Progress' ORDER BY updated DESC",
  "fields": ["summary", "status", "issuetype", "priority", "assignee", "parent"]
}
```

**대기 중 (To Do)**:
```json
{
  "cloudId": "<cloudId>",
  "jql": "project = <projectKey> AND status = 'To Do' ORDER BY priority DESC, created ASC",
  "fields": ["summary", "status", "issuetype", "priority", "parent"]
}
```

**완료 (Done)** - 최근 10개:
```json
{
  "cloudId": "<cloudId>",
  "jql": "project = <projectKey> AND status = 'Done' ORDER BY updated DESC",
  "maxResults": 10,
  "fields": ["summary", "status", "issuetype", "updated"]
}
```

### 5. 계층 구조로 정리
Epic > Story > Task 순으로 계층화하여 표시합니다.

## 출력 형식
```
## Jira 워크플로우 현황

**프로젝트**: <projectKey>
**활성 Scrum**: <active-scrum-key> (또는 "없음")

---

### 🔄 진행 중 (In Progress)
| 키 | 타입 | 제목 | 우선순위 |
|---|------|------|---------|
| PROJ-789 | Task | API 엔드포인트 구현 | High |

### 📋 대기 중 (To Do)
| 키 | 타입 | 제목 | 상위 이슈 |
|---|------|------|----------|
| PROJ-790 | Task | 테스트 작성 | PROJ-456 |
| PROJ-791 | Story | 사용자 인증 | PROJ-123 |

### ✅ 최근 완료 (Done)
| 키 | 타입 | 제목 | 완료일 |
|---|------|------|--------|
| PROJ-788 | Task | 초기 설정 | 2025-01-15 |

---

### 다음 작업 추천
1. **PROJ-790** (Task): 테스트 작성 - 우선순위: High
   - `/start-scrum PROJ-790`으로 시작하세요.

### 통계
- 진행 중: 1개
- 대기 중: 5개
- 완료: 12개
```

## 참고
- Epic, Story, Task의 계층 관계를 `parent` 필드로 파악합니다.
- 모든 Jira 조회는 Atlassian MCP를 통해 동적으로 수행됩니다.
