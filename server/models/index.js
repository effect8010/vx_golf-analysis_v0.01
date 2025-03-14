const UserModel = require('./userModel');
const CourseModel = require('./courseModel');
const RoundModel = require('./roundModel');
const ShotModel = require('./shotModel');
const StatsModel = require('./statsModel');
const db = require('./db');

module.exports = {
  UserModel,
  CourseModel,
  RoundModel,
  ShotModel,
  StatsModel,
  db
}; 