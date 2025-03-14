const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 데이터베이스 경로를 절대 경로로 설정 (규칙 1번 준수)
const dbPath = path.resolve(__dirname, './data/golf_simulator.db');

// 경로 확인 (규칙 3번 준수)
console.log('데이터베이스 경로:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('데이터베이스 연결 오류:', err);
    return;
  }
  console.log('데이터베이스 연결 성공');
  
  // 테스트 사용자 추가 (없는 경우를 대비)
  const checkAndCreateTestUser = () => {
    const bcrypt = require('bcryptjs');
    const saltRounds = 10;
    const passwordHash = bcrypt.hashSync('test123', saltRounds);
    
    db.get('SELECT * FROM users WHERE username = ?', ['test'], (err, user) => {
      if (err) {
        console.error('테스트 사용자 조회 중 오류 발생:', err);
        return;
      }
      
      if (!user) {
        console.log('테스트 사용자가 없습니다. 새로 생성합니다.');
        
        const sql = `
          INSERT INTO users (username, password_hash, full_name, email, phone, handicap, status, join_date)
          VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `;
        
        db.run(sql, ['test', passwordHash, '테스트 사용자', 'test@example.com', '010-1234-5678', 15, 1], function(err) {
          if (err) {
            console.error('테스트 사용자 생성 중 오류 발생:', err);
          } else {
            console.log('테스트 사용자가 성공적으로 생성되었습니다. ID:', this.lastID);
          }
          
          // 모든 사용자 조회
          listAllUsers();
        });
      } else {
        console.log('테스트 사용자가 이미 존재합니다. ID:', user.user_id);
        // 모든 사용자 조회
        listAllUsers();
      }
    });
  };
  
  // 모든 사용자 조회 함수
  const listAllUsers = () => {
    db.all(`SELECT * FROM users`, [], (err, users) => {
      if (err) {
        console.error('사용자 정보 조회 중 오류 발생:', err);
        db.close(() => console.log('데이터베이스 연결 종료'));
        return;
      }
      
      console.log('--------- 데이터베이스 사용자 목록 ---------');
      if (users.length === 0) {
        console.log('사용자가 없습니다.');
      } else {
        users.forEach(user => {
          console.log(`ID: ${user.user_id}, 이름: ${user.full_name}, 사용자명: ${user.username}, 이메일: ${user.email}, 상태: ${user.status}`);
        });
      }
      console.log('-------------------------------------------');
      
      // 리소스 정리 (규칙 6번 준수)
      db.close(() => {
        console.log('데이터베이스 연결 종료');
      });
    });
  };
  
  // 테이블 구조 확인 후 사용자 확인 및 생성
  db.all("PRAGMA table_info(users)", [], (err, columns) => {
    if (err) {
      console.error('테이블 구조 조회 중 오류 발생:', err);
      db.close();
      return;
    }
    
    console.log('--------- users 테이블 구조 ---------');
    columns.forEach(column => {
      console.log(`${column.name} (${column.type})`);
    });
    console.log('------------------------------------');
    
    // 테스트 사용자 확인 및 생성
    checkAndCreateTestUser();
  });
}); 