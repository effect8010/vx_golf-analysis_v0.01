/**
 * 통계 라우터
 * 골프 통계 관련 라우트를 처리합니다.
 */
const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middlewares/auth');

// 통계 컨트롤러 임포트
const statsController = require('../controllers/statsController');

// 로깅 추가
console.log('스탯 라우터 로딩 중...');
console.log('사용 가능한 스탯 컨트롤러 함수:', Object.keys(statsController));

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateJWT);

// 현재 로그인한 사용자 종합 통계 조회
router.get('/users/me', statsController.getUserStats);

// 사용자의 종합 통계 조회
router.get('/users/:userId', statsController.getUserStats);

// 현재 로그인한 사용자의 트렌드 통계 조회
router.get('/user-me/trends/:period/:count', statsController.getUserTrendStats);

// 사용자의 클럽별 통계 조회
router.get('/users/:userId/clubs', statsController.getUserClubStats);

// 사용자의 퍼팅 통계 조회
router.get('/users/:userId/putting', statsController.getUserPuttingStats);

// 사용자의 트렌드 통계 조회
router.get('/users/:userId/trends/:period/:count', statsController.getUserTrendStats);

// 사용자의 코스별 통계 조회
router.get('/users/:userId/courses', statsController.getUserCourseStats);

// 사용자의 동반자 비교 통계 조회
router.get('/users/:userId/comparisons', statsController.getUserComparisonStats);

// 특정 코스의 홀별 난이도 통계 조회
router.get('/courses/:courseId/difficulty', statsController.getCourseDifficultyStats);

// 파트너 통계 조회
router.get('/users/me/partner-stats', statsController.getUserComparisonStats);

console.log('스탯 라우터 로딩 완료');

module.exports = router; 