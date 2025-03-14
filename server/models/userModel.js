const db = require('./db');

// 사용자 모델
const UserModel = {
  // 사용자 생성
  createUser: async (userData) => {
    const { username, password_hash, full_name, email, phone, handicap } = userData;
    
    const sql = `
      INSERT INTO users (username, password_hash, full_name, email, phone, handicap, join_date)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    
    const result = await db.run(sql, [username, password_hash, full_name, email, phone, handicap]);
    return result.lastID;
  },
  
  // 사용자명으로 사용자 찾기
  findByUsername: async (username) => {
    const sql = 'SELECT * FROM users WHERE username = ?';
    return await db.get(sql, [username]);
  },
  
  // 이메일로 사용자 찾기
  findByEmail: async (email) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    return await db.get(sql, [email]);
  },
  
  // 사용자 ID로 사용자 찾기
  findById: async (userId) => {
    const sql = 'SELECT * FROM users WHERE user_id = ?';
    return await db.get(sql, [userId]);
  },
  
  // 사용자 정보 업데이트
  updateUser: async (userId, userData) => {
    const { full_name, email, phone, handicap, target_handicap, profile_image } = userData;
    
    const sql = `
      UPDATE users 
      SET full_name = ?, email = ?, phone = ?, handicap = ?, 
          target_handicap = ?, profile_image = ?
      WHERE user_id = ?
    `;
    
    const result = await db.run(sql, [full_name, email, phone, handicap, target_handicap, profile_image, userId]);
    return result.changes > 0;
  },
  
  // 비밀번호 변경
  updatePassword: async (userId, passwordHash) => {
    const sql = 'UPDATE users SET password_hash = ? WHERE user_id = ?';
    const result = await db.run(sql, [passwordHash, userId]);
    return result.changes > 0;
  },
  
  // 마지막 로그인 시간 업데이트
  updateLastLogin: async (userId) => {
    const sql = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?';
    return await db.run(sql, [userId]);
  },
  
  // 사용자 활성/비활성화
  updateStatus: async (userId, status) => {
    const sql = 'UPDATE users SET status = ? WHERE user_id = ?';
    const result = await db.run(sql, [status, userId]);
    return result.changes > 0;
  },
  
  // 사용자 삭제
  deleteUser: async (userId) => {
    const sql = 'DELETE FROM users WHERE user_id = ?';
    const result = await db.run(sql, [userId]);
    return result.changes > 0;
  },
  
  // 모든 사용자 가져오기
  getAllUsers: async () => {
    const sql = 'SELECT user_id, username, full_name, email, handicap, join_date, status FROM users';
    return await db.all(sql);
  }
};

module.exports = UserModel; 