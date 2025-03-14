/**
 * 골프 시뮬레이터 앱 간단한 샘플 데이터 생성 스크립트
 * 
 * 이 스크립트는 다음과 같은 샘플 데이터를 생성합니다:
 * - 사용자 3명
 * - 골프장 10개
 * - 라운드 30개 (각 사용자별로 10번씩)
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
      db.run('ROLLBACK');
      db.close();
      return;
    }
    
    console.log('스키마가 성공적으로 적용되었습니다.');
    
    // 사용자 데이터 추가
    console.log('사용자 3명을 추가 중입니다...');
    const users = [
      ['kim', '$2a$10$X8jV1JzX5ZGbLXXzYXZVJ.5qZK.kfMJHT3blCT.G4mPZ/L4cJXk1e', '김골퍼', 'kim@example.com', 15.5],
      ['lee', '$2a$10$X8jV1JzX5ZGbLXXzYXZVJ.5qZK.kfMJHT3blCT.G4mPZ/L4cJXk1e', '이프로', 'lee@example.com', 8.2],
      ['park', '$2a$10$X8jV1JzX5ZGbLXXzYXZVJ.5qZK.kfMJHT3blCT.G4mPZ/L4cJXk1e', '박에이스', 'park@example.com', 12.7]
    ];
    
    const userIds = [];
    
    // 사용자 추가
    const insertUserStmt = db.prepare('INSERT INTO users (username, password_hash, full_name, email, handicap, status) VALUES (?, ?, ?, ?, ?, 1)');
    
    for (const user of users) {
      insertUserStmt.run(user, function(err) {
        if (err) {
          console.error('사용자 추가 중 오류가 발생했습니다:', err);
        } else {
          userIds.push(this.lastID);
        }
      });
    }
    
    insertUserStmt.finalize();
    
    // 골프 코스 데이터 추가
    console.log('골프 코스 10개를 추가 중입니다...');
    const courses = [
      ['송도 CC', 'songdo_cc', 2, 1, 3, 3, '인천 송도에 위치한 골프 코스입니다.', 72, '2023-01-01'],
      ['제주 오션 CC', 'jeju_ocean_cc', 2, 1, 4, 4, '제주도 해안가에 위치한 바다 전망의 골프 코스입니다.', 72, '2023-02-15'],
      ['파인밸리 CC', 'pine_valley_cc', 2, 1, 3, 3, '아름다운 소나무 숲과 넓은 페어웨이를 가진 골프 코스입니다.', 72, '2023-03-01'],
      ['레이크힐스 CC', 'lake_hills_cc', 2, 1, 2, 2, '아름다운 호수가 있는 경관 좋은 골프 코스입니다.', 72, '2023-03-15'],
      ['블루마운틴 CC', 'blue_mountain_cc', 2, 1, 4, 3, '산악 지형의 도전적인 골프 코스입니다.', 72, '2023-04-01'],
      ['이글포인트 CC', 'eagle_point_cc', 2, 1, 3, 3, '전략적인 플레이가 필요한 다양한 홀을 갖춘 골프 코스입니다.', 72, '2023-04-15'],
      ['선샤인 CC', 'sunshine_cc', 2, 1, 2, 2, '넓은 페어웨이와 평평한 그린이 특징인 골프 코스입니다.', 72, '2023-05-01'],
      ['로얄헤리티지 CC', 'royal_heritage_cc', 3, 1, 5, 4, '27홀로 구성된 넓은 규모의 골프 코스입니다.', 72, '2023-05-15'],
      ['그린파크 CC', 'green_park_cc', 2, 1, 2, 3, '자연친화적 설계의 골프 코스입니다.', 72, '2023-06-01'],
      ['하이랜드 CC', 'highland_cc', 3, 1, 4, 5, '높은 고도에 위치한 시원한 경관의 골프 코스입니다.', 72, '2023-06-15']
    ];
    
    const courseIds = [];
    
    // 골프 코스 추가
    const insertCourseStmt = db.prepare(`
      INSERT INTO golf_courses (
        course_name, resource_name, course_count, country_code, 
        course_difficulty, green_difficulty, description, average_par, release_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const course of courses) {
      insertCourseStmt.run(course, function(err) {
        if (err) {
          console.error('골프 코스 추가 중 오류가 발생했습니다:', err);
        } else {
          courseIds.push(this.lastID);
          
          // 코스 상세 정보 추가 (Out, In 코스)
          const courseId = this.lastID;
          const courseCount = course[2];
          
          for (let i = 1; i <= courseCount; i++) {
            const courseName = i === 1 ? 'Out 코스' : i === 2 ? 'In 코스' : `코스 ${i}`;
            db.run(
              'INSERT INTO course_details (course_id, course_number, course_name) VALUES (?, ?, ?)',
              [courseId, i, courseName],
              (err) => {
                if (err) {
                  console.error('코스 상세 정보 추가 중 오류가 발생했습니다:', err);
                }
              }
            );
            
            // 각 코스의 9개 홀 추가
            for (let hole = 1; hole <= 9; hole++) {
              const par = hole % 3 === 0 ? 3 : hole % 3 === 1 ? 4 : 5;
              const distance = par === 3 ? 150 + Math.floor(Math.random() * 50) :
                              par === 4 ? 350 + Math.floor(Math.random() * 50) :
                              500 + Math.floor(Math.random() * 50);
              
              db.run(
                `INSERT INTO holes (
                  course_id, course_number, hole_number, par, hole_type,
                  back_distance, champion_distance, front_distance, senior_distance, lady_distance,
                  hole_index
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  courseId, i, hole, par, par,
                  distance, distance - 10, distance - 20, distance - 30, distance - 50,
                  (Math.floor(Math.random() * 18) + 1)
                ],
                (err) => {
                  if (err) {
                    console.error('홀 정보 추가 중 오류가 발생했습니다:', err);
                  }
                }
              );
            }
          }
        }
      });
    }
    
    insertCourseStmt.finalize();
    
    // 잠시 대기 후 라운드 데이터 생성
    setTimeout(() => {
      console.log('라운드 데이터 30개를 생성합니다...');
      createRounds(db, userIds, courseIds);
    }, 1000);
  });
});

/**
 * 라운드 데이터 생성
 */
