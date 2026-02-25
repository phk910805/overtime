# 디자인 시스템 적용 규칙

## 디자인 시스템 사용 여부 판단

디자인 시스템은 **선택적**이다. UI 작업 요청 시 아래 기준으로 판단:

- "OO 디자인 시스템으로" 명시 → 해당 DS 워크플로우 적용
- 디자인 시스템 언급 없음 + 등록된 DS 없음 → **기존 프로젝트 스타일 패턴**으로 구현
- 디자인 시스템 언급 없음 + 등록된 DS 1개 이상 → **어떤 디자인 시스템을 적용할지 사용자에게 질문** 후 진행

---

## A. 디자인 시스템 없이 작업 (기본)

기존 코드베이스의 스타일 패턴을 따른다:

- **Primary**: blue-600 계열
- **Success**: green-600
- **Warning**: orange-500
- **Error/Danger**: red-600
- **Background**: gray-50 (페이지), white (카드/모달)
- **Text**: gray-900 (기본), gray-700 (보조), gray-500 (설명)
- **Font**: text-sm (본문), text-lg font-medium (제목), text-xs (레이블)
- **Radius**: rounded-lg (버튼/모달), rounded-md (입력필드)
- **Spacing**: px-4 py-2 (버튼), px-3 py-2 (입력필드), p-6 (모달)
- 기존 CommonUI.js 컴포넌트(Modal, Toast, Button 등) 재사용 우선

---

## B. 디자인 시스템 적용 시 워크플로우

### 등록된 디자인 시스템

| DS | MCP 서버 | Skill | Figma fileKey | 트리거 키워드 |
|----|---------|-------|---------------|-------------|
| Wanted Design System | `wds-mcp-server` | `wds-react` | `avRUqtDeoui3K1UkB0FwBi` | "원티드", "WDS" |
| Material Design 3 | `material3` | `m3-react` | `OaM3Z7IOEaMGPRqfUKiv5d` | "머티리얼", "M3", "Material" |

### 워크플로우 (모든 DS 공통)

#### 1단계: 토큰/스펙 확인 (DS MCP)
- 해당 DS의 MCP 서버로 컴포넌트/토큰/아이콘 조회
- WDS: `mcp__wds-mcp-server__*` (9개 도구)
- M3: `mcp__material3__*` (5개 도구)
- 기존 CommonUI.js 컴포넌트(Modal, Toast, Button 등) 재사용 우선

#### 2단계: 시각적 확인 필요 시 Figma 조회 (일 200회 제한)
- `get_design_context(fileKey, nodeId)` — 구조화된 디자인 데이터
- `get_screenshot(fileKey, nodeId)` — 시각적 레퍼런스
- 1단계에서 스펙을 확인한 후, 레이아웃/배치 확인이 필요할 때만 사용

#### 3단계: 구현
- Tailwind CSS 유틸리티 클래스 사용 (CDN 기반)
- 디자인 토큰 값을 Tailwind 클래스 + inline style로 매핑
- 기존 프로젝트 패턴(색상, 간격, 타이포) 유지
