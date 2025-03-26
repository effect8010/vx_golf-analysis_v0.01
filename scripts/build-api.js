/**
 * 정적 API 생성 스크립트
 * 
 * 골프 시뮬레이터 데이터를 정적 JSON API 형태로 변환하는 스크립트입니다.
 * 빌드 시점에 실행되어 RESTful API 구조의 JSON 파일을 생성합니다.
 */

const fs = require('fs');
const path = require('path');

// 경로 설정
const DATA_DIR = path.join(__dirname, '../public/data');
const API_DIR = path.join(__dirname, '../public/api/v1');

// 데이터 소스 경로
const ROUNDS_DIR = path.join(DATA_DIR, 'rounds');
const USERS_DIR = path.join(DATA_DIR, 'users');
const COURSES_DIR = path.join(DATA_DIR, 'courses');
const STATISTICS_DIR = path.join(DATA_DIR, 'statistics');

// API 디렉토리 생성
function ensureApiDirectoriesExist() {
  const directories = [
    API_DIR,
    path.join(API_DIR, 'rounds'),
    path.join(API_DIR, 'users'),
    path.join(API_DIR, 'courses'),
    path.join(API_DIR, 'statistics')
  ];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`API 디렉토리 생성: ${dir}`);
    }
  });
}

// 사용자 API 생성
function buildUsersApi() {
  // 사용자 목록 생성
  const userFiles = fs.readdirSync(USERS_DIR)
    .filter(file => file.endsWith('.json'));
  
  const users = userFiles.map(file => {
    const filePath = path.join(USERS_DIR, file);
    const userData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    // 민감한 정보 제외
    return {
      id: userData.id,
      name: userData.name,
      handicap: userData.handicap,
      joined: userData.joined
    };
  });
  
  // 사용자 목록 API 저장
  const usersListPath = path.join(API_DIR, 'users', 'index.json');
  fs.writeFileSync(usersListPath, JSON.stringify({
    users,
    count: users.length,
    timestamp: new Date().toISOString()
  }, null, 2));
  console.log(`사용자 목록 API 생성: ${usersListPath}`);
  
  // 개별 사용자 API 생성
  users.forEach(user => {
    // 기본 사용자 정보 불러오기
    const userDataPath = path.join(USERS_DIR, `${user.id}.json`);
    const userData = JSON.parse(fs.readFileSync(userDataPath, 'utf8'));
    
    // 사용자 통계 정보 불러오기
    const userStatsPath = path.join(STATISTICS_DIR, `${user.id}.json`);
    let userStats = {};
    if (fs.existsSync(userStatsPath)) {
      userStats = JSON.parse(fs.readFileSync(userStatsPath, 'utf8'));
    }
    
    // 사용자 라운드 목록 불러오기
    const userRoundsDir = path.join(ROUNDS_DIR, user.id);
    let rounds = [];
    if (fs.existsSync(userRoundsDir)) {
      const roundFiles = fs.readdirSync(userRoundsDir)
        .filter(file => file.endsWith('.json'));
      
      rounds = roundFiles.map(file => {
        const roundPath = path.join(userRoundsDir, file);
        const roundData = JSON.parse(fs.readFileSync(roundPath, 'utf8'));
        // 요약 정보만 포함
        return {
          id: roundData.id,
          date: roundData.date,
          courseId: roundData.courseId,
          totalScore: roundData.totalScore,
          weather: roundData.weather
        };
      });
    }
    
    // 사용자 API 저장
    const userApiPath = path.join(API_DIR, 'users', `${user.id}.json`);
    fs.writeFileSync(userApiPath, JSON.stringify({
      ...userData,
      statistics: userStats,
      rounds,
      timestamp: new Date().toISOString()
    }, null, 2));
    console.log(`사용자 상세 API 생성: ${userApiPath}`);
  });
}

