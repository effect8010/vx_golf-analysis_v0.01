/**
 * 인증 라우터
 * 로그인, 회원가입 등 인증 관련 라우트를 처리합니다.
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');

// 회원가입
router.post('/register', authController.register);

// 로그인
router.post('/login', authController.login);

// 내 정보 조회 (인증 필요)
router.get('/me', authenticateToken, authController.me);

module.exports = router; 