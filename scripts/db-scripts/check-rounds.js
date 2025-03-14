const sqlite3 = require('sqlite3').verbose();

// 데이터베이스 연결
const db = new sqlite3.Database('./data/golf_simulator.db');
console.log('[INFO] 데이터베이스 연결 성공');

// 특정 사용자(kim, user_id=1)의 라운드 데이터 조회
db.all('SELECT * FROM rounds WHERE user_id = 1', (err, kimRounds) => {
  if (err) {
    console.error('kim 사용자 라운드 데이터 조회 오류:', err);
  } else {
    console.log('\n=== kim(user_id=1)의 라운드 데이터 ===');
    if (kimRounds.length === 0) {
      console.log('kim 사용자의 라운드 데이터가 없습니다.');
    } else {
      console.log(`총 ${kimRounds.length}개의 라운드 데이터가 있습니다.`);
      console.log(kimRounds);
    }
  }
  
  // 모든 라운드 데이터 개수 확인
  db.get('SELECT COUNT(*) as count FROM rounds', (err, result) => {
    if (err) {
      console.error('라운드 데이터 개수 조회 오류:', err);
    } else {
      console.log(`\n전체 라운드 데이터 개수: ${result.count}개`);
    }
    
    // 사용자별 라운드 데이터 개수 확인
    db.all('SELECT user_id, COUNT(*) as count FROM rounds GROUP BY user_id', (err, userCounts) => {
      if (err) {
        console.error('사용자별 라운드 데이터 개수 조회 오류:', err);
      } else {
        console.log('\n=== 사용자별 라운드 데이터 개수 ===');
        userCounts.forEach(user => {
          console.log(`사용자 ID ${user.user_id}: ${user.count}개의 라운드 데이터`);
        });
      }
      
      // 데이터베이스 연결 종료
      db.close(() => {
        console.log('\n[INFO] 데이터베이스 연결이 종료되었습니다.');
      });
    });
  });
}); 