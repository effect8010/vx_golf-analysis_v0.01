/**
 * 골프 시뮬레이터 앱 커스텀 샘플 데이터 생성 스크립트
 * 
 * 이 스크립트는 테스트 및 개발 목적으로 다음과 같은 샘플 데이터를 생성합니다:
 * - 사용자 5명
 * - 골프장 10개
 * - 라운드 30개
 */

// 환경변수 설정 (개발 환경으로 설정)
process.env.NODE_ENV = 'development';

const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

console.log('커스텀 샘플 데이터 생성을 시작합니다...');

// 데이터베이스 연결
const dbPath = path.join(__dirname, '..', 'data', 'golf_simulator.db');

// 디렉토리가 없으면 생성
if (!fs.existsSync(path.join(__dirname, '..', 'data'))) {
    fs.mkdirSync(path.join(__dirname, '..', 'data'));
}

// 기존 DB 파일 백업
if (fs.existsSync(dbPath)) {
  const backupPath = `${dbPath}.backup.${new Date().toISOString().replace(/:/g, '-')}`;
  console.log(`기존 데이터베이스 파일을 백업합니다: ${backupPath}`);
  fs.copyFileSync(dbPath, backupPath);
}

// 데이터베이스 연결
const db = new sqlite3.Database(dbPath);

// 날짜 및 랜덤 유틸리티 함수
function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function formatTime(date) {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:00`;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// 데이터베이스 스키마 생성
function createSchema() {
  return new Promise((resolve, reject) => {
    console.log('스키마를 생성합니다...');
    
    // SQL 파일 읽기
    const schemaPath = path.join(__dirname, '..', 'server', 'models', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    db.exec(schemaSql, (err) => {
      if (err) {
        console.error('스키마 생성 중 오류 발생:', err);
        reject(err);
      } else {
        console.log('스키마 생성 완료');
        resolve();
      }
    });
  });
}

// 사용자 5명 생성
async function createUsers() {
  return new Promise((resolve, reject) => {
    console.log('사용자 5명을 생성합니다...');
    
    const users = [
      { username: 'admin', password: 'admin123', fullName: '관리자', email: 'admin@golf-simulator.com', handicap: 0 },
      { username: 'kim', password: 'test123', fullName: '김철수', email: 'kim@example.com', handicap: 12.5 },
      { username: 'lee', password: 'test123', fullName: '이영희', email: 'lee@example.com', handicap: 18.2 },
      { username: 'park', password: 'test123', fullName: '박지민', email: 'park@example.com', handicap: 8.7 },
      { username: 'choi', password: 'test123', fullName: '최민준', email: 'choi@example.com', handicap: 15.3 }
    ];
    
    const insertUserStmt = db.prepare(`
      INSERT INTO users (username, password_hash, full_name, email, handicap, status, join_date)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    
    const userIds = [];
    
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      users.forEach(user => {
        const passwordHash = bcrypt.hashSync(user.password, 10);
        insertUserStmt.run(
          user.username,
          passwordHash,
          user.fullName,
          user.email,
          user.handicap,
          1, // 활성 상태
          function(err) {
            if (err) {
              console.error('사용자 생성 중 오류 발생:', err);
              reject(err);
            } else {
              userIds.push(this.lastID);
            }
          }
        );
      });
      
      insertUserStmt.finalize();
      
      db.run('COMMIT', (err) => {
        if (err) {
          console.error('사용자 생성 트랜잭션 커밋 중 오류 발생:', err);
          reject(err);
        } else {
          console.log(`사용자 5명 생성 완료. 사용자 ID: ${userIds.join(', ')}`);
          resolve(userIds);
        }
      });
    });
  });
}

