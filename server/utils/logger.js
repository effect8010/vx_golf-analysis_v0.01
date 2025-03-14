const fs = require('fs');
const path = require('path');

// 로그 디렉토리 경로
const LOG_DIR = path.join(__dirname, '../../logs');

// 로그 디렉토리 확인 및 생성
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// 타임스탬프 형식 생성 함수
const getTimestamp = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
};

// 로그 파일에 기록하는 함수
const writeToLogFile = (level, message) => {
  const timestamp = getTimestamp();
  const logFileName = `${new Date().toISOString().split('T')[0]}.log`;
  const logFilePath = path.join(LOG_DIR, logFileName);
  const logEntry = `[${timestamp}] [${level}] ${message}\n`;
  
  fs.appendFileSync(logFilePath, logEntry);
};

// 로그 레벨별 함수
const logger = {
  info: (message) => {
    console.log(`[INFO] ${message}`);
    writeToLogFile('INFO', message);
  },
  
  warn: (message) => {
    console.warn(`[WARN] ${message}`);
    writeToLogFile('WARN', message);
  },
  
  error: (message) => {
    console.error(`[ERROR] ${message}`);
    writeToLogFile('ERROR', message);
  },
  
  debug: (message) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`);
      writeToLogFile('DEBUG', message);
    }
  }
};

module.exports = logger; 