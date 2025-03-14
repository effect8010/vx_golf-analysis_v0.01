/**
 * 사용자 데이터 확인 스크립트
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 데이터베이스 파일 경로
const dbPath = path.join(__dirname, 'data', 'golf_simulator.db');
console.log('데이터베이스 경로:', dbPath);

// 데이터베이스 연결
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('데이터베이스 연결 오류:', err.message);
    process.exit(1);
  }
  console.log('데이터베이스에 연결되었습니다.');
  
  // 사용자 목록 조회
  db.all(`SELECT user_id, username, full_name, email, handicap, target_handicap, join_date 
          FROM users`, [], (err, rows) => {
    if (err) {
      console.error('쿼리 오류:', err.message);
    } else {
      console.log('사용자 목록:');
      console.table(rows);
      console.log(`총 ${rows.length}명의 사용자가 등록되어 있습니다.`);
    }
    
    // 데이터베이스 연결 종료
    db.close();
  });
}); 