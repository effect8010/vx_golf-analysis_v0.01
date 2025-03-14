/**
 * 새 라운드 생성 스크립트
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

// 새 라운드 생성
const createRound = () => {
  const roundId = 100; // 생성할 라운드 ID
  const userId = 1;   // 사용자 ID
  const courseId = 1; // 코스 ID
  
  // 사용자 ID 존재 여부 확인
  db.get("SELECT user_id FROM users WHERE user_id = ?", [userId], (err, user) => {
    if (err) {
      console.error('사용자 조회 오류:', err.message);
      db.close();
      return;
    }
    
    if (!user) {
      console.error(`ID가 ${userId}인 사용자가 존재하지 않습니다.`);
      // 첫 번째 사용자 정보 확인
      db.get("SELECT user_id FROM users LIMIT 1", [], (err, firstUser) => {
        if (err || !firstUser) {
          console.error('사용자 데이터가 없습니다.');
          db.close();
          return;
        }
        console.log(`대신 ID가 ${firstUser.user_id}인 사용자를 사용합니다.`);
        createRoundWithUserAndCourse(roundId, firstUser.user_id, courseId);
      });
      return;
    }
    
    // 코스 ID 존재 여부 확인
    db.get("SELECT course_id FROM golf_courses WHERE course_id = ?", [courseId], (err, course) => {
      if (err) {
        console.error('코스 조회 오류:', err.message);
        db.close();
        return;
      }
      
      if (!course) {
        console.error(`ID가 ${courseId}인 코스가 존재하지 않습니다.`);
        // 첫 번째 코스 정보 확인
        db.get("SELECT course_id FROM golf_courses LIMIT 1", [], (err, firstCourse) => {
          if (err || !firstCourse) {
            console.error('코스 데이터가 없습니다.');
            db.close();
            return;
          }
          console.log(`대신 ID가 ${firstCourse.course_id}인 코스를 사용합니다.`);
          createRoundWithUserAndCourse(roundId, userId, firstCourse.course_id);
        });
        return;
      }
      
      createRoundWithUserAndCourse(roundId, userId, courseId);
    });
  });
};

// 유효한 사용자 ID와 코스 ID로 라운드 생성
const createRoundWithUserAndCourse = (roundId, userId, courseId) => {
  const sql = `
    INSERT INTO rounds (
      round_id, user_id, course_id, first_course_number, second_course_number, 
      round_date, round_time, total_score, total_putts, 
      fairways_hit, fairways_total, greens_hit, greens_total, 
      penalties, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;
  
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const now = new Date().toISOString().split('T')[1].split('.')[0]; // HH:MM:SS
  
  const params = [
    roundId,
    userId,
    courseId,
    1, // first_course_number
    2, // second_course_number
    today, // round_date
    now, // round_time
    85, // total_score
    30, // total_putts
    7, // fairways_hit
    14, // fairways_total
    10, // greens_hit
    18, // greens_total
    4, // penalties
    1  // status (완료)
  ];
  
  db.run(sql, params, function(err) {
    if (err) {
      console.error('라운드 생성 오류:', err.message);
      db.close();
      return;
    }
    
    console.log(`새 라운드가 생성되었습니다. ID: ${roundId}`);
    console.log(`- 사용자 ID: ${userId}`);
    console.log(`- 코스 ID: ${courseId}`);
    console.log(`- 날짜: ${today}`);
    console.log(`- 시간: ${now}`);
    console.log(`- 총 스코어: 85`);
    
    // 데이터베이스 연결 종료
    db.close();
  });
};

// 스크립트 실행
createRound(); 