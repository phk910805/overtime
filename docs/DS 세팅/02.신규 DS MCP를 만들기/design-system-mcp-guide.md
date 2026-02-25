# 디자인 시스템 MCP+Skill 구축 가이드

> 목표: 어떤 디자인 시스템이든 WDS와 동일한 MCP+Skill 구조로 AI가 참조하도록 세팅하는 방법
> 참고 모델: Wanted Design System 플러그인 (wanteddev/claude-skills-front)
> 작성일: 2026-02-25 / WDS MCP 9개 도구 실제 호출 분석 기반

---

## 1. 전체 아키텍처

```
디자인 시스템 AI 연동 = MCP 서버 (데이터 제공) + Skill (워크플로우 안내)

┌─ MCP Server ─────────────────────────────────────┐
│  AI가 "조회"할 수 있는 도구 9개                     │
│  ┌─────────────────┐  ┌─────────────────────────┐ │
│  │ 가이드라인 (3개)  │  │ 데이터 조회 (6개)        │ │
│  │ getting_started  │  │ list_components         │ │
│  │ coding_guidelines│  │ get_component(name)     │ │
│  │ get_color_usage  │  │ list_tokens             │ │
│  │                  │  │ list_icons              │ │
│  │                  │  │ list_utility_functions   │ │
│  │                  │  │ get_utility_function(name)│ │
│  └─────────────────┘  └─────────────────────────┘ │
└──────────────────────────────────────────────────┘

┌─ Skill (SKILL.md) ───────────────────────────────┐
│  AI가 "어떤 순서로" 도구를 사용할지 안내             │
│  1. 코딩 가이드라인 확인 (필수)                     │
│  2. 컴포넌트 목록 → 상세 조회                       │
│  3. 토큰 적용 (하드코딩 금지)                       │
│  4. 아이콘 사용                                    │
│  5. 유틸리티 활용                                   │
│  6. 체크리스트 검증                                 │
└──────────────────────────────────────────────────┘
```

### 파일 구조

```
.claude/
├── mcp.json                    ← MCP 서버 등록 (npx 명령)
└── skills/
    └── {ds-name}-react/
        └── SKILL.md            ← Skill 정의 (워크플로우)
```

---

## 2. MCP 서버 — 도구별 데이터 구조 분석

### 2-1. `getting_started` (설치 가이드)

**목적**: 프로젝트에 디자인 시스템을 처음 셋팅할 때 필요한 정보

**WDS 반환 내용 구조**:
```markdown
# 패키지명
설명 (Powered by ...)

## Install
패키지 설치 명령어

## Usage
폰트 로딩 (CDN link)

### React 셋팅
- ThemeProvider 감싸기
- global.css import
- CacheProvider (다른 CSS 도구와 병용 시)

### Next.js App Router 셋팅
### Next.js Page Router 셋팅
```

**핵심 데이터**:
- npm 패키지명 (예: `@wanteddev/wds`, `@wanteddev/wds-icon`)
- 폰트 CDN URL
- Provider 래퍼 코드 (ThemeProvider)
- global CSS import 경로
- 프레임워크별 SSR 대응 코드

---

### 2-2. `wds_coding_guidelines` (코딩 가이드라인)

**목적**: 코드 작성 시 따라야 할 규칙

**WDS 반환 내용 구조**:
```markdown
## Form
폼 컴포넌트 사용 규칙 (Form 컴포넌트와 함께 사용 권장)

## Styling
- sx prop 사용법 (Emotion 기반)
- style.ts 분리 패턴
- 조건부 스타일링 패턴
- "Props 우선, 커스텀 스타일은 최후" 원칙

## Theme
- 시멘틱 토큰 > 하드코딩 값
- 시멘틱 > 아토믹 색상 (폴백)
- addOpacity 유틸 사용
- spacing 토큰은 사용하지 않음

## Authoring & Using Components
- WDS 컴포넌트 재사용 우선
- Props로 스타일링 가능하면 Props 사용
- WDS 아이콘 라이브러리 사용

## Coding guidelines
- sx prop 사용
- Box 컴포넌트 활용
```

**핵심 패턴**:
| 패턴 | 설명 |
|---|---|
| **스타일링 방식** | `sx` prop (Emotion css 호환) |
| **테마 접근** | `(theme: Theme) => css\`...\`` 함수 패턴 |
| **파일 분리** | 3줄 이하 inline, 그 이상 `style.ts` 분리 |
| **우선순위** | Props > sx prop > 커스텀 스타일 |
| **토큰 규칙** | semantic > atomic > 하드코딩 (금지) |

---

### 2-3. `list_components` (컴포넌트 목록)

**목적**: 사용 가능한 전체 컴포넌트 목록 제공

**WDS 반환 형식**:
```
안내 문구 (get_component 사용 권유)

- ComponentName
  Sub-components: SubA, SubB, SubC
- AnotherComponent
  Sub-components: ...
```

**WDS 데이터 규모**: 80+ 최상위 컴포넌트, 서브 컴포넌트 포함 200+

