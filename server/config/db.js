const mongoose = require('mongoose');
const logger = require('../utils/logger');

// MongoDB 연결 설정
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    logger.info(`MongoDB 연결 성공: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`MongoDB 연결 오류: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB }; 