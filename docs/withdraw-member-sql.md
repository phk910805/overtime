# 구성원 탈퇴 처리 — SQL 변경

## 적용 순서
1. Dev Supabase에서 테스트
2. Prod Supabase에 적용 (코드 배포 전)
3. 코드 배포

---

## 변경 SQL

### 1. profiles 테이블에 membership_status 컬럼 추가 (없는 경우)

```sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS membership_status TEXT DEFAULT 'active';

COMMENT ON COLUMN profiles.membership_status IS 'active: 활성, withdrawn: 탈퇴, pending: 대기';
```

### 2. `remove_company_member` RPC 수정 (DROP + 재생성)

기존 RPC는 profiles에서 company_id/role만 제거합니다.
새 버전은 soft-delete + pending 기록 취소 + 이력 추가를 수행합니다.

```sql
CREATE OR REPLACE FUNCTION remove_company_member(p_owner_id UUID, p_member_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_company_id BIGINT;
  v_member_role TEXT;
  v_linked_emp_id BIGINT;
  v_linked_emp_name TEXT;
  v_cancelled_overtime INT := 0;
  v_cancelled_vacation INT := 0;
BEGIN
  -- 1. 호출자가 owner인지 확인
  SELECT company_id INTO v_company_id
  FROM profiles
  WHERE id = p_owner_id AND role = 'owner';

  IF v_company_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', '소유자 권한이 필요합니다.');
  END IF;

  -- 2. 대상이 같은 회사 소속인지 확인
  SELECT role INTO v_member_role
  FROM profiles
  WHERE id = p_member_id AND company_id = v_company_id;

  IF v_member_role IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', '해당 팀원을 찾을 수 없습니다.');
  END IF;

  IF v_member_role = 'owner' THEN
    RETURN jsonb_build_object('success', false, 'error', '소유자는 탈퇴 처리할 수 없습니다.');
  END IF;

  -- 3. 연결된 직원 레코드 찾기
  SELECT id, name INTO v_linked_emp_id, v_linked_emp_name
  FROM employees
  WHERE linked_user_id = p_member_id
    AND company_id = v_company_id
    AND deleted_at IS NULL
  LIMIT 1;

  -- 4. 연결된 직원이 있으면: pending 기록 취소 + soft-delete
  IF v_linked_emp_id IS NOT NULL THEN
    -- 4a. pending overtime_records → cancelled
    UPDATE overtime_records
    SET status = 'cancelled',
        review_note = '구성원 탈퇴로 자동 취소',
        reviewed_at = NOW()
    WHERE employee_id = v_linked_emp_id
      AND company_id = v_company_id
      AND status = 'pending';
    GET DIAGNOSTICS v_cancelled_overtime = ROW_COUNT;

    -- 4b. pending vacation_records → cancelled
    UPDATE vacation_records
    SET status = 'cancelled',
        review_note = '구성원 탈퇴로 자동 취소',
        reviewed_at = NOW()
    WHERE employee_id = v_linked_emp_id
      AND company_id = v_company_id
      AND status = 'pending';
    GET DIAGNOSTICS v_cancelled_vacation = ROW_COUNT;

    -- 4c. 직원 레코드 soft-delete
    UPDATE employees
    SET deleted_at = NOW(),
        linked_user_id = NULL
    WHERE id = v_linked_emp_id
      AND company_id = v_company_id;

    -- 4d. 변경 이력 추가
    INSERT INTO employee_changes (employee_id, employee_name, action, details, company_id)
    VALUES (
      v_linked_emp_id,
      v_linked_emp_name,
      '탈퇴',
      '구성원 탈퇴 처리 (대기 중 초과근무 ' || v_cancelled_overtime || '건, 휴가 ' || v_cancelled_vacation || '건 자동 취소)',
      v_company_id
    );
  END IF;

  -- 5. profiles 업데이트: membership_status = 'withdrawn', company 연결 해제
  UPDATE profiles
  SET membership_status = 'withdrawn',
      company_id = NULL,
      role = NULL,
      permission = NULL
  WHERE id = p_member_id;

  RETURN jsonb_build_object(
    'success', true,
    'cancelledOvertime', v_cancelled_overtime,
    'cancelledVacation', v_cancelled_vacation,
    'linkedEmployeeName', v_linked_emp_name
  );
END;
$$;
```

---

## 롤백 SQL

### 1. `remove_company_member` 원복 (기존 단순 버전)

```sql
CREATE OR REPLACE FUNCTION remove_company_member(p_owner_id UUID, p_member_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_company_id BIGINT;
  v_member_role TEXT;
BEGIN
  SELECT company_id INTO v_company_id
  FROM profiles
  WHERE id = p_owner_id AND role = 'owner';

  IF v_company_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', '소유자 권한이 필요합니다.');
  END IF;

  SELECT role INTO v_member_role
  FROM profiles
  WHERE id = p_member_id AND company_id = v_company_id;

  IF v_member_role IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', '해당 팀원을 찾을 수 없습니다.');
  END IF;

  IF v_member_role = 'owner' THEN
    RETURN jsonb_build_object('success', false, 'error', '소유자는 내보낼 수 없습니다.');
  END IF;

  UPDATE profiles
  SET company_id = NULL,
      role = NULL,
      permission = NULL
  WHERE id = p_member_id;

  RETURN jsonb_build_object('success', true);
END;
$$;
```

### 2. membership_status 컬럼 롤백

```sql
ALTER TABLE profiles DROP COLUMN IF EXISTS membership_status;
```
