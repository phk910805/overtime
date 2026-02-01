-- ================================================================
-- Supabase 복원 SQL
-- ================================================================
-- 백업 일시: 2025-02-01
-- 프로젝트: overtime-management
-- 목적: 데이터 손실 시 복원
-- ================================================================

-- ⚠️ 경고: 이 스크립트는 긴급 복원용입니다
-- 실행 전 반드시 현재 데이터를 백업하세요!

-- ================================================================
-- Step 1: 테이블 생성 (스키마 복원)
-- ================================================================

-- 1. companies 테이블
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    business_number VARCHAR(12) NOT NULL UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    owner_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. profiles 테이블
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    email VARCHAR(255),
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'employee',
    department VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('UTC', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('UTC', NOW()),
    company_name VARCHAR(50),
    business_number VARCHAR(10),
    company_id INTEGER REFERENCES companies(id)
);

-- 3. employees 테이블
CREATE TABLE IF NOT EXISTS employees (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('UTC', NOW()),
    deleted_at TIMESTAMPTZ,
    user_id UUID,
    last_updated_name VARCHAR(255),
    birth_date DATE,
    department VARCHAR(100) NOT NULL,
    hire_date DATE,
    notes TEXT,
    company_name VARCHAR(200),
    business_number VARCHAR(50),
    company_id INTEGER REFERENCES companies(id)
);

-- 4. overtime_records 테이블
CREATE TABLE IF NOT EXISTS overtime_records (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT REFERENCES employees(id),
    date DATE NOT NULL,
    total_minutes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('UTC', NOW()),
    description TEXT,
    employee_name VARCHAR(255),
    user_id UUID,
    company_id INTEGER REFERENCES companies(id)
);

-- 5. vacation_records 테이블
CREATE TABLE IF NOT EXISTS vacation_records (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT REFERENCES employees(id),
    date DATE NOT NULL,
    total_minutes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('UTC', NOW()),
    description TEXT,
    employee_name VARCHAR(255),
    user_id UUID,
    company_id INTEGER REFERENCES companies(id)
);

