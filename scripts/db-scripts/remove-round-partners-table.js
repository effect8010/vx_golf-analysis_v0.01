/**
 * round_partners 테이블을 삭제하고 대신 라운드 ID 기반 동반자 조회 로직 구현
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 현재 시간 설정
const now = new Date();
const timestamp = now.toISOString().replace(/:/g, '-');

// 로그 기록 함수
function log(message) {
  console.log(message);
  fs.appendFileSync('db-structure-update.log', `${timestamp} - ${message}\n`);
}

// 데이터베이스 경로
const DB_PATH = path.resolve(__dirname, './data/golf_simulator.db');
log(`데이터베이스 경로: ${DB_PATH}`);

// 데이터베이스 연결
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    log(`데이터베이스 연결 오류: ${err.message}`);
    process.exit(1);
  }
  log('데이터베이스에 연결되었습니다.');
});

// round_partners 테이블 존재 여부 확인 및 삭제
function checkAndDropRoundPartnersTable() {
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='round_partners'", (err, table) => {
    if (err) {
      log(`테이블 확인 오류: ${err.message}`);
      db.close();
      return;
    }
    
    if (table) {
      // 테이블이 존재하면 삭제
      db.run('DROP TABLE round_partners', (err) => {
        if (err) {
          log(`round_partners 테이블 삭제 오류: ${err.message}`);
        } else {
          log('round_partners 테이블이 성공적으로 삭제되었습니다.');
        }
        
        // 동반자 조회 함수 테스트
        testPartnerQuery();
      });
    } else {
      log('round_partners 테이블이 존재하지 않습니다.');
      
      // 동반자 조회 함수 테스트
      testPartnerQuery();
    }
  });
}

// 라운드 동반자 조회 로직 테스트
function testPartnerQuery() {
  // 테스트를 위한 라운드 ID 조회
  db.get('SELECT round_id FROM rounds LIMIT 1', (err, row) => {
    if (err) {
      log(`라운드 조회 오류: ${err.message}`);
      createViewForPartners();
      return;
    }
    
    if (!row) {
      log('조회할 라운드가 없습니다.');
      createViewForPartners();
      return;
    }
    
    const roundId = row.round_id;
    
    // 동일한 라운드 ID를 가진 사용자 조회 (자신 제외)
    const query = `
      SELECT r.round_id, r.user_id, u.username, u.full_name, r.total_score
      FROM rounds r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.round_id = ?
    `;
    
    db.all(query, [roundId], (err, rows) => {
      if (err) {
        log(`동반자 조회 오류: ${err.message}`);
      } else {
        log(`라운드 ID ${roundId}의 참가자 목록:`);
        rows.forEach(row => {
          log(`- 사용자 ID: ${row.user_id}, 이름: ${row.full_name}, 점수: ${row.total_score}`);
        });
        
        if (rows.length <= 1) {
          log('이 라운드에는 동반자가 없습니다.');
        } else {
          log(`총 ${rows.length}명의 참가자가 있습니다.`);
        }
      }
      
      // 동반자 조회를 위한 뷰 생성
      createViewForPartners();
    });
  });
}

// 동반자 조회를 위한 뷰 생성
function createViewForPartners() {
  const createViewSQL = `
    CREATE VIEW IF NOT EXISTS round_partners_view AS
    SELECT 
      r1.round_id,
      r1.user_id AS user_id,
      r2.user_id AS partner_id,
      u.username AS partner_username,
      u.full_name AS partner_name,
      r2.total_score AS partner_score,
      CASE 
        WHEN r1.total_score < r2.total_score THEN 1  -- 승리
        WHEN r1.total_score > r2.total_score THEN -1 -- 패배
        ELSE 0                                       -- 무승부
      END AS match_result,
      ABS(r1.total_score - r2.total_score) AS score_difference
    FROM 
      rounds r1
    JOIN 
      rounds r2 ON r1.round_id = r2.round_id AND r1.user_id != r2.user_id
    JOIN 
      users u ON r2.user_id = u.user_id
  `;
  
  db.run(createViewSQL, (err) => {
    if (err) {
      log(`뷰 생성 오류: ${err.message}`);
    } else {
      log('round_partners_view가 성공적으로 생성되었습니다.');
      log('이제 아래의 쿼리로 특정 사용자의 라운드 동반자를 조회할 수 있습니다:');
      log('SELECT * FROM round_partners_view WHERE user_id = ?');
    }
    
    // 모델 함수 예시 보여주기
    showModelFunctions();
  });
}

// 모델 함수 예시
function showModelFunctions() {
  log('\n===== 모델 함수 예시 =====');
  log(`
/**
 * 특정 사용자의 라운드 동반자 목록 조회
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Array>} - 동반자 목록
 */
async function getUserPartners(userId) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM round_partners_view WHERE user_id = ?';
    db.all(query, [userId], (err, partners) => {
      if (err) return reject(err);
      resolve(partners);
    });
  });
}

/**
 * 특정 라운드의 참가자 목록 조회
 * @param {number} roundId - 라운드 ID
 * @returns {Promise<Array>} - 참가자 목록
 */
async function getRoundParticipants(roundId) {
  return new Promise((resolve, reject) => {
    const query = \`
      SELECT r.user_id, u.username, u.full_name, r.total_score
      FROM rounds r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.round_id = ?
    \`;
    db.all(query, [roundId], (err, participants) => {
      if (err) return reject(err);
      resolve(participants);
    });
  });
}
`);
  
  // 데이터베이스 연결 종료
  db.close((err) => {
    if (err) {
      log(`데이터베이스 연결 종료 오류: ${err.message}`);
    } else {
      log('\n데이터베이스 변경이 완료되었습니다.');
      log('애플리케이션의 관련 코드를 수정하여 새로운 조회 방식을 적용하세요.');
    }
  });
}

// 스크립트 실행
checkAndDropRoundPartnersTable(); 