/**
 * 골프 시뮬레이터 앱 데이터베이스 초기화 간단 스크립트
 * 
 * SQLite3 라이브러리를 사용하여 데이터베이스를 초기화합니다.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// 데이터베이스 파일 경로
const dbPath = path.join(__dirname, '..', 'data', 'golf_simulator.db');
const schemaPath = path.join(__dirname, 'simple-schema.sql');

console.log('데이터베이스 초기화를 시작합니다...');

// 기존 데이터베이스 파일 확인 및 백업
if (fs.existsSync(dbPath)) {
  const backupPath = `${dbPath}.backup.${new Date().toISOString().replace(/:/g, '-')}`;
  console.log(`기존 데이터베이스 파일을 백업합니다: ${backupPath}`);
  fs.copyFileSync(dbPath, backupPath);
  fs.unlinkSync(dbPath);
  console.log('기존 데이터베이스 파일이 삭제되었습니다.');
}

// 데이터 디렉토리 확인 및 생성
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`데이터 디렉토리를 생성했습니다: ${dataDir}`);
}

// 스키마 파일 읽기
const schema = fs.readFileSync(schemaPath, 'utf8');

// 새 데이터베이스 연결
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('데이터베이스 연결 오류:', err.message);
    process.exit(1);
  }
  console.log('새 데이터베이스 파일이 생성되었습니다.');
});

// 스키마 적용
db.serialize(() => {
  // 트랜잭션 시작
  db.run('BEGIN TRANSACTION');

  // 스키마 실행
  console.log('스키마를 적용 중입니다...');
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);
    
  statements.forEach((statement) => {
    db.run(statement, (err) => {
      if (err) {
        console.error('스키마 적용 중 오류:', err.message);
      }
    });
  });

  // 테스트 데이터 추가
  console.log('테스트 사용자를 추가합니다...');
  
  // 비밀번호 해시 생성
  const passwordHash = bcrypt.hashSync('password123', 10);
  
  // 사용자 추가
  db.run(`
    INSERT INTO users (username, password_hash, full_name, email, handicap, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `, ['kim', passwordHash, '김골퍼', 'kim@example.com', 15.5, 1], function(err) {
    if (err) {
      console.error('사용자 추가 중 오류:', err.message);
    } else {
      const userId = this.lastID;
      console.log(`테스트 사용자가 추가되었습니다. ID: ${userId}`);
      
      // 골프 코스 추가
      db.run(`
        INSERT INTO golf_courses (course_name, resource_name, course_count, country_code, course_difficulty, green_difficulty, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, ['테스트 골프 클럽', 'test_cc', 2, 1, 3, 3, '테스트용 골프 코스입니다.'], function(err) {
        if (err) {
          console.error('골프 코스 추가 중 오류:', err.message);
        } else {
          const courseId = this.lastID;
          console.log(`테스트 골프 코스가 추가되었습니다. ID: ${courseId}`);
          
          // 트랜잭션 커밋
          db.run('COMMIT', (err) => {
            if (err) {
              console.error('트랜잭션 커밋 중 오류:', err.message);
              db.run('ROLLBACK');
            } else {
              console.log('데이터베이스 초기화가 완료되었습니다.');
            }
            
            // 데이터베이스 연결 종료
            db.close((err) => {
              if (err) {
                console.error('데이터베이스 연결 종료 중 오류:', err.message);
              }
              console.log('데이터베이스 연결이 종료되었습니다.');
            });
          });
        }
      });
    }
  });
}); 