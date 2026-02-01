---
name: overtime-project
description: overtime-management 코드 수정, 버그 수정, 기능 구현 작업 시 사용. Supabase 백엔드, MCP 로컬 코드 수정, 디버깅 우선 원칙, Git/DB 롤백 준비 등 작업 흐름 안내. 서비스 기획이나 일반 논의에는 적용하지 않음.
metadata:
  version: 1.3.0
---

# Overtime Management Project Skill v1.3.0

## 프로젝트 개요

- **프로젝트명**: overtime-management
- **로컬 위치**: `/Users/user/Desktop/overtime-app` (절대 경로, 항상 확인)
- **서버**: Supabase
- **배포**: GitHub Pages (https://phk910805.github.io/overtime)

### Git 정보
- **Repository**: `git@github.com:phk910805/overtime.git`
- **Branch**: `main`
- **Remote**: `origin`

---

## 🔧 MCP 작업 환경 (중요!)

**AI는 MCP를 통해 로컬 파일을 직접 읽고 쓸 수 있습니다.**

### AI가 할 수 있는 것:
- ✅ `/Users/user/Desktop/overtime-app` 아래 모든 파일 읽기
- ✅ 파일 생성, 수정, 삭제
- ✅ 디렉토리 구조 확인
- ✅ 파일 내용 검색

### AI가 할 수 없는 것 (사용자 요청):
- ❌ Git 명령어 실행 (commit, push, pull 등)
- ❌ npm/yarn 명령어 실행
- ❌ 브라우저 실행 또는 테스트
- ❌ Supabase Dashboard 접근 (SQL Editor 포함)

### 작업 방식:
```
1. 파일 수정 필요 시 → AI가 직접 MCP로 파일 수정
2. Git 작업 필요 시 → 사용자에게 터미널 명령어 제공 (&&로 연결)
3. Supabase SQL 필요 시 → 사용자에게 SQL 쿼리 제공
4. 테스트 필요 시 → 사용자에게 테스트 요청
```

**AI는 "파일을 수정해주세요"라고 사용자에게 요청하지 않습니다.**
**AI는 항상 MCP를 통해 직접 파일을 수정합니다.**

---

## 작업 흐름

### 1단계: 기본 확인 (필수)

```
□ .env.local 환경변수 확인 (AI가 직접 읽기)
□ Supabase 연결 상태 확인
□ 기존 기능 정상 작동 테스트 (사용자에게 확인 요청)
□ 에러 메시지 정확히 분석 (3번 읽기)
```

### 2단계: 디버깅으로 원인 파악 (AI-사람 협업)

코드 수정 전 반드시 디버깅으로 검증한다.

**AI 역할:**
- 디버깅 방법 제시 (SQL 쿼리, console.log 코드, 확인할 API 등)
- 관련 파일 직접 읽어서 분석
- 결과 분석 및 원인 파악
- 수정 방향 제안

**사람 역할:**
- Supabase SQL Editor에서 쿼리 실행 후 결과 공유
- 브라우저 Console에서 로그 확인 후 결과 공유
- Network 탭에서 API 응답 확인 후 결과 공유

→ 원인 파악 후에만 수정 방향 결정

### 3단계: 백업

**Git 백업 (사용자 실행):**
```bash
cd /Users/user/Desktop/overtime-app && git add . && git commit -m "backup before [작업내용]"
```

**Supabase 백업 (사용자 실행):**
```
□ 영향받는 데이터 SELECT 결과 복사해두기
□ 스키마 변경 시 기존 DDL 저장
□ AI가 롤백 SQL도 함께 제공
```

### 4단계: 코드 수정

**AI가 MCP로 직접 수정:**
- AI는 `/Users/user/Desktop/overtime-app` 경로로 파일에 접근
- 파일 읽기 → 분석 → 수정 → 저장
- 수정 후 변경 내용 설명

**수정 원칙:**
- **우선 새 코드 추가로 구현 시도**
- 기존 코드 수정이 불가피한 경우에만 최소 범위로 수정
- 기존 기능 보호: 사이드 이펙트 없이 수정
- 한 번에 하나씩 step-by-step 진행
- 각 단계마다 기존 기능 테스트 (사용자에게 확인 요청)
- 수정 완료 후 사용자에게 테스트 요청

### 5단계: 검증

```
□ 기존 기능 정상 작동 확인 (사용자 테스트)
□ 새 기능 정상 작동 확인 (사용자 테스트)
□ "기존 기능 정상 작동 확인됨" 후에만 다음 단계
□ 문제 발견 시 즉시 롤백
```

---

## Git 관리 (사용자 요청 시)

### 커밋 및 푸시
사용자가 명시적으로 요청할 때만 제공:
```bash
cd /Users/user/Desktop/overtime-app && git add . && git commit -m "[변경 내용 설명]" && git push origin main
```

**사용 시점:**
- 여러 수정 작업이 완료되어 누적된 후
- 사용자가 "커밋해줘", "푸시 명령어 줘" 등 명시적으로 요청할 때
- 마일스톤 단위 작업 완료 후

---

## 롤백 방법

### Git 롤백 (사용자 실행)
```bash
cd /Users/user/Desktop/overtime-app && git reset --hard HEAD~1
# 이미 push한 경우
cd /Users/user/Desktop/overtime-app && git reset --hard HEAD~1 && git push origin main --force
```

### Supabase 롤백 (사용자 실행, AI가 SQL 제공)
```sql
-- 컬럼 추가 롤백
ALTER TABLE [table] DROP COLUMN [column];

-- 테이블 생성 롤백
DROP TABLE IF EXISTS [table];

-- RLS 정책 롤백
DROP POLICY IF EXISTS [policy_name] ON [table];

-- 데이터 복원
INSERT INTO ... 또는 UPDATE ...
```

---

## DB 스키마 요약

### 주요 테이블

| 테이블 | 설명 |
|--------|------|
| employees | 직원 정보 |
| overtime_records | 초과근무 기록 |
| vacation_records | 휴가 기록 |
| employee_changes | 직원 변경 이력 (이름 보존용) |
| settings | 설정 (multiplier 등) |
| settings_history | 설정 변경 이력 |
| profiles | 사용자 프로필 |

---

## 자주 사용하는 명령어 (사용자 실행)

### 개발
```bash
cd /Users/user/Desktop/overtime-app
npm start  # 개발 서버 실행
npm run build  # 빌드
```

### Git
```bash
cd /Users/user/Desktop/overtime-app
git status  # 상태 확인
git add .  # 모든 변경사항 스테이징
git commit -m "메시지"  # 커밋
git push origin main  # 푸시
git pull origin main  # 풀
```

---

## 이전 작업에서 배운 주의사항

1. **직원 삭제 시**: employee_changes 테이블에 이름 보존 필요
2. **월별 스냅샷**: 마감 시점 설정값(multiplier) 저장해야 과거 기록 정확
3. **Supabase 무료 플랜**: 7일 미사용 시 일시정지 → keepalive 워크플로우 필수
4. **환경변수**: local/production 다를 수 있음 주의
5. **GitHub vs Local**: 항상 어느 쪽이 최신인지 확인

---

## 핵심 원칙

1. **기본부터 확인** (환경설정 → 연결 → 코드)
2. **디버깅 먼저** (코드 수정 전 원인 파악)
3. **MCP로 직접 수정** (사용자에게 파일 수정 요청 금지)
4. **새 코드 추가 우선** (기존 코드 수정은 최소화)
5. **기존 기능 보호** (사이드 이펙트 없이 수정)
6. **터미널/SQL은 사용자 실행** (AI는 명령어만 제공, &&로 연결)
7. **Git 커밋/푸시는 사용자 요청 시** (작업마다 자동 제공 금지)
8. **즉시 롤백 준비** (Git + Supabase 모두)
9. **원칙 위반 시 작업 즉시 중단하고 원상 복구**

---

## 변경 이력

### v1.3.0 (2025-02-01)
- 작업 흐름에서 "6단계: Git 커밋 및 푸시" 제거
- "Git 관리 (사용자 요청 시)" 별도 섹션 추가
- Git 커밋/푸시는 사용자가 명시적으로 요청할 때만 제공하도록 변경
- 핵심 원칙에 "Git 커밋/푸시는 사용자 요청 시" 추가

### v1.2.0 (2025-01-15)
- Supabase SQL 실행 주체 명확화 (사용자 실행, AI는 SQL만 제공)
- 터미널 명령어 `&&`로 연결하여 한 번에 실행 가능하도록 개선
- Git 백업, 커밋/푸시, 롤백 명령어 통합
- Documents 백업 폴더 제거 완료 기록

### v1.1.0 (2025-01-15)
- MCP 작업 방식 명확화 (AI가 직접 파일 수정)
- Git 정보 추가 (Repository, Branch)
- 로컬 경로 수정 (`/Users/user/Desktop/overtime-app`)
- 터미널 명령 실행 주체 명확화 (사용자 실행, AI는 제공)
- 6단계 추가 (Git 커밋 및 푸시)

### v1.0.0 (초기 버전)
- 기본 작업 흐름 정의
