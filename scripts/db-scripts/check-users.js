/**
 * 사용자 목록 확인 스크립트
 */
const db = require('../models/db');

async function checkUsers() {
  try {
    console.log('사용자 목록 확인 중...');
    const users = await db.all('SELECT user_id, username, full_name, email, handicap, target_handicap, phone, join_date FROM users');
    
    console.log(`총 ${users.length}명의 사용자가 등록되어 있습니다.`);
    console.table(users);
  } catch (error) {
    console.error('사용자 목록 확인 중 오류:', error);
  } finally {
    await db.close();
  }
}

checkUsers(); 