function createRounds(db, userIds, courseIds) {
  // 각 사용자별로 10번의 라운드 생성
  let roundCount = 0;
  
  // 최근 3개월 내의 날짜로 라운드 날짜 설정
  const now = new Date();
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(now.getMonth() - 3);
  
  // 트랜잭션 시작
  db.run('BEGIN TRANSACTION');
  
  userIds.forEach(userId => {
    for (let i = 0; i < 10; i++) {
      // 랜덤 날짜 생성 (최근 3개월)
      const randomDate = new Date(threeMonthsAgo.getTime() + Math.random() * (now.getTime() - threeMonthsAgo.getTime()));
      const formattedDate = randomDate.toISOString().split('T')[0];
      const randomTime = `${String(9 + Math.floor(Math.random() * 9)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
      
      // 랜덤 코스 ID 선택
      const courseId = courseIds[Math.floor(Math.random() * courseIds.length)];
      
      // 랜덤 스코어 생성 (파 72 기준)
      const par = 72;
      const totalScore = par + Math.floor(Math.random() * 20) - 5; // 67-92 사이
      const fairwaysHit = Math.floor(Math.random() * 10) + 4; // 4-14
      const greensHit = Math.floor(Math.random() * 10) + 6; // 6-16
      const totalPutts = 28 + Math.floor(Math.random() * 10); // 28-38
      
      // 버디, 파, 보기 등의 수 계산
      const birdies = Math.floor(Math.random() * 5);
      const pars = Math.floor(Math.random() * 8) + 4;
      const bogeys = Math.floor(Math.random() * 6) + 4;
      const doublesOrWorse = 18 - birdies - pars - bogeys;
      
      // 라운드 데이터 삽입
      db.run(
        `INSERT INTO rounds (
          user_id, course_id, first_course_number, second_course_number, 
          round_date, round_time, total_score, total_putts, 
          fairways_hit, fairways_total, greens_hit, greens_total,
          birdies, pars, bogeys, doubles_or_worse,
          green_speed, player_level, wind_speed, weather_condition,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, courseId, 1, 2, 
          formattedDate, randomTime, totalScore, totalPutts, 
          fairwaysHit, 14, greensHit, 18,
          birdies, pars, bogeys, doublesOrWorse,
          Math.floor(Math.random() * 5) + 1, // 그린 스피드
          Math.floor(Math.random() * 4) + 1, // 플레이어 레벨
          Math.floor(Math.random() * 3) + 1, // 풍속
          ['맑음', '흐림', '비', '눈'][Math.floor(Math.random() * 4)], // 날씨
          1 // 완료 상태
        ],
        function(err) {
          if (err) {
            console.error('라운드 데이터 추가 중 오류가 발생했습니다:', err);
          } else {
            const roundId = this.lastID;
            
            // 홀별 라운드 데이터 생성
            createRoundHoles(db, roundId, totalScore, totalPutts, fairwaysHit, greensHit);
            roundCount++;
            
            // 모든 라운드가 생성되었는지 확인
            if (roundCount === userIds.length * 10) {
              // 트랜잭션 커밋
              db.run('COMMIT', (err) => {
                if (err) {
                  console.error('트랜잭션 커밋 중 오류가 발생했습니다:', err);
                  db.run('ROLLBACK');
                } else {
                  console.log('모든 데이터가 성공적으로 생성되었습니다.');
                  
                  // 통계 데이터 생성
                  createStatistics(db, userIds);
                }
              });
            }
          }
        }
      );
    }
  });
}

