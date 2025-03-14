/**
 * 데이터베이스 테이블 정보 확인 스크립트
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 데이터베이스 경로
const DB_PATH = path.resolve(__dirname, './data/golf_simulator.db');
console.log('데이터베이스 경로:', DB_PATH);

// 데이터베이스 연결
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('데이터베이스 연결 오류:', err.message);
    process.exit(1);
  }
  console.log('데이터베이스에 연결되었습니다.');
});

// 테이블 목록 조회
db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
  if (err) {
    console.error('테이블 목록 조회 오류:', err.message);
    db.close();
    return;
  }
  
  console.log('\n데이터베이스의 테이블 목록:');
  tables.forEach(table => {
    console.log(`- ${table.name}`);
  });
  
  // 라운드 테이블의 모든 ID 목록 조회
  db.all("SELECT round_id FROM rounds ORDER BY round_id", [], (err, rounds) => {
    if (err) {
      console.error('라운드 목록 조회 오류:', err.message);
      db.close();
      return;
    }
    
    console.log('\n라운드 ID 목록:');
    if (rounds.length === 0) {
      console.log('- 라운드 데이터가 없습니다.');
    } else {
      rounds.forEach(round => {
        console.log(`- ${round.round_id}`);
      });
    }
    
    // 데이터베이스 연결 종료
    db.close();
  });
}); 