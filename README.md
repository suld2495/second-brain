# second-brain

Node.js 20 기준으로 로컬/CI에서 동일한 방식으로 개발을 시작할 수 있도록 정리한 저장소입니다.

## 5분 온보딩(로컬)

### 요구사항
- Node.js: 20.x (`.nvmrc` 참고)
- npm: 10+

### 시작하기
```bash
npm ci
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

### 검증(로컬에서 동일)
```bash
npm run lint
npm test
npm run build
```

## 문서
- 실행/테스트/빌드 상세: `docs/RUNBOOK.md`

## Codespaces/DevContainer
현재 저장소는 DevContainer를 필수로 두지 않습니다.
Codespaces를 사용하는 경우에도 위의 명령(`npm ci`, `npm run dev`)으로 동일하게 동작해야 합니다.
