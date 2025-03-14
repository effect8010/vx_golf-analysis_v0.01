/**
 * PowerShell 호환성 문제 해결 유틸리티
 * 배치 파일의 PowerShell 호환성 문제를 해결하고 새로운 PowerShell 스크립트를 생성합니다.
 */
const fs = require('fs');
const path = require('path');

// 로그 파일 설정
const logFile = path.join(__dirname, 'powershell-compatibility.log');
let logContent = `PowerShell 호환성 개선 시작: ${new Date().toISOString()}\n\n`;

// 배치 파일 디렉토리
const batchDir = path.join(__dirname, 'scripts', 'batch-scripts');
// PowerShell 스크립트 디렉토리
const psDir = path.join(__dirname, 'scripts', 'powershell-scripts');

// PowerShell 디렉토리가 없으면 생성
if (!fs.existsSync(psDir)) {
  try {
    fs.mkdirSync(psDir, { recursive: true });
    logContent += `디렉토리 생성됨: ${psDir}\n`;
  } catch (err) {
    logContent += `오류: 디렉토리 생성 실패 - ${psDir} - ${err.message}\n`;
  }
}

// 배치 파일 목록 가져오기
const batFiles = fs.readdirSync(batchDir)
  .filter(file => file.endsWith('.bat'));

logContent += `변환할 배치 파일 수: ${batFiles.length}\n\n`;

// 배치 파일을 PowerShell 스크립트로 변환
batFiles.forEach(batFile => {
  const batPath = path.join(batchDir, batFile);
  const psFile = batFile.replace('.bat', '.ps1');
  const psPath = path.join(psDir, psFile);
  
  try {
    // 배치 파일 내용 읽기
    const batContent = fs.readFileSync(batPath, 'utf8');
    
    // PowerShell 스크립트로 변환
    let psContent = '# PowerShell Script - 자동 변환됨\n';
    psContent += '# 원본 배치 파일: ' + batFile + '\n';
    psContent += '# 변환 일시: ' + new Date().toISOString() + '\n\n';
    
    // UTF-8 인코딩 설정
    psContent += '# 인코딩 설정\n';
    psContent += '[Console]::OutputEncoding = [System.Text.Encoding]::UTF8\n\n';
    
    // 경로 설정
    psContent += '# 현재 스크립트 경로 설정\n';
    psContent += '$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path\n';
    psContent += '$rootPath = Split-Path -Parent $scriptPath | Split-Path -Parent\n\n';
    
    // 배치 파일 명령어를 PowerShell 명령어로 변환
    let batLines = batContent.split('\n');
    batLines.forEach(line => {
      // 주석 또는 빈 줄 유지
      if (line.trim().startsWith('::') || line.trim().startsWith('REM') || line.trim() === '') {
        psContent += '# ' + line.trim().replace(/^::|^REM/, '').trim() + '\n';
        return;
      }
      
      // @echo off 제거
      if (line.trim().toLowerCase() === '@echo off') {
        psContent += '# Echo 비활성화 (PowerShell에서는 필요 없음)\n';
        return;
      }
      
      // chcp 명령 변환
      if (line.trim().startsWith('chcp')) {
        psContent += '# 코드 페이지 설정은 위의 인코딩 설정으로 대체됨\n';
        return;
      }
      
      // set PATH 명령 변환
      if (line.trim().startsWith('set PATH=')) {
        psContent += '# 환경 변수 설정\n';
        psContent += '$env:PATH = "C:\\Program Files\\nodejs;" + $env:PATH\n';
        return;
      }
      
      // echo 명령 변환
      if (line.trim().startsWith('echo ')) {
        const echoText = line.trim().substring(5).trim();
        if (echoText === '.') {
          psContent += 'Write-Host ""\n';
        } else {
          psContent += 'Write-Host "' + echoText.replace(/"/g, '`"') + '"\n';
        }
        return;
      }
      
      // start cmd 명령 변환
      if (line.trim().startsWith('start cmd')) {
        // 시작할 배치 파일 경로 추출
        const match = line.match(/"([^"]+\.bat)"/);
        if (match) {
          const batchToRun = match[1];
          psContent += '# 새 프로세스에서 스크립트 실행\n';
          psContent += 'Start-Process powershell -ArgumentList "-File $scriptPath\\' + batchToRun.replace('.bat', '.ps1') + '"\n';
        } else {
          psContent += '# 원본 명령어: ' + line.trim() + ' (변환 필요)\n';
        }
        return;
      }
      
      // timeout 명령 변환
      if (line.trim().startsWith('timeout')) {
        psContent += 'Start-Sleep -Seconds 5\n';
        return;
      }
      
      // cd 명령 변환
      if (line.trim().startsWith('cd ')) {
        const cdPath = line.trim().substring(3).trim();
        psContent += 'Set-Location -Path "' + cdPath.replace(/\//g, '\\') + '"\n';
        return;
      }
      
      // node 실행 명령 변환
      if (line.trim().startsWith('node ')) {
        const nodePath = line.trim().substring(5).trim();
        psContent += 'node "' + nodePath.replace(/\//g, '\\') + '"\n';
        return;
      }
      
      // npm 명령 변환
      if (line.trim().startsWith('npm ')) {
        psContent += line.trim().replace(/\//g, '\\') + '\n';
        return;
      }
      
      // 기타 명령어는 그대로 유지 (주석으로 표시)
      psContent += '# 원본 명령어 (수동 확인 필요): ' + line.trim() + '\n';
    });
    
    // 파일 쓰기
    fs.writeFileSync(psPath, psContent);
    logContent += `변환됨: ${batFile} -> ${psFile}\n`;
  } catch (err) {
    logContent += `오류: 파일 변환 실패 - ${batFile} - ${err.message}\n`;
  }
});

// 실행 래퍼 스크립트 생성
const wrapperPath = path.join(psDir, 'Run-Scripts.ps1');

let wrapperContent = `# PowerShell 스크립트 실행 도우미
# 생성 일시: ${new Date().toISOString()}

# 관리자 권한 확인 및 요청
function Test-Admin {
    $currentUser = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    $currentUser.IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)
}

if (-not (Test-Admin)) {
    $scriptPath = $MyInvocation.MyCommand.Path
    Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File \`"$scriptPath\`"" -Verb RunAs
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
`;

try {
  fs.writeFileSync(wrapperPath, wrapperContent);
  logContent += `래퍼 스크립트 생성됨: Run-Scripts.ps1\n`;
} catch (err) {
  logContent += `오류: 래퍼 스크립트 생성 실패 - ${err.message}\n`;
}

// 로그 파일 작성
logContent += `\nPowerShell 호환성 개선 완료: ${new Date().toISOString()}\n`;
fs.writeFileSync(logFile, logContent);

console.log(`PowerShell 호환성 개선이 완료되었습니다. 로그 파일: ${logFile}`); 