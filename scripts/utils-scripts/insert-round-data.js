/**
 * 라운드 홀 결과, 샷 데이터, 라운드 동반자 정보 추가 스크립트
 * 기존 DB에 저장된 라운드 정보를 바탕으로 데이터를 추가합니다.
 */
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// 로그 파일 설정
const LOG_FILE = path.join(__dirname, 'round-data-insert.log');

// 현재 디렉토리 기준으로 DB 경로 설정
const DB_PATH = path.resolve(__dirname, './data/golf_simulator.db');

// 데이터 파일 경로 설정 (기본값)
const DATA_FILE = path.join(__dirname, 'round-data.json');

// 로그 기록 함수
function logMessage(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  
  console.log(message);
  fs.appendFileSync(LOG_FILE, logEntry);
}

// 오류 로깅 함수
function logError(error, context) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] 오류 (${context}): ${error.message}\n${error.stack}\n`;
  
  console.error(`오류 (${context}):`, error);
  fs.appendFileSync(LOG_FILE, logEntry);
}

// DB 연결
function connectDB() {
  logMessage(`데이터베이스 경로: ${DB_PATH}`);
  return new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      logError(err, 'DB 연결');
      process.exit(1);
    }
    logMessage('데이터베이스에 연결되었습니다.');
  });
}

// 프로미스 래퍼 함수
function runQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function getQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function allQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

/**
 * 홀별 라운드 결과 추가 함수
 * @param {object} db - 데이터베이스 연결 객체
 * @param {number} roundId - 라운드 ID
 * @param {array} holesData - 홀별 데이터 배열
 */
async function addRoundHoles(db, roundId, holesData) {
  for (const hole of holesData) {
    const sql = `
      INSERT INTO round_holes (
        round_id, course_number, hole_number, par, score,
        putts, fairway_hit, green_hit, green_in_regulation,
        sand_save, up_and_down, penalties, putt_distance_first,
        result_type
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    // 결과 타입 계산 (1: 버디 이상, 2: 파, 3: 보기, 4: 더블보기 이상)
    const resultType = hole.score < hole.par ? 1 : 
                       (hole.score === hole.par ? 2 : 
                       (hole.score === hole.par + 1 ? 3 : 4));
    
    const params = [
      roundId,
      hole.courseNumber,
      hole.holeNumber,
      hole.par,
      hole.score,
      hole.putts || 2,
      hole.fairwayHit ? 1 : 0,
      hole.greenHit ? 1 : 0,
      hole.greenInRegulation ? 1 : 0,
      hole.sandSave ? 1 : 0,
      hole.upAndDown ? 1 : 0,
      hole.penalties || 0,
      hole.puttDistanceFirst || null,
      resultType
    ];
    
    try {
      const result = await runQuery(db, sql, params);
      logMessage(`홀 ${hole.courseNumber}-${hole.holeNumber} 데이터가 추가되었습니다. (ID: ${result.lastID})`);
    } catch (error) {
      logError(error, `홀 ${hole.courseNumber}-${hole.holeNumber} 데이터 추가`);
    }
  }
}

/**
 * 샷 정보 추가 함수
 * @param {object} db - 데이터베이스 연결 객체
 * @param {number} roundId - 라운드 ID
 * @param {number} userId - 사용자 ID
 * @param {number} courseId - 코스 ID
 * @param {array} shotsData - 샷 데이터 배열
 */
async function addShots(db, roundId, userId, courseId, shotsData) {
  for (const shot of shotsData) {
    const sql = `
      INSERT INTO shots (
        round_id, user_id, course_id, course_number, hole_number,
        shot_time, shot_sequence, club, club_category, terrain,
        shot_type, distance, carry_distance, club_speed, attack_angle,
        ball_speed, smash_factor, vertical_angle, horizontal_angle,
        total_spin, side_spin, back_spin, remaining_distance,
        hang_time, club_path, face_angle, is_fairway_shot,
        is_green_shot, is_putt, distance_to_pin_before,
        distance_to_pin_after, distance_to_target, accuracy,
        dispersion_left, dispersion_right, shot_quality
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `;
    
    const shotTime = shot.shotTime || new Date().toISOString();
    
    const params = [
      roundId,
      userId,
      courseId,
      shot.courseNumber,
      shot.holeNumber,
      shotTime,
      shot.shotSequence,
      shot.club,
      shot.clubCategory,
      shot.terrain || '페어웨이',
      shot.shotType || '스트레이트',
      shot.distance || 0,
      shot.carryDistance || 0,
      shot.clubSpeed || null,
      shot.attackAngle || null,
      shot.ballSpeed || null,
      shot.smashFactor || null,
      shot.verticalAngle || null,
      shot.horizontalAngle || null,
      shot.totalSpin || null,
      shot.sideSpin || null,
      shot.backSpin || null,
      shot.remainingDistance || null,
      shot.hangTime || null,
      shot.clubPath || null,
      shot.faceAngle || null,
      shot.isFairwayShot ? 1 : 0,
      shot.isGreenShot ? 1 : 0,
      shot.isPutt ? 1 : 0,
      shot.distanceToPinBefore || null,
      shot.distanceToPinAfter || null,
      shot.distanceToTarget || null,
      shot.accuracy || null,
      shot.dispersionLeft || null,
      shot.dispersionRight || null,
      shot.shotQuality || null
    ];
    
    try {
      const result = await runQuery(db, sql, params);
      logMessage(`샷 ${shot.courseNumber}-${shot.holeNumber}-${shot.shotSequence} 데이터가 추가되었습니다. (ID: ${result.lastID})`);
    } catch (error) {
      logError(error, `샷 ${shot.courseNumber}-${shot.holeNumber}-${shot.shotSequence} 데이터 추가`);
    }
  }
}

