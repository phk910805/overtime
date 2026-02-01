-- ================================================================
-- Supabase RLS 정책 및 트리거 백업 SQL
-- ================================================================
-- 백업 일시: 2025-02-01
-- 프로젝트: overtime-management
-- 목적: RLS 정책, 트리거, 함수 백업
-- ================================================================

-- ================================================================
-- Step 1: RLS 정책 확인
-- ================================================================

SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM
    pg_policies
WHERE
    schemaname = 'public'
ORDER BY
    tablename,
    policyname;

-- 결과를 텍스트 파일로 저장: rls_policies_2025-02-01.txt

-- ================================================================
-- Step 2: RLS 활성화 상태 확인
-- ================================================================

SELECT
    schemaname,
    tablename,
    rowsecurity
FROM
    pg_tables
WHERE
    schemaname = 'public'
ORDER BY
    tablename;

-- ================================================================
-- Step 3: 트리거 확인
-- ================================================================

SELECT
    event_object_schema AS schema_name,
    event_object_table AS table_name,
    trigger_name,
    event_manipulation AS trigger_event,
    action_statement,
    action_timing,
    action_orientation
FROM
    information_schema.triggers
WHERE
    trigger_schema = 'public'
ORDER BY
    event_object_table,
    trigger_name;

-- ================================================================
-- Step 4: 함수 확인
-- ================================================================

SELECT
    routine_schema,
    routine_name,
    routine_type,
    data_type AS return_type,
    routine_definition
FROM
    information_schema.routines
WHERE
    routine_schema = 'public'
ORDER BY
    routine_name;

-- ================================================================
-- Step 5: 함수 상세 정보 (필요 시)
-- ================================================================

SELECT
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS function_definition
FROM
    pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE
    n.nspname = 'public'
ORDER BY
    p.proname;

-- ================================================================
-- Step 6: RLS 정책 재생성 SQL (참고용)
-- ================================================================

-- *** 주의: 아래는 참고용 템플릿입니다 ***
-- 실제 복원 시에는 현재 설정된 정책을 확인하고 적용하세요

-- 예시: employees 테이블 RLS 정책
/*
-- RLS 활성화
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- SELECT 정책
CREATE POLICY "Users can view their company employees"
ON employees FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT company_id 
    FROM profiles 
    WHERE id = auth.uid()
  )
);

-- INSERT 정책
CREATE POLICY "Users can insert their company employees"
ON employees FOR INSERT
TO authenticated
WITH CHECK (
  company_id IN (
    SELECT company_id 
    FROM profiles 
    WHERE id = auth.uid()
  )
);

-- UPDATE 정책
CREATE POLICY "Users can update their company employees"
ON employees FOR UPDATE
TO authenticated
USING (
  company_id IN (
    SELECT company_id 
    FROM profiles 
    WHERE id = auth.uid()
  )
);

-- DELETE 정책
CREATE POLICY "Users can delete their company employees"
ON employees FOR DELETE
TO authenticated
USING (
  company_id IN (
    SELECT company_id 
    FROM profiles 
    WHERE id = auth.uid()
  )
);
*/

-- ================================================================
-- Step 7: 트리거 재생성 SQL (참고용)
-- ================================================================

-- 예시: company_id 자동 설정 트리거
/*
-- 함수 생성
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
CREATE TRIGGER set_employee_company_id
  BEFORE INSERT ON employees
  FOR EACH ROW
  EXECUTE FUNCTION set_company_id_from_user();

-- 트리거 생성 (overtime_records)
CREATE TRIGGER set_overtime_company_id
  BEFORE INSERT ON overtime_records
  FOR EACH ROW
  EXECUTE FUNCTION set_company_id_from_user();

-- 트리거 생성 (vacation_records)
CREATE TRIGGER set_vacation_company_id
  BEFORE INSERT ON vacation_records
  FOR EACH ROW
  EXECUTE FUNCTION set_company_id_from_user();
*/

-- ================================================================
-- 백업 완료 체크리스트
-- ================================================================
-- 
-- □ Step 1: RLS 정책 확인 및 저장
-- □ Step 2: RLS 활성화 상태 저장
-- □ Step 3: 트리거 목록 저장
-- □ Step 4: 함수 목록 저장
-- □ Step 5: 함수 정의 저장
-- 
-- ✅ RLS 및 트리거 백업 완료!
-- ================================================================
