import axios from 'axios';
import { authHeader } from './authService';
import { API_BASE_URL, APP_CONFIG } from '../config';

const API_URL = `${API_BASE_URL}/api/stats`;

// 캐시 관리를 위한 객체
const statsCache = {
  data: {},
  timestamp: {},
  cacheDuration: APP_CONFIG.cacheExpiry, // config에서 설정 가져오기
  
  // 캐시에 데이터 저장
  set(key, data) {
    this.data[key] = data;
    this.timestamp[key] = Date.now();
    
    // 로컬 스토리지에도 저장
    try {
      localStorage.setItem(`stats_cache_${key}`, JSON.stringify(data));
      localStorage.setItem(`stats_cache_${key}_timestamp`, Date.now().toString());
    } catch (error) {
      console.warn('로컬 스토리지에 캐시 저장 실패:', error);
    }
    
    return data;
  },
  
  // 캐시에서 데이터 가져오기
  get(key) {
    const now = Date.now();
    const timestamp = this.timestamp[key] || 0;
    
    // 메모리 캐시 확인
    if (this.data[key] && (now - timestamp < this.cacheDuration)) {
      console.log(`[캐시 히트] ${key}`);
      return this.data[key];
    }
    
    // 로컬 스토리지 확인
    try {
      const storedData = localStorage.getItem(`stats_cache_${key}`);
      const storedTimestamp = localStorage.getItem(`stats_cache_${key}_timestamp`);
      
      if (storedData && storedTimestamp && (now - parseInt(storedTimestamp) < this.cacheDuration)) {
        const parsedData = JSON.parse(storedData);
        this.data[key] = parsedData;
        this.timestamp[key] = parseInt(storedTimestamp);
        console.log(`[스토리지 캐시 히트] ${key}`);
        return parsedData;
      }
    } catch (error) {
      console.warn('로컬 스토리지에서 캐시 읽기 실패:', error);
    }
    
    return null;
  },
  
  // 캐시 무효화
  invalidate(keyPattern) {
    const regex = new RegExp(keyPattern);
    
    // 메모리 캐시 삭제
    Object.keys(this.data).forEach(key => {
      if (regex.test(key)) {
        delete this.data[key];
        delete this.timestamp[key];
      }
    });
    
    // 로컬 스토리지 캐시 삭제
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('stats_cache_') && regex.test(key)) {
          localStorage.removeItem(key);
          localStorage.removeItem(`${key}_timestamp`);
        }
      }
    } catch (error) {
      console.warn('로컬 스토리지에서 캐시 삭제 실패:', error);
    }
  }
};

// 사용자 전체 통계 조회
export const getUserStats = async (userId, forceRefresh = false) => {
  try {
    const cacheKey = `user_stats_${userId || 'me'}`;
    
    // 캐시 확인 (forceRefresh가 true가 아닌 경우에만)
    if (!forceRefresh) {
      const cachedData = statsCache.get(cacheKey);
      if (cachedData) return cachedData;
    }
    
    // API 호출
    const url = userId ? `${API_URL}/users/${userId}` : `${API_URL}/users/me`;
    const response = await axios.get(url, { headers: authHeader() });
    
    // 캐시에 저장
    return statsCache.set(cacheKey, response.data);
  } catch (error) {
    throw error.response?.data || error;
  }
};

// 클럽별 통계 조회
export const getUserClubStats = async (userId, clubType = null, forceRefresh = false) => {
  try {
    const cacheKey = `user_club_stats_${userId || 'me'}_${clubType || 'all'}`;
    
    // 캐시 확인
    if (!forceRefresh) {
      const cachedData = statsCache.get(cacheKey);
      if (cachedData) return cachedData;
    }
    
    // API 호출
    let url = userId ? `${API_URL}/users/${userId}/clubs` : `${API_URL}/users/me/clubs`;
    if (clubType) {
      url += `/${clubType}`;
    }
    const response = await axios.get(url, { headers: authHeader() });
    
    // 캐시에 저장
    return statsCache.set(cacheKey, response.data);
  } catch (error) {
    throw error.response?.data || error;
  }
};

