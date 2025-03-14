# PowerShell Script - 자동 변환됨
# 원본 배치 파일: start-app.bat
# 변환 일시: 2025-03-14T05:40:47.393Z

# 인코딩 설정
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 현재 스크립트 경로 설정
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = Split-Path -Parent $scriptPath | Split-Path -Parent

# Echo 비활성화 (PowerShell에서는 필요 없음)
# 코드 페이지 설정은 위의 인코딩 설정으로 대체됨
# 환경 변수 설정
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
Write-Host "골프 시뮬레이터 분석 서비스 - 전체 애플리케이션 시작"
Write-Host "=================================================="
# 원본 명령어 (수동 확인 필요): echo.
Write-Host "백엔드와 프론트엔드를 별도의 창에서 실행합니다..."
# 원본 명령어 (수동 확인 필요): echo.
# 
# 새 프로세스에서 스크립트 실행
Start-Process powershell -ArgumentList "-File $scriptPath\start-server.ps1"
Start-Sleep -Seconds 5
# 새 프로세스에서 스크립트 실행
Start-Process powershell -ArgumentList "-File $scriptPath\start-client.ps1"
# 
# 원본 명령어 (수동 확인 필요): echo.
Write-Host "애플리케이션이 시작되었습니다."
Write-Host "백엔드 서버: http:\\localhost:5000"
Write-Host "프론트엔드: http:\\localhost:3000"
# 원본 명령어 (수동 확인 필요): echo.
