/**
 * 통계 컨트롤러
 * 골프 통계 관련 기능을 처리합니다.
 */
const { StatsModel, UserModel } = require('../models');

// 'me' 파라미터를 현재 사용자의 ID로 변환하는 유틸리티 함수
const getUserIdFromParams = (paramUserId, reqUser) => {
  return paramUserId === 'me' ? reqUser.userId : paramUserId;
};

// 간단한 인메모리 캐시 (운영환경에서는 Redis 같은 외부 캐시 시스템 사용 권장)
const statsCache = {
  data: {},
  timestamp: {},
  cacheDuration: 10 * 60 * 1000, // 10분(밀리초)
  
  // 캐시에 데이터 저장
  set(key, data) {
    this.data[key] = data;
    this.timestamp[key] = Date.now();
    return data;
  },
  
  // 캐시에서 데이터 가져오기
  get(key) {
    const now = Date.now();
    const timestamp = this.timestamp[key] || 0;
    
    if (this.data[key] && (now - timestamp < this.cacheDuration)) {
      console.log(`[서버 캐시 히트] ${key}`);
      return this.data[key];
    }
    
    return null;
  },
  
  // 캐시 무효화
  invalidate(keyPattern) {
    const regex = new RegExp(keyPattern);
    
    Object.keys(this.data).forEach(key => {
      if (regex.test(key)) {
        delete this.data[key];
        delete this.timestamp[key];
      }
    });
  }
};

/**
 * 사용자의 종합 통계 조회
 */
