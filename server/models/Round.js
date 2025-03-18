const mongoose = require('mongoose');

// 라운드 스키마 정의
const roundSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  totalScore: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['완료', '진행중', '취소'],
    default: '완료'
  },
  weather: {
    type: String,
    default: '맑음'
  },
  temperature: {
    type: Number
  },
  notes: {
    type: String
  },
  holeResults: [{
    holeNumber: {
      type: Number,
      required: true
    },
    par: {
      type: Number,
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    fairwayHit: {
      type: Boolean,
      default: false
    },
    greenHit: {
      type: Boolean,
      default: false
    },
    putts: {
      type: Number,
      default: 0
    },
    penalty: {
      type: Number,
      default: 0
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 라운드의 총 점수 계산 가상 필드
roundSchema.virtual('calculatedScore').get(function() {
  if (!this.holeResults || this.holeResults.length === 0) {
    return 0;
  }
  
  return this.holeResults.reduce((total, hole) => total + hole.score, 0);
});

// 업데이트 시 updatedAt 필드 자동 갱신
roundSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Round', roundSchema); 