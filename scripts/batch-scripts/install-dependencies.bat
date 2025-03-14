@echo off
chcp 65001 > nul
set PATH=C:\Program Files\nodejs;%PATH%
echo 골프 시뮬레이터 분석 서비스 - 종속성 설치
echo ======================================
echo.
echo 프로젝트 종속성을 설치합니다...
echo.

echo 1. 클라이언트 종속성 설치 중...
cd client
"C:\Program Files\nodejs\npm.cmd" install
echo 클라이언트 종속성 설치 완료!

echo.
echo 2. 서버 종속성 설치 중...
cd ..\server
"C:\Program Files\nodejs\npm.cmd" install
echo 서버 종속성 설치 완료!

echo.
echo 종속성 설치가 완료되었습니다.
echo.

cd ..
pause 