# Wanted Design System - Design Tokens

> Source: [Wanted Design System (Community)](https://www.figma.com/design/avRUqtDeoui3K1UkB0FwBi/Wanted-Design-System--Community-)
> Font: Pretendard JP (전체 fontFeatureSettings: `'ss10' 1`)

---

## Logo Page (node-id: 16257-145133)

### Color Tokens (Semantic)

| Token | CSS Variable | HEX / RGBA | 용도 |
|---|---|---|---|
| Label/Strong | `--label/strong` | `#000000` | 강한 텍스트, Divider |
| Label/Normal | `--label/normal` | `#171719` | 일반 텍스트, Interaction overlay |
| Primary/Normal | `--primary/normal` | `#0066FF` | 링크, CTA 텍스트 |
| Background/Normal/Normal | `--background/normal/normal` | `#FFFFFF` | 기본 배경 |
| Fill/Alternative | `--fill/alternative` | `rgba(112,115,124, 0.05)` | Section 배경 |
| Line/Normal/Normal | `--line/normal/normal` | `rgba(112,115,124, 0.22)` | 카드/프리뷰 테두리 |
| Line/Normal/Neutral | `--line/normal/neutral` | `rgba(112,115,124, 0.16)` | 버튼 테두리 |
| Interaction/Inactive | `--interaction/inactive` | `#989BA2` | 비활성 상태 |
| Opacity/88 | `--opacity/88` | `0.88` | 내비게이션 배경 불투명도 |

### Typography Tokens

| Style Name | Weight | Size | Line Height | Letter Spacing |
|---|---|---|---|---|
| Display 3 / Bold | Bold (700) | `36px` | `1.334` | `-2.70px` |
| Title 2 / Bold | Bold (700) | `28px` | `1.358` | `-2.36px` |
| Title 3 / Bold | Bold (700) | `24px` | `1.334` | `-2.30px` |
| Body 1 / Normal - Medium | Medium (500) | `16px` | `1.5` | `0.57px` |
| Body 1 / Normal - Bold | SemiBold (600) | `16px` | `1.5` | `0.57px` |
| Body 1 / Reading - Medium | Medium (500) | `16px` | `1.625` | `0.57px` |
| Body 2 / Normal - Bold | SemiBold (600) | `15px` | `1.467` | `0.96px` |
| Caption 2 / Medium | Medium (500) | `11px` | `1.273` | `3.11px` |

### Spacing Tokens

| Token | Value | 용도 |
|---|---|---|
| spacing-section | `64px` | Section padding |
| spacing-xl | `48px` | 콘텐츠 블록 간격, Content gap |
| spacing-lg | `32px` | 카드 내부 padding, Description gap |
| spacing-md | `24px` | Heading 하위 요소 간격 |
| spacing-sm | `20px` | 프리뷰 카드 padding, 버튼 수평 padding |
| spacing-xs | `16px` | Action 버튼 간격 |
| spacing-2xs | `12px` | 버튼 간 gap |
| spacing-3xs | `9px` | 버튼 수직 padding |
| spacing-4xs | `6px` | 아이콘-텍스트 간 gap |
| spacing-5xs | `5px` | 버튼 내부 gap |

### Border Radius Tokens

| Token | Value | 용도 |
|---|---|---|
| radius-section | `32px` | Section 컨테이너 |
| radius-card | `24px` | 내부 카드 배경 |
| radius-preview | `16px` | 프리뷰 카드 |
| radius-button-lg | `12px` | 대형 버튼 |
| radius-button-sm | `10px` | 소형 버튼 |

### Border Tokens

| Token | Value | 용도 |
|---|---|---|
| border-strong | `2px solid var(--label/strong)` | 섹션 구분선 (Divider) |
| border-normal | `1px solid var(--line/normal/normal)` | 카드/프리뷰 테두리 |
| border-neutral | `1px solid var(--line/normal/neutral)` | 버튼 테두리 |

### Effect Tokens

| Token | Value | 용도 |
|---|---|---|
| blur/chrome | `backdrop-blur: 32px` | iOS 내비게이션 배경 (Chrome) |
| opacity/background | `0.88` | 내비게이션 배경 불투명도 |

### Logo Components

#### Horizontal Logos

| Brand | Variants | Size (w x h) |
|---|---|---|
| Wanted | Light, Dark, White, Black | `146.6 x 35` |
| Wanted Space | Light, Dark, White, Black | `236.7 x 35` |
| Wanted Space Short | Light, Dark, White, Black | `127.4 x 35` |
| Wanted Gigs | Light, Dark, White, Black | `209.2 x 35` |
| 원티드 채용 솔루션 | Light, Dark, White, Black | `205.2 x 35` |
| Wanted LaaS | Light, Dark, White, Black | `221.5 x 35` |
| 원티드 통합 로그인 | Light, Dark, White, Black | `212.8 x 35` |
| Wanted OneID | Light, Dark, White, Black | `204.7 x 35` |
| Wanted Agent | Light, Dark, White, Black | `216.3 x 35` |
| Wanted Agent Short | Light, Dark, White, Black | `107.0 x 35` |

#### Vertical Logos

| Brand | Variants | Size (w x h) |
|---|---|---|
| Wanted | Light, Dark, White, Black | `43.1 x 48` |
| Wanted Space | Light, Dark, White, Black | `43.1 x 48` |
| Wanted Gigs | Light, Dark, White, Black | `43.1 x 48` |

#### Circle Logos

| Brand | Variants | Size (w x h) |
|---|---|---|
| Wanted Symbol | Light, Dark, White, Black | `51 x 51` |
| Wanted | Light, Dark, White, Black | `51 x 51` |
| Wanted Space | Light, Dark, White, Black | `51 x 51` |
| Wanted Gigs | Light, Dark, White, Black | `51 x 51` |

#### Favicon

| Brand | Size (w x h) |
|---|---|
| Wanted Favicon | `50 x 50` |

#### Logo Color Variant 규칙

| Variant | 설명 | 배경 사용 |
|---|---|---|
| **Light** | 브랜드 기본 컬러 | 밝은 배경 |
| **Dark** | 반전/다크 버전 | 밝은 배경 |
| **White** | 흰색 단색 | 어두운 배경 |
| **Black** | 검정 단색 | 밝은 배경 |

### Logo Grid Layout

| Property | Value |
|---|---|
| 로고 셀 크기 | `105 x 105` |
| 셀 내부 padding | `35px` (Horizontal), `27-28.5px` (Circle/Vertical) |
| 섹션 간 간격 | `100px` (가로 그룹 간), `520px` offset (브랜드 간) |

### Button Component (Logo 페이지 내)

| Property | Value |
|---|---|
| Font | Pretendard JP, SemiBold (600), 15px |
| Line Height | `1.467` |
| Letter Spacing | `0.96px` |
| Text Color | `var(--primary/normal, #0066FF)` |
| Border | `1px solid var(--line/normal/neutral)` |
| Border Radius | `10px` |
| Padding | `20px (horizontal)`, `9px (vertical)` |
| Interaction | overlay `var(--label/normal)` opacity 0 -> hover |

---

## CSS Custom Properties (통합)

```css
:root {
  /* --- Colors --- */
  --wds-label-strong: #000000;
  --wds-label-normal: #171719;
  --wds-primary-normal: #0066FF;
  --wds-bg-normal: #FFFFFF;
  --wds-fill-alt: rgba(112, 115, 124, 0.05);
  --wds-line-normal: rgba(112, 115, 124, 0.22);
  --wds-line-neutral: rgba(112, 115, 124, 0.16);
  --wds-interaction-inactive: #989BA2;

  /* --- Spacing --- */
  --wds-spacing-section: 64px;
  --wds-spacing-xl: 48px;
  --wds-spacing-lg: 32px;
  --wds-spacing-md: 24px;
  --wds-spacing-sm: 20px;
  --wds-spacing-xs: 16px;
  --wds-spacing-2xs: 12px;

  /* --- Border Radius --- */
  --wds-radius-section: 32px;
  --wds-radius-card: 24px;
  --wds-radius-preview: 16px;
  --wds-radius-btn-lg: 12px;
  --wds-radius-btn-sm: 10px;

  /* --- Opacity --- */
  --wds-opacity-bg: 0.88;
}
```
