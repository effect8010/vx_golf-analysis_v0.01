/**
 * 샷 라우터
 * 샷 데이터 관련 라우트를 처리합니다.
 */
const express = require('express');
const router = express.Router();
const shotController = require('../controllers/shotController');
const { authenticateToken, isAdmin } = require('../middlewares/auth');

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 라운드의 모든 샷 조회
router.get('/rounds/:roundId', shotController.getRoundShots);

// 라운드의 특정 홀 샷 조회
router.get('/rounds/:roundId/courses/:courseNumber/holes/:holeNumber', shotController.getHoleShots);

// 사용자의 최근 샷 목록 조회
router.get('/users/:userId/recent', shotController.getUserRecentShots);

// 사용자의 클럽별 샷 통계 조회
router.get('/users/:userId/clubs/:club/stats', shotController.getUserClubStats);

// 새 샷 정보 생성
router.post('/', shotController.createShot);

// 샷 정보 업데이트
router.put('/:shotId', shotController.updateShot);

// 샷 정보 삭제
router.delete('/:shotId', shotController.deleteShot);

module.exports = router; 