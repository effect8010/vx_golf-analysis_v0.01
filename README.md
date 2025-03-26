# 골프 시뮬레이터 라운드 분석 서비스

골프 시뮬레이터 사용자의 라운드 데이터를 분석하여 다양한 인사이트를 제공하는 서비스입니다.

[![GitHub Pages 배포](https://github.com/effect8010/vx_golf-analysis_v0.01/actions/workflows/github-pages.yml/badge.svg)](https://github.com/effect8010/vx_golf-analysis_v0.01/actions/workflows/github-pages.yml)
[![코드 품질](https://github.com/effect8010/vx_golf-analysis_v0.01/actions/workflows/code-quality.yml/badge.svg)](https://github.com/effect8010/vx_golf-analysis_v0.01/actions/workflows/code-quality.yml)

## 최근 개발 상태 (업데이트: 2023-03-25)

### GitHub 생태계 100% 활용 아키텍처 (v0.6.0)
- **데이터 관리**
  - 정적 JSON 파일로 데이터 저장 및 관리
  - GitHub 저장소에 데이터 직접 저장
  - 데이터 가공 로직을 클라이언트 측에서 처리
- **개발 환경**
  - GitHub Codespaces로 완전 통합된 개발 환경 구축
  - VS Code 통합 및 필수 확장 기능 자동 설정
- **배포 자동화**
  - GitHub Actions를 통한 GitHub Pages 자동 배포
  - 정적 사이트 생성 및 배포 워크플로우
  - 빌드 시점에 데이터 전처리 및 최적화
- **프로젝트 관리**
  - 이슈 템플릿 및 프로젝트 보드 구성
  - GitHub Discussions으로 커뮤니케이션 강화
  - 코드 품질 관리 및 자동화된 코드 리뷰

### GitHub Pages 배포를 위한 아키텍처 개선 (v0.5.0)
- **정적 API 도입**
  - 외부 데이터베이스 대신 정적 JSON 파일 활용
  - 빌드 시점에 데이터 가공 및 API 응답 생성
  - 클라이언트 측 캐싱 최적화
- **클라이언트 애플리케이션 최적화**
  - SPA(Single Page Application) 구조 강화
  - 코드 분할 및 지연 로딩 구현
  - 오프라인 기능 지원 (PWA)

## 기능 개요

- 개인 라운드 분석
- 장기간 실력 변화 추적
- 동반자와의 비교 분석
- 데이터 시각화 및 인사이트 제공

## 기술 스택

### 프론트엔드
- React (지연 로딩 적용)
- React Router (해시 라우팅)
- Material UI
- Chart.js / Recharts
- Axios
- Formik & Yup

### 데이터 관리
- 정적 JSON 파일
- 클라이언트 측 데이터 처리 및 캐싱
- LocalStorage를 활용한 사용자 설정 저장

### DevOps
- GitHub Actions (CI/CD)
- GitHub Pages (배포)
- GitHub Codespaces (개발 환경)

## 프로젝트 구조

```
/
├── public/
│   ├── data/               # 정적 JSON 데이터 파일
│   │   ├── rounds/         # 라운드 데이터
│   │   ├── users/          # 사용자 데이터
│   │   ├── courses/        # 골프 코스 데이터
│   │   └── statistics/     # 통계 데이터
│   │
│   ├── api/                # 정적 API 응답 (빌드 시 생성)
│   │   ├── v1/rounds/      # 라운드 API
│   │   ├── v1/users/       # 사용자 API
│   │   └── v1/stats/       # 통계 API
│   │
│   └── assets/             # 정적 자산 (이미지, 아이콘 등)
│
├── src/
│   ├── components/         # 재사용 가능한 컴포넌트
│   ├── pages/              # 페이지 컴포넌트
│   ├── hooks/              # 커스텀 React 훅
│   ├── services/           # 데이터 서비스
│   ├── utils/              # 유틸리티 함수
│   └── contexts/           # React 컨텍스트
│
├── scripts/                # 빌드 및 데이터 처리 스크립트
│   ├── build-api.js        # 정적 API 생성 스크립트
│   ├── process-data.js     # 데이터 전처리 스크립트
│   └── optimize-assets.js  # 자산 최적화 스크립트
│
├── .devcontainer/          # GitHub Codespaces 설정
│
├── .github/                # GitHub 관련 설정
│   ├── ISSUE_TEMPLATE/     # 이슈 템플릿
│   └── workflows/          # GitHub Actions 워크플로우
│
└── docs/                   # 문서
```

## 개발 환경 설정

### GitHub Codespaces (권장)
가장 간단한 방법은 GitHub Codespaces를 사용하는 것입니다:

1. 이 저장소에서 "Code" 버튼 클릭
2. "Codespaces" 탭 선택
3. "Create codespace on main" 클릭

Codespaces에서는 모든 필요한 도구와 종속성이 자동으로 설정됩니다.

### 로컬 환경 설정
로컬에서 개발하려면:

```bash
# 저장소 클론
git clone https://github.com/effect8010/vx_golf-analysis_v0.01.git
cd vx_golf-analysis_v0.01

# 종속성 설치
npm install
cd client && npm install

# 개발 서버 실행
npm start
```

## CI/CD 파이프라인

이 프로젝트는 GitHub Actions를 통한 자동화된 배포 파이프라인을 사용합니다:

1. **코드 품질 검사**: 코드 푸시 시 자동으로 린팅 및 테스트 실행
2. **데이터 가공**: 빌드 시점에 정적 데이터 파일 가공 및 최적화
3. **정적 API 생성**: JSON 파일 기반 API 응답 생성
4. **프론트엔드 빌드**: React 애플리케이션 빌드
5. **GitHub Pages 배포**: 빌드된 웹사이트 자동 배포

## 데이터 구조

모든 데이터는 `public/data` 폴더 내 JSON 파일로 저장됩니다:

- `rounds/` - 라운드 관련 데이터
- `users/` - 사용자 정보
- `courses/` - 골프 코스 정보
- `statistics/` - 사전 계산된 통계 데이터

## 기여 방법

1. 이 저장소를 포크하세요
2. 기능 브랜치를 생성하세요 (`git checkout -b feature/amazing-feature`)
3. 변경 사항을 커밋하세요 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/amazing-feature`)
5. Pull Request를 열어주세요

## 개발자

- 골프 시뮬레이터 분석 서비스 개발팀

## 버전 정보

- 현재 버전: 0.6.0
- 마지막 업데이트: 2023-03-25 