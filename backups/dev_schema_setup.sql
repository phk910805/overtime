-- ================================================================
-- Dev Supabase 프로젝트 스키마 설정
-- ================================================================
-- 대상: maoliyexnvbamcjbmfsc (overtime-dev)
-- 목적: 프로덕션 스키마 정확히 복제 (데이터 제외)
-- 출처: 프로덕션 pg_policies + 스키마 덤프 (2026-02-07 기준)
-- 업데이트: Phase 2/3/B 승인 워크플로우 + 초대 링크 + 알림 (2026-02-18)
-- 실행: Supabase Dashboard > SQL Editor > 전체 복사 붙여넣기 > Run
-- ================================================================
-- 주의: Part 3 실행 전 반드시 Part 1, 2가 완료되어야 합니다.
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
    permission VARCHAR(50) DEFAULT 'editor',
    department VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('UTC', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('UTC', NOW()),
    company_name VARCHAR(50),
    business_number VARCHAR(10),
    company_id INTEGER REFERENCES companies(id),
    pending_company_id INTEGER REFERENCES companies(id),
    applied_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ
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
    company_id INTEGER REFERENCES companies(id),
    linked_user_id UUID
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
    company_id INTEGER REFERENCES companies(id),
    status VARCHAR(20) DEFAULT 'approved',
    submitted_by UUID,
    submit_reason TEXT,
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    review_note TEXT
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
    company_id INTEGER REFERENCES companies(id),
    status VARCHAR(20) DEFAULT 'approved',
    submitted_by UUID,
    submit_reason TEXT,
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    review_note TEXT
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    invited_role VARCHAR(50) DEFAULT 'employee',
    invited_permission VARCHAR(50) DEFAULT 'editor',
    invite_token UUID DEFAULT gen_random_uuid()
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    recipient_id UUID NOT NULL,
    sender_id UUID,
    type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    related_record_id BIGINT,
    related_record_type VARCHAR(50),
    company_id INTEGER REFERENCES companies(id),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('UTC', NOW())
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

CREATE INDEX IF NOT EXISTS idx_employees_linked_user
ON employees(linked_user_id) WHERE linked_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_overtime_status
ON overtime_records(status) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_vacation_status
ON vacation_records(status) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_notifications_recipient
ON notifications(recipient_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_company_invites_token
ON company_invites(invite_token) WHERE is_used = FALSE;

-- ================================================================
-- Part 3: RLS 활성화 + 헬퍼 함수 + 정책
-- (프로덕션 pg_policies 2026-02-07 기준 정확히 복제)
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
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS 헬퍼 함수 (SECURITY DEFINER로 profiles 자기참조 재귀 방지)
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS INTEGER AS $$
  SELECT company_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- profiles (자기 프로필만 조회/수정)
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- companies (SELECT 전체 공개, INSERT/UPDATE/DELETE는 owner만)
CREATE POLICY "Enable read access for authenticated users" ON companies FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "Enable insert for authenticated users" ON companies FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Company owners can update their companies" ON companies FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Company owners can delete their companies" ON companies FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);

-- employees (get_user_company_id 사용)
CREATE POLICY "Users can view their company employees" ON employees FOR SELECT TO authenticated
  USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert their company employees" ON employees FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update their company employees" ON employees FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete their company employees" ON employees FOR DELETE TO authenticated
  USING (company_id = get_user_company_id());

-- overtime_records
CREATE POLICY "Users can view their company overtime records" ON overtime_records FOR SELECT TO authenticated
  USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert their company overtime records" ON overtime_records FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update their company overtime records" ON overtime_records FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete their company overtime records" ON overtime_records FOR DELETE TO authenticated
  USING (company_id = get_user_company_id());

-- vacation_records
CREATE POLICY "Users can view their company vacation records" ON vacation_records FOR SELECT TO authenticated
  USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert their company vacation records" ON vacation_records FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update their company vacation records" ON vacation_records FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete their company vacation records" ON vacation_records FOR DELETE TO authenticated
  USING (company_id = get_user_company_id());

-- carryover_records
CREATE POLICY "Users can view their company carryover records" ON carryover_records FOR SELECT TO authenticated
  USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert their company carryover records" ON carryover_records FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update their company carryover records" ON carryover_records FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete their company carryover records" ON carryover_records FOR DELETE TO authenticated
  USING (company_id = get_user_company_id());

-- employee_changes
CREATE POLICY "Users can view their company employee changes" ON employee_changes FOR SELECT TO authenticated
  USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert their company employee changes" ON employee_changes FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id());

-- settings
CREATE POLICY "Users can view their company settings" ON settings FOR SELECT TO authenticated
  USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert their company settings" ON settings FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update their company settings" ON settings FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

-- settings_history
CREATE POLICY "Users can view their company settings history" ON settings_history FOR SELECT TO authenticated
  USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert their company settings history" ON settings_history FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id());

-- company_invites (SELECT 전체 공개, 나머지는 자기 회사만)
CREATE POLICY "Anyone can view invites for validation" ON company_invites FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "Users can create their company invites" ON company_invites FOR INSERT TO authenticated
  WITH CHECK (company_id = (SELECT profiles.company_id FROM profiles WHERE profiles.id = auth.uid()));
CREATE POLICY "Users can update their company invites" ON company_invites FOR UPDATE TO authenticated
  USING (company_id = (SELECT profiles.company_id FROM profiles WHERE profiles.id = auth.uid()))
  WITH CHECK (company_id = (SELECT profiles.company_id FROM profiles WHERE profiles.id = auth.uid()));
CREATE POLICY "Users can delete their company invites" ON company_invites FOR DELETE TO authenticated
  USING (company_id = (SELECT profiles.company_id FROM profiles WHERE profiles.id = auth.uid()));

-- notifications (본인 알림만 조회, 회사 단위 생성)
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT TO authenticated
  USING (recipient_id = auth.uid());
CREATE POLICY "Users can insert company notifications" ON notifications FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated
  USING (recipient_id = auth.uid());

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

CREATE TRIGGER set_notifications_company_id
  BEFORE INSERT ON notifications
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
-- Part 7: Phase 2/3/B RPC 함수 (초대 링크 + 팀원 관리 + 승인)
-- ================================================================
-- 아래 RPC 함수들은 Supabase SQL Editor에서 직접 생성됨.
-- 새 프로젝트 세팅 시 dev Supabase에서 아래 함수들을 생성해야 합니다.
-- 기존 dev/prod에는 이미 존재합니다.
--
-- 초대 링크:
--   create_or_refresh_invite_link(p_user_id UUID)
--     → 회사 초대 링크 생성/갱신, invite_token UUID 반환
--   validate_invite_token(p_token UUID)
--     → 초대 토큰 유효성 검증 (로그인 불필요)
--   join_company_via_invite(p_user_id UUID, p_token UUID)
--     → 초대 링크로 회사 참여 (pending 상태로 profiles 업데이트)
--
-- 팀원 관리:
--   get_company_members(p_user_id UUID)
--     → 회사 팀원 목록 조회 (id, email, fullName, role, permission, appliedAt, approvedAt)
--   update_member_role(p_owner_id UUID, p_member_id UUID, p_new_role VARCHAR, p_new_permission VARCHAR)
--     → 팀원 역할/권한 변경 (소유자 전용)
--   remove_company_member(p_owner_id UUID, p_member_id UUID)
--     → 팀원 내보내기 (소유자 전용, company_id/role 초기화)
--
-- 승인 워크플로우:
--   get_pending_members(p_admin_id UUID)
--     → 참여 대기 중인 멤버 목록 (pending_company_id 기반)
--   approve_join_request(p_admin_id UUID, p_member_id UUID, p_role VARCHAR, p_permission VARCHAR)
--     → 참여 요청 승인 (pending_company_id → company_id 이동, role/permission 설정)
--   reject_join_request(p_admin_id UUID, p_member_id UUID)
--     → 참여 요청 거절 (pending_company_id 초기화)
--
-- 코드 기반 초대 (레거시):
--   use_invite_and_set_role(p_invite_id INTEGER, p_user_id UUID)
--     → 초대 코드 사용 및 역할 설정
-- ================================================================

-- ================================================================
-- 완료! 테이블 확인
-- ================================================================
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
