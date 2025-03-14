const http = require('http');

console.log('간단한 로그인 테스트 시작');

// 로그인 요청 데이터
const data = JSON.stringify({
  username: 'kim',
  password: 'password123'
});

// 요청 옵션
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

// 요청 객체 생성
const req = http.request(options, (res) => {
  console.log(`상태 코드: ${res.statusCode}`);
  
  let responseData = '';
  
  // 응답 데이터 수신
  res.on('data', (chunk) => {
    responseData += chunk;
    console.log('데이터 청크 수신:', chunk.toString());
  });
  
  // 응답 완료
  res.on('end', () => {
    console.log('응답 수신 완료');
    console.log('전체 응답 데이터:', responseData);
    
    try {
      if (responseData) {
        const parsedData = JSON.parse(responseData);
        console.log('파싱된 응답 데이터:', parsedData);
        
        if (parsedData.status === 'success' && parsedData.data && parsedData.data.token) {
          console.log('로그인 성공!');
          console.log('토큰:', parsedData.data.token);
        }
      }
    } catch (e) {
      console.error('응답 파싱 중 오류 발생:', e);
    }
  });
});

// 요청 오류 처리
req.on('error', (e) => {
  console.error('요청 중 오류 발생:', e.message);
  console.error('상세 오류:', e);
});

// 타임아웃 설정
req.setTimeout(10000, () => {
  console.error('요청 타임아웃: 서버가 10초 내에 응답하지 않음');
  req.destroy();
});

console.log('요청 데이터 전송 중...');
// 요청 데이터 전송
req.write(data);
req.end();

console.log('요청이 전송되었습니다. 응답 대기 중...'); 