// 골프 코스 10개 생성
async function createCourses() {
  return new Promise((resolve, reject) => {
    console.log('골프 코스 10개를 생성합니다...');
    
    const courses = [
      { name: '송도 CC', resource: 'songdo_cc', count: 2, description: '인천 송도에 위치한 골프 코스입니다.' },
      { name: '제주 오션 CC', resource: 'jeju_ocean_cc', count: 2, description: '제주도 해안가에 위치한 바다 전망의 골프 코스입니다.' },
      { name: '파인밸리 CC', resource: 'pine_valley_cc', count: 2, description: '아름다운 소나무 숲과 넓은 페어웨이를 가진 골프 코스입니다.' },
      { name: '레이크힐스 CC', resource: 'lake_hills_cc', count: 2, description: '아름다운 호수가 있는 경관 좋은 골프 코스입니다.' },
      { name: '블루마운틴 CC', resource: 'blue_mountain_cc', count: 2, description: '산악 지형의 도전적인 골프 코스입니다.' },
      { name: '이글포인트 CC', resource: 'eagle_point_cc', count: 2, description: '전략적인 플레이가 필요한 다양한 홀을 갖춘 골프 코스입니다.' },
      { name: '선샤인 CC', resource: 'sunshine_cc', count: 2, description: '넓은 페어웨이와 평평한 그린이 특징인 골프 코스입니다.' },
      { name: '로얄헤리티지 CC', resource: 'royal_heritage_cc', count: 3, description: '27홀로 구성된 넓은 규모의 골프 코스입니다.' },
      { name: '그린파크 CC', resource: 'green_park_cc', count: 2, description: '자연친화적 설계의 골프 코스입니다.' },
      { name: '하이랜드 CC', resource: 'highland_cc', count: 3, description: '높은 고도에 위치한 시원한 경관의 골프 코스입니다.' }
    ];
    
    const insertCourseStmt = db.prepare(`
      INSERT INTO golf_courses (
        course_name, resource_name, course_count, country_code,
        course_difficulty, green_difficulty, description, average_par, release_date, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    
    const courseDetailStmt = db.prepare(`
      INSERT INTO course_details (course_id, course_number, course_name)
      VALUES (?, ?, ?)
    `);
    
    const holeStmt = db.prepare(`
      INSERT INTO holes (
        course_id, course_number, hole_number, par, hole_type,
        back_distance, champion_distance, front_distance,
        senior_distance, lady_distance, hole_index
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const courseNames = {
      1: ['동코스', '서코스', '남코스'],
      2: ['바다코스', '산코스', '레이크코스'],
      3: ['에이코스', '비코스', '씨코스'],
      4: ['레이크코스', '힐코스', '밸리코스'],
      5: ['블루코스', '마운틴코스', '포레스트코스'],
      6: ['이글코스', '버디코스', '파코스'],
      7: ['선샤인코스', '선셋코스', '선라이즈코스'],
      8: ['로얄코스', '헤리티지코스', '킹스코스'],
      9: ['그린코스', '파크코스', '메도우코스'],
      10: ['하이코스', '랜드코스', '스카이코스']
    };
    
    const courseIds = [];
    
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      courses.forEach((course, index) => {
        // 코스 생성
        insertCourseStmt.run(
          course.name,
          course.resource,
          course.count,
          1, // 한국
          getRandomInt(2, 5), // 난이도
          getRandomInt(2, 5), // 그린 난이도
          course.description,
          72, // 평균 파
          `2023-0${getRandomInt(1, 9)}-${getRandomInt(1, 28)}`, // 출시일
          function(err) {
            if (err) {
              console.error('코스 생성 중 오류 발생:', err);
              return reject(err);
            }
            
            const courseId = this.lastID;
            courseIds.push(courseId);
            
            // 코스 상세 정보 및 홀 정보 생성
            for (let courseNum = 1; courseNum <= course.count; courseNum++) {
              // 코스 상세 정보
              const courseName = courseNames[index + 1][courseNum - 1];
              courseDetailStmt.run(
                courseId,
                courseNum,
                courseName
              );
              
              // 홀 정보
              for (let holeNum = 1; holeNum <= 9; holeNum++) {
                const par = holeNum % 3 === 0 ? 5 : (holeNum % 3 === 1 ? 4 : 3);
                holeStmt.run(
                  courseId,
                  courseNum,
                  holeNum,
                  par,
                  par, // 홀 타입
                  par === 3 ? 180 + holeNum * 5 : (par === 4 ? 380 + holeNum * 10 : 520 + holeNum * 15), // 백티 거리
                  par === 3 ? 170 + holeNum * 5 : (par === 4 ? 360 + holeNum * 10 : 500 + holeNum * 15), // 챔피언 거리
                  par === 3 ? 160 + holeNum * 5 : (par === 4 ? 340 + holeNum * 10 : 480 + holeNum * 15), // 프론트 거리
                  par === 3 ? 150 + holeNum * 5 : (par === 4 ? 320 + holeNum * 10 : 460 + holeNum * 15), // 시니어 거리
                  par === 3 ? 140 + holeNum * 5 : (par === 4 ? 300 + holeNum * 10 : 440 + holeNum * 15), // 레이디 거리
                  holeNum // 홀 인덱스
                );
              }
            }
          }
        );
      });
      
      insertCourseStmt.finalize();
      courseDetailStmt.finalize();
      holeStmt.finalize();
      
      db.run('COMMIT', (err) => {
        if (err) {
          console.error('코스 생성 트랜잭션 커밋 중 오류 발생:', err);
          reject(err);
        } else {
          console.log(`골프 코스 10개 생성 완료. 코스 ID: ${courseIds.join(', ')}`);
          resolve(courseIds);
        }
      });
    });
  });
}

