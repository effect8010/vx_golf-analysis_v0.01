/**
 * 배치 파일 내용 검사 및 업데이트 유틸리티
 * 배치 파일의 내용을 검사하고 필요한 경우 업데이트하여 PowerShell 호환성을 향상시킵니다.
 */
const fs = require('fs');
const path = require('path');

// 로그 파일 설정
const logFile = path.join(__dirname, 'update-bat-files.log');
let logContent = `배치 파일 업데이트 시작: ${new Date().toISOString()}\n\n`;

// 배치 파일 디렉토리
const batchDir = path.join(__dirname, 'scripts', 'batch-scripts');

// 배치 파일 목록 가져오기
const batFiles = fs.readdirSync(batchDir)
  .filter(file => file.endsWith('.bat'));

logContent += `검사할 배치 파일 수: ${batFiles.length}\n\n`;

// 업데이트 규칙 정의
const updateRules = [
  {
    description: '명령어 구분자 변경 (PowerShell 호환성)',
    pattern: /&&/g,
    replacement: ';',
    filesUpdated: []
  },
  {
    description: '디렉토리 경로 표준화',
    pattern: /\.\.\/\.\.\/server/g,
    replacement: '%~dp0\\..\\server',
    filesUpdated: []
  },
  {
    description: '경로 표기 방식 일관성 유지',
    pattern: /\//g,
    replacement: '\\',
    filesUpdated: []
  }
];

// 각 배치 파일 검사 및 업데이트
batFiles.forEach(file => {
  const filePath = path.join(batchDir, file);
  
  try {
    // 파일 내용 읽기
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // 각 업데이트 규칙 적용
    updateRules.forEach(rule => {
      if (rule.pattern.test(content)) {
        content = content.replace(rule.pattern, rule.replacement);
        rule.filesUpdated.push(file);
      }
    });
    
    // 변경 사항이 있는 경우 파일 업데이트
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      logContent += `업데이트됨: ${file}\n`;
    } else {
      logContent += `변경 없음: ${file}\n`;
    }
  } catch (err) {
    logContent += `오류: 파일 처리 실패 - ${file} - ${err.message}\n`;
  }
});

// 업데이트 요약 생성
logContent += '\n업데이트 요약:\n';
updateRules.forEach(rule => {
  logContent += `- ${rule.description}: ${rule.filesUpdated.length}개 파일 업데이트\n`;
  if (rule.filesUpdated.length > 0) {
    logContent += `  - 업데이트된 파일: ${rule.filesUpdated.join(', ')}\n`;
  }
});

// 로그 파일 작성
logContent += `\n배치 파일 업데이트 완료: ${new Date().toISOString()}\n`;
fs.writeFileSync(logFile, logContent);

console.log(`배치 파일 업데이트가 완료되었습니다. 로그 파일: ${logFile}`);