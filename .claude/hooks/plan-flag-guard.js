#!/usr/bin/env node
/**
 * plan-flag-guard.js - --plan 플래그 활성화 시 파일 수정 차단 훅
 *
 * plan 가능한 커맨드가 --plan 플래그와 함께 실행되면,
 * 계획이 승인될 때까지 파일 수정을 차단합니다.
 *
 * 참고: 상태는 임시 파일로 추적하며,
 * prompt-validator 훅에서 설정합니다.
 */

const fs = require('fs');

// 플랜 모드 상태 파일 (프로세스 ID 포함)
const PLAN_MODE_FILE = `/tmp/claude-code-plan-mode-${process.ppid}`;

/**
 * stdin에서 JSON 입력 읽기
 */
function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => resolve(data));
  });
}

/**
 * 메인 로직
 */
async function main() {
  const input = await readStdin();

  let data;
  try {
    data = JSON.parse(input);
  } catch {
    // JSON 파싱 실패 시 통과
    process.exit(0);
  }

  const toolName = data.tool_name || data.tool || '';

  // 수정 도구만 검사
  if (toolName !== 'Edit' && toolName !== 'Write') {
    process.exit(0);
  }

  // 플랜 모드 활성화 여부 확인
  if (fs.existsSync(PLAN_MODE_FILE)) {
    try {
      const planCommand = fs.readFileSync(PLAN_MODE_FILE, 'utf8').trim();
      console.log(`PlanFlagGuard: '${toolName}' 차단됨. '/${planCommand}'에 '--plan' 플래그가 설정되어 있습니다.`);
      console.log(`'--plan' 없이 다시 실행하면 변경사항이 적용됩니다.`);
      process.exit(2);
    } catch {
      // 파일 읽기 실패 시 통과
      process.exit(0);
    }
  }

  process.exit(0);
}

main();
