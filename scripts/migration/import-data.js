/**
 * JSON 데이터를 MongoDB로 가져오는 스크립트
 */
require('dotenv').config({ path: '../../server/.env' });
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// 모델 가져오기
const User = require('../../server/models/User');
const Course = require('../../server/models/Course');
const Round = require('../../server/models/Round');

// 데이터 파일 경로
const inputDir = path.join(__dirname, 'output');
const allDataPath = path.join(inputDir, 'all_data.json');

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB 연결 성공'))
.catch((err) => {
  console.error('MongoDB 연결 오류:', err);
  process.exit(1);
});

// 데이터 매핑 및 변환 함수들
const mapUser = (oldUser) => {
  return {
    username: oldUser.username,
    password: oldUser.password, // 이미 해시된 비밀번호
    name: oldUser.name || oldUser.username,
    email: oldUser.email || `${oldUser.username}@example.com`,
    handicap: oldUser.handicap || 0,
    createdAt: new Date(oldUser.created_at) || new Date(),
    updatedAt: new Date(oldUser.updated_at) || new Date()
  };
};

const mapCourse = (oldCourse, oldHoles) => {
  // 해당 코스의 홀 정보 찾기
  const courseHoles = oldHoles.filter(h => h.course_id === oldCourse.id);
  
  return {
    name: oldCourse.name,
    location: oldCourse.location || '기본 위치',
    totalPar: oldCourse.total_par,
    courseType: oldCourse.type || '시뮬레이터',
    holes: courseHoles.map(h => ({
      holeNumber: h.hole_number,
      par: h.par,
      distance: h.distance,
      handicap: h.handicap || 0,
      description: h.description || ''
    })),
    difficulty: oldCourse.difficulty || 3,
    description: oldCourse.description || '',
    image: oldCourse.image_url || '',
    createdAt: new Date(oldCourse.created_at) || new Date(),
    updatedAt: new Date(oldCourse.updated_at) || new Date()
  };
};

// 데이터 가져오기 함수
const importData = async () => {
  try {
    // 데이터 파일 읽기
    if (!fs.existsSync(allDataPath)) {
      console.error(`파일을 찾을 수 없음: ${allDataPath}`);
      process.exit(1);
    }
    
    const data = JSON.parse(fs.readFileSync(allDataPath, 'utf8'));
    console.log('데이터 파일 로드 완료');
    
    // 사용자 정보 처리
    if (data.users && data.users.length > 0) {
      // 기존 사용자 데이터 삭제
      await User.deleteMany({});
      console.log('기존 사용자 데이터 삭제 완료');
      
      // 사용자 데이터 변환 및 삽입
      const mappedUsers = data.users.map(mapUser);
      await User.insertMany(mappedUsers);
      console.log(`사용자 데이터 ${mappedUsers.length}개 가져오기 완료`);
    }
    
    // 코스 정보 처리
    if (data.courses && data.courses.length > 0) {
      // 기존 코스 데이터 삭제
      await Course.deleteMany({});
      console.log('기존 코스 데이터 삭제 완료');
      
      // 코스 데이터 변환 및 삽입
      const holes = data.holes || [];
      const mappedCourses = data.courses.map(course => mapCourse(course, holes));
      await Course.insertMany(mappedCourses);
      console.log(`코스 데이터 ${mappedCourses.length}개 가져오기 완료`);
    }
    
    // 라운드 정보 처리는 사용자 및 코스 ID 매핑이 필요하여 더 복잡합니다.
    // 별도 구현 필요
    
    console.log('데이터 가져오기가 완료되었습니다.');
    
  } catch (error) {
    console.error('데이터 가져오기 오류:', error);
  } finally {
    mongoose.disconnect();
    console.log('MongoDB 연결 종료');
  }
};

// 스크립트 실행
importData(); 