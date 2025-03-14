/**
 * 데이터베이스 확인 스크립트
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 데이터베이스 파일 경로
const dbPath = path.join(__dirname, '..', 'data', 'golf_simulator.db');

console.log('데이터베이스 테이블 구조를 확인합니다...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('데이터베이스 연결 오류:', err.message);
    process.exit(1);
  }
  console.log(`데이터베이스에 연결되었습니다: ${dbPath}`);
});

// 테이블 목록 조회
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('테이블 목록 조회 오류:', err.message);
    return;
  }
  
  console.log('데이터베이스 테이블 목록:');
  if (tables.length === 0) {
    console.log('  테이블이 없습니다.');
  } else {
    tables.forEach(table => {
      console.log(`  - ${table.name}`);
    });
  }
  
  // users 테이블이 있는지 확인
  const hasUsersTable = tables.some(t => t.name === 'users');
  if (hasUsersTable) {
    // 사용자 정보 조회
    db.all('SELECT * FROM users', (err, users) => {
      if (err) {
        console.error('사용자 조회 오류:', err.message);
      } else {
        console.log('\n사용자 목록:');
        if (users.length === 0) {
          console.log('  사용자가 없습니다.');
        } else {
          users.forEach(user => {
            console.log(`  - ID: ${user.user_id}, 사용자명: ${user.username}, 이름: ${user.full_name}`);
          });
        }
      }
      
      // 연결 종료
      db.close((err) => {
        if (err) {
          console.error('데이터베이스 연결 종료 오류:', err.message);
        }
        console.log('\n데이터베이스 연결이 종료되었습니다.');
      });
    });
  } else {
    console.log('\n사용자 테이블이 없습니다. 데이터베이스 초기화가 필요합니다.');
    
    // 연결 종료
    db.close((err) => {
      if (err) {
        console.error('데이터베이스 연결 종료 오류:', err.message);
      }
      console.log('\n데이터베이스 연결이 종료되었습니다.');
    });
  }
}); 