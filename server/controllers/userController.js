/**
 * 사용자 컨트롤러
 * 사용자 관련 기능을 처리합니다.
 */
const { UserModel } = require('../models');

/**
 * 사용자 프로필 조회
 */
const getUserProfile = (req, res) => {
  try {
    const { userId } = req.params;
    
    // 프로필 조회 권한 확인 (본인 또는 관리자만 조회 가능)
    if (userId != req.user.userId && req.user.username !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: '다른 사용자의 프로필을 조회할 권한이 없습니다.'
      });
    }
    
    // 사용자 정보 조회
    const user = UserModel.findById(userId);
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
        targetHandicap: user.target_handicap,
        profileImage: user.profile_image,
        joinDate: user.join_date,
        lastLogin: user.last_login
      }
    });
  } catch (error) {
    console.error('사용자 프로필 조회 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 사용자 프로필 업데이트
 */
const updateUserProfile = (req, res) => {
  try {
    const { userId } = req.params;
    const { fullName, email, phone, handicap, targetHandicap, profileImage } = req.body;
    
    // 프로필 업데이트 권한 확인 (본인 또는 관리자만 업데이트 가능)
    if (userId != req.user.userId && req.user.username !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: '다른 사용자의 프로필을 업데이트할 권한이 없습니다.'
      });
    }
    
    // 사용자 존재 확인
    const user = UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    // 이메일 중복 확인 (변경된 경우)
    if (email && email !== user.email) {
      const existingEmail = UserModel.findByEmail(email);
      if (existingEmail) {
        return res.status(409).json({
          status: 'error',
          message: '이미 사용 중인 이메일입니다.'
        });
      }
    }
    
    // 사용자 데이터 업데이트
    const userData = {
      full_name: fullName || user.full_name,
      email: email || user.email,
      phone: phone !== undefined ? phone : user.phone,
      handicap: handicap !== undefined ? handicap : user.handicap,
      target_handicap: targetHandicap !== undefined ? targetHandicap : user.target_handicap,
      profile_image: profileImage !== undefined ? profileImage : user.profile_image
    };
    
    // 사용자 업데이트
    const updated = UserModel.updateUser(userId, userData);
    if (!updated) {
      return res.status(500).json({
        status: 'error',
        message: '사용자 정보 업데이트에 실패했습니다.'
      });
    }
    
    // 업데이트된 사용자 정보 조회
    const updatedUser = UserModel.findById(userId);
    
    // 응답
    return res.status(200).json({
      status: 'success',
      message: '사용자 프로필이 성공적으로 업데이트되었습니다.',
      data: {
        userId: updatedUser.user_id,
        username: updatedUser.username,
        fullName: updatedUser.full_name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        handicap: updatedUser.handicap,
        targetHandicap: updatedUser.target_handicap,
        profileImage: updatedUser.profile_image
      }
    });
  } catch (error) {
    console.error('사용자 프로필 업데이트 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 비밀번호 변경
 */
const changePassword = (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    // 비밀번호 변경 권한 확인 (본인만 변경 가능)
    if (userId != req.user.userId) {
      return res.status(403).json({
        status: 'error',
        message: '다른 사용자의 비밀번호를 변경할 권한이 없습니다.'
      });
    }
    
    // 필수 필드 검증
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: '현재 비밀번호와 새 비밀번호는 필수 입력 항목입니다.'
      });
    }
    
    // 사용자 존재 확인
    const user = UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    // 현재 비밀번호 검증
    const passwordMatch = bcrypt.compareSync(currentPassword, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        status: 'error',
        message: '현재 비밀번호가 올바르지 않습니다.'
      });
    }
    
    // 새 비밀번호 해시화
    const saltRounds = 10;
    const newPasswordHash = bcrypt.hashSync(newPassword, saltRounds);
    
    // 비밀번호 업데이트
    const updated = UserModel.updatePassword(userId, newPasswordHash);
    if (!updated) {
      return res.status(500).json({
        status: 'error',
        message: '비밀번호 변경에 실패했습니다.'
      });
    }
    
    // 응답
    return res.status(200).json({
      status: 'success',
      message: '비밀번호가 성공적으로 변경되었습니다.'
    });
  } catch (error) {
    console.error('비밀번호 변경 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 사용자 목록 조회 (관리자 전용)
 */
const getAllUsers = (req, res) => {
  try {
    // 사용자 목록 조회
    const users = UserModel.getAllUsers();
    
    // 응답 데이터 가공
    const userData = users.map(user => ({
      userId: user.user_id,
      username: user.username,
      fullName: user.full_name,
      email: user.email,
      handicap: user.handicap,
      joinDate: user.join_date,
      status: user.status
    }));
    
    // 응답
    return res.status(200).json({
      status: 'success',
      data: userData
    });
  } catch (error) {
    console.error('사용자 목록 조회 중 오류 발생:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

// 비밀번호 변경에 필요한 bcrypt 모듈 추가
const bcrypt = require('bcryptjs');

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getAllUsers
}; 