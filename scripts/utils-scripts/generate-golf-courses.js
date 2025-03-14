/**
 * 골프 코스 데이터 생성 스크립트
 * 10개의 골프장 데이터를 생성하여 DB에 입력합니다.
 * 각 골프장은 18홀(2개 코스 x 9홀)로 구성됩니다.
 */
const fs = require('fs');
const path = require('path');
const db = require('./server/models/db');
const { CourseModel } = require('./server/models');

// 현재 시간 설정
const now = new Date();
const timestamp = now.toISOString().replace(/:/g, '-');

// 결과 저장 파일 경로
const resultPath = path.join(__dirname, 'generated-courses.json');

// 로그 기록 함수
function log(message) {
  console.log(message);
  fs.appendFileSync('course-generation.log', `${timestamp} - ${message}\n`);
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

// 골프 코스 데이터 생성 및 DB 입력
async function generateGolfCourses() {
  try {
    log('골프 코스 데이터 생성 시작...');
    
    // 기존 골프 코스 수 확인
    const existingCourses = await db.get('SELECT COUNT(*) as count FROM golf_courses');
    log(`현재 골프 코스 수: ${existingCourses.count}`);
    
    // 골프 코스 샘플 데이터
    const courseData = [
      {
        name: '그린힐스 컨트리클럽',
        resource: 'greenhills_cc',
        country: 1, // 한국
        difficulty: 4,
        green_difficulty: 3,
        description: '서울 근교에 위치한 그린힐스 컨트리클럽은 아름다운 자연 경관과 도전적인 코스 레이아웃을 갖추고 있습니다.'
      },
      {
        name: '블루오션 골프클럽',
        resource: 'blueocean_gc',
        country: 1, // 한국
        difficulty: 3,
        green_difficulty: 4,
        description: '해안가에 위치한 블루오션 골프클럽은 시원한 바다 전망과 함께 즐기는 골프 코스입니다.'
      },
      {
        name: '마운틴 밸리 CC',
        resource: 'mountainvalley_cc',
        country: 1, // 한국
        difficulty: 5,
        green_difficulty: 5,
        description: '산악 지형에 조성된 마운틴 밸리 CC는 높은 난이도와 멋진 경치로 유명합니다.'
      },
      {
        name: '이글 레이크 GC',
        resource: 'eaglelake_gc',
        country: 1, // 한국
        difficulty: 2,
        green_difficulty: 3,
        description: '호수를 중심으로 조성된 이글 레이크 GC는 초보자도 즐길 수 있는 비교적 평탄한 코스입니다.'
      },
      {
        name: '로얄 파인스 CC',
        resource: 'royalpines_cc',
        country: 1, // 한국
        difficulty: 4,
        green_difficulty: 4,
        description: '소나무 숲으로 둘러싸인 로얄 파인스 CC는 경치가 아름답고 전략적인 코스 레이아웃을 자랑합니다.'
      },
      {
        name: '골든 메도우 GC',
        resource: 'goldenmeadow_gc',
        country: 1, // 한국
        difficulty: 3,
        green_difficulty: 2,
        description: '넓은 페어웨이와 잘 관리된 그린이 특징인 골든 메도우 GC는 편안한 라운드를 즐길 수 있습니다.'
      },
      {
        name: '선셋 베이 CC',
        resource: 'sunsetbay_cc',
        country: 1, // 한국
        difficulty: 3,
        green_difficulty: 3,
        description: '서해안에 위치한 선셋 베이 CC는 아름다운 일몰과 함께 즐기는 골프 코스입니다.'
      },
      {
        name: '비발디 포레스트 GC',
        resource: 'vivaldiforest_gc',
        country: 1, // 한국
        difficulty: 4,
        green_difficulty: 3,
        description: '사계절 다양한 풍경을 즐길 수 있는 비발디 포레스트 GC는 산림 지역에 위치해 있습니다.'
      },
      {
        name: '드래곤 밸리 CC',
        resource: 'dragonvalley_cc',
        country: 1, // 한국
        difficulty: 5,
        green_difficulty: 4,
        description: '드래곤 밸리 CC는 도전적인 지형과 험준한 경사가 특징인 고난도 코스입니다.'
      },
      {
        name: '오아시스 GC',
        resource: 'oasis_gc',
        country: 1, // 한국
        difficulty: 2,
        green_difficulty: 2,
        description: '중부 지방에 위치한 오아시스 GC는 넓은 페어웨이와 평탄한 지형으로 초심자에게 적합합니다.'
      }
    ];
    
    // 골프 코스 이름 목록
    const courseNames = {
      'EAST': ['이스트', '동코스', '해돋이', '선라이즈', '오리엔트'],
      'WEST': ['웨스트', '서코스', '일몰', '선셋', '오션뷰'],
      'NORTH': ['노스', '북코스', '파인', '마운틴', '포레스트'],
      'SOUTH': ['사우스', '남코스', '레이크', '밸리', '메도우']
    };
    
    // 결과 저장 객체
    const results = {
      success: true,
      timestamp: timestamp,
      courses: [],
      details: {},
      holes: {}
    };
    
    // 코스 데이터 DB 입력
    for (const course of courseData) {
      try {
        log(`코스 추가 시작: ${course.name}`);
        
        // 코스 이름 중복 확인
        const existingCourse = await CourseModel.findCourseByName(course.name);
        if (existingCourse && existingCourse.length > 0) {
          log(`코스 이름 '${course.name}'이 이미 존재합니다. 건너뜁니다.`);
          continue;
        }
        
        // 골프 코스 데이터 생성
        const coursePayload = {
          course_name: course.name,
          resource_name: course.resource,
          course_count: 2, // 각 골프장은 2개의 코스로 구성 (18홀 = 2코스 x 9홀)
          country_code: course.country,
          course_difficulty: course.difficulty,
          green_difficulty: course.green_difficulty,
          description: course.description,
          course_image: null,
          average_par: 72, // 기본 평균 파
          release_date: null
        };
        
        // 코스 생성
        const courseId = await CourseModel.createCourse(coursePayload);
        log(`코스 생성 완료: ${course.name} (ID: ${courseId})`);
        
        // 코스 상세 정보 저장
        results.courses.push({
          courseId,
          courseName: course.name
        });
        
        // 코스 상세 정보 생성
        results.details[courseId] = [];
        
        // 랜덤으로 코스 이름 선택
        const courseTypeKeys = Object.keys(courseNames);
        const randomIndexes = [
          getRandomInt(0, courseTypeKeys.length - 1),
          getRandomInt(0, courseTypeKeys.length - 1)
        ];
        // 두 개의 코스 이름이 같지 않도록 확인
        if (randomIndexes[0] === randomIndexes[1]) {
          randomIndexes[1] = (randomIndexes[1] + 1) % courseTypeKeys.length;
        }
        
        // 홀 정보 저장 배열
        results.holes[courseId] = [];
        
        // OUT 코스(앞 9홀) 추가
        const outCourseType = courseTypeKeys[randomIndexes[0]];
        const outCourseName = courseNames[outCourseType][getRandomInt(0, courseNames[outCourseType].length - 1)];
        const outCourseDetailId = await CourseModel.addCourseDetail({
          course_id: courseId,
          course_number: 1,
          course_name: outCourseName
        });
        log(`OUT 코스 추가: ${outCourseName} (코스 번호: 1, 상세 ID: ${outCourseDetailId})`);
        
        results.details[courseId].push({
          detailId: outCourseDetailId,
          courseNumber: 1,
          courseName: outCourseName
        });
        
        // IN 코스(뒤 9홀) 추가
        const inCourseType = courseTypeKeys[randomIndexes[1]];
        const inCourseName = courseNames[inCourseType][getRandomInt(0, courseNames[inCourseType].length - 1)];
        const inCourseDetailId = await CourseModel.addCourseDetail({
          course_id: courseId,
          course_number: 2,
          course_name: inCourseName
        });
        log(`IN 코스 추가: ${inCourseName} (코스 번호: 2, 상세 ID: ${inCourseDetailId})`);
        
        results.details[courseId].push({
          detailId: inCourseDetailId, 
          courseNumber: 2,
          courseName: inCourseName
        });
        
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
          
          results.holes[courseId].push({
            holeId,
            courseNumber: 1,
            holeNumber,
            par: holeType
          });
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
          
          results.holes[courseId].push({
            holeId,
            courseNumber: 2,
            holeNumber,
            par: holeType
          });
        }
        
        // 총 파 업데이트
        const totalPar = outCoursePar + inCoursePar;
        await CourseModel.updateCourse(courseId, {
          ...coursePayload,
          average_par: totalPar
        });
        log(`코스 총 파 업데이트: ${totalPar} (코스 ID: ${courseId})`);
      } catch (error) {
        log(`코스 '${course.name}' 추가 중 오류 발생: ${error.message}`);
        console.error(error);
      }
    }
    
    log('골프 코스 데이터 생성 완료');
    
    // 추가된 골프 코스 목록 출력
    const courses = await db.all('SELECT course_id, course_name FROM golf_courses');
    log(`현재 등록된 골프 코스: ${courses.length}개`);
    
    // 결과를 JSON 파일로 저장
    fs.writeFileSync(resultPath, JSON.stringify(results, null, 2));
    log(`생성된 골프 코스 데이터가 ${resultPath} 파일에 저장되었습니다.`);
    
  } catch (error) {
    log(`골프 코스 데이터 생성 중 오류 발생: ${error.message}`);
    console.error(error);
  } finally {
    await db.close();
    log('데이터베이스 연결이 종료되었습니다.');
  }
}

// 스크립트 실행
generateGolfCourses(); 