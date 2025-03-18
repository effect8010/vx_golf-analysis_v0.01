/**
 * AWS Lambda 서버리스 핸들러
 */
const serverless = require('serverless-http');
const app = require('./index');

// 서버리스 핸들러 생성
module.exports.handler = serverless(app); 