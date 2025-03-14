/**
 * 데이터베이스 내용 확인 스크립트
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 데이터베이스 연결
const dbPath = path.join(__dirname, '..', 'data', 'golf_simulator.db');
const db = new sqlite3.Database(dbPath);

console.log('데이터베이스 내용을 확인합니다...');

// 테이블 목록 확인
db.all("SELECT name FROM sqlite_master WHERE type='table';", (err, tables) => {
  if (err) {
    console.error('테이블 목록 조회 중 오류가 발생했습니다:', err);
    db.close();
    return;
  }
  
  console.log('데이터베이스 테이블 목록:');
  tables.forEach(table => {
    console.log(`- ${table.name}`);
  });
  console.log('');
  
  // 사용자 수 확인
  db.get('SELECT COUNT(*) as count FROM users', (err, result) => {
    if (err) {
      console.error('사용자 수 조회 중 오류가 발생했습니다:', err);
    } else {
      console.log(`사용자 테이블: ${result.count}명의 사용자`);
    }
    
    // 사용자 목록 확인
    db.all('SELECT user_id, username, full_name, email, handicap FROM users', (err, users) => {
      if (err) {
        console.error('사용자 조회 중 오류가 발생했습니다:', err);
      } else {
        console.log('사용자 목록:');
        users.forEach(user => {
          console.log(`  ID: ${user.user_id}, 이름: ${user.full_name}, 핸디캡: ${user.handicap}`);
        });
        console.log('');
      }
      
      // 골프 코스 수 확인
      db.get('SELECT COUNT(*) as count FROM golf_courses', (err, result) => {
        if (err) {
          console.error('골프 코스 수 조회 중 오류가 발생했습니다:', err);
        } else {
          console.log(`골프 코스 테이블: ${result.count}개의 코스`);
        }
        
        // 골프 코스 목록 확인
        db.all('SELECT course_id, course_name FROM golf_courses', (err, courses) => {
          if (err) {
            console.error('골프 코스 조회 중 오류가 발생했습니다:', err);
          } else {
            console.log('골프 코스 목록:');
            courses.forEach(course => {
              console.log(`  ID: ${course.course_id}, 이름: ${course.course_name}`);
            });
            console.log('');
          }
          
          // 라운드 수 확인
          db.get('SELECT COUNT(*) as count FROM rounds', (err, result) => {
            if (err) {
              console.error('라운드 수 조회 중 오류가 발생했습니다:', err);
            } else {
              console.log(`라운드 테이블: ${result.count}개의 라운드`);
              
              // 라운드별 홀 데이터 수 확인
              db.get('SELECT COUNT(*) as count FROM round_holes', (err, result) => {
                if (err) {
                  console.error('라운드 홀 수 조회 중 오류가 발생했습니다:', err);
                } else {
                  console.log(`라운드 홀 테이블: ${result.count}개의 홀 데이터`);
                }
                
                // 샘플 라운드 데이터 확인
                db.all(`
                  SELECT r.round_id, u.username, gc.course_name, r.round_date, r.total_score
                  FROM rounds r
                  JOIN users u ON r.user_id = u.user_id
                  JOIN golf_courses gc ON r.course_id = gc.course_id
                  LIMIT 5
                `, (err, rounds) => {
                  if (err) {
                    console.error('라운드 데이터 조회 중 오류가 발생했습니다:', err);
                  } else {
                    console.log('샘플 라운드 데이터:');
                    rounds.forEach(round => {
                      console.log(`  ID: ${round.round_id}, 사용자: ${round.username}, 코스: ${round.course_name}, 날짜: ${round.round_date}, 스코어: ${round.total_score}`);
                    });
                  }
                  
                  // 데이터베이스 연결 종료
                  db.close();
                });
              });
            }
          });
        });
      });
    });
  });
}); 