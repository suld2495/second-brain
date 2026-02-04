# RUNBOOK

## Prerequisites
- Node.js 20.x (`.nvmrc`)
- npm 10+

권장(선택): nvm
```bash
nvm use
```

## Install
```bash
npm ci
```

## Development
```bash
npm run dev
```

기본 포트: `http://localhost:3000`

## Lint
```bash
npm run lint
```

## Tests
```bash
npm test
```

특정 테스트만 실행:
```bash
npm test -- tests/new/api/memos.get.test.ts
npm test -- tests/new/api/memos.delete.test.ts
```

## Build
```bash
npm run build
```

## CI
PR/push 시 아래가 자동으로 실행되어 통과해야 합니다.
- `npm ci`
- `npm run lint`
- `npm test`

## Codespaces/DevContainer
DevContainer는 필수 전제가 아닙니다.
Codespaces에서도 로컬과 동일하게 아래 명령으로 동작해야 합니다.
```bash
npm ci
npm run dev
```
