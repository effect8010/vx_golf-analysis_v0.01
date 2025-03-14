const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// 데이터베이스 연결
const db = new sqlite3.Database('./data/golf_simulator.db');
console.log('[INFO] 데이터베이스 연결 성공');

// 서버에 history API 추가
const addHistoryRoute = () => {
  // 서버 라우트 파일 읽기
  const roundRoutesPath = path.join(__dirname, 'server/routes/roundRoutes.js');
  const controllerPath = path.join(__dirname, 'server/controllers/roundController.js');
  
  let roundRoutesContent = fs.readFileSync(roundRoutesPath, 'utf8');
  let controllerContent = fs.readFileSync(controllerPath, 'utf8');
  
  // history API가 이미 등록되어 있는지 확인
  if (!roundRoutesContent.includes('router.get(\'/history')) {
    // 라우터에 history 엔드포인트 추가
    const newRouteContent = roundRoutesContent.replace(
      'router.get(\'/users/:userId\', roundController.getUserRounds);',
      'router.get(\'/users/:userId\', roundController.getUserRounds);\n\n// 최근 라운드 기록 조회\nrouter.get(\'/history\', roundController.getRoundHistory);'
    );
    
    fs.writeFileSync(roundRoutesPath, newRouteContent);
    console.log('[INFO] 라운드 라우터에 history API 추가 완료');
  } else {
    console.log('[INFO] 라운드 라우터에 history API가 이미 존재합니다');
  }
  
  // 컨트롤러에 getRoundHistory 함수 추가 (이미 있다면 수정하지 않음)
  if (!controllerContent.includes('const getRoundHistory')) {
    // 마지막 모듈 내보내기 부분을 찾음
    const moduleExportsPos = controllerContent.lastIndexOf('module.exports');
    
    // getRoundHistory 함수 추가
    const historyFunctionContent = `
/**
 * 최근 라운드 기록 조회
 */
const getRoundHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 10;
    
    // 라운드 목록 조회 (최신순)
    const sql = \`
      SELECT r.*, c.course_name
      FROM rounds r
      LEFT JOIN golf_courses c ON r.course_id = c.course_id
      WHERE r.user_id = ?
      ORDER BY r.round_date DESC
      LIMIT ?
    \`;
    
    const rounds = await new Promise((resolve, reject) => {
      db.all(sql, [userId, limit], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    // 응답 데이터 가공
    const roundsData = rounds.map(round => ({
      roundId: round.round_id,
      courseName: round.course_name,
      courseId: round.course_id,
      roundDate: round.round_date,
      totalScore: round.total_score,
      totalPutts: round.total_putts,
      fairwaysHit: round.fairways_hit,
      greensHit: round.greens_hit
    }));
    
    // 응답
    return res.status(200).json({
      status: 'success',
      data: roundsData
    });
  } catch (error) {
    console.error('최근 라운드 기록 조회 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};
`;
    
    // 함수 추가 및 export에 포함
    const newControllerContent = controllerContent.slice(0, moduleExportsPos) + 
      historyFunctionContent + 
      controllerContent.slice(moduleExportsPos).replace(
        'module.exports = {',
        'module.exports = {\n  getRoundHistory,'
      );
    
    fs.writeFileSync(controllerPath, newControllerContent);
    console.log('[INFO] 라운드 컨트롤러에 getRoundHistory 함수 추가 완료');
  } else {
    console.log('[INFO] 라운드 컨트롤러에 getRoundHistory 함수가 이미 존재합니다');
  }
};

