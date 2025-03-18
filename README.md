# 골프 시뮬레이터 라운드 분석 서비스

골프 시뮬레이터 사용자의 라운드 데이터를 분석하여 다양한 인사이트를 제공하는 서비스입니다.

[![Deploy Infrastructure](https://github.com/effect8010/vx_golf-analysis_v0.01/actions/workflows/deploy-infrastructure.yml/badge.svg)](https://github.com/effect8010/vx_golf-analysis_v0.01/actions/workflows/deploy-infrastructure.yml)
[![CI/CD Pipeline](https://github.com/effect8010/vx_golf-analysis_v0.01/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/effect8010/vx_golf-analysis_v0.01/actions/workflows/ci-cd.yml)
[![API 문서](https://github.com/effect8010/vx_golf-analysis_v0.01/actions/workflows/api-docs.yml/badge.svg)](https://github.com/effect8010/vx_golf-analysis_v0.01/actions/workflows/api-docs.yml)

## 최근 개발 상태 (업데이트: 2023-03-18)

### GitHub 생태계 100% 활용 아키텍처 (v0.5.0)
- 개발 환경
  - GitHub Codespaces로 완전 통합된 개발 환경 구축
  - 컨테이너화된 개발 환경 내 MongoDB 내장
  - VS Code 통합 및 필수 확장 기능 자동 설정
- 인프라 관리
  - Terraform + GitHub Actions로 MongoDB Atlas 클러스터 자동 프로비저닝
  - 인프라 변경 사항 자동 감지 및 적용
  - 환경별 설정 관리 (개발, 테스트, 프로덕션)
- 배포 자동화
  - GitHub Actions로 CI/CD 파이프라인 완전 자동화
  - AWS Lambda를 사용한 서버리스 백엔드 배포
  - 테스트, 빌드, 배포 과정 통합
- 백엔드 아키텍처
  - MongoDB Atlas 데이터베이스 연동
  - 서버리스 아키텍처로 확장성 및 비용 효율성 확보
  - API 문서 자동 생성 및 배포
- 프로젝트 관리
  - 이슈 템플릿 및 프로젝트 보드 구성
  - GitHub Discussions으로 커뮤니케이션 강화
  - 코드 품질 관리 및 자동화된 코드 리뷰

### 웹 배포를 위한 아키텍처 개선 (v0.4.0)
- 데이터베이스를 SQLite에서 MongoDB로 마이그레이션
  - 클라우드 호스팅 지원을 위한 MongoDB Atlas 도입
  - 데이터 모델 재설계 및 스키마 최적화
  - 마이그레이션 스크립트 개발
- 백엔드 서버 클라우드 배포
  - 서버리스 아키텍처로 전환 (AWS Lambda)
  - 환경 변수 및 설정 파일 최적화
  - CI/CD 파이프라인 구성 (GitHub Actions)
- 프론트엔드 배포 개선
  - GitHub Pages 배포 최적화
  - 해시 라우팅 개선
  - API 연결 설정 최적화

## 기능 개요

- 개인 라운드 분석
- 장기간 실력 변화 추적
- 동반자와의 비교 분석
- 데이터 시각화 및 인사이트 제공

## 기술 스택

### 백엔드
- Node.js
- Express
- AWS Lambda (서버리스)
- MongoDB Atlas
- Mongoose

### 프론트엔드
- React (지연 로딩 적용)
- React Router
- Material UI
- Chart.js / Recharts
- Axios
- Formik & Yup

### 인프라 및 DevOps
- GitHub Actions (CI/CD)
- Terraform (IaC)
- AWS Lambda
- GitHub Codespaces
- MongoDB Atlas

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
│   ├── config/            # 설정 파일
│   ├── controllers/       # 컨트롤러
│   ├── models/            # 데이터 모델
│   ├── routes/            # API 라우트
│   ├── middlewares/       # 미들웨어
│   └── utils/             # 유틸리티 함수
│
├── scripts/               # 유틸리티 스크립트
│   ├── db-scripts/        # 데이터베이스 관련 스크립트
│   ├── migration/         # 데이터 마이그레이션 스크립트
│   ├── test-scripts/      # 테스트 스크립트
│   └── utils-scripts/     # 기타 유틸리티 스크립트
│
├── terraform/             # 인프라 코드 (IaC)
│
├── .devcontainer/         # GitHub Codespaces 설정
│
├── .github/               # GitHub 관련 설정
│   ├── ISSUE_TEMPLATE/    # 이슈 템플릿
│   └── workflows/         # GitHub Actions 워크플로우
│
└── docs/                  # 문서
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
cd server && npm install
cd ../client && npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 필요한 설정을 입력하세요
```

## CI/CD 파이프라인

이 프로젝트는 완전 자동화된 CI/CD 파이프라인을 사용합니다:

1. **테스트**: 코드 푸시 시 자동으로 테스트 실행
2. **인프라 배포**: Terraform을 통해 필요한 인프라 자동 생성
3. **백엔드 배포**: AWS Lambda를 사용한 서버리스 배포
4. **프론트엔드 배포**: GitHub Pages에 자동 배포
5. **문서 생성**: API 문서 자동 생성 및 배포

## API 문서

API 문서는 자동으로 생성되어 다음 주소에서 확인 가능합니다:
https://effect8010.github.io/vx_golf-analysis_v0.01/docs/api/

## 기여 방법

1. 이 저장소를 포크하세요
2. 기능 브랜치를 생성하세요 (`git checkout -b feature/amazing-feature`)
3. 변경 사항을 커밋하세요 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/amazing-feature`)
5. Pull Request를 열어주세요

## 개발자

- 골프 시뮬레이터 분석 서비스 개발팀

## 버전 정보

- 현재 버전: 0.5.0
- 마지막 업데이트: 2023-03-18 