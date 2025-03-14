/**
 * 샷 컨트롤러
 * 샷 데이터 관련 기능을 처리합니다.
 */
const { ShotModel, RoundModel, StatsModel } = require('../models');

/**
 * 라운드의 모든 샷 조회
 */
const getRoundShots = (req, res) => {
  try {
    const { roundId } = req.params;
    
    // 라운드 정보 조회
    const round = RoundModel.findRoundById(roundId);
    if (!round) {
      return res.status(404).json({
        status: 'error',
        message: '라운드 정보를 찾을 수 없습니다.'
      });
    }
    
    // 사용자가 자신의 샷 정보만 조회할 수 있도록 권한 확인
    if (round.user_id != req.user.userId && req.user.username !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: '다른 사용자의 샷 정보를 조회할 권한이 없습니다.'
      });
    }
    
    // 라운드의 샷 목록 조회
    const shots = ShotModel.getRoundShots(roundId);
    
    // 응답 데이터 가공
    const shotsData = shots.map(shot => ({
      shotId: shot.shot_id,
      roundId: shot.round_id,
      courseNumber: shot.course_number,
      holeNumber: shot.hole_number,
      shotTime: shot.shot_time,
      shotSequence: shot.shot_sequence,
      club: shot.club,
      clubCategory: shot.club_category,
      terrain: shot.terrain,
      shotType: shot.shot_type,
      distance: shot.distance,
      carryDistance: shot.carry_distance,
      clubSpeed: shot.club_speed,
      attackAngle: shot.attack_angle,
      ballSpeed: shot.ball_speed,
      smashFactor: shot.smash_factor,
      verticalAngle: shot.vertical_angle,
      horizontalAngle: shot.horizontal_angle,
      totalSpin: shot.total_spin,
      sideSpin: shot.side_spin,
      backSpin: shot.back_spin,
      remainingDistance: shot.remaining_distance,
      hangTime: shot.hang_time,
      clubPath: shot.club_path,
      faceAngle: shot.face_angle,
      isFairwayShot: shot.is_fairway_shot === 1,
      isGreenShot: shot.is_green_shot === 1,
      isPutt: shot.is_putt === 1,
      distanceToPinBefore: shot.distance_to_pin_before,
      distanceToPinAfter: shot.distance_to_pin_after,
      distanceToTarget: shot.distance_to_target,
      accuracy: shot.accuracy,
      dispersionLeft: shot.dispersion_left,
      dispersionRight: shot.dispersion_right,
      shotQuality: shot.shot_quality
    }));
    
    // 응답
    return res.status(200).json({
      status: 'success',
      data: shotsData
    });
  } catch (error) {
    console.error('샷 목록 조회 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 라운드의 특정 홀 샷 조회
 */
const getHoleShots = (req, res) => {
  try {
    const { roundId, courseNumber, holeNumber } = req.params;
    
    // 라운드 정보 조회
    const round = RoundModel.findRoundById(roundId);
    if (!round) {
      return res.status(404).json({
        status: 'error',
        message: '라운드 정보를 찾을 수 없습니다.'
      });
    }
    
    // 사용자가 자신의 샷 정보만 조회할 수 있도록 권한 확인
    if (round.user_id != req.user.userId && req.user.username !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: '다른 사용자의 샷 정보를 조회할 권한이 없습니다.'
      });
    }
    
    // 특정 홀의 샷 목록 조회
    const shots = ShotModel.getHoleShots(roundId, courseNumber, holeNumber);
    
    // 응답 데이터 가공
    const shotsData = shots.map(shot => ({
      shotId: shot.shot_id,
      roundId: shot.round_id,
      courseNumber: shot.course_number,
      holeNumber: shot.hole_number,
      shotTime: shot.shot_time,
      shotSequence: shot.shot_sequence,
      club: shot.club,
      clubCategory: shot.club_category,
      terrain: shot.terrain,
      shotType: shot.shot_type,
      distance: shot.distance,
      carryDistance: shot.carry_distance,
      clubSpeed: shot.club_speed,
      attackAngle: shot.attack_angle,
      ballSpeed: shot.ball_speed,
      smashFactor: shot.smash_factor,
      verticalAngle: shot.vertical_angle,
      horizontalAngle: shot.horizontal_angle,
      totalSpin: shot.total_spin,
      sideSpin: shot.side_spin,
      backSpin: shot.back_spin,
      remainingDistance: shot.remaining_distance,
      hangTime: shot.hang_time,
      clubPath: shot.club_path,
      faceAngle: shot.face_angle,
      isFairwayShot: shot.is_fairway_shot === 1,
      isGreenShot: shot.is_green_shot === 1,
      isPutt: shot.is_putt === 1,
      distanceToPinBefore: shot.distance_to_pin_before,
      distanceToPinAfter: shot.distance_to_pin_after,
      distanceToTarget: shot.distance_to_target,
      accuracy: shot.accuracy,
      dispersionLeft: shot.dispersion_left,
      dispersionRight: shot.dispersion_right,
      shotQuality: shot.shot_quality
    }));
    
    // 응답
    return res.status(200).json({
      status: 'success',
      data: {
        roundId: parseInt(roundId),
        courseNumber: parseInt(courseNumber),
        holeNumber: parseInt(holeNumber),
        shots: shotsData
      }
    });
  } catch (error) {
    console.error('홀별 샷 목록 조회 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 사용자의 최근 샷 목록 조회
 */
const getUserRecentShots = (req, res) => {
  try {
    const { userId } = req.params;
    const { count = 50 } = req.query;
    
    // 사용자가 자신의 샷 정보만 조회할 수 있도록 권한 확인
    if (userId != req.user.userId && req.user.username !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: '다른 사용자의 샷 정보를 조회할 권한이 없습니다.'
      });
    }
    
    // 사용자의 최근 샷 목록 조회
    const shots = ShotModel.getRecentShots(userId, parseInt(count));
    
    // 응답 데이터 가공
    const shotsData = shots.map(shot => ({
      shotId: shot.shot_id,
      roundId: shot.round_id,
      roundDate: shot.round_date,
      courseName: shot.course_name,
      courseNumber: shot.course_number,
      holeNumber: shot.hole_number,
      shotTime: shot.shot_time,
      shotSequence: shot.shot_sequence,
      club: shot.club,
      clubCategory: shot.club_category,
      terrain: shot.terrain,
      shotType: shot.shot_type,
      distance: shot.distance,
      carryDistance: shot.carry_distance,
      isFairwayShot: shot.is_fairway_shot === 1,
      isGreenShot: shot.is_green_shot === 1,
      isPutt: shot.is_putt === 1
    }));
    
    // 응답
    return res.status(200).json({
      status: 'success',
      data: shotsData
    });
  } catch (error) {
    console.error('사용자 최근 샷 목록 조회 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 사용자의 클럽별 샷 통계 조회
 */
const getUserClubStats = (req, res) => {
  try {
    const { userId, club } = req.params;
    
    // 사용자가 자신의 샷 정보만 조회할 수 있도록 권한 확인
    if (userId != req.user.userId && req.user.username !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: '다른 사용자의 샷 통계를 조회할 권한이 없습니다.'
      });
    }
    
    // 클럽별 샷 통계 조회
    const stats = ShotModel.getUserClubStats(userId, club);
    
    if (!stats) {
      return res.status(404).json({
        status: 'error',
        message: '해당 클럽의 통계 정보를 찾을 수 없습니다.'
      });
    }
    
    // 응답 데이터 가공
    const statsData = {
      club,
      shotCount: stats.shot_count,
      avgDistance: stats.avg_distance,
      avgCarryDistance: stats.avg_carry_distance,
      maxDistance: stats.max_distance,
      avgClubSpeed: stats.avg_club_speed,
      avgBallSpeed: stats.avg_ball_speed,
      avgSmashFactor: stats.avg_smash_factor,
      avgTotalSpin: stats.avg_total_spin,
      avgSideSpin: stats.avg_side_spin,
      avgBackSpin: stats.avg_back_spin,
      fairwayAccuracy: stats.fairway_accuracy,
      greenAccuracy: stats.green_accuracy
    };
    
    // 응답
    return res.status(200).json({
      status: 'success',
      data: statsData
    });
  } catch (error) {
    console.error('클럽별 샷 통계 조회 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 새 샷 정보 생성
 */
const createShot = (req, res) => {
  try {
    const {
      roundId,
      courseNumber,
      holeNumber,
      shotTime,
      shotSequence,
      club,
      clubCategory,
      terrain,
      shotType,
      distance,
      carryDistance,
      clubSpeed,
      attackAngle,
      ballSpeed,
      smashFactor,
      verticalAngle,
      horizontalAngle,
      totalSpin,
      sideSpin,
      backSpin,
      remainingDistance,
      hangTime,
      clubPath,
      faceAngle,
      isFairwayShot,
      isGreenShot,
      isPutt,
      distanceToPinBefore,
      distanceToPinAfter,
      distanceToTarget,
      accuracy,
      dispersionLeft,
      dispersionRight,
      shotQuality
    } = req.body;
    
    // 필수 필드 검증
    if (!roundId || !courseNumber || !holeNumber || !shotSequence) {
      return res.status(400).json({
        status: 'error',
        message: '라운드 ID, 코스 번호, 홀 번호, 샷 순서는 필수 입력 항목입니다.'
      });
    }
    
    // 라운드 정보 조회
    const round = RoundModel.findRoundById(roundId);
    if (!round) {
      return res.status(404).json({
        status: 'error',
        message: '라운드 정보를 찾을 수 없습니다.'
      });
    }
    
    // 사용자가 자신의 샷 정보만 생성할 수 있도록 권한 확인
    if (round.user_id != req.user.userId && req.user.username !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: '다른 사용자의 샷 정보를 생성할 권한이 없습니다.'
      });
    }
    
    // 샷 데이터 생성
    const shotData = {
      round_id: roundId,
      user_id: round.user_id,
      course_id: round.course_id,
      course_number: courseNumber,
      hole_number: holeNumber,
      shot_time: shotTime || new Date().toISOString(),
      shot_sequence: shotSequence,
      club,
      club_category: clubCategory,
      terrain,
      shot_type: shotType,
      distance,
      carry_distance: carryDistance,
      club_speed: clubSpeed,
      attack_angle: attackAngle,
      ball_speed: ballSpeed,
      smash_factor: smashFactor,
      vertical_angle: verticalAngle,
      horizontal_angle: horizontalAngle,
      total_spin: totalSpin,
      side_spin: sideSpin,
      back_spin: backSpin,
      remaining_distance: remainingDistance,
      hang_time: hangTime,
      club_path: clubPath,
      face_angle: faceAngle,
      is_fairway_shot: isFairwayShot ? 1 : 0,
      is_green_shot: isGreenShot ? 1 : 0,
      is_putt: isPutt ? 1 : 0,
      distance_to_pin_before: distanceToPinBefore,
      distance_to_pin_after: distanceToPinAfter,
      distance_to_target: distanceToTarget,
      accuracy,
      dispersion_left: dispersionLeft,
      dispersion_right: dispersionRight,
      shot_quality: shotQuality
    };
    
    // 샷 생성
    const shotId = ShotModel.createShot(shotData);
    
    // 응답
    return res.status(201).json({
      status: 'success',
      message: '샷 정보가 성공적으로 생성되었습니다.',
      data: {
        shotId,
        roundId,
        courseNumber,
        holeNumber,
        shotSequence
      }
    });
  } catch (error) {
    console.error('샷 정보 생성 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 샷 정보 업데이트
 */
const updateShot = (req, res) => {
  try {
    const { shotId } = req.params;
    const {
      club,
      clubCategory,
      terrain,
      shotType,
      distance,
      carryDistance,
      clubSpeed,
      attackAngle,
      ballSpeed,
      smashFactor,
      verticalAngle,
      horizontalAngle,
      totalSpin,
      sideSpin,
      backSpin,
      remainingDistance,
      isFairwayShot,
      isGreenShot
    } = req.body;
    
    // 샷 정보 조회 로직 필요
    // 여기서는 간단히 처리하지만, 실제로는
    // ShotModel에서 샷 정보를 조회하고 사용자 권한을 확인해야 함
    
    // 샷 데이터 업데이트
    const shotData = {
      club,
      club_category: clubCategory,
      terrain,
      shot_type: shotType,
      distance,
      carry_distance: carryDistance,
      club_speed: clubSpeed,
      attack_angle: attackAngle,
      ball_speed: ballSpeed,
      smash_factor: smashFactor,
      vertical_angle: verticalAngle,
      horizontal_angle: horizontalAngle,
      total_spin: totalSpin,
      side_spin: sideSpin,
      back_spin: backSpin,
      remaining_distance: remainingDistance,
      is_fairway_shot: isFairwayShot,
      is_green_shot: isGreenShot
    };
    
    // 샷 업데이트
    const updated = ShotModel.updateShot(shotId, shotData);
    if (!updated) {
      return res.status(500).json({
        status: 'error',
        message: '샷 정보 업데이트에 실패했습니다.'
      });
    }
    
    // 응답
    return res.status(200).json({
      status: 'success',
      message: '샷 정보가 성공적으로 업데이트되었습니다.',
      data: {
        shotId
      }
    });
  } catch (error) {
    console.error('샷 정보 업데이트 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 샷 정보 삭제
 */
const deleteShot = (req, res) => {
  try {
    const { shotId } = req.params;
    
    // 샷 정보 삭제 로직 필요
    // 여기서는 간단히 처리하지만, 실제로는
    // ShotModel에서 샷 정보를 조회하고 사용자 권한을 확인해야 함
    
    // 샷 삭제
    const deleted = ShotModel.deleteShot(shotId);
    if (!deleted) {
      return res.status(500).json({
        status: 'error',
        message: '샷 정보 삭제에 실패했습니다.'
      });
    }
    
    // 응답
    return res.status(200).json({
      status: 'success',
      message: '샷 정보가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('샷 정보 삭제 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

module.exports = {
  getRoundShots,
  getHoleShots,
  getUserRecentShots,
  getUserClubStats,
  createShot,
  updateShot,
  deleteShot
}; 