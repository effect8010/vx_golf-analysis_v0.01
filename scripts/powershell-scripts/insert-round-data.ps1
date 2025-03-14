# PowerShell Script - 자동 변환됨
# 원본 배치 파일: insert-round-data.bat
# 변환 일시: 2025-03-14T05:40:47.391Z

# 인코딩 설정
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 현재 스크립트 경로 설정
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = Split-Path -Parent $scriptPath | Split-Path -Parent

# Echo 비활성화 (PowerShell에서는 필요 없음)
Write-Host "라운드 데이터 입력 스크립트를 실행합니다..."
# 원본 명령어 (수동 확인 필요): echo.
# 
# 현재 디렉토리 표시
Write-Host "현재 디렉토리: %~dp0"
# 원본 명령어 (수동 확인 필요): echo.
# 
# 원본 명령어 (수동 확인 필요): set DATA_FILE=%1
# 원본 명령어 (수동 확인 필요): if "%DATA_FILE%"=="" (
Write-Host "데이터 파일 경로가 지정되지 않았습니다. 기본 데이터를 사용합니다."
# Node.js 스크립트 실행
node "insert-round-data.js"
# 원본 명령어 (수동 확인 필요): ) else (
Write-Host "데이터 파일: %DATA_FILE%"
# Node.js 스크립트 실행 (파일 경로 전달)
node "insert-round-data.js "%DATA_FILE%""
# 원본 명령어 (수동 확인 필요): )
# 
# 원본 명령어 (수동 확인 필요): echo.
Write-Host "스크립트 실행이 완료되었습니다. 로그 파일을 확인하세요."
# 원본 명령어 (수동 확인 필요): echo.
# 
# 원본 명령어 (수동 확인 필요): pause
