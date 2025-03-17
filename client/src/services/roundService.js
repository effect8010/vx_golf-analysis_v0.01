import axios from 'axios';
import { authHeader } from './authService';
import { API_BASE_URL, APP_CONFIG } from '../config';

const API_URL = `${API_BASE_URL}/api/rounds`;

// 로컬 캐시 관리
const roundCache = {
  data: {},
  timestamp: {},
  cacheDuration: APP_CONFIG.cacheExpiry, // config에서 설정 가져오기
  
  // 캐시에 데이터 저장
  set(key, data) {
    this.data[key] = data;
    this.timestamp[key] = Date.now();
    return data;
  },
  
  // 캐시에서 데이터 가져오기
  get(key) {
    const now = Date.now();
    const timestamp = this.timestamp[key] || 0;
    
    if (this.data[key] && (now - timestamp < this.cacheDuration)) {
      console.log(`[캐시 히트] ${key}`);
      return this.data[key];
    }
    
    return null;
  },
  
  // 캐시 무효화
  invalidate(keyPattern) {
    const regex = new RegExp(keyPattern);
    
    Object.keys(this.data).forEach(key => {
      if (regex.test(key)) {
        delete this.data[key];
        delete this.timestamp[key];
      }
    });
  }
};

// 라운드 목록 조회
export const getRounds = async (options = {}, forceRefresh = false) => {
  try {
    const { limit, offset, sortBy, sortOrder, courseId } = options;
    
    // 쿼리 파라미터 구성
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit);
    if (offset) params.append('offset', offset);
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);
    if (courseId) params.append('courseId', courseId);
    
    const queryString = params.toString();
    const cacheKey = `rounds_${queryString || 'default'}`;
    
    // 캐시 확인
    if (!forceRefresh) {
      const cachedData = roundCache.get(cacheKey);
      if (cachedData) return cachedData;
    }
    
    // API 호출
    const url = `${API_URL}${queryString ? `?${queryString}` : ''}`;
    const response = await axios.get(url, { headers: authHeader() });
    
    // 캐시에 저장
    return roundCache.set(cacheKey, response.data);
  } catch (error) {
    throw error.response?.data || error;
  }
};

// 특정 라운드 조회
export const getRound = async (roundId, forceRefresh = false) => {
  try {
    const cacheKey = `round_${roundId}`;
    
    // 캐시 확인
    if (!forceRefresh) {
      const cachedData = roundCache.get(cacheKey);
      if (cachedData) return cachedData;
    }
    
    // API 호출
    const response = await axios.get(`${API_URL}/${roundId}`, { headers: authHeader() });
    
    // 캐시에 저장
    return roundCache.set(cacheKey, response.data);
  } catch (error) {
    throw error.response?.data || error;
  }
};

// 최근 라운드 기록 조회
export const getRoundHistory = async (limit = 10, forceRefresh = false) => {
  try {
    const cacheKey = `round_history_${limit}`;
    
    // 캐시 확인
    if (!forceRefresh) {
      const cachedData = roundCache.get(cacheKey);
      if (cachedData) return cachedData;
    }
    
    // API 호출
    const response = await axios.get(`${API_URL}/history?limit=${limit}`, { headers: authHeader() });
    
    // 캐시에 저장
    return roundCache.set(cacheKey, response.data);
  } catch (error) {
    throw error.response?.data || error;
  }
};

// 라운드 생성
export const createRound = async (roundData) => {
  try {
    const response = await axios.post(API_URL, roundData, { headers: authHeader() });
    
    // 라운드 관련 캐시 무효화
    roundCache.invalidate('rounds_');
    roundCache.invalidate('round_history_');
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// 라운드 수정
export const updateRound = async (roundId, roundData) => {
  try {
    const response = await axios.put(`${API_URL}/${roundId}`, roundData, { headers: authHeader() });
    
    // 관련 캐시 무효화
    roundCache.invalidate(`round_${roundId}`);
    roundCache.invalidate('rounds_');
    roundCache.invalidate('round_history_');
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// 라운드 삭제
export const deleteRound = async (roundId) => {
  try {
    const response = await axios.delete(`${API_URL}/${roundId}`, { headers: authHeader() });
    
    // 관련 캐시 무효화
    roundCache.invalidate(`round_${roundId}`);
    roundCache.invalidate('rounds_');
    roundCache.invalidate('round_history_');
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}; 