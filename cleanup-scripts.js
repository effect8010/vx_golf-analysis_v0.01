/**
 * 남은 스크립트 파일 정리 유틸리티
 * 프로젝트 루트에 남아있는 모든 JS, BAT 파일 및 관련 JSON 파일을 utils-scripts 폴더로 이동시킵니다.
 */
const fs = require('fs');
const path = require('path');

// 로그 파일 설정
const logFile = path.join(__dirname, 'cleanup-scripts.log');
let logContent = `최종 스크립트 정리 시작: ${new Date().toISOString()}\n\n`;

// 이동할 경로 설정
const utilsScriptsDir = path.join(__dirname, 'scripts', 'utils-scripts');
const batchScriptsDir = path.join(__dirname, 'scripts', 'batch-scripts');
const dataDir = path.join(__dirname, 'data');

// 경로가 없으면 생성
[utilsScriptsDir, batchScriptsDir, dataDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      logContent += `디렉토리 생성됨: ${dir}\n`;
    } catch (err) {
      logContent += `오류: 디렉토리 생성 실패 - ${dir} - ${err.message}\n`;
    }
  }
});

// 무시할 파일 목록
const ignoreFiles = [
  'package.json', 
  'package-lock.json', 
  'README.md', 
  '.env', 
  '.gitignore',
  'golf-simulator-analysis-plan.md',
  'cleanup-scripts.js'
];

// 루트 디렉토리의 파일 목록 가져오기
const rootFiles = fs.readdirSync(__dirname)
  .filter(file => {
    // 디렉토리 무시
    if (fs.statSync(path.join(__dirname, file)).isDirectory()) {
      return false;
    }
    
    // 무시할 파일 검사
    if (ignoreFiles.includes(file)) {
      return false;
    }
    
    // 로그 파일 검사
    if (file.endsWith('.log')) {
      return true;
    }
    
    // JS 파일 검사
    if (file.endsWith('.js')) {
      return true;
    }
    
    // BAT 파일 검사
    if (file.endsWith('.bat')) {
      return true;
    }
    
    // JSON 파일 검사
    if (file.endsWith('.json')) {
      return true;
    }
    
    return false;
  });

logContent += `\n처리할 파일 수: ${rootFiles.length}\n`;

// 각 파일을 적절한 폴더로 이동
rootFiles.forEach(file => {
  const sourcePath = path.join(__dirname, file);
  let destPath;
  
  // 파일 유형에 따라 대상 경로 결정
  if (file.endsWith('.bat')) {
    destPath = path.join(batchScriptsDir, file);
  } else if (file.endsWith('.json')) {
    destPath = path.join(dataDir, file);
  } else {
    destPath = path.join(utilsScriptsDir, file);
  }
  
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
    
    // 원본 파일 삭제
    fs.unlinkSync(sourcePath);
    logContent += `삭제됨: ${file}\n`;
  } catch (err) {
    logContent += `오류: 파일 처리 실패 - ${file} - ${err.message}\n`;
  }
});

// 로그 파일 작성
logContent += `\n최종 스크립트 정리 완료: ${new Date().toISOString()}\n`;
fs.writeFileSync(logFile, logContent);

console.log(`최종 스크립트 정리가 완료되었습니다. 로그 파일: ${logFile}`); 