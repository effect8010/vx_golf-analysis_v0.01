/**
 * 사용자 라우터
 * 사용자 프로필 관리 등 사용자 관련 라우트를 처리합니다.
 */
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, isAdmin } = require('../middlewares/auth');

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 특정 사용자 프로필 조회
router.get('/:userId', userController.getUserProfile);

// 사용자 프로필 업데이트
router.put('/:userId', userController.updateUserProfile);

// 비밀번호 변경
router.put('/:userId/password', userController.changePassword);

// 모든 사용자 목록 조회 (관리자 전용)
router.get('/', isAdmin, userController.getAllUsers);

module.exports = router; 