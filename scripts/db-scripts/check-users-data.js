/**
 * 사용자 데이터 확인 스크립트
 * 개발 규칙에 따라 절대 경로 사용 및 결과 파일 저장 방식 적용
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 데이터베이스 경로 설정 (절대 경로)
const dbPath = path.join(__dirname, 'data', 'golf_simulator.db');
console.log('데이터베이스 경로:', dbPath);

// 결과 저장 파일 경로
const resultPath = path.join(__dirname, 'users-data-check.json');

// 현재 시간
const now = new Date();
const timestamp = now.toISOString().replace(/:/g, '-');

// 데이터베이스 연결
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    const errorMsg = `데이터베이스 연결 오류: ${err.message}`;
    console.error(errorMsg);
    
    // 오류 로그 저장
    fs.appendFileSync('db-errors.log', `${timestamp} - ${errorMsg}\n`);
    process.exit(1);
  }
  
  console.log('데이터베이스에 연결되었습니다.');
  
  // 사용자 목록 조회
  db.all(`
    SELECT 
      user_id, 
      username, 
      full_name, 
      email, 
      handicap, 
      target_handicap, 
      phone, 
      join_date,
      status
    FROM users
    ORDER BY user_id
  `, [], (err, rows) => {
    const result = {};
    
    if (err) {
      const errorMsg = `쿼리 오류: ${err.message}`;
      console.error(errorMsg);
      
      // 오류 로그 저장
      fs.appendFileSync('db-errors.log', `${timestamp} - ${errorMsg}\n`);
      
      result.success = false;
      result.error = err.message;
    } else {
      result.success = true;
      result.timestamp = timestamp;
      result.count = rows.length;
      result.users = rows;
      
      // 간단한 콘솔 출력
      console.log(`총 ${rows.length}명의 사용자가 등록되어 있습니다.`);
      console.log('사용자 ID 목록:', rows.map(row => row.user_id).join(', '));
      console.log('사용자명 목록:', rows.map(row => row.username).join(', '));
    }
    
    // 결과를 JSON 파일로 저장
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
    console.log(`사용자 데이터 확인 결과가 ${resultPath} 파일에 저장되었습니다.`);
    
    // 데이터베이스 연결 종료 (리소스 정리)
    db.close((err) => {
      if (err) {
        const errorMsg = `데이터베이스 연결 종료 오류: ${err.message}`;
        console.error(errorMsg);
        fs.appendFileSync('db-errors.log', `${timestamp} - ${errorMsg}\n`);
        return;
      }
      console.log('데이터베이스 연결이 종료되었습니다.');
    });
  });
}); 