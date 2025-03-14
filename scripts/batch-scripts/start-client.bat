@echo off
chcp 65001 > nul
set PATH=C:\Program Files\nodejs;%PATH%
echo 골프 시뮬레이터 분석 서비스 - 프론트엔드 시작
echo =============================================
cd ../../client
"C:\Program Files\nodejs\npm.cmd" start 