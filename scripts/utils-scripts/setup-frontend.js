const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 골프 시뮬레이터 분석 서비스 프론트엔드 설정을 시작합니다...');

// 필요한 디렉토리 생성
const directories = [
  'client/src/components/Layout',
  'client/src/components/Common',
  'client/src/components/Dashboard',
  'client/src/components/Stats',
  'client/src/components/Rounds',
  'client/src/components/Courses',
  'client/src/pages/Auth',
  'client/src/pages/Dashboard',
  'client/src/pages/Profile',
  'client/src/pages/Rounds',
  'client/src/pages/Courses',
  'client/src/pages/Stats',
  'client/src/pages/NotFound',
  'client/src/services',
  'client/src/utils',
  'client/src/assets/images',
  'client/public/static/images',
];

directories.forEach((dir) => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`📁 디렉토리 생성: ${dir}`);
  }
});

// 기본 이미지 파일 생성
const defaultImageFile = path.join(__dirname, '..', 'client/public/static/images/avatar');
if (!fs.existsSync(defaultImageFile)) {
  fs.mkdirSync(defaultImageFile, { recursive: true });
  console.log('📁 디렉토리 생성: client/public/static/images/avatar');
}

// 패키지 설치 (React, MUI, 차트 라이브러리 등)
try {
  console.log('📦 클라이언트 패키지 설치 중...');
  execSync('cd client && npm install', { stdio: 'inherit' });
  console.log('✅ 클라이언트 패키지 설치 완료!');
} catch (error) {
  console.error('❌ 패키지 설치 중 오류가 발생했습니다:', error.message);
  process.exit(1);
}

console.log('\n✨ 프론트엔드 설정이 완료되었습니다!');
console.log('🏌️‍♂️ 다음 명령어로 개발 서버를 시작하세요:');
console.log('  npm run dev'); 