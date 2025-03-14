/**
 * 골프 시뮬레이터 앱 샘플 데이터 생성 스크립트
 * 
 * 이 스크립트는 테스트 및 개발 목적으로 대량의 샘플 데이터를 생성합니다.
 */

// 환경변수 설정 (개발 환경으로 설정)
process.env.NODE_ENV = 'development';

const path = require('path');
const fs = require('fs');
const { UserModel, CourseModel, RoundModel, ShotModel, StatsModel } = require('../server/models');
const db = require('../server/models/db');

console.log('샘플 데이터 생성을 시작합니다...');

// 날짜 관련 유틸리티 함수
function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function formatTime(date) {
  return date.toTimeString().split(' ')[0];
}

// 랜덤 값 생성 유틸리티 함수
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max, decimals = 2) {
  const val = Math.random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomBoolean(probability = 0.5) {
  return Math.random() < probability;
}

// 샘플 데이터 생성 함수
async function generateSampleData() {
  try {
    db.exec('BEGIN TRANSACTION');
    
    // 기존 사용자 정보 가져오기
    const users = db.prepare('SELECT user_id FROM users').all();
    
    if (users.length === 0) {
      console.log('테스트 데이터를 생성하기 전에 먼저 init-db.js 스크립트를 실행하여 기본 데이터를 설정하세요.');
      db.exec('ROLLBACK');
      return;
    }
    
    // 기존 골프 코스 정보 가져오기
    const courses = db.prepare('SELECT course_id, course_count FROM golf_courses').all();
    
    if (courses.length === 0) {
      console.log('테스트 데이터를 생성하기 전에 먼저 init-db.js 스크립트를 실행하여 기본 데이터를 설정하세요.');
      db.exec('ROLLBACK');
      return;
    }
    
    // 각 사용자마다 여러 라운드 생성
    for (const user of users) {
      const userId = user.user_id;
      const roundCount = getRandomInt(10, 20); // 각 사용자별 10-20개의 라운드 생성
      
      console.log(`사용자 ID ${userId}에 대해 ${roundCount}개의 라운드 데이터를 생성합니다...`);
      
      // 라운드 생성
      for (let r = 0; r < roundCount; r++) {
        // 랜덤 코스 선택
        const course = getRandomElement(courses);
        const courseId = course.course_id;
        const firstCourseNumber = getRandomInt(1, course.course_count);
        const secondCourseNumber = course.course_count > 1 ? getRandomInt(1, course.course_count) : null;
        
        // 랜덤 날짜 생성 (최근 6개월 이내)
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        const roundDate = getRandomDate(sixMonthsAgo, today);
        
        // 랜덤 시간 생성 (오전 6시 ~ 오후 5시)
        roundDate.setHours(getRandomInt(6, 17), getRandomInt(0, 59), 0);
        
        // 라운드 옵션 설정
        const greenSpeed = getRandomInt(1, 5); // 1: 매우빠름 ~ 5: 매우느림
        const playerLevel = getRandomInt(1, 4); // 1: 투어프로 ~ 4: 비기너
        const windSpeed = getRandomInt(1, 3); // 1: 빠름 ~ 3: 느림
        const concedeDistance = getRandomInt(1, 5); // 1m ~ 5m
        const mulliganAllowed = getRandomInt(0, 5); // 0 ~ 5회
        const mulliganUsed = getRandomInt(0, mulliganAllowed); // 0 ~ mulliganAllowed회
        
        // 날씨 조건
        const weatherConditions = ['맑음', '흐림', '바람많음', '소나기', '더움', '선선함'];
        const weatherCondition = getRandomElement(weatherConditions);
        const temperature = getRandomInt(15, 35); // 15도 ~ 35도
        
        // 기본 스코어 설정 (플레이어 레벨에 따라 다르게)
        let baseScore = 0;
        switch (playerLevel) {
          case 1: // 투어프로
            baseScore = getRandomInt(68, 75);
            break;
          case 2: // 프로
            baseScore = getRandomInt(72, 80);
            break;
          case 3: // 세미프로
            baseScore = getRandomInt(78, 88);
            break;
          case 4: // 비기너
            baseScore = getRandomInt(85, 100);
            break;
        }
        
        // 라운드 통계 설정
        const fairwaysTotal = 14; // 일반적인 18홀 라운드에서의 페어웨이 수
        const fairwaysHit = getRandomInt(Math.floor(fairwaysTotal * 0.3), fairwaysTotal);
        const greensTotal = 18; // 18홀
        const greensHit = getRandomInt(Math.floor(greensTotal * 0.3), greensTotal);
        const totalPutts = getRandomInt(24, 38);
        const penalties = getRandomInt(0, 6);
        
        // 스코어 유형 카운트 (버디, 파, 보기 등)
        let birdies = 0;
        let pars = 0;
        let bogeys = 0;
        let doublesOrWorse = 0;
        
        // 플레이어 레벨에 따라 다른 분포
        switch (playerLevel) {
          case 1: // 투어프로
            birdies = getRandomInt(3, 7);
            pars = getRandomInt(9, 14);
            bogeys = 18 - birdies - pars;
            doublesOrWorse = getRandomInt(0, 1);
            break;
          case 2: // 프로
            birdies = getRandomInt(1, 5);
            pars = getRandomInt(8, 12);
            bogeys = getRandomInt(4, 8);
            doublesOrWorse = 18 - birdies - pars - bogeys;
            break;
          case 3: // 세미프로
            birdies = getRandomInt(0, 3);
            pars = getRandomInt(5, 10);
            bogeys = getRandomInt(6, 10);
            doublesOrWorse = 18 - birdies - pars - bogeys;
            break;
          case 4: // 비기너
            birdies = getRandomInt(0, 1);
            pars = getRandomInt(2, 7);
            bogeys = getRandomInt(5, 10);
            doublesOrWorse = 18 - birdies - pars - bogeys;
            break;
        }
        
        // 부정적인 값 방지
        if (doublesOrWorse < 0) doublesOrWorse = 0;
        
        // 라운드 데이터 생성
        const roundData = {
          user_id: userId,
          course_id: courseId,
          first_course_number: firstCourseNumber,
          second_course_number: secondCourseNumber,
          round_date: formatDate(roundDate),
          round_time: formatTime(roundDate),
          total_score: baseScore,
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
        console.log(`라운드 데이터를 생성합니다: ${formatDate(roundDate)}, 스코어: ${baseScore}`);
        const roundId = db.prepare(`
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
        `).run(
          roundData.user_id, roundData.course_id, roundData.first_course_number, roundData.second_course_number,
          roundData.round_date, roundData.round_time, roundData.total_score, roundData.total_putts,
          roundData.fairways_hit, roundData.fairways_total, roundData.greens_hit, roundData.greens_total,
          roundData.penalties, roundData.birdies, roundData.pars, roundData.bogeys, roundData.doubles_or_worse,
          roundData.green_speed, roundData.player_level, roundData.wind_speed, roundData.concede_distance,
          roundData.mulligan_allowed, roundData.mulligan_used, roundData.weather_condition,
          roundData.temperature, roundData.status
        ).lastInsertRowid;
        
        // 홀 정보 가져오기
        const holes = db.prepare(`
          SELECT * FROM holes
          WHERE course_id = ? AND course_number = ?
          ORDER BY hole_number
        `).all(courseId, firstCourseNumber);
        
        if (holes.length > 0) {
          console.log(`홀별 결과를 생성합니다...`);
          
          // 홀별 결과 생성
          for (const hole of holes) {
            // 랜덤 스코어 생성 (플레이어 레벨에 따라 다르게)
            let score = 0;
            let resultType = 0;
            const par = hole.par;
            
            // 결과 타입 결정
            const resultProbability = Math.random();
            if (playerLevel === 1) { // 투어프로
              if (resultProbability < 0.15) {
                score = par - 1; // 버디
                resultType = 1;
              } else if (resultProbability < 0.7) {
                score = par; // 파
                resultType = 2;
              } else if (resultProbability < 0.95) {
                score = par + 1; // 보기
                resultType = 3;
              } else {
                score = par + 2; // 더블보기 이상
                resultType = 4;
              }
            } else if (playerLevel === 2) { // 프로
              if (resultProbability < 0.1) {
                score = par - 1; // 버디
                resultType = 1;
              } else if (resultProbability < 0.6) {
                score = par; // 파
                resultType = 2;
              } else if (resultProbability < 0.9) {
                score = par + 1; // 보기
                resultType = 3;
              } else {
                score = par + 2; // 더블보기 이상
                resultType = 4;
              }
            } else if (playerLevel === 3) { // 세미프로
              if (resultProbability < 0.05) {
                score = par - 1; // 버디
                resultType = 1;
              } else if (resultProbability < 0.4) {
                score = par; // 파
                resultType = 2;
              } else if (resultProbability < 0.8) {
                score = par + 1; // 보기
                resultType = 3;
              } else {
                score = par + 2; // 더블보기 이상
                resultType = 4;
              }
            } else { // 비기너
              if (resultProbability < 0.02) {
                score = par - 1; // 버디
                resultType = 1;
              } else if (resultProbability < 0.2) {
                score = par; // 파
                resultType = 2;
              } else if (resultProbability < 0.6) {
                score = par + 1; // 보기
                resultType = 3;
              } else {
                score = par + 2; // 더블보기 이상
                resultType = 4;
              }
            }
            
            // 퍼팅 수 결정
            let putts = 0;
            if (score >= par) { // 파 이상
              putts = getRandomInt(1, 3);
            } else { // 버디 이하
              putts = getRandomInt(0, 2);
            }
            
            // 페어웨이 안착 여부 (파3 홀은 제외)
            const fairwayHit = par > 3 ? getRandomBoolean(0.7) : null;
            
            // 그린 적중 여부
            const greenHit = getRandomBoolean(0.6);
            
            // GIR(Green in Regulation) 여부
            // 파3은 1타, 파4는 2타, 파5는 3타 이내에 그린에 올리면 GIR
            const greenInRegulation = greenHit && (score - putts <= par - 2);
            
            // 샌드 세이브 여부 (랜덤)
            const sandSave = getRandomBoolean(0.3);
            
            // 업앤다운 여부 (랜덤)
            const upAndDown = getRandomBoolean(0.4);
            
            // 페널티 여부
            const penalties = getRandomBoolean(0.1) ? 1 : 0;
            
            // 첫 퍼팅 거리
            const puttDistanceFirst = getRandomFloat(0.5, 10.0);
            
            // 홀별 결과 데이터 생성
            const holeData = {
              round_id: roundId,
              course_number: firstCourseNumber,
              hole_number: hole.hole_number,
              par: hole.par,
              score: score,
              putts: putts,
              fairway_hit: fairwayHit ? 1 : 0,
              green_hit: greenHit ? 1 : 0,
              green_in_regulation: greenInRegulation ? 1 : 0,
              sand_save: sandSave ? 1 : 0,
              up_and_down: upAndDown ? 1 : 0,
              penalties: penalties,
              putt_distance_first: puttDistanceFirst,
              result_type: resultType
            };
            
            // 홀별 결과 저장
            db.prepare(`
              INSERT INTO round_holes (
                round_id, course_number, hole_number, par, score,
                putts, fairway_hit, green_hit, green_in_regulation,
                sand_save, up_and_down, penalties, putt_distance_first,
                result_type
              )
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              holeData.round_id, holeData.course_number, holeData.hole_number, holeData.par, holeData.score,
              holeData.putts, holeData.fairway_hit, holeData.green_hit, holeData.green_in_regulation,
              holeData.sand_save, holeData.up_and_down, holeData.penalties, holeData.putt_distance_first,
              holeData.result_type
            );
            
            // 샷 정보 생성
            console.log(`홀 ${hole.hole_number}의 샷 정보를 생성합니다...`);
            const shotCount = score; // 스코어와 동일한 샷 수
            
            // 클럽 목록
            const clubs = ['Driver', '3W', '5W', '3I', '4I', '5I', '6I', '7I', '8I', '9I', 'PW', 'AW', 'SW', 'LW', 'Putter'];
            const clubCategories = {
              'Driver': 'Driver',
              '3W': 'Wood',
              '5W': 'Wood',
              '3I': 'Iron',
              '4I': 'Iron',
              '5I': 'Iron',
              '6I': 'Iron',
              '7I': 'Iron',
              '8I': 'Iron',
              '9I': 'Iron',
              'PW': 'Wedge',
              'AW': 'Wedge',
              'SW': 'Wedge',
              'LW': 'Wedge',
              'Putter': 'Putter'
            };
            
            // 지형 목록
            const terrains = ['티잉그라운드', '페어웨이', '러프', '벙커', '그린', '프린지'];
            
            // 샷 타입 목록
            const shotTypes = ['스트레이트', '슬라이스', '드로우', '페이드', '풀', '푸쉬'];
            
            for (let s = 0; s < shotCount; s++) {
              // 샷 시퀀스
              const shotSequence = s + 1;
              
              // 클럽 선택
              let club = '';
              let clubCategory = '';
              let terrain = '';
              let isPutt = 0;
              
              if (s === 0) { // 첫 샷
                club = par > 3 ? 'Driver' : (par === 3 ? getRandomElement(['7I', '8I', '9I']) : '');
                clubCategory = clubCategories[club];
                terrain = '티잉그라운드';
              } else if (s >= score - putts) { // 퍼팅
                club = 'Putter';
                clubCategory = 'Putter';
                terrain = '그린';
                isPutt = 1;
              } else { // 중간 샷
                if (par > 3 && s === 1) { // 파4 이상의 두 번째 샷
                  club = getRandomElement(['5I', '6I', '7I', '8I', '9I', 'PW']);
                } else {
                  club = getRandomElement(clubs.filter(c => c !== 'Driver' && c !== 'Putter'));
                }
                clubCategory = clubCategories[club];
                terrain = getRandomElement(terrains.filter(t => t !== '티잉그라운드' && (isPutt === 0 ? t !== '그린' : true)));
              }
              
              // 샷 타입
              const shotType = isPutt ? null : getRandomElement(shotTypes);
              
              // 거리 정보
              let distance = 0;
              let carryDistance = 0;
              
              if (club === 'Driver') {
                distance = getRandomInt(220, 280);
                carryDistance = distance - getRandomInt(10, 30);
              } else if (clubCategory === 'Wood') {
                distance = getRandomInt(180, 240);
                carryDistance = distance - getRandomInt(5, 20);
              } else if (clubCategory === 'Iron') {
                const ironNumber = parseInt(club) || 5;
                const baseDistance = 200 - (ironNumber - 3) * 15;
                distance = getRandomInt(baseDistance - 10, baseDistance + 10);
                carryDistance = distance - getRandomInt(2, 10);
              } else if (clubCategory === 'Wedge') {
                distance = getRandomInt(50, 130);
                carryDistance = distance - getRandomInt(1, 5);
              } else if (clubCategory === 'Putter') {
                distance = getRandomFloat(0.5, 12.0, 1);
                carryDistance = distance;
              }
              
              // 볼 스피드 및 기타 데이터
              const clubSpeed = isPutt ? null : getRandomFloat(60, 120);
              const attackAngle = isPutt ? null : getRandomFloat(-5, 5);
              const ballSpeed = isPutt ? null : getRandomFloat(90, 170);
              const smashFactor = isPutt ? null : getRandomFloat(1.2, 1.5);
              const verticalAngle = isPutt ? null : getRandomFloat(5, 20);
              const horizontalAngle = isPutt ? null : getRandomFloat(-10, 10);
              const totalSpin = isPutt ? null : getRandomInt(2000, 5000);
              const sideSpin = isPutt ? null : getRandomInt(-1000, 1000);
              const backSpin = isPutt ? null : getRandomInt(1500, 7000);
              
              // 나머지 거리
              const remainingDistance = s === shotCount - 1 ? 0 : getRandomInt(5, 200);
              
              // 비행 시간
              const hangTime = isPutt ? null : getRandomFloat(1, 6);
              
              // 클럽 패스 및 페이스 앵글
              const clubPath = isPutt ? null : getRandomFloat(-5, 5);
              const faceAngle = isPutt ? null : getRandomFloat(-5, 5);
              
              // 타겟 관련 정보
              const isFairwayShot = terrain === '티잉그라운드' && par > 3;
              const isGreenShot = shotSequence === score - putts;
              const distanceToPinBefore = remainingDistance + getRandomInt(0, 5);
              const distanceToPinAfter = remainingDistance;
              const distanceToTarget = remainingDistance - getRandomInt(-10, 10);
              
              // 정확도 및 퍼짐
              const accuracy = getRandomFloat(50, 100);
              const dispersionLeft = getRandomFloat(0, 5);
              const dispersionRight = getRandomFloat(0, 5);
              
              // 샷 품질
              const shotQuality = getRandomInt(1, 10);
              
              // 샷 시간 (라운드 시간 + 홀별 시간 + 샷별 시간)
              const shotTime = new Date(roundDate);
              shotTime.setMinutes(shotTime.getMinutes() + hole.hole_number * 15 + s * 3);
              
              // 샷 데이터 생성
              const shotData = {
                round_id: roundId,
                user_id: userId,
                course_id: courseId,
                course_number: firstCourseNumber,
                hole_number: hole.hole_number,
                shot_time: shotTime.toISOString(),
                shot_sequence: shotSequence,
                club: club,
                club_category: clubCategory,
                terrain: terrain,
                shot_type: shotType,
                distance: distance,
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
                is_putt: isPutt,
                distance_to_pin_before: distanceToPinBefore,
                distance_to_pin_after: distanceToPinAfter,
                distance_to_target: distanceToTarget,
                accuracy: accuracy,
                dispersion_left: dispersionLeft,
                dispersion_right: dispersionRight,
                shot_quality: shotQuality
              };
              
              // 샷 데이터 저장
              db.prepare(`
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
              `).run(
                shotData.round_id, shotData.user_id, shotData.course_id, shotData.course_number, shotData.hole_number,
                shotData.shot_time, shotData.shot_sequence, shotData.club, shotData.club_category, shotData.terrain,
                shotData.shot_type, shotData.distance, shotData.carry_distance, shotData.club_speed, shotData.attack_angle,
                shotData.ball_speed, shotData.smash_factor, shotData.vertical_angle, shotData.horizontal_angle,
                shotData.total_spin, shotData.side_spin, shotData.back_spin, shotData.remaining_distance,
                shotData.hang_time, shotData.club_path, shotData.face_angle, shotData.is_fairway_shot,
                shotData.is_green_shot, shotData.is_putt, shotData.distance_to_pin_before,
                shotData.distance_to_pin_after, shotData.distance_to_target, shotData.accuracy,
                shotData.dispersion_left, shotData.dispersion_right, shotData.shot_quality
              );
            }
          }
        }
        
        // 동반자 정보 생성 (랜덤으로 다른 사용자 선택)
        const otherUsers = users.filter(u => u.user_id !== userId);
        if (otherUsers.length > 0) {
          const partnerUser = getRandomElement(otherUsers);
          const partnerScore = baseScore + getRandomInt(-5, 5); // 비슷한 수준의 점수
          
          // 매치 결과 (1: 승, 2: 패, 3: 무)
          let matchResult = 3; // 기본값: 무승부
          if (baseScore < partnerScore) {
            matchResult = 1; // 승리
          } else if (baseScore > partnerScore) {
            matchResult = 2; // 패배
          }
          
          // 점수 차이
          const scoreDifference = baseScore - partnerScore;
          
          // 동반자 데이터 생성
          const partnerData = {
            round_id: roundId,
            user_id: userId,
            partner_user_id: partnerUser.user_id,
            partner_name: null, // 등록된 사용자이므로 이름 필요 없음
            total_score: partnerScore,
            match_result: matchResult,
            score_difference: scoreDifference
          };
          
          // 동반자 데이터 저장
          db.prepare(`
            INSERT INTO round_partners (
              round_id, user_id, partner_user_id, partner_name,
              total_score, match_result, score_difference, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `).run(
            partnerData.round_id, partnerData.user_id, partnerData.partner_user_id, partnerData.partner_name,
            partnerData.total_score, partnerData.match_result, partnerData.score_difference
          );
        }
      }
      
      // 사용자의 통계 데이터 재계산
      console.log(`사용자 ID ${userId}의 통계 데이터를 계산합니다...`);
      
      // StatsModel의 calculateAndUpdateUserStats 함수 구현 확인
      try {
        const statsSuccess = db.prepare('SELECT calculateAndUpdateUserStats(?)').get(userId);
        if (!statsSuccess) {
          console.log(`사용자 ID ${userId}의 통계 계산에 실패했습니다.`);
        }
      } catch (err) {
        console.log('통계 함수를 직접 호출할 수 없어 통계 계산을 건너뜁니다.');
        console.log('스크립트 실행 후 API를 통해 통계를 재계산하세요.');
      }
    }
    
    // 트랜잭션 커밋
    db.exec('COMMIT');
    console.log('샘플 데이터 생성이 완료되었습니다!');
    
  } catch (error) {
    // 오류 발생 시 롤백
    db.exec('ROLLBACK');
    console.error('샘플 데이터 생성 중 오류가 발생했습니다:', error);
  } finally {
    // 데이터베이스 연결 종료
    db.close();
    console.log('데이터베이스 연결이 종료되었습니다.');
  }
}

// 스크립트 실행
generateSampleData(); 