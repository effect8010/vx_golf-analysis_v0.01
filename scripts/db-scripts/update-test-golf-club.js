/**
 * 테스트 골프 클럽(코스 ID 1)에 대한 코스 상세 정보와 홀 정보 추가 스크립트
 */
const fs = require('fs');
const path = require('path');
const db = require(path.join(__dirname, 'server', 'models', 'db'));
const { CourseModel } = require(path.join(__dirname, 'server', 'models'));

// 현재 시간 설정
const now = new Date();
const timestamp = now.toISOString().replace(/:/g, '-');

// 로그 기록 함수
function log(message) {
  console.log(message);
  fs.appendFileSync('test-course-update.log', `${timestamp} - ${message}\n`);
}

// 난수 발생 헬퍼 함수
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 홀 타입 결정 (par 3, 4, 5)
function getHoleType() {
  const weights = [0.2, 0.6, 0.2]; // 파3, 파4, 파5의 비율 (20%, 60%, 20%)
  const rand = Math.random();
  
  if (rand < weights[0]) return 3;
  if (rand < weights[0] + weights[1]) return 4;
  return 5;
}

// 거리 생성 (홀 타입에 따라 차등)
function generateDistance(holeType) {
  switch (holeType) {
    case 3: // 파3
      return {
        back: getRandomInt(180, 230),
        champion: getRandomInt(160, 210),
        front: getRandomInt(140, 190),
        senior: getRandomInt(120, 170),
        lady: getRandomInt(100, 150)
      };
    case 4: // 파4
      return {
        back: getRandomInt(350, 450),
        champion: getRandomInt(330, 420),
        front: getRandomInt(300, 400),
        senior: getRandomInt(280, 380),
        lady: getRandomInt(260, 350)
      };
    case 5: // 파5
      return {
        back: getRandomInt(500, 580),
        champion: getRandomInt(480, 560),
        front: getRandomInt(450, 530),
        senior: getRandomInt(420, 500),
        lady: getRandomInt(400, 480)
      };
  }
}

// 테스트 골프 클럽에 코스 상세 정보와 홀 정보 추가
async function updateTestGolfClub() {
  try {
    log('테스트 골프 클럽 업데이트 시작...');
    
    // 테스트 골프 클럽 정보 확인
    const courseId = 1; // 테스트 골프 클럽의 ID
    
    const course = await db.get('SELECT * FROM golf_courses WHERE course_id = ?', [courseId]);
    if (!course) {
      log('테스트 골프 클럽이 존재하지 않습니다.');
      return;
    }
    
    log(`테스트 골프 클럽 정보: ${JSON.stringify(course)}`);
    
    // 코스 상세 정보 확인
    const existingDetails = await db.all('SELECT * FROM course_details WHERE course_id = ?', [courseId]);
    
    if (existingDetails && existingDetails.length > 0) {
      log(`테스트 골프 클럽에는 이미 ${existingDetails.length}개의 코스 상세 정보가 있습니다.`);
      await db.run('DELETE FROM course_details WHERE course_id = ?', [courseId]);
      log('기존 코스 상세 정보를 삭제했습니다.');
    }
    
    // 홀 정보 확인
    const existingHoles = await db.all('SELECT * FROM holes WHERE course_id = ?', [courseId]);
    
    if (existingHoles && existingHoles.length > 0) {
      log(`테스트 골프 클럽에는 이미 ${existingHoles.length}개의 홀 정보가 있습니다.`);
      await db.run('DELETE FROM holes WHERE course_id = ?', [courseId]);
      log('기존 홀 정보를 삭제했습니다.');
    }
    
    // 코스 상세 정보 추가
    // OUT 코스(앞 9홀) 추가 - 테스트 EAST 코스
    const outCourseDetailId = await CourseModel.addCourseDetail({
      course_id: courseId,
      course_number: 1,
      course_name: '테스트 EAST'
    });
    log(`OUT 코스 추가: 테스트 EAST (코스 번호: 1, 상세 ID: ${outCourseDetailId})`);
    
    // IN 코스(뒤 9홀) 추가 - 테스트 WEST 코스
    const inCourseDetailId = await CourseModel.addCourseDetail({
      course_id: courseId,
      course_number: 2,
      course_name: '테스트 WEST'
    });
    log(`IN 코스 추가: 테스트 WEST (코스 번호: 2, 상세 ID: ${inCourseDetailId})`);
    
    // OUT 코스 홀 정보 생성 (1~9번 홀)
    let outCoursePar = 0;
    for (let holeNumber = 1; holeNumber <= 9; holeNumber++) {
      const holeType = getHoleType();
      const distances = generateDistance(holeType);
      
      outCoursePar += holeType;
      
      const holeData = {
        course_id: courseId,
        course_number: 1,
        hole_number: holeNumber,
        par: holeType,
        hole_type: holeType,
        back_distance: distances.back,
        champion_distance: distances.champion,
        front_distance: distances.front,
        senior_distance: distances.senior,
        lady_distance: distances.lady,
        hole_index: getRandomInt(1, 18), // 홀 난이도 인덱스 (1~18)
        hole_image: null
      };
      
      const holeId = await CourseModel.addHole(holeData);
      log(`OUT 코스 홀 추가: 홀 번호 ${holeNumber}, 파 ${holeType} (홀 ID: ${holeId})`);
    }
    
    // IN 코스 홀 정보 생성 (1~9번 홀)
    let inCoursePar = 0;
    for (let holeNumber = 1; holeNumber <= 9; holeNumber++) {
      const holeType = getHoleType();
      const distances = generateDistance(holeType);
      
      inCoursePar += holeType;
      
      const holeData = {
        course_id: courseId,
        course_number: 2,
        hole_number: holeNumber,
        par: holeType,
        hole_type: holeType,
        back_distance: distances.back,
        champion_distance: distances.champion,
        front_distance: distances.front,
        senior_distance: distances.senior,
        lady_distance: distances.lady,
        hole_index: getRandomInt(1, 18), // 홀 난이도 인덱스 (1~18)
        hole_image: null
      };
      
      const holeId = await CourseModel.addHole(holeData);
      log(`IN 코스 홀 추가: 홀 번호 ${holeNumber}, 파 ${holeType} (홀 ID: ${holeId})`);
    }
    
    // 총 파 업데이트
    const totalPar = outCoursePar + inCoursePar;
    await CourseModel.updateCourse(courseId, {
      course_name: course.course_name,
      resource_name: course.resource_name,
      course_count: 2, // 각 골프장은 2개의 코스로 구성 (18홀 = 2코스 x 9홀)
      country_code: course.country_code,
      course_difficulty: course.course_difficulty,
      green_difficulty: course.green_difficulty,
      description: course.description,
      course_image: course.course_image,
      average_par: totalPar,
      release_date: course.release_date
    });
    
    log(`코스 총 파 업데이트: ${totalPar} (코스 ID: ${courseId})`);
    log('테스트 골프 클럽 업데이트 완료');
    
  } catch (error) {
    log(`테스트 골프 클럽 업데이트 중 오류 발생: ${error.message}`);
    console.error(error);
  } finally {
    await db.close();
    log('데이터베이스 연결이 종료되었습니다.');
  }
}

// 스크립트 실행
updateTestGolfClub(); 