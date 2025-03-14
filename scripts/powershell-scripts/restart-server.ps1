# PowerShell Script - 자동 변환됨
# 원본 배치 파일: restart-server.bat
# 변환 일시: 2025-03-14T05:40:47.392Z

# 인코딩 설정
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 현재 스크립트 경로 설정
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = Split-Path -Parent $scriptPath | Split-Path -Parent

# Echo 비활성화 (PowerShell에서는 필요 없음)
# 코드 페이지 설정은 위의 인코딩 설정으로 대체됨
# 환경 변수 설정
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
Write-Host "골프 시뮬레이터 분석 서비스 - 서버 재시작"
Write-Host "========================================"
# 원본 명령어 (수동 확인 필요): echo.
# 
Write-Host "이전 서버 프로세스를 종료합니다..."
# 원본 명령어 (수동 확인 필요): taskkill \FI "WINDOWTITLE eq 서버*" \T \F >nul 2>&1
# 
Write-Host "서버를 시작합니다..."
# 원본 명령어: start cmd \k "title 서버 & cd server & node index.js" (변환 필요)
# 
# 원본 명령어 (수동 확인 필요): echo.
Write-Host "서버가 재시작되었습니다."
Write-Host "백엔드 서버: http:\\localhost:5000"
# 원본 명령어 (수동 확인 필요): echo.
