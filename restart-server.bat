@echo off
chcp 65001 > nul
set PATH=C:\Program Files\nodejs;%PATH%
echo 골프 시뮬레이터 분석 서비스 - 서버 재시작
echo ========================================
echo.

echo 이전 서버 프로세스를 종료합니다...
taskkill /FI "WINDOWTITLE eq 서버*" /T /F >nul 2>&1

echo 서버를 시작합니다...
start cmd /k "title 서버 & cd server & node index.js"

echo.
echo 서버가 재시작되었습니다.
echo 백엔드 서버: http://localhost:5000
echo. 