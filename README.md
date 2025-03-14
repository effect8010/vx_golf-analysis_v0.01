# 골프 시뮬레이터 라운드 분석 서비스

골프 시뮬레이터 사용자의 라운드 데이터를 분석하여 다양한 인사이트를 제공하는 서비스입니다.

## 최근 개발 상태 (업데이트: 2023-03-14)

### 최종 프로젝트 구조 정리 (v0.3.0)
- 프로젝트 폴더 구조 완전 정리
  - 루트 디렉토리 정리 (불필요한 파일 제거)
  - 스크립트 파일 통합 관리를 위한 분류 체계 확립
  - PowerShell 호환성 스크립트 추가 및 개선
- 코드 중복 제거 및 최적화
  - 동일 기능 수행 스크립트 병합
  - 불필요한 로깅 제거
  - 코드 주석 개선
- 자동화 스크립트 개발 및 적용
  - 스크립트 파일 자동 분류 도구
  - 배치 파일 관리 도구
  - PowerShell 스크립트 자동 변환 도구

### 코드 리팩토링 및 성능 개선
- 클라이언트 성능 최적화
  - React 컴포넌트 지연 로딩(lazy loading) 구현
  - 페이지 로딩 시 사용자 경험 개선
  - 오류 처리 및 알림 기능 강화
- 서버 코드 구조 개선
  - 로깅 시스템 개선 (파일 기반 로깅 추가)
  - 오류 처리 미들웨어 강화
  - 프로세스 예외 처리 추가
  - API 응답 형식 표준화
- 코드 품질 향상
  - 미들웨어 문서화 및 주석 개선
  - 중복 코드 제거 및 코드 재사용성 증가
  - 코드 가독성 향상을 위한 구조 개선

### 프로젝트 구조 정리
- 스크립트 파일 체계적 분류
  - `scripts/db-scripts` : 데이터베이스 관련 스크립트
  - `scripts/test-scripts` : 테스트 및 디버깅 스크립트
  - `scripts/utils-scripts` : 유틸리티 스크립트
  - `scripts/batch-scripts` : 배치 스크립트 파일
  - `scripts/powershell-scripts` : PowerShell 호환 스크립트
- PowerShell 호환성 개선
  - 배치 파일을 PowerShell 스크립트로 자동 변환
  - 다양한 운영 환경에서의 안정성 향상
  - 스크립트 실행 도우미 추가
- 프로젝트 관리 자동화
  - 스크립트 정리 자동화 도구 개발
  - 배치 파일 관리 도구 구현
  - 로그 기록을 통한 작업 추적 개선

### 스크립트 파일 정리 및 구조화 (이전 업데이트)
- 스크립트 파일 분류 체계 구축
  - `scripts/db-scripts` : 데이터베이스 관련 스크립트 (14개 파일)
  - `scripts/test-scripts` : 테스트 및 디버깅 스크립트 (7개 파일)
  - `scripts/utils-scripts` : 유틸리티 스크립트 (12개 파일)
- 목적에 맞는 파일 이름 표준화
- 중복 파일 제거
- 스크립트 정리 자동화 툴 개발
  - 파일명 패턴 기반 카테고리 분류
  - 로그 기록을 통한 정리 내역 추적

### 코드 개선 및 버그 수정 (이전 업데이트)
- API 엔드포인트 표준화 및 일관성 유지
  - 사용자 통계 API의 `/api/stats/users/me` 엔드포인트 추가
  - 트렌드 통계 API의 `/api/stats/user-me/trends/:period/:count` 엔드포인트 추가
  - 동반자 통계 API의 `/api/stats/users/me/partner-stats` 엔드포인트 추가
- 인증 미들웨어 통합 및 개선
  - `authenticateToken`과 `authenticateJWT` 함수를 통합하여 일관성 제공
  - 토큰 오류 처리 강화 및 로그 개선
- 서버 구조 개선
  - 로깅 기능 강화
  - 오류 처리 미들웨어 개선
  - 헬스 체크 API 개선
