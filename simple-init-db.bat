@echo off
chcp 65001 > nul
set PATH=C:\Program Files\nodejs;%PATH%
echo 골프 시뮬레이터 분석 서비스 - 간단한 데이터베이스 초기화
echo ==============================================
echo.
echo 데이터베이스를 초기화합니다...

node ./scripts/simple-init-db.js

echo.
echo 데이터베이스 초기화가 완료되었습니다.
echo.

pause 