const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// 데이터베이스 경로 설정
const dbPath = path.join(__dirname, '..', '..', 'data', 'golf_simulator.db');

// 데이터 디렉토리가 없으면 생성
const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 데이터베이스 연결
let db;

// 초기화 함수 추가
const init = async () => {
  return new Promise((resolve, reject) => {
    try {
      db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          logger.error('데이터베이스 연결 오류:', err);
          reject(err);
          return;
        }
        
        // WAL 모드 활성화 (동시성 향상)
        db.run('PRAGMA journal_mode = WAL', function(err) {
          if (err) {
            logger.error('데이터베이스 설정 오류:', err);
            // 설정 오류는 치명적이지 않을 수 있으므로 계속 진행
          } else {
            logger.info('데이터베이스 WAL 모드 활성화됨');
          }
          
          logger.info(`데이터베이스 연결 성공: ${dbPath}`);
          resolve();
        });
      });
    } catch (error) {
      logger.error('데이터베이스 초기화 중 오류 발생:', error);
      reject(error);
    }
  });
};

// 간단한 쿼리 함수 래퍼
const dbMethods = {
  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          logger.error(`쿼리 오류(all): ${err.message}`, { sql, params });
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },
  
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) {
          logger.error(`쿼리 오류(get): ${err.message}`, { sql, params });
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },
  
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) {
          logger.error(`쿼리 오류(run): ${err.message}`, { sql, params });
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  },
  
  exec: (sql) => {
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) {
          logger.error(`쿼리 오류(exec): ${err.message}`, { sql });
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },
  
  close: () => {
    return new Promise((resolve, reject) => {
      if (db) {
        db.close((err) => {
          if (err) {
            logger.error('데이터베이스 연결 종료 오류:', err);
            reject(err);
          } else {
            logger.info('데이터베이스 연결이 종료되었습니다.');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
};

// 데이터베이스 연결 및 메서드 내보내기
module.exports = {
  init,  // 초기화 함수 추가
  ...dbMethods
}; 