- 대시보드 UI 개선 및 버그 수정
  - 라운드 히스토리 데이터 표시 문제 해결
  - 통계 데이터 로딩 오류 수정
  - 리소스 로딩 오류 처리 개선
  - 네트워크 오류 시 자동 재시도 로직 추가

### 골프 코스 관련 API 기능 확장 (이전 업데이트)
- 코스 수정 기능 추가
- 코스 삭제 기능 추가
- 홀 정보 수정 기능 추가
- 홀 정보 삭제 기능 추가
- 라운드 데이터 입력 스크립트 추가
  - 홀별 라운드 결과 데이터 입력
  - 샷 데이터 입력 
  - 라운드 동반자 정보 입력
- 프로젝트 정리
  - 중복 파일 및 테스트 파일 정리
  - DB 관련 스크립트를 절대 경로로 변경
  - 코드 최적화 및 불필요한 파일 제거
- 데이터베이스 구조 개선
  - 동반자 관계를 테이블에서 조회 방식으로 변경
  - `round_partners` 테이블 제거
  - 동반자 조회 API 개선
  - 사용자 비밀번호를 사용자 ID와 동일하게 설정(테스트 용이성 개선)

## 기능 개요

- 개인 라운드 분석
- 장기간 실력 변화 추적
- 동반자와의 비교 분석
- 데이터 시각화 및 인사이트 제공

## 기술 스택

### 백엔드
- Node.js
- Express
- SQLite (Better-SQLite3)
- JWT Authentication

### 프론트엔드
- React (지연 로딩 적용)
- React Router
- Material UI
- Chart.js / Recharts
- Axios
- Formik & Yup

## 프로젝트 구조

```
/
├── client/                # 프론트엔드 코드
│   ├── public/            # 정적 파일
│   └── src/
│       ├── components/    # 재사용 가능한 컴포넌트
│       ├── pages/         # 페이지 컴포넌트
│       ├── services/      # API 서비스
│       └── utils/         # 유틸리티 함수
│
├── server/                # 백엔드 코드
│   ├── controllers/       # 컨트롤러
│   ├── models/            # 데이터 모델
│   ├── routes/            # API 라우트
│   ├── middlewares/       # 미들웨어
│   └── utils/             # 유틸리티 함수
│
├── data/                  # 데이터베이스 파일
├── logs/                  # 로그 파일
└── scripts/               # 유틸리티 스크립트
    ├── db-scripts/        # 데이터베이스 관련 스크립트
    ├── test-scripts/      # 테스트 스크립트
    ├── utils-scripts/     # 기타 유틸리티 스크립트
    ├── batch-scripts/     # 배치 파일 스크립트
    └── powershell-scripts/ # PowerShell 호환 스크립트
```

## 설치 방법

### 사전 요구사항
- Node.js (v14 이상)
- npm 또는 yarn

### 전체 프로젝트 설치 (한 번에)
```bash
# 프로젝트 루트 디렉토리에서
npm run install-all
```

### 백엔드 설치
```bash
# 프로젝트 루트 디렉토리에서
cd server
npm install
```

### 프론트엔드 설치
```bash
# 프로젝트 루트 디렉토리에서
cd client
npm install
```

## 실행 방법

### Windows 환경에서 간편하게 실행 (권장)
```
start-app.bat
```
이 bat 파일은 백엔드 서버와 프론트엔드를 별도의 창에서 각각 실행합니다.
- 백엔드 서버: http://localhost:5000
- 프론트엔드: http://localhost:3000

### PowerShell 환경에서 실행 (권장)
```powershell
.\scripts\powershell-scripts\Run-Scripts.ps1
```
이 PowerShell 스크립트는 메뉴를 통해 다양한 스크립트를 선택해서 실행할 수 있습니다.

### 개발 모드에서 실행 (동시에)
```bash
# 프로젝트 루트 디렉토리에서
npm run dev
```

#### 백엔드 서버만 실행
```bash
# Windows 환경에서 실행
start-server.bat

# PowerShell 환경에서 실행
.\scripts\powershell-scripts\start-server.ps1

# 또는 npm 스크립트 사용
npm run server
```

