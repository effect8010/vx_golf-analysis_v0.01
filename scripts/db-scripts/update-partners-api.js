/**
 * 동반자 조회 관련 API 코드 업데이트 예시
 * 
 * 이 파일은 round_partners 테이블을 제거하고 동반자 조회 방식으로 변경함에 따라
 * 수정이 필요한 API 코드 예시를 제공합니다.
 * 
 * server/controllers/roundController.js 와 server/models/roundModel.js 파일에
 * 아래 내용을 반영하여 수정하세요.
 */

/**
 * ===== models/roundModel.js 파일에 추가할 함수 =====
 */

/**
 * 특정 사용자의 라운드 동반자 목록 조회
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Array>} - 동반자 목록
 */
async function getUserPartners(userId) {
  const query = `
    SELECT 
      r1.round_id,
      r1.user_id AS user_id,
      r2.user_id AS partner_id,
      u.username AS partner_username,
      u.full_name AS partner_name,
      r2.total_score AS partner_score,
      r1.round_date,
      c.course_name,
      CASE 
        WHEN r1.total_score < r2.total_score THEN 1  -- 승리
        WHEN r1.total_score > r2.total_score THEN -1 -- 패배
        ELSE 0                                       -- 무승부
      END AS match_result,
      ABS(r1.total_score - r2.total_score) AS score_difference
    FROM 
      rounds r1
    JOIN 
      rounds r2 ON r1.round_id = r2.round_id AND r1.user_id != r2.user_id
    JOIN 
      users u ON r2.user_id = u.user_id
    JOIN
      golf_courses c ON r1.course_id = c.course_id
    WHERE 
      r1.user_id = ?
    ORDER BY
      r1.round_date DESC
  `;
  
  return await db.all(query, [userId]);
}

/**
 * 특정 라운드의 참가자 목록 조회
 * @param {number} roundId - 라운드 ID
 * @returns {Promise<Array>} - 참가자 목록
 */
async function getRoundParticipants(roundId) {
  const query = `
    SELECT 
      r.user_id, 
      u.username, 
      u.full_name, 
      r.total_score,
      r.course_id,
      c.course_name
    FROM 
      rounds r
    JOIN 
      users u ON r.user_id = u.user_id
    JOIN
      golf_courses c ON r.course_id = c.course_id
    WHERE 
      r.round_id = ?
  `;
  
  return await db.all(query, [roundId]);
}

/**
 * 특정 사용자가 함께 플레이한 동반자 통계
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Array>} - 동반자 통계
 */
async function getPartnerStats(userId) {
  const query = `
    SELECT 
      r2.user_id AS partner_id,
      u.username AS partner_username,
      u.full_name AS partner_name,
      COUNT(r1.round_id) AS rounds_together,
      SUM(CASE WHEN r1.total_score < r2.total_score THEN 1 ELSE 0 END) AS wins,
      SUM(CASE WHEN r1.total_score > r2.total_score THEN 1 ELSE 0 END) AS losses,
      SUM(CASE WHEN r1.total_score = r2.total_score THEN 1 ELSE 0 END) AS draws,
      AVG(r2.total_score) AS avg_score,
      AVG(ABS(r1.total_score - r2.total_score)) AS avg_score_diff
    FROM 
      rounds r1
    JOIN 
      rounds r2 ON r1.round_id = r2.round_id AND r1.user_id != r2.user_id
    JOIN 
      users u ON r2.user_id = u.user_id
    WHERE 
      r1.user_id = ?
    GROUP BY 
      r2.user_id
    ORDER BY 
      rounds_together DESC,
      wins DESC
  `;
  
  return await db.all(query, [userId]);
}

/**
 * ===== controllers/roundController.js 파일에 추가할 함수 =====
 */

/**
 * 사용자의 동반자 목록 조회
 * @route GET /api/users/:userId/partners
 */
async function getUserPartners(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    
    // 자신의 정보만 조회 가능하도록 권한 체크
    if (req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({ error: '다른 사용자의 동반자 정보를 조회할 권한이 없습니다.' });
    }
    
    const partners = await RoundModel.getUserPartners(userId);
    
    res.json({
      success: true,
      data: partners
    });
  } catch (error) {
    console.error('동반자 목록 조회 오류:', error);
    res.status(500).json({ error: '동반자 목록을 조회하는 중 오류가 발생했습니다.' });
  }
}

/**
 * 라운드 참가자 목록 조회
 * @route GET /api/rounds/:roundId/participants
 */
async function getRoundParticipants(req, res) {
  try {
    const roundId = parseInt(req.params.roundId);
    
    // 라운드 정보 조회
    const round = await RoundModel.findById(roundId);
    if (!round) {
      return res.status(404).json({ error: '라운드를 찾을 수 없습니다.' });
    }
    
    // 라운드 참가자 목록 조회
    const participants = await RoundModel.getRoundParticipants(roundId);
    
    res.json({
      success: true,
      data: participants
    });
  } catch (error) {
    console.error('라운드 참가자 목록 조회 오류:', error);
    res.status(500).json({ error: '라운드 참가자 목록을 조회하는 중 오류가 발생했습니다.' });
  }
}

/**
 * 사용자의 동반자 통계 조회
 * @route GET /api/users/:userId/partner-stats
 */
async function getPartnerStats(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    
    // 자신의 정보만 조회 가능하도록 권한 체크
    if (req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({ error: '다른 사용자의 동반자 통계를 조회할 권한이 없습니다.' });
    }
    
    const partnerStats = await RoundModel.getPartnerStats(userId);
    
    res.json({
      success: true,
      data: partnerStats
    });
  } catch (error) {
    console.error('동반자 통계 조회 오류:', error);
    res.status(500).json({ error: '동반자 통계를 조회하는 중 오류가 발생했습니다.' });
  }
}

/**
 * ===== routes/userRoutes.js 파일에 추가할 라우트 =====
 */

// router.get('/:userId/partners', authenticateToken, roundController.getUserPartners);
// router.get('/:userId/partner-stats', authenticateToken, roundController.getPartnerStats);

/**
 * ===== routes/roundRoutes.js 파일에 추가할 라우트 =====
 */

// router.get('/:roundId/participants', authenticateToken, roundController.getRoundParticipants); 