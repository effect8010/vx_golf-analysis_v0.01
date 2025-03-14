-- 데이터베이스 스키마 정의

-- 원시 데이터 테이블 -----------------------------------------------------

-- 사용자 정보 테이블
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    handicap DECIMAL(4,1),
    target_handicap DECIMAL(4,1),
    profile_image VARCHAR(255),
    join_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    status TINYINT DEFAULT 1 -- 1: 활성, 0: 비활성
);

-- 골프장 정보 테이블
CREATE TABLE golf_courses (
    course_id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_name VARCHAR(100) NOT NULL,
    resource_name VARCHAR(100),
    course_count TINYINT NOT NULL DEFAULT 1,
    country_code TINYINT NOT NULL, -- 1:한국, 2:일본, 3:중국, 4:미국, 5:유럽, 6:기타, 7:가상
    course_difficulty TINYINT NOT NULL, -- 1-5 (쉬움-어려움)
    green_difficulty TINYINT NOT NULL, -- 1-5 (쉬움-어려움)
    description TEXT,
    course_image VARCHAR(255),
    average_par INTEGER DEFAULT 72,
    release_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 코스 상세 정보 테이블
CREATE TABLE course_details (
    detail_id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    course_number TINYINT NOT NULL, -- 1-8
    course_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (course_id) REFERENCES golf_courses(course_id),
    UNIQUE(course_id, course_number)
);

-- 홀 정보 테이블
CREATE TABLE holes (
    hole_id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    course_number TINYINT NOT NULL,
    hole_number TINYINT NOT NULL, -- 1-9
    par TINYINT NOT NULL,
    hole_type TINYINT NOT NULL,   -- 3, 4, 5 (파3, 파4, 파5)
    back_distance INTEGER,
    champion_distance INTEGER,
    front_distance INTEGER,
    senior_distance INTEGER,
    lady_distance INTEGER,
    hole_index TINYINT,           -- 핸디캡 인덱스 (난이도 순위 1-18)
    hole_image VARCHAR(255),      -- 홀 이미지 경로
    FOREIGN KEY (course_id) REFERENCES golf_courses(course_id),
    UNIQUE(course_id, course_number, hole_number)
);

-- 라운드 정보 테이블
CREATE TABLE rounds (
    round_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    first_course_number TINYINT NOT NULL,
    second_course_number TINYINT,
    round_date DATE NOT NULL,
    round_time TIME NOT NULL,
    total_score INTEGER NOT NULL,
    total_putts INTEGER,
    fairways_hit INTEGER,
    fairways_total INTEGER,       -- 총 페어웨이 수
    greens_hit INTEGER,
    greens_total INTEGER,         -- 총 그린 수
    penalties INTEGER,
    birdies INTEGER DEFAULT 0,    -- 버디 수
    pars INTEGER DEFAULT 0,       -- 파 수
    bogeys INTEGER DEFAULT 0,     -- 보기 수
    doubles_or_worse INTEGER DEFAULT 0, -- 더블보기 이상 수
    -- 라운드 옵션
    green_speed TINYINT, -- 1: 매우빠름, 2: 빠름, 3: 보통, 4: 느림, 5: 매우느림
    player_level TINYINT, -- 1: 투어프로, 2: 프로, 3: 세미프로, 4: 비기너
    wind_speed TINYINT, -- 1: 빠름, 2: 보통, 3: 느림
    concede_distance TINYINT, -- 1-5 (미터)
    mulligan_allowed TINYINT, -- 0-5 (횟수)
    mulligan_used TINYINT DEFAULT 0,
    weather_condition VARCHAR(20), -- 날씨 조건
    temperature INTEGER,          -- 온도
    status TINYINT DEFAULT 1, -- 1: 완료, 0: 미완료
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (course_id) REFERENCES golf_courses(course_id)
);

-- 홀별 라운드 결과 테이블
CREATE TABLE round_holes (
    round_hole_id INTEGER PRIMARY KEY AUTOINCREMENT,
    round_id INTEGER NOT NULL,
    course_number TINYINT NOT NULL,
    hole_number TINYINT NOT NULL,
    par TINYINT NOT NULL,
    score TINYINT NOT NULL,
    putts TINYINT,
    fairway_hit BOOLEAN,
    green_hit BOOLEAN,
    green_in_regulation BOOLEAN,
    sand_save BOOLEAN DEFAULT 0,
    up_and_down BOOLEAN DEFAULT 0,
    penalties TINYINT DEFAULT 0,
    putt_distance_first DECIMAL(5,2),
    result_type TINYINT,         -- 1: 버디 이상, 2: 파, 3: 보기, 4: 더블보기 이상
    FOREIGN KEY (round_id) REFERENCES rounds(round_id),
    UNIQUE(round_id, course_number, hole_number)
);

-- 샷 정보 테이블
CREATE TABLE shots (
    shot_id INTEGER PRIMARY KEY AUTOINCREMENT,
    round_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    course_number TINYINT NOT NULL,
    hole_number TINYINT NOT NULL,
    shot_time DATETIME NOT NULL,
    shot_sequence TINYINT NOT NULL,
    club VARCHAR(20),
    club_category VARCHAR(20),   -- 'Driver', 'Wood', 'Iron', 'Wedge', 'Putter'
    terrain VARCHAR(20), -- 티잉그라운드, 페어웨이, 러프, 벙커, 그린, 프린지
    shot_type VARCHAR(20), -- 스트레이트, 슬라이스, 푸쉬, 드로우 등
    distance INTEGER, -- 비거리 (미터 또는 야드)
    carry_distance INTEGER, -- 비행거리
    
    -- 기술적 데이터
    club_speed DECIMAL(5,2),
    attack_angle DECIMAL(5,2),
    ball_speed DECIMAL(5,2),
    smash_factor DECIMAL(4,2),
    vertical_angle DECIMAL(5,2), -- 발사각 (Vang)
    horizontal_angle DECIMAL(5,2), -- 방향각 (Hang)
    total_spin INTEGER, -- r_spin
    side_spin INTEGER, -- s_spin
    back_spin INTEGER, -- b_spin
    remaining_distance INTEGER, -- 남은 거리
    hang_time DECIMAL(5,2),
    club_path DECIMAL(5,2),
    face_angle DECIMAL(5,2),
    
    -- 추가 필드
    is_fairway_shot BOOLEAN DEFAULT 0, -- 페어웨이 샷 여부
    is_green_shot BOOLEAN DEFAULT 0,   -- 그린을 향한 샷 여부
    is_putt BOOLEAN DEFAULT 0,         -- 퍼팅 여부
    distance_to_pin_before DECIMAL(6,2), -- 샷 전 핀까지 거리
    distance_to_pin_after DECIMAL(6,2),  -- 샷 후 핀까지 거리
    distance_to_target DECIMAL(6,2),     -- 목표 지점까지 거리
    accuracy DECIMAL(5,2),               -- 목표 대비 정확도 (%)
    dispersion_left DECIMAL(5,2),        -- 좌측 편차 (미터)
    dispersion_right DECIMAL(5,2),       -- 우측 편차 (미터)
    shot_quality TINYINT,                -- 1-10 (품질 점수)
    
    FOREIGN KEY (round_id) REFERENCES rounds(round_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (course_id) REFERENCES golf_courses(course_id)
);

-- 사용자 목표 테이블
CREATE TABLE user_goals (
    goal_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    goal_type VARCHAR(30) NOT NULL, -- 'handicap', 'avg_score', 'fairway_hit', 'green_hit', 'driving_distance' 등
    current_value DECIMAL(6,2),
    target_value DECIMAL(6,2) NOT NULL,
    start_date DATE NOT NULL,
    target_date DATE,
    status TINYINT DEFAULT 1, -- 1: 진행중, 2: 달성, 3: 실패, 4: 취소
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 클럽 인벤토리 테이블
CREATE TABLE club_inventory (
    inventory_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    club_type VARCHAR(20) NOT NULL, -- 'Driver', 'Wood', 'Hybrid', 'Iron', 'Wedge', 'Putter'
    club_name VARCHAR(100) NOT NULL,
    brand VARCHAR(50),
    model VARCHAR(50),
    loft DECIMAL(3,1),
    is_active BOOLEAN DEFAULT 1,
    purchase_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 통계 데이터 테이블 -----------------------------------------------------

-- 사용자 종합 통계 테이블
CREATE TABLE user_stats (
    stat_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_rounds INTEGER DEFAULT 0,
    avg_score DECIMAL(5,2),
    best_score INTEGER,
    avg_driving_distance DECIMAL(5,2),
    avg_fairway_hit_rate DECIMAL(5,2), -- 페어웨이 안착률 (%)
    avg_green_hit_rate DECIMAL(5,2),   -- 그린 적중률 (%)
    avg_putts_per_round DECIMAL(4,2),
    par3_avg_score DECIMAL(4,2),
    par4_avg_score DECIMAL(4,2),
    par5_avg_score DECIMAL(4,2),
    birdie_rate DECIMAL(5,2),
    par_rate DECIMAL(5,2),
    bogey_rate DECIMAL(5,2),
    sand_save_rate DECIMAL(5,2),    -- 샌드 세이브 성공률
    up_and_down_rate DECIMAL(5,2),  -- 업앤다운 성공률
    gir_rate DECIMAL(5,2),          -- 그린 인 레귤레이션 비율
    last_updated DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 사용자 클럽별 통계 테이블
CREATE TABLE user_club_stats (
    stat_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    club VARCHAR(20) NOT NULL,
    club_category VARCHAR(20),      -- 클럽 카테고리
    usage_count INTEGER DEFAULT 0,
    avg_distance DECIMAL(6,2),
    avg_carry_distance DECIMAL(6,2),
    avg_accuracy DECIMAL(5,2), -- 정확도(%)
    avg_ball_speed DECIMAL(6,2),
    avg_club_speed DECIMAL(6,2),
    avg_smash_factor DECIMAL(4,2),
    avg_vertical_angle DECIMAL(5,2),
    avg_back_spin INTEGER,
    avg_side_spin INTEGER,
    dispersion_left DECIMAL(5,2), -- 좌측 편차
    dispersion_right DECIMAL(5,2), -- 우측 편차
    shot_quality_avg DECIMAL(4,2),  -- 평균 샷 품질
    last_updated DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    UNIQUE(user_id, club)
);

-- 사용자 퍼팅 통계 테이블
CREATE TABLE user_putting_stats (
    stat_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    distance_range VARCHAR(10) NOT NULL, -- '0-1m', '1-2m', '2-3m', '3-5m', '5m+'
    attempt_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2), -- 성공률(%)
    avg_putts_after_gir DECIMAL(4,2), -- 그린 적중 후 평균 퍼팅
    three_putt_count INTEGER DEFAULT 0,
    last_updated DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    UNIQUE(user_id, distance_range)
);

-- 기간별 성적 추이 테이블
CREATE TABLE user_trend_stats (
    stat_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    period_type VARCHAR(10) NOT NULL, -- 'weekly', 'monthly', 'quarterly'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    rounds_played INTEGER DEFAULT 0,
    avg_score DECIMAL(5,2),
    avg_fairway_hit_rate DECIMAL(5,2),
    avg_green_hit_rate DECIMAL(5,2),
    avg_putts_per_round DECIMAL(4,2),
    avg_driving_distance DECIMAL(6,2),
    handicap_change DECIMAL(4,1),
    last_updated DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    UNIQUE(user_id, period_type, period_start)
);

-- 코스별 사용자 성적 테이블
CREATE TABLE user_course_stats (
    stat_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    rounds_played INTEGER DEFAULT 0,
    best_score INTEGER,
    avg_score DECIMAL(5,2),
    avg_putts DECIMAL(4,2),
    fairway_hit_rate DECIMAL(5,2),
    green_hit_rate DECIMAL(5,2),
    favorite_course BOOLEAN DEFAULT 0, -- 자주 플레이하는 코스 표시
    last_played DATE,
    last_updated DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (course_id) REFERENCES golf_courses(course_id),
    UNIQUE(user_id, course_id)
);

-- 동반자 비교 통계 테이블
CREATE TABLE user_comparison_stats (
    stat_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    opponent_id INTEGER NOT NULL,
    total_rounds INTEGER DEFAULT 0,
    win_count INTEGER DEFAULT 0,
    loss_count INTEGER DEFAULT 0,
    draw_count INTEGER DEFAULT 0,
    avg_score_diff DECIMAL(4,2), -- +는 사용자가 더 높은 점수(나쁨), -는 더 낮은 점수(좋음)
    driving_distance_diff DECIMAL(5,2),
    putting_diff DECIMAL(4,2),
    last_round_date DATE,
    last_updated DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (opponent_id) REFERENCES users(user_id),
    UNIQUE(user_id, opponent_id)
);

-- 홀별 난이도 및 통계 테이블
CREATE TABLE hole_difficulty_stats (
    stat_id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    course_number TINYINT NOT NULL,
    hole_number TINYINT NOT NULL,
    total_plays INTEGER DEFAULT 0,
    avg_score DECIMAL(5,2),
    par_diff DECIMAL(4,2), -- 평균 스코어와 파 차이
    birdie_rate DECIMAL(5,2),
    par_rate DECIMAL(5,2),
    bogey_rate DECIMAL(5,2),
    avg_putts DECIMAL(4,2),
    green_hit_rate DECIMAL(5,2),
    fairway_hit_rate DECIMAL(5,2),
    difficulty_rank TINYINT, -- 코스 내 난이도 순위
    last_updated DATETIME,
    FOREIGN KEY (course_id) REFERENCES golf_courses(course_id),
    UNIQUE(course_id, course_number, hole_number)
);

-- 뷰 생성 -----------------------------------------------------

-- 동반자 조회를 위한 뷰 생성
CREATE VIEW IF NOT EXISTS round_partners_view AS
SELECT 
  r1.round_id,
  r1.user_id AS user_id,
  r2.user_id AS partner_id,
  u.username AS partner_username,
  u.full_name AS partner_name,
  r2.total_score AS partner_score,
  CASE 
    WHEN r1.total_score < r2.total_score THEN 1   -- 승리
    WHEN r1.total_score > r2.total_score THEN -1  -- 패배
    ELSE 0                                        -- 무승부
  END AS match_result,
  ABS(r1.total_score - r2.total_score) AS score_difference
FROM 
  rounds r1
JOIN 
  rounds r2 ON r1.round_id = r2.round_id AND r1.user_id != r2.user_id
JOIN 
  users u ON r2.user_id = u.user_id;

-- 인덱스 생성 -----------------------------------------------------

-- 사용자 관련 인덱스
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- 라운드 관련 인덱스
CREATE INDEX idx_rounds_user_id ON rounds(user_id);
CREATE INDEX idx_rounds_course_id ON rounds(course_id);
CREATE INDEX idx_rounds_date ON rounds(round_date);

-- 샷 관련 인덱스
CREATE INDEX idx_shots_round_id ON shots(round_id);
CREATE INDEX idx_shots_user_id ON shots(user_id);
CREATE INDEX idx_shots_club ON shots(club, club_category);

-- 홀 관련 인덱스
CREATE INDEX idx_round_holes_round_id ON round_holes(round_id);
CREATE INDEX idx_holes_course_id ON holes(course_id, course_number);

-- 통계 관련 인덱스
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX idx_user_club_stats_user_id ON user_club_stats(user_id, club);
CREATE INDEX idx_user_putting_stats_user_id ON user_putting_stats(user_id, distance_range);
CREATE INDEX idx_user_trend_period ON user_trend_stats(user_id, period_type, period_start);
CREATE INDEX idx_user_course_stats ON user_course_stats(user_id, course_id);
CREATE INDEX idx_user_comparison_stats ON user_comparison_stats(user_id, opponent_id);
CREATE INDEX idx_hole_difficulty_stats ON hole_difficulty_stats(course_id, course_number, hole_number);