**카테고리별 분류** (Figma 기준):
| 카테고리 | 대표 컴포넌트 |
|---|---|
| Layout | FlexBox, Grid, Divider |
| Action | Button, TextButton, IconButton, Chip, ActionArea |
| Selection/Input | TextField, Select, Checkbox, Radio, Switch, SearchField, Slider |
| Content | Avatar, Card, ListCell, Accordion, Typography, Thumbnail |
| Loading | Loading, Skeleton |
| Navigation | Tab, Pagination, TopNavigation, BottomNavigation, ProgressTracker |
| Feedback | Toast, Snackbar, SectionMessage, Alert, FallbackView |
| Presentation | Modal, Tooltip, Popover, Menu, Autocomplete |

---

### 2-4. `get_component(componentName)` (컴포넌트 상세)

**목적**: 특정 컴포넌트의 사용법, 코드 예제, API 스펙 제공

**WDS 반환 형식**:
```markdown
# 컴포넌트명
설명

![이미지](montage URL)

## Variants
### Variant 1
설명 + 코드 예제 (JSX)

### Variant 2
설명 + 코드 예제

## Sizes
코드 예제

## 기타 섹션 (Loading, Form field, Contents, Controlled, etc.)
각각 코드 예제

## API
### MainComponent
Props 테이블:
| Name | Types | defaultValue |
| `prop1` | `"a" \| "b"` | `"a"` |

### SubComponent
Props 테이블

공통 안내:
- xs/sm/md/lg/xl breakpoint 반응형 props
- ThemeColorsToken = `'semantic.label.normal'` 같은 문자열
- sx prop = Emotion css prop과 동일
```

**핵심**: 코드 예제가 항상 **완전한 실행 가능한 컴포넌트** 형태 (import 포함)

---

### 2-5. `list_tokens` (디자인 토큰)

**목적**: 전체 디자인 토큰 (색상, 간격, 브레이크포인트 등) 제공

**WDS 반환 형식**: JSON 토큰 객체 (5종)

```json
{
  "atomic": {          // 원자 색상 팔레트 (14색 × 10~20단계)
    "blue": { "10": "var(--atomic-blue-10)", "20": "...", ... },
    "red": { ... },
    "green": { ... },
    // ... coolNeutral, neutral, orange, lime, cyan, etc.
  },
  "semantic": {        // 시멘틱 색상 (테마 대응)
    "primary": { "normal": "var(--semantic-primary-normal)", ... },
    "label": { "normal": "...", "strong": "...", ... },
    "background": { "normal": { "normal": "...", "alternative": "..." }, ... },
    "line": { "normal": { ... }, "solid": { ... } },
    "status": { "positive": "...", "cautionary": "...", "negative": "..." },
    "accent": { "background": { ... }, "foreground": { ... } },
    "inverse": { ... },
    "fill": { ... },
    "material": { "dimmer": "..." },
    "elevation": { "shadow": { "normal": { ... }, "drop": { ... }, "spread": { ... } } }
  },
  "opacity": { "0": 0, "5": 0.05, "8": 0.08, ... "100": 1 },
  "breakpoint": { "xl": "1600px", "lg": "1200px", ... "xs": "0px" },
  "spacing": { "0": "0px", "4": "4px", "8": "8px", ... "80": "80px" },
  "zIndex": { "modal": 1300 }
}
```

**코드에서 접근 방식**:
```tsx
// Theme 객체로 접근
theme.semantic.label.normal      // 시멘틱 색상
theme.atomic.blue[50]            // 아토믹 색상
theme.opacity[12]                // 투명도
theme.breakpoint.sm              // 브레이크포인트

// Typography 컴포넌트 color prop
<Typography color="semantic.label.normal" />
```

---

### 2-6. `get_color_usage` (색상 사용법)

**목적**: 색상 카테고리별 용도와 사용 맥락 안내

**WDS 반환 형식**:
```markdown
# Colors
설명

## Primary — 가장 중요한 요소 (Normal/Strong/Heavy)
## Label — 텍스트 (Normal/Strong/Neutral/Alternative/Assistive/Disable)
## Fill — 배경 채우기 (Normal/Strong/Alternative)
## Line - Normal — 구분선 (투명도 포함)
## Line - Solid — 중첩 방지용 구분선
## Background - Normal — 일반 배경
## Background - Elevated — 모달 등 층위 배경
## Background - Transparent — Chrome 효과용
## Static — 테마 불변 색상 (White/Black)
## Inverse — 테마 반대 요소 (Tooltip 등)
## Interaction — 활성/비활성 상태
## Status — 긍정/주의/부정
## Accent - Foreground — 앞쪽 요소 강조색 (11색)
## Accent - Background — 뒤쪽 요소 강조색 (7색)
## Material — 모달 딤 배경
```

---

### 2-7. `list_icons` (아이콘 목록)

**목적**: 사용 가능한 전체 아이콘 목록

**WDS 반환 형식**:
```
아이콘 이름 리스트 (Icon 접두사)
+ 사용법 안내 (크기: sx={{ fontSize }}, 색상: sx={theme => ({ color: ... })})
```

**WDS 데이터 규모**: 280+ 아이콘 (Normal + Color + Fill 변형 포함)
**패키지**: `@wanteddev/wds-icon` (메인 패키지와 별도)

