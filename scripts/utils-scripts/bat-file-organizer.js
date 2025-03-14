/**
 * 배치 파일 정리 유틸리티
 * 프로젝트 루트 디렉토리의 BAT 파일들을 scripts/batch-scripts로 복사합니다.
 */
const fs = require('fs');
const path = require('path');

// 로그 파일 설정
const logFile = path.join(__dirname, 'bat-file-organizer.log');
let logContent = `배치 파일 정리 시작: ${new Date().toISOString()}\n\n`;

const batchDir = path.join(__dirname, 'scripts', 'batch-scripts');

// 폴더가 없으면 생성
if (!fs.existsSync(batchDir)) {
  try {
    fs.mkdirSync(batchDir, { recursive: true });
    logContent += `디렉토리 생성됨: ${batchDir}\n`;
  } catch (err) {
    logContent += `오류: 디렉토리 생성 실패 - ${batchDir} - ${err.message}\n`;
  }
}

// 루트 디렉토리의 BAT 파일 목록 가져오기
const rootBatFiles = fs.readdirSync(__dirname)
  .filter(file => file.endsWith('.bat'));

logContent += `\n루트 디렉토리의 BAT 파일 수: ${rootBatFiles.length}\n`;

// 각 BAT 파일을 batch-scripts 폴더로 복사
rootBatFiles.forEach(file => {
  const sourcePath = path.join(__dirname, file);
  const destPath = path.join(batchDir, file);

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

// 로그 파일 작성
logContent += `\n배치 파일 정리 완료: ${new Date().toISOString()}\n`;
fs.writeFileSync(logFile, logContent);

console.log(`배치 파일 정리가 완료되었습니다. 로그 파일: ${logFile}`);