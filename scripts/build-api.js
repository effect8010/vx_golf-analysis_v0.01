/**
 * API 응답 생성 스크립트
 */

const fs = require('fs');
const path = require('path');

// 경로 설정
const DATA_DIR = path.join(__dirname, '../client/public/data');
const API_DIR = path.join(__dirname, '../client/public/api/v1');

// 디렉토리 생성
function ensureDirectoriesExist() {
  if (!fs.existsSync(API_DIR)) {
    fs.mkdirSync(API_DIR, { recursive: true });
    console.log(`디렉토리 생성: ${API_DIR}`);
  }
}

// API 응답 생성
function generateApiResponses() {
  // users.json 복사
  const usersFile = path.join(DATA_DIR, 'users.json');
  if (fs.existsSync(usersFile)) {
    const usersApiFile = path.join(API_DIR, 'users.json');
    fs.copyFileSync(usersFile, usersApiFile);
    console.log(`API 응답 생성: ${usersApiFile}`);
  }

  // rounds.json 복사
  const roundsFile = path.join(DATA_DIR, 'rounds.json');
  if (fs.existsSync(roundsFile)) {
    const roundsApiFile = path.join(API_DIR, 'rounds.json');
    fs.copyFileSync(roundsFile, roundsApiFile);
    console.log(`API 응답 생성: ${roundsApiFile}`);
  }
}

// 메인 실행
function main() {
  ensureDirectoriesExist();
  generateApiResponses();
}

main();