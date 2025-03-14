/**
 * 라운드 데이터 생성 스크립트
 * 기존 사용자와 골프장 정보를 사용하여 30개의 라운드 데이터를 생성하고 DB에 입력합니다.
 */
const fs = require('fs');
const path = require('path');
const db = require('./server/models/db');
const { RoundModel, CourseModel } = require('./server/models');

// 현재 시간 설정
const now = new Date();
const timestamp = now.toISOString().replace(/:/g, '-');

// 결과 저장 파일 경로
const resultPath = path.join(__dirname, 'generated-rounds.json');

// 로그 기록 함수
function log(message) {
  console.log(message);
  fs.appendFileSync('round-generation.log', `${timestamp} - ${message}\n`);
}

// 난수 발생 헬퍼 함수
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 날짜 생성 함수 (1년 이내의 랜덤 날짜)
function generateRandomDate() {
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);
  
  const randomTime = oneYearAgo.getTime() + Math.random() * (today.getTime() - oneYearAgo.getTime());
  const randomDate = new Date(randomTime);
  
  // YYYY-MM-DD 형식으로 변환
  const year = randomDate.getFullYear();
  const month = String(randomDate.getMonth() + 1).padStart(2, '0');
  const day = String(randomDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// 시간 생성 함수 (6:00 ~ 18:00 사이)
function generateRandomTime() {
  const hour = getRandomInt(6, 18);
  const minute = getRandomInt(0, 3) * 15; // 0, 15, 30, 45
  
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

// 플레이 레벨 결정 함수
function determinePlayerLevel(handicap) {
  if (handicap <= 5) return 5; // 프로/세미프로
  if (handicap <= 10) return 4; // 상급자
  if (handicap <= 15) return 3; // 중상급자
  if (handicap <= 22) return 2; // 중급자
  return 1; // 초급자
}

// 결과 타입 결정 함수 (score와 par 비교)
function determineResultType(score, par) {
  if (score === 1) return 1; // 홀인원
  if (score === par - 2) return 2; // 이글
  if (score === par - 1) return 3; // 버디
  if (score === par) return 4; // 파
  if (score === par + 1) return 5; // 보기
  if (score === par + 2) return 6; // 더블보기
  return 7; // 트리플보기 이상
}

// 스코어 계산 함수 (플레이어 레벨과 홀 타입에 따라 차등)
function calculateScore(playerLevel, par, handicap) {
  const baseScore = {
    1: { 3: 5, 4: 6, 5: 8 }, // 초급자
    2: { 3: 4, 4: 6, 5: 7 }, // 중급자
    3: { 3: 4, 4: 5, 5: 6 }, // 중상급자
    4: { 3: 3, 4: 5, 5: 6 }, // 상급자
    5: { 3: 3, 4: 4, 5: 5 }  // 프로/세미프로
  };

  // 난이도 조정 (핸디캡이 높을수록 편차가 크다)
  const difficulty = Math.max(1, handicap / 5);
  
  // 기본 스코어에 랜덤 요소 추가
  const variance = getRandomInt(-2, 2) * (difficulty / 2);
  let score = Math.round(baseScore[playerLevel][par] + variance);
  
  // 최소 스코어는 1로 제한 (홀인원)
  return Math.max(1, score);
}

// 퍼팅 수 계산 함수
function calculatePutts(score, par, greenHit) {
  // 그린적중 여부에 따라 기본 퍼팅 수 결정
  let basePutts = greenHit ? 2 : 3;
  
  // 스코어가 파보다 낮으면 퍼팅 수도 낮아질 가능성
  if (score < par) {
    basePutts = getRandomInt(1, 2);
  } 
  // 스코어가 파보다 많이 높으면 퍼팅 수도 높아질 가능성
  else if (score > par + 1) {
    basePutts = Math.min(basePutts + getRandomInt(0, 1), score - 1);
  }
  
  // 퍼팅 수는 항상 스코어보다 작아야 함
  return Math.min(basePutts, score - 1);
}

// 라운드 데이터 생성 및 DB 입력
async function generateRoundData() {
  try {
    log('라운드 데이터 생성 시작...');
    
    // 사용자 목록 조회
    const users = await db.all('SELECT * FROM users ORDER BY user_id');
    log(`총 ${users.length}명의 사용자가 등록되어 있습니다.`);
    
    // 골프 코스 목록 조회
    const courses = await db.all(`
      SELECT c.*, 
             cd1.course_name as first_course_name, 
             cd2.course_name as second_course_name
      FROM golf_courses c
      JOIN course_details cd1 ON c.course_id = cd1.course_id AND cd1.course_number = 1
      JOIN course_details cd2 ON c.course_id = cd2.course_id AND cd2.course_number = 2
      ORDER BY c.course_id
    `);
    log(`총 ${courses.length}개의 골프 코스가 등록되어 있습니다.`);
    
    // 결과 저장 객체
    const results = {
      success: true,
      timestamp: timestamp,
      rounds: [],
      holes: {}
    };
    
    // 30개의 라운드 데이터 생성
    const totalRounds = 30;
    log(`${totalRounds}개의 라운드 데이터를 생성합니다.`);
    
    for (let i = 0; i < totalRounds; i++) {
      try {
        // 랜덤 사용자 선택
        const user = users[getRandomInt(0, users.length - 1)];
        
        // 랜덤 골프 코스 선택
        const course = courses[getRandomInt(0, courses.length - 1)];
        
        // 라운드 날짜와 시간 생성
        const roundDate = generateRandomDate();
        const roundTime = generateRandomTime();
        
        log(`라운드 ${i + 1} 생성 시작: ${user.full_name}, ${course.course_name}, ${roundDate} ${roundTime}`);
        
        // 홀 정보 조회
        const firstCourseHoles = await db.all(`
          SELECT * FROM holes 
          WHERE course_id = ? AND course_number = 1 
          ORDER BY hole_number
        `, [course.course_id]);
        
        const secondCourseHoles = await db.all(`
          SELECT * FROM holes 
          WHERE course_id = ? AND course_number = 2 
          ORDER BY hole_number
        `, [course.course_id]);
        
        // 선택된 코스 호출
        const firstCourseName = course.first_course_name;
        const secondCourseName = course.second_course_name;
        
        log(`선택된 코스: ${firstCourseName} & ${secondCourseName}`);
        
        // 플레이어 레벨 결정 (핸디캡 기반)
        const playerLevel = determinePlayerLevel(user.handicap || 20);
        
        // 날씨 조건 (랜덤)
        const weatherConditions = ['sunny', 'cloudy', 'rainy', 'windy'];
        const weatherCondition = weatherConditions[getRandomInt(0, weatherConditions.length - 1)];
        
        // 풍속 (0~8)
        const windSpeed = getRandomInt(0, 8);
        
        // 온도 (섭씨, 계절에 따라 차등)
        const month = parseInt(roundDate.split('-')[1]);
        let tempMin, tempMax;
        if (month >= 3 && month <= 5) { // 봄
          tempMin = 10; tempMax = 25;
        } else if (month >= 6 && month <= 8) { // 여름
          tempMin = 22; tempMax = 35;
        } else if (month >= 9 && month <= 11) { // 가을
          tempMin = 10; tempMax = 25;
        } else { // 겨울
          tempMin = -5; tempMax = 15;
        }
        const temperature = getRandomInt(tempMin, tempMax);
        
        // 홀별 스코어 계산
        const roundHoles = [];
        let totalScore = 0;
        let totalPutts = 0;
        let fairwaysHit = 0;
        let fairwaysTotal = 0;
        let greensHit = 0;
        let greensTotal = 0;
        let penalties = 0;
        let birdies = 0;
        let pars = 0;
        let bogeys = 0;
        let doublesOrWorse = 0;
        
        // 모든 홀 (first course + second course)
        const allHoles = [...firstCourseHoles, ...secondCourseHoles];
        
        // 각 홀에 대한 스코어 생성
        for (const hole of allHoles) {
          const par = hole.par;
          greensTotal++;
          
          // 페어웨이 적중 여부 (파3 홀은 제외)
          let fairwayHit = null;
          if (par > 3) {
            fairwaysTotal++;
            fairwayHit = Math.random() < (0.5 + (playerLevel * 0.08)); // 레벨이 높을수록 적중률 높음
            if (fairwayHit) fairwaysHit++;
          }
          
          // 그린 적중 여부
          const greenHit = Math.random() < (0.4 + (playerLevel * 0.1)); // 레벨이 높을수록 적중률 높음
          if (greenHit) greensHit++;
          
          // 그린 규정 타수 적중 여부
          const girPar = par - 2; // 그린 규정 타수 (파3: 1타, 파4: 2타, 파5: 3타)
          const greenInRegulation = greenHit && (fairwayHit !== false); // 페어웨이 놓치면 GIR 확률 감소
          
          // 벙커 세이브 및 업앤다운 여부 (랜덤)
          const sandSave = !greenHit && Math.random() < 0.3;
          const upAndDown = !greenHit && Math.random() < 0.35;
          
          // 페널티 발생 여부 (레벨이 높을수록 낮음)
          const penaltyCount = Math.random() < (0.4 - (playerLevel * 0.05)) ? getRandomInt(1, 2) : 0;
          penalties += penaltyCount;
          
          // 홀 스코어 계산
          const score = calculateScore(playerLevel, par, user.handicap || 20) + penaltyCount;
          
          // 퍼팅 수 계산
          const putts = calculatePutts(score, par, greenHit);
          totalPutts += putts;
          
          // 첫 번째 퍼트 거리 (랜덤, 피트 단위)
          const puttDistanceFirst = greenHit ? getRandomInt(5, 40) : null;
          
          // 결과 타입 결정
          const resultType = determineResultType(score, par);
          
          // 성과 집계
          if (resultType === 3) birdies++; // 버디
          else if (resultType === 4) pars++; // 파
          else if (resultType === 5) bogeys++; // 보기
          else if (resultType >= 6) doublesOrWorse++; // 더블보기 이상
          
          // 홀 정보 저장
          roundHoles.push({
            course_number: hole.course_number,
            hole_number: hole.hole_number,
            par: par,
            score: score,
            putts: putts,
            fairway_hit: fairwayHit,
            green_hit: greenHit ? 1 : 0,
            green_in_regulation: greenInRegulation ? 1 : 0,
            sand_save: sandSave ? 1 : 0,
            up_and_down: upAndDown ? 1 : 0,
            penalties: penaltyCount,
            putt_distance_first: puttDistanceFirst,
            result_type: resultType
          });
          
          totalScore += score;
        }
        
        // 라운드 데이터 생성
        const roundData = {
          user_id: user.user_id,
          course_id: course.course_id,
          first_course_number: 1,
          second_course_number: 2,
          round_date: roundDate,
          round_time: roundTime,
          total_score: totalScore,
          total_putts: totalPutts,
          fairways_hit: fairwaysHit,
          fairways_total: fairwaysTotal,
          greens_hit: greensHit,
          greens_total: greensTotal,
          penalties: penalties,
          birdies: birdies,
          pars: pars,
          bogeys: bogeys,
          doubles_or_worse: doublesOrWorse,
          green_speed: getRandomInt(7, 12), // 스팀프미터 (7-12)
          player_level: playerLevel,
          wind_speed: windSpeed,
          concede_distance: getRandomInt(0, 3), // 0-3 피트
          mulligan_allowed: getRandomInt(0, 1),
          mulligan_used: getRandomInt(0, 3),
          weather_condition: weatherCondition,
          temperature: temperature,
          status: 1 // 완료된 라운드
        };
        
        // 라운드 생성
        const roundId = await RoundModel.createRound(roundData);
        log(`라운드 생성 완료: ID ${roundId}, 총 스코어: ${totalScore}`);
        
        // 라운드 결과 저장
        results.rounds.push({
          roundId,
          userId: user.user_id,
          userName: user.full_name,
          courseId: course.course_id,
          courseName: course.course_name,
          roundDate,
          roundTime,
          totalScore,
          totalPutts
        });
        
        // 홀 데이터 저장 배열
        results.holes[roundId] = [];
        
        // 홀별 데이터 저장
        for (const holeData of roundHoles) {
          // 라운드 ID 추가
          holeData.round_id = roundId;
          
          // 홀 데이터 생성
          const holeId = await RoundModel.addRoundHole(holeData);
          log(`홀 데이터 생성 완료: 라운드 ${roundId}, 코스 ${holeData.course_number}, 홀 ${holeData.hole_number}, 스코어: ${holeData.score}`);
          
          // 결과에 추가
          results.holes[roundId].push({
            holeId,
            courseNumber: holeData.course_number,
            holeNumber: holeData.hole_number,
            par: holeData.par,
            score: holeData.score
          });
        }
        
        log(`라운드 ${i + 1} 생성 완료: ${user.full_name}, ${course.course_name}, 총 스코어: ${totalScore}`);
      } catch (error) {
        log(`라운드 ${i + 1} 생성 중 오류 발생: ${error.message}`);
        console.error(error);
      }
    }
    
    log('라운드 데이터 생성 완료');
    
    // 생성된 라운드 수 확인
    const roundCount = await db.get('SELECT COUNT(*) as count FROM rounds');
    log(`현재 등록된 라운드: ${roundCount.count}개`);
    
    // 결과를 JSON 파일로 저장
    fs.writeFileSync(resultPath, JSON.stringify(results, null, 2));
    log(`생성된 라운드 데이터가 ${resultPath} 파일에 저장되었습니다.`);
    
  } catch (error) {
    log(`라운드 데이터 생성 중 오류 발생: ${error.message}`);
    console.error(error);
  } finally {
    await db.close();
    log('데이터베이스 연결이 종료되었습니다.');
  }
}

// 스크립트 실행
generateRoundData(); 