#### 프론트엔드 개발 서버만 실행
```bash
# Windows 환경에서 실행
start-client.bat

# PowerShell 환경에서 실행
.\scripts\powershell-scripts\start-client.ps1

# 또는 npm 스크립트 사용
npm run client
```

### 데이터베이스 초기화
```bash
npm run init-db
```

### 샘플 데이터 생성
```bash
node scripts/utils-scripts/generate-sample-data.js
```

### 프론트엔드 개발 시작하기
프론트엔드 개발 환경을 빠르게 설정하려면 다음 스크립트를 실행하세요:

```bash
node scripts/utils-scripts/setup-frontend.js
```

이 스크립트는 다음 작업을 수행합니다:
- 필요한 디렉토리 구조 생성
- 기본 자산 파일 복사
- 필요한 패키지 설치

### 프로덕션 빌드 및 실행
```bash
# 프론트엔드 빌드
npm run build

# 백엔드 서버 실행 (프론트엔드 정적 파일 제공)
npm run server
```

## API 문서

주요 API 엔드포인트:

### 인증 API
- `POST /api/auth/register` - 사용자 회원가입
- `POST /api/auth/login` - 사용자 로그인
- `GET /api/auth/me` - 현재 인증된 사용자 정보 조회

### 사용자 API
- `GET /api/users/:id` - 사용자 정보 조회
- `PUT /api/users/:id` - 사용자 정보 업데이트
- `GET /api/users/:id/partners` - 사용자의 동반자 목록 조회

### 골프 코스 API
- `GET /api/courses` - 골프 코스 목록 조회
- `GET /api/courses/:id` - 특정 코스 상세 정보 조회
- `POST /api/courses` - 새 골프 코스 추가 (관리자)
- `PUT /api/courses/:id` - 골프 코스 정보 수정 (관리자)
- `DELETE /api/courses/:id` - 골프 코스 삭제 (관리자)
- `POST /api/courses/:id/courses/:courseNumber/holes` - 코스에 홀 정보 추가 (관리자)
- `PUT /api/courses/:id/courses/:courseNumber/holes/:holeId` - 홀 정보 수정 (관리자)
- `DELETE /api/courses/:id/courses/:courseNumber/holes/:holeId` - 홀 정보 삭제 (관리자)

### 라운드 API
- `GET /api/rounds` - 라운드 목록 조회
- `GET /api/rounds/history` - 최근 라운드 기록 조회
- `GET /api/rounds/:id` - 특정 라운드 상세 정보 조회
- `POST /api/rounds` - 새 라운드 기록 추가
- `GET /api/rounds/:id/shots` - 라운드의 모든 샷 정보 조회

### 샷 API
- `GET /api/shots/:id` - 특정 샷 상세 정보 조회
- `PUT /api/shots/:id` - 샷 정보 업데이트
- `POST /api/rounds/:roundId/shots` - 라운드에 새 샷 추가

### 통계 API
- `GET /api/stats/users/me` - 현재 로그인한 사용자 종합 통계 조회
- `GET /api/stats/users/:id` - 사용자 종합 통계 조회
- `GET /api/stats/users/:id/clubs/:clubType?` - 클럽별 통계 조회
- `GET /api/stats/users/:id/putting` - 퍼팅 통계 조회
- `GET /api/stats/user-me/trends/:period/:count` - 현재 로그인한 사용자의 기간별 통계 추이 조회
- `GET /api/stats/users/:id/trends/:period/:count` - 사용자의 기간별 통계 추이 조회
- `GET /api/stats/users/:id/courses/:courseId?` - 코스별 통계 조회
- `GET /api/stats/users/me/partner-stats` - 현재 로그인한 사용자의 동반자 비교 통계 조회
- `GET /api/stats/courses/:courseId/difficulty` - 특정 코스의 홀별 난이도 통계 조회

## 개발자

- 골프 시뮬레이터 분석 서비스 개발팀

## 버전 정보

- 현재 버전: 0.3.0
- 마지막 업데이트: 2023-03-14 