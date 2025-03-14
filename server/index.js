/**
 * 골프 시뮬레이터 라운드 분석 서비스 - 백엔드 서버
 * @version 0.3.0
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const fs = require('fs');

// 로그 디렉토리 생성
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 로그 파일 스트림 생성
const accessLogStream = fs.createWriteStream(
  path.join(logDir, 'access.log'),
  { flags: 'a' }
);

// 라우터 가져오기
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const roundRoutes = require('./routes/roundRoutes');
const shotRoutes = require('./routes/shotRoutes');
const statsRoutes = require('./routes/statsRoutes');

// 서버 설정
const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 로깅 미들웨어
if (process.env.NODE_ENV === 'production') {
  // 프로덕션 환경에서는 로그 파일에 기록
  app.use(morgan('combined', { stream: accessLogStream }));
} else {
  // 개발 환경에서는 콘솔에 출력
  app.use(morgan('dev'));
}

// API 라우트 설정
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/rounds', roundRoutes);
app.use('/api/shots', shotRoutes);
app.use('/api/stats', statsRoutes);

// 정적 파일 제공 (클라이언트 빌드 파일)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// 헬스 체크 라우트
app.get('/api/health', (req, res) => {
  const serverInfo = {
    status: 'success',
    message: '서버가 정상 작동 중입니다.',
    timestamp: new Date().toISOString(),
    version: '0.3.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime() + '초'
  };
  
  res.status(200).json(serverInfo);
});

// 404 오류 처리 미들웨어
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: '요청한 리소스를 찾을 수 없습니다.',
    path: req.originalUrl
  });
});

// 500 오류 처리 미들웨어
app.use((err, req, res, next) => {
  // 오류 로깅
  console.error('서버 오류:', err);
  
  // 클라이언트에 오류 응답
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || '서버 오류가 발생했습니다.',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log('===============================================');
  console.log(`🏌️ 골프 시뮬레이터 분석 서버가 시작되었습니다`);
  console.log(`🌐 서버 주소: http://localhost:${PORT}`);
  console.log(`🛠️ 서버 환경: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔄 서버 버전: 0.3.0`);
  console.log(`📅 시작 시간: ${new Date().toLocaleString()}`);
  console.log('===============================================');
});

// 프로세스 종료 처리
process.on('SIGINT', () => {
  console.log('서버를 종료합니다...');
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  console.error('처리되지 않은 예외:', err);
  // 심각한 오류인 경우 서버를 재시작하는 것이 좋음
  // 실제 프로덕션 환경에서는 PM2 같은 프로세스 관리자 사용 권장
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('처리되지 않은 Promise 거부:', reason);
});

module.exports = app; 