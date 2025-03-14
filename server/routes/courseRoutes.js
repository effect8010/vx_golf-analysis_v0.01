/**
 * 골프 코스 라우터
 * 골프 코스 관련 라우트를 처리합니다.
 */
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticateToken, isAdmin } = require('../middlewares/auth');

// 모든 골프 코스 목록 조회
router.get('/', courseController.getAllCourses);

// 특정 골프 코스 상세 정보 조회
router.get('/:courseId', courseController.getCourseById);

// 특정 코스의 홀 정보 조회
router.get('/:courseId/courses/:courseNumber/holes', courseController.getCourseHoles);

// 새 골프 코스 추가 (관리자 전용)
router.post('/', authenticateToken, isAdmin, courseController.createCourse);

// 홀 정보 추가 (관리자 전용)
router.post('/:courseId/courses/:courseNumber/holes', authenticateToken, isAdmin, courseController.addHole);

// 골프 코스 정보 수정 (관리자 전용)
router.put('/:courseId', authenticateToken, isAdmin, courseController.updateCourse);

// 홀 정보 수정 (관리자 전용)
router.put('/:courseId/courses/:courseNumber/holes/:holeId', authenticateToken, isAdmin, courseController.updateHole);

// 골프 코스 삭제 (관리자 전용)
router.delete('/:courseId', authenticateToken, isAdmin, courseController.deleteCourse);

// 홀 정보 삭제 (관리자 전용)
router.delete('/:courseId/courses/:courseNumber/holes/:holeId', authenticateToken, isAdmin, courseController.deleteHole);

module.exports = router; 