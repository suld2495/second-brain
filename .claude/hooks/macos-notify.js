#!/usr/bin/env node
/**
 * macos-notify.js - macOS 알림 발송 훅
 *
 * 알림 이벤트:
 * - stop: 응답 준비 완료
 * - error: 세션 에러
 */

const { execSync } = require('child_process');

const APP_TITLE = 'Claude Code';

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
 * AppleScript 문자열 이스케이프
 */
function escapeAppleScript(str) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * macOS 알림 발송
 */
function sendNotification(title, message) {
  const escapedTitle = escapeAppleScript(title);
  const escapedMessage = escapeAppleScript(message);

  try {
    execSync(
      `osascript -e 'display notification "${escapedMessage}" with title "${escapedTitle}"'`,
      { stdio: 'ignore' }
    );
  } catch {
    // 알림 발송 실패 시 무시
  }
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

  const notificationType = data.type || '';

  switch (notificationType) {
    case 'stop':
      sendNotification(APP_TITLE, '응답 준비 완료');
      break;
    case 'error':
      sendNotification(APP_TITLE, '세션 에러 발생');
      break;
    default:
      // 다른 알림 타입은 무시
      break;
  }

  process.exit(0);
}

main();