**명명 규칙**: `Icon` + PascalCase (예: `IconArrowLeft`, `IconBell`, `IconLogoGoogleColor`)
- 기본: `IconName` (단색, theme color 따름)
- Fill: `IconNameFill` (채워진 변형)
- Color: `IconNameColor` (고유 색상)

---

### 2-8. `list_utility_functions` (유틸 목록)

**목적**: 디자인 시스템이 제공하는 헬퍼 함수 목록

**WDS 반환 형식**:
```
함수 이름 리스트 (17개):
- addOpacity         — 투명도 조절
- ariaHidden         — 접근성
- containerStyle     — 컨테이너 스타일
- ellipsisTypographyStyle — 말줄임
- gradient           — 그라디언트
- listStyle          — 리스트 스타일
- typographyStyle    — 타이포그래피
- respondTo/Down/More/Up — 미디어 쿼리 유틸
- useAlert           — Alert 훅
- useSize            — 사이즈 훅
- useSnackbar        — Snackbar 훅
- useThemeControl    — 테마 제어 훅
- useToast           — Toast 훅
- useMediaQuery      — 미디어 쿼리 훅
```

---

### 2-9. `get_utility_function(functionName)` (유틸 상세)

**목적**: 특정 유틸리티 함수의 사용법과 코드 예제

**WDS 반환 형식**:
```markdown
# 함수명
설명

## Introduce
기본 사용법 + 코드 예제

## 심화 섹션 (Advanced, Control, Custom color, etc.)
추가 코드 예제

## API
Props/파라미터 테이블
```

---

## 3. WDS MCP 서버 내부 구조 (소스코드 역공학)

> 패키지 위치: `~/.npm/_npx/.../node_modules/@wanteddev/wds-mcp` (v3.2.1)
> 이 분석을 기반으로 동일한 구조의 MCP 서버를 직접 구축할 수 있다.

### 3-1. 파일 구조

```
@wanteddev/wds-mcp/
├── package.json                     # bin, main, dependencies
├── bin/
│   └── wds-mcp                      # 실행 스텁 (dist/index.mjs 호출)
└── dist/
    ├── index.mjs                    # 진입점 (StdioServerTransport 연결)
    ├── server.mjs                   # McpServer 인스턴스 + 9개 도구 등록
    ├── constants/index.mjs          # URL/선택자 상수
    ├── helpers/index.mjs            # 데이터 추출 함수
    ├── docs/generated/api.mjs       # 컴포넌트 메타 JSON (14,721줄, 빌드타임 생성)
    └── packages/wds/README.mjs      # README 마크다운 문자열
```

### 3-2. 핵심 의존성

```json
{
  "@modelcontextprotocol/sdk": "1.24.3",  // MCP 서버 SDK
  "@wanteddev/wds-icon": "3.2.1",         // 아이콘 데이터 (Object.keys로 목록 추출)
  "@wanteddev/wds-theme": "3.2.1",        // 토큰 데이터 (theme.light 객체)
  "cheerio": "^1.0.0",                    // HTML 스크래핑
  "turndown": "^7.2.2",                   // HTML → Markdown 변환
  "zod": "^4.0.10"                        // 입력 스키마 검증
}
```

### 3-3. 도구별 데이터 소스

| 도구 | 데이터 소스 | 시점 |
|---|---|---|
| `getting_started` | `README.mjs` (빌드타임 생성 문자열) | 정적 |
| `wds_coding_guidelines` | `server.mjs` 내 하드코딩 | 정적 |
| `list_components` | `api.mjs` (TS 타입 정보 → JSON, 14,721줄) | 정적 (빌드타임) |
| `get_component` | **montage.wanted.co.kr 실시간 스크래핑** (cheerio+turndown) | 동적 (매번 fetch) |
| `list_tokens` | `@wanteddev/wds-theme` npm import → `theme.light` 객체 | 런타임 |
| `get_color_usage` | **montage.wanted.co.kr 실시간 스크래핑** | 동적 |
| `list_icons` | `@wanteddev/wds-icon` npm import → `Object.keys()` | 런타임 |
| `list_utility_functions` | **sitemap.xml 파싱** + 하드코딩 보충 | 동적+정적 |
| `get_utility_function` | **montage.wanted.co.kr 실시간 스크래핑** | 동적 |

### 3-4. 서버 코어 패턴

```javascript
// index.mjs — 진입점
import { server } from "./server.mjs";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
const transport = new StdioServerTransport();
await server.connect(transport);

// server.mjs — 도구 등록
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
const server = new McpServer({ name: "WDS, Wanted Design System", version: "3.2.1" });

// 파라미터 없는 도구
server.registerTool("list_components", { description: "..." }, async () => {
  return { content: [{ type: "text", text: "..." }] };
});

// 파라미터 있는 도구
server.registerTool("get_component",
  { description: "...", inputSchema: { componentName: z.string() } },
  async ({ componentName }) => {
    return { content: [{ type: "text", text: "..." }] };
  }
);
```

---

## 4. 새 디자인 시스템 MCP 서버 구축하기

> WDS와 동일한 구조로 MCP 서버를 만들되,
> 문서 사이트 스크래핑 대신 **정적 마크다운 파일**로 데이터를 제공하는 방식.
> (문서 사이트가 있으면 스크래핑으로 전환 가능)

