# Wanted Design System - Design Tokens

> Source: [Wanted Design System (Community)](https://www.figma.com/design/avRUqtDeoui3K1UkB0FwBi/Wanted-Design-System--Community-)
> Font: Pretendard JP (fontFeatureSettings: 'ss10' 1)
> 추출 대상: 15페이지

---

## 1. Theme (node-id: 16222-137703)

### 색상 토큰 (Color Tokens)

| Token | CSS Variable | Value | 용도 |
|---|---|---|---|
| Label/Strong | `--label/strong` | `#000000` | 강한 텍스트, Divider |
| Label/Normal | `--label/normal` | `#171719` | 일반 본문 텍스트, Interaction overlay |
| Label/Alternative | `--label/alternative` | `rgba(55, 56, 60, 0.61)` | 보조 텍스트 (Heading 라벨) |
| Primary/Normal | `--primary/normal` | `#0066FF` | 링크, CTA 텍스트 |
| Background/Normal/Normal | `--background/normal/normal` | `#FFFFFF` | 기본 배경 |
| Fill/Alternative | `--fill/alternative` | `rgba(112, 115, 124, 0.05)` | Section 배경 |
| Line/Normal/Normal | `--line/normal/normal` | `rgba(112, 115, 124, 0.22)` | 카드/프리뷰 테두리 |
| Line/Normal/Neutral | `--line/normal/neutral` | `rgba(112, 115, 124, 0.16)` | 버튼 테두리 |
| Interaction/Inactive | `--interaction/inactive` | `#989BA2` | 비활성 상태 |
| Status/Positive | `--status/positive` | `#00BF40` | 상태 배지 (개발 완료) |
| Static/White | `--static/white` | `#FFFFFF` | 배지 텍스트, 고정 흰색 |

### 타이포그래피 토큰 (Typography Tokens)

| Style Name | Weight | Size | Line Height | Letter Spacing |
|---|---|---|---|---|
| Display 3 / Bold | Bold (700) | `36px` | `1.334` | `-2.70px` |
| Title 2 / Bold | Bold (700) | `28px` | `1.358` | `-2.36px` |
| Title 3 / Bold | Bold (700) | `24px` | `1.334` | `-2.30px` |
| Body 1 / Normal - Medium | Medium (500) | `16px` | `1.5` | `0.57px` |
| Body 1 / Normal - Bold | SemiBold (600) | `16px` | `1.5` | `0.57px` |
| Body 1 / Reading - Medium | Medium (500) | `16px` | `1.625` | `0.57px` |
| Body 2 / Normal - Bold | SemiBold (600) | `15px` | `1.467` | `0.96px` |
| Label 1 / Normal - Bold | SemiBold (600) | `14px` | `1.429` | `1.45px` |
| Caption 2 / Medium | Medium (500) | `11px` | `1.273` | `3.11px` |
| Badge (SF Mono) | Medium (500) | `12px` | `1.334` | `0` |

### 간격 토큰 (Spacing Tokens)

| Token | Value | 용도 |
|---|---|---|
| spacing-section | `64px` | Section padding |
| spacing-xl | `48px` | 콘텐츠 블록 간격 |
| spacing-lg | `32px` | 카드 내부 padding, Description gap |
| spacing-md | `24px` | Heading 하위 요소 간격, 로고 섹션 gap |
| spacing-sm | `20px` | 프리뷰 카드 padding, 버튼 수평 padding, 로고 셀 padding |
| spacing-xs | `16px` | Action 버튼 간격, Icon List gap |
| spacing-2xs | `12px` | 버튼 간 gap |
| spacing-3xs | `8px` | 배지 간 gap, 태그 간 gap |
| spacing-4xs | `6px` | 아이콘-텍스트 gap, 배지 수평 padding |
| spacing-5xs | `5px` | 버튼 내부 gap |
| spacing-6xs | `3px` | 배지 내부 gap |
| spacing-7xs | `2px` | 배지 수직 padding |

### 테두리 반경 토큰 (Border Radius Tokens)

| Token | Value | 용도 |
|---|---|---|
| radius-section | `32px` | Section 컨테이너 |
| radius-card | `24px` | 내부 카드 배경 |
| radius-preview | `16px` | 프리뷰 카드 |
| radius-button-lg | `12px` | 대형 버튼 |
| radius-button-sm | `10px` | 소형 버튼 |
| radius-badge | `4px` | 상태 배지 |

### 테두리 토큰 (Border Tokens)

| Token | Value | 용도 |
|---|---|---|
| border-strong | `2px solid var(--label/strong)` | 섹션 구분선 (Divider) |
| border-normal | `1px solid var(--line/normal/normal)` | 카드/프리뷰 테두리 |
| border-neutral | `1px solid var(--line/normal/neutral)` | 버튼 테두리 |

### 이펙트 토큰 (Effect Tokens)

| Token | Value | 용도 |
|---|---|---|
| blur/chrome | `backdrop-blur: 32px` | iOS 내비게이션 배경 |
| opacity/88 | `0.88` | 내비게이션 배경 불투명도 |

### 로고 컴포넌트 (Logo Components)

#### Wanted (메인 브랜드)

| Type | Color Variants | Size (w x h) |
|---|---|---|
| Circle | - | `40 x 40` |
| Horizontal | Normal, White, Black | `112 x 32` |
| Vertical | Normal, White, Black | `84 x 84` |

#### Wanted Partnership

| Type | Size (w x h) |
|---|---|
| Partnership 로고 | `197 x 32` |
| Resource: Divider | `21 x 32` |
| Resource: Custom | `64 x 32` |

#### Wanted Space

| Type | Variant | Color Variants | Size (w x h) |
|---|---|---|---|
| Circle | - | - | `40 x 40` |
| Horizontal | Normal | Normal, White, Black | `180 x 32` |
| Horizontal | Short | Normal, White, Black | `96 x 32` |
| Vertical | - | Normal, White, Black | `84 x 84` |

#### Wanted Gigs

| Type | Variant | Color Variants | Size (w x h) |
|---|---|---|---|
| Circle | - | - | `40 x 40` |
| Horizontal | Normal | Normal, White, Black | `160 x 32` |
| Horizontal | Short | Normal, White, Black | `76 x 32` |
| Vertical | - | Normal, White, Black | `84 x 84` |

#### Sub Services (기타 하위 서비스)

| Brand | Variant | Size (w x h) |
|---|---|---|
| Wanted OneID | Korean | `156 x 32` |
| Wanted OneID | English | `150 x 32` |
| 원티드 채용 솔루션 | - | `156 x 32` |
| 원티드 기업 서비스 | - | `156 x 32` |
| 원티드 AI 면접코칭 | - | `178 x 32` |
| 원티드 커리어 조회 | - | `176 x 32` |
| Wanted LaaS | - | `168 x 32` |
| Wanted Agent | Normal | `164 x 32` |
| Wanted Agent | Short | `82 x 32` |

### 아이콘 컴포넌트 (Icon Components)

#### Normal (단색 아이콘) — 170+종

| 카테고리 | 아이콘 목록 |
|---|---|
| **방향/탐색** | Chevron Double Left/Right, Chevron Down/Up/Left/Right, Arrow Left/Right/Down/Up/Up Right, Caret Down/Up |
| **액션** | Check, Close, Plus, Minus, Search, Filter, Refresh, Reset, Copy, Download, Upload, Send, Share, Share iOS, Write, Pencil, Trash, Flip Backward |
| **커뮤니케이션** | Bell, Bell Plus, Bubble, Bubble Plus, Chat, Mail, Mail Open, Message, Megaphone, Phone |
| **미디어** | Image, Camera, Microphone, Microphone Slash, Play, Pause, Video, Music Microphone |
| **문서/텍스트** | Document, Document Person, Document Text, Document Search, Book, Bookmark, Bold, Strikethrough, Underline, Text Format, Text Variable, Quote, Code, Align Center/Justify/Left/Right, List, List Category, List Ordered |
| **사용자/조직** | Person, Person Plus, Persons, Company, Company Check, Company Plus |
| **상태/정보** | Circle, Circle Block, Circle Check, Circle Close, Circle Dot, Circle Exclamation, Circle Info, Circle Plus, Circle Point, Circle Question, Circle Up Right, Exclamation, Triangle, Triangle Exclamation |
| **UI 요소** | Square, Square Caret, Square Check, Square Han, Square Hangul, Square Kana, Square Latin, Square More, Square Plus, Square Play, Dot, More Horizontal, More Vertical, Handle, Handle Desktop, Menu, Column, Full, Thumbnail, Template |
| **비즈니스** | Business Bag, Coins, Crown, Diamond, Trophy, Medal, Certificate, Graduation, Fire, Thunder, Bulb, Sparkle |
| **기기/기술** | Desktop, Mobile, Keyboard, Android, Globe, Compass, Printer |
| **기타** | Heart, Heart in Heart, Like, Dislike, Star, Verified Check, Verified Star, Home, Lock, Lock Open, Eye, Eye Slash, Face Smile, Setting, Tune, Clock, History, Hourglass, Calendar, Calendar Person, Sun, Moon, Coffee, Umbrella, Inbox, Tag, Pin, Location, Link, External Link, Attachment, Folder, Folder Job, Folder Star, Passport, Palette, Utility, Flag, Ticket, Telescope, Left Side |
| **로고 (단색)** | Logo Apple, Logo Facebook, Logo Google Play, Logo Instagram, Logo Kakao, Logo LinkedIn, Logo Naver Blog, Logo YouTube, Logo Microsoft, Logo X, Logo Brunch |
| **AI/Agent** | Agent, Agent Search, Deep Search, Ai Review, Zep Fast, Storage, Whole Word, Regex, Replace, Replace All, Instance, Component, Presentation, Webinar |
| **인증** | Login, Logout |

#### Color (고정색 아이콘) — 9종

| 아이콘 | 용도 |
|---|---|
| Icon/Color/Logo Google | 구글 브랜드 로고 |
| Icon/Color/Logo Apple | 애플 브랜드 로고 |
| Icon/Color/Logo Facebook | 페이스북 브랜드 로고 |
| Icon/Color/Logo Google Play | 구글 플레이 브랜드 로고 |
| Icon/Color/Logo Instagram | 인스타그램 브랜드 로고 |
| Icon/Color/Logo Kakao | 카카오 브랜드 로고 |
| Icon/Color/Logo LinkedIn | 링크드인 브랜드 로고 |
| Icon/Color/Logo Naver Blog | 네이버 블로그 브랜드 로고 |
| Icon/Color/Logo YouTube | 유튜브 브랜드 로고 |

#### Navigation (내비게이션 아이콘) — 5종

| 아이콘 | 용도 |
|---|---|
| Icon/Navigation/Recruit | 채용 탭 |
| Icon/Navigation/Career | 커리어 탭 |
| Icon/Navigation/Social | 소셜 탭 |
| Icon/Navigation/My Page | 마이페이지 탭 |
| Icon/Navigation/Menu | 전체 메뉴 탭 |

### 배지 컴포넌트 (Badge Component)

| Property | Value |
|---|---|
| Background | `var(--status/positive, #00BF40)` |
| Text Font | SF Mono, Medium (500), 12px |
| Text Color | `var(--static/white, #FFFFFF)` |
| Border Radius | `4px` |
| Padding | `6px (horizontal)`, `2px (vertical)` |
| Gap | `3px` |
| 개발 상태 | Android, iOS, Web |

### CSS Custom Properties (Theme 통합)

```css
:root {
  /* --- Colors --- */
  --wds-label-strong: #000000;
  --wds-label-normal: #171719;
  --wds-label-alt: rgba(55, 56, 60, 0.61);
  --wds-primary-normal: #0066FF;
  --wds-bg-normal: #FFFFFF;
  --wds-fill-alt: rgba(112, 115, 124, 0.05);
  --wds-line-normal: rgba(112, 115, 124, 0.22);
  --wds-line-neutral: rgba(112, 115, 124, 0.16);
  --wds-interaction-inactive: #989BA2;
  --wds-status-positive: #00BF40;
  --wds-static-white: #FFFFFF;

  /* --- Spacing --- */
  --wds-spacing-section: 64px;
  --wds-spacing-xl: 48px;
  --wds-spacing-lg: 32px;
  --wds-spacing-md: 24px;
  --wds-spacing-sm: 20px;
  --wds-spacing-xs: 16px;
  --wds-spacing-2xs: 12px;
  --wds-spacing-3xs: 8px;
  --wds-spacing-4xs: 6px;
  --wds-spacing-5xs: 5px;
  --wds-spacing-6xs: 3px;
  --wds-spacing-7xs: 2px;

  /* --- Border Radius --- */
  --wds-radius-section: 32px;
  --wds-radius-card: 24px;
  --wds-radius-preview: 16px;
  --wds-radius-btn-lg: 12px;
  --wds-radius-btn-sm: 10px;
  --wds-radius-badge: 4px;

  /* --- Opacity --- */
  --wds-opacity-bg: 0.88;
}
```

---

## 2. Element (node-id: 16222-137704)

### 섹션 구조

| # | 섹션 | 설명 |
|---|---|---|
| 1 | **Basic** | 디자인 시스템의 기본 요소 (Ratio) |
| 2 | **Spacing** | 여백 구성 (Safe Area) |
| 3 | **Decorate** | 꾸밈 요소 (Gradient, Interaction) |

### Basic — Ratio (비율) 컴포넌트

#### Ratio/Vertical (세로 기준 비율)

| Ratio | Size (w x h) | 설명 |
|---|---|---|
| `1:1` | `100 x 100` | 정사각형 |
| `3:4` | `75 x 100` | 세로 직사각형 |
| `2:3` | `66.67 x 100` | 세로 직사각형 |
| `1:2` | `50 x 100` | 세로 직사각형 |

> customize: `height`

#### Ratio/Horizontal (가로 기준 비율)

| Aspect Ratio | Size (w x h) | 용도 |
|---|---|---|
| `1:1` | `100 x 100` | 정사각형 |
| `5:4` | `100 x 80` | 사진 |
| `4:3` | `100 x 75` | 전통적 화면 |
| `3:2` | `100 x 66.67` | 사진/카드 |
| `16:10` | `100 x 62.5` | 와이드스크린 |
| `1.618:1` | `100 x 61.80` | 황금비 |
| `16:9` | `100 x 56.25` | HD 영상 |
| `2:1` | `100 x 50` | 배너 |
| `21:9` | `100 x 42.86` | 울트라와이드 |
| `4:5` | `100 x 125` | 세로 사진 |
| `3:4` | `100 x 133.33` | 세로 직사각형 |
| `2:3` | `100 x 150` | 세로 직사각형 |
| `10:16` | `100 x 160` | 세로 와이드 |
| `1:1.618` | `100 x 161.80` | 세로 황금비 |
| `9:16` | `100 x 177.78` | 세로 HD |
| `1:2` | `100 x 200` | 세로 배너 |
| `9:21` | `100 x 233.33` | 세로 울트라와이드 |

> customize: `width`

### Spacing — Safe Area (플랫폼별 여백)

#### Status (상단 여백)

| Platform | Height | 설명 |
|---|---|---|
| **iOS** | `44px` | Status Bar 여백 |
| **Android** | `36px` | Status Bar 여백 |
| **Web** | `0px` | 여백 없음 |

#### Bottom (하단 여백)

| Platform | Height | 설명 |
|---|---|---|
| **iOS** | `34px` | Home Indicator 여백 |
| **Android** | `14px` | Navigation Bar 여백 |
| **Web** | `0px` | 여백 없음 |

### Decorate — Gradient (그라디언트)

#### Gradient/Solid (단색 그라디언트)

| Property | Value |
|---|---|
| 용도 | 배경 경계를 자연스럽게 표현 |
| Direction | `Top`, `Right`, `Bottom`, `Left` |
| Color | `var(--background/normal/normal, #FFFFFF)` |
| Size | `64 x 64` (기본) |
| 구현 | `mask-image` + `gradient-mask` |
| Easing | `cubic-bezier(0.25, 0.1, 0.25, 1)` |
| Customize | `size`, `color` |

#### Gradient/Multiple (다색 그라디언트)

| Property | Value |
|---|---|
| 용도 | 두 가지 색을 그라디언트로 연결 |
| Direction | `Top`, `Right`, `Bottom`, `Left` |
| Background | `var(--label/strong, #000000)` |
| Foreground | `var(--background/normal/normal, #FFFFFF)` |
| Size | `64 x 64` (기본) |
| 구현 | `background-color` + `mask-image` + `gradient-mask` |
| Easing | `cubic-bezier(0.25, 0.1, 0.25, 1)` |
| Customize | `size`, `color` |

#### Gradient/Mask (마스크)

| Size Variant | Dimensions |
|---|---|
| XSmall | `24 x 24` |
| Small | `32 x 32` |
| Medium | `40 x 40` |
| Large | `64 x 64` |
| XLarge | `56 x 56` |

> customize: `color`

### Decorate — Interaction (인터랙션 오버레이)

#### Opacity 토큰 (Interaction States)

| Token | CSS Variable | Value |
|---|---|---|
| opacity/5 | `--opacity/5` | `0.05` |
| opacity/8 | `--opacity/8` | `0.08` |
| opacity/12 | `--opacity/12` | `0.12` |

#### Interaction/Normal (가중치 1x)

| State | Opacity | CSS Variable |
|---|---|---|
| Normal | `0` | - |
| Hovered | `0.05` | `--opacity/5` |
| Focused | `0.08` | `--opacity/8` |
| Pressed | `0.12` | `--opacity/12` |

> Color: `var(--label/normal, #171719)`, Customize: `size`, `color`, `blending mode`

#### Interaction/Light (가중치 0.75x)

| State | Opacity | 비고 |
|---|---|---|
| Normal | `0` | - |
| Hovered | `0.0375` | Normal x 0.75 |
| Focused | `0.06` | Normal x 0.75 |
| Pressed | `0.09` | Normal x 0.75 |

> Color: `var(--label/normal, #171719)`, 개발 코멘트: Normal 값에서 가중치 *0.75를 셈합니다.

#### Interaction/Strong (가중치 1.5x)

| State | Opacity | 비고 |
|---|---|---|
| Normal | `0` | - |
| Hovered | `0.075` | Normal x 1.5 |
| Focused | `0.12` | Normal x 1.5 |
| Pressed | `0.18` | Normal x 1.5 |

> Color: `var(--label/normal, #171719)`, 개발 코멘트: Normal 값에서 가중치 *1.5를 셈합니다.

### CSS Custom Properties (Element 추가분)

```css
:root {
  /* --- Interaction Opacity --- */
  --wds-opacity-5: 0.05;
  --wds-opacity-8: 0.08;
  --wds-opacity-12: 0.12;

  /* --- Safe Area --- */
  --wds-safe-status-ios: 44px;
  --wds-safe-status-android: 36px;
  --wds-safe-bottom-ios: 34px;
  --wds-safe-bottom-android: 14px;

  /* --- Gradient --- */
  --wds-gradient-ease: cubic-bezier(0.25, 0.1, 0.25, 1);
}
```

---

## 3. Component (node-id: 16222-137705)

### 섹션 구조

| # | 카테고리 | 설명 | 컴포넌트 |
|---|---|---|---|
| 1 | **Layout** | 화면 구성 기본 요소 | Essential, Divider |
| 2 | **Action** | 사용자 상호작용 | Action Area, Button, Text Button, Icon Button, Chip, Toggle Icon |
| 3 | **Selection and Input** | 데이터 선택/입력 | Filter Button, Picker, Textinput, Select, Searchfield, Control, Segmented Control, Slider, Framed Style |
| 4 | **Content** | 정보/미디어 요소 | Icon, Play Badge, Content Badge, Thumbnail, Avatar, List Cell, Accordion, Card, Section Header, Table |
| 5 | **Loading** | 로딩 상태 | Loading, Skeleton, Pull to Refresh |
| 6 | **Navigation** | 페이지/섹션 이동 | Top Navigation, Bottom Navigation, GNB, Footer, Tab, Category, Page Indicator, Pagination, Progress Tracker, Stepper |
| 7 | **Feedback** | 상호작용 결과 피드백 | Push Badge, Toast, Snackbar, Section Message, Alert, Fallback View |
| 8 | **Presentation** | 정보 시각적 전달 | Modal, Tooltip, Popover, Menu, Auto Complete, Action Sheet, Keyboard, Scroll Bar |

### 추가 색상 토큰

| Token | CSS Variable | Value | 용도 |
|---|---|---|---|
| Label/Neutral | `--label/neutral` | `rgba(46, 47, 51, 0.88)` | Form field Heading 라벨 |
| Label/Assistive | `--label/assistive` | `rgba(55, 56, 60, 0.28)` | Placeholder 텍스트 |
| Static/Black | `--static/black` | `#000000` | Icon Button 배경 overlay |
| Background/Elevated/Normal | `--background/elevated/normal` | `#FFFFFF` | Sticky Action Area 배경 |
| Background/Transparent/Normal | `--background/transparent/normal` | `rgba(255, 255, 255, 0.08)` | Text input/Select 필드 배경 |
| Inverse/Background | `--inverse/background` | `#1B1C1E` | Toast, Snackbar, Tooltip 배경 |
| Inverse/Label | `--inverse/label` | `#F7F7F8` | Tooltip 텍스트 |
| Status/Negative | `--status/negative` | `#FF4242` | 필수(*) 표시, 에러 상태 |
| Accent/Background/Violet | `--accent/background/violet` | `#6541F2` | Trailing content placeholder |
| iOS/Accent/Primary | `--ios/accent/primary` | `#007AFF` | 커서 색상 (Search field) |
| Line/Normal/Alternative | `--line/normal/alternative` | `rgba(112, 115, 124, 0.08)` | Avatar 테두리, List Cell 구분선 |
| Fill/Normal | `--fill/normal` | `rgba(112, 115, 124, 0.08)` | Searchfield 배경 |

### 추가 Opacity 토큰

| Token | CSS Variable | Value | 용도 |
|---|---|---|---|
| opacity/88 | `--opacity/88` | `0.88` | Toast/Snackbar 텍스트 |
| opacity/61 | `--opacity/61` | `0.61` | Tooltip shortcut 텍스트 |
| opacity/52 | `--opacity/52` | `0.52` | Toast/Snackbar 배경 |
| opacity/35 | `--opacity/35` | `0.35` | Icon Button (bg variant) overlay |
| opacity/5 | `--opacity/5` | `0.05` | Toast/Snackbar/Tooltip primary tint |

### 추가 타이포그래피 토큰

| Style Name | Weight | Size | Line Height | Letter Spacing | 용도 |
|---|---|---|---|---|---|
| Body 1 / Normal - Regular | Regular (400) | `16px` | `1.5` | `0.57px` | Input 텍스트, Placeholder, List Cell 라벨 |
| Body 2 / Normal - Medium | Medium (500) | `15px` | `1.467` | `0.96px` | Chip 라벨 |
| Body 2 / Normal - Regular | Regular (400) | `15px` | `1.467` | `0.96px` | Checkbox 라벨 텍스트 |
| Label 1 / Normal - Medium | Medium (500) | `14px` | `1.429` | `1.45px` | Tooltip 텍스트, Sub action 텍스트 |
| Caption 1 / Regular | Regular (400) | `12px` | `1.334` | `2.52px` | Field description 텍스트 |
| Caption 2 / Regular | Regular (400) | `13px` | `1.385` | `0.25px` | List Cell description, Snackbar description |

### Shadow 토큰

| Token | Value | 용도 |
|---|---|---|
| Shadow/Normal/Xsmall | `0px 1px 2px -1px rgba(23,23,23,0.1)` | Text Input, Select field |
| iOS/Materials/Chrome | `backdrop-blur: 32px` (Figma blur radius: 64) | Input, Search, Icon Button bg, Toast, Snackbar, Tooltip |

### 컴포넌트별 사이즈 토큰

#### Button (`Button/Button`)

| Size | Height | Padding | Border Radius |
|---|---|---|---|
| Large | `48px` | `12px 28px` | `12px` |
| Medium | `40px` | - | `12px` |
| Small | `32px` | - | `12px` |
| Large (Icon Only) | `48 x 48` | - | `12px` |
| Medium (Icon Only) | `40 x 40` | - | `12px` |
| Small (Icon Only) | `32 x 32` | - | `12px` |

> Variant: `Solid`, `Outlined` / Color: `Primary`, `Assistive` / States: Normal, Hover, Focus, Active / Disable, Loading 지원
> Doc: https://montage.wanted.co.kr/docs/components/actions/button/design

#### Text Button (`Button/Text`)

| Size | Height | Padding |
|---|---|---|
| Medium | `32px` | `4px 0` |
| Small | `28px` | - |

> Color: `Primary`, `Assistive` / States: Normal, Hover, Focus, Active
> Doc: https://montage.wanted.co.kr/docs/components/actions/text-button/design

#### Icon Button

| Variant | Size | Dimensions | Border Radius |
|---|---|---|---|
| Normal | - | `24 x 24` (icon), tap target: inset `-8px` | - |
| Background | - | `24 x 24` (icon), padding `2px`, bg inset `-4px` | - |
| Outlined | Medium | `40 x 40` | `1000px` (pill) |
| Outlined | Small | `32 x 32` | `1000px` |
| Outlined | Custom | `28 x 28` | `1000px` |
| Solid | Medium | `40 x 40` | `1000px` |
| Solid | Small | `32 x 32` | `1000px` |
| Solid | Custom | `28 x 28` | `1000px` |

#### Chip (`Chip/Chip`)

| Size | Height | Padding | Border Radius |
|---|---|---|---|
| XSmall | `24px` | - | - |
| Small | `32px` | - | - |
| Medium | `36px` | `9px 12px` | - |
| Large | `40px` | - | `10px` |

> Variant: `Solid`, `Outlined` / Active, Disable 지원
> Doc: https://montage.wanted.co.kr/docs/components/actions/action-chip/design

#### Textinput (`Textinput/Textfield`)

| Property | Value |
|---|---|
| Width | `335px` (기본) |
| Inner Padding | `12px` |
| Border Radius | `12px` |
| Shadow | `0px 1px 2px -1px rgba(23,23,23,0.1)` |

> Status: `Normal`, `Positive`, `Negative` / Active, Focus, Disable 지원
> Doc: https://montage.wanted.co.kr/docs/components/selection-and-input/text-field/design

#### Select (`Select/Select`)

| Property | Value |
|---|---|
| Width | `335px` (기본) |
| Inner Padding | `12px` |
| Border Radius | `12px` |
| Shadow | `0px 1px 2px -1px rgba(23,23,23,0.1)` |

> Render: `Text` / Negative, Active, Focus, Disable, Overflow 지원
> Doc: https://montage.wanted.co.kr/docs/components/selection-and-input/select/design

#### Searchfield (`Searchfield/Searchfield`)

| Size | Height | Width | Padding | Border Radius |
|---|---|---|---|---|
| Medium | `48px` | `335px` | `12px` | `12px` |
| Small | `40px` | `335px` | `12px` | `12px` |

> Doc: https://montage.wanted.co.kr/docs/components/selection-and-input/search-field/design

#### Control (Checkbox / Radio / Switch)

| Component | Size | Dimensions | Border | Border Radius |
|---|---|---|---|---|
| Checkbox | Medium | `18 x 18` | `1.5px` | `5px` |
| Checkbox | Small | (smaller) | `1.5px` | - |

> State: `Unchecked`, `Checked`, `Indeterminate` / Tight, Bold, Disable 지원
> Doc: https://montage.wanted.co.kr/docs/components/selection-and-input/checkbox/design

#### Avatar (`Avatar/Avatar`)

| Size | Dimensions | Border Radius 규칙 |
|---|---|---|
| XSmall | `24 x 24` | `size * 0.25` (짝수 올림) |
| Small | `32 x 32` | `8px` |
| Medium | `40 x 40` | `10px` |
| Large | `48 x 48` | `12px` |
| XLarge | `56 x 56` | `14px` |

> Variant: `Person`, `Company`, `Academy` / Placeholder, Interaction, PushBadge 지원
> Doc: https://montage.wanted.co.kr/docs/components/contents/avatar/design

#### List Cell (`List Cell/List Cell`)

| Vertical Padding | Height |
|---|---|
| None | `24px` |
| Small | `40px` (py: `8px`) |
| Medium | `48px` (py: `12px`) |
| Large | `56px` (py: `16px`) |

> Leading: Icon, Radio, Checkbox, Avatar, Large Icon, Thumbnail
> Trailing: Value, Icon Button, Icon, Text Button, Checkbox, Badge, Switch
> Doc: https://montage.wanted.co.kr/docs/components/contents/list-cell/design

#### Tab (`Tab/Tab`)

| Size | Height |
|---|---|
| Small | `40px` |
| Medium | `48px` |
| Large | `56px` |

> Resize: `Hug`, `Fill` / Horizontal Padding, Trailing Icon Button, Scroll 지원

#### Toast / Snackbar

| Property | Toast | Snackbar |
|---|---|---|
| Max Width | `420px` | `420px` |
| Padding H | `16px` | `16px` |
| Padding V | `11px` | `11px` |
| Background | `var(--inverse/background)` | `var(--inverse/background)` |
| Border Radius | - | interaction `6px` |

> Toast Variant: `Normal`, `Positive`, `Cautionary`, `Negative`
> Doc: https://montage.wanted.co.kr/docs/components/feedback/toast/design / snackbar/design

#### Tooltip (`Tooltip/Tooltip`)

| Size | Min Width | Padding | Max Content Width | Arrow |
|---|---|---|---|---|
| Medium | `64px` | `12px H / 8px V` | `256px` | `20 x 8` |
| Small | - | - | - | `14 x 6` |

> Position: `Top`, `Bottom`, `Left`, `Right` / Align: `Left`, `Center`, `Right`
> Body Border Radius: `8px`
> Doc: https://montage.wanted.co.kr/docs/components/presentation/tooltip/design

#### Alert (`Alert/Alert`)

> Platform: `iOS`, `Android`, `Web` / Action: `Normal`, `Assistive`, `Negative`

#### Bottom Navigation

| Platform | Dimensions |
|---|---|
| iOS | `375 x 85` |
| Android | `360 x 78` |
| Web Mobile | `400 x 58` |

> Doc: https://montage.wanted.co.kr/docs/components/navigations/bottom-navigation/design

#### Action Area (`Action Area/Action Area`)

| Property | Value |
|---|---|
| Padding | `20px` (horizontal & vertical) |
| Button Gap | `8px` |
| Content Gap | `16px` |
| Safe Area Bottom | `34px` (iOS) |

> Variant: `Strong`, `Neutral`, `Compact (Web Only)`, `Cancel`
> Extra Presets: `Custom`, `Summary`, `Information`, `Checkbox`, `Chip`
> Doc: https://montage.wanted.co.kr/docs/components/actions/action-area/design

#### Divider (`Divider/Divider`)

| Variant | Height |
|---|---|
| Normal | `1px` |
| Thick | `12px` |

#### Card (`Card/Card`)

> Platform: `Desktop`, `Mobile` / Skeleton 지원
> List Card (`Card/List Card`) 별도 존재

### Interaction 패턴 (공통)

| 컴포넌트 | Interaction Level |
|---|---|
| Primary Button | `Interaction/Strong` (x1.5) |
| Icon Button, Chip, List Cell, Tab | `Interaction/Light` (x0.75) |
| Checkbox, Text Button | `Interaction/Normal` (x1) |

> 모든 인터랙티브 컴포넌트는 States: `Normal` → `Hover` → `Focus` → `Active(Press)` 순환

### 공통 디자인 패턴

| 패턴 | 설명 |
|---|---|
| **Backdrop Blur** | Input, Search, Icon Button bg, Toast, Snackbar, Tooltip에 `backdrop-blur: 32px` 적용 |
| **Inner Border** | Input/Select는 absolute positioned inner border + `border-radius: 12px` |
| **Drop Shadow** | Input/Select에 `0px 1px 2px -1px rgba(23,23,23,0.1)` |
| **Safe Area** | Action Area에 iOS home bar 34px 여백 |
| **Gradient Mask** | Sticky Action Area에 scroll fade 효과 |
| **CSS Variables** | 모든 색상은 `var(--token, fallback)` 형태로 정의 |

### CSS Custom Properties (Component 추가분)

```css
:root {
  /* --- Component Colors --- */
  --wds-label-neutral: rgba(46, 47, 51, 0.88);
  --wds-label-assistive: rgba(55, 56, 60, 0.28);
  --wds-static-black: #000000;
  --wds-bg-elevated: #FFFFFF;
  --wds-bg-transparent: rgba(255, 255, 255, 0.08);
  --wds-inverse-bg: #1B1C1E;
  --wds-inverse-label: #F7F7F8;
  --wds-status-negative: #FF4242;
  --wds-accent-violet: #6541F2;
  --wds-line-alt: rgba(112, 115, 124, 0.08);
  --wds-fill-normal: rgba(112, 115, 124, 0.08);

  /* --- Component Opacity --- */
  --wds-opacity-88: 0.88;
  --wds-opacity-61: 0.61;
  --wds-opacity-52: 0.52;
  --wds-opacity-35: 0.35;
  --wds-opacity-5: 0.05;

  /* --- Component Shadows --- */
  --wds-shadow-xsmall: 0px 1px 2px -1px rgba(23, 23, 23, 0.1);

  /* --- Component Sizing --- */
  --wds-btn-lg: 48px;
  --wds-btn-md: 40px;
  --wds-btn-sm: 32px;
  --wds-input-radius: 12px;
  --wds-chip-lg: 40px;
  --wds-chip-md: 36px;
  --wds-chip-sm: 32px;
  --wds-chip-xs: 24px;
  --wds-tooltip-radius: 8px;
}
```

---

## 4. Resource (node-id: 1173-12995)

> 라이브러리에 쓰이는 애셋입니다. 필요에 따라 재사용하거나 수정하여 효율적으로 작업을 진행할 수 있도록 돕습니다.

### 색상 토큰 (Color Tokens)

| Token | CSS Variable | Value | 용도 |
|---|---|---|---|
| Status/Positive | `--status/positive` | `#00BF40` | Badge 활성 상태 배경 |
| Status/Negative | `--status/negative` | `#FF4242` | Inspect Measure 값 표시 배경 |
| Interaction/Inactive | `--interaction/inactive` | `#989BA2` | Badge 비활성 상태 배경 |
| Static/White | `--static/white` | `#FFFFFF` (white) | Badge·Measure 텍스트 색상 |
| Label/Strong | `--label/strong` | `#000000` | 섹션 제목 텍스트 |
| Label/Normal | `--label/normal` | `#171719` | 본문·설명 텍스트, Badge Value 텍스트 |
| Label/Alternative | `--label/alternative` | `rgba(55, 56, 60, 0.61)` | Badge Value default 텍스트 |
| Fill/Strong | `--fill/strong` | `rgba(112, 115, 124, 0.16)` | Badge Value Normal 배경 |
| Fill/Alternative | `--fill/alternative` | `rgba(112, 115, 124, 0.05)` | Update Badge 배경 |
| Accent/Background/Violet | `--accent/background/violet` | `#6541F2` | Badge Value Customize 배경(12% opacity)·텍스트 |
| _Status/Resource | — | `#DBDCDF` | Resource 상태 표시 (내부용) |
| _Status/Design Only | — | `#F0ECFE` | 디자인 전용 상태 표시 (내부용) |

### 타이포그래피 토큰 (Typography Tokens)

| Token | Font | Size | Weight | Line Height | Letter Spacing | 용도 |
|---|---|---|---|---|---|---|
| Display 3/Bold | Pretendard JP | 36px | 700 (Bold) | 1.334 | -2.7% (-0.972px) | 페이지 제목 |
| Title 3/Bold | Pretendard JP | 24px | 700 (Bold) | 1.334 | -2.3% (-0.552px) | 카테고리 제목 |
| Body 1/Normal-Medium | Pretendard JP | 16px | 500 (Medium) | 1.5 | 0.57% (0.0912px) | 페이지 설명 |
| Label 2/Medium | Pretendard JP | 13px | 500 (Medium) | 1.385 | 1.94% (0.2522px) | 컴포넌트 설명 |
| Badge (SF Mono) | SF Mono | 12px | Medium | 1.334 | — | Badge Status·Value 텍스트 |
| Badge Default | SF Mono | 10px | Medium | 1.2 | — | Badge Value default 라벨 |
| Label 1/Normal-Bold | Pretendard JP | 14px | 600 (SemiBold) | 1.429 | 1.45% (0.203px) | Measure Medium 값 |
| Measure Normal | Pretendard JP | 9px | 600 (SemiBold) | 1.273 | 4.38% (0.3942px) | Measure Normal 값 |
| Measure Small | Pretendard JP | 8px | 600 (SemiBold) | 1.25 | 5.07% (0.4056px) | Measure Small 값 |

### 이펙트 토큰 (Effect Tokens)

| Token | Type | Value | 용도 |
|---|---|---|---|
| iOS/Materials/Chrome | Background Blur | radius: 64px | Badge Value·Measure backdrop-blur |
| Badge backdrop-blur | Backdrop Blur | 32px | Badge·Measure 공통 블러 |

### 컴포넌트 토큰 (Component Tokens)

#### Badge/Status

| 속성 | Available=True | Available=False |
|---|---|---|
| 배경색 | `--status/positive` (#00BF40) | `--interaction/inactive` (#989BA2) |
| 텍스트색 | `--static/white` (white) | `--static/white` (white) |
| 폰트 | SF Mono Medium 12px | SF Mono Medium 12px |
| Padding | 6px (좌우) / 2px (상하) | 6px (좌우) / 2px (상하) |
| Border Radius | 4px | 4px |
| Gap | 3px | 3px |
| Update Badge | 12px 원형, blur 32px, `--fill/alternative` 배경 | — |

#### Badge/Value

| 속성 | Variant=Normal | Variant=Customize |
|---|---|---|
| 배경색 | `--fill/strong` (rgba(112,115,124,0.16)) | `--accent/background/violet` (#6541F2) @ 12% opacity |
| 텍스트색 | `--label/normal` (#171719) | `--accent/background/violet` (#6541F2) |
| Default 라벨 | `--label/alternative` 10px | — |
| 폰트 | SF Mono Medium 12px | SF Mono Medium 12px |
| Padding | 6px (좌우) / 2px (상하) | 6px (좌우) / 2px (상하) |
| Border Radius | 4px | 4px |
| Gap | 4px | 4px |
| Backdrop Blur | 32px | 32px |

#### Inspect/Measure

| 속성 | Size=Normal | Size=Small | Size=Medium |
|---|---|---|---|
| 값 배경색 | `--status/negative` (#FF4242) | `--status/negative` (#FF4242) | `--status/negative` (#FF4242) |
| 값 텍스트색 | `--static/white` | `--static/white` | `--static/white` |
| 값 폰트 | Pretendard JP SemiBold 9px | Pretendard JP SemiBold 8px | Pretendard JP SemiBold 14px |
| 값 Padding | 4px (좌우) / ~1px (상하) | 2px (좌우) | 8px (좌우) / 1px (상하) |
| 값 Border Radius | 6.5px | 6.5px | 11px |
| 라인 두께 (H) | 6px | 6px | 12px |
| 라인 두께 (V) | 6px | 6px | 12px |
| Backdrop Blur | 32px | 32px | 32px |
| 방향 | Horizontal / Vertical | Horizontal / Vertical | Horizontal / Vertical |

---

## 5. Color - Atomic (node-id: 15625-52196)

> 일관된 브랜드 아이덴티티와 시각적 스타일을 유지하기 위해 정의된 색상 모음입니다. 컬러는 자주 쓰이는 상황에 효율적으로 사용 가능한 시멘틱과, 다양한 상황에 대응할 수 있는 팔레트로 나뉩니다.

### Common

| Token | CSS Variable | Value |
|---|---|---|
| Common/100 | `--common/100` | `#FFFFFF` (white) |
| Common/0 | `--common/0` | `#000000` (black) |

### Neutral

| Token | CSS Variable | Value |
|---|---|---|
| Neutral/99 | `--neutral/99` | `#F7F7F7` |
| Neutral/95 | `--neutral/95` | `#DCDCDC` |
| Neutral/90 | `--neutral/90` | `#C4C4C4` |
| Neutral/80 | `--neutral/80` | `#B0B0B0` |
| Neutral/70 | `--neutral/70` | `#9B9B9B` |
| Neutral/60 | `--neutral/60` | `#8A8A8A` |
| Neutral/50 | `--neutral/50` | `#737373` |
| Neutral/40 | `--neutral/40` | `#5C5C5C` |
| Neutral/30 | `--neutral/30` | `#474747` |
| Neutral/22 | `--neutral/22` | `#303030` |
| Neutral/20 | `--neutral/20` | `#2A2A2A` |
| Neutral/15 | `--neutral/15` | `#1C1C1C` |
| Neutral/10 | `--neutral/10` | `#171717` |
| Neutral/5 | `--neutral/5` | `#0F0F0F` |

### Cool Neutral

| Token | CSS Variable | Value |
|---|---|---|
| Cool Neutral/99 | `--cool-neutral/99` | `#F7F7F8` |
| Cool Neutral/98 | `--cool-neutral/98` | `#F4F4F5` |
| Cool Neutral/97 | `--cool-neutral/97` | `#EAEBEC` |
| Cool Neutral/96 | `--cool-neutral/96` | `#E1E2E4` |
| Cool Neutral/95 | `--cool-neutral/95` | `#DBDCDF` |
| Cool Neutral/90 | `--cool-neutral/90` | `#C2C4C8` |
| Cool Neutral/80 | `--cool-neutral/80` | `#AEB0B6` |
| Cool Neutral/70 | `--cool-neutral/70` | `#989BA2` |
| Cool Neutral/60 | `--cool-neutral/60` | `#878A93` |
| Cool Neutral/50 | `--cool-neutral/50` | `#70737C` |
| Cool Neutral/40 | `--cool-neutral/40` | `#5A5C63` |
| Cool Neutral/30 | `--cool-neutral/30` | `#46474C` |
| Cool Neutral/25 | `--cool-neutral/25` | `#37383C` |
| Cool Neutral/23 | `--cool-neutral/23` | `#333438` |
| Cool Neutral/22 | `--cool-neutral/22` | `#2E2F33` |
| Cool Neutral/20 | `--cool-neutral/20` | `#292A2D` |
| Cool Neutral/17 | `--cool-neutral/17` | `#212225` |
| Cool Neutral/15 | `--cool-neutral/15` | `#1B1C1E` |
| Cool Neutral/10 | `--cool-neutral/10` | `#171719` |
| Cool Neutral/7 | `--cool-neutral/7` | `#141415` |
| Cool Neutral/5 | `--cool-neutral/5` | `#0F0F10` |

### Blue

| Token | CSS Variable | Value |
|---|---|---|
| Blue/99 | `--blue/99` | `#F7FBFF` |
| Blue/95 | `--blue/95` | `#EAF2FE` |
| Blue/90 | `--blue/90` | `#C9DEFE` |
| Blue/80 | `--blue/80` | `#9EC5FF` |
| Blue/70 | `--blue/70` | `#69A5FF` |
| Blue/65 | `--blue/65` | `#4F95FF` |
| Blue/60 | `--blue/60` | `#3385FF` |
| Blue/55 | `--blue/55` | `#1A75FF` |
| Blue/50 | `--blue/50` | `#0066FF` |
| Blue/45 | `--blue/45` | `#005EEB` |
| Blue/40 | `--blue/40` | `#0054D1` |
| Blue/30 | `--blue/30` | `#003E9C` |
| Blue/20 | `--blue/20` | `#002966` |
| Blue/10 | `--blue/10` | `#001536` |

### Red

| Token | CSS Variable | Value |
|---|---|---|
| Red/99 | `--red/99` | `#FFFAFA` |
| Red/95 | `--red/95` | `#FEECEC` |
| Red/90 | `--red/90` | `#FED5D5` |
| Red/80 | `--red/80` | `#FFB5B5` |
| Red/70 | `--red/70` | `#FF8C8C` |
| Red/60 | `--red/60` | `#FF6363` |
| Red/50 | `--red/50` | `#FF4242` |
| Red/40 | `--red/40` | `#E52222` |
| Red/30 | `--red/30` | `#B00C0C` |
| Red/20 | `--red/20` | `#730303` |
| Red/10 | `--red/10` | `#3B0101` |

### Green

| Token | CSS Variable | Value |
|---|---|---|
| Green/99 | `--green/99` | `#F2FFF6` |
| Green/95 | `--green/95` | `#D9FFE6` |
| Green/90 | `--green/90` | `#ACFCC7` |
| Green/80 | `--green/80` | `#7DF5A5` |
| Green/70 | `--green/70` | `#49E57D` |
| Green/60 | `--green/60` | `#1ED45A` |
| Green/50 | `--green/50` | `#00BF40` |
| Green/40 | `--green/40` | `#009632` |
| Green/30 | `--green/30` | `#006E25` |
| Green/20 | `--green/20` | `#004517` |
| Green/10 | `--green/10` | `#00240C` |

### Orange

| Token | CSS Variable | Value |
|---|---|---|
| Orange/99 | `--orange/99` | `#FFFCF7` |
| Orange/95 | `--orange/95` | `#FEF4E6` |
| Orange/90 | `--orange/90` | `#FEE6C6` |
| Orange/80 | `--orange/80` | `#FFD49C` |
| Orange/70 | `--orange/70` | `#FFC06E` |
| Orange/60 | `--orange/60` | `#FFA938` |
| Orange/50 | `--orange/50` | `#FF9200` |
| Orange/40 | `--orange/40` | `#D47800` |
| Orange/39 | `--orange/39` | `#D17600` |
| Orange/30 | `--orange/30` | `#9C5800` |
| Orange/20 | `--orange/20` | `#663A00` |
| Orange/10 | `--orange/10` | `#361E00` |

### Red Orange

| Token | CSS Variable | Value |
|---|---|---|
| Red Orange/99 | `--red-orange/99` | `#FFFAF7` |
| Red Orange/95 | `--red-orange/95` | `#FEEEE5` |
| Red Orange/90 | `--red-orange/90` | `#FED9C4` |
| Red Orange/80 | `--red-orange/80` | `#FFBD96` |
| Red Orange/70 | `--red-orange/70` | `#FF9B61` |
| Red Orange/60 | `--red-orange/60` | `#FF7B2E` |
| Red Orange/50 | `--red-orange/50` | `#FF5E00` |
| Red Orange/48 | `--red-orange/48` | `#F55A00` |
| Red Orange/40 | `--red-orange/40` | `#C94A00` |
| Red Orange/30 | `--red-orange/30` | `#913500` |
| Red Orange/20 | `--red-orange/20` | `#592100` |
| Red Orange/10 | `--red-orange/10` | `#290F00` |

### Lime

| Token | CSS Variable | Value |
|---|---|---|
| Lime/99 | `--lime/99` | `#F8FFF2` |
| Lime/95 | `--lime/95` | `#E6FFD4` |
| Lime/90 | `--lime/90` | `#CCFCA9` |
| Lime/80 | `--lime/80` | `#AEF779` |
| Lime/70 | `--lime/70` | `#88F03E` |
| Lime/60 | `--lime/60` | `#6BE016` |
| Lime/50 | `--lime/50` | `#58CF04` |
| Lime/40 | `--lime/40` | `#48AD00` |
| Lime/37 | `--lime/37` | `#429E00` |
| Lime/30 | `--lime/30` | `#347D00` |
| Lime/20 | `--lime/20` | `#225200` |
| Lime/10 | `--lime/10` | `#112900` |

### Cyan

| Token | CSS Variable | Value |
|---|---|---|
| Cyan/99 | `--cyan/99` | `#F7FEFF` |
| Cyan/95 | `--cyan/95` | `#DEFAFF` |
| Cyan/90 | `--cyan/90` | `#B5F4FF` |
| Cyan/80 | `--cyan/80` | `#8AEDFF` |
| Cyan/70 | `--cyan/70` | `#57DFF7` |
| Cyan/60 | `--cyan/60` | `#28D0ED` |
| Cyan/50 | `--cyan/50` | `#00BDDE` |
| Cyan/40 | `--cyan/40` | `#0098B2` |
| Cyan/30 | `--cyan/30` | `#006F82` |
| Cyan/20 | `--cyan/20` | `#004854` |
| Cyan/10 | `--cyan/10` | `#00252B` |

### Light Blue

| Token | CSS Variable | Value |
|---|---|---|
| Light Blue/99 | `--light-blue/99` | `#F7FDFF` |
| Light Blue/95 | `--light-blue/95` | `#E5F6FE` |
| Light Blue/90 | `--light-blue/90` | `#C4ECFE` |
| Light Blue/80 | `--light-blue/80` | `#A1E1FF` |
| Light Blue/70 | `--light-blue/70` | `#70D2FF` |
| Light Blue/60 | `--light-blue/60` | `#3DC2FF` |
| Light Blue/50 | `--light-blue/50` | `#00AEFF` |
| Light Blue/40 | `--light-blue/40` | `#008DCF` |
| Light Blue/30 | `--light-blue/30` | `#006796` |
| Light Blue/20 | `--light-blue/20` | `#004261` |
| Light Blue/10 | `--light-blue/10` | `#002130` |

### Violet

| Token | CSS Variable | Value |
|---|---|---|
| Violet/99 | `--violet/99` | `#FBFAFF` |
| Violet/95 | `--violet/95` | `#F0ECFE` |
| Violet/90 | `--violet/90` | `#DBD3FE` |
| Violet/80 | `--violet/80` | `#C0B0FF` |
| Violet/70 | `--violet/70` | `#9E86FC` |
| Violet/60 | `--violet/60` | `#7D5EF7` |
| Violet/50 | `--violet/50` | `#6541F2` |
| Violet/45 | `--violet/45` | `#5B37ED` |
| Violet/40 | `--violet/40` | `#4F29E5` |
| Violet/30 | `--violet/30` | `#3A16C9` |
| Violet/20 | `--violet/20` | `#23098F` |
| Violet/10 | `--violet/10` | `#11024D` |

### Purple

| Token | CSS Variable | Value |
|---|---|---|
| Purple/99 | `--purple/99` | `#FEFBFF` |
| Purple/95 | `--purple/95` | `#F9EDFF` |
| Purple/90 | `--purple/90` | `#F2D6FF` |
| Purple/80 | `--purple/80` | `#E9BAFF` |
| Purple/70 | `--purple/70` | `#DE96FF` |
| Purple/60 | `--purple/60` | `#D478FF` |
| Purple/50 | `--purple/50` | `#CB59FF` |
| Purple/40 | `--purple/40` | `#AD36E3` |
| Purple/30 | `--purple/30` | `#861CB8` |
| Purple/20 | `--purple/20` | `#580A7D` |
| Purple/10 | `--purple/10` | `#290247` |

### Pink

| Token | CSS Variable | Value |
|---|---|---|
| Pink/99 | `--pink/99` | `#FFFAFE` |
| Pink/95 | `--pink/95` | `#FEECFB` |
| Pink/90 | `--pink/90` | `#FED3F7` |
| Pink/80 | `--pink/80` | `#FFB8F3` |
| Pink/70 | `--pink/70` | `#FF94ED` |
| Pink/60 | `--pink/60` | `#FA73E3` |
| Pink/50 | `--pink/50` | `#F553DA` |
| Pink/46 | `--pink/46` | `#E846CD` |
| Pink/40 | `--pink/40` | `#D331B8` |
| Pink/30 | `--pink/30` | `#A81690` |
| Pink/20 | `--pink/20` | `#730560` |
| Pink/10 | `--pink/10` | `#3D0133` |

### Opacity

| Token | CSS Variable | Value |
|---|---|---|
| Opacity/0 | `--opacity/0` | `0` |
| Opacity/5 | `--opacity/5` | `0.05` |
| Opacity/8 | `--opacity/8` | `0.08` |
| Opacity/12 | `--opacity/12` | `0.12` |
| Opacity/16 | `--opacity/16` | `0.16` |
| Opacity/22 | `--opacity/22` | `0.22` |
| Opacity/28 | `--opacity/28` | `0.28` |
| Opacity/35 | `--opacity/35` | `0.35` |
| Opacity/43 | `--opacity/43` | `0.43` |
| Opacity/52 | `--opacity/52` | `0.52` |
| Opacity/61 | `--opacity/61` | `0.61` |
| Opacity/74 | `--opacity/74` | `0.74` |
| Opacity/88 | `--opacity/88` | `0.88` |
| Opacity/97 | `--opacity/97` | `0.97` |
| Opacity/100 | `--opacity/100` | `1` |

---

## 6. Color - Semantic (node-id: 15625-32983)

> 시멘틱 컬러는 Atomic 팔레트를 기반으로 UI 역할별로 매핑된 색상 토큰입니다. Light / Dark 두 테마로 구분됩니다.

### Primary

| Token | CSS Variable | Value (Light) | Value (Dark) |
|---|---|---|---|
| Primary/Normal | `--primary/normal` | `#0066FF` | `#0066FF` |
| Primary/Strong | `--primary/strong` | `#005EEB` | `#005EEB` |
| Primary/Heavy | `--primary/heavy` | `#0054D1` | `#0054D1` |

### Label

| Token | CSS Variable | Value (Light) | Value (Dark) |
|---|---|---|---|
| Label/Normal | `--label/normal` | `#171719` | `#171719` |
| Label/Strong | `--label/strong` | `#000000` | `#000000` |
| Label/Neutral | `--label/neutral` | `rgba(46, 47, 51, 0.88)` | `rgba(46, 47, 51, 0.88)` |
| Label/Alternative | `--label/alternative` | `rgba(55, 56, 60, 0.61)` | `rgba(55, 56, 60, 0.61)` |
| Label/Assistive | `--label/assistive` | `rgba(55, 56, 60, 0.28)` | `rgba(55, 56, 60, 0.28)` |
| Label/Disable | `--label/disable` | `rgba(55, 56, 60, 0.16)` | `rgba(55, 56, 60, 0.16)` |

### Background

#### Normal

| Token | CSS Variable | Value (Light) | Value (Dark) |
|---|---|---|---|
| Background/Normal/Normal | `--background/normal/normal` | `#FFFFFF` | `#FFFFFF` |
| Background/Normal/Alternative | `--background/normal/alternative` | `#F7F7F8` | `#F7F7F8` |

#### Elevated

| Token | CSS Variable | Value (Light) | Value (Dark) |
|---|---|---|---|
| Background/Elevated/Normal | `--background/elevated/normal` | `#FFFFFF` | `#FFFFFF` |
| Background/Elevated/Alternative | `--background/elevated/alternative` | `#F7F7F8` | `#F7F7F8` |

#### Transparent

| Token | CSS Variable | Value (Light) | Value (Dark) |
|---|---|---|---|
| Background/Transparent/Normal | `--background/transparent/normal` | `rgba(255, 255, 255, 0.08)` | `rgba(255, 255, 255, 0.08)` |
| Background/Transparent/Alternative | `--background/transparent/alternative` | `rgba(255, 255, 255, 0.28)` | `rgba(255, 255, 255, 0.28)` |

### Interaction

| Token | CSS Variable | Value (Light) | Value (Dark) |
|---|---|---|---|
| Interaction/Inactive | `--interaction/inactive` | `#989BA2` | `#989BA2` |
| Interaction/Disable | `--interaction/disable` | `#F4F4F5` | `#F4F4F5` |

### Line

#### Normal (opacity 기반)

| Token | CSS Variable | Value (Light) | Value (Dark) |
|---|---|---|---|
| Line/Normal/Normal | `--line/normal/normal` | `rgba(112, 115, 124, 0.22)` | `rgba(112, 115, 124, 0.22)` |
| Line/Normal/Neutral | `--line/normal/neutral` | `rgba(112, 115, 124, 0.16)` | `rgba(112, 115, 124, 0.16)` |
| Line/Normal/Alternative | `--line/normal/alternative` | `rgba(112, 115, 124, 0.08)` | `rgba(112, 115, 124, 0.08)` |

#### Solid (단색)

| Token | CSS Variable | Value (Light) | Value (Dark) |
|---|---|---|---|
| Line/Solid/Normal | `--line/solid/normal` | `#E1E2E4` | `#E1E2E4` |
| Line/Solid/Neutral | `--line/solid/neutral` | `#EAEBEC` | `#EAEBEC` |
| Line/Solid/Alternative | `--line/solid/alternative` | `#F4F4F5` | `#F4F4F5` |

### Status

| Token | CSS Variable | Value (Light) | Value (Dark) |
|---|---|---|---|
| Status/Positive | `--status/positive` | `#00BF40` | `#00BF40` |
| Status/Cautionary | `--status/cautionary` | `#FF9200` | `#FF9200` |
| Status/Negative | `--status/negative` | `#FF4242` | `#FF4242` |

### Accent / Background

| Token | CSS Variable | Value |
|---|---|---|
| Accent/Background/Red Orange | `--accent/background/red-orange` | `#FF5E00` |
| Accent/Background/Lime | `--accent/background/lime` | `#58CF04` |
| Accent/Background/Cyan | `--accent/background/cyan` | `#00BDDE` |
| Accent/Background/Light Blue | `--accent/background/light-blue` | `#00AEFF` |
| Accent/Background/Violet | `--accent/background/violet` | `#6541F2` |
| Accent/Background/Purple | `--accent/background/purple` | `#CB59FF` |
| Accent/Background/Pink | `--accent/background/pink` | `#F553DA` |

### Accent / Foreground

| Token | CSS Variable | Value |
|---|---|---|
| Accent/Foreground/Red | `--accent/foreground/red` | `#E52222` |
| Accent/Foreground/Red Orange | `--accent/foreground/red-orange` | `#F55A00` |
| Accent/Foreground/Orange | `--accent/foreground/orange` | `#D17600` |
| Accent/Foreground/Lime | `--accent/foreground/lime` | `#429E00` |
| Accent/Foreground/Green | `--accent/foreground/green` | `#009632` |
| Accent/Foreground/Cyan | `--accent/foreground/cyan` | `#0098B2` |
| Accent/Foreground/Light Blue | `--accent/foreground/light-blue` | `#008DCF` |
| Accent/Foreground/Blue | `--accent/foreground/blue` | `#005EEB` |
| Accent/Foreground/Violet | `--accent/foreground/violet` | `#5B37ED` |
| Accent/Foreground/Purple | `--accent/foreground/purple` | `#AD36E3` |
| Accent/Foreground/Pink | `--accent/foreground/pink` | `#E846CD` |

### Inverse

| Token | CSS Variable | Value |
|---|---|---|
| Inverse/Primary | `--inverse/primary` | `#3385FF` |
| Inverse/Background | `--inverse/background` | `#1B1C1E` |
| Inverse/Label | `--inverse/label` | `#F7F7F8` |

### Static

| Token | CSS Variable | Value |
|---|---|---|
| Static/White | `--static/white` | `#FFFFFF` |
| Static/Black | `--static/black` | `#000000` |

### Fill

| Token | CSS Variable | Value (base: #70737C) |
|---|---|---|
| Fill/Normal | `--fill/normal` | `rgba(112, 115, 124, 0.08)` |
| Fill/Strong | `--fill/strong` | `rgba(112, 115, 124, 0.16)` |
| Fill/Alternative | `--fill/alternative` | `rgba(112, 115, 124, 0.05)` |

### Material

| Token | CSS Variable | Value |
|---|---|---|
| Material/Dimmer | `--material/dimmer` | `rgba(23, 23, 25, 0.52)` |

### Shadow

#### Normal

| Token | CSS (box-shadow) |
|---|---|
| Shadow/Normal/Xsmall | `0 1px 2px -1px rgba(23,23,23,0.10)` |
| Shadow/Normal/Small | `0 2px 4px -2px rgba(23,23,23,0.06), 0 4px 6px -1px rgba(23,23,23,0.06)` |
| Shadow/Normal/Medium | `0 4px 6px -2px rgba(23,23,23,0.07), 0 10px 15px -3px rgba(23,23,23,0.07)` |
| Shadow/Normal/Large | `0 6px 10px -4px rgba(23,23,23,0.08), 0 16px 24px -6px rgba(23,23,23,0.08)` |
| Shadow/Normal/Xlarge | `0 10px 15px -5px rgba(23,23,23,0.10), 0 24px 38px -10px rgba(23,23,23,0.12)` |

#### Spread

| Token | CSS (box-shadow) |
|---|---|
| Shadow/Spread/Small | `0 0 60px 0 rgba(23,23,23,0.10)` |
| Shadow/Spread/Medium | `0 15px 75px 0 rgba(23,23,23,0.16)` |

---

## 7. Typography (node-id: 15625-54522)

> 타이포그래피 규칙을 안내합니다. 폰트: Pretendard JP (`fontFeatureSettings: 'ss10' 1`)

### Display

| Style | Weight | Size | Weight Value | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| Display 1/Bold | Bold | 56px | 700 | 1.286 | -3.19px |
| Display 1/Medium | Medium | 56px | 500 | 1.286 | -3.19px |
| Display 1/Regular | Regular | 56px | 400 | 1.286 | -3.19px |
| Display 2/Bold | Bold | 40px | 700 | 1.300 | -2.82px |
| Display 2/Medium | Medium | 40px | 500 | 1.300 | -2.82px |
| Display 2/Regular | Regular | 40px | 400 | 1.300 | -2.82px |
| Display 3/Bold | Bold | 36px | 700 | 1.334 | -2.70px |
| Display 3/Medium | Medium | 36px | 500 | 1.334 | -2.70px |
| Display 3/Regular | Regular | 36px | 400 | 1.334 | -2.70px |

### Title

| Style | Weight | Size | Weight Value | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| Title 1/Bold | Bold | 32px | 700 | 1.375 | -2.53px |
| Title 1/Medium | Medium | 32px | 500 | 1.375 | -2.53px |
| Title 1/Regular | Regular | 32px | 400 | 1.375 | -2.53px |
| Title 2/Bold | Bold | 28px | 700 | 1.358 | -2.36px |
| Title 2/Medium | Medium | 28px | 500 | 1.358 | -2.36px |
| Title 2/Regular | Regular | 28px | 400 | 1.358 | -2.36px |
| Title 3/Bold | Bold | 24px | 700 | 1.334 | -2.30px |
| Title 3/Medium | Medium | 24px | 500 | 1.334 | -2.30px |
| Title 3/Regular | Regular | 24px | 400 | 1.334 | -2.30px |

### Heading

| Style | Weight | Size | Weight Value | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| Heading 1/Bold | SemiBold | 22px | 600 | 1.364 | -1.94px |
| Heading 1/Medium | Medium | 22px | 500 | 1.364 | -1.94px |
| Heading 1/Regular | Regular | 22px | 400 | 1.364 | -1.94px |
| Heading 2/Bold | SemiBold | 20px | 600 | 1.400 | -1.20px |
| Heading 2/Medium | Medium | 20px | 500 | 1.400 | -1.20px |
| Heading 2/Regular | Regular | 20px | 400 | 1.400 | -1.20px |

### Headline

| Style | Weight | Size | Weight Value | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| Headline 1/Bold | SemiBold | 18px | 600 | 1.445 | -0.02px |
| Headline 1/Medium | Medium | 18px | 500 | 1.445 | -0.02px |
| Headline 1/Regular | Regular | 18px | 400 | 1.445 | -0.02px |
| Headline 2/Bold | SemiBold | 17px | 600 | 1.412 | 0px |
| Headline 2/Medium | Medium | 17px | 500 | 1.412 | 0px |
| Headline 2/Regular | Regular | 17px | 400 | 1.412 | 0px |

### Body 1 (16px)

| Style | Weight | Size | Weight Value | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| Body 1/Normal-Bold | SemiBold | 16px | 600 | 1.500 | 0.57px |
| Body 1/Normal-Medium | Medium | 16px | 500 | 1.500 | 0.57px |
| Body 1/Normal-Regular | Regular | 16px | 400 | 1.500 | 0.57px |
| Body 1/Reading-Bold | SemiBold | 16px | 600 | 1.625 | 0.57px |
| Body 1/Reading-Medium | Medium | 16px | 500 | 1.625 | 0.57px |
| Body 1/Reading-Regular | Regular | 16px | 400 | 1.625 | 0.57px |

### Body 2 (15px)

| Style | Weight | Size | Weight Value | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| Body 2/Normal-Bold | SemiBold | 15px | 600 | 1.467 | 0.96px |
| Body 2/Normal-Medium | Medium | 15px | 500 | 1.467 | 0.96px |
| Body 2/Normal-Regular | Regular | 15px | 400 | 1.467 | 0.96px |
| Body 2/Reading-Bold | SemiBold | 15px | 600 | 1.600 | 0.96px |
| Body 2/Reading-Medium | Medium | 15px | 500 | 1.600 | 0.96px |
| Body 2/Reading-Regular | Regular | 15px | 400 | 1.600 | 0.96px |

### Label 1 (14px)

| Style | Weight | Size | Weight Value | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| Label 1/Normal-Bold | SemiBold | 14px | 600 | 1.429 | 1.45px |
| Label 1/Normal-Medium | Medium | 14px | 500 | 1.429 | 1.45px |
| Label 1/Normal-Regular | Regular | 14px | 400 | 1.429 | 1.45px |
| Label 1/Reading-Bold | SemiBold | 14px | 600 | 1.571 | 1.45px |
| Label 1/Reading-Medium | Medium | 14px | 500 | 1.571 | 1.45px |
| Label 1/Reading-Regular | Regular | 14px | 400 | 1.571 | 1.45px |

### Label 2 (13px)

| Style | Weight | Size | Weight Value | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| Label 2/Bold | SemiBold | 13px | 600 | 1.385 | 1.94px |
| Label 2/Medium | Medium | 13px | 500 | 1.385 | 1.94px |

### Caption 1 (12px)

| Style | Weight | Size | Weight Value | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| Caption 1/Bold | SemiBold | 12px | 600 | 1.334 | 2.52px |
| Caption 1/Medium | Medium | 12px | 500 | 1.334 | 2.52px |
| Caption 1/Regular | Regular | 12px | 400 | 1.334 | 2.52px |

### Caption 2 (11px)

| Style | Weight | Size | Weight Value | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| Caption 2/Bold | SemiBold | 11px | 600 | 1.273 | 3.11px |
| Caption 2/Medium | Medium | 11px | 500 | 1.273 | 3.11px |
| Caption 2/Regular | Regular | 11px | 400 | 1.273 | 3.11px |

### 요약

| 카테고리 | 레벨 | 사이즈 범위 | 토큰 수 | Weight 참고 |
|---|---|---|---|---|
| Display | 1, 2, 3 | 56 / 40 / 36px | 9 | Bold = 700 |
| Title | 1, 2, 3 | 32 / 28 / 24px | 9 | Bold = 700 |
| Heading | 1, 2 | 22 / 20px | 6 | Bold = SemiBold 600 |
| Headline | 1, 2 | 18 / 17px | 6 | Bold = SemiBold 600 |
| Body | 1, 2 | 16 / 15px | 12 | Normal + Reading |
| Label | 1, 2 | 14 / 13px | 8 | Label 2: Bold+Medium only |
| Caption | 1, 2 | 12 / 11px | 6 | Bold = SemiBold 600 |
| **합계** | | **11px ~ 56px** | **56** | |

---

## 8. Grid (node-id: 15625-57936)

Grid 페이지는 화면 구성, 간격, 레이아웃에 대한 가이드를 제공합니다.

### 8-1. 아트보드 (Artboard)

환경별 기준 해상도입니다.

| 환경 | 기준 해상도 | 비고 |
|---|---|---|
| Web Desktop | 1440 × 960px | 일반적인 브라우저 해상도 기준 |
| Web Mobile | 375 × 635px | iPhone X Safari 표시 영역 기준 |
| iOS | 375 × 812pt | iPhone X (최소: 375 × 667pt) |
| Android | 360 × 800dp | Pixel 8 (최소: 360 × 640dp) |

#### 화면 레이아웃 구조

| 환경 | 전체 너비 | GNB 높이 | Container 너비 | Content Padding | Content 너비 |
|---|---|---|---|---|---|
| Web Desktop | 1440px | 60px | 1100px | 20px × 2 | 1060px |
| Web Mobile | 375px | 56px | 375px | 20px × 2 | 335px |
| iOS | 375pt | 88px (Top Nav) | 375pt | 20px × 2 | 335pt |
| Android | 360dp | 92dp (Top Nav) | 360dp | 20dp × 2 | 320dp |

### 8-2. 브레이크포인트 (Breakpoints)

웹 반응형 디자인 시 너비 범위별 규칙입니다.

| 명칭 | 범위 | 대응 환경 | Artboard 너비 | GNB 높이 | Container 너비 | Container Padding |
|---|---|---|---|---|---|---|
| xs | < 768px | 모바일 | 360px | 56px | 360px | 20px |
| sm | 768px ~ 991px | 태블릿 세로 | 768px | 56px | 768px | 20px |
| md | 992px ~ 1199px | 태블릿 가로 | 992px | 60px | 992px | 20px |
| lg | ≥ 1200px | 데스크톱 | 1200px | 60px | 1100px (centered) | 20px |
| xl | ≥ 1600px | 데스크톱 (대형) | 1600px | 60px | 1440px (centered) | 20px |

### 8-3. 간격 (Spacing)

4배수(4px) 기준으로 간격을 구성합니다.

#### 간격 스케일

| 값 | 4배수 여부 | 권장 상태 |
|---|---|---|
| 0.5px | × | 비권장 (negative) |
| 1px | × | 비권장 (cautionary) |
| 2px | × | 비권장 (cautionary) |
| **4px** | **✓ (기준)** | **기준값 (primary)** |
| 6px | × | 비권장 (cautionary) |
| **8px** | **✓** | **권장 (positive)** |
| 10px | × | 비권장 (cautionary) |
| **12px** | **✓** | **권장 (positive)** |
| 14px | × | 비권장 (cautionary) |
| **16px** | **✓** | **권장 (positive)** |
| **20px** | **✓** | **권장 (positive)** |
| **24px** | **✓** | **권장 (positive)** |
| **32px** | **✓** | **권장 (positive)** |
| **40px** | **✓** | **권장 (positive)** |
| **48px** | **✓** | **권장 (positive)** |
| **56px** | **✓** | **권장 (positive)** |

#### 간격 가이드

| 규칙 | 설명 |
|---|---|
| 기본 | 4px 기준으로 간격을 잡음 |
| 시각 보정 | 2px씩 쪼개 조정, 불가피 시 1px 조정 |
| 비정상 값 | 특정 요소로 비정상 값이 될 때 개발자에게 상황 설명 (예: 56px 내비게이션 + 1px 선) |

### 8-4. 레이아웃 (Layout)

#### 컬럼 그리드 (Column Grid)

간격(Gutter)은 20px, 컬럼 그리드를 사용합니다.

| 환경 | 컬럼 수 | Gutter | Container Max-Width | Container Padding | 컬럼 너비 | 비고 |
|---|---|---|---|---|---|---|
| 모바일 (xs) | 2단 | 20px | - | 20px | ~157.5px | - |
| 태블릿 (sm) | 3단 | 20px | - | 20px | ~229.3px | 컬럼 묶어 사용 가능 |
| 데스크톱 (lg) | 12단 | 20px | 1100px | 20px | 70px | 컬럼 묶어 사용 가능 |
| 데스크톱 (xl) | 12단 | 20px | 1440px | 20px | ~98.3px | 컬럼 묶어 사용 가능 |

#### 최대 너비 (Max Width)

| 환경 | 그리드 최대 너비 (여백 포함) |
|---|---|
| 데스크톱 (lg) | 1100px |
| 데스크톱 (xl) | 1440px |

### 8번 요약

| 카테고리 | 항목 수 | 핵심 값 |
|---|---|---|
| 아트보드 | 4종 | 1440/375/375/360 |
| 브레이크포인트 | 5단계 | xs/sm/md/lg/xl |
| 간격 스케일 | 16값 (권장 13) | 4px 기준, 4배수 권장 |
| 컬럼 그리드 | 4환경 | 2/3/12/12단 |
| 최대 너비 | 2종 | 1100px / 1440px |

---

## 9. Icon (node-id: 16257-145132)

원칙: 단순하며 상징적인 기호를 통해 특정 개념을 빠르게 전달합니다.

### 9-1. 아이콘 타입

| 타입 | 설명 | 사용 가능한 속성 | 기준 크기 |
|---|---|---|---|
| Normal | 대부분의 경우에서 사용 (단색) | 크기, 색, Variant | 24 / 32 / 40px |
| Color | 지정색이 필요한 경우 (로고 등) | 크기, Variant | 24 / 32 / 40px |
| Navigation | 하단 내비게이션에서만 사용 | 크기, 색 | 28px |

### 9-2. Normal 아이콘 목록

| 아이콘 이름 | 설명 | 키워드 |
|---|---|---|
| Icon/Normal/Calendar | 일정과 관련한 기능 표시 | Monthly, 캘린더, 달력 |
| Icon/Normal/Location | 현재 또는 특정 위치 표현 | GPS, Location, Place, 좌표, 위치 |
| Icon/Normal/Pin | 정보를 고정할 때 사용 | 핀, 고정, Pin, Fixed |
| Icon/Normal/Ticket | 티켓 표현 | Ticket, Coupon, 쿠폰 |
| Icon/Normal/Check | 확인 상태 표시 | 체크, 확인 |
| Icon/Normal/Close | 닫기/제거 | 닫기, Close |
| Icon/Normal/Bookmark | 북마크나 저장 표시 | 북마크, Bookmark, Save, 저장, 추가 |
| Icon/Normal/Circle | 원형 (선택 해제 상태) | Oval |
| Icon/Normal/Circle Check | 정상적으로 확인된 상태 | 체크, Check, Checked, Confirm |
| Icon/Normal/Circle Dot | 라디오 버튼 선택 상태 | Radio, 선택 |
| Icon/Normal/Square | 체크박스 해제 상태 | Square |
| Icon/Normal/Square Caret | 셀렉트 박스 | Select, Caret |
| Icon/Normal/Square Check | 체크박스 선택 상태 | Checkbox, Check |
| Icon/Normal/Chevron Right | 오른쪽 화살표/네비게이션 | Arrow, Chevron, 화살표 |

### 9-3. Color 아이콘 목록

| 아이콘 이름 | 설명 | 키워드 |
|---|---|---|
| Icon/Color/Logo Apple | 애플 로고 | 애플, Apple |
| Icon/Color/Logo Facebook | 페이스북 로고 | 페이스북, Facebook, Meta |
| Icon/Color/Logo Google | 구글 로고 | 구글, Google |

### 9-4. Navigation 아이콘 목록

| 아이콘 이름 | 설명 | 키워드 |
|---|---|---|
| Icon/Navigation/Recruit | 채용 탭 | 리크루트, 채용 |
| Icon/Navigation/Career | 커리어 탭 | 커리어, 깃발 |
| Icon/Navigation/Social | 소셜 탭 | 소셜 |
| Icon/Navigation/My Page | 마이페이지 탭 | 마이원티드, 마이페이지 |
| Icon/Navigation/Menu | 메뉴 탭 | 메뉴, Hamburger |

### 9-5. 사용 가이드

#### 선택 컨트롤 아이콘 매칭

| 컨트롤 유형 | 해제 상태 | 선택 상태 |
|---|---|---|
| 라디오 버튼 (단일 선택) | Circle | Circle Dot |
| 체크박스 (다중 선택) | Square | Square Check |
| 셀렉트 박스 | Square Caret | - |

#### Do / Don't

- **Do**: 라디오 버튼과 체크박스 아이콘을 올바른 컨트롤 유형에 맞춰 사용
- **Don't**: 라디오 아이콘(Circle Dot)을 체크박스 용도로, 체크박스 아이콘(Square Check)을 라디오 용도로 혼용 금지

### 9번 요약

| 카테고리 | 항목 수 | 비고 |
|---|---|---|
| Normal 아이콘 | 14종 | 24/32/40px, 단색, Variant 지원 |
| Color 아이콘 | 3종 | 24/32/40px, 고유색 로고 |
| Navigation 아이콘 | 5종 | 28px, 하단 내비게이션 전용 |
| **합계** | **22종** | |

---

## 10. Logo (node-id: 16257-145133)

원칙: 로고는 원티드 브랜드와 해당 제품의 아이덴티티를 나타내는 대표 요소입니다. 로고를 포함한 다양한 애셋은 [원티드 브랜드 센터](https://www.wanted.co.kr/brandcenter/)에서 확인할 수 있습니다.

### 10-1. 로고 레이아웃 타입

| 레이아웃 | 설명 | 용도 |
|---|---|---|
| Horizontal | 심볼 + 로고타입 가로 배치 | 일반적인 로고 표시 |
| Vertical | 심볼 + 로고타입 세로 배치 | 세로 공간 활용 |
| Circle | 원형 배경 안에 심볼 | 앱 아이콘, 프로필 등 |
| Favicon | 심볼만 단독 사용 | 브라우저 파비콘 |

### 10-2. 색상 모드 (Color Mode)

모든 로고는 4가지 색상 모드를 지원합니다.

| 색상 모드 | 설명 |
|---|---|
| Light | 브랜드 고유색 (밝은 배경용) |
| Dark | 브랜드 고유색 (어두운 배경용) |
| White | 흰색 단색 |
| Black | 검은색 단색 |

### 10-3. Horizontal 로고

| 브랜드 | 컴포넌트 이름 | Short 변형 | 색상 모드 | 소계 |
|---|---|---|---|---|
| Wanted | Logo/Horizontal/Wanted | - | Light, Dark, White, Black | 4 |
| Wanted Space | Logo/Horizontal/Wanted Space | Logo/Horizontal/Wanted Space Short | Light, Dark, White, Black | 8 |
| Wanted Gigs | Logo/Horizontal/Wanted Gigs | - | Light, Dark, White, Black | 4 |
| 원티드 채용 솔루션 | Logo/Horizontal/원티드 채용 솔루션 | - | Light, Dark, White, Black | 4 |
| Wanted LaaS | Logo/Horizontal/원티드 LaaS | - | Light, Dark, White, Black | 4 |
| 원티드 통합 로그인 | Logo/Horizontal/원티드 통합 로그인 | - | Light, Dark, White, Black | 4 |
| Wanted OneID | Logo/Horizontal/Wanted OneID | - | Light, Dark, White, Black | 4 |
| Wanted Agent | Logo/Horizontal/Wanted Agent | Logo/Horizontal/Wanted Agent Short | Light, Dark, White, Black | 8 |
| **합계** | | | | **40** |

### 10-4. Vertical 로고

| 브랜드 | 컴포넌트 이름 | 색상 모드 | 소계 |
|---|---|---|---|
| Wanted | Logo/Vertical/Wanted | Light, Dark, White, Black | 4 |
| Wanted Space | Logo/Vertical/Wanted Space | Light, Dark, White, Black | 4 |
| Wanted Gigs | Logo/Vertical/Wanted Gigs | Light, Dark, White, Black | 4 |
| **합계** | | | **12** |

### 10-5. Circle 로고

| 브랜드 | 컴포넌트 이름 | 색상 모드 | 소계 |
|---|---|---|---|
| Wanted Symbol | Logo/Circle/Wanted Symbol | Light, Dark, White, Black | 4 |
| Wanted | Logo/Circle/Wanted | Light, Dark, White, Black | 4 |
| Wanted Space | Logo/Circle/Wanted Space | Light, Dark, White, Black | 4 |
| Wanted Gigs | Logo/Circle/Wanted Gigs | Light, Dark, White, Black | 4 |
| **합계** | | | **16** |

### 10-6. Favicon

| 컴포넌트 이름 | 설명 |
|---|---|
| Logo/Wanted/Favicon | Wanted 심볼 단독 (브라우저 파비콘용) |

### 10번 요약

| 레이아웃 | 브랜드 수 | 변형 포함 | 색상 모드 | 소계 |
|---|---|---|---|---|
| Horizontal | 8 | Short 2종 포함 (10) | × 4 | 40 |
| Vertical | 3 | - | × 4 | 12 |
| Circle | 4 | Symbol 포함 | × 4 | 16 |
| Favicon | 1 | - | 1 | 1 |
| **합계** | | | | **69** |

---

## 11. Basic (node-id: 16248-4248411)

원칙: 기본적인 꾸밈 요소로 사용합니다.

### 11-1. Ratio 컴포넌트

요소를 같은 비율로 유지해야 할 때 사용합니다. Figma에서 지원하는 Aspect Ratio를 쓸 때 값이 뒤틀어지는 문제가 있는 상황에서 대신 쓰기에 적합합니다.

#### Ratio 타입

| 컴포넌트 | 설명 | 기준 축 | 사용 가능한 속성 |
|---|---|---|---|
| Ratio/Horizontal | 가로 크기 기준으로 같은 비율로 표시 | 너비 (Width) | 크기, Variant |
| Ratio/Vertical | 세로 크기 기준으로 같은 비율로 표시 | 높이 (Height) | 크기, Variant |

#### Ratio Variant (Aspect Ratio)

| Variant | 비율 | 적용 방법 |
|---|---|---|
| 1:1 | 정사각형 | 부모를 Auto Layout으로 만들고, 가로 Hug / 세로 Fill |
| 1:2 | 세로 2배 | 부모를 Auto Layout으로 만들고, 가로 Hug / 세로 Fill |

#### 대표 사용 예시

| 사용 위치 | Ratio 타입 | 설명 |
|---|---|---|
| Card/Card → Thumbnail | Ratio/Horizontal | 카드 썸네일 이미지의 비율 유지 |
| Icon 컴포넌트 내부 | Ratio/Vertical | 아이콘 크기 비율 유지 |
| Button/Text → Leading Icon | Ratio/Vertical | 텍스트 버튼 내 아이콘 비율 유지 |

### 11번 요약

| 카테고리 | 항목 수 | 비고 |
|---|---|---|
| Ratio 타입 | 2종 | Horizontal, Vertical |
| Ratio Variant | 2종 | 1:1, 1:2 |
| **합계** | **4종** | |

---

## 12. Spacing (node-id: 16248-4248412)

원칙: 다양한 상황에 따른 여백을 고려해야 할 때 사용합니다.

### 12-1. Status (상단 여백)

모바일 플랫폼 환경에서 상단 여백을 고려해야 할 때 사용합니다.

#### 컴포넌트

| 컴포넌트 | 설명 | 키워드 |
|---|---|---|
| Safe Area/Status | 상단에 Status 여백을 고려해야 할 때 사용 | Status, 여백, 상단 여백 |

#### 사용 가능한 속성

| 속성 | 설명 |
|---|---|
| 너비 | 컴포넌트 너비 조정 |
| Variant | 플랫폼별 변형 (iOS, Android) |
| 하위 Instance | 내부 인스턴스 교체 |
| Padding | 여백 조정 |

#### 플랫폼별 Status 여백

| Platform | 컴포넌트 | Height | 설명 |
|---|---|---|---|
| iOS | Spacing/Status | `44px` | iOS Status Bar 여백 |
| Android | Spacing/Status | `36px` | Android Status Bar 여백 |

#### 대표 예시

| 플랫폼 | 사용 예시 | 설명 |
|---|---|---|
| iOS | Top Navigation + Status Bar (44px) | 상단 내비게이션 바에서 Status Bar 여백 포함 |
| Android | Top Navigation + Status Bar (36px) | 상단 내비게이션 바에서 Status Bar 여백 포함 |

> 컴포넌트에서 다양한 Status Bar 너비를 고려할 때 쓸 수 있습니다.

### 12-2. Bottom (하단 여백)

모바일 플랫폼 환경에서 하단 여백을 고려해야 할 때 사용합니다.

#### 컴포넌트

| 컴포넌트 | 설명 | 키워드 |
|---|---|---|
| Safe Area/Bottom | 하단에 내비게이션 여백을 고려해야 할 때 사용 | Bottom, 여백, 하단 여백 |

#### 사용 가능한 속성

| 속성 | 설명 |
|---|---|
| Variant | 플랫폼별 변형 (iOS, Android) |
| 하위 Instance | 내부 인스턴스 교체 |
| Padding | 여백 조정 |

#### 플랫폼별 Bottom 여백

| Platform | 컴포넌트 | Height | 설명 |
|---|---|---|---|
| iOS | Spacing/Bottom Safe Area | `34px` | iOS Home Bar (Home Indicator) 여백 |
| Android | Spacing/Bottom Safe Area | `14px` | Android Navigation Bar (Home Indicator) 여백 |

#### 대표 예시

| 플랫폼 | 사용 예시 | 설명 |
|---|---|---|
| iOS | Bottom Navigation + Home Bar (34px) | 하단 내비게이션 바에서 Home Bar 여백 포함 |
| Android | Bottom Navigation + Home Bar (14px) | 하단 내비게이션 바에서 Home Bar 여백 포함 |
| iOS | Action Area + Home Bar (34px) | 액션 영역에서 Home Bar 여백 포함 |
| Android | Action Area + Home Bar (14px) | 액션 영역에서 Home Bar 여백 포함 |

> 컴포넌트에서 다양한 Home Bar 너비를 고려할 때 쓸 수 있습니다.
> 컴포넌트에서 여백이 이미 고려되어 있는 경우에는 Padding 값을 조정해 여백을 적절한 수준으로 맞출 수 있습니다.

### 12번 요약

| 카테고리 | 항목 수 | 비고 |
|---|---|---|
| Status (상단) | 2종 | iOS 44px, Android 36px |
| Bottom (하단) | 2종 | iOS 34px, Android 14px |
| **합계** | **4종** | Safe Area 컴포넌트 (Status + Bottom) |

---

## 13. Decorate (node-id: 16248-4248413)

원칙: 정보의 계층 및 상태 변화를 시각적인 위계를 통해 구분합니다.

### 13-1. Gradient

그라디언트가 필요한 다양한 상황에서 사용합니다.

#### Gradient/Solid (단색 그라디언트)

배경 경계를 자연스럽게 표현합니다.

| Property | Value |
|---|---|
| 컴포넌트 | `Gradient/Solid` |
| 용도 | 배경 경계를 자연스럽게 표현 |
| Direction | `Top`, `Right`, `Bottom`, `Left` |
| Color | `var(--background/normal/normal, #FFFFFF)` |
| Size | `64 x 64` (기본) |
| 구현 | `mask-image` + `gradient-mask` |
| Easing | `cubic-bezier(0.25, 0.1, 0.25, 1)` |
| Customize | 크기, 색, Variant |

> 대표 예시: 아직 끝나지 않은 콘텐츠 상태를 매끄럽게 표시할 수 있습니다. (Action Area 위 콘텐츠 fade-out 효과)

#### Gradient/Multiple (다색 그라디언트)

두 가지 색을 가진 그라디언트를 표현합니다.

| Property | Value |
|---|---|
| 컴포넌트 | `Gradient/Multiple` |
| 용도 | 두 가지 색을 그라디언트로 연결 |
| Direction | `Top`, `Right`, `Bottom`, `Left` |
| Background | `var(--label/strong, #000000)` |
| Foreground | `var(--background/normal/normal, #FFFFFF)` |
| Size | `64 x 64` (기본) |
| 구현 | `background-color` + `mask-image` + `gradient-mask` |
| Easing | `cubic-bezier(0.25, 0.1, 0.25, 1)` |
| Customize | 크기, 색, Variant |

> 대표 예시: 두 가지 색을 혼합해 창의적인 색을 만들 수 있습니다. (카드 배경 그라디언트 효과)

#### Gradient/Mask (마스크 그라디언트)

그라디언트를 마스크 요소로 활용합니다. 기존 콘텐츠가 자연스럽게 사라지는 효과를 낼 수 있습니다.

| Property | Value |
|---|---|
| 컴포넌트 | `Gradient/Mask` |
| 용도 | 요소에 마스크를 씌워 경계를 매끄럽게 표현 |
| 사용법 | Use as Mask로 씌워 사용 |
| Customize | 크기, 하위 Instance |

##### Mask 사이즈 변형

| Size Variant | Dimensions |
|---|---|
| XSmall | `24 x 24` |
| Small | `32 x 32` |
| Medium | `40 x 40` |
| Large | `64 x 64` |
| XLarge | `56 x 56` |

##### Gradient Stops (Eased)

```css
linear-gradient(
  180deg,
  rgba(0,0,0,0) 0%,
  rgba(0,0,0,0.021) 4.7%,
  rgba(0,0,0,0.044) 8.9%,
  rgba(0,0,0,0.07) 12.8%,
  rgba(0,0,0,0.101) 16.6%,
  rgba(0,0,0,0.137) 20.4%,
  rgba(0,0,0,0.179) 24.4%,
  rgba(0,0,0,0.229) 28.8%,
  rgba(0,0,0,0.286) 33.8%,
  rgba(0,0,0,0.353) 39.6%,
  rgba(0,0,0,0.43) 46.3%,
  rgba(0,0,0,0.518) 54.1%,
  rgba(0,0,0,0.618) 63.2%,
  rgba(0,0,0,0.731) 73.8%,
  rgba(0,0,0,0.858) 86%,
  rgba(0,0,0,1) 100%
)
```

> 대표 예시: 배경에 영향을 받지 않고 요소의 경계를 매끄럽게 표시할 수 있습니다. (Top Navigation 위 Thumbnail 이미지의 fade 효과)

### 13-2. Interaction (인터랙션 오버레이)

인터랙션이 있는 요소에서 상태에 따른 변화를 표시할 때 사용합니다.

#### 사용 가능한 속성

| 속성 | 설명 |
|---|---|
| 크기 | 오버레이 크기 조정 |
| 색 | 오버레이 색상 변경 |
| Variant | Normal, Light, Strong |

#### Interaction/Normal (가중치 1x)

| State | Opacity | CSS Variable |
|---|---|---|
| Normal | `0` | - |
| Hovered | `0.05` | `var(--opacity/5)` |
| Focused | `0.08` | `var(--opacity/8)` |
| Pressed | `0.12` | `var(--opacity/12)` |

> Color: `var(--label/normal, #171719)`

#### Interaction/Light (가중치 0.75x)

| State | Opacity | 비고 |
|---|---|---|
| Normal | `0` | - |
| Hovered | `0.0375` | Normal × 0.75 |
| Focused | `0.06` | Normal × 0.75 |
| Pressed | `0.09` | Normal × 0.75 |

> Color: `var(--label/normal, #171719)`, 개발 코멘트: Normal 값에서 가중치 ×0.75를 셈합니다.

#### Interaction/Strong (가중치 1.5x)

| State | Opacity | 비고 |
|---|---|---|
| Normal | `0` | - |
| Hovered | `0.075` | Normal × 1.5 |
| Focused | `0.12` | Normal × 1.5 |
| Pressed | `0.18` | Normal × 1.5 |

> Color: `var(--label/normal, #171719)`, 개발 코멘트: Normal 값에서 가중치 ×1.5를 셈합니다.

#### 컴포넌트별 Interaction 매핑

| 컴포넌트 | Interaction Level |
|---|---|
| Primary Button | `Interaction/Strong` (×1.5) |
| Icon Button, Chip, List Cell, Tab | `Interaction/Light` (×0.75) |
| Checkbox, Text Button, Outlined Button | `Interaction/Normal` (×1) 또는 `Interaction/Light` (×0.75) |

#### 사용 가이드 (Do / Don't)

**이렇게 써요 (Do):**

| 규칙 | 설명 |
|---|---|
| Absolute 배치 | 부모 Frame에서 Absolute로 사용 |
| Layer 순서 | Layer는 가장 앞에 있도록 배치 |
| Constraint | Absolute로 할 때 Constraint는 Scale로 설정 |
| Border Radius | Clip Content가 불가능하다면 부모와 Border Radius를 맞춤 |
| Frame 잠금 | 상태 변화가 있어도 잠김 상태를 유지할 수 있도록 프레임으로 감싸주고 해당 프레임을 잠궈줌 |

**이렇게 쓰지 않아요 (Don't):**
- 위 "이렇게 써요"의 항목을 준수하지 않으면 안 됩니다.
- Interaction 요소가 부모 범위를 넘어가거나, 부모보다 작게 설정하면 안 됩니다.

### 13번 요약

| 카테고리 | 항목 수 | 비고 |
|---|---|---|
| Gradient/Solid | 4종 | Direction: Top/Right/Bottom/Left |
| Gradient/Multiple | 4종 | Direction: Top/Right/Bottom/Left |
| Gradient/Mask | 5종 | Size: XSmall ~ XLarge |
| Interaction/Normal | 4상태 | 가중치 ×1 |
| Interaction/Light | 4상태 | 가중치 ×0.75 |
| Interaction/Strong | 4상태 | 가중치 ×1.5 |
| **합계** | **Gradient 13종 + Interaction 3종 (×4상태)** | |

---

## 14. Guidelines (node-id: 16355-159654)

이 페이지는 Montage 디자인 시스템 문서 사이트([montage.wanted.co.kr](https://montage.wanted.co.kr))의 랜딩 페이지 레이아웃을 보여줍니다.

### 14-1. 페이지 레이아웃 구조

| 영역 | 설명 | 크기 |
|---|---|---|
| Title Bar | Safari 브라우저 크롬 (macOS) | `1680 x 52` |
| Navigation | 상단 내비게이션 바 | `1680 x 62` |
| Hero | 히어로 섹션 (타이틀 + 설명 + CTA) | `1060 x 296` |
| Trailer Image | 제품 스크린샷 이미지 그리드 | `1600 x 300` |

> 전체 뷰포트: `1680 x 966`

### 14-2. 내비게이션 (Navigation)

| Property | Value |
|---|---|
| 배경 | `var(--background/normal/normal, #FFFFFF)` @ `var(--opacity/88, 0.88)` |
| Blur | `backdrop-blur: 32px` |
| Padding | `12px` (vertical) |
| 로고 | Logo/Wanted/Logo Horizontal (가로형 원티드 로고) |

#### 메뉴 항목

| 메뉴 | 상태 | 색상 | 링크 |
|---|---|---|---|
| Getting Started | 비활성 | `var(--label/assistive, rgba(55,56,60,0.28))` | - |
| Foundations | 비활성 | `var(--label/assistive, rgba(55,56,60,0.28))` | - |
| Components | **활성** | `var(--label/normal, #171719)` | - |
| Utilities | 비활성 | `var(--label/assistive, rgba(55,56,60,0.28))` | - |

> 메뉴 폰트: Body 2/Normal - Bold (Pretendard JP SemiBold 15px, letter-spacing: 0.96px)

#### 액션 아이콘

| 아이콘 | 용도 |
|---|---|
| Icon/Normal/Search | 검색 |
| Icon/Normal/Sun | 테마 전환 (Light/Dark) |

### 14-3. 히어로 섹션 (Hero)

#### 타이틀 타이포그래피

| Property | Value |
|---|---|
| 폰트 | **Wanted Sans** (브랜드 전용 폰트) |
| Weight | Medium |
| Size | `72px` |
| Line Height | `1` (line-height: none) |
| Letter Spacing | `-1.5768px` |
| Font Feature | `'cv03' 1` |
| Color | `var(--label/normal, #171719)` |
| 정렬 | Center |
| 텍스트 | "From Separate Core Blocks / To a Seamless Flow" |

> **Wanted Sans**는 히어로 타이틀 전용 브랜드 폰트입니다. 본문/UI에서는 Pretendard JP를 사용합니다.

#### 설명 타이포그래피

| Property | Value |
|---|---|
| 폰트 | Pretendard JP |
| Weight | Regular (400) |
| Size | `15px` |
| Line Height | `1.6` |
| Letter Spacing | `0.144px` |
| Color | `var(--label/normal, #171719)` |
| 정렬 | Center |
| 너비 | `888px` |
| 텍스트 | "원티드가 꿈꿔온 세상은, 모든 일하는 사람이 더 나답게 일할 수 있는 세상입니다. 그 꿈에 한 걸음 더 다가가기 위해, 우리는 디자인 시스템을 만들었습니다." |

#### CTA 버튼

| Property | Value |
|---|---|
| 배경 | `var(--fill/normal, rgba(112,115,124,0.08))` |
| Height | `44px` |
| Padding | `20px` (horizontal) |
| Border Radius | `99px` (pill) |
| 폰트 | Label 1/Normal - Medium (14px, Medium 500) |
| Color | `var(--label/normal, #171719)` |
| 텍스트 | "Getting Started" |
| 링크 | `https://montage.wanted.co.kr/docs/getting-started` |

### 14-4. 트레일러 이미지 (Trailer Image)

| Property | Value |
|---|---|
| 컨테이너 너비 | `1600px` |
| 이미지 그리드 너비 | `1786px` (양쪽 overflow) |
| 타일 크기 | `144 x 144` (기본), 일부 `223 x 144` / `224 x 144` (와이드) |
| 행 | 2행 |
| 열 간격 | `~20.36px` |
| 행 간격 | `12px` |
| 총 이미지 | 21개 |
| 좌우 페이드 | Gradient/Mask (320px 너비) 좌우 적용 |
| Shadow | `0px 4.124px 4.124px rgba(0,0,0,0.25)` |

### 14-5. Title Bar (Safari macOS)

| Property | Value |
|---|---|
| Blur | `backdrop-blur: 16px` |
| 배경 | `var(--macos/backgrounds/primary, white)` |
| URL | `montage.wanted.co.kr` |
| Window Controls | Close (`#FF5F57`), Minimize (`#FEBC2E`), Zoom (`#28C840`) |
| 폰트 | SF SD Text Regular 13px |

### 14번 요약

| 카테고리 | 항목 수 | 비고 |
|---|---|---|
| 레이아웃 구조 | 4영역 | Title Bar, Navigation, Hero, Trailer |
| 내비게이션 메뉴 | 4항목 | Getting Started, Foundations, Components, Utilities |
| 히어로 타이포그래피 | 2종 | Wanted Sans 72px (타이틀), Pretendard JP 15px (설명) |
| CTA 버튼 | 1종 | Pill shape, fill/normal 배경 |
| 트레일러 이미지 | 21개 | 144px 타일, 2행 그리드, 좌우 Gradient Mask |
| **특이사항** | | **Wanted Sans** 브랜드 전용 폰트 (fontFeatureSettings: 'cv03' 1) |

---

## 15. Work (node-id: 15851-41248)

이 페이지는 원티드 채용(Recruit) 메인 화면의 실제 레이아웃을 5가지 디바이스 환경에서 보여줍니다. 디자인 시스템 컴포넌트들이 실제 제품에서 어떻게 조합되는지 보여주는 Work 레퍼런스입니다.

### 15-1. 디바이스 목업 (Device Mockups)

| 디바이스 | Frame 이름 | Viewport 크기 | Node ID |
|---|---|---|---|
| Web Desktop (xl) | Main-Web Desktop(xl) | `1600 × 960` | `16267:352522` |
| Web Desktop (lg) | Main-Web Desktop(lg) | `1200 × 960` | `16598:151289` |
| Web Mobile | Main-Web Mobile | `375 × 812` | `16304:132934` |
| iOS | Main-iOS | `375 × 812` | `16270:18307` |
| Android | Main-Android | `360 × 800` | `16270:18486` |

### 15-2. 레이아웃 구조

#### Web Desktop (xl) — 1600px

| 영역 | 크기 | 컴포넌트 |
|---|---|---|
| GNB | `1600 × 60` | `GNB/Wanted` |
| Container | `1440px` (centered) | margin 80px 양쪽 |
| Content Padding | `20px` 양쪽 | → 콘텐츠 영역 1400px |
| Top Gap | `36px` | GNB → 첫 번째 섹션 |
| Content | `1440 × 2471.72` | 7개 섹션 |
| Footer | `1600 × 313` | `Footer/Footer` |

#### Web Mobile — 375px

| 영역 | 크기 | 컴포넌트 |
|---|---|---|
| Safari Navigation Bar | `375 × 44` | `Safari/Bar/Navigation Bar` |
| GNB | `375 × 56` | `GNB/Wanted` |
| Content Padding | `20px` 양쪽 | → 콘텐츠 영역 335px |
| Content | `375 × 1912.67` | 7개 섹션 |
| Bottom Navigation | `375 × 58` | `Bottom Navigation/Bottom Navigation` |
| Safari Bottom Bar | `375 × 86` | `Safari/Bar/Bar` |

#### iOS — 375pt

| 영역 | 크기 | 컴포넌트 |
|---|---|---|
| Top Navigation | `375 × 88` | `Top Navigation/Top Navigation` (Status 44px 포함) |
| Content Padding | `20px` 양쪽 | → 콘텐츠 영역 335pt |
| Content | `375 × 1912.67` | 7개 섹션 |
| Bottom Navigation | `375 × 85` | `Bottom Navigation/Bottom Navigation` (Home 34px 포함) |

#### Android — 360dp

| 영역 | 크기 | 컴포넌트 |
|---|---|---|
| Top Navigation | `360 × 92` | `Top Navigation/Top Navigation` (Status 36px 포함) |
| Content Padding | `20px` 양쪽 | → 콘텐츠 영역 320dp |
| Content | `360 × 1912.67` | 7개 섹션 |
| Bottom Navigation | `360 × 78` | `Bottom Navigation/Bottom Navigation` (Home 14px 포함) |

### 15-3. Section 1: Shortcut (바로가기)

홈 화면 상단의 서비스 바로가기 아이콘 영역입니다.

#### Shortcut 아이콘 목록

| # | 아이콘 | 컴포넌트 | Desktop (xl) | Mobile |
|---|---|---|---|---|
| 1 | 채용 공고 | `Icon/Shortcut/채용공고` | O | O |
| 2 | 이력서 코칭 | `agent depth 2` | O | O |
| 3 | 이력서 관리 | `Icon/Shortcut/이력서 관리` | O | O |
| 4 | 커리어 조회 | `Icon/Shortcut/커리어 조회` | O | O |
| 5 | 지원 현황 | `Icon/Shortcut/지원 현황` | O | - |
| 6 | 면접 제안 | `Shortcut/20_면접 제안` | O | - |
| 7 | 면접 코칭받기 | `Icon/Shortcut/면접 코칭받기` | O | - |
| 8 | 북마크 | `Shortcut/17_북마크` | O | - |
| 9 | 직군별 연봉 | `Icon/Shortcut/직군별 연봉` | O | - |
| 10 | 원티드 추천 기업 | `Shortcut/15_원티드 추천 기업` | O | - |

#### Shortcut 레이아웃 토큰

| Property | Desktop (xl) | Mobile (Web/iOS/Android) |
|---|---|---|
| 아이콘 수 | 10개 | 4개 |
| Item 너비 | `117.778px` | `84~87.75px` |
| 아이콘 크기 | `48~56px` | `48px` |
| 아이콘-라벨 Gap | `10px` | `10px` (추정) |
| Padding Top | `24px` | `20px` |
| Padding Bottom | `12px` | - |

#### Shortcut 라벨 타이포그래피

| Property | Value |
|---|---|
| Style | Label 2/Medium |
| Font | Pretendard JP Medium (500) |
| Size | `13px` |
| Line Height | `1.385` |
| Letter Spacing | `0.2522px` |
| Color | `var(--label/alternative, rgba(55,56,60,0.61))` |
| 정렬 | Center |

#### Push Badge (면접 제안)

| Property | Value |
|---|---|
| Background | `var(--primary/normal, #0066FF)` |
| Border | `1.2px solid var(--background/normal/normal, white)` |
| Border Radius | `99px` |
| 폰트 | Caption 2/Bold (11px, SemiBold 600) |
| Letter Spacing | `0.3421px` |
| Text Color | `var(--background/normal/normal, white)` |

### 15-4. Section Header (공통 패턴)

모든 콘텐츠 섹션에 사용되는 공통 헤더입니다.

#### Section Header 타이포그래피

| Property | Value |
|---|---|
| Title Style | Heading 1/Bold |
| Title Font | Pretendard JP SemiBold (600) |
| Title Size | `22px` |
| Title Line Height | `1.364` |
| Title Letter Spacing | `-0.4268px` |
| Title Color | `var(--label/strong, black)` |
| Section Padding | `20px` (horizontal) |
| Header-Content Gap | `20px` (Section 내부 gap) |

#### Trailing Content 변형

| Trailing 타입 | 사용 섹션 | 스타일 |
|---|---|---|
| Text Button | "합격 가능성 높은 포지션" 등 | Label 1/Normal-Bold (14px SemiBold), `var(--label/alternative)` |
| Pagination Button | "지금 주목할 소식", "테마로 살펴보는 회사/포지션" | 좌우 Chevron, border 1px `var(--line/normal/neutral)`, radius `10px` |

#### Pagination Button 토큰

| Property | Value |
|---|---|
| Border | `1px solid var(--line/normal/neutral, rgba(112,115,124,0.16))` |
| Border Radius | `10px` |
| Button Padding | `7px` |
| Icon | Chevron Left / Chevron Right (`24px`) |
| Interaction | `Interaction/Light` (×0.75) |

### 15-5. Section 2: Job Card Grid ("합격 가능성 높은 포지션")

#### Card/Card 토큰

| Property | Value |
|---|---|
| 레이아웃 | flex column, gap `8px` |
| Thumbnail Radius | `12px` |
| Thumbnail Overlay | Gradient mask + Caption |
| Caption Style | Label 2/Bold (13px SemiBold, letter-spacing: `0.2522px`) |
| Caption Color | `var(--static/white, white)` |
| Caption Text Shadow | `0px 0px 12px rgba(0,0,0,0.16)` |
| Save Icon | Bookmark (`24px`), `Interaction/Normal` (×1) |

#### Card Content 타이포그래피

| 요소 | Style | Weight | Size | Line Height | Letter Spacing | Color |
|---|---|---|---|---|---|---|
| 포지션 제목 | Body 1/Normal-Bold | SemiBold (600) | `16px` | `1.5` | `0.0912px` | `var(--label/normal, #171719)` |
| 회사명 | Label 1/Normal-Bold | SemiBold (600) | `14px` | `1.429` | `0.203px` | `var(--label/alternative)` |
| 보상금 캡션 | Label 2/Bold | SemiBold (600) | `13px` | `1.385` | `0.2522px` | `var(--static/white, white)` |

#### 반응형 레이아웃

| Property | Desktop (xl) | Mobile |
|---|---|---|
| 카드 수 | 5개 | 5개 (horizontal scroll) |
| 카드 너비 | `264px` | `152px` |
| 카드 Gap | `20px` | `20px` |
| 스크롤 | 없음 | 가로 스크롤 |

### 15-6. Section 3: Banner Card ("지금 주목할 소식")

Thumbnail 위에 텍스트 오버레이가 있는 프로모션 배너 카드입니다.

#### Banner Card 토큰

| Property | Value |
|---|---|
| Border Radius | `12px` |
| Border | `1px solid var(--line/normal/alternative, rgba(112,115,124,0.08))` |
| Gradient | `Gradient/Solid` (bottom → up, `64px` height) |
| Content Padding | `24px` |
| Content Gap | `6px` (title ↔ subtitle) |

#### Banner Card 타이포그래피

| 요소 | Style | Size | Letter Spacing | Color |
|---|---|---|---|---|
| 제목 | Heading 1/Bold | `22px` | `-0.4268px` | `var(--static/white, white)` |
| 부제 | Body 2/Normal-Medium | `15px` | `0.144px` | `var(--static/white, white)` |

> Text Shadow: `0px 0px 1px rgba(0,0,0,0.08), 0px 0px 1px rgba(0,0,0,0.08), 0px 1px 2px rgba(0,0,0,0.12)`

#### 반응형 레이아웃

| Property | Desktop (xl) | Mobile |
|---|---|---|
| 카드 수 | 3개 | 3개 (horizontal scroll) |
| 카드 너비 | 3등분 (`~453.33px`) | `320px` |
| 카드 Gap | `20px` | `20px` |
| 스크롤 | 없음 | 가로 스크롤 |

### 15-7. Section 4: Theme Card ("테마로 살펴보는 회사/포지션")

Thumbnail + 텍스트 콘텐츠 영역으로 구성된 테마 카드입니다.

#### Theme Card 토큰

| Property | Value |
|---|---|
| Border | `1px solid var(--line/normal/neutral, rgba(112,115,124,0.16))` |
| Border Radius | `12px` |
| Content Padding | `20px` |
| Content Gap | `4px` (title ↔ description) |

#### Theme Card 타이포그래피

| 요소 | Style | Size | Line Height | Letter Spacing | Color |
|---|---|---|---|---|---|
| 제목 | Headline 2/Bold | `17px` | `1.412` | `0` | `var(--label/normal, #171719)` |
| 설명 | Label 2/Medium | `13px` | `1.385` | `0.2522px` | `var(--label/alternative, rgba(55,56,60,0.61))` |

#### 반응형 레이아웃

| Property | Desktop (xl) | Mobile |
|---|---|---|
| 카드 수 | 4개 | 4개 (horizontal scroll) |
| 카드 너비 | 4등분 (`335px`) | `220px` |
| 카드 Gap | `20px` | `20px` |
| 스크롤 | 없음 | 가로 스크롤 |

### 15-8. Section 5, 7: Job Card Grid (추가 포지션 추천)

Section 2와 동일한 Card/Card 컴포넌트를 사용하는 포지션 추천 섹션입니다.

| Property | Desktop (xl) | Mobile |
|---|---|---|
| 카드 수 | 5개 | 5개 (horizontal scroll) |
| 카드 너비 | `264px` | `152px` |
| 카드 Gap | `20px` | `20px` |

### 15-9. Section 6: List Card Grid

Card/List Card 컴포넌트를 사용하는 리스트형 카드 섹션입니다.

#### 반응형 레이아웃

| Property | Desktop (xl) | Mobile |
|---|---|---|
| 레이아웃 | 3열 × 3행 그리드 | 가로 스크롤 × 3행 |
| 카드 크기 | `~453.33 × 80px` | `315 × 66px` |
| 열 Gap | `20px` | `20px` |
| 행 Gap | `20px` | `20px` |
| 스크롤 | 없음 | 가로 스크롤 |

### 15-10. 공통 패턴 요약

#### 섹션 간격 (Section Spacing)

| 위치 | Desktop (xl) 기준 |
|---|---|
| GNB → 첫 섹션 | `36px` |
| Shortcut → Section 2 | `64px` 간격 |
| Section 간 | `64px` 간격 (추정) |
| 마지막 섹션 → Footer | 자동 |

#### 카드 공통 토큰

| Property | Card/Card | Banner Card | Theme Card | List Card |
|---|---|---|---|---|
| Border Radius | `12px` (thumbnail) | `12px` | `12px` | - |
| Border | - | `1px line/alt` | `1px line/neutral` | - |
| Gap (content) | `8px` | `6px` | `4px` | - |
| Desktop 열 수 | 5 | 3 | 4 | 3 |
| Mobile 스크롤 | O | O | O | O |
| 공통 Gap | `20px` | `20px` | `20px` | `20px` |

#### 사용된 컴포넌트 인스턴스

| 컴포넌트 | 사용 위치 | 설명 |
|---|---|---|
| `GNB/Wanted` | 최상단 | 글로벌 내비게이션 바 |
| `Top Navigation/Top Navigation` | iOS, Android | 플랫폼 네이티브 내비게이션 |
| `Bottom Navigation/Bottom Navigation` | Mobile/iOS/Android | 하단 탭 내비게이션 |
| `Safari/Bar/Navigation Bar` | Web Mobile 상단 | Safari 상단 바 |
| `Safari/Bar/Bar` | Web Mobile 하단 | Safari 하단 바 |
| `Essential/Essential` | iOS, Android | 디바이스 프레임 (상태바 등) |
| `Section Header/Section Header` | 각 섹션 상단 | 섹션 제목 + trailing action |
| `Card/Card` | Section 2, 5, 7 | 채용 포지션 카드 |
| `Card/List Card` | Section 6 | 리스트형 카드 |
| `Thumbnail/Thumbnail` | Banner/Theme Card | 이미지 썸네일 |
| `Gradient/Solid` | Banner Card overlay | 하단 그라디언트 페이드 |
| `Interaction/Light` | Pagination Button | 인터랙션 오버레이 (×0.75) |
| `Footer/Footer` | 최하단 | 글로벌 푸터 |

### 15번 요약

| 카테고리 | 항목 수 | 비고 |
|---|---|---|
| 디바이스 목업 | 5종 | xl/lg/mobile/iOS/Android |
| 콘텐츠 섹션 | 7종 | Shortcut + 6개 콘텐츠 |
| Shortcut 아이콘 | 10종 (Desktop), 4종 (Mobile) | 서비스 바로가기 |
| 카드 유형 | 4종 | Card, Banner, Theme, List Card |
| 컴포넌트 인스턴스 | 13종 | GNB, Navigation, Card 등 |
| **핵심 토큰** | | 카드 radius `12px`, gap `20px`, padding `20px` |
