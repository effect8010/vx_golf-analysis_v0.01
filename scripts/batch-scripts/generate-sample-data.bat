@echo off
chcp 65001 > nul
set PATH=C:\Program Files\nodejs;%PATH%
echo 골프 시뮬레이터 분석 서비스 - 샘플 데이터 생성
echo ===========================================
echo.
echo 샘플 데이터를 생성합니다...

"C:\Program Files\nodejs\node.exe" ..\..\scripts\utils-scripts\generate-sample-data.js

echo.
echo 샘플 데이터 생성이 완료되었습니다.
echo.

pause 