### 빠른 시작 (end-to-end)

```bash
# 1. 프로젝트 생성
mkdir myds-mcp && cd myds-mcp
npm init -y
# package.json에 "type": "module" 추가 + bin/dependencies 설정 (4-2 참조)

# 2. 의존성 설치
npm install @modelcontextprotocol/sdk zod

# 3. 디렉토리 생성
mkdir -p bin src data/components data/utilities

# 4. 파일 작성 (4-3 ~ 4-5 참조)
# - bin/myds-mcp (실행 스텁)
# - src/index.mjs (서버 코드)
# - data/*.json, data/*.md (디자인 시스템 데이터)

# 5. bin 실행 권한 부여
chmod +x bin/myds-mcp

# 6. Claude Code에 등록 (프로젝트의 .claude/mcp.json)
# {
#   "mcpServers": {
#     "myds-mcp-server": {
#       "command": "node",
#       "args": ["/absolute/path/to/myds-mcp/src/index.mjs"]
#     }
#   }
# }

# 7. SKILL.md 작성 (.claude/skills/myds-react/SKILL.md — 4-6 참조)

# 8. Claude Code 새 대화 시작 → /mcp 에서 "myds-mcp-server · ✔ connected" 확인
```

### 4-1. 프로젝트 구조

```
myds-mcp/
├── package.json
├── bin/
│   └── myds-mcp              # 실행 스텁
├── src/
│   └── index.mjs             # 서버 + 9개 도구 (단일 파일)
└── data/
    ├── getting-started.md     # 설치 가이드
    ├── coding-guidelines.md   # 코딩 규칙
    ├── color-usage.md         # 색상 사용법
    ├── tokens.json            # 디자인 토큰
    ├── icons.json             # 아이콘 목록
    ├── components.json        # 컴포넌트 목록 + 서브컴포넌트
    ├── utilities.json         # 유틸리티 함수 목록
    ├── components/            # 컴포넌트별 상세 마크다운
    │   ├── Button.md
    │   ├── TextField.md
    │   ├── Modal.md
    │   └── ...
    └── utilities/             # 유틸리티별 상세 마크다운
        ├── addOpacity.md
        ├── respondTo.md
        └── ...
```

### 4-2. package.json

```json
{
  "name": "@myorg/myds-mcp",
  "version": "1.0.0",
  "type": "module",
  "bin": { "myds-mcp": "bin/myds-mcp" },
  "main": "src/index.mjs",
  "engines": { "node": ">=18" },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.24.0",
    "zod": "^4.0.0"
  }
}
```

### 4-3. bin/myds-mcp

```javascript
#!/usr/bin/env node
import('../src/index.mjs');
```

> 작성 후 반드시 `chmod +x bin/myds-mcp` 실행. 안 하면 npx 실행 시 permission denied.

### 4-4. src/index.mjs (전체 서버 코드)

```javascript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "data");

// --- 헬퍼 ---
const readData = (filename) => readFileSync(join(dataDir, filename), "utf-8");
const readJSON = (filename) => JSON.parse(readData(filename));
const readComponentDoc = (name) => {
  try { return readData(join("components", `${name}.md`)); }
  catch { return `Component "${name}" documentation not found.`; }
};
const readUtilityDoc = (name) => {
  try { return readData(join("utilities", `${name}.md`)); }
  catch { return `Utility "${name}" documentation not found.`; }
};
const text = (content) => ({ content: [{ type: "text", text: content }] });

// --- 서버 생성 ---
const server = new McpServer({
  name: "MyDS, My Design System",   // ← 디자인 시스템 이름
  version: "1.0.0",
});

// === 도구 1: getting_started ===
server.registerTool(
  "getting_started",
  { description: "Installation steps and initial configuration guide" },
  async () => text(readData("getting-started.md"))
);

// === 도구 2: coding_guidelines ===
server.registerTool(
  "coding_guidelines",
  { description: "Coding guidelines when writing code that uses MyDS" },
  async () => text(readData("coding-guidelines.md"))
);

// === 도구 3: get_color_usage ===
server.registerTool(
  "get_color_usage",
  { description: "Guidelines for how to apply color" },
  async () => text(readData("color-usage.md"))
);

// === 도구 4: list_components ===
server.registerTool(
  "list_components",
  { description: "List all components in MyDS" },
  async () => {
    const components = readJSON("components.json");
    const lines = [
      'Use the `get_component` tool for detailed usage of a specific component.',
      '',
    ];
    for (const comp of components) {
      lines.push(`- ${comp.name}`);
      if (comp.subComponents?.length) {
        lines.push(`  Sub-components: ${comp.subComponents.join(", ")}`);
      }
    }
    return text(lines.join("\n"));
  }
);

// === 도구 5: get_component ===
server.registerTool(
  "get_component",
  {
    description: "Get documentation and usage for a specific component",
    inputSchema: { componentName: z.string().describe("The component name") },
  },
  async ({ componentName }) => text(readComponentDoc(componentName))
);

// === 도구 6: list_tokens ===
server.registerTool(
  "list_tokens",
  { description: "List all design tokens" },
  async () => {
    const tokens = readJSON("tokens.json");
    const lines = [];
    for (const [category, value] of Object.entries(tokens)) {
      lines.push(`<token name="${category}" value="${JSON.stringify(value)}" />`);
    }
    lines.push('');
    lines.push('Use these tokens via theme object: `theme.semantic.label.normal`');
    return text(lines.join("\n"));
  }
);

// === 도구 7: list_icons ===
server.registerTool(
  "list_icons",
  { description: "List all available icons" },
  async () => {
    const icons = readJSON("icons.json");
    const lines = icons.map((name) => `- ${name}`);
    lines.unshift('Available icons:\n');
    lines.push('');
    lines.push('Usage: `import { IconName } from "@myorg/myds-icon";`');
    return text(lines.join("\n"));
  }
);

// === 도구 8: list_utility_functions ===
server.registerTool(
  "list_utility_functions",
  { description: "List all utility functions" },
  async () => {
    const utils = readJSON("utilities.json");
    const lines = utils.map((name) => `- ${name}`);
    lines.unshift('Available utility functions:\n');
    return text(lines.join("\n"));
  }
);

// === 도구 9: get_utility_function ===
server.registerTool(
  "get_utility_function",
  {
    description: "Get documentation for a specific utility function",
    inputSchema: { functionName: z.string().describe("The utility function name") },
  },
  async ({ functionName }) => text(readUtilityDoc(functionName))
);

// --- 서버 시작 ---
const transport = new StdioServerTransport();
await server.connect(transport);
```

