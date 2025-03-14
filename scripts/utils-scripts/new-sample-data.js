/**
 * 골프 시뮬레이터 앱 샘플 데이터 생성 스크립트
 * 
 * 이 스크립트는 다음과 같은 샘플 데이터를 생성합니다:
 * - 사용자 3명
 * - 골프장 5개
 * - 라운드 30개
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

console.log('샘플 데이터 생성을 시작합니다...');

// 데이터베이스 경로 설정
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const dbPath = path.join(dataDir, 'golf_simulator.db');

// 기존 DB 파일 삭제 (있는 경우)
if (fs.existsSync(dbPath)) {
  const backupPath = `${dbPath}.backup.${new Date().toISOString().replace(/:/g, '-')}`;
  console.log(`기존 데이터베이스 파일을 백업합니다: ${backupPath}`);
  fs.copyFileSync(dbPath, backupPath);
  fs.unlinkSync(dbPath);
  console.log('기존 데이터베이스 파일이 삭제되었습니다.');
}

// 데이터베이스 연결
const db = new sqlite3.Database(dbPath);

// 스키마 파일 읽기
const schemaPath = path.join(__dirname, 'simple-schema.sql');
const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

// 스키마 적용
db.serialize(() => {
  console.log('스키마를 적용 중입니다...');
  
  // 트랜잭션 시작
  db.run('BEGIN TRANSACTION');
  
  // 스키마 실행
  db.exec(schemaSQL, (err) => {
    if (err) {
      console.error('스키마 적용 중 오류가 발생했습니다:', err);
      console.error(err);
      db.run('ROLLBACK');
      db.close();
      return;
    }
    
    console.log('스키마가 성공적으로 적용되었습니다.');
    
    // 사용자 데이터 추가
    console.log('사용자 3명을 추가 중입니다...');
    const users = [
      ['kim', bcrypt.hashSync('password123', 10), '김철수', 'kim@example.com', '010-1234-5678', 12.5],
      ['lee', bcrypt.hashSync('password123', 10), '이영희', 'lee@example.com', '010-9876-5432', 18.2],
      ['park', bcrypt.hashSync('password123', 10), '박지민', 'park@example.com', '010-5555-7777', 8.7]
    ];
    
    const userIds = [];
    
    // 사용자 추가
    const insertUserStmt = db.prepare('INSERT INTO users (username, password_hash, full_name, email, phone, handicap, status) VALUES (?, ?, ?, ?, ?, ?, 1)');
    
    for (const user of users) {
      insertUserStmt.run(user, function(err) {
        if (err) {
          console.error('사용자 추가 중 오류가 발생했습니다:', err);
        } else {
          console.log(`사용자가 추가되었습니다: ${user[0]}, ID: ${this.lastID}`);
          userIds.push(this.lastID);
        }
      });
    }
    
    insertUserStmt.finalize();
    
    // 골프 코스 데이터 추가
    console.log('골프 코스 5개를 추가 중입니다...');
    const courses = [
      ['송도 CC', 'songdo_cc', 2, 1, 3, 3, '인천 송도에 위치한 골프 코스입니다.', 72, '2023-01-01'],
      ['제주 오션 CC', 'jeju_ocean_cc', 2, 1, 4, 4, '제주도 해안가에 위치한 바다 전망의 골프 코스입니다.', 72, '2023-02-15'],
      ['파인밸리 CC', 'pine_valley_cc', 2, 1, 3, 3, '아름다운 소나무 숲과 넓은 페어웨이를 가진 골프 코스입니다.', 72, '2023-03-01'],
      ['레이크힐스 CC', 'lake_hills_cc', 2, 1, 2, 2, '아름다운 호수가 있는 경관 좋은 골프 코스입니다.', 72, '2023-03-15'],
      ['블루마운틴 CC', 'blue_mountain_cc', 2, 1, 4, 3, '산악 지형의 도전적인 골프 코스입니다.', 72, '2023-04-01']
    ];
    
    const courseIds = [];
    const courseNames = {
      0: ['동코스', '서코스'],
      1: ['바다코스', '산코스'],
      2: ['에이코스', '비코스'],
      3: ['레이크코스', '힐코스'],
      4: ['블루코스', '마운틴코스']
    };
    
    // 골프 코스 추가
    const insertCourseStmt = db.prepare('INSERT INTO golf_courses (course_name, resource_name, course_count, country_code, course_difficulty, green_difficulty, description, average_par, release_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    
    for (let i = 0; i < courses.length; i++) {
      insertCourseStmt.run(courses[i], function(err) {
        if (err) {
          console.error('코스 추가 중 오류가 발생했습니다:', err);
        } else {
          const courseId = this.lastID;
          console.log(`코스가 추가되었습니다: ${courses[i][0]}, ID: ${courseId}`);
          courseIds.push(courseId);
          
          // 코스 상세 정보 추가
          const courseCount = courses[i][2];
          for (let j = 0; j < courseCount; j++) {
            if (j < courseNames[i].length) {
              db.run('INSERT INTO course_details (course_id, course_number, course_name) VALUES (?, ?, ?)',
                [courseId, j + 1, courseNames[i][j]],
                function(err) {
                  if (err) {
                    console.error('코스 상세 정보 추가 중 오류가 발생했습니다:', err);
                  } else {
                    console.log(`코스 상세 정보가 추가되었습니다: ${courseNames[i][j]}`);
                  }
                }
              );
              
              // 각 코스에 9개의 홀 추가
              for (let h = 1; h <= 9; h++) {
                const par = h % 3 === 0 ? 5 : (h % 3 === 1 ? 4 : 3);
                db.run('INSERT INTO holes (course_id, course_number, hole_number, par, hole_type, back_distance, champion_distance, front_distance, senior_distance, lady_distance, hole_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                  [
                    courseId,
                    j + 1,
                    h,
                    par,
                    par,
                    par === 3 ? 180 + h * 5 : (par === 4 ? 380 + h * 10 : 520 + h * 15),
                    par === 3 ? 170 + h * 5 : (par === 4 ? 360 + h * 10 : 500 + h * 15),
                    par === 3 ? 160 + h * 5 : (par === 4 ? 340 + h * 10 : 480 + h * 15),
                    par === 3 ? 150 + h * 5 : (par === 4 ? 320 + h * 10 : 460 + h * 15),
                    par === 3 ? 140 + h * 5 : (par === 4 ? 300 + h * 10 : 440 + h * 15),
                    h
                  ],
                  function(err) {
                    if (err) {
                      console.error('홀 정보 추가 중 오류가 발생했습니다:', err);
                    }
                  }
                );
              }
            }
          }
        }
      });
    }
    
    insertCourseStmt.finalize();
    
    // 라운드 데이터와 홀별 결과 추가
    db.run('COMMIT', (err) => {
      if (err) {
        console.error('트랜잭션 커밋 중 오류가 발생했습니다:', err);
        db.run('ROLLBACK');
        db.close();
        return;
      }

      // 라운드 데이터 별도 트랜잭션으로 생성
      setTimeout(() => {
        createRounds(db, userIds, courseIds);
      }, 1000);
    });
  });
});

// 라운드 데이터 생성 함수
function createRounds(db, userIds, courseIds) {
  console.log('라운드 데이터 30개를 추가 중입니다...');
  
  if (userIds.length === 0 || courseIds.length === 0) {
    console.error('사용자 또는 코스 ID가 없습니다.');
    db.close();
    return;
  }
  
  const weatherConditions = ['맑음', '흐림', '바람많음', '소나기', '더움', '선선함'];
  
  db.run('BEGIN TRANSACTION');
  
  // 30개의 라운드 추가
  let roundsAdded = 0;
  const totalRounds = 30;
  
  for (let i = 0; i < totalRounds; i++) {
    // 각 유저가 비슷한 수의 라운드를 갖도록 분배
    const userIndex = i % userIds.length;
    const userId = userIds[userIndex];
    
    // 골프 코스를 균등하게 분배
    const courseIndex = i % courseIds.length;
    const courseId = courseIds[courseIndex];
    
    // 코스 정보 가져오기
    db.get('SELECT course_count FROM golf_courses WHERE course_id = ?', [courseId], (err, courseInfo) => {
      if (err) {
        console.error('코스 정보 조회 중 오류가 발생했습니다:', err);
        return;
      }
      
      if (!courseInfo) {
        console.error(`코스 ID ${courseId}에 대한 정보를 찾을 수 없습니다.`);
        return;
      }
      
      // 랜덤 코스 번호 선택
      const firstCourseNumber = Math.floor(Math.random() * courseInfo.course_count) + 1;
      let secondCourseNumber = null;
      
      // 두 번째 코스는 첫 번째 코스와 다르게 선택
      if (courseInfo.course_count > 1) {
        do {
          secondCourseNumber = Math.floor(Math.random() * courseInfo.course_count) + 1;
        } while (secondCourseNumber === firstCourseNumber);
      }
      
      // 랜덤 날짜 생성 (최근 6개월 이내)
      const today = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(today.getMonth() - 6);
      const roundDate = new Date(sixMonthsAgo.getTime() + Math.random() * (today.getTime() - sixMonthsAgo.getTime()));
      
      // 날짜 및 시간 포맷
      const formattedDate = roundDate.toISOString().split('T')[0];
      const hours = Math.floor(Math.random() * 12) + 7;
      const minutes = Math.floor(Math.random() * 60);
      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
      
      // 라운드 통계
      const fairwaysTotal = 14;
      const fairwaysHit = Math.floor(Math.random() * (fairwaysTotal - 4)) + 4;
      const greensTotal = 18;
      const greensHit = Math.floor(Math.random() * (greensTotal - 6)) + 6;
      const totalPutts = Math.floor(Math.random() * 15) + 24;
      const penalties = Math.floor(Math.random() * 7);
      
      // 스코어 유형
      const birdies = Math.floor(Math.random() * 6);
      const pars = Math.floor(Math.random() * 8) + 5;
      const bogeys = Math.floor(Math.random() * 8) + 3;
      const doublesOrWorse = 18 - birdies - pars - bogeys;
      
      // 총 스코어 계산
      const totalScore = 72 + bogeys + (doublesOrWorse * 2) - birdies;
      
      // 라운드 옵션
      const greenSpeed = Math.floor(Math.random() * 5) + 1;
      const playerLevel = Math.floor(Math.random() * 4) + 1;
      const windSpeed = Math.floor(Math.random() * 3) + 1;
      const concedeDistance = Math.floor(Math.random() * 5) + 1;
      const mulliganAllowed = Math.floor(Math.random() * 6);
      const mulliganUsed = Math.floor(Math.random() * (mulliganAllowed + 1));
      const weatherCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
      const temperature = Math.floor(Math.random() * 21) + 15;
      
      // 라운드 데이터 추가
      db.run(`
        INSERT INTO rounds (
          user_id, course_id, first_course_number, second_course_number,
          round_date, round_time, total_score, total_putts,
          fairways_hit, fairways_total, greens_hit, greens_total,
          penalties, birdies, pars, bogeys, doubles_or_worse,
          green_speed, player_level, wind_speed, concede_distance,
          mulligan_allowed, mulligan_used, weather_condition,
          temperature, status, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        userId, courseId, firstCourseNumber, secondCourseNumber,
        formattedDate, formattedTime, totalScore, totalPutts,
        fairwaysHit, fairwaysTotal, greensHit, greensTotal,
        penalties, birdies, pars, bogeys, doublesOrWorse,
        greenSpeed, playerLevel, windSpeed, concedeDistance,
        mulliganAllowed, mulliganUsed, weatherCondition,
        temperature, 1 // 완료 상태
      ], function(err) {
        if (err) {
          console.error('라운드 추가 중 오류가 발생했습니다:', err);
          return;
        }
        
        console.log(`라운드가 추가되었습니다: 유저 ID ${userId}, 코스 ID ${courseId}, 라운드 ID ${this.lastID}`);
        const roundId = this.lastID;
        
        // 홀별 결과 추가
        db.all('SELECT * FROM holes WHERE course_id = ? AND course_number = ?', [courseId, firstCourseNumber], (err, holes) => {
          if (err) {
            console.error('홀 정보 조회 중 오류가 발생했습니다:', err);
            return;
          }
          
          for (const hole of holes) {
            const par = hole.par;
            
            // 결과 타입과 스코어 결정
            let resultType, score;
            const rand = Math.random();
            
            if (rand < 0.1) {
              resultType = 1; // 버디 이하
              score = par - 1;
            } else if (rand < 0.5) {
              resultType = 2; // 파
              score = par;
            } else if (rand < 0.8) {
              resultType = 3; // 보기
              score = par + 1;
            } else {
              resultType = 4; // 더블보기 이상
              score = par + 2;
            }
            
            // 퍼팅 수
            const putts = Math.floor(Math.random() * 3) + 1;
            
            // 페어웨이, 그린 적중 여부
            const fairwayHit = hole.par !== 3 ? Math.random() > 0.4 : null; // 파3 홀은 페어웨이 적용 안함
            const greenHit = Math.random() > 0.4;
            
            // 그린 적중 (GIR) 여부
            const greenInRegulation = par - 2 >= score - putts;
            
            // 샌드 세이브, 업앤다운 여부
            const sandSave = !greenHit && putts <= 2 ? Math.random() > 0.5 : null;
            const upAndDown = !greenHit && putts <= 2 ? Math.random() > 0.5 : null;
            
            // 페널티
            const penalties = resultType > 3 ? Math.floor(Math.random() * 2) : 0;
            
            // 첫 퍼팅 거리 (인치)
            const puttDistanceFirst = greenHit ? Math.floor(Math.random() * 540) + 60 : Math.floor(Math.random() * 24) + 12;
            
            // 홀별 결과 추가
            db.run(`
              INSERT INTO round_holes (
                round_id, course_number, hole_number, par, score,
                putts, fairway_hit, green_hit, green_in_regulation,
                sand_save, up_and_down, penalties, putt_distance_first,
                result_type
              )
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              roundId, firstCourseNumber, hole.hole_number, par, score,
              putts, fairwayHit, greenHit, greenInRegulation,
              sandSave, upAndDown, penalties, puttDistanceFirst,
              resultType
            ]);
          }
        });
        
        // 두 번째 코스가 있는 경우
        if (secondCourseNumber) {
          db.all('SELECT * FROM holes WHERE course_id = ? AND course_number = ?', [courseId, secondCourseNumber], (err, holes) => {
            if (err) {
              console.error('홀 정보 조회 중 오류가 발생했습니다:', err);
              return;
            }
            
            for (const hole of holes) {
              const par = hole.par;
              
              // 결과 타입과 스코어 결정
              let resultType, score;
              const rand = Math.random();
              
              if (rand < 0.1) {
                resultType = 1; // 버디 이하
                score = par - 1;
              } else if (rand < 0.5) {
                resultType = 2; // 파
                score = par;
              } else if (rand < 0.8) {
                resultType = 3; // 보기
                score = par + 1;
              } else {
                resultType = 4; // 더블보기 이상
                score = par + 2;
              }
              
              // 퍼팅 수
              const putts = Math.floor(Math.random() * 3) + 1;
              
              // 페어웨이, 그린 적중 여부
              const fairwayHit = hole.par !== 3 ? Math.random() > 0.4 : null; // 파3 홀은 페어웨이 적용 안함
              const greenHit = Math.random() > 0.4;
              
              // 그린 적중 (GIR) 여부
              const greenInRegulation = par - 2 >= score - putts;
              
              // 샌드 세이브, 업앤다운 여부
              const sandSave = !greenHit && putts <= 2 ? Math.random() > 0.5 : null;
              const upAndDown = !greenHit && putts <= 2 ? Math.random() > 0.5 : null;
              
              // 페널티
              const penalties = resultType > 3 ? Math.floor(Math.random() * 2) : 0;
              
              // 첫 퍼팅 거리 (인치)
              const puttDistanceFirst = greenHit ? Math.floor(Math.random() * 540) + 60 : Math.floor(Math.random() * 24) + 12;
              
              // 홀별 결과 추가
              db.run(`
                INSERT INTO round_holes (
                  round_id, course_number, hole_number, par, score,
                  putts, fairway_hit, green_hit, green_in_regulation,
                  sand_save, up_and_down, penalties, putt_distance_first,
                  result_type
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `, [
                roundId, secondCourseNumber, hole.hole_number, par, score,
                putts, fairwayHit, greenHit, greenInRegulation,
                sandSave, upAndDown, penalties, puttDistanceFirst,
                resultType
              ]);
            }
          });
        }
        
        roundsAdded++;
        
        // 모든 라운드가 추가되었는지 확인
        if (roundsAdded >= totalRounds) {
          db.run('COMMIT', (err) => {
            if (err) {
              console.error('트랜잭션 커밋 중 오류가 발생했습니다:', err);
              db.run('ROLLBACK');
            } else {
              console.log(`총 ${roundsAdded}개의 라운드 데이터가 추가되었습니다.`);
            }
            
            // 데이터베이스 연결 종료
            db.close();
            console.log('샘플 데이터 생성이 완료되었습니다!');
          });
        }
      });
    });
  }
} 