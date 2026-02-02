#!/usr/bin/env node
/**
 * prompt-validator.js - 사용자 프롬프트 유효성 검사 훅
 *
 * 처리 항목:
 * 1. plan 가능 커맨드의 --plan 플래그 감지
 * 2. create-* 커맨드의 필수 인자 검증 (Jira 연동 방식)
 * 3. start-scrum/done-scrum의 이슈 키 형식 검증
 */

const fs = require('fs');
const path = require('path');

// 플랜 모드 상태 파일
const PLAN_MODE_FILE = `/tmp/claude-code-plan-mode-${process.ppid}`;

const WORKTREE = process.cwd();

// plan 가능한 커맨드 목록
const PLAN_CAPABLE_COMMANDS = ['create-epic', 'create-story', 'create-scrum'];

// 커맨드별 인자 검증 규칙
// argTypes: 'md' = 마크다운 파일, 'jira-key' = Jira 이슈 키
const COMMAND_VALIDATORS = {
  'create-epic': {
    minArgs: 1,
    usage: '사용법: /create-epic <requirements.md> [--plan]',
    argTypes: ['md']
  },
  'create-story': {
    minArgs: 2,
    usage: '사용법: /create-story <epic-key> <requirements.md> [--plan]',
    argTypes: ['jira-key', 'md']
  },
  'create-scrum': {
    minArgs: 2,
    usage: '사용법: /create-scrum <story-key> <requirements.md> [--plan]',
    argTypes: ['jira-key', 'md']
  },
  'start-scrum': {
    minArgs: 1,
    usage: '사용법: /start-scrum <issue-key>',
    argTypes: ['jira-key']
  },
  'done-scrum': {
    minArgs: 0, // 선택 인자
    usage: '사용법: /done-scrum [issue-key]',
    argTypes: ['jira-key?'] // ? = 선택
  }
};

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
 * --plan 플래그 존재 여부 확인
 */
function hasPlanFlag(args) {
  return /(?:^|\s)--plan(?:$|\s)/.test(args);
}

/**
 * plan 가능한 커맨드인지 확인
 */
function isPlanCapable(command) {
  return PLAN_CAPABLE_COMMANDS.includes(command);
}

/**
 * Jira 이슈 키 형식 검증 (예: PROJ-123)
 */
function isValidJiraKey(str) {
  return /^[A-Z][A-Z0-9]+-\d+$/.test(str);
}

/**
 * 마크다운 파일인지 확인
 */
function isMarkdownFile(str) {
  return str.endsWith('.md');
}

/**
 * 마크다운 파일 존재 확인
 */
function markdownFileExists(mdArg) {
  let mdPath = mdArg;
  if (mdPath.startsWith('@')) {
    mdPath = mdPath.slice(1);
  }
  if (!path.isAbsolute(mdPath)) {
    mdPath = path.join(WORKTREE, mdPath);
  }
  return fs.existsSync(mdPath);
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
    process.exit(0);
  }

  const userPrompt = data.user_prompt || data.prompt || '';

  // 슬래시 커맨드가 아니면 통과
  if (!userPrompt.startsWith('/')) {
    process.exit(0);
  }

  // 커맨드와 인자 추출
  const parts = userPrompt.trim().split(/\s+/);
  const command = parts[0].slice(1); // 슬래시 제거
  const args = parts.slice(1).join(' ');

  // --plan 플래그 처리
  if (isPlanCapable(command) && hasPlanFlag(args)) {
    try {
      fs.writeFileSync(PLAN_MODE_FILE, command);
    } catch {
      // 무시
    }
  } else {
    // 플랜 모드 파일 제거
    try {
      if (fs.existsSync(PLAN_MODE_FILE)) {
        fs.unlinkSync(PLAN_MODE_FILE);
      }
    } catch {
      // 무시
    }
  }

  // 커맨드 검증
  const validator = COMMAND_VALIDATORS[command];
  if (!validator) {
    // 알 수 없는 커맨드는 통과
    process.exit(0);
  }

  // 플래그가 아닌 위치 인자만 추출
  const positionalArgs = parts.slice(1).filter(arg => !arg.startsWith('-'));

  // 최소 인자 수 확인
  if (positionalArgs.length < validator.minArgs) {
    console.log(validator.usage);
    process.exit(2);
  }

  // 인자 타입별 검증
  for (let i = 0; i < validator.argTypes.length; i++) {
    const argType = validator.argTypes[i];
    const arg = positionalArgs[i];

    // 선택 인자는 없으면 통과
    if (argType.endsWith('?') && !arg) {
      continue;
    }

    const requiredType = argType.replace('?', '');

    if (requiredType === 'md') {
      // 마크다운 파일 찾기
      const mdArg = positionalArgs.find(a => isMarkdownFile(a));
      if (!mdArg) {
        console.log(`마크다운 파일(.md)이 필요합니다.`);
        console.log(validator.usage);
        process.exit(2);
      }
      if (!markdownFileExists(mdArg)) {
        console.log(`마크다운 파일을 찾을 수 없습니다: ${mdArg}`);
        process.exit(2);
      }
    } else if (requiredType === 'jira-key') {
      // Jira 키 형식 검증
      const jiraArg = positionalArgs.find(a => isValidJiraKey(a));
      if (!jiraArg && validator.minArgs > 0) {
        // done-scrum은 선택이므로 minArgs가 0이면 통과
        if (i < positionalArgs.length && !isValidJiraKey(positionalArgs[i])) {
          console.log(`유효한 Jira 이슈 키 형식이 아닙니다: ${positionalArgs[i] || '(없음)'}`);
          console.log(`형식: PROJECT-123 (예: PROJ-456)`);
          console.log(validator.usage);
          process.exit(2);
        }
      }
    }
  }

  process.exit(0);
}

main();
