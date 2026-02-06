# 프로덕션 안전 규칙

이 프로젝트는 실제 운영 중인 서비스(`overtime.pages.dev`)입니다.
모든 변경은 `main` push 즉시 프로덕션에 반영됩니다.

## 절대 하면 안 되는 것

### 환경/인프라
- `.env.production` 직접 수정 (사용자 확인 없이)
- 환경 변수 값을 코드에 하드코딩
- `package.json`의 `homepage` 값 변경
- `public/_redirects` 삭제 또는 수정
- `node_modules/`, `build/` 커밋

### Supabase
- 테이블 스키마 변경 (CREATE, ALTER, DROP)
- RLS 정책 수정 또는 비활성화
- 프로덕션 데이터 직접 INSERT/UPDATE/DELETE
- Supabase 키 또는 URL 변경
- `supabase.js` 클라이언트 초기화 로직 변경 (확인 없이)

### Git/배포
- `--no-verify` 플래그 사용
- `git push --force` (특히 main, dev 브랜치)
- `git reset --hard`
- CI 빌드 실패 상태에서 커밋/푸시
- `.gitignore` 에서 보안 관련 항목 제거
- `feature/*` 브랜치에서 `main`으로 직접 merge (반드시 `dev` 경유)
- `dev` staging 확인 없이 `main`에 merge

### 코드
- 파일을 Read 하지 않고 수정
- 인증/권한 체크 로직 제거 또는 우회
- 에러 핸들링을 제거하여 빈 화면/크래시 유발
- `AuthWrapper`, `AuthService` 인증 흐름 무력화

## 주의가 필요한 작업 (사용자 확인 필요)

- `context.js` 상태 구조 변경
- `authService.js` 인증 흐름 수정
- `services/storage/` 어댑터 인터페이스 변경
- 새로운 npm 패키지 추가
- `App.js` 라우팅/탭 구조 변경
- `dataManager.js` 계산 로직 변경

## 프로덕션 데이터 보호

- 모든 데이터 조작은 Supabase RLS를 통해서만
- 사용자의 company_id 범위 내에서만 데이터 접근
- 관리자/일반사용자 권한 구분 유지
- 삭제 작업은 soft delete 우선 고려

## 빌드 안전

- `CI=true npm run build` 는 ESLint 경고를 에러로 처리
- 사용하지 않는 변수/import는 반드시 제거
- `eslint-disable` 주석은 최후 수단, dependency array 윗줄에 배치
- `// eslint-disable-next-line` 사용 시 비활성화할 규칙명 명시
