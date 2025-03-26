/**
 * 골프 시뮬레이터 데이터 처리 스크립트
 * 
 * 골프 라운드 데이터를 처리하여 다양한 통계 데이터를 생성하는 스크립트입니다.
 * 빌드 시점에 실행되어 정적 JSON 파일로 결과를 저장합니다.
 */

const fs = require('fs');
const path = require('path');

// 경로 설정
const DATA_DIR = path.join(__dirname, '../client/public/data');
const ROUNDS_FILE = path.join(DATA_DIR, 'rounds.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// 디렉토리 생성
function ensureDirectoriesExist() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log(`디렉토리 생성: ${DATA_DIR}`);
  }
}

// 데이터 생성
function generateData() {
  const users = {
    users: [
      {
        id: "kim",
        username: "kim",
        password: "kim",
        name: "김골프",
        email: "kim@example.com",
        role: "user",
        created_at: "2024-03-26T00:00:00.000Z",
        last_login: "2024-03-26T00:00:00.000Z"
      }
    ]
  };

  const rounds = {
    rounds: [
      {
        id: 1,
        user_id: "kim",
        date: "2024-03-26",
        course: "스크린골프장A",
        total_score: 82,
        fairway_hit: 8,
        green_hit: 10,
        putts: 32,
        created_at: "2024-03-26T00:00:00.000Z"
      }
    ]
  };

  // 데이터 저장
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  console.log(`사용자 데이터 저장: ${USERS_FILE}`);

  fs.writeFileSync(ROUNDS_FILE, JSON.stringify(rounds, null, 2));
  console.log(`라운드 데이터 저장: ${ROUNDS_FILE}`);
}

// 메인 실행
function main() {
  ensureDirectoriesExist();
  generateData();
}

main(); 