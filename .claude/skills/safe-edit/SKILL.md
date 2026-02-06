# Safe Edit — 안전한 코드 수정

프로덕션 코드를 안전하게 수정하는 워크플로우입니다.

## 트리거
코드 수정, 버그 수정, 스타일 변경 등 기존 코드를 변경할 때 사용합니다.

## 워크플로우

### Step 1: 현재 상태 파악
1. **수정 대상 파일 Read** — 반드시 파일 전체를 먼저 읽을 것
2. **관련 파일 탐색** — import/export 추적으로 영향받는 파일 확인
3. 특히 다음 핵심 파일과의 의존관계 확인:
   - `src/context.js` — 상태 관리
   - `src/components/CommonUI.js` — 공통 UI 컴포넌트
   - `src/services/dataService.js` — 데이터 인터페이스
   - `src/services/authService.js` — 인증
   - `src/utils.js` — 전역 유틸리티

### Step 2: 영향 범위 분석
- 수정하려는 함수/컴포넌트를 사용하는 곳 검색 (Grep)
- Props 변경 시 모든 호출부 확인
- Context 값 변경 시 모든 소비자 컴포넌트 확인
- 유틸 함수 변경 시 모든 import처 확인

### Step 3: 수정 실행
- Edit 도구를 사용하여 정확한 위치에 수정
- 기존 코드 패턴과 스타일 유지
- 불필요한 코드 추가하지 않음 (주석, docstring 등)
- `memo()`, `useCallback()` 패턴이 있다면 유지

### Step 4: CI 빌드 검증
```bash
CI=true npm run build
```
- 빌드 성공 확인
- ESLint 경고/에러 0 확인
- **실패 시**: 수정 사항 재검토 및 문제 해결

### Step 5: 결과 보고
- 변경된 파일 목록과 변경 내용 요약
- 영향받는 기능/화면 안내
- 로컬에서 확인이 필요한 동작 목록 제시

## 핵심 파일 수정 시 추가 확인
`context.js`, `authService.js`, `dataService.js`, `config.js` 수정 시:
1. 해당 파일을 사용하는 **모든** 컴포넌트/서비스 확인
2. 인터페이스(함수 시그니처, 반환값) 변경이 있는지 확인
3. 있다면 모든 호출부 업데이트
4. 빌드 확인

## 금지사항
- 파일을 읽지 않고 수정하는 것
- 영향 범위를 확인하지 않고 인터페이스를 변경하는 것
- CI 빌드를 확인하지 않고 커밋하는 것
- `.env.production` 또는 Supabase 스키마 직접 수정
