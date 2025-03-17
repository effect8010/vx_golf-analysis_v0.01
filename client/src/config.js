/**
 * 애플리케이션 환경 설정
 */

// API 기본 URL 설정
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://vx-golf-analysis-api.onrender.com' // 배포된 백엔드 API URL
  : '';

// 애플리케이션 경로 접두사 (GitHub Pages 배포 시 사용)
export const APP_PATH_PREFIX = process.env.NODE_ENV === 'production'
  ? '/vx_golf-analysis_v0.01'
  : '';

// 기타 환경 설정
export const APP_CONFIG = {
  appName: '골프 시뮬레이터 분석',
  apiTimeout: 30000, // API 요청 타임아웃 (30초)
  cacheExpiry: 5 * 60 * 1000, // 캐시 만료 시간 (5분)
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  version: '0.3.0'
}; 