const db = require('./db');

// 골프 코스 모델
const CourseModel = {
  // 골프 코스 생성
  createCourse: async (courseData) => {
    const { 
      course_name, 
      resource_name, 
      course_count, 
      country_code, 
      course_difficulty, 
      green_difficulty, 
      description,
      course_image,
      average_par,
      release_date
    } = courseData;
    
    const sql = `
      INSERT INTO golf_courses (
        course_name, resource_name, course_count, country_code, 
        course_difficulty, green_difficulty, description, 
        course_image, average_par, release_date, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    
    const params = [
      course_name, resource_name, course_count, country_code,
      course_difficulty, green_difficulty, description,
      course_image, average_par, release_date
    ];
    
    const result = await db.run(sql, params);
    return result.lastID;
  },
  
  // 코스 상세 정보 추가
  addCourseDetail: async (detailData) => {
    const { course_id, course_number, course_name } = detailData;
    
    const sql = `
      INSERT INTO course_details (course_id, course_number, course_name)
      VALUES (?, ?, ?)
    `;
    
    const result = await db.run(sql, [course_id, course_number, course_name]);
    return result.lastID;
  },
  
  // 홀 정보 추가
  addHole: async (holeData) => {
    const {
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
    } = holeData;
    
    const sql = `
      INSERT INTO holes (
        course_id, course_number, hole_number, par, hole_type,
        back_distance, champion_distance, front_distance,
        senior_distance, lady_distance, hole_index, hole_image
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      course_id, course_number, hole_number, par, hole_type,
      back_distance, champion_distance, front_distance,
      senior_distance, lady_distance, hole_index, hole_image
    ];
    
    const result = await db.run(sql, params);
    return result.lastID;
  },
  
  // 코스 ID로 코스 찾기
  findCourseById: async (courseId) => {
    const sql = 'SELECT * FROM golf_courses WHERE course_id = ?';
    return await db.get(sql, [courseId]);
  },
  
  // 코스 이름으로 코스 찾기
  findCourseByName: async (courseName) => {
    const sql = 'SELECT * FROM golf_courses WHERE course_name LIKE ?';
    return await db.all(sql, [`%${courseName}%`]);
  },
  
  // 모든 코스 가져오기
  getAllCourses: async () => {
    const sql = 'SELECT * FROM golf_courses ORDER BY course_name';
    return await db.all(sql);
  },
  
  // 국가별 코스 가져오기
  getCoursesByCountry: async (countryCode) => {
    const sql = 'SELECT * FROM golf_courses WHERE country_code = ? ORDER BY course_name';
    return await db.all(sql, [countryCode]);
  },
  
  // 난이도별 코스 가져오기
  getCoursesByDifficulty: async (difficulty) => {
    const sql = 'SELECT * FROM golf_courses WHERE course_difficulty = ? ORDER BY course_name';
    return await db.all(sql, [difficulty]);
  },
  
  // 코스의 상세 정보 가져오기
  getCourseDetails: async (courseId) => {
    const sql = 'SELECT * FROM course_details WHERE course_id = ? ORDER BY course_number';
    return await db.all(sql, [courseId]);
  },
  
  // 코스의 홀 정보 가져오기
  getCourseHoles: async (courseId, courseNumber) => {
    const sql = `
      SELECT * FROM holes 
      WHERE course_id = ? AND course_number = ? 
      ORDER BY hole_number
    `;
    return await db.all(sql, [courseId, courseNumber]);
  },
  
  // 코스 정보 업데이트
  updateCourse: async (courseId, courseData) => {
    const { 
      course_name, 
      resource_name, 
      course_count, 
      country_code, 
      course_difficulty, 
      green_difficulty, 
      description,
      course_image,
      average_par,
      release_date
    } = courseData;
    
    const sql = `
      UPDATE golf_courses 
      SET course_name = ?, resource_name = ?, course_count = ?, 
          country_code = ?, course_difficulty = ?, green_difficulty = ?,
          description = ?, course_image = ?, average_par = ?, release_date = ?
      WHERE course_id = ?
    `;
    
    const params = [
      course_name, resource_name, course_count,
      country_code, course_difficulty, green_difficulty,
      description, course_image, average_par, release_date,
      courseId
    ];
    
    const result = await db.run(sql, params);
    return result.changes > 0;
  },
  
  // 코스 상세 정보 업데이트
  updateCourseDetail: async (detailId, detailData) => {
    const { course_name } = detailData;
    
    const sql = `
      UPDATE course_details
      SET course_name = ?
      WHERE detail_id = ?
    `;
    
    const result = await db.run(sql, [course_name, detailId]);
    return result.changes > 0;
  },
  
  // 홀 정보 업데이트
  updateHole: async (holeId, holeData) => {
    const {
      par,
      hole_type,
      back_distance,
      champion_distance,
      front_distance,
      senior_distance,
      lady_distance,
      hole_index,
      hole_image
    } = holeData;
    
    const sql = `
      UPDATE holes
      SET par = ?, hole_type = ?, back_distance = ?,
          champion_distance = ?, front_distance = ?,
          senior_distance = ?, lady_distance = ?,
          hole_index = ?, hole_image = ?
      WHERE hole_id = ?
    `;
    
    const params = [
      par, hole_type, back_distance,
      champion_distance, front_distance,
      senior_distance, lady_distance,
      hole_index, hole_image,
      holeId
    ];
    
    const result = await db.run(sql, params);
    return result.changes > 0;
  },
  
  // 코스 삭제 (연결된 모든 상세 정보 및 홀 삭제)
  deleteCourse: async (courseId) => {
    try {
      // 트랜잭션 시작
      await db.exec('BEGIN TRANSACTION');
      
      // 홀 삭제
      await db.run('DELETE FROM holes WHERE course_id = ?', [courseId]);
      
      // 코스 상세 정보 삭제
      await db.run('DELETE FROM course_details WHERE course_id = ?', [courseId]);
      
      // 코스 삭제
      const result = await db.run('DELETE FROM golf_courses WHERE course_id = ?', [courseId]);
      
      // 트랜잭션 커밋
      await db.exec('COMMIT');
      
      return result.changes > 0;
    } catch (error) {
      // 오류 발생 시 롤백
      await db.exec('ROLLBACK');
      throw error;
    }
  },
  
  // 홀 삭제
  deleteHole: async (holeId) => {
    const sql = 'DELETE FROM holes WHERE hole_id = ?';
    const result = await db.run(sql, [holeId]);
    return result.changes > 0;
  }
};

module.exports = CourseModel; 