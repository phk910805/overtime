# 📦 Supabase 백업 디렉토리

> **프로젝트**: overtime-management  
> **백업 일시**: 2025-02-01  
> **플랜**: 무료 (수동 백업 필수)

---

## 🚀 **빠른 시작**

### 1️⃣ **백업 실행 (지금 바로!)**

```bash
# 1. Supabase Dashboard 접속
https://supabase.com/dashboard

# 2. SQL Editor 열기

# 3. 이 파일 순서대로 실행:
backups/2025-02-01_1_data_backup.sql     # 데이터 백업
backups/2025-02-01_2_schema_backup.sql   # 스키마 백업
backups/2025-02-01_3_rls_backup.sql      # RLS 정책 백업
```

### 2️⃣ **복원 실행 (긴급 시)**

```bash
# Supabase SQL Editor에서:
backups/2025-02-01_4_restore.sql 실행

# CSV 파일 Import:
backups/data/*.csv → Table Editor에서 Import
```

---

## 📂 **파일 구조**

```
backups/
├── 📖 BACKUP-GUIDE.md           # 상세 백업 가이드 (읽기!)
├── ✅ BACKUP-CHECKLIST.md       # 백업 체크리스트
├── 📄 README.md                 # 이 파일
│
├── 🔵 SQL 백업 파일:
│   ├── 2025-02-01_1_data_backup.sql      # 데이터 조회
│   ├── 2025-02-01_2_schema_backup.sql    # 스키마 확인
│   ├── 2025-02-01_3_rls_backup.sql       # RLS 정책
│   └── 2025-02-01_4_restore.sql          # 복원 스크립트
│
└── 📁 data/                     # CSV 데이터 저장소
    ├── employees_2025-02-01.csv
    ├── overtime_records_2025-02-01.csv
    ├── vacation_records_2025-02-01.csv
    └── ... (10개 테이블)
```

---

## ⚡ **긴급 상황별 대응**

### 🔥 **데이터 삭제됨!**
```sql
-- 1. 해당 테이블만 복원
-- 2. data/[테이블명]_2025-02-01.csv 파일 준비
-- 3. Table Editor → Import Data
```

### 🔥 **테이블 구조 깨짐!**
```sql
-- 2025-02-01_4_restore.sql의 Step 1 실행
-- → 테이블 재생성
```

### 🔥 **RLS 정책 문제!**
```sql
-- 2025-02-01_3_rls_backup.sql 참조
-- → 정책 재생성
```

---

## 📅 **백업 주기**

| 시점 | 필수 여부 | 내용 |
|------|----------|------|
| 작업 전 | ✅ 필수 | 데이터 + 스키마 |
| 매주 월요일 | ⭐ 권장 | 데이터만 |
| 배포 전 | ✅ 필수 | 전체 |
| 스키마 변경 전 | ✅ 필수 | 전체 |

**다음 백업 예정**: 2025-02-08 (월요일)

---

## 🎯 **백업 실행 순서 (30분)**

1. **BACKUP-GUIDE.md** 읽기 (5분)
2. **데이터 백업** 실행 (15분)
   - SQL Editor에서 각 테이블 조회
   - CSV 다운로드
3. **스키마 백업** 실행 (5분)
4. **RLS 백업** 실행 (5분)
5. **파일 확인 및 업로드** (5분)

---

## 💾 **백업 파일 보관 위치**

### ✅ 필수 (최소 2곳)
- [x] 로컬: `/Users/user/Desktop/overtime-app/backups/`
- [ ] Google Drive
- [ ] 외장하드

### ⚠️ 중요!
Supabase 무료 플랜은 **7일 미사용 시 일시정지**되므로,  
백업 파일을 안전한 곳에 **반드시 보관**하세요!

---

## 📞 **문제 발생 시**

1. **BACKUP-GUIDE.md** 확인
2. **BACKUP-CHECKLIST.md** 단계별 확인
3. Supabase 공식 문서 참조

---

## ✅ **백업 완료 확인**

```bash
# 터미널에서 실행
cd /Users/user/Desktop/overtime-app/backups
ls -lh data/

# 확인:
# - data/ 폴더에 10개 CSV 파일
# - 각 파일 크기 > 0
# - SQL 파일 4개 존재
```

---

**🎉 백업 준비 완료!**  
**지금 바로 실행하세요! 👉 BACKUP-GUIDE.md**
