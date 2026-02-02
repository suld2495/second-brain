#!/usr/bin/env node
/**
 * repo-guardrails.js - 저장소 파일 수정 제한 훅
 *
 * 규칙:
 * 1. 워크트리 외부 파일 수정 금지
 * 2. tests/stable/ 하위 파일 수정 금지 (명시적 승인 필요)
 * 3. Jira에 진행 중인 Scrum이 없으면 허용 경로 외 수정 금지
 */

const fs = require('fs');
const path = require('path');

// 허용 경로 접두사 (Scrum 없이도 수정 가능)
const ALLOWED_PREFIXES = ['work/', 'docs/', 'templates/', '.opencode/', '.claude/'];

// 수정 금지 경로
const STABLE_TEST_PREFIX = 'tests/stable/';

// 워크트리 루트
const WORKTREE = process.cwd();

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
 * 상대 경로 계산
 */
function getRelativePath(filePath) {
  if (path.isAbsolute(filePath)) {
    return path.relative(WORKTREE, filePath);
  }
  return filePath;
}

/**
 * Jira에서 진행 중인 Scrum 이슈가 있는지 확인
 * Atlassian MCP를 통해 확인 (JQL 쿼리 사용)
 *
 * 참고: 이 훅에서는 직접 Jira API를 호출하지 않고,
 * 로컬 상태 파일로 Scrum 활성화 여부를 추적합니다.
 * /start-scrum 커맨드가 이 파일을 생성/관리합니다.
 */
function hasActiveScrum() {
  const scrumStateFile = path.join(WORKTREE, '.claude', '.active-scrum');

  // 상태 파일이 있으면 진행 중인 Scrum이 있음
  if (fs.existsSync(scrumStateFile)) {
    try {
      const content = fs.readFileSync(scrumStateFile, 'utf8').trim();
      // 파일 내용이 있으면 활성 Scrum으로 간주
      return content.length > 0;
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Scrum 없이 수정 가능한 경로인지 확인
 */
function isAllowedWithoutScrum(relPath) {
  return ALLOWED_PREFIXES.some(prefix =>
    relPath.startsWith(prefix) || relPath === prefix.slice(0, -1)
  );
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
  const filePath = data.tool_input?.file_path || data.tool_input?.path || '';

  // Edit, Write 도구만 검사
  if (toolName !== 'Edit' && toolName !== 'Write') {
    process.exit(0);
  }

  // 파일 경로가 없으면 통과
  if (!filePath) {
    process.exit(0);
  }

  const relPath = getRelativePath(filePath);

  // 워크트리 탈출 검사
  if (relPath.startsWith('..')) {
    console.log(`RepoGuardrails: '${filePath}' 수정 차단됨 (저장소 워크트리 외부 경로)`);
    process.exit(2);
  }

  // stable 테스트 수정 검사
  if (relPath.startsWith(STABLE_TEST_PREFIX)) {
    console.log(`RepoGuardrails: '${relPath}' 수정 차단됨. '${STABLE_TEST_PREFIX}' 하위 파일은 명시적 HUMAN 승인 없이 수정할 수 없습니다.`);
    process.exit(2);
  }

  // 허용 경로가 아니고 활성 Scrum이 없으면 차단
  if (!isAllowedWithoutScrum(relPath)) {
    if (!hasActiveScrum()) {
      console.log(`RepoGuardrails: '${relPath}' 수정 차단됨. 진행 중인 Scrum이 없습니다.`);
      console.log(`'/start-scrum' 커맨드로 Jira Scrum 이슈를 활성화하세요.`);
      process.exit(2);
    }
  }

  process.exit(0);
}

main();
