---
name: m3-react
description: React 프로젝트에서 Material Design 3 기반 컴포넌트 개발 가이드. UI 컴포넌트, 스타일링, 아이콘 작업 시 사용
---

# m3-react

React 프로젝트에서 Material Design 3(M3)을 기반으로 컴포넌트를 개발할 때 적용되는 skill입니다.
"Material Design으로" 또는 "M3로" 요청 시 이 skill을 적용합니다.

## When to use

다음 조건에 해당하면 이 skill을 적용합니다:

- 사용자가 "Material Design", "M3", "머티리얼" 디자인 시스템을 명시한 경우
- M3 토큰/컴포넌트 스펙 확인이 필요한 경우

## Instructions

### 1. 컴포넌트 목록 확인

M3에서 제공하는 컴포넌트가 있는지 확인합니다.

```
mcp__material3__list_material_components({ category: "all", framework: "web" })
```

적합한 컴포넌트가 있다면 상세 코드를 조회합니다.

```
mcp__material3__get_component_code({ componentName: "컴포넌트명", framework: "web" })
```

### 2. 디자인 토큰 조회

스타일링 시 M3 디자인 토큰을 사용합니다.

```
mcp__material3__get_design_tokens({ tokenType: "color", format: "css" })
mcp__material3__get_design_tokens({ tokenType: "typography", format: "css" })
mcp__material3__get_design_tokens({ tokenType: "shape", format: "css" })
mcp__material3__get_design_tokens({ tokenType: "elevation", format: "css" })
```

### 3. 아이콘 검색

아이콘이 필요한 경우 Material Symbols를 검색합니다.

```
mcp__material3__search_material_icons({ query: "검색어" })
```

### 4. 접근성 가이드라인

컴포넌트의 접근성 요구사항을 확인합니다.

```
mcp__material3__get_accessibility_guidelines({ componentName: "컴포넌트명" })
```

### 5. 시각적 확인 필요 시 Figma 조회

M3 Figma Design Kit에서 시각적 레퍼런스를 확인합니다.
- Figma fileKey: `OaM3Z7IOEaMGPRqfUKiv5d`
- `get_design_context(fileKey, nodeId)` — 디자인 데이터
- `get_screenshot(fileKey, nodeId)` — 스크린샷

### 6. 구현

- Tailwind CSS 유틸리티 클래스 + inline style로 M3 토큰 매핑
- 하드코딩된 값 대신 M3 토큰 사용
- 기존 프로젝트의 CommonUI.js 컴포넌트 재사용 우선

## Checklist

컴포넌트 작성 완료 후 다음을 확인합니다:

- [ ] M3 컴포넌트 스펙을 따랐는가?
- [ ] 하드코딩된 스타일 값 대신 M3 토큰을 사용했는가?
- [ ] Material Symbols 아이콘을 사용했는가? (필요한 경우)
- [ ] 접근성 가이드라인을 확인했는가?
- [ ] 기존 프로젝트 패턴과 조화되는가?
