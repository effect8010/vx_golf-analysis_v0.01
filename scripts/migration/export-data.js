/**
 * SQLite 데이터를 JSON으로 내보내는 스크립트
 */
require('dotenv').config({ path: '../../server/.env' });
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// 데이터베이스 경로 설정
const dbPath = path.join(__dirname, '../../data/golf_simulator.db');

// 출력 디렉토리 확인 및 생성
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 데이터베이스 연결
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('데이터베이스 연결 오류:', err.message);
    process.exit(1);
  }
  console.log(`SQLite 데이터베이스 연결됨: ${dbPath}`);
});

// 테이블 목록 조회
const getTableNames = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT name FROM sqlite_master 
                   WHERE type='table' AND name NOT LIKE 'sqlite_%'`;
    
    db.all(query, [], (err, tables) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(tables.map(table => table.name));
    });
  });
};

// 테이블 데이터 조회
const getTableData = (tableName) => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
};

// 모든 데이터 내보내기
const exportAllData = async () => {
  try {
    const tables = await getTableNames();
    console.log(`테이블 목록: ${tables.join(', ')}`);
    
    const exportData = {};
    
    for (const table of tables) {
      console.log(`테이블 '${table}' 데이터 내보내는 중...`);
      const rows = await getTableData(table);
      exportData[table] = rows;
      console.log(`${rows.length}개 행 내보냄`);
      
      // 각 테이블별 파일로도 저장
      fs.writeFileSync(
        path.join(outputDir, `${table}.json`),
        JSON.stringify(rows, null, 2)
      );
    }
    
    // 전체 데이터를 하나의 파일로 저장
    fs.writeFileSync(
      path.join(outputDir, 'all_data.json'),
      JSON.stringify(exportData, null, 2)
    );
    
    console.log('모든 데이터 내보내기 완료!');
    console.log(`출력 위치: ${outputDir}`);
    
  } catch (error) {
    console.error('데이터 내보내기 오류:', error);
  } finally {
    db.close();
  }
};

// 스크립트 실행
exportAllData(); 