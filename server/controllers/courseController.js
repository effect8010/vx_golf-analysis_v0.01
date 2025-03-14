/**
 * 골프 코스 컨트롤러
 * 골프 코스 관련 기능을 처리합니다.
 */
const { CourseModel } = require('../models');

/**
 * 모든 골프 코스 목록 조회
 */
const getAllCourses = (req, res) => {
  try {
    // 필터링 옵션
    const countryCode = req.query.country ? parseInt(req.query.country) : null;
    const difficulty = req.query.difficulty ? parseInt(req.query.difficulty) : null;
    
    // 골프 코스 조회
    let courses;
    
    if (countryCode) {
      courses = CourseModel.getCoursesByCountry(countryCode);
    } else if (difficulty) {
      courses = CourseModel.getCoursesByDifficulty(difficulty);
    } else {
      courses = CourseModel.getAllCourses();
    }
    
    // 응답 데이터 가공
    const courseData = courses.map(course => ({
      courseId: course.course_id,
      courseName: course.course_name,
      resourceName: course.resource_name,
      courseCount: course.course_count,
      countryCode: course.country_code,
      courseDifficulty: course.course_difficulty,
      greenDifficulty: course.green_difficulty,
      averagePar: course.average_par,
      courseImage: course.course_image,
      releaseDate: course.release_date
    }));
    
    // 응답
    return res.status(200).json({
      status: 'success',
      data: courseData
    });
  } catch (error) {
    console.error('골프 코스 목록 조회 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 특정 골프 코스 상세 정보 조회
 */
const getCourseById = (req, res) => {
  try {
    const { courseId } = req.params;
    
    // 코스 정보 조회
    const course = CourseModel.findCourseById(courseId);
    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: '골프 코스를 찾을 수 없습니다.'
      });
    }
    
    // 코스 상세 정보 조회
    const courseDetails = CourseModel.getCourseDetails(courseId);
    
    // 응답 데이터 가공
    const courseData = {
      courseId: course.course_id,
      courseName: course.course_name,
      resourceName: course.resource_name,
      courseCount: course.course_count,
      countryCode: course.country_code,
      courseDifficulty: course.course_difficulty,
      greenDifficulty: course.green_difficulty,
      description: course.description,
      averagePar: course.average_par,
      courseImage: course.course_image,
      releaseDate: course.release_date,
      courses: courseDetails.map(detail => ({
        courseNumber: detail.course_number,
        courseName: detail.course_name
      }))
    };
    
    // 응답
    return res.status(200).json({
      status: 'success',
      data: courseData
    });
  } catch (error) {
    console.error('골프 코스 상세 정보 조회 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 특정 코스의 홀 정보 조회
 */
const getCourseHoles = (req, res) => {
  try {
    const { courseId, courseNumber } = req.params;
    
    // 코스 존재 확인
    const course = CourseModel.findCourseById(courseId);
    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: '골프 코스를 찾을 수 없습니다.'
      });
    }
    
    // 코스 번호 유효성 확인
    if (courseNumber < 1 || courseNumber > course.course_count) {
      return res.status(400).json({
        status: 'error',
        message: '유효하지 않은 코스 번호입니다.'
      });
    }
    
    // 홀 정보 조회
    const holes = CourseModel.getCourseHoles(courseId, courseNumber);
    
    // 응답 데이터 가공
    const holeData = holes.map(hole => ({
      holeId: hole.hole_id,
      holeNumber: hole.hole_number,
      par: hole.par,
      holeType: hole.hole_type,
      backDistance: hole.back_distance,
      championDistance: hole.champion_distance,
      frontDistance: hole.front_distance,
      seniorDistance: hole.senior_distance,
      ladyDistance: hole.lady_distance,
      holeIndex: hole.hole_index,
      holeImage: hole.hole_image
    }));
    
    // 응답
    return res.status(200).json({
      status: 'success',
      data: {
        courseId: parseInt(courseId),
        courseNumber: parseInt(courseNumber),
        holes: holeData
      }
    });
  } catch (error) {
    console.error('코스 홀 정보 조회 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 새 골프 코스 추가 (관리자 전용)
 */
const createCourse = (req, res) => {
  try {
    const {
      courseName,
      resourceName,
      courseCount,
      countryCode,
      courseDifficulty,
      greenDifficulty,
      description,
      courseImage,
      averagePar,
      releaseDate,
      courses
    } = req.body;
    
    // 필수 필드 검증
    if (!courseName || !courseCount || !countryCode || !courseDifficulty || !greenDifficulty) {
      return res.status(400).json({
        status: 'error',
        message: '코스 이름, 코스 수, 국가 코드, 코스 난이도, 그린 난이도는 필수 입력 항목입니다.'
      });
    }
    
    // 코스 이름 중복 확인
    const existingCourses = CourseModel.findCourseByName(courseName);
    if (existingCourses && existingCourses.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: '이미 존재하는 코스 이름입니다.'
      });
    }
    
    // 골프 코스 데이터 생성
    const courseData = {
      course_name: courseName,
      resource_name: resourceName,
      course_count: courseCount,
      country_code: countryCode,
      course_difficulty: courseDifficulty,
      green_difficulty: greenDifficulty,
      description,
      course_image: courseImage,
      average_par: averagePar || 72,
      release_date: releaseDate
    };
    
    // 코스 생성
    const courseId = CourseModel.createCourse(courseData);
    
    // 코스 상세 정보 추가
    if (courses && Array.isArray(courses)) {
      courses.forEach(course => {
        if (course.courseNumber && course.courseName) {
          CourseModel.addCourseDetail({
            course_id: courseId,
            course_number: course.courseNumber,
            course_name: course.courseName
          });
        }
      });
    }
    
    // 생성된 코스 정보 조회
    const createdCourse = CourseModel.findCourseById(courseId);
    
    // 응답
    return res.status(201).json({
      status: 'success',
      message: '골프 코스가 성공적으로 추가되었습니다.',
      data: {
        courseId: createdCourse.course_id,
        courseName: createdCourse.course_name,
        courseCount: createdCourse.course_count
      }
    });
  } catch (error) {
    console.error('골프 코스 추가 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 홀 정보 추가 (관리자 전용)
 */
const addHole = (req, res) => {
  try {
    const { courseId, courseNumber } = req.params;
    const {
      holeNumber,
      par,
      holeType,
      backDistance,
      championDistance,
      frontDistance,
      seniorDistance,
      ladyDistance,
      holeIndex,
      holeImage
    } = req.body;
    
    // 필수 필드 검증
    if (!holeNumber || !par || !holeType) {
      return res.status(400).json({
        status: 'error',
        message: '홀 번호, 파, 홀 타입은 필수 입력 항목입니다.'
      });
    }
    
    // 코스 존재 확인
    const course = CourseModel.findCourseById(courseId);
    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: '골프 코스를 찾을 수 없습니다.'
      });
    }
    
    // 코스 번호 유효성 확인
    if (courseNumber < 1 || courseNumber > course.course_count) {
      return res.status(400).json({
        status: 'error',
        message: '유효하지 않은 코스 번호입니다.'
      });
    }
    
    // 홀 번호 중복 확인
    const holes = CourseModel.getCourseHoles(courseId, courseNumber);
    const existingHole = holes.find(h => h.hole_number === parseInt(holeNumber));
    if (existingHole) {
      return res.status(409).json({
        status: 'error',
        message: '이미 존재하는 홀 번호입니다.'
      });
    }
    
    // 홀 데이터 생성
    const holeData = {
      course_id: courseId,
      course_number: courseNumber,
      hole_number: holeNumber,
      par,
      hole_type: holeType,
      back_distance: backDistance,
      champion_distance: championDistance,
      front_distance: frontDistance,
      senior_distance: seniorDistance,
      lady_distance: ladyDistance,
      hole_index: holeIndex,
      hole_image: holeImage
    };
    
    // 홀 추가
    const holeId = CourseModel.addHole(holeData);
    
    // 응답
    return res.status(201).json({
      status: 'success',
      message: '홀 정보가 성공적으로 추가되었습니다.',
      data: {
        holeId,
        courseId: parseInt(courseId),
        courseNumber: parseInt(courseNumber),
        holeNumber: parseInt(holeNumber),
        par
      }
    });
  } catch (error) {
    console.error('홀 정보 추가 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 골프 코스 정보 수정 (관리자 전용)
 */
const updateCourse = (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      courseName,
      resourceName,
      courseCount,
      countryCode,
      courseDifficulty,
      greenDifficulty,
      description,
      courseImage,
      averagePar,
      releaseDate,
      courses
    } = req.body;
    
    // 코스 존재 확인
    const course = CourseModel.findCourseById(courseId);
    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: '골프 코스를 찾을 수 없습니다.'
      });
    }
    
    // 필수 필드 검증
    if (!courseName || !courseCount || !countryCode || !courseDifficulty || !greenDifficulty) {
      return res.status(400).json({
        status: 'error',
        message: '코스 이름, 코스 수, 국가 코드, 코스 난이도, 그린 난이도는 필수 입력 항목입니다.'
      });
    }
    
    // 이름 중복 확인 (자기 자신은 제외)
    const existingCourses = CourseModel.findCourseByName(courseName);
    if (existingCourses && existingCourses.length > 0) {
      const duplicateCourse = existingCourses.find(c => c.course_id !== parseInt(courseId));
      if (duplicateCourse) {
        return res.status(409).json({
          status: 'error',
          message: '이미 존재하는 코스 이름입니다.'
        });
      }
    }
    
    // 코스 정보 업데이트
    const courseData = {
      course_name: courseName,
      resource_name: resourceName,
      course_count: courseCount,
      country_code: countryCode,
      course_difficulty: courseDifficulty,
      green_difficulty: greenDifficulty,
      description,
      course_image: courseImage,
      average_par: averagePar || 72,
      release_date: releaseDate
    };
    
    const updated = CourseModel.updateCourse(courseId, courseData);
    if (!updated) {
      return res.status(500).json({
        status: 'error',
        message: '코스 정보 업데이트 중 오류가 발생했습니다.'
      });
    }
    
    // 코스 상세 정보 업데이트 (기존 상세 정보를 모두 삭제하고 다시 추가)
    if (courses && Array.isArray(courses)) {
      // 기존 코스 상세 정보 조회
      const existingDetails = CourseModel.getCourseDetails(courseId);
      
      // 새로운 코스 상세 정보 추가 또는 업데이트
      courses.forEach(course => {
        if (course.courseNumber && course.courseName) {
          const existingDetail = existingDetails.find(d => d.course_number === course.courseNumber);
          
          if (existingDetail) {
            // 기존 상세 정보 업데이트
            CourseModel.updateCourseDetail(existingDetail.detail_id, {
              course_name: course.courseName
            });
          } else {
            // 새 상세 정보 추가
            CourseModel.addCourseDetail({
              course_id: courseId,
              course_number: course.courseNumber,
              course_name: course.courseName
            });
          }
        }
      });
    }
    
    // 응답
    return res.status(200).json({
      status: 'success',
      message: '골프 코스 정보가 성공적으로 업데이트되었습니다.',
      data: {
        courseId: parseInt(courseId),
        courseName,
        courseCount
      }
    });
  } catch (error) {
    console.error('골프 코스 정보 업데이트 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 홀 정보 수정 (관리자 전용)
 */
const updateHole = (req, res) => {
  try {
    const { courseId, courseNumber, holeId } = req.params;
    const {
      par,
      holeType,
      backDistance,
      championDistance,
      frontDistance,
      seniorDistance,
      ladyDistance,
      holeIndex,
      holeImage
    } = req.body;
    
    // 코스 존재 확인
    const course = CourseModel.findCourseById(courseId);
    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: '골프 코스를 찾을 수 없습니다.'
      });
    }
    
    // 필수 필드 검증
    if (!par || !holeType) {
      return res.status(400).json({
        status: 'error',
        message: '파, 홀 타입은 필수 입력 항목입니다.'
      });
    }
    
    // 홀 데이터 업데이트
    const holeData = {
      par,
      hole_type: holeType,
      back_distance: backDistance,
      champion_distance: championDistance,
      front_distance: frontDistance,
      senior_distance: seniorDistance,
      lady_distance: ladyDistance,
      hole_index: holeIndex,
      hole_image: holeImage
    };
    
    const updated = CourseModel.updateHole(holeId, holeData);
    if (!updated) {
      return res.status(404).json({
        status: 'error',
        message: '홀 정보를 찾을 수 없거나 업데이트할 수 없습니다.'
      });
    }
    
    // 응답
    return res.status(200).json({
      status: 'success',
      message: '홀 정보가 성공적으로 업데이트되었습니다.',
      data: {
        holeId: parseInt(holeId),
        courseId: parseInt(courseId),
        courseNumber: parseInt(courseNumber),
        par
      }
    });
  } catch (error) {
    console.error('홀 정보 업데이트 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 골프 코스 삭제 (관리자 전용)
 */
const deleteCourse = (req, res) => {
  try {
    const { courseId } = req.params;
    
    // 코스 존재 확인
    const course = CourseModel.findCourseById(courseId);
    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: '골프 코스를 찾을 수 없습니다.'
      });
    }
    
    // 코스 삭제 (연결된 모든 상세 정보 및 홀 삭제)
    const deleted = CourseModel.deleteCourse(courseId);
    if (!deleted) {
      return res.status(500).json({
        status: 'error',
        message: '코스 삭제 중 오류가 발생했습니다.'
      });
    }
    
    // 응답
    return res.status(200).json({
      status: 'success',
      message: '골프 코스가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('골프 코스 삭제 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 홀 정보 삭제 (관리자 전용)
 */
const deleteHole = (req, res) => {
  try {
    const { courseId, courseNumber, holeId } = req.params;
    
    // 코스 존재 확인
    const course = CourseModel.findCourseById(courseId);
    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: '골프 코스를 찾을 수 없습니다.'
      });
    }
    
    // 홀 정보 삭제
    const deleted = CourseModel.deleteHole(holeId);
    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        message: '홀 정보를 찾을 수 없거나 삭제할 수 없습니다.'
      });
    }
    
    // 응답
    return res.status(200).json({
      status: 'success',
      message: '홀 정보가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('홀 정보 삭제 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  getCourseHoles,
  createCourse,
  addHole,
  updateCourse,
  updateHole,
  deleteCourse,
  deleteHole
}; 