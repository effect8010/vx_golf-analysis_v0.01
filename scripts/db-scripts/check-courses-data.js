/**
 * 골프 코스 데이터 확인 스크립트
 * 골프 코스 정보(golf_courses), 코스 상세 정보(course_details), 홀 정보(holes)를 함께 확인
 * 개발 규칙에 따라 절대 경로 사용 및 결과 파일 저장 방식 적용
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 데이터베이스 경로 설정 (절대 경로)
const dbPath = path.join(__dirname, 'data', 'golf_simulator.db');
console.log('데이터베이스 경로:', dbPath);

// 결과 저장 파일 경로
const resultPath = path.join(__dirname, 'courses-data-check.json');

// 현재 시간
const now = new Date();
const timestamp = now.toISOString().replace(/:/g, '-');

// 데이터베이스 연결
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    const errorMsg = `데이터베이스 연결 오류: ${err.message}`;
    console.error(errorMsg);
    
    // 오류 로그 저장
    fs.appendFileSync('db-errors.log', `${timestamp} - ${errorMsg}\n`);
    process.exit(1);
  }
  
  console.log('데이터베이스에 연결되었습니다.');
  
  // 결과 객체 초기화
  const result = {
    success: true,
    timestamp: timestamp,
    courses: [],
    courseDetails: {},
    holes: {}
  };
  
  // 1. 골프 코스 정보 조회
  db.all(`
    SELECT 
      course_id, 
      course_name, 
      resource_name, 
      course_count, 
      country_code, 
      course_difficulty, 
      green_difficulty, 
      description,
      course_image,
      average_par,
      release_date,
      created_at
    FROM golf_courses
    ORDER BY course_id
  `, [], (err, courses) => {
    if (err) {
      const errorMsg = `골프 코스 조회 오류: ${err.message}`;
      console.error(errorMsg);
      fs.appendFileSync('db-errors.log', `${timestamp} - ${errorMsg}\n`);
      result.success = false;
      result.error = err.message;
      finishProcess();
      return;
    }
    
    result.courses = courses;
    console.log(`총 ${courses.length}개의 골프 코스가 등록되어 있습니다.`);
    
    if (courses.length === 0) {
      console.log('골프 코스 데이터가 없습니다.');
      finishProcess();
      return;
    }
    
    // 코스 ID 목록
    const courseIds = courses.map(course => course.course_id);
    console.log('코스 ID 목록:', courseIds.join(', '));
    console.log('코스명 목록:', courses.map(course => course.course_name).join(', '));
    
    // 2. 각 코스에 대한 코스 상세 정보 조회
    let detailsCompleted = 0;
    
    courses.forEach(course => {
      db.all(`
        SELECT 
          detail_id, 
          course_id, 
          course_number, 
          course_name
        FROM course_details
        WHERE course_id = ?
        ORDER BY course_number
      `, [course.course_id], (err, details) => {
        if (err) {
          const errorMsg = `코스 상세 정보 조회 오류 (코스 ID: ${course.course_id}): ${err.message}`;
          console.error(errorMsg);
          fs.appendFileSync('db-errors.log', `${timestamp} - ${errorMsg}\n`);
          result.courseDetails[course.course_id] = { error: err.message };
        } else {
          result.courseDetails[course.course_id] = details;
          console.log(`코스 ID ${course.course_id}에 대한 상세 정보: ${details.length}개`);
        }
        
        detailsCompleted++;
        
        // 모든 코스 상세 정보 조회가 완료되면 홀 정보 조회 시작
        if (detailsCompleted === courses.length) {
          queryHoleData(courseIds);
        }
      });
    });
    
    // 코스 ID가 없을 경우 즉시 종료
    if (courses.length === 0) {
      finishProcess();
    }
  });
  
  // 3. 홀 정보 조회 함수
  function queryHoleData(courseIds) {
    let holesCompleted = 0;
    
    courseIds.forEach(courseId => {
      db.all(`
        SELECT 
          hole_id, 
          course_id, 
          course_number, 
          hole_number, 
          par, 
          hole_type, 
          back_distance, 
          champion_distance, 
          front_distance, 
          senior_distance, 
          lady_distance, 
          hole_index, 
          hole_image
        FROM holes
        WHERE course_id = ?
        ORDER BY course_number, hole_number
      `, [courseId], (err, holes) => {
        if (err) {
          const errorMsg = `홀 정보 조회 오류 (코스 ID: ${courseId}): ${err.message}`;
          console.error(errorMsg);
          fs.appendFileSync('db-errors.log', `${timestamp} - ${errorMsg}\n`);
          result.holes[courseId] = { error: err.message };
        } else {
          result.holes[courseId] = holes;
          console.log(`코스 ID ${courseId}에 대한 홀 정보: ${holes.length}개`);
          
          // 코스별 홀 정보 구성
          if (holes.length > 0) {
            // 코스 번호별로 그룹화
            const courseNumbers = [...new Set(holes.map(hole => hole.course_number))];
            console.log(`코스 ID ${courseId}의 코스 번호: ${courseNumbers.join(', ')}`);
            
            // 각 코스 번호별 홀 개수 출력
            courseNumbers.forEach(courseNumber => {
              const courseHoles = holes.filter(hole => hole.course_number === courseNumber);
              console.log(`코스 ID ${courseId}, 코스 번호 ${courseNumber}의 홀 개수: ${courseHoles.length}개`);
            });
          }
        }
        
        holesCompleted++;
        
        // 모든 홀 정보 조회가 완료되면 결과 저장 및 연결 종료
        if (holesCompleted === courseIds.length) {
          finishProcess();
        }
      });
    });
    
    // 코스 ID가 없을 경우 즉시 종료
    if (courseIds.length === 0) {
      finishProcess();
    }
  }
  
  // 최종 처리 함수
  function finishProcess() {
    // 관계 분석
    result.analysis = analyzeRelationships(result);
    
    // 결과를 JSON 파일로 저장
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
    console.log(`골프 코스 데이터 확인 결과가 ${resultPath} 파일에 저장되었습니다.`);
    
    // 데이터베이스 연결 종료 (리소스 정리)
    db.close((err) => {
      if (err) {
        const errorMsg = `데이터베이스 연결 종료 오류: ${err.message}`;
        console.error(errorMsg);
        fs.appendFileSync('db-errors.log', `${timestamp} - ${errorMsg}\n`);
        return;
      }
      console.log('데이터베이스 연결이 종료되었습니다.');
    });
  }
  
  // 관계 분석 함수
  function analyzeRelationships(data) {
    const analysis = {
      completeness: {
        courses: data.courses.length,
        missingDetails: [],
        missingHoles: []
      },
      summary: ''
    };
    
    // 각 코스에 대해 상세 정보 및 홀 정보 관계 분석
    data.courses.forEach(course => {
      const courseId = course.course_id;
      const details = data.courseDetails[courseId] || [];
      
      // 코스 상세 정보 없음 확인
      if (!details.length) {
        analysis.completeness.missingDetails.push(courseId);
      }
      
      // 코스별 홀 정보 확인
      const holes = data.holes[courseId] || [];
      if (!holes.length) {
        analysis.completeness.missingHoles.push(courseId);
      }
      
      // 코스 번호별 예상 홀 수 확인 (일반적으로 9홀 또는 18홀)
      if (details.length > 0 && holes.length > 0) {
        details.forEach(detail => {
          const courseNumber = detail.course_number;
          const courseHoles = holes.filter(hole => hole.course_number === courseNumber);
          const expectedHoles = 9; // 일반적으로 9홀 기준
          
          if (courseHoles.length !== expectedHoles) {
            if (!analysis.completeness.incompleteHoles) {
              analysis.completeness.incompleteHoles = [];
            }
            analysis.completeness.incompleteHoles.push({
              courseId,
              courseNumber,
              expected: expectedHoles,
              actual: courseHoles.length
            });
          }
        });
      }
    });
    
    // 요약 분석
    if (analysis.completeness.courses === 0) {
      analysis.summary = '골프 코스 데이터가 없습니다.';
    } else if (analysis.completeness.missingDetails.length === analysis.completeness.courses) {
      analysis.summary = '모든 골프 코스에 상세 정보가 없습니다.';
    } else if (analysis.completeness.missingHoles.length === analysis.completeness.courses) {
      analysis.summary = '모든 골프 코스에 홀 정보가 없습니다.';
    } else if (analysis.completeness.missingDetails.length > 0 || analysis.completeness.missingHoles.length > 0) {
      analysis.summary = '일부 골프 코스의 상세 정보 또는 홀 정보가 누락되었습니다.';
    } else {
      analysis.summary = '모든 골프 코스에 상세 정보와 홀 정보가 정상적으로 등록되어 있습니다.';
    }
    
    return analysis;
  }
}); 