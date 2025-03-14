const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const db = require('./models/db');
const logger = require('./utils/logger');
const path = require('path');
require('dotenv').config();

// 환경 변수 설정
const PORT = process.env.PORT || 5000;

// Express 앱 생성
const app = express();

// 미들웨어 설정
app.use(helmet()); // 보안 헤더 설정
app.use(cors());   // CORS 설정
app.use(express.json()); // JSON 요청 본문 파싱
app.use(express.urlencoded({ extended: true })); // URL 인코딩된 요청 본문 파싱

// 정적 파일 제공
app.use(express.static(path.join(__dirname, '../client/build')));

// 데이터베이스 초기화
(async () => {
  try {
    await db.init();
    logger.info('데이터베이스 연결 성공');
  } catch (error) {
    logger.error(`데이터베이스 연결 실패: ${error.message}`);
    process.exit(1);
  }
})();

// 라우트 설정
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/rounds', require('./routes/roundRoutes'));
app.use('/api/shots', require('./routes/shotRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));

// 기본 라우트 - API 상태 확인
app.get('/api/status', (req, res) => {
  res.json({ status: 'online', message: '서버가 정상적으로 실행 중입니다.' });
});

// React 앱으로 모든 요청 처리 (클라이언트 라우팅)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// 오류 처리 미들웨어
app.use((err, req, res, next) => {
  logger.error(`오류 발생: ${err.message}`);
  res.status(500).json({ error: '서버 오류가 발생했습니다.' });
});

// 서버 시작
const server = app.listen(PORT, () => {
  logger.info(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});

// 종료 시 정리
process.on('SIGINT', () => {
  logger.info('서버를 종료합니다...');
  server.close(() => {
    logger.info('서버가 정상적으로 종료되었습니다.');
    process.exit(0);
  });
});

module.exports = app; 