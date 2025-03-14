@echo off
echo 라운드 데이터 입력 스크립트를 실행합니다...
echo.

REM 현재 디렉토리 표시
echo 현재 디렉토리: %~dp0
echo.

set DATA_FILE=%1
if "%DATA_FILE%"=="" (
  echo 데이터 파일 경로가 지정되지 않았습니다. 기본 데이터를 사용합니다.
  REM Node.js 스크립트 실행
  node insert-round-data.js
) else (
  echo 데이터 파일: %DATA_FILE%
  REM Node.js 스크립트 실행 (파일 경로 전달)
  node insert-round-data.js "%DATA_FILE%"
)

echo.
echo 스크립트 실행이 완료되었습니다. 로그 파일을 확인하세요.
echo.

pause 