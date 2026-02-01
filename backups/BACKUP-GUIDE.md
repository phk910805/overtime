# Supabase 수동 백업 가이드

## 📅 백업 정보
- **백업 일시**: 2025-02-01
- **플랜**: 무료 (수동 백업 필수)
- **프로젝트**: overtime-management
- **Supabase URL**: https://qcsvkxtxtdljphyyrwcg.supabase.co

---

## 🎯 백업 목적

Supabase 무료 플랜은:
- ✅ 7일 미사용 시 일시정지 위험
- ✅ 자동 백업 없음 (프로 플랜만 제공)
- ✅ 작업 전 백업 필수

따라서 **정기적인 수동 백업**이 필요합니다!

---

## 📦 백업 파일 구성

이 디렉토리에는 다음 백업 파일들이 있습니다:

```
backups/
├── BACKUP-GUIDE.md                    # 이 파일 (백업 가이드)
├── 2025-02-01_1_data_backup.sql      # 데이터 백업 (가장 중요!)
├── 2025-02-01_2_schema_backup.sql    # 스키마 구조 백업
├── 2025-02-01_3_rls_backup.sql       # RLS 정책 백업
└── 2025-02-01_4_restore.sql          # 복원 SQL (전체)
```

---

## ✅ **백업 절차 (5분)**

### Step 1: Supabase Dashboard 접속

1. https://supabase.com/dashboard 접속
2. `overtime-management` 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭

---

### Step 2: 데이터 백업 (필수!)

#### 2-1. 데이터 개수 확인
```sql
-- 파일: 2025-02-01_1_data_backup.sql의 "Step 1" 쿼리 실행
-- 각 테이블의 데이터 개수 확인
```

**결과를 스크린샷 또는 텍스트로 저장**

#### 2-2. 전체 데이터 조회 및 저장

**중요한 테이블별로 실행:**

```sql
-- employees 데이터
SELECT * FROM employees ORDER BY id;
```

**→ 결과를 CSV로 다운로드:**
1. 쿼리 실행 후 Results 창에서
2. **"Download CSV"** 버튼 클릭
3. 파일명: `employees_2025-02-01.csv` 로 저장

**같은 방법으로 모든 테이블 백업:**
- employees
- overtime_records
- vacation_records
- carryover_records
- employee_changes
- settings
- settings_history
- profiles
- companies
- company_invites

**저장 위치:**
```
backups/data/
├── employees_2025-02-01.csv
├── overtime_records_2025-02-01.csv
├── vacation_records_2025-02-01.csv
└── ...
```

---

### Step 3: 스키마 백업 (중요!)

```sql
-- 파일: 2025-02-01_2_schema_backup.sql 전체 실행
-- 테이블 구조, 인덱스, 제약조건 확인
```

**결과를 텍스트 파일로 저장:**
- 파일명: `schema_backup_2025-02-01.txt`

---

### Step 4: RLS 정책 백업 (중요!)

```sql
-- 파일: 2025-02-01_3_rls_backup.sql 실행
-- RLS 정책 확인
```

**결과를 텍스트 파일로 저장:**
- 파일명: `rls_backup_2025-02-01.txt`

---

### Step 5: 백업 완료 체크리스트

```
□ 데이터 개수 확인 (스크린샷 또는 텍스트)
□ 10개 테이블 CSV 다운로드
□ 스키마 백업 텍스트 저장
□ RLS 정책 백업 텍스트 저장
□ 백업 파일 안전한 곳에 보관 (Google Drive, 외장하드 등)
```

---

## 🔄 **복원 절차 (문제 발생 시)**

### 긴급 복원 (데이터 손실 시)

1. **Supabase SQL Editor** 접속
2. `2025-02-01_4_restore.sql` 파일 열기
3. **Step 1: 테이블 생성** 쿼리 실행
4. **Step 2: 데이터 복원**
   - CSV 파일을 Supabase Table Editor에서 Import
   - 또는 INSERT 문 실행

### 부분 복원 (특정 테이블만)

```sql
-- 예: employees 테이블만 복원
-- 1. 기존 데이터 백업
SELECT * FROM employees INTO employees_backup_temp;

-- 2. 데이터 삭제
DELETE FROM employees WHERE id > 0;

-- 3. CSV Import 또는 INSERT 문 실행
```

---

## 📅 **백업 주기 권장**

| 시점 | 필수 여부 | 백업 내용 |
|------|----------|----------|
| 작업 전 | ✅ 필수 | 데이터 + 스키마 |
| 매주 월요일 | ⭐ 권장 | 데이터만 |
| 배포 전 | ✅ 필수 | 전체 |
| 스키마 변경 전 | ✅ 필수 | 전체 |

---

## 💾 **백업 파일 보관 위치**

### 필수 보관 (최소 2곳)

1. **로컬**: `/Users/user/Desktop/overtime-app/backups/`
2. **클라우드**: Google Drive, Dropbox 등
3. **외장하드**: 물리적 백업

### 파일명 규칙

```
{날짜}_{순서}_{종류}.{확장자}

예시:
2025-02-01_1_data_backup.sql
2025-02-01_employees.csv
```

---

## ⚠️ **주의사항**

### 1. 무료 플랜 제약
- 7일 미사용 시 데이터베이스 일시정지
- 해결: 매주 접속 또는 keepalive 워크플로우 실행

### 2. CSV 복원 시 주의
- ID 중복 체크
- Foreign Key 순서 (companies → employees → records)
- deleted_at, created_at 등 타임스탬프 주의

### 3. 스키마 복원 시 주의
- 기존 테이블 삭제 여부 확인
- RLS 정책 순서 중요
- 트리거 함수 먼저 생성

---

## 🚨 **긴급 상황 대응**

### Case 1: "Supabase 접속 안 됨"
→ 7일 미사용으로 일시정지
→ Dashboard에서 Resume 클릭

### Case 2: "데이터가 사라졌어요"
→ 가장 최근 백업 CSV 파일 확인
→ Table Editor에서 Import

### Case 3: "테이블 구조가 깨졌어요"
→ schema_backup.sql 실행
→ RLS 정책 재적용

---

## 📞 **도움말**

백업/복원 중 문제가 생기면:
1. 이 가이드의 절차 다시 확인
2. 백업 파일이 완전한지 확인
3. Supabase 공식 문서 참조

---

## ✅ **백업 완료 확인**

백업이 성공적으로 완료되었는지 확인:

```bash
# 로컬 터미널에서 실행
ls -lh /Users/user/Desktop/overtime-app/backups/

# 확인할 것:
# - SQL 파일들 존재
# - CSV 파일들 존재 (data/ 폴더)
# - 파일 크기가 0이 아님
```

---

**마지막 백업 일시: 2025-02-01**
**다음 백업 예정: 2025-02-08 (매주 월요일)**

🎉 백업 완료! 안전하게 보관하세요!