// 라운드 데이터 30개 생성
async function createRounds(userIds, courseIds) {
  return new Promise((resolve, reject) => {
    console.log('라운드 데이터 30개를 생성합니다...');
    
    const insertRoundStmt = db.prepare(`
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
    `);
    
    const insertRoundHoleStmt = db.prepare(`
      INSERT INTO round_holes (
        round_id, course_number, hole_number, par, score,
        putts, fairway_hit, green_hit, green_in_regulation,
        sand_save, up_and_down, penalties, putt_distance_first,
        result_type
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const weatherConditions = ['맑음', '흐림', '바람많음', '소나기', '더움', '선선함'];
    const roundIds = [];
    
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      // 30개의 라운드 생성
      for (let i = 0; i < 30; i++) {
        // 랜덤 사용자, 코스 선택
        const userId = getRandomElement(userIds);
        const courseId = getRandomElement(courseIds);
        
        // 코스 정보 가져오기
        const courseInfo = db.prepare('SELECT course_count FROM golf_courses WHERE course_id = ?').get(courseId);
        const courseCount = courseInfo.course_count;
        
        // 랜덤 코스 번호 선택
        const firstCourseNumber = getRandomInt(1, courseCount);
        let secondCourseNumber = null;
        
        // 두 번째 코스는 첫 번째 코스와 다르게 선택
        if (courseCount > 1) {
          do {
            secondCourseNumber = getRandomInt(1, courseCount);
          } while (secondCourseNumber === firstCourseNumber);
        }
        
        // 랜덤 날짜 및 시간 생성 (최근 1년 이내)
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        const roundDate = getRandomDate(oneYearAgo, today);
        roundDate.setHours(getRandomInt(6, 17), getRandomInt(0, 59), 0);
        
        // 라운드 통계 설정
        const fairwaysTotal = 14;
        const fairwaysHit = getRandomInt(Math.floor(fairwaysTotal * 0.3), fairwaysTotal);
        const greensTotal = 18;
        const greensHit = getRandomInt(Math.floor(greensTotal * 0.3), greensTotal);
        const totalPutts = getRandomInt(24, 38);
        const penalties = getRandomInt(0, 6);
        
        // 스코어 유형 카운트
        const birdies = getRandomInt(0, 5);
        const pars = getRandomInt(5, 12);
        const bogeys = getRandomInt(3, 10);
        const doublesOrWorse = 18 - birdies - pars - bogeys;
        
        // 총 스코어 계산
        const totalScore = 72 + bogeys + (doublesOrWorse * 2) - birdies;
        
        // 라운드 옵션 설정
        const greenSpeed = getRandomInt(1, 5);
        const playerLevel = getRandomInt(1, 4);
        const windSpeed = getRandomInt(1, 3);
        const concedeDistance = getRandomInt(1, 5);
        const mulliganAllowed = getRandomInt(0, 5);
        const mulliganUsed = getRandomInt(0, mulliganAllowed);
        const weatherCondition = getRandomElement(weatherConditions);
        const temperature = getRandomInt(15, 35);
        
        // 라운드 생성
        insertRoundStmt.run(
          userId,
          courseId,
          firstCourseNumber,
          secondCourseNumber,
          formatDate(roundDate),
          formatTime(roundDate),
          totalScore,
          totalPutts,
          fairwaysHit,
          fairwaysTotal,
          greensHit,
          greensTotal,
          penalties,
          birdies,
          pars,
          bogeys,
          doublesOrWorse,
          greenSpeed,
          playerLevel,
          windSpeed,
          concedeDistance,
          mulliganAllowed,
          mulliganUsed,
          weatherCondition,
          temperature,
          1, // 완료 상태
          function(err) {
            if (err) {
              console.error('라운드 생성 중 오류 발생:', err);
              return reject(err);
            }
            
            const roundId = this.lastID;
            roundIds.push(roundId);
            
            // 홀별 데이터 생성
            const holesData = [];
            
            // 홀 정보 가져오기
            const holes = db.prepare('SELECT * FROM holes WHERE course_id = ? AND course_number = ? ORDER BY hole_number').all(courseId, firstCourseNumber);
            
            if (holes.length > 0) {
              for (const hole of holes) {
                // 랜덤 결과 생성
                const par = hole.par;
                let score, resultType;
                
                // 결과 타입 결정
                const resultProb = Math.random();
                
                if (resultProb < 0.1) {
                  score = par - 1; // 버디
                  resultType = 1;
                } else if (resultProb < 0.5) {
                  score = par; // 파
                  resultType = 2;
                } else if (resultProb < 0.8) {
                  score = par + 1; // 보기
                  resultType = 3;
                } else {
                  score = par + 2; // 더블 보기 이상
                  resultType = 4;
                }
                
                // 퍼팅 수
                const putts = getRandomInt(1, 3);
                
                // 페어웨이, 그린 적중 여부
                const fairwayHit = hole.par !== 3 ? Math.random() > 0.4 : null; // 파3 홀은 페어웨이 적용 안함
                const greenHit = Math.random() > 0.4;
                
                // 그린적중 (GIR) 여부
                const greenInRegulation = par - 2 >= score - putts;
                
                // 샌드 세이브, 업앤다운 여부
                const sandSave = !greenHit && putts <= 2 ? Math.random() > 0.5 : null;
                const upAndDown = !greenHit && putts <= 2 ? Math.random() > 0.5 : null;
                
                // 페널티
                const holePenalties = resultType > 3 ? getRandomInt(0, 1) : 0;
                
                // 첫 퍼팅 거리 (인치)
                const puttDistanceFirst = greenHit ? getRandomInt(60, 600) : getRandomInt(12, 36);
                
                // 홀 데이터 추가
                insertRoundHoleStmt.run(
                  roundId,
                  firstCourseNumber,
                  hole.hole_number,
                  par,
                  score,
                  putts,
                  fairwayHit,
                  greenHit,
                  greenInRegulation,
                  sandSave,
                  upAndDown,
                  holePenalties,
                  puttDistanceFirst,
                  resultType
                );
              }
            }
            
            // 두 번째 코스가 있을 경우
            if (secondCourseNumber) {
              const secondHoles = db.prepare('SELECT * FROM holes WHERE course_id = ? AND course_number = ? ORDER BY hole_number').all(courseId, secondCourseNumber);
              
              if (secondHoles.length > 0) {
                for (const hole of secondHoles) {
                  // 랜덤 결과 생성 (위와 유사)
                  const par = hole.par;
                  let score, resultType;
                  
                  const resultProb = Math.random();
                  
                  if (resultProb < 0.1) {
                    score = par - 1;
                    resultType = 1;
                  } else if (resultProb < 0.5) {
                    score = par;
                    resultType = 2;
                  } else if (resultProb < 0.8) {
                    score = par + 1;
                    resultType = 3;
                  } else {
                    score = par + 2;
                    resultType = 4;
                  }
                  
                  const putts = getRandomInt(1, 3);
                  const fairwayHit = hole.par !== 3 ? Math.random() > 0.4 : null;
                  const greenHit = Math.random() > 0.4;
                  const greenInRegulation = par - 2 >= score - putts;
                  const sandSave = !greenHit && putts <= 2 ? Math.random() > 0.5 : null;
                  const upAndDown = !greenHit && putts <= 2 ? Math.random() > 0.5 : null;
                  const holePenalties = resultType > 3 ? getRandomInt(0, 1) : 0;
                  const puttDistanceFirst = greenHit ? getRandomInt(60, 600) : getRandomInt(12, 36);
                  
                  insertRoundHoleStmt.run(
                    roundId,
                    secondCourseNumber,
                    hole.hole_number,
                    par,
                    score,
                    putts,
                    fairwayHit,
                    greenHit,
                    greenInRegulation,
                    sandSave,
                    upAndDown,
                    holePenalties,
                    puttDistanceFirst,
                    resultType
                  );
                }
              }
            }
          }
        );
      }
      
      insertRoundStmt.finalize();
      insertRoundHoleStmt.finalize();
      
      db.run('COMMIT', (err) => {
        if (err) {
          console.error('라운드 생성 트랜잭션 커밋 중 오류 발생:', err);
          reject(err);
        } else {
          console.log(`라운드 30개 생성 완료. 라운드 ID: ${roundIds.join(', ')}`);
          resolve(roundIds);
        }
      });
    });
  });
}

// 메인 함수
async function main() {
  try {
    // 스키마 생성
    await createSchema();
    
    // 사용자 생성
    const userIds = await createUsers();
    
    // 골프 코스 생성
    const courseIds = await createCourses();
    
    // 라운드 데이터 생성
    await createRounds(userIds, courseIds);
    
    console.log('샘플 데이터 생성이 완료되었습니다!');
    db.close();
  } catch (err) {
    console.error('샘플 데이터 생성 중 오류가 발생했습니다:', err);
    db.close();
    process.exit(1);
  }
}

// 스크립트 실행
main(); 