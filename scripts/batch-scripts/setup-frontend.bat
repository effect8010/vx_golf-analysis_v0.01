@echo off
chcp 65001 > nul
set PATH=C:\Program Files\nodejs;%PATH%
echo 골프 시뮬레이터 분석 서비스 - 프론트엔드 설정
echo ==========================================
echo.
echo 프론트엔드 개발 환경을 설정합니다...

"C:\Program Files\nodejs\node.exe" scripts\setup-frontend.js

echo.
echo 프론트엔드 설정이 완료되었습니다.
echo.

pause 