-- 6. carryover_records 테이블
CREATE TABLE IF NOT EXISTS carryover_records (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    carryover_remaining_minutes INTEGER NOT NULL DEFAULT 0,
    source_month_multiplier NUMERIC,
    user_id UUID,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('UTC', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('UTC', NOW()),
    company_id INTEGER REFERENCES companies(id)
);

-- 7. employee_changes 테이블
CREATE TABLE IF NOT EXISTS employee_changes (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT REFERENCES employees(id),
    action VARCHAR(50) NOT NULL,
    employee_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('UTC', NOW()),
    old_name VARCHAR(255),
    user_id UUID,
    company_id INTEGER REFERENCES companies(id)
);

-- 8. settings 테이블
CREATE TABLE IF NOT EXISTS settings (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('UTC', NOW()),
    multiplier NUMERIC DEFAULT 1.0,
    company_id INTEGER REFERENCES companies(id)
);

-- 9. settings_history 테이블
CREATE TABLE IF NOT EXISTS settings_history (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(255) NOT NULL DEFAULT 'overtimeSettings',
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    multiplier NUMERIC DEFAULT 1.0,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    user_id UUID,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('UTC', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('UTC', NOW()),
    company_id INTEGER REFERENCES companies(id)
);

-- 10. company_invites 테이블
CREATE TABLE IF NOT EXISTS company_invites (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    invite_code VARCHAR(8) NOT NULL,
    invited_email VARCHAR(255) NOT NULL,
    created_by UUID,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 hour'),
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMPTZ,
    used_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- Step 2: 인덱스 생성 (성능 최적화)
-- ================================================================

-- employees 인덱스
CREATE INDEX IF NOT EXISTS idx_employees_company_deleted 
ON employees(company_id, deleted_at);

-- overtime_records 인덱스
CREATE INDEX IF NOT EXISTS idx_overtime_employee_date 
ON overtime_records(employee_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_overtime_company_date 
ON overtime_records(company_id, date DESC);

-- vacation_records 인덱스
CREATE INDEX IF NOT EXISTS idx_vacation_employee_date 
ON vacation_records(employee_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_vacation_company_date 
ON vacation_records(company_id, date DESC);

-- carryover_records 인덱스
CREATE INDEX IF NOT EXISTS idx_carryover_employee_year_month 
ON carryover_records(employee_id, year DESC, month DESC);

-- ================================================================
-- Step 3: 데이터 복원
-- ================================================================

-- ⚠️ 중요: CSV 파일을 Supabase Table Editor에서 Import하세요
-- 
-- 복원 순서 (Foreign Key 때문에 순서 중요!):
-- 1. companies
-- 2. profiles
-- 3. employees
-- 4. overtime_records
-- 5. vacation_records
-- 6. carryover_records
-- 7. employee_changes
-- 8. settings
-- 9. settings_history
-- 10. company_invites

-- Supabase Dashboard → Table Editor → 각 테이블 선택 → Import Data → CSV 업로드

-- ================================================================
-- Step 4: RLS 정책 복원
-- ================================================================

-- RLS 활성화
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE overtime_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE carryover_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_invites ENABLE ROW LEVEL SECURITY;

-- 정책 생성은 2025-02-01_3_rls_backup.sql 참조
-- 또는 Supabase Dashboard에서 자동 생성된 정책 확인

-- ================================================================
-- Step 5: 트리거 및 함수 복원
-- ================================================================

-- company_id 자동 설정 함수
CREATE OR REPLACE FUNCTION set_company_id_from_user()
RETURNS TRIGGER AS $$
BEGIN
  SELECT company_id INTO NEW.company_id
  FROM profiles
  WHERE id = auth.uid();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성 (employees)
DROP TRIGGER IF EXISTS set_employee_company_id ON employees;
CREATE TRIGGER set_employee_company_id
  BEFORE INSERT ON employees
  FOR EACH ROW
  EXECUTE FUNCTION set_company_id_from_user();

-- 트리거 생성 (overtime_records)
DROP TRIGGER IF EXISTS set_overtime_company_id ON overtime_records;
CREATE TRIGGER set_overtime_company_id
  BEFORE INSERT ON overtime_records
  FOR EACH ROW
  EXECUTE FUNCTION set_company_id_from_user();

-- 트리거 생성 (vacation_records)
DROP TRIGGER IF EXISTS set_vacation_company_id ON vacation_records;
CREATE TRIGGER set_vacation_company_id
  BEFORE INSERT ON vacation_records
  FOR EACH ROW
  EXECUTE FUNCTION set_company_id_from_user();

-- 트리거 생성 (carryover_records)
DROP TRIGGER IF EXISTS set_carryover_company_id ON carryover_records;
CREATE TRIGGER set_carryover_company_id
  BEFORE INSERT ON carryover_records
  FOR EACH ROW
  EXECUTE FUNCTION set_company_id_from_user();

-- 트리거 생성 (employee_changes)
DROP TRIGGER IF EXISTS set_employee_changes_company_id ON employee_changes;
CREATE TRIGGER set_employee_changes_company_id
  BEFORE INSERT ON employee_changes
  FOR EACH ROW
  EXECUTE FUNCTION set_company_id_from_user();

-- ================================================================
-- Step 6: 복원 확인
-- ================================================================

-- 데이터 개수 확인
SELECT 
  'employees' as table_name, COUNT(*) as count FROM employees
UNION ALL
SELECT 'overtime_records', COUNT(*) FROM overtime_records
UNION ALL
SELECT 'vacation_records', COUNT(*) FROM vacation_records
UNION ALL
SELECT 'carryover_records', COUNT(*) FROM carryover_records
UNION ALL
SELECT 'employee_changes', COUNT(*) FROM employee_changes
UNION ALL
SELECT 'settings', COUNT(*) FROM settings
UNION ALL
SELECT 'settings_history', COUNT(*) FROM settings_history
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'companies', COUNT(*) FROM companies
UNION ALL
SELECT 'company_invites', COUNT(*) FROM company_invites
ORDER BY table_name;

-- 백업 시점과 비교하여 데이터 개수가 일치하는지 확인!

-- ================================================================
-- 복원 완료!
-- ================================================================
-- 
-- ✅ 체크리스트:
-- □ 테이블 생성 완료
-- □ 인덱스 생성 완료
-- □ CSV 데이터 Import 완료
-- □ RLS 정책 복원 완료
-- □ 트리거/함수 복원 완료
-- □ 데이터 개수 확인 완료
-- 
-- 🎉 복원 성공!
-- ================================================================
