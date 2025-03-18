const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// 사용자 스키마 정의
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '사용자 이름은 필수입니다.'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, '비밀번호는 필수입니다.'],
    minlength: [4, '비밀번호는 최소 4자 이상이어야 합니다.']
  },
  name: {
    type: String,
    required: [true, '이름은 필수입니다.']
  },
  email: {
    type: String,
    required: [true, '이메일은 필수입니다.'],
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, '유효한 이메일 주소를 입력해주세요.']
  },
  handicap: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 비밀번호 해싱 미들웨어
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 비밀번호 검증 메서드
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 