/**
 * 인증 미들웨어
 * JWT 토큰을 검증하고 사용자 인증을 처리합니다.
 */
const jwt = require('jsonwebtoken');
const { UserModel } = require('../models');

/**
 * JWT 토큰 인증 미들웨어
 * Authorization 헤더로 전달된 JWT 토큰을 검증하고, 유효한 경우 req.user 객체에 사용자 정보를 설정합니다.
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 * @param {Function} next - 다음 미들웨어 함수
 */
const authenticateJWT = (req, res, next) => {
  try {
    // 인증 헤더에서 토큰 가져오기
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        status: 'error',
        message: '인증 토큰이 필요합니다.'
      });
    }

    // 'Bearer ' 접두사 제거
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: '유효한 토큰 형식이 아닙니다.'
      });
    }

    // JWT 토큰 검증
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
      if (err) {
        console.error('JWT 검증 오류:', err);
        
        // 토큰 만료 여부 확인
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            status: 'error',
            message: '토큰이 만료되었습니다. 다시 로그인해 주세요.'
          });
        }
        
        // 그 외 토큰 오류
        return res.status(401).json({
          status: 'error',
          message: '유효하지 않은 토큰입니다.'
        });
      }
      
      // 사용자 ID로 사용자 정보 조회
      const userId = decoded.userId;
      const user = UserModel.findUserById(userId);
      
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: '토큰에 해당하는 사용자를 찾을 수 없습니다.'
        });
      }
      
      // 요청 객체에 사용자 정보 설정
      req.user = {
        userId: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role
      };
      
      next();
    });
  } catch (error) {
    console.error('인증 미들웨어 오류:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 관리자 권한 확인 미들웨어
 * 인증된 사용자가 관리자 권한을 가지고 있는지 확인합니다.
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 * @param {Function} next - 다음 미들웨어 함수
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: '인증이 필요합니다.'
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: '관리자 권한이 필요합니다.'
    });
  }
  
  next();
};

module.exports = {
  authenticateJWT,
  authenticateToken: authenticateJWT, // 기존 코드와의 호환성을 위해 별칭 제공
  isAdmin
}; 