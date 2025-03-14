/**
 * 골프 시뮬레이터 앱 데이터베이스 초기화 스크립트
 * 
 * 이 스크립트는 프로젝트의 초기 설정을 위해 데이터베이스를 생성하고 테스트 데이터를 추가합니다.
 */

// 환경변수 설정 (개발 환경으로 설정)
process.env.NODE_ENV = 'development';
process.env.ADD_TEST_DATA = 'true';

const path = require('path');
const fs = require('fs');
const { db } = require('../server/models');

console.log('데이터베이스 초기화를 시작합니다...');

// 데이터베이스 파일 경로
const dbPath = path.join(__dirname, '..', 'data', 'golf_simulator.db');

// 기존 데이터베이스 파일 확인 및 백업
if (fs.existsSync(dbPath)) {
  const backupPath = `${dbPath}.backup.${new Date().toISOString().replace(/:/g, '-')}`;
  console.log(`기존 데이터베이스 파일을 백업합니다: ${backupPath}`);
  fs.copyFileSync(dbPath, backupPath);
  fs.unlinkSync(dbPath);
  console.log('기존 데이터베이스 파일이 삭제되었습니다.');
}

// 스키마 파일 읽기
const schemaPath = path.join(__dirname, '..', 'server', 'models', 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

try {
  // 스키마 적용
  console.log('스키마를 적용 중입니다...');
  db.exec(schema);
  console.log('스키마가 성공적으로 적용되었습니다.');
  
  // 테스트 데이터 추가
  console.log('테스트 데이터를 추가합니다...');
  
  // 1. 테스트 사용자 추가
  console.log('테스트 사용자를 추가합니다...');
  const userIds = [];
  
  // 관리자 계정
  userIds.push(db.prepare(`
    INSERT INTO users (username, password_hash, full_name, email, handicap, status, join_date)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(
    'admin',
    '$2a$10$KgmxjhfndFZf8MJ/LVHBS.IUcAqPUNBV8u4hXnBTcjQC2lHYmQh3G', // password: admin123
    '관리자',
    'admin@golf-simulator.com',
    0,
    1
  ).lastInsertRowid);
  
  // 일반 사용자
  userIds.push(db.prepare(`
    INSERT INTO users (username, password_hash, full_name, email, handicap, status, join_date)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(
    'tester1',
    '$2a$10$X8jV1JzX5ZGbLXXzYXZVJ.5qZK.kfMJHT3blCT.G4mPZ/L4cJXk1e', // password: test123
    '테스터1',
    'tester1@example.com',
    12.5,
    1
  ).lastInsertRowid);
  
  userIds.push(db.prepare(`
    INSERT INTO users (username, password_hash, full_name, email, handicap, status, join_date)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(
    'tester2',
    '$2a$10$X8jV1JzX5ZGbLXXzYXZVJ.5qZK.kfMJHT3blCT.G4mPZ/L4cJXk1e', // password: test123
    '테스터2',
    'tester2@example.com',
    18.2,
    1
  ).lastInsertRowid);
  
  console.log(`테스트 사용자 3명이 추가되었습니다. IDs: ${userIds.join(', ')}`);
  
  // 2. 테스트 골프 코스 추가
  console.log('테스트 골프 코스를 추가합니다...');
  const courseIds = [];
  
  // 첫 번째 코스
  courseIds.push(db.prepare(`
    INSERT INTO golf_courses (
      course_name, resource_name, course_count, country_code,
      course_difficulty, green_difficulty, description, average_par, release_date, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(
    '송도 CC',
    'songdo_cc',
    2,
    1, // 한국
    3, // 중간 난이도
    3, // 중간 난이도
    '인천 송도에 위치한 골프 코스입니다. 넓은 페어웨이와 도전적인 그린을 갖추고 있습니다.',
    72,
    '2023-01-01'
  ).lastInsertRowid);
  
  // 두 번째 코스
  courseIds.push(db.prepare(`
    INSERT INTO golf_courses (
      course_name, resource_name, course_count, country_code,
      course_difficulty, green_difficulty, description, average_par, release_date, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(
    '제주 오션 CC',
    'jeju_ocean_cc',
    2,
    1, // 한국
    4, // 높은 난이도
    4, // 높은 난이도
    '제주도 해안가에 위치한 바다 전망의 골프 코스입니다. 바람이 강한 편이며 전략적인 플레이가 필요합니다.',
    72,
    '2023-02-15'
  ).lastInsertRowid);
  
  console.log(`테스트 골프 코스 2개가 추가되었습니다. IDs: ${courseIds.join(', ')}`);
  
  // 3. 코스 상세 정보 추가
  console.log('코스 상세 정보를 추가합니다...');
  
  // 송도 CC
  db.prepare(`
    INSERT INTO course_details (course_id, course_number, course_name)
    VALUES (?, ?, ?)
  `).run(courseIds[0], 1, '동코스');
  
  db.prepare(`
    INSERT INTO course_details (course_id, course_number, course_name)
    VALUES (?, ?, ?)
  `).run(courseIds[0], 2, '서코스');
  
  // 제주 오션 CC
  db.prepare(`
    INSERT INTO course_details (course_id, course_number, course_name)
    VALUES (?, ?, ?)
  `).run(courseIds[1], 1, '바다코스');
  
  db.prepare(`
    INSERT INTO course_details (course_id, course_number, course_name)
    VALUES (?, ?, ?)
  `).run(courseIds[1], 2, '산코스');
  
  console.log('코스 상세 정보가 추가되었습니다.');
  
  // 4. 홀 정보 추가 (예시: 각 코스마다 첫 번째 코스의 첫 3개 홀만 추가)
  console.log('홀 정보를 추가합니다...');
  
  // 송도 CC - 동코스 홀 정보
  for (let i = 1; i <= 9; i++) {
    const par = i % 3 === 0 ? 5 : (i % 3 === 1 ? 4 : 3);
    const holeType = par;
    
    db.prepare(`
      INSERT INTO holes (
        course_id, course_number, hole_number, par, hole_type,
        back_distance, champion_distance, front_distance,
        senior_distance, lady_distance, hole_index
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      courseIds[0], 1, i, par, holeType,
      par === 3 ? 180 + i * 5 : (par === 4 ? 380 + i * 10 : 520 + i * 15),
      par === 3 ? 170 + i * 5 : (par === 4 ? 360 + i * 10 : 500 + i * 15),
      par === 3 ? 160 + i * 5 : (par === 4 ? 340 + i * 10 : 480 + i * 15),
      par === 3 ? 150 + i * 5 : (par === 4 ? 320 + i * 10 : 460 + i * 15),
      par === 3 ? 140 + i * 5 : (par === 4 ? 300 + i * 10 : 440 + i * 15),
      10 - i
    );
  }
  
  // 송도 CC - 서코스 홀 정보
  for (let i = 1; i <= 9; i++) {
    const par = i % 3 === 1 ? 5 : (i % 3 === 2 ? 4 : 3);
    const holeType = par;
    
    db.prepare(`
      INSERT INTO holes (
        course_id, course_number, hole_number, par, hole_type,
        back_distance, champion_distance, front_distance,
        senior_distance, lady_distance, hole_index
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      courseIds[0], 2, i, par, holeType,
      par === 3 ? 190 + i * 5 : (par === 4 ? 390 + i * 10 : 530 + i * 15),
      par === 3 ? 180 + i * 5 : (par === 4 ? 370 + i * 10 : 510 + i * 15),
      par === 3 ? 170 + i * 5 : (par === 4 ? 350 + i * 10 : 490 + i * 15),
      par === 3 ? 160 + i * 5 : (par === 4 ? 330 + i * 10 : 470 + i * 15),
      par === 3 ? 150 + i * 5 : (par === 4 ? 310 + i * 10 : 450 + i * 15),
      i
    );
  }
  
  // 제주 오션 CC - 바다코스 홀 정보 (첫 3개 홀)
  for (let i = 1; i <= 9; i++) {
    const par = i % 3 === 2 ? 5 : (i % 3 === 0 ? 4 : 3);
    const holeType = par;
    
    db.prepare(`
      INSERT INTO holes (
        course_id, course_number, hole_number, par, hole_type,
        back_distance, champion_distance, front_distance,
        senior_distance, lady_distance, hole_index
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      courseIds[1], 1, i, par, holeType,
      par === 3 ? 200 + i * 5 : (par === 4 ? 400 + i * 10 : 540 + i * 15),
      par === 3 ? 190 + i * 5 : (par === 4 ? 380 + i * 10 : 520 + i * 15),
      par === 3 ? 180 + i * 5 : (par === 4 ? 360 + i * 10 : 500 + i * 15),
      par === 3 ? 170 + i * 5 : (par === 4 ? 340 + i * 10 : 480 + i * 15),
      par === 3 ? 160 + i * 5 : (par === 4 ? 320 + i * 10 : 460 + i * 15),
      i + 2
    );
  }
  
  console.log('홀 정보가 추가되었습니다.');
  
  // 5. 테스트 라운드 데이터 추가
  console.log('테스트 라운드 데이터를 추가합니다...');
  
  // 첫 번째 사용자의 라운드
  const roundId1 = db.prepare(`
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
    userIds[1], courseIds[0], 1, 2,
    '2023-05-15', '13:00:00', 89, 32,
    8, 14, 9, 18,
    3, 2, 6, 8, 2,
    3, 3, 2, 2,
    2, 1, '맑음',
    24, 1
  ).lastInsertRowid;
  
  // 두 번째 사용자의 라운드
  const roundId2 = db.prepare(`
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
    userIds[2], courseIds[0], 1, 2,
    '2023-05-15', '13:00:00', 92, 34,
    7, 14, 8, 18,
    4, 1, 5, 9, 3,
    3, 3, 2, 2,
    2, 2, '맑음',
    24, 1
  ).lastInsertRowid;
  
  console.log(`테스트 라운드 데이터 2개가 추가되었습니다. IDs: ${roundId1}, ${roundId2}`);
  
  // 6. 라운드 홀별 결과 추가
  console.log('라운드 홀별 결과를 추가합니다...');
  
  // 첫 번째 라운드의 홀별 결과 (동코스 전체)
  for (let i = 1; i <= 9; i++) {
    const par = i % 3 === 0 ? 5 : (i % 3 === 1 ? 4 : 3);
    const score = par + (Math.random() > 0.7 ? 1 : 0);
    const putts = 1 + Math.floor(Math.random() * 2);
    
    db.prepare(`
      INSERT INTO round_holes (
        round_id, course_number, hole_number, par, score,
        putts, fairway_hit, green_hit, green_in_regulation,
        sand_save, up_and_down, penalties, putt_distance_first,
        result_type
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      roundId1, 1, i, par, score,
      putts, Math.random() > 0.4, Math.random() > 0.4, Math.random() > 0.6,
      Math.random() > 0.7, Math.random() > 0.6, Math.random() > 0.8 ? 0 : 1,
      Math.random() * 5,
      score < par ? 1 : (score === par ? 2 : (score === par + 1 ? 3 : 4))
    );
  }
  
  // 두 번째 라운드의 홀별 결과 (동코스 전체)
  for (let i = 1; i <= 9; i++) {
    const par = i % 3 === 0 ? 5 : (i % 3 === 1 ? 4 : 3);
    const score = par + (Math.random() > 0.6 ? 1 : 0);
    const putts = 1 + Math.floor(Math.random() * 2);
    
    db.prepare(`
      INSERT INTO round_holes (
        round_id, course_number, hole_number, par, score,
        putts, fairway_hit, green_hit, green_in_regulation,
        sand_save, up_and_down, penalties, putt_distance_first,
        result_type
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      roundId2, 1, i, par, score,
      putts, Math.random() > 0.5, Math.random() > 0.5, Math.random() > 0.7,
      Math.random() > 0.8, Math.random() > 0.7, Math.random() > 0.8 ? 0 : 1,
      Math.random() * 5,
      score < par ? 1 : (score === par ? 2 : (score === par + 1 ? 3 : 4))
    );
  }
  
  console.log('라운드 홀별 결과가 추가되었습니다.');
  
  // 7. 라운드 파트너 정보 추가
  console.log('라운드 파트너 정보를 추가합니다...');
  
  // 첫 번째 라운드의 파트너 (두 번째 사용자)
  db.prepare(`
    INSERT INTO round_partners (
      round_id, user_id, partner_user_id, partner_name,
      total_score, match_result, score_difference, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(
    roundId1, userIds[1], userIds[2], null,
    92, 1, 3,
  );
  
  // 두 번째 라운드의 파트너 (첫 번째 사용자)
  db.prepare(`
    INSERT INTO round_partners (
      round_id, user_id, partner_user_id, partner_name,
      total_score, match_result, score_difference, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(
    roundId2, userIds[2], userIds[1], null,
    89, 2, -3,
  );
  
  console.log('라운드 파트너 정보가 추가되었습니다.');
  
  // 8. 샷 정보 추가 (간단한 예시)
  console.log('샷 정보를 추가합니다...');
  
  // 첫 번째 라운드의 첫 번째 홀 샷 정보
  const clubs = ['Driver', '5I', 'PW', 'Putter'];
  const clubCategories = ['Driver', 'Iron', 'Wedge', 'Putter'];
  const terrains = ['티잉그라운드', '페어웨이', '어프로치', '그린'];
  
  for (let i = 0; i < 4; i++) {
    const isPutt = i === 3;
    const remainingDistance = isPutt ? 0 : [230, 150, 30][i];
    
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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      roundId1, userIds[1], courseIds[0], 1, 1,
      `2023-05-15 ${13 + Math.floor(i/2)}:${(i % 2) * 30}:00`, i + 1, clubs[i], clubCategories[i], terrains[i],
      isPutt ? null : 'straight', isPutt ? 2 : [240, 120, 25][i], isPutt ? 2 : [230, 115, 24][i],
      isPutt ? null : 100 - i * 20, isPutt ? null : i - 1,
      isPutt ? null : 150 - i * 20, isPutt ? null : 1.48,
      isPutt ? null : 12 - i, isPutt ? null : i - 2,
      isPutt ? null : 3000 - i * 500, isPutt ? null : i * 200, isPutt ? null : 3000 - i * 400,
      remainingDistance, isPutt ? null : 5 - i * 0.5, isPutt ? null : i - 1.5, isPutt ? null : i - 2,
      i === 1, i === 2, isPutt, remainingDistance + 2, remainingDistance,
      remainingDistance, 90 - i * 10, i * 0.5, i * 0.6, 8 - i
    );
  }
  
  console.log('샷 정보가 추가되었습니다.');
  
  // 9. 통계 데이터 생성
  console.log('사용자 통계 데이터를 생성합니다...');
  
  // 사용자 종합 통계
  for (let userId of [userIds[1], userIds[2]]) {
    db.prepare(`
      INSERT INTO user_stats (
        user_id, total_rounds, avg_score, best_score,
        avg_driving_distance, avg_fairway_hit_rate, avg_green_hit_rate,
        avg_putts_per_round, par3_avg_score, par4_avg_score, par5_avg_score,
        birdie_rate, par_rate, bogey_rate, sand_save_rate,
        up_and_down_rate, gir_rate, last_updated
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      userId, 1, userId === userIds[1] ? 89 : 92, userId === userIds[1] ? 89 : 92,
      260, 57.14, 50, 32, 3.2, 4.5, 5.2,
      11.11, 33.33, 44.44, 20, 30, 40
    );
  }
  
  // 클럽별 통계 (Driver 예시)
  for (let userId of [userIds[1], userIds[2]]) {
    db.prepare(`
      INSERT INTO user_club_stats (
        user_id, club, club_category, usage_count, avg_distance,
        avg_carry_distance, avg_accuracy, avg_ball_speed,
        avg_club_speed, avg_smash_factor, avg_vertical_angle,
        avg_back_spin, avg_side_spin, dispersion_left,
        dispersion_right, shot_quality_avg, last_updated
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      userId, 'Driver', 'Driver', 10, 260, 250, 60,
      150, 100, 1.48, 12, 2600, 200, 0.5, 0.6, 7.5
    );
  }
  
  // 퍼팅 통계
  for (let userId of [userIds[1], userIds[2]]) {
    const distanceRanges = ['0-1m', '1-2m', '2-3m', '3-5m', '5m+'];
    const successRates = [95, 80, 60, 40, 20];
    
    for (let i = 0; i < distanceRanges.length; i++) {
      db.prepare(`
        INSERT INTO user_putting_stats (
          user_id, distance_range, attempt_count, success_count,
          success_rate, avg_putts_after_gir, three_putt_count,
          last_updated
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(
        userId, distanceRanges[i], 20, Math.round(20 * successRates[i] / 100),
        successRates[i], i < 3 ? 1.2 + i * 0.2 : 1.8, i > 2 ? i - 2 : 0
      );
    }
  }
  
  console.log('사용자 통계 데이터가 생성되었습니다.');
  
  console.log('데이터베이스 초기화가 완료되었습니다!');
  
} catch (error) {
  console.error('데이터베이스 초기화 중 오류가 발생했습니다:', error);
} finally {
  // 데이터베이스 연결 종료
  db.close();
  console.log('데이터베이스 연결이 종료되었습니다.');
} 