### 4-5. 데이터 파일 템플릿

#### `data/tokens.json` (WDS 형식 그대로)

```json
{
  "semantic": {
    "primary": {
      "normal": "#0066FF",
      "strong": "#005EEB",
      "heavy": "#0054D1"
    },
    "label": {
      "normal": "#171719",
      "strong": "#000000",
      "neutral": "rgba(46, 47, 51, 0.88)",
      "alternative": "rgba(55, 56, 60, 0.61)",
      "assistive": "rgba(55, 56, 60, 0.28)",
      "disable": "rgba(55, 56, 60, 0.16)"
    },
    "background": {
      "normal": { "normal": "#FFFFFF", "alternative": "#F7F7F8" },
      "elevated": { "normal": "#FFFFFF", "alternative": "#F7F7F8" }
    },
    "line": {
      "normal": { "normal": "rgba(112,115,124,0.22)", "neutral": "rgba(112,115,124,0.16)" },
      "solid": { "normal": "#E1E2E4", "neutral": "#EAEBEC" }
    },
    "status": {
      "positive": "#00BF40",
      "cautionary": "#FF9200",
      "negative": "#FF4242"
    },
    "fill": {
      "normal": "rgba(112,115,124,0.08)",
      "strong": "rgba(112,115,124,0.16)"
    }
  },
  "atomic": {
    "blue": { "50": "#0066FF", "60": "#3385FF", "40": "#0054D1" },
    "red": { "50": "#FF4242", "40": "#E52222" },
    "green": { "50": "#00BF40", "40": "#009632" }
  },
  "opacity": { "5": 0.05, "8": 0.08, "12": 0.12, "16": 0.16, "22": 0.22, "52": 0.52, "88": 0.88 },
  "breakpoint": { "xl": "1600px", "lg": "1200px", "md": "992px", "sm": "768px", "xs": "0px" },
  "spacing": { "4": "4px", "8": "8px", "12": "12px", "16": "16px", "20": "20px", "24": "24px", "32": "32px" }
}
```

#### `data/components.json`

```json
[
  { "name": "Button", "subComponents": [] },
  { "name": "TextField", "subComponents": ["TextFieldContent", "TextFieldButton"] },
  { "name": "Modal", "subComponents": ["ModalContainer", "ModalNavigation", "ModalContent", "ModalHeading"] },
  { "name": "Select", "subComponents": ["SelectContent", "SelectMultiple"] },
  { "name": "Checkbox", "subComponents": [] },
  { "name": "Toast", "subComponents": ["ToastContainer", "ToastContent"] }
]
```

#### `data/icons.json`

```json
["IconArrowLeft", "IconArrowRight", "IconBell", "IconCheck", "IconClose", "IconSearch", "IconPlus", "IconTrash"]
```

#### `data/utilities.json`

```json
["addOpacity", "respondTo", "respondDown", "useToast", "useMediaQuery"]
```

#### `data/getting-started.md` (설치 가이드 예시)

```markdown
# MyDS

MyDS 컴포넌트 라이브러리 설치 및 초기 설정 가이드.

## Install

\`\`\`sh
npm install @myorg/myds @myorg/myds-icon
\`\`\`

## Usage

### 폰트 로딩

\`\`\`html
<link rel="stylesheet" href="https://cdn.example.com/fonts/myds-font.css" />
\`\`\`

### React

\`\`\`tsx
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@myorg/myds';
import '@myorg/myds/global.css';

const root = createRoot(document.getElementById('root')!);
root.render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
\`\`\`
```

#### `data/coding-guidelines.md` (코딩 가이드라인 예시)

