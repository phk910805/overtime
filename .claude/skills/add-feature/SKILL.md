# Add Feature — 기능 추가

기존 아키텍처에 맞게 새 기능을 추가하는 워크플로우입니다.

## 트리거
새로운 기능, 화면, 컴포넌트를 추가할 때 사용합니다.

## 워크플로우

### Step 1: 아키텍처 패턴 확인
1. 유사한 기존 기능의 구현 방식 확인
2. 프로젝트에서 사용하는 패턴 파악:
   - **컴포넌트**: `src/components/` — PascalCase, `memo()` 래핑
   - **훅**: `src/hooks/` — `use` 접두사, 상태 + 로직 캡슐화
   - **서비스**: `src/services/` — 싱글톤 패턴, `getInstance()`
   - **스토리지**: `src/services/storage/` — Adapter + Factory 패턴
   - **유틸**: `src/utils/` 또는 `src/utils.js`
   - **공통 UI**: `src/components/CommonUI.js` — Toast, Modal, Button 등

### Step 2: 영향 범위 및 재사용 대상 파악
- 기존 컴포넌트/유틸 중 재사용 가능한 것 확인
- `CommonUI.js`의 공통 컴포넌트 (Modal, Toast, Button 등) 우선 사용
- `utils.js`, `timeUtils.js`의 기존 유틸 함수 활용
- 새로운 유틸/컴포넌트는 정말 필요한 경우에만 생성

### Step 3: 구현
- 기존 파일 구조와 네이밍 컨벤션 준수
- Tailwind CSS 클래스 사용 (인라인 스타일은 동적 값에만)
- `memo()`, `useCallback()` 등 성능 최적화 패턴 적용
- 새 컴포넌트는 `src/components/`에 생성
- Context 확장이 필요하면 `context.js`에 추가 (주의!)

### Step 4: 통합 확인
- 새 컴포넌트를 사용하는 부모 컴포넌트에 정확히 import
- Context에 새 값을 추가했다면 Provider 업데이트 확인
- 라우팅/탭 변경이 필요하면 `App.js` 수정

### Step 5: CI 빌드 검증
```bash
CI=true npm run build
```
- 빌드 성공 확인
- 사용하지 않는 import나 변수가 없는지 확인 (CI에서 경고→에러)

### Step 6: 커밋
- Conventional Commits 형식: `feat: 기능 설명`
- 변경된 파일 목록과 기능 설명 포함

## 파일 생성 가이드

| 유형 | 위치 | 네이밍 | 패턴 |
|------|------|--------|------|
| 컴포넌트 | `src/components/` | PascalCase.js | `memo()` 래핑, props 구조분해 |
| 훅 | `src/hooks/` | useName.js | 상태 + 이펙트 캡슐화 |
| 서비스 | `src/services/` | nameService.js | 싱글톤, `getInstance()` |
| 유틸 | `src/utils/` | name.js | 순수 함수 |
| 페이지 | `src/pages/` | NamePage.js | 페이지 레벨 컴포넌트 |

## 금지사항
- 기존 패턴을 무시하고 새로운 패턴 도입
- 불필요한 파일 생성 (기존 파일에 추가 가능한 경우)
- CommonUI에 이미 있는 컴포넌트를 중복 구현
- 사용하지 않는 import 남기기 (CI 빌드 실패 원인)