// 퍼팅 통계 조회
export const getUserPuttingStats = async (userId, forceRefresh = false) => {
  try {
    const cacheKey = `user_putting_stats_${userId || 'me'}`;
    
    // 캐시 확인
    if (!forceRefresh) {
      const cachedData = statsCache.get(cacheKey);
      if (cachedData) return cachedData;
    }
    
    // API 호출
    const url = userId ? `${API_URL}/users/${userId}/putting` : `${API_URL}/users/me/putting`;
    const response = await axios.get(url, { headers: authHeader() });
    
    // 캐시에 저장
    return statsCache.set(cacheKey, response.data);
  } catch (error) {
    throw error.response?.data || error;
  }
};

// 기간별 성적 추이 통계 조회
export const getUserTrendStats = async (userId, period = 'month', count = 6, forceRefresh = false) => {
  try {
    const cacheKey = `user_trend_stats_${userId || 'me'}_${period}_${count}`;
    
    // 캐시 확인
    if (!forceRefresh) {
      const cachedData = statsCache.get(cacheKey);
      if (cachedData) return cachedData;
    }
    
    // API 호출
    const url = userId 
      ? `${API_URL}/users/${userId}/trends/${period}/${count}` 
      : `${API_URL}/users/me/trends/${period}/${count}`;
    const response = await axios.get(url, { headers: authHeader() });
    
    // 캐시에 저장
    return statsCache.set(cacheKey, response.data);
  } catch (error) {
    throw error.response?.data || error;
  }
};

// 코스별 통계 조회
export const getUserCourseStats = async (userId, courseId = null, forceRefresh = false) => {
  try {
    const cacheKey = `user_course_stats_${userId || 'me'}_${courseId || 'all'}`;
    
    // 캐시 확인
    if (!forceRefresh) {
      const cachedData = statsCache.get(cacheKey);
      if (cachedData) return cachedData;
    }
    
    // API 호출
    let url = userId ? `${API_URL}/users/${userId}/courses` : `${API_URL}/users/me/courses`;
    if (courseId) {
      url += `/${courseId}`;
    }
    const response = await axios.get(url, { headers: authHeader() });
    
    // 캐시에 저장
    return statsCache.set(cacheKey, response.data);
  } catch (error) {
    throw error.response?.data || error;
  }
};

// 상대방과의 비교 통계 조회
export const getUserComparisonStats = async (userId, opponentId = null, forceRefresh = false) => {
  try {
    const cacheKey = `user_comparison_stats_${userId || 'me'}_${opponentId || 'all'}`;
    
    // 캐시 확인
    if (!forceRefresh) {
      const cachedData = statsCache.get(cacheKey);
      if (cachedData) return cachedData;
    }
    
    // API 호출
    let url = userId ? `${API_URL}/users/${userId}/compare` : `${API_URL}/users/me/compare`;
    if (opponentId) {
      url += `/${opponentId}`;
    }
    const response = await axios.get(url, { headers: authHeader() });
    
    // 캐시에 저장
    return statsCache.set(cacheKey, response.data);
  } catch (error) {
    throw error.response?.data || error;
  }
};

// 코스 홀별 난이도 통계 조회
export const getCourseDifficultyStats = async (courseId, forceRefresh = false) => {
  try {
    const cacheKey = `course_difficulty_stats_${courseId}`;
    
    // 캐시 확인
    if (!forceRefresh) {
      const cachedData = statsCache.get(cacheKey);
      if (cachedData) return cachedData;
    }
    
    // API 호출
    const url = `${API_URL}/courses/${courseId}/difficulty`;
    const response = await axios.get(url, { headers: authHeader() });
    
    // 캐시에 저장
    return statsCache.set(cacheKey, response.data);
  } catch (error) {
    throw error.response?.data || error;
  }
};

