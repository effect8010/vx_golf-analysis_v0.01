const mongoose = require('mongoose');

// 홀 스키마 정의
const holeSchema = new mongoose.Schema({
  holeNumber: {
    type: Number,
    required: true
  },
  par: {
    type: Number,
    required: true
  },
  distance: {
    type: Number,
    required: true
  },
  handicap: {
    type: Number,
    default: 0
  },
  description: {
    type: String
  }
});

// 코스 스키마 정의
const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true
  },
  totalPar: {
    type: Number,
    required: true
  },
  courseType: {
    type: String,
    enum: ['시뮬레이터', '필드'],
    default: '시뮬레이터'
  },
  holes: [holeSchema],
  difficulty: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  description: {
    type: String
  },
  image: {
    type: String
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

// 홀 수 계산 가상 필드
courseSchema.virtual('holeCount').get(function() {
  return this.holes.length;
});

// 업데이트 시 updatedAt 필드 자동 갱신
courseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Course', courseSchema); 