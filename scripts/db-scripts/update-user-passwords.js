/**
 * 사용자 ID와 비밀번호를 동일하게 설정하는 스크립트
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const fs = require('fs');

// 현재 시간 설정
const now = new Date();
const timestamp = now.toISOString().replace(/:/g, '-');

// 로그 기록 함수
function log(message) {
  console.log(message);
  fs.appendFileSync('user-password-update.log', `${timestamp} - ${message}\n`);
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

// 사용자 생성 (ID가 없는 경우)
async function createUsersIfNeeded() {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM users', async (err, row) => {
      if (err) {
        if (err.message.includes('no such table')) {
          log('users 테이블이 없습니다. 테이블을 생성합니다.');
          
          // users 테이블 생성
          db.run(`
            CREATE TABLE IF NOT EXISTS users (
              user_id INTEGER PRIMARY KEY AUTOINCREMENT,
              username VARCHAR(100) NOT NULL UNIQUE,
              password_hash VARCHAR(255) NOT NULL,
              full_name VARCHAR(100) NOT NULL,
              email VARCHAR(255) NOT NULL UNIQUE,
              phone VARCHAR(20),
              handicap DECIMAL(4,1),
              target_handicap DECIMAL(4,1),
              profile_image VARCHAR(255),
              join_date DATETIME DEFAULT CURRENT_TIMESTAMP,
              last_login DATETIME,
              status TINYINT DEFAULT 1,
              is_admin BOOLEAN DEFAULT 0
            )
          `, async (err) => {
            if (err) {
              log(`테이블 생성 오류: ${err.message}`);
              reject(err);
              return;
            }
            
            log('users 테이블이 생성되었습니다.');
            await insertSampleUsers();
            resolve();
          });
        } else {
          log(`사용자 수 확인 오류: ${err.message}`);
          reject(err);
        }
        return;
      }
      
      if (row.count === 0) {
        log('사용자가 없습니다. 샘플 사용자를 생성합니다.');
        await insertSampleUsers();
      } else {
        log(`기존 사용자 수: ${row.count}`);
        updateAllUserPasswords();
      }
      resolve();
    });
  });
}

// 샘플 사용자 생성
async function insertSampleUsers() {
  const sampleUsers = [
    { username: 'admin', full_name: '관리자', email: 'admin@golf.com', is_admin: 1, handicap: 5.0 },
    { username: 'kim', full_name: '김철수', email: 'kim@example.com', handicap: 12.5 },
    { username: 'park', full_name: '박영희', email: 'park@example.com', handicap: 8.2 },
    { username: 'lee', full_name: '이민수', email: 'lee@example.com', handicap: 15.7 },
    { username: 'choi', full_name: '최지영', email: 'choi@example.com', handicap: 10.3 },
  ];
  
  log('샘플 사용자 추가 중...');
  
  for (const user of sampleUsers) {
    // 비밀번호는 사용자 ID와 동일하게 설정
    const password = user.username;
    const hash = bcrypt.hashSync(password, 10);
    
    db.run(
      'INSERT INTO users (username, password_hash, full_name, email, handicap, is_admin) VALUES (?, ?, ?, ?, ?, ?)',
      [user.username, hash, user.full_name, user.email, user.handicap, user.is_admin || 0],
      function(err) {
        if (err) {
          log(`사용자 추가 오류 (${user.username}): ${err.message}`);
        } else {
          log(`사용자 추가됨: ${user.username}, ID: ${this.lastID}, 비밀번호: ${password}`);
        }
      }
    );
  }
}

// 모든 사용자의 비밀번호를 사용자 ID와 동일하게 업데이트
function updateAllUserPasswords() {
  db.all('SELECT user_id, username FROM users', (err, users) => {
    if (err) {
      log(`사용자 조회 오류: ${err.message}`);
      return;
    }
    
    log(`${users.length}명의 사용자 비밀번호를 업데이트합니다.`);
    
    users.forEach(user => {
      // 비밀번호를 사용자 ID와 동일하게 설정
      const password = user.username;
      const hash = bcrypt.hashSync(password, 10);
      
      db.run(
        'UPDATE users SET password_hash = ? WHERE user_id = ?',
        [hash, user.user_id],
        function(err) {
          if (err) {
            log(`비밀번호 업데이트 오류 (${user.username}): ${err.message}`);
          } else {
            log(`비밀번호 업데이트됨: ${user.username}, ID: ${user.user_id}, 비밀번호: ${password}`);
          }
        }
      );
    });
  });
}

// 사용자 정보 조회
function showUsers() {
  db.all('SELECT user_id, username, full_name, email, handicap, is_admin FROM users', (err, users) => {
    if (err) {
      log(`사용자 조회 오류: ${err.message}`);
      return;
    }
    
    log('\n===== 사용자 목록 =====');
    users.forEach(user => {
      log(`ID: ${user.user_id}, 계정명: ${user.username}, 이름: ${user.full_name}, 이메일: ${user.email}, 핸디캡: ${user.handicap}, 관리자: ${user.is_admin ? '예' : '아니오'}`);
      log(`    로그인 정보: ID - ${user.username}, 비밀번호 - ${user.username}`);
      log('------------------------');
    });
    
    // 데이터베이스 연결 종료
    db.close((err) => {
      if (err) {
        log(`데이터베이스 연결 종료 오류: ${err.message}`);
      } else {
        log('데이터베이스 연결이 종료되었습니다.');
      }
    });
  });
}

// 스크립트 실행
async function main() {
  try {
    await createUsersIfNeeded();
    
    // 사용자 추가 후 약간의 시간 지연 (데이터베이스 작업 완료를 위해)
    setTimeout(() => {
      showUsers();
    }, 1000);
    
  } catch (error) {
    log(`오류 발생: ${error.message}`);
    db.close();
  }
}

main(); 