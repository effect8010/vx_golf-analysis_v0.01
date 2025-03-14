/**
 * 샘플 사용자 데이터 생성 스크립트
 * 유저 정보 테이블(users)에 5명의 샘플 사용자를 추가합니다.
 */
const fs = require('fs');
const bcrypt = require('bcrypt');
const db = require('../models/db');
const { UserModel } = require('../models');
const logger = require('../utils/logger');

// 비밀번호 해시 생성 함수
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// 샘플 사용자 데이터 생성 및 DB 입력
async function createSampleUsers() {
  try {
    logger.info('샘플 사용자 데이터 생성 시작...');
    
    // 기존 사용자 수 확인
    const existingUsers = await db.get('SELECT COUNT(*) as count FROM users');
    logger.info(`현재 사용자 수: ${existingUsers.count}`);
    
    // 샘플 사용자 데이터
    const sampleUsers = [
      {
        username: 'parkjs',
        password: 'golfking123',
        full_name: '박진수',
        email: 'parkjs@example.com',
        phone: '010-1234-5678',
        handicap: 8.2,
        target_handicap: 5.0
      },
      {
        username: 'leemj',
        password: 'golfqueen456',
        full_name: '이미진',
        email: 'leemj@example.com',
        phone: '010-2345-6789',
        handicap: 12.3,
        target_handicap: 10.0
      },
      {
        username: 'choisy',
        password: 'birdie789',
        full_name: '최서연',
        email: 'choisy@example.com',
        phone: '010-3456-7890',
        handicap: 18.7,
        target_handicap: 15.0
      },
      {
        username: 'jeonghk',
        password: 'eagle321',
        full_name: '정현국',
        email: 'jeonghk@example.com',
        phone: '010-4567-8901',
        handicap: 5.6,
        target_handicap: 3.0
      },
      {
        username: 'kimdy',
        password: 'bogey654',
        full_name: '김도윤',
        email: 'kimdy@example.com',
        phone: '010-5678-9012',
        handicap: 24.8,
        target_handicap: 20.0
      }
    ];
    
    // 사용자 데이터 DB 입력
    let insertedCount = 0;
    for (const user of sampleUsers) {
      try {
        // 사용자명 중복 확인
        const existingUser = await UserModel.findByUsername(user.username);
        if (existingUser) {
          logger.info(`사용자명 '${user.username}'이 이미 존재합니다. 건너뜁니다.`);
          continue;
        }
        
        // 이메일 중복 확인
        const existingEmail = await UserModel.findByEmail(user.email);
        if (existingEmail) {
          logger.info(`이메일 '${user.email}'이 이미 존재합니다. 건너뜁니다.`);
          continue;
        }
        
        // 비밀번호 해시 생성
        const password_hash = await hashPassword(user.password);
        
        // 사용자 데이터 입력
        const userData = {
          username: user.username,
          password_hash,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          handicap: user.handicap
        };
        
        const userId = await UserModel.createUser(userData);
        
        // 목표 핸디캡 업데이트
        if (user.target_handicap) {
          await UserModel.updateUser(userId, { 
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            handicap: user.handicap,
            target_handicap: user.target_handicap,
            profile_image: null
          });
        }
        
        logger.info(`사용자 '${user.username}' 추가 완료 (ID: ${userId})`);
        insertedCount++;
      } catch (error) {
        logger.error(`사용자 '${user.username}' 추가 중 오류:`, error);
      }
    }
    
    logger.info(`샘플 사용자 데이터 생성 완료: ${insertedCount}명 추가됨`);
    
    // 추가된 사용자 목록 출력
    const users = await UserModel.getAllUsers();
    logger.info('현재 등록된 사용자:');
    
    // 사용자 목록을 파일로 저장
    fs.writeFileSync('../user-list.json', JSON.stringify(users, null, 2));
    logger.info('사용자 목록이 user-list.json 파일에 저장되었습니다.');
    
  } catch (error) {
    logger.error('샘플 사용자 데이터 생성 중 오류 발생:', error);
  } finally {
    await db.close();
  }
}

// 스크립트 실행
createSampleUsers(); 