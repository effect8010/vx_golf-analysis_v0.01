const fs = require('fs');
const path = require('path');

console.log('[INFO] 대시보드 API 수정 시작');

// 서버에 history API 추가
const addHistoryRoute = () => {
  // 서버 라우트 파일 읽기
  const roundRoutesPath = path.join(__dirname, 'server/routes/roundRoutes.js');
  const controllerPath = path.join(__dirname, 'server/controllers/roundController.js');
  
  console.log(`[INFO] 라우트 파일 경로: ${roundRoutesPath}`);
  console.log(`[INFO] 컨트롤러 파일 경로: ${controllerPath}`);
  
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
    
    console.log(\`[INFO] 사용자 ID \${userId}의 최근 \${limit}개 라운드 기록 조회\`);
    
    // 라운드 목록 조회 (최신순)
    const rounds = await RoundModel.getUserRecentRounds(userId, limit);
    
    if (!rounds || rounds.length === 0) {
      console.log(\`[INFO] 사용자 ID \${userId}의 라운드 기록이 없습니다.\`);
      return res.status(200).json({
        status: 'success',
        data: []
      });
    }
    
    console.log(\`[INFO] 사용자 ID \${userId}의 라운드 기록 \${rounds.length}개 조회 성공\`);
    
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

// RoundModel에 getUserRecentRounds 함수 추가
const addModelFunction = () => {
  const modelPath = path.join(__dirname, 'server/models/roundModel.js');
  console.log(`[INFO] 모델 파일 경로: ${modelPath}`);
  
  let modelContent = fs.readFileSync(modelPath, 'utf8');
  
  // getUserRecentRounds 함수가 이미 존재하는지 확인
  if (!modelContent.includes('getUserRecentRounds')) {
    // 마지막 중괄호 위치 찾기
    const lastBracePos = modelContent.lastIndexOf('};');
    
    // getUserRecentRounds 함수 추가
    const functionContent = `
  // 사용자의 최근 라운드 조회 (최신순)
  getUserRecentRounds: async (userId, limit = 10) => {
    const sql = \`
      SELECT r.*, c.course_name
      FROM rounds r
      LEFT JOIN golf_courses c ON r.course_id = c.course_id
      WHERE r.user_id = ?
      ORDER BY r.round_date DESC, r.round_time DESC
      LIMIT ?
    \`;
    
    return await db.all(sql, [userId, limit]);
  },
`;
    
    // 함수 추가
    const newModelContent = modelContent.slice(0, lastBracePos) + 
      functionContent + 
      modelContent.slice(lastBracePos);
    
    fs.writeFileSync(modelPath, newModelContent);
    console.log('[INFO] 라운드 모델에 getUserRecentRounds 함수 추가 완료');
  } else {
    console.log('[INFO] 라운드 모델에 getUserRecentRounds 함수가 이미 존재합니다');
  }
};

// 실행
try {
  addHistoryRoute();
  addModelFunction();
  console.log('[INFO] 대시보드 API 수정 완료. 서버를 재시작하면 변경사항이 적용됩니다.');
} catch (error) {
  console.error('[ERROR] 작업 중 오류 발생:', error);
} 