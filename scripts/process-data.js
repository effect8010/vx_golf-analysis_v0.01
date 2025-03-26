/**
 * 골프 시뮬레이터 데이터 처리 스크립트
 * 
 * 골프 라운드 데이터를 처리하여 다양한 통계 데이터를 생성하는 스크립트입니다.
 * 빌드 시점에 실행되어 정적 JSON 파일로 결과를 저장합니다.
 */

const fs = require('fs');
const path = require('path');

// 경로 설정
const DATA_DIR = path.join(__dirname, '../public/data');
const ROUNDS_DIR = path.join(DATA_DIR, 'rounds');
const USERS_DIR = path.join(DATA_DIR, 'users');
const COURSES_DIR = path.join(DATA_DIR, 'courses');
const STATISTICS_DIR = path.join(DATA_DIR, 'statistics');

// 디렉토리 생성
function ensureDirectoriesExist() {
  [DATA_DIR, ROUNDS_DIR, USERS_DIR, COURSES_DIR, STATISTICS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`디렉토리 생성: ${dir}`);
    }
  });
}

// 샘플 데이터 생성 (실제 프로젝트에서는 외부 소스에서 데이터를 가져올 수 있음)
function generateSampleData() {
  // 코스 데이터 생성
  const courses = [
    {
      id: 'course1',
      name: '샘플 골프 코스',
      location: '서울',
      holes: Array.from({ length: 18 }, (_, i) => ({
        holeNumber: i + 1,
        par: i % 3 === 0 ? 5 : (i % 3 === 1 ? 4 : 3),
        distance: 150 + (i * 30),
        difficulty: i % 5 + 1
      }))
    }
  ];
  
  // 사용자 데이터 생성
  const users = [
    {
      id: 'user1',
      name: '골프왕',
      handicap: 12.5,
      joined: '2023-01-15'
    },
    {
      id: 'user2',
      name: '아이언맨',
      handicap: 8.2,
      joined: '2023-02-20'
    }
  ];
  
  // 라운드 데이터 생성
  const rounds = [
    {
      id: 'round1',
      userId: 'user1',
      courseId: 'course1',
      date: '2023-03-10',
      weather: '맑음',
      temperature: 22,
      totalScore: 82,
      holes: Array.from({ length: 18 }, (_, i) => ({
        holeNumber: i + 1,
        score: (i % 3 === 0 ? 5 : (i % 3 === 1 ? 4 : 3)) + Math.floor(Math.random() * 3),
        putts: 1 + Math.floor(Math.random() * 2),
        fairwayHit: Math.random() > 0.3,
        greenHit: Math.random() > 0.4,
        distance: 220 + Math.floor(Math.random() * 30)
      }))
    },
    {
      id: 'round2',
      userId: 'user1',
      courseId: 'course1',
      date: '2023-03-15',
      weather: '흐림',
      temperature: 18,
      totalScore: 79,
      holes: Array.from({ length: 18 }, (_, i) => ({
        holeNumber: i + 1,
        score: (i % 3 === 0 ? 5 : (i % 3 === 1 ? 4 : 3)) + Math.floor(Math.random() * 3),
        putts: 1 + Math.floor(Math.random() * 2),
        fairwayHit: Math.random() > 0.3,
        greenHit: Math.random() > 0.4,
        distance: 220 + Math.floor(Math.random() * 30)
      }))
    },
    {
      id: 'round3',
      userId: 'user2',
      courseId: 'course1',
      date: '2023-03-12',
      weather: '맑음',
      temperature: 20,
      totalScore: 75,
      holes: Array.from({ length: 18 }, (_, i) => ({
        holeNumber: i + 1,
        score: (i % 3 === 0 ? 5 : (i % 3 === 1 ? 4 : 3)) + Math.floor(Math.random() * 2),
        putts: 1 + Math.floor(Math.random() * 2),
        fairwayHit: Math.random() > 0.2,
        greenHit: Math.random() > 0.3,
        distance: 240 + Math.floor(Math.random() * 30)
      }))
    }
  ];
  
  // 데이터 저장
  courses.forEach(course => {
    const filePath = path.join(COURSES_DIR, `${course.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(course, null, 2));
    console.log(`코스 데이터 저장: ${filePath}`);
  });
  
  users.forEach(user => {
    const filePath = path.join(USERS_DIR, `${user.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(user, null, 2));
    console.log(`사용자 데이터 저장: ${filePath}`);
  });
  
  // 사용자별 라운드 폴더 생성
  users.forEach(user => {
    const userRoundsDir = path.join(ROUNDS_DIR, user.id);
    if (!fs.existsSync(userRoundsDir)) {
      fs.mkdirSync(userRoundsDir, { recursive: true });
    }
    
    // 해당 사용자의 라운드 저장
    rounds
      .filter(round => round.userId === user.id)
      .forEach(round => {
        const filePath = path.join(userRoundsDir, `${round.id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(round, null, 2));
        console.log(`라운드 데이터 저장: ${filePath}`);
      });
  });
}

// 통계 데이터 생성
function generateStatistics() {
  // 사용자별 통계 생성
  const users = fs.readdirSync(USERS_DIR)
    .filter(file => file.endsWith('.json'))
    .map(file => {
      const filePath = path.join(USERS_DIR, file);
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    });
  
  users.forEach(user => {
    const userRoundsDir = path.join(ROUNDS_DIR, user.id);
    
    if (fs.existsSync(userRoundsDir)) {
      const rounds = fs.readdirSync(userRoundsDir)
        .filter(file => file.endsWith('.json'))
        .map(file => {
          const filePath = path.join(userRoundsDir, file);
          return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        });
      
      if (rounds.length > 0) {
        // 기본 통계 계산
        const totalScores = rounds.map(round => round.totalScore);
        const avgScore = totalScores.reduce((a, b) => a + b, 0) / totalScores.length;
        
        // 홀별 평균 계산
        const holeStats = Array(18).fill().map((_, holeIndex) => {
          const holeNumber = holeIndex + 1;
          const holeScores = rounds.map(round => {
            const hole = round.holes.find(h => h.holeNumber === holeNumber);
            return hole ? hole.score : null;
          }).filter(score => score !== null);
          
          const avgHoleScore = holeScores.length > 0
            ? holeScores.reduce((a, b) => a + b, 0) / holeScores.length
            : 0;
            
          return {
            holeNumber,
            avgScore: parseFloat(avgHoleScore.toFixed(2)),
            scoreCount: holeScores.length
          };
        });
        
        // 기타 통계 계산
        const fairwayHitRate = rounds.flatMap(round => 
          round.holes.filter(hole => hole.fairwayHit !== undefined)
            .map(hole => hole.fairwayHit ? 1 : 0)
        ).reduce((a, b) => a + b, 0) / rounds.flatMap(round => 
          round.holes.filter(hole => hole.fairwayHit !== undefined)
        ).length;
        
        const greenHitRate = rounds.flatMap(round => 
          round.holes.filter(hole => hole.greenHit !== undefined)
            .map(hole => hole.greenHit ? 1 : 0)
        ).reduce((a, b) => a + b, 0) / rounds.flatMap(round => 
          round.holes.filter(hole => hole.greenHit !== undefined)
        ).length;
        
        const avgPutts = rounds.flatMap(round => 
          round.holes.filter(hole => hole.putts !== undefined)
            .map(hole => hole.putts)
        ).reduce((a, b) => a + b, 0) / rounds.flatMap(round => 
          round.holes.filter(hole => hole.putts !== undefined)
        ).length;
        
        // 통계 데이터 저장
        const statistics = {
          userId: user.id,
          roundsPlayed: rounds.length,
          avgScore: parseFloat(avgScore.toFixed(2)),
          bestScore: Math.min(...totalScores),
          recentForm: totalScores.slice(-3).map(score => parseInt(score)),
          fairwayHitRate: parseFloat(fairwayHitRate.toFixed(2)),
          greenHitRate: parseFloat(greenHitRate.toFixed(2)),
          avgPuttsPerRound: parseFloat(avgPutts.toFixed(2)),
          holeStats,
          lastUpdated: new Date().toISOString()
        };
        
        const filePath = path.join(STATISTICS_DIR, `${user.id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(statistics, null, 2));
        console.log(`통계 데이터 저장: ${filePath}`);
      }
    }
  });
}

// 메인 함수
function main() {
  try {
    console.log('데이터 처리 시작...');
    ensureDirectoriesExist();
    generateSampleData();
    generateStatistics();
    console.log('데이터 처리 완료!');
  } catch (error) {
    console.error('데이터 처리 오류:', error);
    process.exit(1);
  }
}

// 스크립트 실행
main(); 