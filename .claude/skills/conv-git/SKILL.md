---
name: conv-git
description: Git 작업 시 반드시 로드해야 하는 스킬. git add, git commit, git push 등 Git 명령어 실행 전에 이 스킬을 참조하여 커밋 메시지 형식, 스테이징 규칙, 브랜칭 전략을 준수해야 함. /done-scrum 실행 시에도 자동 참조.
---

## Purpose
Apply this repo's Git conventions when committing, branching, and managing code history.

## Commit Message Format
```
<type>(<scope>): <subject>

<body>

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### Types
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅 (기능 변경 없음)
- `refactor`: 리팩토링 (기능 변경 없음)
- `test`: 테스트 추가/수정
- `chore`: 빌드, 설정 등 기타 변경

### Scope
- Jira 이슈 키 사용 (예: `SC-27`)
- 또는 영향받는 모듈/영역 (예: `memo`, `api`, `auth`)

### Subject
- 명령형 현재 시제 사용 ("add" not "added")
- 첫 글자 소문자
- 마침표 없음
- 50자 이내

### Body (선택)
- 변경 이유와 내용 설명
- 72자마다 줄바꿈

## Staging Rules (중요)

**절대 금지:**
- `git add -A` 사용 금지
- `git add .` 사용 금지
- `git add --all` 사용 금지

**반드시 준수:**
- 작업한 파일만 개별적으로 스테이징
- `git add <파일1> <파일2> ...` 형식으로 명시적 추가
- 스테이징 전 `git status`로 변경 파일 목록 확인
- 스테이징 후 `git diff --staged`로 변경 내용 검토

```bash
# Good
git add src/domain/memo/Memo.ts src/domain/memo/MemoRepository.ts
git add tests/unit/memo/InMemoryMemoRepository.test.ts

# Bad - 절대 금지
git add -A
git add .
git add --all
```

## Checklist
- 작업한 파일만 스테이징 (관련 없는 파일 제외)
- 커밋 전 `git diff --staged`로 변경 내용 확인
- 민감한 정보 (API 키, 비밀번호, .env) 커밋 금지
- 커밋 메시지에 Jira 이슈 키 포함

## Branching (권장)
- `main`: 안정된 프로덕션 코드
- `feature/<issue-key>-<description>`: 기능 개발
- `fix/<issue-key>-<description>`: 버그 수정

## Examples
```bash
# Good
feat(SC-27): 메모 데이터 모델 및 저장소 구현
fix(SC-30): 메모 삭제 시 404 에러 수정
docs: README 업데이트

# Bad
update code
fixed bug
WIP
```
