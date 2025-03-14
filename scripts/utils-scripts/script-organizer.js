/**
 * 스크립트 파일 정리 유틸리티
 * 프로젝트 루트 디렉토리의 JS 파일들을 목적에 맞게 분류하여 scripts 폴더에 정리합니다.
 */
const fs = require('fs');
const path = require('path');

// 로그 파일 설정
const logFile = path.join(__dirname, 'script-organizer.log');
let logContent = `스크립트 정리 시작: ${new Date().toISOString()}\n\n`;

// 스크립트 분류 카테고리
const categories = {
  dbScripts: {
    dir: path.join(__dirname, 'scripts', 'db-scripts'),
    pattern: /^(create|update|remove|check|schema|db|database)/i,
    description: '데이터베이스 관련 스크립트'
  },
  testScripts: {
    dir: path.join(__dirname, 'scripts', 'test-scripts'),
    pattern: /^(test|simple|login|fix|debug)/i,
    description: '테스트 및 디버깅 스크립트'
  },
  utilsScripts: {
    dir: path.join(__dirname, 'scripts', 'utils-scripts'),
    pattern: /^(generate|setup|insert|utils)/i,
    description: '유틸리티 스크립트'
  }
};

// 각 카테고리 디렉토리 생성
Object.values(categories).forEach(category => {
  if (!fs.existsSync(category.dir)) {
    try {
      fs.mkdirSync(category.dir, { recursive: true });
      logContent += `디렉토리 생성됨: ${category.dir}\n`;
    } catch (err) {
      logContent += `오류: 디렉토리 생성 실패 - ${category.dir} - ${err.message}\n`;
    }
  }
});

// 루트 디렉토리의 JS 파일 목록 가져오기
const rootJsFiles = fs.readdirSync(__dirname)
  .filter(file => file.endsWith('.js') && file !== 'script-organizer.js');

logContent += `\n루트 디렉토리의 JS 파일 수: ${rootJsFiles.length}\n`;

// 각 파일을 적절한 카테고리로 이동
rootJsFiles.forEach(file => {
  let targetCategory = null;

  // 파일명에 따라 카테고리 결정
  for (const [key, category] of Object.entries(categories)) {
    if (category.pattern.test(file)) {
      targetCategory = category;
      break;
    }
  }

  // 기본적으로 utils 카테고리로 분류
  if (!targetCategory) {
    targetCategory = categories.utilsScripts;
  }

  const sourcePath = path.join(__dirname, file);
  const destPath = path.join(targetCategory.dir, file);

  try {
    // 파일이 이미 존재하는지 확인
    if (fs.existsSync(destPath)) {
      const sourceStat = fs.statSync(sourcePath);
      const destStat = fs.statSync(destPath);

      // 대상 파일이 더 최신인 경우 덮어쓰지 않음
      if (destStat.mtime > sourceStat.mtime) {
        logContent += `스킵: ${file} - 대상 위치에 더 최신 버전이 있음\n`;
        return;
      }
    }

    // 파일 복사
    fs.copyFileSync(sourcePath, destPath);
    logContent += `복사됨: ${file} -> ${path.relative(__dirname, destPath)}\n`;
  } catch (err) {
    logContent += `오류: 파일 복사 실패 - ${file} - ${err.message}\n`;
  }
});

// scripts 디렉토리의 JS 파일 중복 정리
const scriptsDir = path.join(__dirname, 'scripts');
const scriptsJsFiles = fs.readdirSync(scriptsDir)
  .filter(file => file.endsWith('.js'));

logContent += `\nscripts 디렉토리의 JS 파일 수: ${scriptsJsFiles.length}\n`;

// scripts 디렉토리의 파일들을 적절한 카테고리로 이동
scriptsJsFiles.forEach(file => {
  let targetCategory = null;

  // 파일명에 따라 카테고리 결정
  for (const [key, category] of Object.entries(categories)) {
    if (category.pattern.test(file)) {
      targetCategory = category;
      break;
    }
  }

  // 기본적으로 utils 카테고리로 분류
  if (!targetCategory) {
    targetCategory = categories.utilsScripts;
  }

  const sourcePath = path.join(scriptsDir, file);
  const destPath = path.join(targetCategory.dir, file);

  try {
    // 파일이 이미 존재하는지 확인
    if (fs.existsSync(destPath)) {
      const sourceStat = fs.statSync(sourcePath);
      const destStat = fs.statSync(destPath);

      // 대상 파일이 더 최신인 경우 덮어쓰지 않음
      if (destStat.mtime > sourceStat.mtime) {
        logContent += `스킵: ${file} - 대상 위치에 더 최신 버전이 있음\n`;
        return;
      }
    }

    // 파일 복사
    fs.copyFileSync(sourcePath, destPath);
    logContent += `복사됨: scripts/${file} -> ${path.relative(__dirname, destPath)}\n`;
  } catch (err) {
    logContent += `오류: 파일 복사 실패 - scripts/${file} - ${err.message}\n`;
  }
});

// 로그 파일 작성
logContent += `\n스크립트 정리 완료: ${new Date().toISOString()}\n`;
fs.writeFileSync(logFile, logContent);

console.log(`스크립트 파일 정리가 완료되었습니다. 로그 파일: ${logFile}`); 