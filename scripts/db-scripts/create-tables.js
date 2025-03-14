/**
 * 필요한 테이블을 생성하는 스크립트
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 데이터베이스 경로
const DB_PATH = path.resolve(__dirname, './data/golf_simulator.db');
console.log('데이터베이스 경로:', DB_PATH);

// 데이터베이스 연결
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('데이터베이스 연결 오류:', err.message);
    process.exit(1);
  }
  console.log('데이터베이스에 연결되었습니다.');
});

// shots 테이블 생성
const createShotsTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS shots (
      shot_id INTEGER PRIMARY KEY AUTOINCREMENT,
      round_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      course_number TINYINT NOT NULL,
      hole_number TINYINT NOT NULL,
      shot_time DATETIME NOT NULL,
      shot_sequence TINYINT NOT NULL,
      club VARCHAR(20),
      club_category VARCHAR(20),
      terrain VARCHAR(20),
      shot_type VARCHAR(20),
      distance INTEGER,
      carry_distance INTEGER,
      club_speed DECIMAL(5,2),
      attack_angle DECIMAL(5,2),
      ball_speed DECIMAL(5,2),
      smash_factor DECIMAL(4,2),
      vertical_angle DECIMAL(5,2),
      horizontal_angle DECIMAL(5,2),
      total_spin INTEGER,
      side_spin INTEGER,
      back_spin INTEGER,
      remaining_distance INTEGER,
      hang_time DECIMAL(5,2),
      club_path DECIMAL(5,2),
      face_angle DECIMAL(5,2),
      is_fairway_shot BOOLEAN DEFAULT 0,
      is_green_shot BOOLEAN DEFAULT 0,
      is_putt BOOLEAN DEFAULT 0,
      distance_to_pin_before DECIMAL(6,2),
      distance_to_pin_after DECIMAL(6,2),
      distance_to_target DECIMAL(6,2),
      accuracy DECIMAL(5,2),
      dispersion_left DECIMAL(5,2),
      dispersion_right DECIMAL(5,2),
      shot_quality TINYINT,
      FOREIGN KEY (round_id) REFERENCES rounds(round_id),
      FOREIGN KEY (user_id) REFERENCES users(user_id),
      FOREIGN KEY (course_id) REFERENCES golf_courses(course_id)
    )
  `;
  
  db.run(sql, (err) => {
    if (err) {
      console.error('shots 테이블 생성 오류:', err.message);
    } else {
      console.log('shots 테이블이 생성되었습니다.');
    }
    
    // round_partners 테이블 생성
    createRoundPartnersTable();
  });
};

// round_partners 테이블 생성
const createRoundPartnersTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS round_partners (
      partner_id INTEGER PRIMARY KEY AUTOINCREMENT,
      round_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      partner_user_id INTEGER,
      partner_name VARCHAR(100),
      total_score INTEGER,
      match_result TINYINT,
      score_difference INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (round_id) REFERENCES rounds(round_id),
      FOREIGN KEY (user_id) REFERENCES users(user_id),
      FOREIGN KEY (partner_user_id) REFERENCES users(user_id)
    )
  `;
  
  db.run(sql, (err) => {
    if (err) {
      console.error('round_partners 테이블 생성 오류:', err.message);
    } else {
      console.log('round_partners 테이블이 생성되었습니다.');
    }
    
    // 데이터베이스 연결 종료
    db.close();
  });
};

// 스크립트 실행
createShotsTable(); 