// 통계 데이터 재계산 (관리자 전용)
export const recalculateUserStats = async (userId) => {
  try {
    const url = userId ? `${API_URL}/recalculate/${userId}` : `${API_URL}/recalculate`;
    const response = await axios.post(url, {}, { headers: authHeader() });
    
    // 관련 캐시 무효화
    statsCache.invalidate(`user_.*_${userId || 'me'}`);
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// 모든 통계 캐시 새로고침
export const refreshAllStats = async (userId) => {
  try {
    await getUserStats(userId, true);
    await getUserClubStats(userId, null, true);
    await getUserPuttingStats(userId, true);
    await getUserTrendStats(userId, 'month', 6, true);
    await getUserCourseStats(userId, null, true);
    
    return { status: 'success', message: '모든 통계 데이터가 새로고침되었습니다.' };
  } catch (error) {
    throw error;
  }
};

/**
 * 클럽별 통계 가져오기
 * @param {number} userId - 사용자 ID (미지정 시 현재 로그인한 사용자)
 * @param {string} clubType - 클럽 타입 (전체는 미지정)
 * @returns {Promise<object>} 클럽 통계 데이터
 */
export const getClubStats = async (userId, clubType) => {
  const endpoint = userId 
    ? `/api/stats/users/${userId}/clubs${clubType ? `/${clubType}` : ''}` 
    : `/api/stats/me/clubs${clubType ? `/${clubType}` : ''}`;
  
  const response = await axios.get(endpoint);
  return response.data.data;
};

/**
 * 퍼팅 통계 가져오기
 * @param {number} userId - 사용자 ID (미지정 시 현재 로그인한 사용자)
 * @returns {Promise<object>} 퍼팅 통계 데이터
 */
export const getPuttingStats = async (userId) => {
  const endpoint = userId 
    ? `/api/stats/users/${userId}/putting` 
    : '/api/stats/me/putting';
  
  const response = await axios.get(endpoint);
  return response.data.data;
};

/**
 * 코스별 통계 가져오기
 * @param {number} userId - 사용자 ID (미지정 시 현재 로그인한 사용자)
 * @param {number} courseId - 코스 ID (전체는 미지정)
 * @returns {Promise<object>} 코스별 통계 데이터
 */
export const getCourseStats = async (userId, courseId) => {
  const endpoint = userId 
    ? `/api/stats/users/${userId}/courses${courseId ? `/${courseId}` : ''}` 
    : `/api/stats/me/courses${courseId ? `/${courseId}` : ''}`;
  
  const response = await axios.get(endpoint);
  return response.data.data;
};

/**
 * 동반자 비교 통계 가져오기
 * @param {number} userId - 사용자 ID (미지정 시 현재 로그인한 사용자)
 * @param {number} opponentId - 비교 대상 사용자 ID
 * @returns {Promise<object>} 비교 통계 데이터
 */
export const getComparisonStats = async (userId, opponentId) => {
  const endpoint = userId 
    ? `/api/stats/users/${userId}/compare/${opponentId}` 
    : `/api/stats/me/compare/${opponentId}`;
  
  const response = await axios.get(endpoint);
  return response.data.data;
};

/**
 * 사용자의 동반자 목록 조회
 * @param {number} userId - 사용자 ID (미지정 시 현재 로그인한 사용자)
 * @returns {Promise<Array>} 동반자 목록
 */
export const getUserPartners = async (userId) => {
  const endpoint = userId 
    ? `/api/users/${userId}/partners` 
    : '/api/users/me/partners';
  
  const response = await axios.get(endpoint);
  return response.data.data;
};

/**
 * 특정 라운드의 참가자 목록 조회
 * @param {number} roundId - 라운드 ID
 * @returns {Promise<Array>} 참가자 목록
 */
export const getRoundParticipants = async (roundId) => {
  const response = await axios.get(`/api/rounds/${roundId}/participants`);
  return response.data.data;
};

/**
 * 사용자의 동반자 통계 조회
 * @param {number} userId - 사용자 ID (미지정 시 현재 로그인한 사용자)
 * @returns {Promise<Array>} 동반자 통계 목록
 */
export const getPartnerStats = async (userId) => {
  const endpoint = userId 
    ? `/api/users/${userId}/partner-stats` 
    : '/api/users/me/partner-stats';
  
  const response = await axios.get(endpoint);
  return response.data.data;
}; 