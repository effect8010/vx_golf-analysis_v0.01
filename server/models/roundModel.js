const db = require('./db');

// 라운드 모델
const RoundModel = {
  // 새 라운드 생성
  createRound: async (roundData) => {
    const {
      user_id,
      course_id,
      first_course_number,
      second_course_number,
      round_date,
      round_time,
      total_score,
      total_putts,
      fairways_hit,
      fairways_total,
      greens_hit,
      greens_total,
      penalties,
      birdies,
      pars,
      bogeys,
      doubles_or_worse,
      green_speed,
      player_level,
      wind_speed,
      concede_distance,
      mulligan_allowed,
      mulligan_used,
      weather_condition,
      temperature,
      status
    } = roundData;
    
    const sql = `
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
    `;
    
    const params = [
      user_id, course_id, first_course_number, second_course_number,
      round_date, round_time, total_score, total_putts,
      fairways_hit, fairways_total, greens_hit, greens_total,
      penalties, birdies, pars, bogeys, doubles_or_worse,
      green_speed, player_level, wind_speed, concede_distance,
      mulligan_allowed, mulligan_used, weather_condition,
      temperature, status
    ];
    
    const result = await db.run(sql, params);
    return result.lastID;
  },
  
  // 홀별 라운드 결과 추가
  addRoundHole: async (holeData) => {
    const {
      round_id,
      course_number,
      hole_number,
      par,
      score,
      putts,
      fairway_hit,
      green_hit,
      green_in_regulation,
      sand_save,
      up_and_down,
      penalties,
      putt_distance_first,
      result_type
    } = holeData;
    
    const sql = `
      INSERT INTO round_holes (
        round_id, course_number, hole_number, par, score,
        putts, fairway_hit, green_hit, green_in_regulation,
        sand_save, up_and_down, penalties, putt_distance_first,
        result_type
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      round_id, course_number, hole_number, par, score,
      putts, fairway_hit, green_hit, green_in_regulation,
      sand_save, up_and_down, penalties, putt_distance_first,
      result_type
    ];
    
    const result = await db.run(sql, params);
    return result.lastID;
  },
  
  // 라운드 파트너 정보 추가
  addRoundPartner: async (partnerData) => {
    const {
      round_id,
      user_id,
      partner_user_id,
      partner_name,
      total_score,
      match_result,
      score_difference
    } = partnerData;
    
    const sql = `
      INSERT INTO round_partners (
        round_id, user_id, partner_user_id, partner_name,
        total_score, match_result, score_difference, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    
    const params = [
      round_id, user_id, partner_user_id, partner_name,
      total_score, match_result, score_difference
    ];
    
    const result = await db.run(sql, params);
    return result.lastID;
  },
  
  // 라운드 ID로 라운드 조회
  findRoundById: async (roundId) => {
    const sql = `
      SELECT r.*, c.course_name 
      FROM rounds r
      JOIN golf_courses c ON r.course_id = c.course_id
      WHERE r.round_id = ?
    `;
    
    return await db.get(sql, [roundId]);
  },
  
  // 사용자의 모든 라운드 조회
  getUserRounds: async (userId, limit = 10, offset = 0) => {
    const sql = `
      SELECT r.*, c.course_name 
      FROM rounds r
      JOIN golf_courses c ON r.course_id = c.course_id
      WHERE r.user_id = ?
      ORDER BY r.round_date DESC, r.round_time DESC
      LIMIT ? OFFSET ?
    `;
    
    return await db.all(sql, [userId, limit, offset]);
  },
  
  // 사용자의 라운드 총 개수
  getUserRoundsCount: async (userId) => {
    const sql = 'SELECT COUNT(*) as count FROM rounds WHERE user_id = ?';
    const result = await db.get(sql, [userId]);
    return result.count;
  },
  
  // 최근 N개의 라운드 조회
  getRecentRounds: async (userId, count = 5) => {
    const sql = `
      SELECT r.*, c.course_name 
      FROM rounds r
      JOIN golf_courses c ON r.course_id = c.course_id
      WHERE r.user_id = ? AND r.status = 1
      ORDER BY r.round_date DESC, r.round_time DESC
      LIMIT ?
    `;
    
    return await db.all(sql, [userId, count]);
  },
  
  // 코스의 모든 라운드 조회
  getCourseRounds: async (courseId, limit = 10, offset = 0) => {
    const sql = `
      SELECT r.*, u.username, u.full_name 
      FROM rounds r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.course_id = ? AND r.status = 1
      ORDER BY r.round_date DESC, r.round_time DESC
      LIMIT ? OFFSET ?
    `;
    
    return await db.all(sql, [courseId, limit, offset]);
  },
  
  // 라운드의 홀별 결과 조회
  getRoundHoles: async (roundId) => {
    const sql = `
      SELECT * FROM round_holes
      WHERE round_id = ?
      ORDER BY course_number, hole_number
    `;
    
    return await db.all(sql, [roundId]);
  },
  
  // 라운드의 파트너 정보 조회
  getRoundPartners: async (roundId) => {
    const sql = `
      SELECT rp.*, u.username, u.full_name 
      FROM round_partners rp
      LEFT JOIN users u ON rp.partner_user_id = u.user_id
      WHERE rp.round_id = ?
    `;
    
    return await db.all(sql, [roundId]);
  },
  
  // 날짜 범위로 라운드 조회
  getRoundsByDateRange: async (userId, startDate, endDate) => {
    const sql = `
      SELECT r.*, c.course_name 
      FROM rounds r
      JOIN golf_courses c ON r.course_id = c.course_id
      WHERE r.user_id = ? AND r.round_date BETWEEN ? AND ? AND r.status = 1
      ORDER BY r.round_date ASC, r.round_time ASC
    `;
    
    return await db.all(sql, [userId, startDate, endDate]);
  },
  
  // 코스별 라운드 통계
  getRoundStatsByCourse: async (userId, courseId) => {
    const sql = `
      SELECT 
        COUNT(*) as total_rounds,
        MIN(total_score) as best_score,
        AVG(total_score) as avg_score,
        AVG(total_putts) as avg_putts,
        AVG(fairways_hit * 100.0 / fairways_total) as fairway_hit_rate,
        AVG(greens_hit * 100.0 / greens_total) as green_hit_rate,
        MAX(round_date) as last_played
      FROM rounds
      WHERE user_id = ? AND course_id = ? AND status = 1
    `;
    
    return await db.get(sql, [userId, courseId]);
  },
  
  // 라운드 정보 업데이트
  updateRound: async (roundId, roundData) => {
    const {
      total_score,
      total_putts,
      fairways_hit,
      fairways_total,
      greens_hit,
      greens_total,
      penalties,
      birdies,
      pars,
      bogeys,
      doubles_or_worse,
      status
    } = roundData;
    
    const sql = `
      UPDATE rounds
      SET total_score = ?, total_putts = ?, 
          fairways_hit = ?, fairways_total = ?,
          greens_hit = ?, greens_total = ?,
          penalties = ?, birdies = ?, pars = ?,
          bogeys = ?, doubles_or_worse = ?, status = ?
      WHERE round_id = ?
    `;
    
    const params = [
      total_score, total_putts,
      fairways_hit, fairways_total,
      greens_hit, greens_total,
      penalties, birdies, pars,
      bogeys, doubles_or_worse, status,
      roundId
    ];
    
    const result = await db.run(sql, params);
    return result.changes > 0;
  },
  
  // 홀 정보 업데이트
  updateRoundHole: async (holeId, holeData) => {
    const {
      score,
      putts,
      fairway_hit,
      green_hit,
      green_in_regulation,
      sand_save,
      up_and_down,
      penalties,
      putt_distance_first,
      result_type
    } = holeData;
    
    const sql = `
      UPDATE round_holes
      SET score = ?, putts = ?, fairway_hit = ?,
          green_hit = ?, green_in_regulation = ?, 
          sand_save = ?, up_and_down = ?, penalties = ?,
          putt_distance_first = ?, result_type = ?
      WHERE hole_id = ?
    `;
    
    const params = [
      score, putts, fairway_hit,
      green_hit, green_in_regulation,
      sand_save, up_and_down, penalties,
      putt_distance_first, result_type,
      holeId
    ];
    
    const result = await db.run(sql, params);
    return result.changes > 0;
  },
  
  // 라운드 삭제 (관련 데이터 포함)
  deleteRound: async (roundId) => {
    try {
      await db.exec('BEGIN TRANSACTION');
      
      // 샷 데이터 삭제
      await db.run('DELETE FROM shots WHERE round_id = ?', [roundId]);
      
      // 홀 데이터 삭제
      await db.run('DELETE FROM round_holes WHERE round_id = ?', [roundId]);
      
      // 파트너 데이터 삭제
      await db.run('DELETE FROM round_partners WHERE round_id = ?', [roundId]);
      
      // 라운드 삭제
      const result = await db.run('DELETE FROM rounds WHERE round_id = ?', [roundId]);
      
      await db.exec('COMMIT');
      
      return result.changes > 0;
    } catch (error) {
      await db.exec('ROLLBACK');
      throw error;
    }
  },

  // 사용자의 최근 라운드 조회 (최신순)
  getUserRecentRounds: async (userId, limit = 10) => {
    const sql = `
      SELECT r.*, c.course_name
      FROM rounds r
      LEFT JOIN golf_courses c ON r.course_id = c.course_id
      WHERE r.user_id = ?
      ORDER BY r.round_date DESC, r.round_time DESC
      LIMIT ?
    `;
    
    return await db.all(sql, [userId, limit]);
  }
};

module.exports = RoundModel; 