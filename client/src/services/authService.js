import axios from 'axios';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/auth`;

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
    const response = await axios.post(`${API_URL}/login`, { username, password });
    console.log('로그인 응답:', response.data);
    if (response.data.data && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  } catch (error) {
    console.error('로그인 에러:', error);
    throw error.response?.data || error;
  }
};

// 회원가입
export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// 로그아웃
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// 현재 사용자 정보 가져오기
export const getCurrentUser = async () => {
  try {
    // 로컬 스토리지에서 사용자 정보 확인
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    
    // API에서 사용자 정보 조회
    const response = await axios.get(`${API_URL}/me`, { headers: authHeader() });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// 비밀번호 변경
export const changePassword = async (oldPassword, newPassword) => {
  try {
    const response = await axios.post(
      `${API_URL}/change-password`,
      { oldPassword, newPassword },
      { headers: authHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// 비밀번호 재설정 요청 (이메일 전송)
export const resetPasswordRequest = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/reset-password-request`, { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// 비밀번호 재설정
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await axios.post(`${API_URL}/reset-password`, { token, newPassword });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}; 