/**
 * 홀별 라운드 데이터 생성
 */
function createRoundHoles(db, roundId, totalScore, totalPutts, fairwaysHit, greensHit) {
  // 첫 9홀 (Out 코스)
  for (let hole = 1; hole <= 9; hole++) {
    createHoleData(db, roundId, 1, hole, totalScore, totalPutts, fairwaysHit, greensHit);
  }
  
  // 후반 9홀 (In 코스)
  for (let hole = 1; hole <= 9; hole++) {
    createHoleData(db, roundId, 2, hole, totalScore, totalPutts, fairwaysHit, greensHit);
  }
}

/**
 * 홀 데이터 생성
 */
function createHoleData(db, roundId, courseNumber, holeNumber, totalScore, totalPutts, fairwaysHit, greensHit) {
  // 파 설정
  const par = holeNumber % 3 === 0 ? 3 : holeNumber % 3 === 1 ? 4 : 5;
  
  // 스코어 결정 (파 기준 -1 ~ +3)
  const scoreDiff = Math.floor(Math.random() * 5) - 1;
  const score = par + scoreDiff;
  
  // 결과 타입 결정
  let resultType;
  if (score < par) resultType = 1; // 버디 이상
  else if (score === par) resultType = 2; // 파
  else if (score === par + 1) resultType = 3; // 보기
  else resultType = 4; // 더블 보기 이상
  
  // 퍼팅 수 결정
  const putts = Math.min(score - 1, Math.floor(Math.random() * 3) + 1);
  
  // 페어웨이 안착 여부 (파 3 홀은 제외)
  const fairwayHit = par !== 3 ? Math.random() < (fairwaysHit / 14) : null;
  
  // 그린 적중 여부
  const greenHit = Math.random() < (greensHit / 18);
  
  // 그린 인 레귤레이션 (파 기준 타수 - 2 이하로 그린에 올라갔는지)
  const greenInRegulation = greenHit && score <= par;
  
  db.run(
    `INSERT INTO round_holes (
      round_id, course_number, hole_number, par, score, putts,
      fairway_hit, green_hit, green_in_regulation, result_type
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      roundId, courseNumber, holeNumber, par, score, putts,
      fairwayHit, greenHit, greenInRegulation, resultType
    ],
    (err) => {
      if (err) {
        console.error('홀별 라운드 데이터 추가 중 오류가 발생했습니다:', err);
      }
    }
  );
}

/**
 * 통계 테이블 데이터 생성
 */
function createStatistics(db, userIds) {
  console.log('통계 데이터를 생성합니다...');
  
  db.run('BEGIN TRANSACTION');
  
  // 각 사용자별로 통계 계산
  userIds.forEach(userId => {
    // 라운드 데이터 조회
    db.all('SELECT * FROM rounds WHERE user_id = ?', [userId], (err, rounds) => {
      if (err) {
        console.error('라운드 데이터 조회 중 오류가 발생했습니다:', err);
        return;
      }
      
      if (rounds.length === 0) {
        console.log(`사용자 ID ${userId}의 라운드 데이터가 없습니다.`);
        return;
      }
      
      // 사용자 종합 통계 계산
      const totalRounds = rounds.length;
      const avgScore = rounds.reduce((sum, round) => sum + round.total_score, 0) / totalRounds;
      const bestScore = Math.min(...rounds.map(round => round.total_score));
      const avgFairwayHitRate = rounds.reduce((sum, round) => sum + (round.fairways_hit / round.fairways_total * 100), 0) / totalRounds;
      const avgGreenHitRate = rounds.reduce((sum, round) => sum + (round.greens_hit / round.greens_total * 100), 0) / totalRounds;
      const avgPuttsPerRound = rounds.reduce((sum, round) => sum + round.total_putts, 0) / totalRounds;
      
      // 코스별 통계를 위한 데이터 그룹화
      const courseStats = {};
      rounds.forEach(round => {
        if (!courseStats[round.course_id]) {
          courseStats[round.course_id] = {
            rounds: [],
            totalScore: 0,
            totalPutts: 0,
            fairwaysHit: 0,
            fairwaysTotal: 0,
            greensHit: 0,
            greensTotal: 0
          };
        }
        
        courseStats[round.course_id].rounds.push(round);
        courseStats[round.course_id].totalScore += round.total_score;
        courseStats[round.course_id].totalPutts += round.total_putts;
        courseStats[round.course_id].fairwaysHit += round.fairways_hit;
        courseStats[round.course_id].fairwaysTotal += round.fairways_total;
        courseStats[round.course_id].greensHit += round.greens_hit;
        courseStats[round.course_id].greensTotal += round.greens_total;
      });
      
      // 사용자 종합 통계 삽입 또는 업데이트
      db.run(
        `INSERT OR REPLACE INTO user_stats (
          user_id, total_rounds, avg_score, best_score, 
          avg_driving_distance, avg_fairway_hit_rate, avg_green_hit_rate, 
          avg_putts_per_round, par3_avg_score, par4_avg_score, par5_avg_score,
          birdie_rate, par_rate, bogey_rate, last_updated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          userId, totalRounds, avgScore.toFixed(2), bestScore,
          240 + Math.floor(Math.random() * 40), // 평균 드라이빙 거리 (240-280)
          avgFairwayHitRate.toFixed(2), avgGreenHitRate.toFixed(2),
          avgPuttsPerRound.toFixed(2),
          3.2 + Math.random(), // 파3 평균 스코어
          4.5 + Math.random(), // 파4 평균 스코어
          5.3 + Math.random(), // 파5 평균 스코어
          10 + Math.random() * 15, // 버디율 (10-25%)
          30 + Math.random() * 20, // 파율 (30-50%)
          40 + Math.random() * 20 // 보기율 (40-60%)
        ],
        (err) => {
          if (err) {
            console.error('사용자 통계 데이터 추가 중 오류가 발생했습니다:', err);
          }
        }
      );
      
      // 코스별 통계 데이터 추가
      Object.keys(courseStats).forEach(courseId => {
        const stat = courseStats[courseId];
        const courseRounds = stat.rounds.length;
        
        db.run(
          `INSERT OR REPLACE INTO user_course_stats (
            user_id, course_id, rounds_played, best_score, avg_score,
            avg_putts, fairway_hit_rate, green_hit_rate, last_played, last_updated
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [
            userId, courseId, courseRounds,
            Math.min(...stat.rounds.map(r => r.total_score)),
            (stat.totalScore / courseRounds).toFixed(2),
            (stat.totalPutts / courseRounds).toFixed(2),
            (stat.fairwaysHit / stat.fairwaysTotal * 100).toFixed(2),
            (stat.greensHit / stat.greensTotal * 100).toFixed(2),
            stat.rounds[0].round_date // 가장 최근 라운드 날짜
          ],
          (err) => {
            if (err) {
              console.error('코스별 통계 데이터 추가 중 오류가 발생했습니다:', err);
            }
          }
        );
      });
    });
  });
  
  // 트랜잭션 커밋
  setTimeout(() => {
    db.run('COMMIT', (err) => {
      if (err) {
        console.error('트랜잭션 커밋 중 오류가 발생했습니다:', err);
        db.run('ROLLBACK');
      } else {
        console.log('모든 통계 데이터가 성공적으로 생성되었습니다.');
        db.close();
      }
    });
  }, 3000);
} 