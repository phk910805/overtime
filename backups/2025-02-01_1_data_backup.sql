-- ================================================================
-- Supabase 데이터 백업 SQL
-- ================================================================
-- 백업 일시: 2025-02-01
-- 프로젝트: overtime-management
-- 목적: 전체 데이터 백업 (CSV 다운로드용)
-- ================================================================

-- ================================================================
-- Step 1: 데이터 개수 확인
-- ================================================================
-- 이 쿼리를 먼저 실행하여 현재 데이터 상태 확인

SELECT 
  'employees' as table_name, 
  COUNT(*) as total_count,
  COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as active_count,
  COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as deleted_count
FROM employees

UNION ALL

SELECT 
  'overtime_records', 
  COUNT(*),
  COUNT(*),
  0
FROM overtime_records

UNION ALL

SELECT 
  'vacation_records', 
  COUNT(*),
  COUNT(*),
  0
FROM vacation_records

UNION ALL

SELECT 
  'carryover_records', 
  COUNT(*),
  COUNT(*),
  0
FROM carryover_records

UNION ALL

SELECT 
  'employee_changes', 
  COUNT(*),
  COUNT(*),
  0
FROM employee_changes

UNION ALL

SELECT 
  'settings', 
  COUNT(*),
  COUNT(*),
  0
FROM settings

UNION ALL

SELECT 
  'settings_history', 
  COUNT(*),
  COUNT(*),
  0
FROM settings_history

UNION ALL

SELECT 
  'profiles', 
  COUNT(*),
  COUNT(*),
  0
FROM profiles

UNION ALL

SELECT 
  'companies', 
  COUNT(*),
  COUNT(*),
  0
FROM companies

UNION ALL

SELECT 
  'company_invites', 
  COUNT(*),
  COUNT(CASE WHEN is_used = false THEN 1 END),
  COUNT(CASE WHEN is_used = true THEN 1 END)
FROM company_invites

ORDER BY table_name;

-- 결과를 스크린샷 또는 텍스트로 저장하세요!

-- ================================================================
-- Step 2: 개별 테이블 데이터 조회 (CSV 다운로드)
-- ================================================================
-- 각 쿼리를 실행하고 "Download CSV" 버튼으로 저장

-- ----------------------------------------------------------------
-- 1. employees (직원 정보)
-- ----------------------------------------------------------------
SELECT 
  id,
  name,
  created_at,
  deleted_at,
  user_id,
  last_updated_name,
  birth_date,
  department,
  hire_date,
  notes,
  company_name,
  business_number,
  company_id
FROM employees
ORDER BY id;
-- → CSV 저장: employees_2025-02-01.csv

-- ----------------------------------------------------------------
-- 2. overtime_records (초과근무 기록)
-- ----------------------------------------------------------------
SELECT 
  id,
  employee_id,
  date,
  total_minutes,
  created_at,
  description,
  employee_name,
  user_id,
  company_id
FROM overtime_records
ORDER BY date DESC, employee_id, created_at DESC;
-- → CSV 저장: overtime_records_2025-02-01.csv

-- ----------------------------------------------------------------
-- 3. vacation_records (휴가 기록)
-- ----------------------------------------------------------------
SELECT 
  id,
  employee_id,
  date,
  total_minutes,
  created_at,
  description,
  employee_name,
  user_id,
  company_id
FROM vacation_records
ORDER BY date DESC, employee_id, created_at DESC;
-- → CSV 저장: vacation_records_2025-02-01.csv

-- ----------------------------------------------------------------
-- 4. carryover_records (이월 기록)
-- ----------------------------------------------------------------
SELECT 
  id,
  employee_id,
  year,
  month,
  carryover_remaining_minutes,
  source_month_multiplier,
  user_id,
  created_at,
  updated_at,
  company_id
FROM carryover_records
ORDER BY year DESC, month DESC, employee_id;
-- → CSV 저장: carryover_records_2025-02-01.csv

-- ----------------------------------------------------------------
-- 5. employee_changes (직원 변경 이력)
-- ----------------------------------------------------------------
SELECT 
  id,
  employee_id,
  action,
  employee_name,
  created_at,
  old_name,
  user_id,
  company_id
FROM employee_changes
ORDER BY created_at DESC;
-- → CSV 저장: employee_changes_2025-02-01.csv

-- ----------------------------------------------------------------
-- 6. settings (설정)
-- ----------------------------------------------------------------
SELECT 
  id,
  key,
  value,
  updated_at,
  multiplier,
  company_id
FROM settings
ORDER BY company_id, key;
-- → CSV 저장: settings_2025-02-01.csv

-- ----------------------------------------------------------------
-- 7. settings_history (설정 이력)
-- ----------------------------------------------------------------
SELECT 
  id,
  key,
  value,
  multiplier,
  year,
  month,
  user_id,
  note,
  created_at,
  updated_at,
  company_id
FROM settings_history
ORDER BY year DESC, month DESC, company_id;
-- → CSV 저장: settings_history_2025-02-01.csv

-- ----------------------------------------------------------------
-- 8. profiles (사용자 프로필)
-- ----------------------------------------------------------------
SELECT 
  id,
  email,
  full_name,
  role,
  department,
  created_at,
  updated_at,
  company_name,
  business_number,
  company_id
FROM profiles
ORDER BY created_at;
-- → CSV 저장: profiles_2025-02-01.csv

-- ----------------------------------------------------------------
-- 9. companies (회사 정보)
-- ----------------------------------------------------------------
SELECT 
  id,
  business_number,
  company_name,
  owner_id,
  created_at,
  updated_at
FROM companies
ORDER BY id;
-- → CSV 저장: companies_2025-02-01.csv

-- ----------------------------------------------------------------
-- 10. company_invites (초대 코드)
-- ----------------------------------------------------------------
SELECT 
  id,
  company_id,
  invite_code,
  invited_email,
  created_by,
  expires_at,
  is_used,
  used_at,
  used_by,
  created_at
FROM company_invites
ORDER BY created_at DESC;
-- → CSV 저장: company_invites_2025-02-01.csv

-- ================================================================
-- Step 3: 백업 완료 확인
-- ================================================================
-- 다음 파일들이 생성되었는지 확인:
-- 
-- backups/data/
-- ├── employees_2025-02-01.csv
-- ├── overtime_records_2025-02-01.csv
-- ├── vacation_records_2025-02-01.csv
-- ├── carryover_records_2025-02-01.csv
-- ├── employee_changes_2025-02-01.csv
-- ├── settings_2025-02-01.csv
-- ├── settings_history_2025-02-01.csv
-- ├── profiles_2025-02-01.csv
-- ├── companies_2025-02-01.csv
-- └── company_invites_2025-02-01.csv
-- 
-- ✅ 백업 완료!
-- ================================================================
