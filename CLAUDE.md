# 초과근무시간 관리 시스템 (Overtime Management)

## 프로젝트 개요

- **스택**: React 18 (CRA) + Supabase + Tailwind CSS (CDN) + Lucide React
- **상태관리**: React Context API (`src/context.js`)
- **인증**: Supabase Auth (AuthService 싱글톤)
- **스토리지**: Adapter Pattern (Supabase / localStorage 전환 가능)
- **호스팅**: Cloudflare Pages (`overtime.pages.dev`)
- **배포**: 브랜치 기반 자동 배포 (아래 환경 구분 참조)

## 아키텍처

```
src/
├── App.js, AuthApp.js          # 앱 진입점
├── context.js                  # OvertimeContext (핵심 상태관리)
├── dataManager.js              # 비즈니스 로직 & 계산
├── utils.js                    # 전역 유틸리티
├── components/                 # React 컴포넌트 (PascalCase)
│   ├── Dashboard.js            # 메인 대시보드
│   ├── EmployeeManagement.js   # 직원 관리
│   ├── CommonUI.js             # 공통 UI (Toast, Modal, Button)
│   └── ...
├── hooks/                      # 커스텀 훅 (useAuth, useMonthlySettings)
├── services/                   # 서비스 레이어
│   ├── authService.js          # 인증 (싱글톤)
│   ├── dataService.js          # 데이터 CRUD 인터페이스
│   ├── config.js               # 설정 관리 (싱글톤)
│   └── storage/                # 스토리지 어댑터 (Factory Pattern)
├── utils/                      # 유틸 모듈 (timeUtils, timeInputValidator)
├── lib/supabase.js             # Supabase 클라이언트
└── pages/                      # 페이지 컴포넌트
```

## 코드 컨벤션

### 파일 네이밍
- **컴포넌트**: PascalCase (`Dashboard.js`, `CommonUI.js`)
- **훅**: camelCase + `use` 접두사 (`useAuth.js`)
- **서비스**: camelCase (`authService.js`, `dataService.js`)
- **유틸**: camelCase (`timeUtils.js`)

### import 순서
1. React / React 훅
2. 외부 라이브러리 (lucide-react, @supabase)
3. 내부 서비스/유틸
4. 컴포넌트
5. 스타일/상수

### 코드 패턴
- 싱글톤: `getInstance()` 정적 메서드 (AuthService, ConfigService)
- 팩토리: `createStorageAdapter()` (스토리지 선택)
- 메모이제이션: `memo()`, `useCallback()` 적극 사용
- ESLint: `react-app` 설정 확장, `no-irregular-whitespace` / `no-control-regex` off

## 필수 안전 규칙

### 코드 수정 전
1. **반드시 해당 파일을 Read 한 후** 수정할 것
2. 관련 파일의 import/export 체인을 확인하여 **영향 범위 파악**
3. 핵심 파일 수정 시 각별히 주의:
   - `context.js` — 전체 앱 상태에 영향
   - `authService.js` — 인증 흐름 전체에 영향
   - `dataService.js` — 모든 데이터 CRUD에 영향
   - `services/storage/` — 데이터 영속성에 영향
   - `config.js` — 환경 설정 전체에 영향

### 빌드 & 배포
- **커밋 전 반드시** `CI=true npm run build` **통과 확인**
- CI=true 환경에서 ESLint 경고도 에러로 처리됨
- eslint-disable 주석은 **dependency array 바로 윗줄**에 배치
- 빌드 실패 시 절대 커밋/푸시하지 않을 것

### 절대 금지 사항
- `.env.production` 직접 수정 금지 (사용자 확인 필수)
- Supabase 스키마/RLS 정책 변경 금지 (사용자 확인 필수)
- `node_modules/`, `build/` 디렉토리 커밋 금지
- 프로덕션 Supabase 데이터 직접 조작 금지
- `--no-verify` 플래그 사용 금지

## 커밋 규칙

- **Conventional Commits** (한글 메시지):
  - `feat: 새로운 기능 설명`
  - `fix: 버그 수정 설명`
  - `refactor: 리팩토링 설명`
  - `style: 스타일/UI 변경 설명`
  - `chore: 기타 작업 설명`
  - `docs: 문서 변경 설명`
- Co-Authored-By 포함
- 커밋 전 `CI=true npm run build` 통과 필수

## 환경 구분

| 환경 | 브랜치 | URL | Supabase |
|------|--------|-----|----------|
| **Dev** | `feature/*` | localhost:3000 | dev 프로젝트 |
| **Staging** | `dev` | dev.overtime.pages.dev | dev 프로젝트 |
| **Production** | `main` | overtime.pages.dev | 프로덕션 프로젝트 |

### 브랜치 전략
```
feature/* → dev (staging 확인) → main (프로덕션)
```

### 배포 경로
- **Staging**: `dev` 브랜치 push → Cloudflare Pages Preview 자동 배포
- **Production**: `main` 브랜치 push → Cloudflare Pages Production 자동 배포
- **절대 `feature/*`에서 `main`으로 직접 merge 금지** — 반드시 `dev` 거쳐야 함

### 작업 기본 브랜치
- 모든 작업은 `dev` 기반으로 `feature/*` 브랜치 생성
- 작업 완료 → `dev`에 merge → staging 확인 → `main`에 merge

## 환경 변수

- `REACT_APP_USE_SUPABASE` — Supabase 사용 여부
- `REACT_APP_SUPABASE_URL` — Supabase URL
- `REACT_APP_SUPABASE_ANON_KEY` — Supabase 익명 키
- `.env.local` — 로컬 개발용 dev Supabase (git 미포함)
- Cloudflare Pages Production 환경변수 — 프로덕션 Supabase (변경 금지)
- Cloudflare Pages Preview 환경변수 — dev Supabase
