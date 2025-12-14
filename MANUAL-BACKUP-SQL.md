# DB 수동 백업 SQL 스크립트

## 백업 일시: 2024-12-14

---

## Step 1: 각 테이블 스키마 확인

Supabase SQL Editor에서 실행:

```sql
-- 1) employees 테이블 구조
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'employees'
ORDER BY ordinal_position;
```

```sql
-- 2) profiles 테이블 구조
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

```sql
-- 3) settings 테이블 구조
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'settings'
ORDER BY ordinal_position;
```

```sql
-- 4) overtime_records 테이블 구조
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'overtime_records'
ORDER BY ordinal_position;
```

```sql
-- 5) vacation_records 테이블 구조
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'vacation_records'
ORDER BY ordinal_position;
```

```sql
-- 6) carryover_records 테이블 구조
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'carryover_records'
ORDER BY ordinal_position;
```

---

## Step 2: 각 테이블 데이터 개수 확인

```sql
SELECT 
  'employees' as table_name, COUNT(*) as count FROM employees
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'overtime_records', COUNT(*) FROM overtime_records
UNION ALL
SELECT 'vacation_records', COUNT(*) FROM vacation_records
UNION ALL
SELECT 'carryover_records', COUNT(*) FROM carryover_records
UNION ALL
SELECT 'settings', COUNT(*) FROM settings
UNION ALL
SELECT 'settings_history', COUNT(*) FROM settings_history
UNION ALL
SELECT 'employee_changes', COUNT(*) FROM employee_changes;
```

---

## Step 3: 롤백 SQL (문제 발생 시 실행)

```sql
-- ==========================================
-- Multi-tenancy 롤백 SQL
-- ==========================================

-- 1) 새로 생성한 테이블 삭제
DROP TABLE IF EXISTS company_invites CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- 2) 추가한 컬럼 제거
ALTER TABLE profiles DROP COLUMN IF EXISTS company_id;
ALTER TABLE employees DROP COLUMN IF EXISTS company_id;
ALTER TABLE overtime_records DROP COLUMN IF EXISTS company_id;
ALTER TABLE vacation_records DROP COLUMN IF EXISTS company_id;
ALTER TABLE carryover_records DROP COLUMN IF EXISTS company_id;
ALTER TABLE settings DROP COLUMN IF EXISTS company_id;
ALTER TABLE settings_history DROP COLUMN IF EXISTS company_id;
ALTER TABLE employee_changes DROP COLUMN IF EXISTS company_id;

-- 3) RLS 정책 제거
DROP POLICY IF EXISTS company_isolation_employees ON employees;
DROP POLICY IF EXISTS company_isolation_overtime ON overtime_records;
DROP POLICY IF EXISTS company_isolation_vacation ON vacation_records;
DROP POLICY IF EXISTS company_isolation_carryover ON carryover_records;
DROP POLICY IF EXISTS company_isolation_settings ON settings;

-- 4) RLS 비활성화
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE overtime_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE vacation_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE carryover_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE employee_changes DISABLE ROW LEVEL SECURITY;

-- 5) 트리거 제거
DROP TRIGGER IF EXISTS set_employee_company_id ON employees;
DROP TRIGGER IF EXISTS set_overtime_company_id ON overtime_records;
DROP TRIGGER IF EXISTS set_vacation_company_id ON vacation_records;
DROP FUNCTION IF EXISTS set_company_id_from_user();

-- 완료!
SELECT 'Rollback completed successfully!' as status;
```

---

## 백업 완료 체크리스트

- [ ] Step 1 실행 (스키마 확인)
- [ ] Step 2 실행 (데이터 개수 확인)
- [ ] 결과를 텍스트 파일로 저장
- [ ] Step 3 (롤백 SQL) 저장

---

**이 파일을 안전한 곳에 보관하세요!**