// kim 사용자에게 라운드 데이터 추가
const addKimRounds = async () => {
  // 현재 시간 기준 최근 날짜
  const today = new Date();
  
  // 라운드 데이터
  const rounds = [
    {
      user_id: 1, // kim
      course_id: 2, // 그린힐스 컨트리클럽
      first_course_number: 1,
      second_course_number: 2,
      round_date: formatDate(new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)), // 3일 전
      round_time: '09:00',
      total_score: 82,
      total_putts: 30,
      fairways_hit: 8,
      fairways_total: 14,
      greens_hit: 10,
      greens_total: 18,
      penalties: 2,
      birdies: 1,
      pars: 7,
      bogeys: 8,
      doubles_or_worse: 2,
      status: 'completed'
    },
    {
      user_id: 1, // kim
      course_id: 3, // 블루오션 골프클럽
      first_course_number: 1,
      second_course_number: null,
      round_date: formatDate(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)), // 7일 전
      round_time: '13:30',
      total_score: 85,
      total_putts: 32,
      fairways_hit: 7,
      fairways_total: 14,
      greens_hit: 9,
      greens_total: 18,
      penalties: 3,
      birdies: 0,
      pars: 6,
      bogeys: 9,
      doubles_or_worse: 3,
      status: 'completed'
    },
    {
      user_id: 1, // kim
      course_id: 2, // 그린힐스 컨트리클럽
      first_course_number: 2,
      second_course_number: 1,
      round_date: formatDate(new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)), // 14일 전
      round_time: '10:00',
      total_score: 87,
      total_putts: 33,
      fairways_hit: 6,
      fairways_total: 14,
      greens_hit: 8,
      greens_total: 18,
      penalties: 4,
      birdies: 0,
      pars: 5,
      bogeys: 10,
      doubles_or_worse: 3,
      status: 'completed'
    }
  ];
  
  console.log('[INFO] kim 사용자에게 라운드 데이터 추가 시작');
  
  // 트랜잭션 시작
  db.run('BEGIN TRANSACTION');
  
  try {
    for (const round of rounds) {
      const {
        user_id, course_id, first_course_number, second_course_number,
        round_date, round_time, total_score, total_putts,
        fairways_hit, fairways_total, greens_hit, greens_total,
        penalties, birdies, pars, bogeys, doubles_or_worse, status
      } = round;
      
      const sql = `
        INSERT INTO rounds (
          user_id, course_id, first_course_number, second_course_number,
          round_date, round_time, total_score, total_putts,
          fairways_hit, fairways_total, greens_hit, greens_total,
          penalties, birdies, pars, bogeys, doubles_or_worse,
          status, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;
      
      const params = [
        user_id, course_id, first_course_number, second_course_number,
        round_date, round_time, total_score, total_putts,
        fairways_hit, fairways_total, greens_hit, greens_total,
        penalties, birdies, pars, bogeys, doubles_or_worse,
        status
      ];
      
      await new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        });
      });
    }
    
    // 트랜잭션 완료
    db.run('COMMIT');
    console.log(`[INFO] kim 사용자에게 ${rounds.length}개의 라운드 데이터 추가 완료`);
  } catch (error) {
    // 오류 발생 시 롤백
    db.run('ROLLBACK');
    console.error('[ERROR] 라운드 데이터 추가 중 오류 발생:', error);
  }
};

// 날짜 포맷 함수 (YYYY-MM-DD)
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 실행
(async () => {
  try {
    // kim 사용자 데이터 확인
    const userExists = await new Promise((resolve, reject) => {
      db.get('SELECT user_id FROM users WHERE user_id = 1', (err, row) => {
        if (err) reject(err);
        else resolve(!!row);
      });
    });
    
    if (!userExists) {
      console.log('[ERROR] kim 사용자가 존재하지 않습니다.');
      db.close();
      return;
    }
    
    // kim 사용자의 라운드 데이터 개수 확인
    const roundCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM rounds WHERE user_id = 1', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
    
    console.log(`[INFO] kim 사용자의 현재 라운드 데이터 개수: ${roundCount}개`);
    
    // history API 추가
    addHistoryRoute();
    
    // 라운드 데이터 추가
    await addKimRounds();
    
    console.log('[INFO] 작업 완료');
  } catch (error) {
    console.error('[ERROR] 작업 중 오류 발생:', error);
  } finally {
    // 데이터베이스 연결 종료
    db.close(() => {
      console.log('[INFO] 데이터베이스 연결이 종료되었습니다.');
    });
  }
})(); 