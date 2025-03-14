/**
 * 라운드 컨트롤러
 * 라운드 정보 관련 기능을 처리합니다.
 */
const { RoundModel, CourseModel, StatsModel } = require('../models');

/**
 * 사용자의 모든 라운드 조회
 */
const getUserRounds = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // 사용자가 자신의 라운드 정보만 조회할 수 있도록 권한 확인
    if (userId != req.user.userId && req.user.username !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: '다른 사용자의 라운드 정보를 조회할 권한이 없습니다.'
      });
    }
    
    // 사용자의 라운드 목록 조회
    const rounds = await RoundModel.getUserRounds(userId, limit, offset);
    
    // 사용자의 라운드 총 개수 조회 (페이지네이션 정보용)
    const totalRounds = await RoundModel.getUserRoundsCount(userId);
    
    // 응답 데이터 가공
    const roundsData = rounds.map(round => ({
      roundId: round.round_id,
      courseName: round.course_name,
      courseId: round.course_id,
      firstCourseNumber: round.first_course_number,
      secondCourseNumber: round.second_course_number,
      roundDate: round.round_date,
      roundTime: round.round_time,
      totalScore: round.total_score,
      totalPutts: round.total_putts,
      fairwaysHit: round.fairways_hit,
      fairwaysTotal: round.fairways_total,
      greensHit: round.greens_hit,
      greensTotal: round.greens_total,
      penalties: round.penalties,
      birdies: round.birdies,
      pars: round.pars,
      bogeys: round.bogeys,
      doublesOrWorse: round.doubles_or_worse
    }));
    
    // 응답
    return res.status(200).json({
      status: 'success',
      data: roundsData,
      pagination: {
        page: page,
        limit: limit,
        totalRecords: totalRounds,
        totalPages: Math.ceil(totalRounds / limit)
      }
    });
  } catch (error) {
    console.error('라운드 목록 조회 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 특정 라운드 상세 정보 조회
 */
const getRoundById = async (req, res) => {
  try {
    const { roundId } = req.params;
    
    // 라운드 정보 조회
    const round = await RoundModel.findRoundById(roundId);
    if (!round) {
      return res.status(404).json({
        status: 'error',
        message: '라운드 정보를 찾을 수 없습니다.'
      });
    }
    
    // 사용자가 자신의 라운드 정보만 조회할 수 있도록 권한 확인
    if (round.user_id != req.user.userId && req.user.username !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: '다른 사용자의 라운드 정보를 조회할 권한이 없습니다.'
      });
    }
    
    // 라운드의 홀별 결과 조회
    const holes = await RoundModel.getRoundHoles(roundId);
    
    // 라운드의 파트너 정보 조회
    const partners = await RoundModel.getRoundPartners(roundId);
    
    // 응답 데이터 가공
    const roundData = {
      roundId: round.round_id,
      userId: round.user_id,
      courseName: round.course_name,
      courseId: round.course_id,
      firstCourseNumber: round.first_course_number,
      secondCourseNumber: round.second_course_number,
      roundDate: round.round_date,
      roundTime: round.round_time,
      totalScore: round.total_score,
      totalPutts: round.total_putts,
      fairwaysHit: round.fairways_hit,
      fairwaysTotal: round.fairways_total,
      greensHit: round.greens_hit,
      greensTotal: round.greens_total,
      penalties: round.penalties,
      birdies: round.birdies,
      pars: round.pars,
      bogeys: round.bogeys,
      doublesOrWorse: round.doubles_or_worse,
      greenSpeed: round.green_speed,
      playerLevel: round.player_level,
      windSpeed: round.wind_speed,
      concedeDistance: round.concede_distance,
      mulliganAllowed: round.mulligan_allowed,
      mulliganUsed: round.mulligan_used,
      weatherCondition: round.weather_condition,
      temperature: round.temperature,
      status: round.status,
      createdAt: round.created_at,
      holes: holes.map(hole => ({
        roundHoleId: hole.round_hole_id,
        courseNumber: hole.course_number,
        holeNumber: hole.hole_number,
        par: hole.par,
        score: hole.score,
        putts: hole.putts,
        fairwayHit: hole.fairway_hit === 1,
        greenHit: hole.green_hit === 1,
        greenInRegulation: hole.green_in_regulation === 1,
        sandSave: hole.sand_save === 1,
        upAndDown: hole.up_and_down === 1,
        penalties: hole.penalties,
        puttDistanceFirst: hole.putt_distance_first,
        resultType: hole.result_type
      })),
      partners: partners.map(partner => ({
        partnerId: partner.partner_id,
        partnerUserId: partner.partner_user_id,
        partnerName: partner.partner_name || (partner.username ? `${partner.full_name} (${partner.username})` : null),
        totalScore: partner.total_score,
        matchResult: partner.match_result,
        scoreDifference: partner.score_difference
      }))
    };
    
    // 응답
    return res.status(200).json({
      status: 'success',
      data: roundData
    });
  } catch (error) {
    console.error('라운드 상세 정보 조회 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 새 라운드 정보 생성
 */
const createRound = async (req, res) => {
  try {
    const {
      courseId,
      firstCourseNumber,
      secondCourseNumber,
      roundDate,
      roundTime,
      totalScore,
      totalPutts,
      fairwaysHit,
      fairwaysTotal,
      greensHit,
      greensTotal,
      penalties,
      birdies,
      pars,
      bogeys,
      doublesOrWorse,
      greenSpeed,
      playerLevel,
      windSpeed,
      concedeDistance,
      mulliganAllowed,
      mulliganUsed,
      weatherCondition,
      temperature,
      holes,
      partners
    } = req.body;
    
    // 필수 필드 검증
    if (!courseId || !firstCourseNumber || !roundDate || !roundTime || !totalScore) {
      return res.status(400).json({
        status: 'error',
        message: '코스 ID, 코스 번호, 라운드 날짜, 라운드 시간, 총 스코어는 필수 입력 항목입니다.'
      });
    }
    
    // 골프 코스 존재 확인
    const course = await CourseModel.findCourseById(courseId);
    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: '골프 코스를 찾을 수 없습니다.'
      });
    }
    
    // 라운드 데이터 생성
    const roundData = {
      user_id: req.user.userId,
      course_id: courseId,
      first_course_number: firstCourseNumber,
      second_course_number: secondCourseNumber,
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
      green_speed: greenSpeed,
      player_level: playerLevel,
      wind_speed: windSpeed,
      concede_distance: concedeDistance,
      mulligan_allowed: mulliganAllowed,
      mulligan_used: mulliganUsed,
      weather_condition: weatherCondition,
      temperature: temperature,
      status: 1 // 완료 상태
    };
    
    // 라운드 생성
    const roundId = await RoundModel.createRound(roundData);
    
    // 홀별 결과 추가
    if (holes && Array.isArray(holes)) {
      for (const hole of holes) {
        const holeData = {
          round_id: roundId,
          course_number: hole.courseNumber,
          hole_number: hole.holeNumber,
          par: hole.par,
          score: hole.score,
          putts: hole.putts,
          fairway_hit: hole.fairwayHit ? 1 : 0,
          green_hit: hole.greenHit ? 1 : 0,
          green_in_regulation: hole.greenInRegulation ? 1 : 0,
          sand_save: hole.sandSave ? 1 : 0,
          up_and_down: hole.upAndDown ? 1 : 0,
          penalties: hole.penalties,
          putt_distance_first: hole.puttDistanceFirst,
          result_type: hole.score < hole.par ? 1 : (hole.score === hole.par ? 2 : (hole.score === hole.par + 1 ? 3 : 4))
        };
        
        await RoundModel.addRoundHole(holeData);
      }
    }
    
    // 파트너 정보 추가
    if (partners && Array.isArray(partners)) {
      for (const partner of partners) {
        const partnerData = {
          round_id: roundId,
          user_id: req.user.userId,
          partner_user_id: partner.partnerUserId,
          partner_name: partner.partnerName,
          total_score: partner.totalScore,
          match_result: partner.totalScore > totalScore ? 1 : (partner.totalScore < totalScore ? 2 : 3),
          score_difference: totalScore - partner.totalScore
        };
        
        await RoundModel.addRoundPartner(partnerData);
      }
    }
    
    // 사용자 통계 업데이트
    await StatsModel.calculateAndUpdateUserStats(req.user.userId);
    
    // 응답
    return res.status(201).json({
      status: 'success',
      message: '라운드 정보가 성공적으로 생성되었습니다.',
      data: {
        roundId,
        courseId,
        roundDate,
        totalScore
      }
    });
  } catch (error) {
    console.error('라운드 정보 생성 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 라운드 정보 업데이트
 */
const updateRound = (req, res) => {
  try {
    const { roundId } = req.params;
    const {
      totalScore,
      totalPutts,
      fairwaysHit,
      fairwaysTotal,
      greensHit,
      greensTotal,
      penalties,
      birdies,
      pars,
      bogeys,
      doublesOrWorse,
      status
    } = req.body;
    
    // 라운드 정보 조회
    const round = RoundModel.findRoundById(roundId);
    if (!round) {
      return res.status(404).json({
        status: 'error',
        message: '라운드 정보를 찾을 수 없습니다.'
      });
    }
    
    // 사용자가 자신의 라운드 정보만 업데이트할 수 있도록 권한 확인
    if (round.user_id != req.user.userId && req.user.username !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: '다른 사용자의 라운드 정보를 업데이트할 권한이 없습니다.'
      });
    }
    
    // 라운드 데이터 업데이트
    const roundData = {
      total_score: totalScore !== undefined ? totalScore : round.total_score,
      total_putts: totalPutts !== undefined ? totalPutts : round.total_putts,
      fairways_hit: fairwaysHit !== undefined ? fairwaysHit : round.fairways_hit,
      fairways_total: fairwaysTotal !== undefined ? fairwaysTotal : round.fairways_total,
      greens_hit: greensHit !== undefined ? greensHit : round.greens_hit,
      greens_total: greensTotal !== undefined ? greensTotal : round.greens_total,
      penalties: penalties !== undefined ? penalties : round.penalties,
      birdies: birdies !== undefined ? birdies : round.birdies,
      pars: pars !== undefined ? pars : round.pars,
      bogeys: bogeys !== undefined ? bogeys : round.bogeys,
      doubles_or_worse: doublesOrWorse !== undefined ? doublesOrWorse : round.doubles_or_worse,
      status: status !== undefined ? status : round.status
    };
    
    // 라운드 업데이트
    const updated = RoundModel.updateRound(roundId, roundData);
    if (!updated) {
      return res.status(500).json({
        status: 'error',
        message: '라운드 정보 업데이트에 실패했습니다.'
      });
    }
    
    // 사용자 통계 업데이트
    StatsModel.calculateAndUpdateUserStats(round.user_id);
    
    // 응답
    return res.status(200).json({
      status: 'success',
      message: '라운드 정보가 성공적으로 업데이트되었습니다.',
      data: {
        roundId,
        totalScore: roundData.total_score,
        status: roundData.status
      }
    });
  } catch (error) {
    console.error('라운드 정보 업데이트 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 홀별 결과 업데이트
 */
const updateRoundHole = (req, res) => {
  try {
    const { roundId, holeId } = req.params;
    const {
      score,
      putts,
      fairwayHit,
      greenHit,
      greenInRegulation,
      sandSave,
      upAndDown,
      penalties,
      puttDistanceFirst,
      resultType
    } = req.body;
    
    // 라운드 정보 조회
    const round = RoundModel.findRoundById(roundId);
    if (!round) {
      return res.status(404).json({
        status: 'error',
        message: '라운드 정보를 찾을 수 없습니다.'
      });
    }
    
    // 사용자가 자신의 라운드 정보만 업데이트할 수 있도록 권한 확인
    if (round.user_id != req.user.userId && req.user.username !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: '다른 사용자의 라운드 정보를 업데이트할 권한이 없습니다.'
      });
    }
    
    // 홀별 결과 조회
    const holes = RoundModel.getRoundHoles(roundId);
    const hole = holes.find(h => h.round_hole_id == holeId);
    
    if (!hole) {
      return res.status(404).json({
        status: 'error',
        message: '홀 정보를 찾을 수 없습니다.'
      });
    }
    
    // 홀별 결과 데이터 업데이트
    const holeData = {
      score: score !== undefined ? score : hole.score,
      putts: putts !== undefined ? putts : hole.putts,
      fairway_hit: fairwayHit !== undefined ? (fairwayHit ? 1 : 0) : hole.fairway_hit,
      green_hit: greenHit !== undefined ? (greenHit ? 1 : 0) : hole.green_hit,
      green_in_regulation: greenInRegulation !== undefined ? (greenInRegulation ? 1 : 0) : hole.green_in_regulation,
      sand_save: sandSave !== undefined ? (sandSave ? 1 : 0) : hole.sand_save,
      up_and_down: upAndDown !== undefined ? (upAndDown ? 1 : 0) : hole.up_and_down,
      penalties: penalties !== undefined ? penalties : hole.penalties,
      putt_distance_first: puttDistanceFirst !== undefined ? puttDistanceFirst : hole.putt_distance_first,
      result_type: resultType !== undefined ? resultType : hole.result_type
    };
    
    // 홀별 결과 업데이트
    const updated = RoundModel.updateRoundHole(holeId, holeData);
    if (!updated) {
      return res.status(500).json({
        status: 'error',
        message: '홀 정보 업데이트에 실패했습니다.'
      });
    }
    
    // 라운드 총 스코어 재계산 필요
    // (여기서는 간단히 구현하지만, 실제로는 모든 홀의 스코어를 합산하여 업데이트해야 함)
    
    // 응답
    return res.status(200).json({
      status: 'success',
      message: '홀 정보가 성공적으로 업데이트되었습니다.',
      data: {
        roundId,
        holeId,
        score: holeData.score
      }
    });
  } catch (error) {
    console.error('홀 정보 업데이트 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 라운드 삭제
 */
const deleteRound = (req, res) => {
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
    
    // 사용자가 자신의 라운드 정보만 삭제할 수 있도록 권한 확인
    if (round.user_id != req.user.userId && req.user.username !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: '다른 사용자의 라운드 정보를 삭제할 권한이 없습니다.'
      });
    }
    
    // 라운드 삭제
    const deleted = RoundModel.deleteRound(roundId);
    if (!deleted) {
      return res.status(500).json({
        status: 'error',
        message: '라운드 정보 삭제에 실패했습니다.'
      });
    }
    
    // 사용자 통계 업데이트
    StatsModel.calculateAndUpdateUserStats(round.user_id);
    
    // 응답
    return res.status(200).json({
      status: 'success',
      message: '라운드 정보가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('라운드 정보 삭제 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 최근 라운드 기록 조회
 */
const getRoundHistory = async (req, res) => {
  try {
    console.log('[DEBUG] getRoundHistory 함수 호출됨');
    console.log('[DEBUG] 요청 객체: ', req.user);
    
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 10;
    
    console.log(`[INFO] 사용자 ID ${userId}의 최근 ${limit}개 라운드 기록 조회`);
    
    // 라운드 목록 조회 (최신순)
    const rounds = await RoundModel.getUserRecentRounds(userId, limit);
    
    console.log(`[DEBUG] 조회된 라운드 데이터: `, JSON.stringify(rounds));
    
    if (!rounds || rounds.length === 0) {
      console.log(`[INFO] 사용자 ID ${userId}의 라운드 기록이 없습니다.`);
      return res.status(200).json({
        status: 'success',
        data: []
      });
    }
    
    console.log(`[INFO] 사용자 ID ${userId}의 라운드 기록 ${rounds.length}개 조회 성공`);
    
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
    
    console.log('[DEBUG] 응답 데이터: ', JSON.stringify(roundsData));
    
    // 응답
    return res.status(200).json({
      status: 'success',
      data: roundsData
    });
  } catch (error) {
    console.error('[ERROR] 최근 라운드 기록 조회 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

module.exports = {
  getRoundHistory,
  getUserRounds,
  getRoundById,
  createRound,
  updateRound,
  updateRoundHole,
  deleteRound
}; 