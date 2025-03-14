/**
 * 인증 컨트롤러
 * 로그인, 회원가입 등 인증 관련 로직을 처리합니다.
 */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { UserModel } = require('../models');

/**
 * 회원가입 처리
 */
const register = async (req, res) => {
  try {
    const { username, password, fullName, email, phone, handicap } = req.body;
    
    // 필수 필드 검증
    if (!username || !password || !fullName || !email) {
      return res.status(400).json({
        status: 'error',
        message: '사용자 이름, 비밀번호, 이름, 이메일은 필수 입력 항목입니다.'
      });
    }
    
    // 사용자 이름 중복 확인
    const existingUser = await UserModel.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: '이미 사용 중인 사용자 이름입니다.'
      });
    }
    
    // 이메일 중복 확인
    const existingEmail = await UserModel.findByEmail(email);
    if (existingEmail) {
      return res.status(409).json({
        status: 'error',
        message: '이미 사용 중인 이메일입니다.'
      });
    }
    
    // 비밀번호 해시화
    const saltRounds = 10;
    const passwordHash = bcrypt.hashSync(password, saltRounds);
    
    // 사용자 데이터 생성
    const userData = {
      username,
      password_hash: passwordHash,
      full_name: fullName,
      email,
      phone: phone || null,
      handicap: handicap || null
    };
    
    // 사용자 생성
    const userId = await UserModel.createUser(userData);
    
    // 마지막 로그인 시간 업데이트
    await UserModel.updateLastLogin(userId);
    
    // 토큰 생성
    const token = jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    // 응답
    return res.status(201).json({
      status: 'success',
      message: '회원가입이 성공적으로 완료되었습니다.',
      data: {
        userId,
        username,
        fullName,
        email,
        token
      }
    });
  } catch (error) {
    console.error('회원가입 처리 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 로그인 처리
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('로그인 시도:', username);
    
    // 필수 필드 검증
    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        message: '사용자 이름과 비밀번호는 필수 입력 항목입니다.'
      });
    }
    
    // 사용자 조회
    const user = await UserModel.findByUsername(username);
    if (!user) {
      console.log('사용자를 찾을 수 없음:', username);
      return res.status(401).json({
        status: 'error',
        message: '사용자 이름 또는 비밀번호가 올바르지 않습니다.'
      });
    }
    
    console.log('사용자 찾음:', user.username);
    
    // 계정 상태 확인
    if (user.status !== 1) {
      return res.status(403).json({
        status: 'error',
        message: '비활성화된 계정입니다.'
      });
    }
    
    // 비밀번호 검증
    const passwordMatch = bcrypt.compareSync(password, user.password_hash);
    if (!passwordMatch) {
      console.log('비밀번호 불일치');
      return res.status(401).json({
        status: 'error',
        message: '사용자 이름 또는 비밀번호가 올바르지 않습니다.'
      });
    }
    
    console.log('비밀번호 일치, 로그인 성공');
    
    // 마지막 로그인 시간 업데이트
    await UserModel.updateLastLogin(user.user_id);
    
    // 토큰 생성
    const token = jwt.sign(
      { userId: user.user_id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    // 응답
    return res.status(200).json({
      status: 'success',
      message: '로그인이 성공적으로 완료되었습니다.',
      data: {
        userId: user.user_id,
        username: user.username,
        fullName: user.full_name,
        email: user.email,
        token
      }
    });
  } catch (error) {
    console.error('로그인 처리 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 현재 로그인한 사용자 정보 조회
 */
const me = async (req, res) => {
  try {
    // 미들웨어에서 추가된 사용자 정보 사용
    const { userId } = req.user;
    
    // 사용자 상세 정보 조회
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    // 응답
    return res.status(200).json({
      status: 'success',
      data: {
        userId: user.user_id,
        username: user.username,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        handicap: user.handicap,
        joinDate: user.join_date
      }
    });
  } catch (error) {
    console.error('사용자 정보 조회 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

module.exports = {
  register,
  login,
  me
}; 