-- ================================================================
-- Dev Supabase 프로젝트 스키마 설정
-- ================================================================
-- 대상: maoliyexnvbamcjbmfsc (overtime-dev)
-- 목적: 프로덕션 스키마 복제 (데이터 제외)
-- 실행: Supabase Dashboard → SQL Editor → 전체 복사 붙여넣기 → Run
-- ================================================================

-- ================================================================
-- Part 1: 테이블 생성
-- ================================================================

CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    business_number VARCHAR(12) NOT NULL UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    owner_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
    company_id INTEGER REFERENCES companies(id),
    CONSTRAINT unique_employee_year_month UNIQUE (employee_id, year, month)
);

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

CREATE TABLE IF NOT EXISTS settings (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('UTC', NOW()),
    multiplier NUMERIC DEFAULT 1.0,
    company_id INTEGER REFERENCES companies(id),
    CONSTRAINT unique_settings_key_company UNIQUE (key, company_id)
);

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
-- Part 2: 인덱스
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_employees_company_deleted
ON employees(company_id, deleted_at);

CREATE INDEX IF NOT EXISTS idx_overtime_employee_date
ON overtime_records(employee_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_overtime_company_date
ON overtime_records(company_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_vacation_employee_date
ON vacation_records(employee_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_vacation_company_date
ON vacation_records(company_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_carryover_employee_year_month
ON carryover_records(employee_id, year DESC, month DESC);

-- ================================================================
-- Part 3: RLS 활성화 + 정책
-- ================================================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE overtime_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE carryover_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_invites ENABLE ROW LEVEL SECURITY;

-- profiles RLS
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT TO authenticated
USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated
USING (id = auth.uid());
CREATE POLICY "Users can view company profiles" ON profiles FOR SELECT TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- companies RLS
CREATE POLICY "Users can view own company" ON companies FOR SELECT TO authenticated
USING (id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Owner can update company" ON companies FOR UPDATE TO authenticated
USING (owner_id = auth.uid());
CREATE POLICY "Authenticated can insert company" ON companies FOR INSERT TO authenticated
WITH CHECK (true);

-- employees RLS
CREATE POLICY "Users can view company employees" ON employees FOR SELECT TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert company employees" ON employees FOR INSERT TO authenticated
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR company_id IS NULL);
CREATE POLICY "Users can update company employees" ON employees FOR UPDATE TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can delete company employees" ON employees FOR DELETE TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- overtime_records RLS
CREATE POLICY "Users can view company overtime" ON overtime_records FOR SELECT TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert company overtime" ON overtime_records FOR INSERT TO authenticated
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR company_id IS NULL);
CREATE POLICY "Users can update company overtime" ON overtime_records FOR UPDATE TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can delete company overtime" ON overtime_records FOR DELETE TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- vacation_records RLS
CREATE POLICY "Users can view company vacation" ON vacation_records FOR SELECT TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert company vacation" ON vacation_records FOR INSERT TO authenticated
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR company_id IS NULL);
CREATE POLICY "Users can update company vacation" ON vacation_records FOR UPDATE TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can delete company vacation" ON vacation_records FOR DELETE TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- carryover_records RLS
CREATE POLICY "Users can view company carryover" ON carryover_records FOR SELECT TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert company carryover" ON carryover_records FOR INSERT TO authenticated
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR company_id IS NULL);
CREATE POLICY "Users can update company carryover" ON carryover_records FOR UPDATE TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can delete company carryover" ON carryover_records FOR DELETE TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- employee_changes RLS
CREATE POLICY "Users can view company changes" ON employee_changes FOR SELECT TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert company changes" ON employee_changes FOR INSERT TO authenticated
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR company_id IS NULL);

-- settings RLS
CREATE POLICY "Users can view company settings" ON settings FOR SELECT TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert company settings" ON settings FOR INSERT TO authenticated
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update company settings" ON settings FOR UPDATE TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- settings_history RLS
CREATE POLICY "Users can view company settings history" ON settings_history FOR SELECT TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert company settings history" ON settings_history FOR INSERT TO authenticated
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update company settings history" ON settings_history FOR UPDATE TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- company_invites RLS
CREATE POLICY "Users can view company invites" ON company_invites FOR SELECT TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert company invites" ON company_invites FOR INSERT TO authenticated
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update company invites" ON company_invites FOR UPDATE TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- ================================================================
-- Part 4: 함수 & 트리거
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

-- 트리거
CREATE TRIGGER set_employee_company_id
  BEFORE INSERT ON employees
  FOR EACH ROW EXECUTE FUNCTION set_company_id_from_user();

CREATE TRIGGER set_overtime_company_id
  BEFORE INSERT ON overtime_records
  FOR EACH ROW EXECUTE FUNCTION set_company_id_from_user();

CREATE TRIGGER set_vacation_company_id
  BEFORE INSERT ON vacation_records
  FOR EACH ROW EXECUTE FUNCTION set_company_id_from_user();

CREATE TRIGGER set_carryover_company_id
  BEFORE INSERT ON carryover_records
  FOR EACH ROW EXECUTE FUNCTION set_company_id_from_user();

CREATE TRIGGER set_employee_changes_company_id
  BEFORE INSERT ON employee_changes
  FOR EACH ROW EXECUTE FUNCTION set_company_id_from_user();

-- ================================================================
-- Part 5: RPC 함수
-- ================================================================

-- 특정 월의 직원 목록 조회 (soft delete 고려)
CREATE OR REPLACE FUNCTION get_employees_for_month(target_date DATE)
RETURNS TABLE (
  id BIGINT,
  name VARCHAR(100),
  created_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  last_updated_name VARCHAR(255),
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.name,
    e.created_at,
    e.deleted_at,
    e.last_updated_name,
    (e.deleted_at IS NULL) AS is_active
  FROM employees e
  WHERE e.company_id IN (SELECT p.company_id FROM profiles p WHERE p.id = auth.uid())
    AND (
      e.deleted_at IS NULL
      OR e.deleted_at >= DATE_TRUNC('month', target_date)
    )
    AND e.created_at < (DATE_TRUNC('month', target_date) + INTERVAL '1 month')
  ORDER BY e.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 월별 설정 자동 생성
CREATE OR REPLACE FUNCTION ensure_monthly_settings(p_year INTEGER, p_month INTEGER, p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_company_id INTEGER;
  v_exists BOOLEAN;
BEGIN
  SELECT company_id INTO v_company_id FROM profiles WHERE id = p_user_id;

  SELECT EXISTS(
    SELECT 1 FROM settings_history
    WHERE year = p_year AND month = p_month AND company_id = v_company_id
  ) INTO v_exists;

  IF NOT v_exists THEN
    INSERT INTO settings_history (key, value, year, month, user_id, company_id)
    VALUES ('overtimeSettings', '{}'::jsonb, p_year, p_month, p_user_id, v_company_id);
    RETURN json_build_object('status', 'created');
  END IF;

  RETURN json_build_object('status', 'exists');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- Part 6: Auth 트리거 (회원가입 시 profiles 자동 생성)
-- ================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'employee'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ================================================================
-- 완료! 테이블 확인
-- ================================================================
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