// 라운드 API 생성
function buildRoundsApi() {
  // 전체 라운드 목록
  let allRounds = [];
  
  // 사용자별 라운드 데이터 처리
  const userDirs = fs.readdirSync(ROUNDS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  userDirs.forEach(userId => {
    const userRoundsDir = path.join(ROUNDS_DIR, userId);
    const roundFiles = fs.readdirSync(userRoundsDir)
      .filter(file => file.endsWith('.json'));
    
    roundFiles.forEach(file => {
      const roundPath = path.join(userRoundsDir, file);
      const roundData = JSON.parse(fs.readFileSync(roundPath, 'utf8'));
      
      // 라운드 요약 정보 추출
      const roundSummary = {
        id: roundData.id,
        userId: roundData.userId,
        courseId: roundData.courseId,
        date: roundData.date,
        totalScore: roundData.totalScore,
        weather: roundData.weather
      };
      
      allRounds.push(roundSummary);
      
      // 개별 라운드 API 생성
      const roundApiPath = path.join(API_DIR, 'rounds', `${roundData.id}.json`);
      fs.writeFileSync(roundApiPath, JSON.stringify({
        ...roundData,
        timestamp: new Date().toISOString()
      }, null, 2));
      console.log(`라운드 상세 API 생성: ${roundApiPath}`);
    });
  });
  
  // 최근 날짜순 정렬
  allRounds.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // 라운드 목록 API 저장
  const roundsListPath = path.join(API_DIR, 'rounds', 'index.json');
  fs.writeFileSync(roundsListPath, JSON.stringify({
    rounds: allRounds,
    count: allRounds.length,
    timestamp: new Date().toISOString()
  }, null, 2));
  console.log(`라운드 목록 API 생성: ${roundsListPath}`);
}

// 코스 API 생성
function buildCoursesApi() {
  // 코스 목록 생성
  const courseFiles = fs.readdirSync(COURSES_DIR)
    .filter(file => file.endsWith('.json'));
  
  const courses = courseFiles.map(file => {
    const filePath = path.join(COURSES_DIR, file);
    const courseData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    // 요약 정보만 포함
    return {
      id: courseData.id,
      name: courseData.name,
      location: courseData.location
    };
  });
  
  // 코스 목록 API 저장
  const coursesListPath = path.join(API_DIR, 'courses', 'index.json');
  fs.writeFileSync(coursesListPath, JSON.stringify({
    courses,
    count: courses.length,
    timestamp: new Date().toISOString()
  }, null, 2));
  console.log(`코스 목록 API 생성: ${coursesListPath}`);
  
  // 개별 코스 API 생성
  courseFiles.forEach(file => {
    const courseId = file.replace('.json', '');
    const coursePath = path.join(COURSES_DIR, file);
    const courseData = JSON.parse(fs.readFileSync(coursePath, 'utf8'));
    
    // 코스 API 저장
    const courseApiPath = path.join(API_DIR, 'courses', `${courseId}.json`);
    fs.writeFileSync(courseApiPath, JSON.stringify({
      ...courseData,
      timestamp: new Date().toISOString()
    }, null, 2));
    console.log(`코스 상세 API 생성: ${courseApiPath}`);
  });
}

// 통계 API 생성
function buildStatisticsApi() {
  // 전체 통계 요약
  const statsFiles = fs.readdirSync(STATISTICS_DIR)
    .filter(file => file.endsWith('.json'));
  
  const allStats = [];
  
  statsFiles.forEach(file => {
    const userId = file.replace('.json', '');
    const statsPath = path.join(STATISTICS_DIR, file);
    const statsData = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
    
    // 사용자 정보 가져오기
    const userPath = path.join(USERS_DIR, `${userId}.json`);
    let userName = userId;
    if (fs.existsSync(userPath)) {
      const userData = JSON.parse(fs.readFileSync(userPath, 'utf8'));
      userName = userData.name;
    }
    
    // 요약 통계 정보
    const statsSummary = {
      userId: statsData.userId,
      userName,
      roundsPlayed: statsData.roundsPlayed,
      avgScore: statsData.avgScore,
      bestScore: statsData.bestScore
    };
    
    allStats.push(statsSummary);
    
    // 개별 통계 API 생성
    const statsApiPath = path.join(API_DIR, 'statistics', `${userId}.json`);
    fs.writeFileSync(statsApiPath, JSON.stringify({
      ...statsData,
      timestamp: new Date().toISOString()
    }, null, 2));
    console.log(`통계 상세 API 생성: ${statsApiPath}`);
  });
  
  // 통계 요약 API 저장
  const statsListPath = path.join(API_DIR, 'statistics', 'index.json');
  fs.writeFileSync(statsListPath, JSON.stringify({
    statistics: allStats,
    count: allStats.length,
    timestamp: new Date().toISOString()
  }, null, 2));
  console.log(`통계 목록 API 생성: ${statsListPath}`);
}

// API 인덱스 생성
function buildApiIndex() {
  const apiIndex = {
    api: "골프 시뮬레이터 분석 API",
    version: "v1",
    endpoints: [
      {
        path: "/users",
        description: "사용자 목록 및 상세 정보"
      },
      {
        path: "/rounds",
        description: "라운드 데이터 목록 및 상세 정보"
      },
      {
        path: "/courses",
        description: "골프 코스 목록 및 상세 정보"
      },
      {
        path: "/statistics",
        description: "사용자별 통계 정보"
      }
    ],
    generated: new Date().toISOString()
  };
  
  const indexPath = path.join(API_DIR, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(apiIndex, null, 2));
  console.log(`API 인덱스 생성: ${indexPath}`);
}

// 메인 함수
function main() {
  try {
    console.log('정적 API 생성 시작...');
    ensureApiDirectoriesExist();
    buildUsersApi();
    buildRoundsApi();
    buildCoursesApi();
    buildStatisticsApi();
    buildApiIndex();
    console.log('정적 API 생성 완료!');
  } catch (error) {
    console.error('API 생성 오류:', error);
    process.exit(1);
  }
}

// 스크립트 실행
main();