```markdown
# Coding Guidelines

## Styling
- sx prop을 사용하여 스타일링합니다.
- 3줄 이하의 짧은 스타일은 인라인으로, 그 이상은 style.ts 파일로 분리합니다.

## Theme
- 하드코딩된 색상값 대신 반드시 디자인 토큰을 사용합니다.
- semantic 토큰을 우선 사용하고, 없을 때만 atomic 토큰을 폴백으로 사용합니다.
- `list_tokens` 도구로 사용 가능한 토큰을 확인하세요.

## Components
- 새 컴포넌트를 만들기 전에 MyDS에서 제공하는 컴포넌트가 있는지 확인합니다.
- 컴포넌트의 props로 스타일링 가능하면 커스텀 스타일 대신 props를 사용합니다.
- 아이콘은 `@myorg/myds-icon` 패키지를 사용합니다.
```

#### `data/color-usage.md` (색상 사용법 예시)

```markdown
# Colors

## Primary
가장 중요한 요소(CTA 버튼, 강조 텍스트)에 사용합니다.
- Normal: 기본 primary 색상
- Strong: hover 등 강조 시
- Heavy: active/pressed 시

## Label
텍스트 요소에 사용합니다.
- Normal: 기본 텍스트
- Strong: 제목, 강조 텍스트
- Alternative: 보조 텍스트, 설명
- Assistive: 플레이스홀더, 비활성 텍스트
- Disable: 비활성 상태

## Background
배경에 사용합니다.
- Normal: 기본 페이지 배경
- Alternative: 카드, 섹션 구분 배경
- Elevated: 모달, 팝오버 배경

## Status
상태 표시에 사용합니다.
- Positive: 성공, 완료 (초록)
- Cautionary: 주의, 경고 (주황)
- Negative: 오류, 위험 (빨강)

## Line
구분선, 테두리에 사용합니다.
- Normal: 투명도 포함 (일반 구분선)
- Solid: 불투명 (중첩 방지)
```

#### `data/components/Button.md` (컴포넌트 상세 예시)

```markdown
# Button

작업을 수행하는데 사용되는 클릭 가능한 요소입니다.

## Variants

### Solid button
\`\`\`tsx
import { Button } from '@myorg/myds';

<Button color="primary">Primary</Button>
<Button color="assistive">Assistive</Button>
\`\`\`

### Outlined button
\`\`\`tsx
<Button variant="outlined" color="primary">Primary</Button>
\`\`\`

## Sizes
\`\`\`tsx
<Button size="small">Small</Button>
<Button size="medium">Medium</Button>  {/* default */}
<Button size="large">Large</Button>
\`\`\`

## API

| Name | Types | defaultValue |
|---|---|---|
| `variant` | `"solid" \| "outlined"` | `"solid"` |
| `color` | `"primary" \| "assistive"` | `"primary"` |
| `size` | `"small" \| "medium" \| "large"` | `"medium"` |
| `disabled` | `boolean` | `false` |
| `loading` | `boolean` | `false` |
| `fullWidth` | `boolean` | `false` |
| `leadingContent` | `ReactNode` | `-` |
| `trailingContent` | `ReactNode` | `-` |
| `iconOnly` | `boolean` | `-` |
```

### 4-6. Claude Code에 등록하기

#### `.claude/mcp.json`

```json
{
  "mcpServers": {
    "myds-mcp-server": {
      "command": "node",
      "args": ["/absolute/path/to/myds-mcp/src/index.mjs"]
    }
  }
}
```

> **주의**: `args`에는 반드시 **절대 경로**를 사용. 상대 경로는 Claude Code의 실행 위치에 따라 실패할 수 있음.

또는 npm에 퍼블리시 후:

```json
{
  "mcpServers": {
    "myds-mcp-server": {
      "command": "npx",
      "args": ["-y", "@myorg/myds-mcp@latest"]
    }
  }
}
```

#### 도구 이름 매핑 규칙

mcp.json에 등록한 **서버 이름**이 AI가 호출할 때의 **접두사**가 된다:

```
mcp.json 서버 이름: "myds-mcp-server"
                          ↓
AI 호출 시:  mcp__myds-mcp-server__getting_started
             mcp__myds-mcp-server__list_components
             mcp__myds-mcp-server__get_component
             ...
```

따라서 SKILL.md에 도구를 참조할 때도 이 전체 이름을 사용해야 한다:
```
mcp__myds-mcp-server__coding_guidelines    ← 서버이름이 "myds-mcp-server"인 경우
mcp__wds-mcp-server__wds_coding_guidelines ← 서버이름이 "wds-mcp-server"인 경우 (WDS)
```

#### `.claude/skills/myds-react/SKILL.md`

