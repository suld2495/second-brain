# SC-7: 개발 환경 구축

## 메타데이터
- Jira: https://flowbase.atlassian.net/browse/SC-47
- 상태: Draft

## 범위
- Node.js 20 기준으로 개발 환경(dev/test/lint/build)을 문서화합니다.
- 신규 워크스테이션에서도 재현 가능하도록 설치/실행 절차를 단일화합니다.
- CI에서 `npm ci` + `npm run lint` + `npm test`를 자동 실행합니다.
- Codespaces/DevContainer는 "필수"가 아니라 "고려" 범위로 문서에 안내합니다.

## 수용 기준(Acceptance criteria)
- 새 워크스테이션에서 5분 이내 서버를 띄울 수 있는 가이드가 존재합니다.
- `npm run lint` / `npm test`가 성공합니다.
- `docs/RUNBOOK.md`에 개발/테스트/빌드 방법이 기록됩니다.

## 검증 절차
로컬(클린 설치) 기준:
```bash
node -v
npm -v

npm ci
npm run lint
npm test
npm run build
npm run dev
```

CI 기준:
- PR 또는 push에서 위 명령이 자동으로 실행되고, 실패하면 체크가 실패합니다.

Cloud VM 결과 기록:
- `docs/verification/SC-47-cloud-vm.md`

## 오픈 이슈
- "5분" 기준에 `npm ci` 시간을 포함할지 여부(네트워크/캐시 영향)
