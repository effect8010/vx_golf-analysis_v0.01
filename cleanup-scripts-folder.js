/**
 * scripts 폴더 내 스크립트 파일 정리 유틸리티
 * scripts 폴더 안에 남아있는 JS, SQL 파일들을 적절한 하위 폴더로 이동시킵니다.
 */
const fs = require('fs');
const path = require('path');

// 로그 파일 설정
const logFile = path.join(__dirname, 'cleanup-scripts-folder.log');
let logContent = `scripts 폴더 정리 시작: ${new Date().toISOString()}\n\n`;

// 스크립트 폴더 경로
const scriptsDir = path.join(__dirname, 'scripts');

// 세부 분류 폴더
const categories = {
  dbScripts: {
    dir: path.join(scriptsDir, 'db-scripts'),
    pattern: /^(create|update|remove|check|schema|init-db|db|database|sample-data)/i
  },
  testScripts: {
    dir: path.join(scriptsDir, 'test-scripts'),
    pattern: /^(test|simple|login|check)/i
  },
  utilsScripts: {
    dir: path.join(scriptsDir, 'utils-scripts'),
    pattern: /^(generate|setup|insert|utils)/i
  }
};

// scripts 디렉토리의 파일 목록 가져오기
const scriptsFiles = fs.readdirSync(scriptsDir)
  .filter(file => {
    // 디렉토리 무시
    if (fs.statSync(path.join(scriptsDir, file)).isDirectory()) {
      return false;
    }
    
    // 스크립트 파일만 처리
    return file.endsWith('.js') || file.endsWith('.sql');
  });

logContent += `scripts 폴더 내 처리할 파일 수: ${scriptsFiles.length}\n`;

// 각 파일을 적절한 카테고리로 이동
scriptsFiles.forEach(file => {
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
    logContent += `복사됨: ${file} -> ${path.relative(scriptsDir, destPath)}\n`;
    
    // 원본 파일 삭제
    fs.unlinkSync(sourcePath);
    logContent += `삭제됨: ${file}\n`;
  } catch (err) {
    logContent += `오류: 파일 처리 실패 - ${file} - ${err.message}\n`;
  }
});

// 로그 파일 작성
logContent += `\nscripts 폴더 정리 완료: ${new Date().toISOString()}\n`;
fs.writeFileSync(logFile, logContent);

console.log(`scripts 폴더 정리가 완료되었습니다. 로그 파일: ${logFile}`); 