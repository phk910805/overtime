# Overtime Management Project Skill

## 프로젝트 개요

- **프로젝트명**: overtime-management
- **로컬 위치**: /Users/user/Desktop/overtime-app
- **서버**: Supabase
- **배포**: GitHub Pages (https://phk910805.github.io/overtime)
- **MCP 연결**: 로컬 코드 직접 읽기/쓰기 가능

## 작업 환경

- MCP를 통해 로컬 파일 직접 수정 가능
- 로컬에서 수정 → 검토 → GitHub 푸시 순서로 작업
- 터미널 명령어 실행 가능 (git, npm 등)

---

## 작업 흐름

### 1단계: 기본 확인 (필수)

```
□ .env.local 환경변수 확인
□ Supabase 연결 상태 확인
□ 기존 기능 정상 작동 테스트 (로그인, CRUD)
□ 에러 메시지 정확히 분석 (3번 읽기)
```

### 2단계: 디버깅으로 원인 파악 (AI-사람 협업)

코드 수정 전 반드시 디버깅으로 검증한다.

**AI 역할:**
- 디버깅 방법 제시 (SQL 쿼리, console.log 코드, 확인할 API 등)
- 결과 분석 및 원인 파악
- 수정 방향 제안

**사람 역할:**
- Supabase SQL Editor에서 쿼리 실행 후 결과 공유
- 브라우저 Console에서 로그 확인 후 결과 공유
- Network 탭에서 API 응답 확인 후 결과 공유

→ 원인 파악 후에만 수정 방향 결정

### 3단계: 백업

**Git 백업:**
```bash
git add . && git commit -m "backup before [작업내용]"
```

**Supabase 백업:**
```
□ 영향받는 데이터 SELECT 결과 복사해두기
□ 스키마 변경 시 기존 DDL 저장
□ AI가 롤백 SQL도 함께 제공
```

### 4단계: 코드 수정

```
- 기존 기능 보호: 사이드 이펙트 없이 수정
- 한 번에 하나씩 step-by-step 진행
- 각 단계마다 기존 기능 테스트
- 수정은 확인받고 시작
```

### 5단계: 검증

```
□ 기존 기능 정상 작동 확인
□ 새 기능 정상 작동 확인
□ "기존 기능 정상 작동 확인됨" 후에만 다음 단계
□ 문제 발견 시 즉시 롤백
```

---

## 롤백 방법

### Git 롤백
```bash
git reset --hard HEAD~1
```

### Supabase 롤백
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

## 자주 사용하는 명령어

### 개발
```bash
# 개발 서버 실행
npm start

# 빌드
npm run build
```

### Git
```bash
# 백업 커밋
git add . && git commit -m "backup before changes"

# 푸시
git push

# 롤백
git reset --hard HEAD~1
```

### Supabase keepalive 수동 테스트
```bash
curl -X GET 'https://[PROJECT_ID].supabase.co/rest/v1/overtime_records?limit=1' \
  -H "apikey: [ANON_KEY]"
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
3. **기존 기능 보호** (사이드 이펙트 없이 수정)
4. **즉시 롤백 준비** (Git + Supabase 모두)
5. **원칙 위반 시 작업 즉시 중단하고 원상 복구**
