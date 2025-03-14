const db = require('./db');

// 샷 모델
const ShotModel = {
  // 새 샷 정보 추가
  createShot: async (shotData) => {
    const {
      round_id,
      user_id,
      course_id,
      course_number,
      hole_number,
      shot_time,
      shot_sequence,
      club,
      club_category,
      terrain,
      shot_type,
      distance,
      carry_distance,
      club_speed,
      attack_angle,
      ball_speed,
      smash_factor,
      vertical_angle,
      horizontal_angle,
      total_spin,
      side_spin,
      back_spin,
      remaining_distance,
      hang_time,
      club_path,
      face_angle,
      is_fairway_shot,
      is_green_shot,
      is_putt,
      distance_to_pin_before,
      distance_to_pin_after,
      distance_to_target,
      accuracy,
      dispersion_left,
      dispersion_right,
      shot_quality
    } = shotData;
    
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
    
    const params = [
      round_id, user_id, course_id, course_number, hole_number,
      shot_time, shot_sequence, club, club_category, terrain,
      shot_type, distance, carry_distance, club_speed, attack_angle,
      ball_speed, smash_factor, vertical_angle, horizontal_angle,
      total_spin, side_spin, back_spin, remaining_distance,
      hang_time, club_path, face_angle, is_fairway_shot,
      is_green_shot, is_putt, distance_to_pin_before,
      distance_to_pin_after, distance_to_target, accuracy,
      dispersion_left, dispersion_right, shot_quality
    ];
    
    const result = await db.run(sql, params);
    return result.lastID;
  },
  
  // 라운드의 모든 샷 조회
  getRoundShots: async (roundId) => {
    const sql = `
      SELECT * FROM shots
      WHERE round_id = ?
      ORDER BY course_number, hole_number, shot_sequence
    `;
    
    return await db.all(sql, [roundId]);
  },
  
  // 라운드의 특정 홀 샷 조회
  getHoleShots: async (roundId, courseNumber, holeNumber) => {
    const sql = `
      SELECT * FROM shots
      WHERE round_id = ? AND course_number = ? AND hole_number = ?
      ORDER BY shot_sequence
    `;
    
    return await db.all(sql, [roundId, courseNumber, holeNumber]);
  },
  
  // 사용자의 클럽별 샷 통계
  getUserClubStats: async (userId, clubName) => {
    const sql = `
      SELECT 
        COUNT(*) as shot_count,
        AVG(distance) as avg_distance,
        AVG(carry_distance) as avg_carry_distance,
        MAX(distance) as max_distance,
        AVG(club_speed) as avg_club_speed,
        AVG(ball_speed) as avg_ball_speed,
        AVG(smash_factor) as avg_smash_factor,
        AVG(total_spin) as avg_total_spin,
        AVG(side_spin) as avg_side_spin,
        AVG(back_spin) as avg_back_spin,
        AVG(CASE WHEN is_fairway_shot = 1 AND terrain = 'fairway' THEN 1 ELSE 0 END) * 100 as fairway_accuracy,
        AVG(CASE WHEN is_green_shot = 1 AND terrain = 'green' THEN 1 ELSE 0 END) * 100 as green_accuracy
      FROM shots
      WHERE user_id = ? AND club = ? AND is_putt = 0
    `;
    
    return await db.get(sql, [userId, clubName]);
  },
  
  // 사용자의 클럽 카테고리별 샷 통계
  getUserClubCategoryStats: async (userId, clubCategory) => {
    const sql = `
      SELECT 
        COUNT(*) as shot_count,
        AVG(distance) as avg_distance,
        AVG(carry_distance) as avg_carry_distance,
        AVG(club_speed) as avg_club_speed,
        AVG(ball_speed) as avg_ball_speed,
        AVG(CASE WHEN is_fairway_shot = 1 AND terrain = 'fairway' THEN 1 ELSE 0 END) * 100 as fairway_accuracy,
        AVG(CASE WHEN is_green_shot = 1 AND terrain = 'green' THEN 1 ELSE 0 END) * 100 as green_accuracy
      FROM shots
      WHERE user_id = ? AND club_category = ? AND is_putt = 0
    `;
    
    return await db.get(sql, [userId, clubCategory]);
  },
  
  // 사용자의 퍼팅 통계
  getUserPuttingStats: async (userId) => {
    const sql = `
      SELECT 
        COUNT(*) as putt_count,
        AVG(CASE WHEN distance_to_pin_before <= 1 THEN distance_to_pin_after = 0 ELSE 0 END) * 100 as within_1m_pct,
        AVG(CASE WHEN distance_to_pin_before > 1 AND distance_to_pin_before <= 2 THEN distance_to_pin_after = 0 ELSE 0 END) * 100 as within_2m_pct,
        AVG(CASE WHEN distance_to_pin_before > 2 AND distance_to_pin_before <= 3 THEN distance_to_pin_after = 0 ELSE 0 END) * 100 as within_3m_pct,
        AVG(CASE WHEN distance_to_pin_before > 3 AND distance_to_pin_before <= 5 THEN distance_to_pin_after = 0 ELSE 0 END) * 100 as within_5m_pct,
        AVG(CASE WHEN distance_to_pin_before > 5 THEN distance_to_pin_after = 0 ELSE 0 END) * 100 as beyond_5m_pct,
        AVG(distance_to_pin_after) as avg_distance_after
      FROM shots
      WHERE user_id = ? AND is_putt = 1
    `;
    
    return await db.get(sql, [userId]);
  },
  
  // 사용자의 최근 N개 샷 조회
  getRecentShots: async (userId, count = 50) => {
    const sql = `
      SELECT s.*, r.round_date, c.course_name
      FROM shots s
      JOIN rounds r ON s.round_id = r.round_id
      JOIN golf_courses c ON s.course_id = c.course_id
      WHERE s.user_id = ?
      ORDER BY s.shot_time DESC
      LIMIT ?
    `;
    
    return await db.all(sql, [userId, count]);
  },
  
  // 특정 클럽의 샷 조회 (최근 N개)
  getClubShots: async (userId, clubName, count = 20) => {
    const sql = `
      SELECT s.*, r.round_date, c.course_name
      FROM shots s
      JOIN rounds r ON s.round_id = r.round_id
      JOIN golf_courses c ON s.course_id = c.course_id
      WHERE s.user_id = ? AND s.club = ?
      ORDER BY s.shot_time DESC
      LIMIT ?
    `;
    
    return await db.all(sql, [userId, clubName, count]);
  },
  
  // 날짜 범위 내 샷 통계
  getShotStatsByDateRange: async (userId, startDate, endDate) => {
    const sql = `
      SELECT 
        COUNT(*) as total_shots,
        AVG(CASE WHEN is_fairway_shot = 1 AND terrain = 'fairway' THEN 1 ELSE 0 END) * 100 as fairway_accuracy,
        AVG(CASE WHEN is_green_shot = 1 AND terrain = 'green' THEN 1 ELSE 0 END) * 100 as green_accuracy,
        AVG(CASE WHEN club_category = 'Driver' THEN distance ELSE NULL END) as avg_driver_distance,
        AVG(CASE WHEN is_putt = 1 THEN distance_to_pin_after = 0 ELSE NULL END) * 100 as putt_success_rate
      FROM shots s
      JOIN rounds r ON s.round_id = r.round_id
      WHERE s.user_id = ? AND r.round_date BETWEEN ? AND ?
    `;
    
    return await db.get(sql, [userId, startDate, endDate]);
  },
  
  // 샷 정보 수정
  updateShot: async (shotId, shotData) => {
    const {
      club,
      club_category,
      terrain,
      shot_type,
      distance,
      carry_distance,
      club_speed,
      attack_angle,
      ball_speed,
      smash_factor,
      vertical_angle,
      horizontal_angle,
      total_spin,
      side_spin,
      back_spin,
      remaining_distance,
      is_fairway_shot,
      is_green_shot
    } = shotData;
    
    const sql = `
      UPDATE shots
      SET club = ?, club_category = ?, terrain = ?, shot_type = ?,
          distance = ?, carry_distance = ?, club_speed = ?, attack_angle = ?,
          ball_speed = ?, smash_factor = ?, vertical_angle = ?, horizontal_angle = ?,
          total_spin = ?, side_spin = ?, back_spin = ?, remaining_distance = ?,
          is_fairway_shot = ?, is_green_shot = ?
      WHERE shot_id = ?
    `;
    
    const params = [
      club, club_category, terrain, shot_type,
      distance, carry_distance, club_speed, attack_angle,
      ball_speed, smash_factor, vertical_angle, horizontal_angle,
      total_spin, side_spin, back_spin, remaining_distance,
      is_fairway_shot, is_green_shot,
      shotId
    ];
    
    const result = await db.run(sql, params);
    return result.changes > 0;
  },
  
  // 샷 삭제
  deleteShot: async (shotId) => {
    const sql = 'DELETE FROM shots WHERE shot_id = ?';
    const result = await db.run(sql, [shotId]);
    return result.changes > 0;
  },
  
  // 홀의 모든 샷 삭제
  deleteHoleShots: async (roundId, courseNumber, holeNumber) => {
    const sql = 'DELETE FROM shots WHERE round_id = ? AND course_number = ? AND hole_number = ?';
    const result = await db.run(sql, [roundId, courseNumber, holeNumber]);
    return result.changes > 0;
  }
};

module.exports = ShotModel; 