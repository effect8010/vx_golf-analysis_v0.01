const db = require('./db');

// 통계 모델
const StatsModel = {
  // 사용자 종합 통계 조회
  getUserStats: async (userId) => {
    const sql = 'SELECT * FROM user_stats WHERE user_id = ?';
    return await db.get(sql, [userId]);
  },
  
  // 사용자 종합 통계 업데이트/생성
  updateUserStats: async (userId, statsData) => {
    // 사용자 통계가 이미 존재하는지 확인
    const existingQuery = 'SELECT stat_id FROM user_stats WHERE user_id = ?';
    const existing = await db.get(existingQuery, [userId]);
    
    if (existing) {
      // 기존 통계 업데이트
      const {
        total_rounds,
        avg_score,
        best_score,
        avg_driving_distance,
        avg_fairway_hit_rate,
        avg_green_hit_rate,
        avg_putts_per_round,
        par3_avg_score,
        par4_avg_score,
        par5_avg_score,
        birdie_rate,
        par_rate,
        bogey_rate,
        sand_save_rate,
        up_and_down_rate,
        gir_rate
      } = statsData;
      
      const sql = `
        UPDATE user_stats
        SET total_rounds = ?, avg_score = ?, best_score = ?,
            avg_driving_distance = ?, avg_fairway_hit_rate = ?,
            avg_green_hit_rate = ?, avg_putts_per_round = ?,
            par3_avg_score = ?, par4_avg_score = ?, par5_avg_score = ?,
            birdie_rate = ?, par_rate = ?, bogey_rate = ?,
            sand_save_rate = ?, up_and_down_rate = ?, gir_rate = ?,
            last_updated = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `;
      
      const params = [
        total_rounds, avg_score, best_score,
        avg_driving_distance, avg_fairway_hit_rate,
        avg_green_hit_rate, avg_putts_per_round,
        par3_avg_score, par4_avg_score, par5_avg_score,
        birdie_rate, par_rate, bogey_rate,
        sand_save_rate, up_and_down_rate, gir_rate,
        userId
      ];
      
      const result = await db.run(sql, params);
      return { updated: true, changes: result.changes };
    } else {
      // 새 통계 생성
      const {
        total_rounds,
        avg_score,
        best_score,
        avg_driving_distance,
        avg_fairway_hit_rate,
        avg_green_hit_rate,
        avg_putts_per_round,
        par3_avg_score,
        par4_avg_score,
        par5_avg_score,
        birdie_rate,
        par_rate,
        bogey_rate,
        sand_save_rate,
        up_and_down_rate,
        gir_rate
      } = statsData;
      
      const sql = `
        INSERT INTO user_stats (
          user_id, total_rounds, avg_score, best_score,
          avg_driving_distance, avg_fairway_hit_rate,
          avg_green_hit_rate, avg_putts_per_round,
          par3_avg_score, par4_avg_score, par5_avg_score,
          birdie_rate, par_rate, bogey_rate,
          sand_save_rate, up_and_down_rate, gir_rate,
          created_at, last_updated
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;
      
      const params = [
        userId, total_rounds, avg_score, best_score,
        avg_driving_distance, avg_fairway_hit_rate,
        avg_green_hit_rate, avg_putts_per_round,
        par3_avg_score, par4_avg_score, par5_avg_score,
        birdie_rate, par_rate, bogey_rate,
        sand_save_rate, up_and_down_rate, gir_rate
      ];
      
      const result = await db.run(sql, params);
      return { created: true, id: result.lastID };
    }
  },
  
  // 사용자 클럽별 통계 조회
  getUserClubStats: (userId, club = null) => {
    let stmt;
    if (club) {
      stmt = db.prepare('SELECT * FROM user_club_stats WHERE user_id = ? AND club = ?');
      return stmt.get(userId, club);
    } else {
      stmt = db.prepare('SELECT * FROM user_club_stats WHERE user_id = ? ORDER BY club_category, club');
      return stmt.all(userId);
    }
  },
  
  // 사용자 클럽별 통계 업데이트/생성
  updateUserClubStats: (userId, club, statsData) => {
    // 클럽 통계가 이미 존재하는지 확인
    const existing = db.prepare('SELECT stat_id FROM user_club_stats WHERE user_id = ? AND club = ?').get(userId, club);
    
    if (existing) {
      // 기존 통계 업데이트
      const {
        club_category,
        usage_count,
        avg_distance,
        avg_carry_distance,
        avg_accuracy,
        avg_ball_speed,
        avg_club_speed,
        avg_smash_factor,
        avg_vertical_angle,
        avg_back_spin,
        avg_side_spin,
        dispersion_left,
        dispersion_right,
        shot_quality_avg
      } = statsData;
      
      const stmt = db.prepare(`
        UPDATE user_club_stats
        SET club_category = ?, usage_count = ?, avg_distance = ?,
            avg_carry_distance = ?, avg_accuracy = ?, avg_ball_speed = ?,
            avg_club_speed = ?, avg_smash_factor = ?, avg_vertical_angle = ?,
            avg_back_spin = ?, avg_side_spin = ?, dispersion_left = ?,
            dispersion_right = ?, shot_quality_avg = ?, last_updated = CURRENT_TIMESTAMP
        WHERE user_id = ? AND club = ?
      `);
      
      const result = stmt.run(
        club_category, usage_count, avg_distance,
        avg_carry_distance, avg_accuracy, avg_ball_speed,
        avg_club_speed, avg_smash_factor, avg_vertical_angle,
        avg_back_spin, avg_side_spin, dispersion_left,
        dispersion_right, shot_quality_avg,
        userId, club
      );
      
      return result.changes > 0;
    } else {
      // 새 통계 생성
      const {
        club_category,
        usage_count,
        avg_distance,
        avg_carry_distance,
        avg_accuracy,
        avg_ball_speed,
        avg_club_speed,
        avg_smash_factor,
        avg_vertical_angle,
        avg_back_spin,
        avg_side_spin,
        dispersion_left,
        dispersion_right,
        shot_quality_avg
      } = statsData;
      
      const stmt = db.prepare(`
        INSERT INTO user_club_stats (
          user_id, club, club_category, usage_count,
          avg_distance, avg_carry_distance, avg_accuracy,
          avg_ball_speed, avg_club_speed, avg_smash_factor,
          avg_vertical_angle, avg_back_spin, avg_side_spin,
          dispersion_left, dispersion_right, shot_quality_avg,
          last_updated
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      
      const result = stmt.run(
        userId, club, club_category, usage_count,
        avg_distance, avg_carry_distance, avg_accuracy,
        avg_ball_speed, avg_club_speed, avg_smash_factor,
        avg_vertical_angle, avg_back_spin, avg_side_spin,
        dispersion_left, dispersion_right, shot_quality_avg
      );
      
      return result.lastInsertRowid;
    }
  },
  
  // 사용자 퍼팅 통계 조회
  getUserPuttingStats: (userId, distanceRange = null) => {
    let stmt;
    if (distanceRange) {
      stmt = db.prepare('SELECT * FROM user_putting_stats WHERE user_id = ? AND distance_range = ?');
      return stmt.get(userId, distanceRange);
    } else {
      stmt = db.prepare('SELECT * FROM user_putting_stats WHERE user_id = ? ORDER BY distance_range');
      return stmt.all(userId);
    }
  },
  
  // 사용자 퍼팅 통계 업데이트/생성
  updateUserPuttingStats: (userId, distanceRange, statsData) => {
    // 퍼팅 통계가 이미 존재하는지 확인
    const existing = db.prepare('SELECT stat_id FROM user_putting_stats WHERE user_id = ? AND distance_range = ?').get(userId, distanceRange);
    
    if (existing) {
      // 기존 통계 업데이트
      const {
        attempt_count,
        success_count,
        success_rate,
        avg_putts_after_gir,
        three_putt_count
      } = statsData;
      
      const stmt = db.prepare(`
        UPDATE user_putting_stats
        SET attempt_count = ?, success_count = ?, success_rate = ?,
            avg_putts_after_gir = ?, three_putt_count = ?,
            last_updated = CURRENT_TIMESTAMP
        WHERE user_id = ? AND distance_range = ?
      `);
      
      const result = stmt.run(
        attempt_count, success_count, success_rate,
        avg_putts_after_gir, three_putt_count,
        userId, distanceRange
      );
      
      return result.changes > 0;
    } else {
      // 새 통계 생성
      const {
        attempt_count,
        success_count,
        success_rate,
        avg_putts_after_gir,
        three_putt_count
      } = statsData;
      
      const stmt = db.prepare(`
        INSERT INTO user_putting_stats (
          user_id, distance_range, attempt_count, success_count,
          success_rate, avg_putts_after_gir, three_putt_count,
          last_updated
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      
      const result = stmt.run(
        userId, distanceRange, attempt_count, success_count,
        success_rate, avg_putts_after_gir, three_putt_count
      );
      
      return result.lastInsertRowid;
    }
  },
  
  // 사용자 트렌드 통계 조회
  getUserTrendStats: (userId, periodType, startDate = null) => {
    let stmt;
    if (startDate) {
      stmt = db.prepare('SELECT * FROM user_trend_stats WHERE user_id = ? AND period_type = ? AND period_start = ?');
      return stmt.get(userId, periodType, startDate);
    } else {
      stmt = db.prepare(`
        SELECT * FROM user_trend_stats 
        WHERE user_id = ? AND period_type = ? 
        ORDER BY period_start DESC
      `);
      return stmt.all(userId, periodType);
    }
  },
  
  // 사용자 트렌드 통계 업데이트/생성
  updateUserTrendStats: (userId, periodType, periodStart, statsData) => {
    // 트렌드 통계가 이미 존재하는지 확인
    const existing = db.prepare(
      'SELECT stat_id FROM user_trend_stats WHERE user_id = ? AND period_type = ? AND period_start = ?'
    ).get(userId, periodType, periodStart);
    
    if (existing) {
      // 기존 통계 업데이트
      const {
        period_end,
        rounds_played,
        avg_score,
        avg_fairway_hit_rate,
        avg_green_hit_rate,
        avg_putts_per_round,
        avg_driving_distance,
        handicap_change
      } = statsData;
      
      const stmt = db.prepare(`
        UPDATE user_trend_stats
        SET period_end = ?, rounds_played = ?, avg_score = ?,
            avg_fairway_hit_rate = ?, avg_green_hit_rate = ?,
            avg_putts_per_round = ?, avg_driving_distance = ?,
            handicap_change = ?, last_updated = CURRENT_TIMESTAMP
        WHERE user_id = ? AND period_type = ? AND period_start = ?
      `);
      
      const result = stmt.run(
        period_end, rounds_played, avg_score,
        avg_fairway_hit_rate, avg_green_hit_rate,
        avg_putts_per_round, avg_driving_distance,
        handicap_change,
        userId, periodType, periodStart
      );
      
      return result.changes > 0;
    } else {
      // 새 통계 생성
      const {
        period_end,
        rounds_played,
        avg_score,
        avg_fairway_hit_rate,
        avg_green_hit_rate,
        avg_putts_per_round,
        avg_driving_distance,
        handicap_change
      } = statsData;
      
      const stmt = db.prepare(`
        INSERT INTO user_trend_stats (
          user_id, period_type, period_start, period_end,
          rounds_played, avg_score, avg_fairway_hit_rate,
          avg_green_hit_rate, avg_putts_per_round,
          avg_driving_distance, handicap_change, last_updated
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      
      const result = stmt.run(
        userId, periodType, periodStart, period_end,
        rounds_played, avg_score, avg_fairway_hit_rate,
        avg_green_hit_rate, avg_putts_per_round,
        avg_driving_distance, handicap_change
      );
      
      return result.lastInsertRowid;
    }
  },
  
  // 사용자 코스 통계 조회
  getUserCourseStats: (userId, courseId = null) => {
    let stmt;
    if (courseId) {
      stmt = db.prepare('SELECT * FROM user_course_stats WHERE user_id = ? AND course_id = ?');
      return stmt.get(userId, courseId);
    } else {
      stmt = db.prepare(`
        SELECT ucs.*, gc.course_name 
        FROM user_course_stats ucs
        JOIN golf_courses gc ON ucs.course_id = gc.course_id
        WHERE ucs.user_id = ? 
        ORDER BY ucs.favorite_course DESC, ucs.last_played DESC
      `);
      return stmt.all(userId);
    }
  },
  
  // 사용자 코스 통계 업데이트/생성
  updateUserCourseStats: (userId, courseId, statsData) => {
    // 코스 통계가 이미 존재하는지 확인
    const existing = db.prepare(
      'SELECT stat_id FROM user_course_stats WHERE user_id = ? AND course_id = ?'
    ).get(userId, courseId);
    
    if (existing) {
      // 기존 통계 업데이트
      const {
        rounds_played,
        best_score,
        avg_score,
        avg_putts,
        fairway_hit_rate,
        green_hit_rate,
        favorite_course,
        last_played
      } = statsData;
      
      const stmt = db.prepare(`
        UPDATE user_course_stats
        SET rounds_played = ?, best_score = ?, avg_score = ?,
            avg_putts = ?, fairway_hit_rate = ?, green_hit_rate = ?,
            favorite_course = ?, last_played = ?, last_updated = CURRENT_TIMESTAMP
        WHERE user_id = ? AND course_id = ?
      `);
      
      const result = stmt.run(
        rounds_played, best_score, avg_score,
        avg_putts, fairway_hit_rate, green_hit_rate,
        favorite_course, last_played,
        userId, courseId
      );
      
      return result.changes > 0;
    } else {
      // 새 통계 생성
      const {
        rounds_played,
        best_score,
        avg_score,
        avg_putts,
        fairway_hit_rate,
        green_hit_rate,
        favorite_course,
        last_played
      } = statsData;
      
      const stmt = db.prepare(`
        INSERT INTO user_course_stats (
          user_id, course_id, rounds_played, best_score,
          avg_score, avg_putts, fairway_hit_rate,
          green_hit_rate, favorite_course, last_played, last_updated
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      
      const result = stmt.run(
        userId, courseId, rounds_played, best_score,
        avg_score, avg_putts, fairway_hit_rate,
        green_hit_rate, favorite_course, last_played
      );
      
      return result.lastInsertRowid;
    }
  },
  
  // 사용자 비교 통계 조회
  getUserComparisonStats: (userId, opponentId = null) => {
    let stmt;
    if (opponentId) {
      stmt = db.prepare(`
        SELECT ucs.*, u.username, u.full_name 
        FROM user_comparison_stats ucs
        JOIN users u ON ucs.opponent_id = u.user_id
        WHERE ucs.user_id = ? AND ucs.opponent_id = ?
      `);
      return stmt.get(userId, opponentId);
    } else {
      stmt = db.prepare(`
        SELECT ucs.*, u.username, u.full_name 
        FROM user_comparison_stats ucs
        JOIN users u ON ucs.opponent_id = u.user_id
        WHERE ucs.user_id = ? 
        ORDER BY ucs.total_rounds DESC
      `);
      return stmt.all(userId);
    }
  },
  
  // 사용자 비교 통계 업데이트/생성
  updateUserComparisonStats: (userId, opponentId, statsData) => {
    // 비교 통계가 이미 존재하는지 확인
    const existing = db.prepare(
      'SELECT stat_id FROM user_comparison_stats WHERE user_id = ? AND opponent_id = ?'
    ).get(userId, opponentId);
    
    if (existing) {
      // 기존 통계 업데이트
      const {
        total_rounds,
        win_count,
        loss_count,
        draw_count,
        avg_score_diff,
        driving_distance_diff,
        putting_diff,
        last_round_date
      } = statsData;
      
      const stmt = db.prepare(`
        UPDATE user_comparison_stats
        SET total_rounds = ?, win_count = ?, loss_count = ?,
            draw_count = ?, avg_score_diff = ?, driving_distance_diff = ?,
            putting_diff = ?, last_round_date = ?, last_updated = CURRENT_TIMESTAMP
        WHERE user_id = ? AND opponent_id = ?
      `);
      
      const result = stmt.run(
        total_rounds, win_count, loss_count,
        draw_count, avg_score_diff, driving_distance_diff,
        putting_diff, last_round_date,
        userId, opponentId
      );
      
      return result.changes > 0;
    } else {
      // 새 통계 생성
      const {
        total_rounds,
        win_count,
        loss_count,
        draw_count,
        avg_score_diff,
        driving_distance_diff,
        putting_diff,
        last_round_date
      } = statsData;
      
      const stmt = db.prepare(`
        INSERT INTO user_comparison_stats (
          user_id, opponent_id, total_rounds, win_count,
          loss_count, draw_count, avg_score_diff, driving_distance_diff,
          putting_diff, last_round_date, last_updated
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      
      const result = stmt.run(
        userId, opponentId, total_rounds, win_count,
        loss_count, draw_count, avg_score_diff, driving_distance_diff,
        putting_diff, last_round_date
      );
      
      return result.lastInsertRowid;
    }
  },
  
  // 홀 난이도 통계 조회
  getHoleDifficultyStats: (courseId, courseNumber = null) => {
    let stmt;
    if (courseNumber) {
      stmt = db.prepare(`
        SELECT hds.*, h.par, h.hole_type 
        FROM hole_difficulty_stats hds
        JOIN holes h ON hds.course_id = h.course_id AND hds.course_number = h.course_number AND hds.hole_number = h.hole_number
        WHERE hds.course_id = ? AND hds.course_number = ?
        ORDER BY hds.hole_number
      `);
      return stmt.all(courseId, courseNumber);
    } else {
      stmt = db.prepare(`
        SELECT hds.*, h.par, h.hole_type, cd.course_name
        FROM hole_difficulty_stats hds
        JOIN holes h ON hds.course_id = h.course_id AND hds.course_number = h.course_number AND hds.hole_number = h.hole_number
        JOIN course_details cd ON hds.course_id = cd.course_id AND hds.course_number = cd.course_number
        WHERE hds.course_id = ?
        ORDER BY hds.course_number, hds.hole_number
      `);
      return stmt.all(courseId);
    }
  },
  
  // 홀 난이도 통계 업데이트/생성
  updateHoleDifficultyStats: (courseId, courseNumber, holeNumber, statsData) => {
    // 홀 난이도 통계가 이미 존재하는지 확인
    const existing = db.prepare(
      'SELECT stat_id FROM hole_difficulty_stats WHERE course_id = ? AND course_number = ? AND hole_number = ?'
    ).get(courseId, courseNumber, holeNumber);
    
    if (existing) {
      // 기존 통계 업데이트
      const {
        total_plays,
        avg_score,
        par_diff,
        birdie_rate,
        par_rate,
        bogey_rate,
        avg_putts,
        green_hit_rate,
        fairway_hit_rate,
        difficulty_rank
      } = statsData;
      
      const stmt = db.prepare(`
        UPDATE hole_difficulty_stats
        SET total_plays = ?, avg_score = ?, par_diff = ?,
            birdie_rate = ?, par_rate = ?, bogey_rate = ?,
            avg_putts = ?, green_hit_rate = ?, fairway_hit_rate = ?,
            difficulty_rank = ?, last_updated = CURRENT_TIMESTAMP
        WHERE course_id = ? AND course_number = ? AND hole_number = ?
      `);
      
      const result = stmt.run(
        total_plays, avg_score, par_diff,
        birdie_rate, par_rate, bogey_rate,
        avg_putts, green_hit_rate, fairway_hit_rate,
        difficulty_rank,
        courseId, courseNumber, holeNumber
      );
      
      return result.changes > 0;
    } else {
      // 새 통계 생성
      const {
        total_plays,
        avg_score,
        par_diff,
        birdie_rate,
        par_rate,
        bogey_rate,
        avg_putts,
        green_hit_rate,
        fairway_hit_rate,
        difficulty_rank
      } = statsData;
      
      const stmt = db.prepare(`
        INSERT INTO hole_difficulty_stats (
          course_id, course_number, hole_number, total_plays,
          avg_score, par_diff, birdie_rate, par_rate, bogey_rate,
          avg_putts, green_hit_rate, fairway_hit_rate,
          difficulty_rank, last_updated
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      
      const result = stmt.run(
        courseId, courseNumber, holeNumber, total_plays,
        avg_score, par_diff, birdie_rate, par_rate, bogey_rate,
        avg_putts, green_hit_rate, fairway_hit_rate,
        difficulty_rank
      );
      
      return result.lastInsertRowid;
    }
  },
  
  // 사용자 통계 데이터 계산 및 업데이트 (라운드 데이터 기반)
  calculateAndUpdateUserStats: (userId) => {
    // 트랜잭션 시작
    db.exec('BEGIN TRANSACTION');
    
    try {
      // 1. 기본 사용자 통계 계산
      const baseStatsQuery = db.prepare(`
        SELECT 
          COUNT(*) as total_rounds,
          MIN(total_score) as best_score,
          AVG(total_score) as avg_score,
          AVG(total_putts) as avg_putts_per_round,
          AVG(fairways_hit * 100.0 / fairways_total) as avg_fairway_hit_rate,
          AVG(greens_hit * 100.0 / greens_total) as avg_green_hit_rate,
          AVG(birdies * 100.0 / 18) as birdie_rate,
          AVG(pars * 100.0 / 18) as par_rate,
          AVG(bogeys * 100.0 / 18) as bogey_rate
        FROM rounds
        WHERE user_id = ? AND status = 1
      `).get(userId);
      
      // 2. 파 타입별 평균 스코어 계산
      const parTypeStatsQuery = db.prepare(`
        SELECT
          AVG(CASE WHEN h.hole_type = 3 THEN rh.score END) as par3_avg_score,
          AVG(CASE WHEN h.hole_type = 4 THEN rh.score END) as par4_avg_score,
          AVG(CASE WHEN h.hole_type = 5 THEN rh.score END) as par5_avg_score,
          AVG(CASE WHEN rh.sand_save = 1 THEN 1 ELSE 0 END) * 100 as sand_save_rate,
          AVG(CASE WHEN rh.up_and_down = 1 THEN 1 ELSE 0 END) * 100 as up_and_down_rate,
          AVG(CASE WHEN rh.green_in_regulation = 1 THEN 1 ELSE 0 END) * 100 as gir_rate
        FROM round_holes rh
        JOIN rounds r ON rh.round_id = r.round_id
        JOIN holes h ON r.course_id = h.course_id AND rh.course_number = h.course_number AND rh.hole_number = h.hole_number
        WHERE r.user_id = ? AND r.status = 1
      `).get(userId);
      
      // 3. 평균 드라이버 거리 계산
      const driverDistanceQuery = db.prepare(`
        SELECT AVG(distance) as avg_driving_distance
        FROM shots
        WHERE user_id = ? AND club = 'Driver' AND is_fairway_shot = 1
      `).get(userId);
      
      // 4. 통계 데이터 통합
      const statsData = {
        total_rounds: baseStatsQuery.total_rounds || 0,
        avg_score: baseStatsQuery.avg_score || 0,
        best_score: baseStatsQuery.best_score || 0,
        avg_putts_per_round: baseStatsQuery.avg_putts_per_round || 0,
        avg_fairway_hit_rate: baseStatsQuery.avg_fairway_hit_rate || 0,
        avg_green_hit_rate: baseStatsQuery.avg_green_hit_rate || 0,
        avg_driving_distance: driverDistanceQuery?.avg_driving_distance || 0,
        par3_avg_score: parTypeStatsQuery?.par3_avg_score || 0,
        par4_avg_score: parTypeStatsQuery?.par4_avg_score || 0,
        par5_avg_score: parTypeStatsQuery?.par5_avg_score || 0,
        birdie_rate: baseStatsQuery.birdie_rate || 0,
        par_rate: baseStatsQuery.par_rate || 0,
        bogey_rate: baseStatsQuery.bogey_rate || 0,
        sand_save_rate: parTypeStatsQuery?.sand_save_rate || 0,
        up_and_down_rate: parTypeStatsQuery?.up_and_down_rate || 0,
        gir_rate: parTypeStatsQuery?.gir_rate || 0
      };
      
      // 5. 사용자 통계 업데이트
      this.updateUserStats(userId, statsData);
      
      // 트랜잭션 커밋
      db.exec('COMMIT');
      
      return true;
    } catch (error) {
      // 오류 발생 시 롤백
      db.exec('ROLLBACK');
      console.error('사용자 통계 계산 중 오류 발생:', error);
      throw error;
    }
  },
  
  // 클럽별 통계 조회
  getClubStats: async (userId, clubName) => {
    // 클럽 통계가 이미 존재하는지 확인
    const existingQuery = 'SELECT stat_id FROM club_stats WHERE user_id = ? AND club_name = ?';
    const existing = await db.get(existingQuery, [userId, clubName]);
    
    if (existing) {
      // 기존 클럽 통계 업데이트
      const sql = `
        UPDATE club_stats
        SET club_type = ?, avg_distance = ?, max_distance = ?,
            avg_carry_distance = ?, avg_accuracy = ?, avg_side_spin = ?,
            avg_back_spin = ?, avg_club_speed = ?, avg_ball_speed = ?,
            avg_smash_factor = ?, last_updated = CURRENT_TIMESTAMP
        WHERE user_id = ? AND club_name = ?
      `;
      
      const params = [
        club_type, avg_distance, max_distance,
        avg_carry_distance, avg_accuracy, avg_side_spin,
        avg_back_spin, avg_club_speed, avg_ball_speed,
        avg_smash_factor, userId, clubName
      ];
      
      const result = await db.run(sql, params);
      return { updated: true, changes: result.changes };
    } else {
      // 새 클럽 통계 생성
      const sql = `
        INSERT INTO club_stats (
          user_id, club_name, club_type, avg_distance, max_distance,
          avg_carry_distance, avg_accuracy, avg_side_spin,
          avg_back_spin, avg_club_speed, avg_ball_speed,
          avg_smash_factor, created_at, last_updated
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;
      
      const params = [
        userId, clubName, club_type, avg_distance, max_distance,
        avg_carry_distance, avg_accuracy, avg_side_spin,
        avg_back_spin, avg_club_speed, avg_ball_speed,
        avg_smash_factor
      ];
      
      const result = await db.run(sql, params);
      return { created: true, id: result.lastID };
    }
  },
  
  // 퍼팅 통계 조회
  getPuttingStats: async (userId) => {
    // 기본 퍼팅 통계 조회
    const basicStatsQuery = `
      SELECT * FROM putting_stats 
      WHERE user_id = ?
    `;
    const basicStats = await db.get(basicStatsQuery, [userId]);
    
    // 거리별 퍼팅 통계 조회
    const distanceStatsQuery = `
      SELECT * FROM putting_distance_stats 
      WHERE user_id = ?
      ORDER BY distance_range
    `;
    const distanceStats = await db.all(distanceStatsQuery, [userId]);
    
    return {
      ...basicStats,
      distanceStats
    };
  },
  
  // 퍼팅 통계 업데이트/생성
  updatePuttingStats: async (userId, statsData) => {
    // 퍼팅 통계가 이미 존재하는지 확인
    const existingQuery = 'SELECT stat_id FROM putting_stats WHERE user_id = ?';
    const existing = await db.get(existingQuery, [userId]);
    
    const {
      total_putts,
      avg_putts_per_round,
      avg_putts_per_hole,
      one_putt_rate,
      two_putt_rate,
      three_or_more_putt_rate,
      avg_distance_to_hole_after_putt,
      putts_from_0_to_1m_success_rate,
      putts_from_1_to_2m_success_rate,
      putts_from_2_to_3m_success_rate,
      putts_from_3_to_5m_success_rate,
      putts_beyond_5m_success_rate
    } = statsData;
    
    try {
      // 트랜잭션 시작
      await db.exec('BEGIN TRANSACTION');
      
      if (existing) {
        // 기존 퍼팅 통계 업데이트
        const updateSql = `
          UPDATE putting_stats
          SET total_putts = ?, avg_putts_per_round = ?, avg_putts_per_hole = ?,
              one_putt_rate = ?, two_putt_rate = ?, three_or_more_putt_rate = ?,
              avg_distance_to_hole_after_putt = ?, last_updated = CURRENT_TIMESTAMP
          WHERE user_id = ?
        `;
        
        const updateParams = [
          total_putts, avg_putts_per_round, avg_putts_per_hole,
          one_putt_rate, two_putt_rate, three_or_more_putt_rate,
          avg_distance_to_hole_after_putt, userId
        ];
        
        await db.run(updateSql, updateParams);
      } else {
        // 새 퍼팅 통계 생성
        const insertSql = `
          INSERT INTO putting_stats (
            user_id, total_putts, avg_putts_per_round, avg_putts_per_hole,
            one_putt_rate, two_putt_rate, three_or_more_putt_rate,
            avg_distance_to_hole_after_putt, created_at, last_updated
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        
        const insertParams = [
          userId, total_putts, avg_putts_per_round, avg_putts_per_hole,
          one_putt_rate, two_putt_rate, three_or_more_putt_rate,
          avg_distance_to_hole_after_putt
        ];
        
        await db.run(insertSql, insertParams);
      }
      
      // 거리별 통계 업데이트/생성
      // 먼저 기존 거리별 통계 삭제
      await db.run('DELETE FROM putting_distance_stats WHERE user_id = ?', [userId]);
      
      // 거리별 통계 배열 정의
      const distanceStatsArray = [
        { distance_range: '0-1m', success_rate: putts_from_0_to_1m_success_rate },
        { distance_range: '1-2m', success_rate: putts_from_1_to_2m_success_rate },
        { distance_range: '2-3m', success_rate: putts_from_2_to_3m_success_rate },
        { distance_range: '3-5m', success_rate: putts_from_3_to_5m_success_rate },
        { distance_range: '5m+', success_rate: putts_beyond_5m_success_rate }
      ];
      
      // 거리별 통계 추가
      const distanceStatsSql = `
        INSERT INTO putting_distance_stats (
          user_id, distance_range, success_rate
        )
        VALUES (?, ?, ?)
      `;
      
      for (const distanceStat of distanceStatsArray) {
        await db.run(distanceStatsSql, [
          userId, 
          distanceStat.distance_range, 
          distanceStat.success_rate
        ]);
      }
      
      // 트랜잭션 커밋
      await db.exec('COMMIT');
      
      return { success: true };
    } catch (error) {
      // 오류 발생 시 롤백
      await db.exec('ROLLBACK');
      throw error;
    }
  },
  
  // 코스별 통계 조회
  getCourseStats: async (userId, courseId = null) => {
    let sql, params;
    
    if (courseId) {
      // 특정 코스에 대한 통계 조회
      sql = `
        SELECT cs.*, c.course_name
        FROM course_stats cs
        JOIN golf_courses c ON cs.course_id = c.course_id
        WHERE cs.user_id = ? AND cs.course_id = ?
      `;
      params = [userId, courseId];
      
      const courseStats = await db.get(sql, params);
      
      if (courseStats) {
        // 홀별 통계 조회
        const holeStatsSql = `
          SELECT * FROM hole_stats
          WHERE user_id = ? AND course_id = ?
          ORDER BY course_number, hole_number
        `;
        
        const holeStats = await db.all(holeStatsSql, [userId, courseId]);
        
        return {
          ...courseStats,
          holeStats
        };
      }
      
      return null;
    } else {
      // 모든 코스에 대한 통계 조회
      sql = `
        SELECT cs.*, c.course_name, 
          (SELECT COUNT(*) FROM rounds r WHERE r.user_id = cs.user_id AND r.course_id = cs.course_id) as round_count
        FROM course_stats cs
        JOIN golf_courses c ON cs.course_id = c.course_id
        WHERE cs.user_id = ?
        ORDER BY round_count DESC, cs.avg_score ASC
      `;
      params = [userId];
      
      return await db.all(sql, params);
    }
  },
  
  // 코스 통계 업데이트/생성
  updateCourseStats: async (userId, courseId, statsData) => {
    // 코스 통계가 이미 존재하는지 확인
    const existingQuery = 'SELECT stat_id FROM course_stats WHERE user_id = ? AND course_id = ?';
    const existing = await db.get(existingQuery, [userId, courseId]);
    
    const {
      total_rounds,
      avg_score,
      best_score,
      fairway_hit_rate,
      green_hit_rate,
      avg_putts_per_round,
      par3_avg_score,
      par4_avg_score,
      par5_avg_score,
      birdie_rate,
      par_rate,
      bogey_rate,
      hole_stats = []
    } = statsData;
    
    try {
      // 트랜잭션 시작
      await db.exec('BEGIN TRANSACTION');
      
      if (existing) {
        // 기존 코스 통계 업데이트
        const updateSql = `
          UPDATE course_stats
          SET total_rounds = ?, avg_score = ?, best_score = ?,
              fairway_hit_rate = ?, green_hit_rate = ?, avg_putts_per_round = ?,
              par3_avg_score = ?, par4_avg_score = ?, par5_avg_score = ?,
              birdie_rate = ?, par_rate = ?, bogey_rate = ?,
              last_updated = CURRENT_TIMESTAMP
          WHERE user_id = ? AND course_id = ?
        `;
        
        const updateParams = [
          total_rounds, avg_score, best_score,
          fairway_hit_rate, green_hit_rate, avg_putts_per_round,
          par3_avg_score, par4_avg_score, par5_avg_score,
          birdie_rate, par_rate, bogey_rate,
          userId, courseId
        ];
        
        await db.run(updateSql, updateParams);
      } else {
        // 새 코스 통계 생성
        const insertSql = `
          INSERT INTO course_stats (
            user_id, course_id, total_rounds, avg_score, best_score,
            fairway_hit_rate, green_hit_rate, avg_putts_per_round,
            par3_avg_score, par4_avg_score, par5_avg_score,
            birdie_rate, par_rate, bogey_rate,
            created_at, last_updated
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        
        const insertParams = [
          userId, courseId, total_rounds, avg_score, best_score,
          fairway_hit_rate, green_hit_rate, avg_putts_per_round,
          par3_avg_score, par4_avg_score, par5_avg_score,
          birdie_rate, par_rate, bogey_rate
        ];
        
        await db.run(insertSql, insertParams);
      }
      
      // 홀별 통계 업데이트/생성
      if (hole_stats && hole_stats.length > 0) {
        // 해당 코스의 기존 홀 통계 전체 삭제
        await db.run(
          'DELETE FROM hole_stats WHERE user_id = ? AND course_id = ?',
          [userId, courseId]
        );
        
        // 새 홀 통계 추가
        const holeStatsSql = `
          INSERT INTO hole_stats (
            user_id, course_id, course_number, hole_number, avg_score,
            par, birdie_or_better_count, par_count, bogey_count,
            double_bogey_or_worse_count, fairway_hit_rate, green_hit_rate,
            avg_putts
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        for (const holeStat of hole_stats) {
          const {
            course_number,
            hole_number,
            avg_score,
            par,
            birdie_or_better_count,
            par_count,
            bogey_count,
            double_bogey_or_worse_count,
            fairway_hit_rate,
            green_hit_rate,
            avg_putts
          } = holeStat;
          
          await db.run(holeStatsSql, [
            userId, courseId, course_number, hole_number, avg_score,
            par, birdie_or_better_count, par_count, bogey_count,
            double_bogey_or_worse_count, fairway_hit_rate, green_hit_rate,
            avg_putts
          ]);
        }
      }
      
      // 트랜잭션 커밋
      await db.exec('COMMIT');
      
      return { success: true };
    } catch (error) {
      // 오류 발생 시 롤백
      await db.exec('ROLLBACK');
      throw error;
    }
  },
  
  // 기간별 추이 통계 조회
  getTrendStats: async (userId, period = 'month', count = 6) => {
    const validPeriods = ['week', 'month', 'quarter', 'year'];
    if (!validPeriods.includes(period)) {
      throw new Error('유효하지 않은 기간 단위입니다.');
    }
    
    // 기간 단위 설정
    let dateFormat, periodName;
    switch (period) {
      case 'week':
        dateFormat = "STRFTIME('%Y-W%W', round_date)";
        periodName = "STRFTIME('Week %W, %Y', round_date)";
        break;
      case 'month':
        dateFormat = "STRFTIME('%Y-%m', round_date)";
        periodName = "STRFTIME('%Y-%m', round_date)";
        break;
      case 'quarter':
        dateFormat = "STRFTIME('%Y-Q') || CAST((STRFTIME('%m', round_date) + 2) / 3 AS INTEGER)";
        periodName = "STRFTIME('%Y') || '-Q' || CAST((STRFTIME('%m', round_date) + 2) / 3 AS INTEGER)";
        break;
      case 'year':
        dateFormat = "STRFTIME('%Y', round_date)";
        periodName = "STRFTIME('%Y', round_date)";
        break;
    }
    
    // 기간별 통계 쿼리
    const sql = `
      SELECT 
        ${periodName} as period_name,
        ${dateFormat} as period_key,
        COUNT(*) as round_count,
        AVG(total_score) as avg_score,
        MIN(total_score) as best_score,
        AVG(fairways_hit * 100.0 / fairways_total) as fairway_hit_rate,
        AVG(greens_hit * 100.0 / greens_total) as green_hit_rate,
        AVG(total_putts / 18.0) as avg_putts_per_hole,
        COUNT(DISTINCT course_id) as unique_courses
      FROM rounds
      WHERE user_id = ? AND STATUS = 1
      GROUP BY period_key
      ORDER BY period_key DESC
      LIMIT ?
    `;
    
    const trendData = await db.all(sql, [userId, count]);
    
    // 날짜 순으로 정렬하기 위해 역순으로
    trendData.reverse();
    
    // 결과를 차트 데이터 형식으로 변환
    const periods = trendData.map(item => item.period_name);
    const averageScores = trendData.map(item => parseFloat(item.avg_score));
    const fairwayHitRates = trendData.map(item => parseFloat(item.fairway_hit_rate));
    const greenHitRates = trendData.map(item => parseFloat(item.green_hit_rate));
    const avgPuttsPerHole = trendData.map(item => parseFloat(item.avg_putts_per_hole));
    
    return {
      periods,
      averageScores,
      fairwayHitRates,
      greenHitRates,
      avgPuttsPerHole,
      trendData
    };
  },
  
  // 파트너별 비교 통계 조회
  getPartnerComparisonStats: async (userId, partnerId = null) => {
    let sql, params;
    
    if (partnerId) {
      // 특정 파트너와의 비교 통계
      sql = `
        SELECT 
          rp.partner_user_id as partner_id,
          u.username as partner_username,
          u.full_name as partner_name,
          COUNT(*) as match_count,
          SUM(CASE WHEN rp.match_result = 'win' THEN 1 ELSE 0 END) as wins,
          SUM(CASE WHEN rp.match_result = 'loss' THEN 1 ELSE 0 END) as losses,
          SUM(CASE WHEN rp.match_result = 'draw' THEN 1 ELSE 0 END) as draws,
          AVG(rp.score_difference) as avg_score_difference,
          MAX(r.round_date) as last_played
        FROM round_partners rp
        JOIN rounds r ON rp.round_id = r.round_id
        LEFT JOIN users u ON rp.partner_user_id = u.user_id
        WHERE rp.user_id = ? AND rp.partner_user_id = ?
        GROUP BY rp.partner_user_id
      `;
      params = [userId, partnerId];
      
      const partnerStats = await db.get(sql, params);
      
      if (partnerStats) {
        // 파트너와의 라운드 이력
        const historySql = `
          SELECT 
            r.round_id, r.round_date, r.total_score as user_score, 
            rp.total_score as partner_score, rp.match_result,
            c.course_name
          FROM round_partners rp
          JOIN rounds r ON rp.round_id = r.round_id
          JOIN golf_courses c ON r.course_id = c.course_id
          WHERE rp.user_id = ? AND rp.partner_user_id = ?
          ORDER BY r.round_date DESC
          LIMIT 10
        `;
        
        const matchHistory = await db.all(historySql, [userId, partnerId]);
        
        return {
          ...partnerStats,
          matchHistory
        };
      }
      
      return null;
    } else {
      // 모든 파트너와의 통계
      sql = `
        SELECT 
          rp.partner_user_id as partner_id,
          rp.partner_name,
          u.username as partner_username,
          COUNT(*) as match_count,
          SUM(CASE WHEN rp.match_result = 'win' THEN 1 ELSE 0 END) as wins,
          SUM(CASE WHEN rp.match_result = 'loss' THEN 1 ELSE 0 END) as losses,
          SUM(CASE WHEN rp.match_result = 'draw' THEN 1 ELSE 0 END) as draws,
          AVG(rp.score_difference) as avg_score_difference,
          MAX(r.round_date) as last_played
        FROM round_partners rp
        JOIN rounds r ON rp.round_id = r.round_id
        LEFT JOIN users u ON rp.partner_user_id = u.user_id
        WHERE rp.user_id = ?
        GROUP BY rp.partner_user_id, rp.partner_name
        ORDER BY match_count DESC
      `;
      params = [userId];
      
      return await db.all(sql, params);
    }
  },
  
  // 코스 홀별 난이도 통계 조회
  getCourseDifficultyStats: async (courseId) => {
    // 코스 정보 조회
    const courseSql = `
      SELECT * FROM golf_courses WHERE course_id = ?
    `;
    const course = await db.get(courseSql, [courseId]);
    
    if (!course) {
      return null;
    }
    
    // 코스 상세 정보 조회
    const courseDetailsSql = `
      SELECT * FROM course_details WHERE course_id = ? ORDER BY course_number
    `;
    const courseDetails = await db.all(courseDetailsSql, [courseId]);
    
    // 홀별 난이도 통계 조회
    const holeStatsSql = `
      SELECT 
        h.course_number, h.hole_number, h.par,
        COUNT(rh.hole_id) as play_count,
        AVG(rh.score) as avg_score,
        AVG(rh.score - h.par) as avg_over_par,
        SUM(CASE WHEN rh.score < h.par THEN 1 ELSE 0 END) * 100.0 / COUNT(rh.hole_id) as under_par_rate,
        SUM(CASE WHEN rh.score = h.par THEN 1 ELSE 0 END) * 100.0 / COUNT(rh.hole_id) as par_rate,
        SUM(CASE WHEN rh.score > h.par THEN 1 ELSE 0 END) * 100.0 / COUNT(rh.hole_id) as over_par_rate,
        AVG(rh.putts) as avg_putts
      FROM holes h
      LEFT JOIN round_holes rh ON h.course_id = rh.round_id AND h.course_number = rh.course_number AND h.hole_number = rh.hole_number
      WHERE h.course_id = ?
      GROUP BY h.course_number, h.hole_number
      ORDER BY h.course_number, h.hole_number
    `;
    
    const holeStats = await db.all(holeStatsSql, [courseId]);
    
    // 홀별 난이도 순위 계산
    const ratedHoles = [...holeStats].sort((a, b) => b.avg_over_par - a.avg_over_par);
    
    const holesWithDifficulty = holeStats.map(hole => {
      const difficultyRank = ratedHoles.findIndex(
        h => h.course_number === hole.course_number && h.hole_number === hole.hole_number
      ) + 1;
      
      return {
        ...hole,
        difficulty_rank: difficultyRank,
        is_hardest: difficultyRank === 1,
        is_easiest: difficultyRank === holeStats.length
      };
    });
    
    return {
      course,
      courseDetails,
      holeStats: holesWithDifficulty
    };
  },
  
  // 사용자 통계 데이터 재계산 (관리자용)
  recalculateUserStats: async (userId) => {
    // 라운드 데이터에서 종합 통계 계산
    const roundStatsSql = `
      SELECT 
        COUNT(*) as total_rounds,
        AVG(total_score) as avg_score,
        MIN(total_score) as best_score,
        AVG(fairways_hit * 100.0 / fairways_total) as fairway_hit_rate,
        AVG(greens_hit * 100.0 / greens_total) as green_hit_rate,
        AVG(total_putts) as avg_putts_per_round,
        SUM(birdies) as total_birdies,
        SUM(pars) as total_pars,
        SUM(bogeys) as total_bogeys
      FROM rounds
      WHERE user_id = ? AND status = 1
    `;
    
    const roundStats = await db.get(roundStatsSql, [userId]);
    
    if (!roundStats || roundStats.total_rounds === 0) {
      throw new Error('통계를 계산할 수 있는 라운드 데이터가 없습니다.');
    }
    
    // 파 타입별 평균 스코어 계산
    const parTypeStatsSql = `
      SELECT 
        h.par,
        AVG(rh.score) as avg_score
      FROM round_holes rh
      JOIN holes h ON rh.round_id = rh.round_id AND rh.course_number = h.course_number AND rh.hole_number = h.hole_number
      JOIN rounds r ON rh.round_id = r.round_id
      WHERE r.user_id = ? AND r.status = 1
      GROUP BY h.par
    `;
    
    const parTypeStats = await db.all(parTypeStatsSql, [userId]);
    
    const par3AvgScore = parTypeStats.find(s => s.par === 3)?.avg_score || 0;
    const par4AvgScore = parTypeStats.find(s => s.par === 4)?.avg_score || 0;
    const par5AvgScore = parTypeStats.find(s => s.par === 5)?.avg_score || 0;
    
    // 홀 결과 비율 계산
    const totalHolesPlayed = roundStats.total_rounds * 18;
    const birdieRate = roundStats.total_birdies / totalHolesPlayed;
    const parRate = roundStats.total_pars / totalHolesPlayed;
    const bogeyRate = roundStats.total_bogeys / totalHolesPlayed;
    
    try {
      // 트랜잭션 시작
      await db.exec('BEGIN TRANSACTION');
      
      // 종합 통계 업데이트/생성
      const userStatsData = {
        total_rounds: roundStats.total_rounds,
        avg_score: roundStats.avg_score,
        best_score: roundStats.best_score,
        avg_driving_distance: 0, // 샷 데이터에서 별도 계산 필요
        avg_fairway_hit_rate: roundStats.fairway_hit_rate,
        avg_green_hit_rate: roundStats.green_hit_rate,
        avg_putts_per_round: roundStats.avg_putts_per_round,
        par3_avg_score: par3AvgScore,
        par4_avg_score: par4AvgScore,
        par5_avg_score: par5AvgScore,
        birdie_rate: birdieRate,
        par_rate: parRate,
        bogey_rate: bogeyRate,
        sand_save_rate: 0, // 별도 계산 필요
        up_and_down_rate: 0, // 별도 계산 필요
        gir_rate: 0 // 별도 계산 필요
      };
      
      await this.updateUserStats(userId, userStatsData);
      
      // 코스별 통계 재계산
      const coursesPlayedSql = `
        SELECT DISTINCT course_id FROM rounds WHERE user_id = ? AND status = 1
      `;
      
      const coursesPlayed = await db.all(coursesPlayedSql, [userId]);
      
      for (const course of coursesPlayed) {
        const courseId = course.course_id;
        
        // 코스별 통계 계산
        const courseStatsSql = `
          SELECT 
            COUNT(*) as total_rounds,
            AVG(total_score) as avg_score,
            MIN(total_score) as best_score,
            AVG(fairways_hit * 100.0 / fairways_total) as fairway_hit_rate,
            AVG(greens_hit * 100.0 / greens_total) as green_hit_rate,
            AVG(total_putts) as avg_putts_per_round,
            SUM(birdies) as total_birdies,
            SUM(pars) as total_pars,
            SUM(bogeys) as total_bogeys
          FROM rounds
          WHERE user_id = ? AND course_id = ? AND status = 1
        `;
        
        const courseStats = await db.get(courseStatsSql, [userId, courseId]);
        
        if (courseStats && courseStats.total_rounds > 0) {
          // 코스별 파 타입 통계
          const courseParTypeStatsSql = `
            SELECT 
              h.par,
              AVG(rh.score) as avg_score
            FROM round_holes rh
            JOIN holes h ON rh.course_id = h.course_id AND rh.course_number = h.course_number AND rh.hole_number = h.hole_number
            JOIN rounds r ON rh.round_id = r.round_id
            WHERE r.user_id = ? AND r.course_id = ? AND r.status = 1
            GROUP BY h.par
          `;
          
          const courseParTypeStats = await db.all(courseParTypeStatsSql, [userId, courseId]);
          
          const coursePar3AvgScore = courseParTypeStats.find(s => s.par === 3)?.avg_score || 0;
          const coursePar4AvgScore = courseParTypeStats.find(s => s.par === 4)?.avg_score || 0;
          const coursePar5AvgScore = courseParTypeStats.find(s => s.par === 5)?.avg_score || 0;
          
          // 홀 결과 비율 계산
          const courseTotalHolesPlayed = courseStats.total_rounds * 18;
          const courseBirdieRate = courseStats.total_birdies / courseTotalHolesPlayed;
          const courseParRate = courseStats.total_pars / courseTotalHolesPlayed;
          const courseBogeyRate = courseStats.total_bogeys / courseTotalHolesPlayed;
          
          // 홀별 통계 계산
          const holeStatsSql = `
            SELECT 
              rh.course_number, rh.hole_number, h.par,
              AVG(rh.score) as avg_score,
              COUNT(*) as total_plays,
              SUM(CASE WHEN rh.score < h.par THEN 1 ELSE 0 END) as birdie_or_better_count,
              SUM(CASE WHEN rh.score = h.par THEN 1 ELSE 0 END) as par_count,
              SUM(CASE WHEN rh.score = h.par + 1 THEN 1 ELSE 0 END) as bogey_count,
              SUM(CASE WHEN rh.score >= h.par + 2 THEN 1 ELSE 0 END) as double_bogey_or_worse_count,
              AVG(CASE WHEN rh.fairway_hit IS NOT NULL THEN rh.fairway_hit ELSE NULL END) as fairway_hit_rate,
              AVG(CASE WHEN rh.green_hit IS NOT NULL THEN rh.green_hit ELSE NULL END) as green_hit_rate,
              AVG(rh.putts) as avg_putts
            FROM round_holes rh
            JOIN holes h ON rh.course_id = h.course_id AND rh.course_number = h.course_number AND rh.hole_number = h.hole_number
            JOIN rounds r ON rh.round_id = r.round_id
            WHERE r.user_id = ? AND r.course_id = ? AND r.status = 1
            GROUP BY rh.course_number, rh.hole_number
          `;
          
          const holeStats = await db.all(holeStatsSql, [userId, courseId]);
          
          // 코스 통계 업데이트/생성
          const courseStatsData = {
            total_rounds: courseStats.total_rounds,
            avg_score: courseStats.avg_score,
            best_score: courseStats.best_score,
            fairway_hit_rate: courseStats.fairway_hit_rate,
            green_hit_rate: courseStats.green_hit_rate,
            avg_putts_per_round: courseStats.avg_putts_per_round,
            par3_avg_score: coursePar3AvgScore,
            par4_avg_score: coursePar4AvgScore,
            par5_avg_score: coursePar5AvgScore,
            birdie_rate: courseBirdieRate,
            par_rate: courseParRate,
            bogey_rate: courseBogeyRate,
            hole_stats: holeStats
          };
          
          await this.updateCourseStats(userId, courseId, courseStatsData);
        }
      }
      
      // 클럽별 통계 재계산
      const clubsUsedSql = `
        SELECT DISTINCT club, club_category FROM shots WHERE user_id = ? AND is_putt = 0
      `;
      
      const clubsUsed = await db.all(clubsUsedSql, [userId]);
      
      for (const club of clubsUsed) {
        const clubName = club.club;
        
        // 클럽별 통계 계산
        const clubStatsSql = `
          SELECT 
            AVG(distance) as avg_distance,
            MAX(distance) as max_distance,
            AVG(carry_distance) as avg_carry_distance,
            AVG(CASE WHEN is_fairway_shot = 1 AND terrain = 'fairway' THEN 1 ELSE 0 END) as avg_accuracy,
            AVG(side_spin) as avg_side_spin,
            AVG(back_spin) as avg_back_spin,
            AVG(club_speed) as avg_club_speed,
            AVG(ball_speed) as avg_ball_speed,
            AVG(smash_factor) as avg_smash_factor
          FROM shots
          WHERE user_id = ? AND club = ? AND is_putt = 0
        `;
        
        const clubStats = await db.get(clubStatsSql, [userId, clubName]);
        
        if (clubStats) {
          // 클럽 통계 업데이트/생성
          const clubStatsData = {
            club_type: club.club_category,
            avg_distance: clubStats.avg_distance,
            max_distance: clubStats.max_distance,
            avg_carry_distance: clubStats.avg_carry_distance,
            avg_accuracy: clubStats.avg_accuracy,
            avg_side_spin: clubStats.avg_side_spin,
            avg_back_spin: clubStats.avg_back_spin,
            avg_club_speed: clubStats.avg_club_speed,
            avg_ball_speed: clubStats.avg_ball_speed,
            avg_smash_factor: clubStats.avg_smash_factor
          };
          
          await this.updateClubStats(userId, clubName, clubStatsData);
        }
      }
      
      // 퍼팅 통계 재계산
      const puttingStatsSql = `
        SELECT 
          COUNT(*) as total_putts,
          SUM(total_putts) / COUNT(*) as avg_putts_per_round,
          AVG(total_putts / 18.0) as avg_putts_per_hole,
          SUM(CASE WHEN putts = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as one_putt_rate,
          SUM(CASE WHEN putts = 2 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as two_putt_rate,
          SUM(CASE WHEN putts >= 3 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as three_or_more_putt_rate,
          AVG(putt_distance_first) as avg_first_putt_distance,
          AVG(CASE WHEN distance_to_pin_before <= 1 AND putt_distance_first = 0 THEN 1 ELSE 0 END) as putts_from_0_to_1m_success_rate,
          AVG(CASE WHEN distance_to_pin_before > 1 AND distance_to_pin_before <= 2 AND putt_distance_first = 0 THEN 1 ELSE 0 END) as putts_from_1_to_2m_success_rate,
          AVG(CASE WHEN distance_to_pin_before > 2 AND distance_to_pin_before <= 3 AND putt_distance_first = 0 THEN 1 ELSE 0 END) as putts_from_2_to_3m_success_rate,
          AVG(CASE WHEN distance_to_pin_before > 3 AND distance_to_pin_before <= 5 AND putt_distance_first = 0 THEN 1 ELSE 0 END) as putts_from_3_to_5m_success_rate,
          AVG(CASE WHEN distance_to_pin_before > 5 AND putt_distance_first = 0 THEN 1 ELSE 0 END) as putts_beyond_5m_success_rate,
          AVG(distance_to_pin_after) as avg_distance_to_hole_after_putt
        FROM round_holes
        WHERE is_putt = 1 AND user_id = ?
      `;
      
      const puttingStats = await db.get(puttingStatsSql, [userId]);
      
      if (puttingStats) {
        // 퍼팅 통계 업데이트/생성
        const puttingStatsData = {
          total_putts: puttingStats.total_putts,
          avg_putts_per_round: puttingStats.avg_putts_per_round,
          avg_putts_per_hole: puttingStats.avg_putts_per_hole,
          one_putt_rate: puttingStats.one_putt_rate,
          two_putt_rate: puttingStats.two_putt_rate,
          three_or_more_putt_rate: puttingStats.three_or_more_putt_rate,
          avg_distance_to_hole_after_putt: puttingStats.avg_distance_to_hole_after_putt,
          putts_from_0_to_1m_success_rate: puttingStats.putts_from_0_to_1m_success_rate,
          putts_from_1_to_2m_success_rate: puttingStats.putts_from_1_to_2m_success_rate,
          putts_from_2_to_3m_success_rate: puttingStats.putts_from_2_to_3m_success_rate,
          putts_from_3_to_5m_success_rate: puttingStats.putts_from_3_to_5m_success_rate,
          putts_beyond_5m_success_rate: puttingStats.putts_beyond_5m_success_rate
        };
        
        await this.updatePuttingStats(userId, puttingStatsData);
      }
      
      // 트랜잭션 커밋
      await db.exec('COMMIT');
      
      return { success: true, message: '통계 재계산이 완료되었습니다.' };
    } catch (error) {
      // 오류 발생 시 롤백
      await db.exec('ROLLBACK');
      throw error;
    }
  }
};

module.exports = StatsModel; 