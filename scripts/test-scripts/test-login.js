/**
 * 로그인 테스트 스크립트
 */
const axios = require('axios');

// 로그인 테스트 함수
async function testLogin() {
  try {
    console.log('로그인 요청을 보냅니다...');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'kim',
      password: 'password123'
    });
    
    console.log('로그인 응답:', response.data);
    console.log('로그인 성공!');
    console.log('토큰:', response.data.data.token);
  } catch (error) {
    console.error('로그인 실패:', error.message);
    
    if (error.response) {
      console.error('서버 응답:', error.response.data);
      console.error('상태 코드:', error.response.status);
    } else if (error.request) {
      console.error('요청이 이루어졌으나 응답을 받지 못했습니다');
      console.error(error.request);
    } else {
      console.error('요청 구성 중 오류 발생:', error.message);
    }
  }
}

// 로그인 테스트 실행
testLogin(); 