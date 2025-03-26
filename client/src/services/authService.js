import axios from 'axios';
import { DATA_BASE_URL } from '../config';

// 로컬 스토리지에서 토큰 가져오기
export const getToken = () => {
  return localStorage.getItem('token');
};

// 요청 헤더 설정
export const authHeader = () => {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// 로그인
export const login = async (username, password) => {
  try {
    console.log('로그인 요청 데이터:', { username, password });
    
    // 정적 사용자 데이터 로드
    const response = await axios.get(`${DATA_BASE_URL}/users.json`);
    const users = response.data.users;
    
    // 사용자 인증
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      // 토큰 생성 (실제 JWT 대신 간단한 인코딩 사용)
      const token = btoa(JSON.stringify({ id: user.id, username: user.username }));
      const userData = { ...user, token };
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { data: userData };
    } else {
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    console.error('로그인 에러:', error);
    throw error;
  }
};

// 회원가입 (정적 데이터 환경에서는 지원되지 않음)
export const register = async (userData) => {
  throw new Error('Registration is not supported in static data mode');
};

// 로그아웃
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// 현재 사용자 정보 가져오기
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// 비밀번호 변경 (정적 데이터 환경에서는 지원되지 않음)
export const changePassword = async (oldPassword, newPassword) => {
  throw new Error('Password change is not supported in static data mode');
};

// 비밀번호 재설정 요청 (정적 데이터 환경에서는 지원되지 않음)
export const resetPasswordRequest = async (email) => {
  throw new Error('Password reset is not supported in static data mode');
};

// 비밀번호 재설정 (정적 데이터 환경에서는 지원되지 않음)
export const resetPassword = async (token, newPassword) => {
  throw new Error('Password reset is not supported in static data mode');
}; 