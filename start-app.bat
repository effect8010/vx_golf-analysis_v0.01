@echo off
chcp 65001 > nul
set PATH=C:\Program Files\nodejs;%PATH%
echo 골프 시뮬레이터 분석 서비스 - 전체 애플리케이션 시작
echo ==================================================
echo.
echo 백엔드와 프론트엔드를 별도의 창에서 실행합니다...
echo.

start cmd /k "scripts\batch-scripts\start-server.bat"
timeout /t 5
start cmd /k "scripts\batch-scripts\start-client.bat"

echo.
echo 애플리케이션이 시작되었습니다.
echo 백엔드 서버: http://localhost:5000
echo 프론트엔드: http://localhost:3000
echo. 