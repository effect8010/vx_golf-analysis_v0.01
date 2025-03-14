/**
 * 사용자 정보 확인 스크립트
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// 데이터베이스 연결
const dbPath = path.join(__dirname, '..', 'data', 'golf_simulator.db');
const db = new sqlite3.Database(dbPath);

console.log('데이터베이스 사용자 정보를 확인합니다...');

// 특정 사용자 정보 확인
const username = 'kim';

db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
  if (err) {
    console.error('사용자 조회 중 오류가 발생했습니다:', err);
    db.close();
    return;
  }
  
  if (!user) {
    console.log(`"${username}" 사용자를 찾을 수 없습니다.`);
  } else {
    console.log('사용자 정보:');
    console.log(`ID: ${user.user_id}`);
    console.log(`사용자명: ${user.username}`);
    console.log(`이름: ${user.full_name}`);
    console.log(`이메일: ${user.email}`);
    console.log(`비밀번호 해시: ${user.password_hash}`);
    console.log(`상태: ${user.status}`);
    
    // 비밀번호 확인
    const testPassword = 'password123';
    const passwordMatch = bcrypt.compareSync(testPassword, user.password_hash);
    console.log(`비밀번호 일치 여부: ${passwordMatch ? '일치' : '불일치'}`);
  }
  
  // 데이터베이스 연결 종료
  db.close();
}); 