const getUserStats = async (req, res) => {
  try {
    let { userId } = req.params;
    
    // 'me'인 경우 현재 로그인한 사용자의 ID로 대체
    userId = getUserIdFromParams(userId, req.user);
    
    // 사용자가 자신의 통계만 조회할 수 있도록 권한 확인
    if (userId != req.user.userId && req.user.username !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: '다른 사용자의 통계를 조회할 권한이 없습니다.'
      });
    }
    
    // 캐시 확인
    const cacheKey = `user_stats_${userId}`;
    const cachedData = statsCache.get(cacheKey);
    
    if (cachedData) {
      return res.status(200).json(cachedData);
    }
    
    // 사용자 존재 확인
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    // 사용자 통계 조회
    const stats = await StatsModel.getUserStats(userId);
    
    // 통계가 없는 경우
    if (!stats) {
      const response = {
        status: 'success',
        data: {
          userId: parseInt(userId),
          username: user.username,
          message: '아직 통계 데이터가 없습니다.'
        }
      };
      
      // 결과 캐싱
      statsCache.set(cacheKey, response);
      
      return res.status(200).json(response);
    }
    
    // 응답 데이터 가공
    const statsData = {
      userId: parseInt(userId),
      username: user.username,
      totalRounds: stats.total_rounds,
      avgScore: stats.avg_score,
      bestScore: stats.best_score,
      handicapIndex: user.handicap,
      avgDrivingDistance: stats.avg_driving_distance,
      fairwayHitRate: stats.avg_fairway_hit_rate,
      greenHitRate: stats.avg_green_hit_rate,
      puttsPerRound: stats.avg_putts_per_round,
      par3Avg: stats.par3_avg_score,
      par4Avg: stats.par4_avg_score,
      par5Avg: stats.par5_avg_score,
      birdieRate: stats.birdie_rate,
      parRate: stats.par_rate,
      bogeyRate: stats.bogey_rate,
      sandSaveRate: stats.sand_save_rate,
      upAndDownRate: stats.up_and_down_rate,
      girRate: stats.gir_rate,
      lastUpdated: stats.last_updated
    };
    
    const response = {
      status: 'success',
      data: statsData
    };
    
    // 결과 캐싱
    statsCache.set(cacheKey, response);
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('통계 조회 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 사용자의 클럽별 통계 조회
 */
const getUserClubStats = async (req, res) => {
  try {
    let { userId } = req.params;
    const { club } = req.query;
    
    // 'me'인 경우 현재 로그인한 사용자의 ID로 대체
    userId = getUserIdFromParams(userId, req.user);
    
    // 사용자가 자신의 통계만 조회할 수 있도록 권한 확인
    if (userId != req.user.userId && req.user.username !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: '다른 사용자의 통계를 조회할 권한이 없습니다.'
      });
    }
    
    // 캐시 확인
    const cacheKey = `user_club_stats_${userId}_${club || 'all'}`;
    const cachedData = statsCache.get(cacheKey);
    
    if (cachedData) {
      return res.status(200).json(cachedData);
    }
    
    // 사용자 존재 확인
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    // 특정 클럽 또는 모든 클럽의 통계 조회
    const clubStats = await StatsModel.getUserClubStats(userId, club);
    
    // 클럽 통계가 없는 경우
    if (!clubStats || (Array.isArray(clubStats) && clubStats.length === 0)) {
      const response = {
        status: 'success',
        data: {
          userId: parseInt(userId),
          message: '아직 클럽 통계 데이터가 없습니다.'
        }
      };
      
      // 결과 캐싱
      statsCache.set(cacheKey, response);
      
      return res.status(200).json(response);
    }
    
    // 응답 데이터 가공
    let statsData;
    
    if (club) {
      // 특정 클럽의 통계
      statsData = {
        userId: parseInt(userId),
        club: clubStats.club,
        clubCategory: clubStats.club_category,
        usageCount: clubStats.usage_count,
        avgDistance: clubStats.avg_distance,
        avgCarryDistance: clubStats.avg_carry_distance,
        avgAccuracy: clubStats.avg_accuracy,
        avgBallSpeed: clubStats.avg_ball_speed,
        avgClubSpeed: clubStats.avg_club_speed,
        avgSmashFactor: clubStats.avg_smash_factor,
        avgVerticalAngle: clubStats.avg_vertical_angle,
        avgBackSpin: clubStats.avg_back_spin,
        avgSideSpin: clubStats.avg_side_spin,
        dispersionLeft: clubStats.dispersion_left,
        dispersionRight: clubStats.dispersion_right,
        shotQualityAvg: clubStats.shot_quality_avg,
        lastUpdated: clubStats.last_updated
      };
    } else {
      // 모든 클럽의 통계
      statsData = clubStats.map(stat => ({
        userId: parseInt(userId),
        club: stat.club,
        clubCategory: stat.club_category,
        usageCount: stat.usage_count,
        avgDistance: stat.avg_distance,
        avgCarryDistance: stat.avg_carry_distance,
        avgAccuracy: stat.avg_accuracy,
        avgBallSpeed: stat.avg_ball_speed,
        avgClubSpeed: stat.avg_club_speed,
        avgSmashFactor: stat.avg_smash_factor,
        lastUpdated: stat.last_updated
      }));
    }
    
    const response = {
      status: 'success',
      data: statsData
    };
    
    // 결과 캐싱
    statsCache.set(cacheKey, response);
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('사용자 클럽 통계 조회 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 사용자의 퍼팅 통계 조회
 */
const getUserPuttingStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { distanceRange } = req.query;
    
    // 사용자가 자신의 통계만 조회할 수 있도록 권한 확인
    userId = getUserIdFromParams(userId, req.user);
    
    if (userId != req.user.userId && req.user.username !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: '다른 사용자의 통계를 조회할 권한이 없습니다.'
      });
    }
    
    // 캐시 확인
    const cacheKey = `user_putting_stats_${userId}_${distanceRange || 'all'}`;
    const cachedData = statsCache.get(cacheKey);
    
    if (cachedData) {
      return res.status(200).json(cachedData);
    }
    
    // 사용자 존재 확인
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    // 특정 거리 또는 모든 거리의 퍼팅 통계 조회
    const puttingStats = await StatsModel.getUserPuttingStats(userId, distanceRange);
    
    // 퍼팅 통계가 없는 경우
    if (!puttingStats || (Array.isArray(puttingStats) && puttingStats.length === 0)) {
      const response = {
        status: 'success',
        data: {
          userId: parseInt(userId),
          message: '아직 퍼팅 통계 데이터가 없습니다.'
        }
      };
      
      // 결과 캐싱
      statsCache.set(cacheKey, response);
      
      return res.status(200).json(response);
    }
    
    // 응답 데이터 가공
    let statsData;
    
    if (distanceRange) {
      // 특정 거리의 퍼팅 통계
      statsData = {
        userId: parseInt(userId),
        distanceRange: puttingStats.distance_range,
        attemptCount: puttingStats.attempt_count,
        successCount: puttingStats.success_count,
        successRate: puttingStats.success_rate,
        avgPuttsAfterGir: puttingStats.avg_putts_after_gir,
        threePuttCount: puttingStats.three_putt_count,
        lastUpdated: puttingStats.last_updated
      };
    } else {
      // 모든 거리의 퍼팅 통계
      statsData = puttingStats.map(stat => ({
        userId: parseInt(userId),
        distanceRange: stat.distance_range,
        attemptCount: stat.attempt_count,
        successCount: stat.success_count,
        successRate: stat.success_rate,
        avgPuttsAfterGir: stat.avg_putts_after_gir,
        threePuttCount: stat.three_putt_count,
        lastUpdated: stat.last_updated
      }));
    }
    
    const response = {
      status: 'success',
      data: statsData
    };
    
    // 결과 캐싱
    statsCache.set(cacheKey, response);
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('사용자 퍼팅 통계 조회 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 사용자의 기간별 성적 추이 조회
 */
const getUserTrendStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { periodType = 'monthly', limit = 6 } = req.query;
    
    // 사용자가 자신의 통계만 조회할 수 있도록 권한 확인
    userId = getUserIdFromParams(userId, req.user);
    
    if (userId != req.user.userId && req.user.username !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: '다른 사용자의 통계를 조회할 권한이 없습니다.'
      });
    }
    
    // 캐시 확인
    const cacheKey = `user_trend_stats_${userId}_${periodType}_${limit}`;
    const cachedData = statsCache.get(cacheKey);
    
    if (cachedData) {
      return res.status(200).json(cachedData);
    }
    
    // 사용자 존재 확인
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    // 트렌드 기간 유효성 검사
    if (!['weekly', 'monthly', 'quarterly'].includes(periodType)) {
      return res.status(400).json({
        status: 'error',
        message: '유효하지 않은 기간 유형입니다. weekly, monthly, quarterly 중 하나를 선택하세요.'
      });
    }
    
    // 기간별 성적 추이 조회
    const trendStats = await StatsModel.getUserTrendStats(userId, periodType);
    
    // 트렌드 통계가 없는 경우
    if (!trendStats || trendStats.length === 0) {
      const response = {
        status: 'success',
        data: {
          userId: parseInt(userId),
          periodType,
          message: '아직 트렌드 통계 데이터가 없습니다.'
        }
      };
      
      // 결과 캐싱
      statsCache.set(cacheKey, response);
      
      return res.status(200).json(response);
    }
    
    // 응답 데이터 가공 (최근 N개 기간만)
    const limitedTrends = trendStats.slice(0, parseInt(limit));
    
    const statsData = limitedTrends.map(trend => ({
      userId: parseInt(userId),
      periodType: trend.period_type,
      periodStart: trend.period_start,
      periodEnd: trend.period_end,
      roundsPlayed: trend.rounds_played,
      avgScore: trend.avg_score,
      avgFairwayHitRate: trend.avg_fairway_hit_rate,
      avgGreenHitRate: trend.avg_green_hit_rate,
      avgPuttsPerRound: trend.avg_putts_per_round,
      avgDrivingDistance: trend.avg_driving_distance,
      handicapChange: trend.handicap_change,
      lastUpdated: trend.last_updated
    }));
    
    const response = {
      status: 'success',
      data: statsData
    };
    
    // 결과 캐싱
    statsCache.set(cacheKey, response);
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('사용자 트렌드 통계 조회 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 사용자의 코스별 통계 조회
 */
const getUserCourseStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { courseId } = req.query;
    
    // 사용자가 자신의 통계만 조회할 수 있도록 권한 확인
    userId = getUserIdFromParams(userId, req.user);
    
    if (userId != req.user.userId && req.user.username !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: '다른 사용자의 통계를 조회할 권한이 없습니다.'
      });
    }
    
    // 캐시 확인
    const cacheKey = `user_course_stats_${userId}_${courseId || 'all'}`;
    const cachedData = statsCache.get(cacheKey);
    
    if (cachedData) {
      return res.status(200).json(cachedData);
    }
    
    // 사용자 존재 확인
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    // 특정 코스 또는 모든 코스의 통계 조회
    const courseStats = await StatsModel.getUserCourseStats(userId, courseId);
    
    // 코스 통계가 없는 경우
    if (!courseStats || (Array.isArray(courseStats) && courseStats.length === 0)) {
      const response = {
        status: 'success',
        data: {
          userId: parseInt(userId),
          message: '아직 코스 통계 데이터가 없습니다.'
        }
      };
      
      // 결과 캐싱
      statsCache.set(cacheKey, response);
      
      return res.status(200).json(response);
    }
    
    // 응답 데이터 가공
    let statsData;
    
    if (courseId) {
      // 특정 코스의 통계
      statsData = {
        userId: parseInt(userId),
        courseId: courseStats.course_id,
        courseName: courseStats.course_name,
        roundsPlayed: courseStats.rounds_played,
        bestScore: courseStats.best_score,
        avgScore: courseStats.avg_score,
        avgPutts: courseStats.avg_putts,
        fairwayHitRate: courseStats.fairway_hit_rate,
        greenHitRate: courseStats.green_hit_rate,
        favoriteCourse: courseStats.favorite_course === 1,
        lastPlayed: courseStats.last_played,
        lastUpdated: courseStats.last_updated
      };
    } else {
      // 모든 코스의 통계
      statsData = courseStats.map(stat => ({
        userId: parseInt(userId),
        courseId: stat.course_id,
        courseName: stat.course_name,
        roundsPlayed: stat.rounds_played,
        bestScore: stat.best_score,
        avgScore: stat.avg_score,
        avgPutts: stat.avg_putts,
        fairwayHitRate: stat.fairway_hit_rate,
        greenHitRate: stat.green_hit_rate,
        favoriteCourse: stat.favorite_course === 1,
        lastPlayed: stat.last_played,
        lastUpdated: stat.last_updated
      }));
    }
    
    const response = {
      status: 'success',
      data: statsData
    };
    
    // 결과 캐싱
    statsCache.set(cacheKey, response);
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('사용자 코스 통계 조회 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 사용자의 동반자 비교 통계 조회
 */
const getUserComparisonStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { opponentId } = req.query;
    
    // 사용자가 자신의 통계만 조회할 수 있도록 권한 확인
    userId = getUserIdFromParams(userId, req.user);
    
    if (userId != req.user.userId && req.user.username !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: '다른 사용자의 통계를 조회할 권한이 없습니다.'
      });
    }
    
    // 캐시 확인
    const cacheKey = `user_comparison_stats_${userId}_${opponentId || 'all'}`;
    const cachedData = statsCache.get(cacheKey);
    
    if (cachedData) {
      return res.status(200).json(cachedData);
    }
    
    // 사용자 존재 확인
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    // 특정 동반자 또는 모든 동반자의 비교 통계 조회
    const comparisonStats = await StatsModel.getUserComparisonStats(userId, opponentId);
    
    // 비교 통계가 없는 경우
    if (!comparisonStats || (Array.isArray(comparisonStats) && comparisonStats.length === 0)) {
      const response = {
        status: 'success',
        data: {
          userId: parseInt(userId),
          message: '아직 동반자 비교 통계 데이터가 없습니다.'
        }
      };
      
      // 결과 캐싱
      statsCache.set(cacheKey, response);
      
      return res.status(200).json(response);
    }
    
    // 응답 데이터 가공
    let statsData;
    
    if (opponentId) {
      // 특정 동반자와의 비교 통계
      statsData = {
        userId: parseInt(userId),
        opponentId: comparisonStats.opponent_id,
        opponentName: comparisonStats.full_name,
        opponentUsername: comparisonStats.username,
        totalRounds: comparisonStats.total_rounds,
        winCount: comparisonStats.win_count,
        lossCount: comparisonStats.loss_count,
        drawCount: comparisonStats.draw_count,
        avgScoreDiff: comparisonStats.avg_score_diff,
        drivingDistanceDiff: comparisonStats.driving_distance_diff,
        puttingDiff: comparisonStats.putting_diff,
        lastRoundDate: comparisonStats.last_round_date,
        lastUpdated: comparisonStats.last_updated
      };
    } else {
      // 모든 동반자와의 비교 통계
      statsData = comparisonStats.map(stat => ({
        userId: parseInt(userId),
        opponentId: stat.opponent_id,
        opponentName: stat.full_name,
        opponentUsername: stat.username,
        totalRounds: stat.total_rounds,
        winCount: stat.win_count,
        lossCount: stat.loss_count,
        drawCount: stat.draw_count,
        avgScoreDiff: stat.avg_score_diff,
        lastRoundDate: stat.last_round_date,
        lastUpdated: stat.last_updated
      }));
    }
    
    const response = {
      status: 'success',
      data: statsData
    };
    
    // 결과 캐싱
    statsCache.set(cacheKey, response);
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('사용자 동반자 비교 통계 조회 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 특정 코스의 홀별 난이도 통계 조회
 */
const getCourseDifficultyStats = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { courseNumber } = req.query;
    
    // 캐시 확인
    const cacheKey = `course_difficulty_stats_${courseId}_${courseNumber || 'all'}`;
    const cachedData = statsCache.get(cacheKey);
    
    if (cachedData) {
      return res.status(200).json(cachedData);
    }
    
    // 코스 내 특정 코스 또는 모든 코스의 홀별 난이도 통계 조회
    const difficultyStats = await StatsModel.getHoleDifficultyStats(courseId, courseNumber);
    
    // 홀별 난이도 통계가 없는 경우
    if (!difficultyStats || difficultyStats.length === 0) {
      const response = {
        status: 'success',
        data: {
          courseId: parseInt(courseId),
          message: '아직 홀별 난이도 통계 데이터가 없습니다.'
        }
      };
      
      // 결과 캐싱
      statsCache.set(cacheKey, response);
      
      return res.status(200).json(response);
    }
    
    // 응답 데이터 가공
    const statsData = difficultyStats.map(stat => ({
      courseId: stat.course_id,
      courseNumber: stat.course_number,
      courseName: stat.course_name,
      holeNumber: stat.hole_number,
      par: stat.par,
      holeType: stat.hole_type,
      totalPlays: stat.total_plays,
      avgScore: stat.avg_score,
      parDiff: stat.par_diff,
      birdieRate: stat.birdie_rate,
      parRate: stat.par_rate,
      bogeyRate: stat.bogey_rate,
      avgPutts: stat.avg_putts,
      greenHitRate: stat.green_hit_rate,
      fairwayHitRate: stat.fairway_hit_rate,
      difficultyRank: stat.difficulty_rank,
      lastUpdated: stat.last_updated
    }));
    
    const response = {
      status: 'success',
      data: statsData
    };
    
    // 결과 캐싱
    statsCache.set(cacheKey, response);
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('코스 난이도 통계 조회 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 통계 데이터 재계산 (관리자 전용)
 */
const recalculateUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 해당 사용자의 통계 재계산 수행
    await StatsModel.recalculateUserStats(userId);
    
    // 해당 사용자의 캐시 무효화
    statsCache.invalidate(`user_.*_${userId}`);
    
    return res.status(200).json({
      status: 'success',
      message: '사용자 통계가 성공적으로 재계산되었습니다.'
    });
  } catch (error) {
    console.error('통계 재계산 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

// 캐시를 새로고침하는 엔드포인트 추가
const refreshStatsCache = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 사용자가 자신의 통계만 새로고침할 수 있도록 확인
    userId = getUserIdFromParams(userId, req.user);
    
    if (userId != req.user.userId && req.user.username !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: '다른 사용자의 통계를 새로고침할 권한이 없습니다.'
      });
    }
    
    // 해당 사용자의 캐시 무효화
    statsCache.invalidate(`user_.*_${userId}`);
    
    return res.status(200).json({
      status: 'success',
      message: '통계 캐시가 성공적으로 새로고침되었습니다.'
    });
  } catch (error) {
    console.error('통계 캐시 새로고침 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

module.exports = {
  getUserStats,
  getUserClubStats,
  getUserPuttingStats,
  getUserTrendStats,
  getUserCourseStats,
  getUserComparisonStats,
  getCourseDifficultyStats,
  recalculateUserStats,
  refreshStatsCache
}; 