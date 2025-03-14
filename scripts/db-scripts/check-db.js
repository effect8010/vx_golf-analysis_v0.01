/**
 * 데이터베이스 데이터 확인 스크립트
 */
const db = require('./server/models/db');

async function checkTableData(tableName, fields = '*', limit = 3) {
  try {
    console.log(`\n=== ${tableName} 테이블 ===`);
    const countResult = await db.get(`SELECT COUNT(*) as count FROM ${tableName}`);
    console.log(`${tableName} 수: ${countResult.count}`);
    
    if (countResult.count > 0 && fields) {
      const samples = await db.all(`SELECT ${fields} FROM ${tableName} LIMIT ${limit}`);
      console.log(`샘플 ${tableName}:`);
      console.table(samples);
    }
    return countResult.count;
  } catch (error) {
    console.error(`${tableName} 테이블 확인 중 오류:`, error.message);
    return 0;
  }
}

async function checkDatabase() {
  try {
    console.log('=== 데이터베이스 확인 ===');
    
    // 데이터베이스 초기화
    await db.init();
    
    // 테이블 확인
    await checkTableData('users', 'user_id, username, full_name, email, handicap');
    await checkTableData('golf_courses', 'course_id, course_name, country_code, course_count, course_difficulty');
    await checkTableData('course_details', 'detail_id, course_id, course_number, course_name');
    await checkTableData('holes', 'hole_id, course_id, course_number, hole_number, par, hole_type');
    
    // 테이블 존재 확인
    try {
      await db.get('SELECT 1 FROM rounds LIMIT 1');
      await checkTableData('rounds', 'round_id, user_id, course_id, round_date, total_score');
    } catch (error) {
      console.log('\n=== rounds 테이블 ===');
      console.error('rounds 테이블 접근 중 오류:', error.message);
    }
    
    try {
      await db.get('SELECT 1 FROM shots LIMIT 1');
      await checkTableData('shots', 'shot_id, round_id, user_id, course_id, hole_number, club');
    } catch (error) {
      console.log('\n=== shots 테이블 ===');
      console.error('shots 테이블 접근 중 오류:', error.message);
    }
    
    console.log('\n=== 확인 완료 ===');
  } catch (error) {
    console.error('데이터베이스 확인 중 오류 발생:', error);
  } finally {
    await db.close();
  }
}

checkDatabase(); 