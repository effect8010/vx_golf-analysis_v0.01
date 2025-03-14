# PowerShell 스크립트 실행 도우미
# 생성 일시: 2025-03-14T05:40:47.395Z

# 관리자 권한 확인 및 요청
function Test-Admin {
    $currentUser = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    $currentUser.IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)
}

if (-not (Test-Admin)) {
    $scriptPath = $MyInvocation.MyCommand.Path
    Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`"" -Verb RunAs
    exit
}

# 실행 정책 설정
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force

# 스크립트 경로 설정
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# 사용 가능한 스크립트 목록
$scripts = Get-ChildItem -Path $scriptPath -Filter "*.ps1" | Where-Object { $_.Name -ne "Run-Scripts.ps1" }

Write-Host "============================================"
Write-Host "     골프 시뮬레이터 분석 서비스 도우미     "
Write-Host "============================================"
Write-Host ""
Write-Host "실행할 스크립트를 선택하세요:"
Write-Host ""

for ($i = 0; $i -lt $scripts.Count; $i++) {
    Write-Host "$($i+1). $($scripts[$i].Name.Replace('.ps1', ''))"
}

Write-Host ""
$selection = Read-Host "번호를 입력하세요 (취소하려면 'q' 입력)"

if ($selection -eq 'q') {
    exit
}

$scriptIndex = [int]$selection - 1
if ($scriptIndex -ge 0 -and $scriptIndex -lt $scripts.Count) {
    $selectedScript = $scripts[$scriptIndex].FullName
    Write-Host "스크립트 실행 중: $($scripts[$scriptIndex].Name)" -ForegroundColor Green
    & $selectedScript
} else {
    Write-Host "잘못된 선택입니다." -ForegroundColor Red
}

Write-Host "계속하려면 아무 키나 누르세요..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
