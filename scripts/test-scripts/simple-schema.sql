-- 데이터베이스 테이블 스키마 정의

-- 사용자 테이블
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

-- 골프 코스 테이블
CREATE TABLE golf_courses (
    course_id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_name VARCHAR(100) NOT NULL,
    resource_name VARCHAR(100),
    course_count TINYINT NOT NULL DEFAULT 1,
    country_code TINYINT NOT NULL, -- 1:한국, 2:미국, 3:일본, 4:영국, 5: 중국, 6:태국, 7:호주
    course_difficulty TINYINT NOT NULL, -- 1-5 (쉬움-어려움)
    green_difficulty TINYINT NOT NULL, -- 1-5 (쉬움-어려움)
    description TEXT,
    course_image VARCHAR(255),
    average_par INTEGER DEFAULT 72,
    release_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 코스 상세 테이블
CREATE TABLE course_details (
    detail_id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    course_number TINYINT NOT NULL, -- 1-8
    course_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (course_id) REFERENCES golf_courses(course_id),
    UNIQUE(course_id, course_number)
);

-- 홀 테이블
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
    hole_index TINYINT,           -- 핸디캡 산정 순위 (난이도 지수 1-18)
    hole_image VARCHAR(255),      -- 홀 이미지 경로
    FOREIGN KEY (course_id) REFERENCES golf_courses(course_id),
    UNIQUE(course_id, course_number, hole_number)
);

-- 라운드 테이블
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
    fairways_total INTEGER,       -- 전체 페어웨이 수
    greens_hit INTEGER,
    greens_total INTEGER,         -- 전체 그린 수
    penalties INTEGER,
    birdies INTEGER DEFAULT 0,    -- 버디 수
    pars INTEGER DEFAULT 0,       -- 파 수
    bogeys INTEGER DEFAULT 0,     -- 보기 수
    doubles_or_worse INTEGER DEFAULT 0, -- 더블보기 이상 수
    -- 라운드 설정
    green_speed TINYINT, -- 1: 매우빠름, 2: 빠름, 3: 보통, 4: 느림, 5: 매우느림
    player_level TINYINT, -- 1: 투어프로, 2: 프로, 3: 세미프로, 4: 비기너
    wind_speed TINYINT, -- 1: 빠름, 2: 보통, 3: 느림
    concede_distance TINYINT, -- 1-5 (미터)
    mulligan_allowed TINYINT, -- 0-5 (횟수)
    mulligan_used TINYINT DEFAULT 0,
    weather_condition VARCHAR(20), -- 날씨 상태
    temperature INTEGER,           -- 기온
    status TINYINT DEFAULT 1, -- 1: 완료, 0:  미완료
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
    result_type TINYINT,          -- 1: 버디 이하, 2: 파, 3: 보기, 4: 더블보기 이상
    FOREIGN KEY (round_id) REFERENCES rounds(round_id),
    UNIQUE(round_id, course_number, hole_number)
); 