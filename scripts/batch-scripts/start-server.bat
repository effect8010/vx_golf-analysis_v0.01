@echo off
chcp 65001 > nul
set PATH=C:\Program Files\nodejs;%PATH%
echo 골프 시뮬레이터 분석 서비스 - 백엔드 시작
echo =========================================
cd ../../server
"C:\Program Files\nodejs\npm.cmd" run dev 