/**
 * 라운드 동반자 정보 추가 함수
 * @param {object} db - 데이터베이스 연결 객체
 * @param {number} roundId - 라운드 ID
 * @param {number} userId - 사용자 ID
 * @param {array} partnersData - 동반자 데이터 배열
 */
async function addRoundPartners(db, roundId, userId, partnersData) {
  for (const partner of partnersData) {
    const sql = `
      INSERT INTO round_partners (
        round_id, user_id, partner_user_id, partner_name,
        total_score, match_result, score_difference, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    
    // 라운드 정보에서 사용자 스코어 가져오기
    const roundInfo = await getQuery(db, `SELECT total_score FROM rounds WHERE round_id = ?`, [roundId]);
    const userScore = roundInfo ? roundInfo.total_score : 0;
    
    // 매치 결과 계산 (1: 승, 2: 패, 3: 무)
    let matchResult = 3; // 기본값: 무승부
    if (userScore < partner.totalScore) {
      matchResult = 1; // 승리
    } else if (userScore > partner.totalScore) {
      matchResult = 2; // 패배
    }
    
    // 점수 차이 계산
    const scoreDifference = userScore - partner.totalScore;
    
    const params = [
      roundId,
      userId,
      partner.partnerUserId || null,
      partner.partnerName || null,
      partner.totalScore,
      matchResult,
      scoreDifference
    ];
    
    try {
      const result = await runQuery(db, sql, params);
      logMessage(`동반자 ${partner.partnerName || partner.partnerUserId} 데이터가 추가되었습니다. (ID: ${result.lastID})`);
    } catch (error) {
      logError(error, `동반자 ${partner.partnerName || partner.partnerUserId} 데이터 추가`);
    }
  }
}

/**
 * JSON 파일에서 데이터 읽기
 * @param {string} filePath - JSON 파일 경로
 */
function readDataFromJson(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    logError(error, `JSON 파일 읽기 (${filePath})`);
    return null;
  }
}

/**
 * 메인 함수 - 라운드 데이터 입력
 */
async function insertRoundData() {
  // 명령줄 인수에서 데이터 파일 경로 가져오기
  const dataFilePath = process.argv[2] || DATA_FILE;
  
  logMessage(`데이터 파일 경로: ${dataFilePath}`);
  
  // JSON 파일에서 데이터 읽기
  const data = readDataFromJson(dataFilePath);
  if (!data) {
    logMessage('데이터 파일을 읽을 수 없습니다. 기본 샘플 데이터를 사용합니다.');
    
    // 샘플 데이터 생성
    const sampleData = {
      roundId: 1,
      holesData: [
        { courseNumber: 1, holeNumber: 1, par: 4, score: 5, putts: 2, fairwayHit: true, greenHit: false, greenInRegulation: false, sandSave: false, upAndDown: false, penalties: 0 },
        { courseNumber: 1, holeNumber: 2, par: 3, score: 3, putts: 2, fairwayHit: true, greenHit: true, greenInRegulation: true, sandSave: false, upAndDown: false, penalties: 0 },
        { courseNumber: 1, holeNumber: 3, par: 5, score: 6, putts: 2, fairwayHit: false, greenHit: false, greenInRegulation: false, sandSave: false, upAndDown: false, penalties: 1 },
        { courseNumber: 1, holeNumber: 4, par: 4, score: 4, putts: 1, fairwayHit: true, greenHit: true, greenInRegulation: true, sandSave: false, upAndDown: false, penalties: 0 },
        { courseNumber: 1, holeNumber: 5, par: 3, score: 4, putts: 2, fairwayHit: true, greenHit: false, greenInRegulation: false, sandSave: false, upAndDown: false, penalties: 0 },
        { courseNumber: 1, holeNumber: 6, par: 5, score: 5, putts: 2, fairwayHit: true, greenHit: true, greenInRegulation: true, sandSave: false, upAndDown: false, penalties: 0 },
        { courseNumber: 1, holeNumber: 7, par: 4, score: 5, putts: 2, fairwayHit: false, greenHit: true, greenInRegulation: false, sandSave: false, upAndDown: false, penalties: 1 },
        { courseNumber: 1, holeNumber: 8, par: 3, score: 3, putts: 1, fairwayHit: true, greenHit: true, greenInRegulation: true, sandSave: false, upAndDown: false, penalties: 0 },
        { courseNumber: 1, holeNumber: 9, par: 5, score: 7, putts: 3, fairwayHit: false, greenHit: false, greenInRegulation: false, sandSave: false, upAndDown: false, penalties: 2 }
      ],
      shotsData: [
        // 1번 홀
        { courseNumber: 1, holeNumber: 1, shotSequence: 1, club: 'Driver', clubCategory: 'Driver', isFairwayShot: true, isGreenShot: false, isPutt: false, distance: 240, carryDistance: 220 },
        { courseNumber: 1, holeNumber: 1, shotSequence: 2, club: '7I', clubCategory: 'Iron', isFairwayShot: false, isGreenShot: true, isPutt: false, distance: 150, carryDistance: 145 },
        { courseNumber: 1, holeNumber: 1, shotSequence: 3, club: 'PW', clubCategory: 'Wedge', isFairwayShot: false, isGreenShot: true, isPutt: false, distance: 30, carryDistance: 28 },
        { courseNumber: 1, holeNumber: 1, shotSequence: 4, club: 'Putter', clubCategory: 'Putter', isFairwayShot: false, isGreenShot: false, isPutt: true, distance: 5 },
        { courseNumber: 1, holeNumber: 1, shotSequence: 5, club: 'Putter', clubCategory: 'Putter', isFairwayShot: false, isGreenShot: false, isPutt: true, distance: 0.5 },
        
        // 2번 홀
        { courseNumber: 1, holeNumber: 2, shotSequence: 1, club: '5I', clubCategory: 'Iron', isFairwayShot: false, isGreenShot: true, isPutt: false, distance: 180, carryDistance: 175 },
        { courseNumber: 1, holeNumber: 2, shotSequence: 2, club: 'Putter', clubCategory: 'Putter', isFairwayShot: false, isGreenShot: false, isPutt: true, distance: 6 },
        { courseNumber: 1, holeNumber: 2, shotSequence: 3, club: 'Putter', clubCategory: 'Putter', isFairwayShot: false, isGreenShot: false, isPutt: true, distance: 0.3 }
      ],
      partnersData: [
        { partnerUserId: 2, totalScore: 85 },
        { partnerName: '홍길동', totalScore: 92 }
      ]
    };
    
    // 샘플 데이터 파일로 저장
    const sampleFilePath = path.join(__dirname, 'round-data-sample.json');
    fs.writeFileSync(sampleFilePath, JSON.stringify(sampleData, null, 2), 'utf8');
    logMessage(`샘플 데이터 파일이 생성되었습니다: ${sampleFilePath}`);
    
    // 샘플 데이터 사용
    data = sampleData;
  }
  
  const { roundId, holesData, shotsData, partnersData } = data;
  
  // DB 연결
  const db = connectDB();
  
  try {
    // 트랜잭션 시작
    await runQuery(db, 'BEGIN TRANSACTION');
    
    // 라운드 정보 확인
    const roundInfo = await getQuery(db, `SELECT * FROM rounds WHERE round_id = ?`, [roundId]);
    if (!roundInfo) {
      throw new Error(`ID가 ${roundId}인 라운드를 찾을 수 없습니다.`);
    }
    
    const userId = roundInfo.user_id;
    const courseId = roundInfo.course_id;
    
    logMessage(`라운드 정보: ID=${roundId}, 사용자 ID=${userId}, 코스 ID=${courseId}`);
    
    // 홀별 결과 추가
    await addRoundHoles(db, roundId, holesData);
    
    // 샷 정보 추가
    await addShots(db, roundId, userId, courseId, shotsData);
    
    // 동반자 정보 추가
    await addRoundPartners(db, roundId, userId, partnersData);
    
    // 트랜잭션 커밋
    await runQuery(db, 'COMMIT');
    
    logMessage('모든 데이터가 성공적으로 추가되었습니다.');
  } catch (error) {
    // 오류 발생 시 롤백
    await runQuery(db, 'ROLLBACK');
    logError(error, '데이터 추가');
  } finally {
    // DB 연결 종료
    db.close();
    logMessage('데이터베이스 연결이 종료되었습니다.');
  }
}

// 스크립트 실행
insertRoundData().catch(error => {
  logError(error, '스크립트 실행');
}); 