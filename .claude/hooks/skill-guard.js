#!/usr/bin/env node
/**
 * skill-guard.js - 코드 파일 수정 전 컨벤션 스킬 로드 확인 훅
 *
 * 규칙:
 * - .ts/.tsx 파일: conv-javascript 스킬 필요
 * - .tsx 파일: conv-components 스킬 추가 필요
 * - api.ts 또는 /api/ 경로: conv-api 스킬 추가 필요
 */

const fs = require('fs');
const path = require('path');

const WORKTREE = process.cwd();

// 스킬 트래커 파일 (세션 내 로드된 스킬 추적)
const SKILL_TRACKER_FILE = `/tmp/claude-code-skills-loaded-${process.ppid}`;

// 스킬 문서 경로 매핑
const SKILL_DOC_PATHS = {
  'conv-javascript': '.claude/skills/conv-javascript/SKILL.md',
  'conv-components': '.claude/skills/conv-components/SKILL.md',
  'conv-api': '.claude/skills/conv-api/SKILL.md'
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
 * 상대 경로 계산
 */
function getRelativePath(filePath) {
  if (path.isAbsolute(filePath)) {
    return path.relative(WORKTREE, filePath);
  }
  return filePath;
}

/**
 * 스킬 트래커에 스킬 추가
 */
function trackSkill(skillName) {
  try {
    fs.appendFileSync(SKILL_TRACKER_FILE, skillName + '\n');
  } catch {
    // 무시
  }
}

/**
 * 로드된 스킬 목록 조회
 */
function getLoadedSkills() {
  try {
    if (fs.existsSync(SKILL_TRACKER_FILE)) {
      const content = fs.readFileSync(SKILL_TRACKER_FILE, 'utf8');
      return content.split('\n').filter(s => s.trim());
    }
  } catch {
    // 무시
  }
  return [];
}

/**
 * 파일 경로에 필요한 스킬 목록 계산
 */
function getRequiredSkills(relPath) {
  const required = [];

  // TypeScript 파일이면 conv-javascript 필요
  if (relPath.endsWith('.ts') || relPath.endsWith('.tsx')) {
    required.push('conv-javascript');
  }

  // TSX 파일이면 conv-components도 필요
  if (relPath.endsWith('.tsx')) {
    required.push('conv-components');
  }

  // API 관련 파일이면 conv-api 필요
  const basename = path.basename(relPath);
  if (basename === 'api.ts' || relPath.includes('/api/')) {
    required.push('conv-api');
  }

  return required;
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

  const toolName = data.tool_name || data.tool || '';
  const filePath = data.tool_input?.file_path || data.tool_input?.path || '';
  const skillName = data.tool_input?.skill || '';

  // Skill 도구 호출 시 트래킹
  if (toolName === 'Skill' && skillName) {
    trackSkill(skillName);
    process.exit(0);
  }

  // Read 도구로 스킬 문서 읽을 때 트래킹
  if (toolName === 'Read' && filePath) {
    const relPath = getRelativePath(filePath);

    for (const [skill, docPath] of Object.entries(SKILL_DOC_PATHS)) {
      if (relPath === docPath) {
        trackSkill(skill);
      }
    }
    process.exit(0);
  }

  // Edit, Write 도구만 검사
  if (toolName !== 'Edit' && toolName !== 'Write') {
    process.exit(0);
  }

  // 파일 경로가 없으면 통과
  if (!filePath) {
    process.exit(0);
  }

  const relPath = getRelativePath(filePath);

  // 필요한 스킬 계산
  const requiredSkills = getRequiredSkills(relPath);

  // 필요한 스킬이 없으면 통과
  if (requiredSkills.length === 0) {
    process.exit(0);
  }

  // 로드된 스킬 확인
  const loadedSkills = getLoadedSkills();
  const missingSkills = requiredSkills.filter(s => !loadedSkills.includes(s));

  // 모든 필요 스킬이 로드되었으면 통과
  if (missingSkills.length === 0) {
    process.exit(0);
  }

  // 누락된 스킬 안내와 함께 차단
  console.log('SkillGuard: 수정/작성 차단됨.');
  console.log('다음 컨벤션 스킬 문서를 먼저 읽어주세요:');
  for (const skill of missingSkills) {
    console.log(`- ${skill}: ${SKILL_DOC_PATHS[skill]}`);
  }
  console.log('');
  console.log('이 세션에서 위 SKILL.md 파일들을 읽으면 가드가 해제됩니다.');
  process.exit(2);
}

main();
