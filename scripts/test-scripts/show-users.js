/**
 * 사용자 목록을 표시하는 스크립트
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 데이터베이스 경로
const DB_PATH = path.resolve(__dirname, './data/golf_simulator.db');
console.log(`데이터베이스 경로: ${DB_PATH}`);

// 데이터베이스 연결
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error(`데이터베이스 연결 오류: ${err.message}`);
    process.exit(1);
  }
  console.log('데이터베이스에 연결되었습니다.');
});

// 사용자 목록 조회
db.all('SELECT user_id, username, full_name, email, handicap FROM users', (err, users) => {
  if (err) {
    console.error(`사용자 조회 오류: ${err.message}`);
    db.close();
    return;
  }
  
  console.log('\n===== 사용자 목록 =====');
  console.log('총 사용자 수:', users.length);
  console.log('------------------------');
  
  users.forEach(user => {
    console.log(`ID: ${user.user_id}, 계정명: ${user.username}, 이름: ${user.full_name}`);
    console.log(`이메일: ${user.email}, 핸디캡: ${user.handicap}`);
    console.log(`로그인 정보: ID - ${user.username}, 비밀번호 - ${user.username}`);
    console.log('------------------------');
  });
  
  // 데이터베이스 연결 종료
  db.close((err) => {
    if (err) {
      console.error(`데이터베이스 연결 종료 오류: ${err.message}`);
    } else {
      console.log('데이터베이스 연결이 종료되었습니다.');
    }
  });
}); 