```markdown
---
name: myds-react
description: React 프로젝트에서 MyDS 기반 컴포넌트 개발 가이드. UI 컴포넌트, 스타일링, 아이콘 작업 시 사용
---

# myds-react

## When to use
- React 프로젝트에서 UI 작업 시
- 컴포넌트 생성/수정, 스타일링, 아이콘 작업 시

## Instructions

### 1. 코딩 가이드라인 확인 (필수)
컴포넌트 작성 전 **반드시** 코딩 가이드라인을 먼저 확인합니다.
\`\`\`
mcp__myds-mcp-server__coding_guidelines
\`\`\`

### 2. 컴포넌트 개발
새 컴포넌트를 만들기 전, 제공되는 컴포넌트가 있는지 **반드시** 확인합니다.
\`\`\`
mcp__myds-mcp-server__list_components
mcp__myds-mcp-server__get_component({ componentName: "컴포넌트명" })
\`\`\`

### 3. 디자인 토큰 적용
하드코딩된 값 대신 디자인 토큰을 사용합니다.
\`\`\`
mcp__myds-mcp-server__list_tokens
mcp__myds-mcp-server__get_color_usage
\`\`\`

### 4. 아이콘 사용
\`\`\`
mcp__myds-mcp-server__list_icons
\`\`\`

### 5. 유틸리티 활용
\`\`\`
mcp__myds-mcp-server__list_utility_functions
mcp__myds-mcp-server__get_utility_function({ functionName: "함수명" })
\`\`\`

## Checklist
- [ ] 코딩 가이드라인 준수
- [ ] DS 컴포넌트 최대한 활용 (추론 금지, 상세 조회 필수)
- [ ] 하드코딩 대신 토큰 사용
- [ ] DS 아이콘/유틸 활용
```

### 4-7. 로컬 테스트 방법

MCP 서버는 **stdio 기반** (표준입출력)이므로, 터미널에서 직접 대화형 테스트는 불가.
테스트 방법은 2가지:

**방법 1: Claude Code에서 직접 확인 (권장)**
1. `.claude/mcp.json`에 서버 등록
2. Claude Code 새 대화 시작
3. `/mcp`에서 `myds-mcp-server · ✔ connected` 확인
4. 도구 호출 테스트: "MyDS의 컴포넌트 목록을 조회해줘"

**방법 2: 스크립트로 단위 테스트**
```javascript
// test.mjs — data 파일 읽기 로직만 검증
import { readFileSync } from "node:fs";
const data = JSON.parse(readFileSync("data/tokens.json", "utf-8"));
console.log("토큰 카테고리:", Object.keys(data));
console.log("semantic 키:", Object.keys(data.semantic));

const components = JSON.parse(readFileSync("data/components.json", "utf-8"));
console.log("컴포넌트 수:", components.length);

// node test.mjs 로 실행
```

**흔한 에러와 해결:**
| 에러 | 원인 | 해결 |
|---|---|---|
| `needs authentication` | — | MCP 서버와 무관 (인증이 필요한 서버만 해당) |
| `not connected` | 서버 실행 실패 | `node src/index.mjs` 직접 실행해서 에러 확인 |
| `ENOENT` | data 파일 경로 잘못 | `__dirname` 기준 상대경로 확인, 절대경로 사용 |
| `SyntaxError: Cannot use import` | `"type": "module"` 누락 | package.json에 `"type": "module"` 추가 |
| `permission denied` | bin 실행 권한 없음 | `chmod +x bin/myds-mcp` |

---

## 5. 데이터 준비 가이드

### 5-1. 데이터 추출 소스별 방법

| 데이터 | Figma에서 추출 | 문서 사이트에서 추출 | 수동 작성 |
|---|---|---|---|
| **토큰** | `get_variable_defs(fileKey)` → JSON 변환 | CSS variables 수집 | tokens.json 직접 작성 |
| **컴포넌트 목록** | Figma 페이지 구조 파싱 | sitemap 파싱 | components.json 직접 작성 |
| **컴포넌트 상세** | `get_design_context(fileKey, nodeId)` | cheerio+turndown 스크래핑 (WDS 방식) | 컴포넌트별 .md 작성 |
| **아이콘** | 아이콘 페이지 노드 목록 | 패키지 exports 파싱 | icons.json 직접 작성 |
| **가이드라인** | — | 문서 사이트 내용 | .md 파일 직접 작성 |

### 5-2. 필수 데이터 체크리스트

- [ ] `tokens.json` — semantic 색상, atomic 팔레트, opacity, breakpoint
- [ ] `components.json` — 이름 + 서브컴포넌트 배열
- [ ] `icons.json` — 아이콘 이름 배열
- [ ] `utilities.json` — 유틸 함수 이름 배열
- [ ] `getting-started.md` — 설치, 폰트, Provider 설정
- [ ] `coding-guidelines.md` — 스타일링 방식, 토큰 규칙, 컴포넌트 사용 원칙
- [ ] `color-usage.md` — 색상 카테고리별 용도
- [ ] `components/*.md` — 주요 컴포넌트별 상세 (Variants, API, 코드 예제)

### 5-3. 문서 사이트 스크래핑으로 전환하기 (선택)

WDS처럼 문서 사이트가 있다면, 정적 .md 대신 실시간 스크래핑으로 전환 가능:

```javascript
// cheerio + turndown 추가 설치
// npm i cheerio turndown

import { load } from "cheerio";
import TurndownService from "turndown";

const DOCS_BASE_URL = "https://docs.myds.dev";
const SELECTOR = "[data-content]";  // 문서 사이트의 본문 선택자

const fetchDoc = async (path) => {
  const res = await fetch(`${DOCS_BASE_URL}${path}`);
  const html = await res.text();
  const $ = load(html);
  const content = $(SELECTOR).html();
  return new TurndownService().turndown(content || "");
};

// get_component 도구에서:
server.registerTool("get_component", { ... }, async ({ componentName }) => {
  const slug = componentName.replace(/([A-Z])/g, "-$1").toLowerCase().slice(1);
  const markdown = await fetchDoc(`/components/${slug}`);
  return text(markdown);
});
```

