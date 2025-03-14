/**
 * 라운드 라우터
 * 라운드 정보 관련 라우트를 처리합니다.
 */
const express = require('express');
const router = express.Router();
const roundController = require('../controllers/roundController');
const { authenticateJWT } = require('../middlewares/auth');

// 로깅 추가
console.log('라운드 라우터 로딩 중...');
console.log('사용 가능한 라운드 컨트롤러 함수:', Object.keys(roundController));

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateJWT);

// 사용자의 모든 라운드 조회
router.get('/', roundController.getUserRounds);

// 최근 라운드 기록 조회 - 이 부분 확인
console.log('history 엔드포인트 등록');
router.get('/history', roundController.getRoundHistory);

// 특정 라운드 상세 정보 조회
router.get('/:roundId', roundController.getRoundById);

// 새 라운드 정보 생성
router.post('/', roundController.createRound);

// 라운드 정보 업데이트
router.put('/:roundId', roundController.updateRound);

// 홀별 결과 업데이트
router.put('/:roundId/holes/:holeId', roundController.updateRoundHole);

// 라운드 삭제
router.delete('/:roundId', roundController.deleteRound);

console.log('라운드 라우터 로딩 완료');

module.exports = router; 