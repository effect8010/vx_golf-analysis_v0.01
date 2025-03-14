# PowerShell Script - 자동 변환됨
# 원본 배치 파일: init-database.bat
# 변환 일시: 2025-03-14T05:40:47.390Z

# 인코딩 설정
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 현재 스크립트 경로 설정
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = Split-Path -Parent $scriptPath | Split-Path -Parent

# 환경 변수 설정
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
Write-Host "골프 시뮬레이터 분석 서비스 - 데이터베이스 초기화"
Write-Host "=============================================="
Write-Host ""
Write-Host "데이터베이스를 초기화합니다..."

# 서버 디렉토리로 이동
Set-Location -Path "$rootPath\server"
# DB 초기화 스크립트 실행
& "C:\Program Files\nodejs\node.exe" "$rootPath\scripts\db-scripts\init-db.js"

Write-Host ""
Write-Host "데이터베이스 초기화가 완료되었습니다."
Write-Host ""

# 계속하려면 아무 키나 누르세요
Write-Host "계속하려면 아무 키나 누르세요..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