---

## 6. 방법 비교

| | **방법 B: MCP 서버 구축** | **방법 C: 정적 파일** |
|---|---|---|
| **구조** | MCP 서버 + Skill | `.claude/rules/` + Skill |
| **컴포넌트 상세 조회** | `get_component("Button")` 동적 | 불가 (전체 한 파일) |
| **토큰 조회** | `list_tokens` 동적 | rules 파일에 정적 포함 |
| **업데이트** | data/ 파일 수정 | rules 파일 수정 |
| **필요 기술** | Node.js, MCP SDK | 마크다운 작성만 |
| **사용 시점** | 컴포넌트 10개+, 팀 공유 | 소규모, 개인 사용 |
| **AI 컨텍스트** | 필요한 것만 조회 (효율적) | 전체 로드 (큰 파일 시 비효율) |

### 방법 C (정적 파일만)

```
.claude/
├── rules/
│   ├── design-system.md          ← 자동 로드 규칙 (DS 선택 로직)
│   └── myds-tokens.md            ← 토큰/컴포넌트 정리 (정적, 자동 로드)
└── skills/
    └── myds-react/
        └── SKILL.md              ← Skill (정적 파일 참조 안내)
```

---

## 7. WDS 참고 자료

### WDS MCP 설정 (현재 프로젝트)
- **mcp.json**: `"wds-mcp-server": { "command": "npx", "args": ["-y", "@wanteddev/wds-mcp@latest"] }`
- **Skill**: `.claude/skills/wds-react/SKILL.md`
- **npmrc**: `~/.npmrc`에 `@wanteddev:registry=https://npm.pkg.github.com/` + GitHub PAT

### WDS 플러그인 원본 구조 (wanteddev/claude-skills-front)
```
wanted-design-system/
├── plugin.json          ← name, version, skills 경로
├── README.md
├── mcp.json             ← MCP 서버 설정
└── skills/
    └── wds-react/
        └── SKILL.md     ← Skill 정의
```

### WDS MCP 도구별 데이터 크기

| 도구 | 파라미터 | 반환 크기 | 데이터 소스 |
|---|---|---|---|
| `getting_started` | 없음 | ~4KB | README.mjs (정적) |
| `wds_coding_guidelines` | 없음 | ~2KB | 하드코딩 (정적) |
| `list_components` | 없음 | ~3KB | api.mjs (정적, TS타입→JSON) |
| `get_component` | `componentName` | ~5-15KB | **montage 스크래핑 (동적)** |
| `list_tokens` | 없음 | ~8KB | wds-theme npm (런타임) |
| `get_color_usage` | 없음 | ~2KB | **montage 스크래핑 (동적)** |
| `list_icons` | 없음 | ~5KB | wds-icon npm (런타임) |
| `list_utility_functions` | 없음 | ~0.5KB | **sitemap 파싱 (동적)** + 하드코딩 |
| `get_utility_function` | `functionName` | ~2-3KB | **montage 스크래핑 (동적)** |

---

## 8. FAQ

**Q: MCP 서버를 npm에 퍼블리시해야 하나?**
- 아니다. 로컬 경로로 직접 실행 가능: `"command": "node", "args": ["/path/to/src/index.mjs"]`
- 팀 공유가 필요하면 npm 퍼블리시 또는 git repo로 배포

**Q: 여러 디자인 시스템을 동시에 쓸 수 있나?**
- MCP: mcp.json에 여러 서버 등록 (도구 이름이 `mcp__서버명__도구명`으로 자동 구분)
- Skill: skills 디렉토리에 각각 추가 (`myds-react/`, `anotherds-react/`)
- 규칙: `.claude/rules/design-system.md`에서 기본 DS 지정

**Q: 데이터가 많으면 성능 문제 없나?**
- 목록 도구(list_*)는 전체 반환이므로 적절한 크기 유지 (5-10KB 이하 권장)
- 상세 도구(get_*)는 요청 시에만 로드되므로 크기 제한 덜 중요
- WDS 기준: 가장 큰 도구가 list_tokens (~8KB), get_component (~15KB)

**Q: WDS MCP처럼 문서 사이트 스크래핑이 꼭 필요한가?**
- 아니다. 정적 마크다운 파일로 충분함 (5-3 참조)
- 스크래핑은 문서가 자주 업데이트될 때 유리하지만 사이트 구조 변경에 취약
- WDS도 `coding_guidelines`, `list_components`, `list_tokens`, `list_icons`는 정적 데이터

**Q: 도구의 description은 어떻게 써야 하나?**
- description은 AI가 **어떤 도구를 선택할지 결정**하는 데 사용됨
- 짧고 명확하게 "이 도구가 무엇을 반환하는지" 작성
- WDS 참고 예시:
  - `"List all components in the Wanted Design System"` (list_components)
  - `"Retrieve documentation and usage details for a specific React component"` (get_component)
  - `"Get the guidelines when writing code that uses WDS"` (coding_guidelines)
- **팁**: "List all..." (목록), "Get the..." (상세), "Guidelines for..." (가이드) 패턴이 효과적
