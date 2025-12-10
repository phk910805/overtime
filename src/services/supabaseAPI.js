import { supabase } from '../lib/supabase';

// Supabase API 서비스 (기존 localStorage 기능과 독립적)
// 환경변수 REACT_APP_USE_SUPABASE=true일 때만 사용됨

export const supabaseEmployeeAPI = {
  // 모든 직원 조회 (활성 직원만)
  getAll: async () => {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    // 모든 필드 포함하여 반환
    return (data || []).map(emp => ({
      id: emp.id,
      name: emp.name,
      department: emp.department,
      birth_date: emp.birth_date,
      hire_date: emp.hire_date,
      notes: emp.notes,
      company_name: emp.company_name,
      business_number: emp.business_number,
      last_updated_name: emp.last_updated_name,
      createdAt: emp.created_at,
      deletedAt: emp.deleted_at
    }));
  },

  // 모든 직원 조회 (삭제된 직원 포함)
  getAllIncludingDeleted: async () => {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    // 모든 필드 포함하여 반환
    return (data || []).map(emp => ({
      id: emp.id,
      name: emp.name,
      department: emp.department,
      birth_date: emp.birth_date,
      hire_date: emp.hire_date,
      notes: emp.notes,
      company_name: emp.company_name,
      business_number: emp.business_number,
      last_updated_name: emp.last_updated_name,
      createdAt: emp.created_at,
      deletedAt: emp.deleted_at
    }));
  },

  // 직원 생성
  create: async (employeeData) => {
    if (!supabase) throw new Error('Supabase not configured');
    
    // 문자열로 받은 경우 (backward compatibility)
    const dataToInsert = typeof employeeData === 'string' 
      ? { name: employeeData.trim() }
      : {
          name: employeeData.name?.trim(),
          department: employeeData.department || '',
          birth_date: employeeData.birth_date || null,
          hire_date: employeeData.hire_date || null,
          notes: employeeData.notes || null,
          company_name: employeeData.company_name || null,
          business_number: employeeData.business_number || null
        };
    
    const { data, error } = await supabase
      .from('employees')
      .insert([dataToInsert])
      .select();
    
    if (error) throw error;
    
    const employee = data[0];
    
    // 변경 이력 추가
    await supabase
      .from('employee_changes')
      .insert([{
        employee_id: employee.id,
        action: '생성',
        employee_name: employee.name
      }]);
    
    return {
      id: employee.id,
      name: employee.name,
      department: employee.department,
      birth_date: employee.birth_date,
      hire_date: employee.hire_date,
      notes: employee.notes,
      company_name: employee.company_name,
      business_number: employee.business_number,
      last_updated_name: employee.last_updated_name,
      createdAt: employee.created_at,
      deletedAt: employee.deleted_at
    };
  },

  // 직원 수정
  update: async (id, employeeData) => {
    if (!supabase) throw new Error('Supabase not configured');
    
    // 기존 직원 정보 가져오기 (이름 변경 감지용)
    const { data: oldEmployee } = await supabase
      .from('employees')
      .select('name')
      .eq('id', id)
      .single();
    
    // 문자열로 받은 경우 (backward compatibility)
    const dataToUpdate = typeof employeeData === 'string' 
      ? { name: employeeData.trim() }
      : {
          ...(employeeData.name !== undefined && { name: employeeData.name.trim() }),
          ...(employeeData.department !== undefined && { department: employeeData.department }),
          ...(employeeData.birth_date !== undefined && { birth_date: employeeData.birth_date }),
          ...(employeeData.hire_date !== undefined && { hire_date: employeeData.hire_date }),
          ...(employeeData.notes !== undefined && { notes: employeeData.notes }),
          ...(employeeData.company_name !== undefined && { company_name: employeeData.company_name }),
          ...(employeeData.business_number !== undefined && { business_number: employeeData.business_number })
        };
    
    // 이름이 변경된 경우 last_updated_name도 업데이트
    if (dataToUpdate.name && oldEmployee && dataToUpdate.name !== oldEmployee.name) {
      dataToUpdate.last_updated_name = dataToUpdate.name;
    }
    
    const { data, error } = await supabase
      .from('employees')
      .update(dataToUpdate)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    const employee = data[0];
    
    // 변경 이력 추가
    const changeData = {
      employee_id: employee.id,
      action: '수정',
      employee_name: employee.name
    };
    
    // 이름이 변경된 경우 이전 이름도 기록
    if (oldEmployee && employee.name !== oldEmployee.name) {
      changeData.old_name = oldEmployee.name;
    }
    
    await supabase
      .from('employee_changes')
      .insert([changeData]);
    
    return {
      id: employee.id,
      name: employee.name,
      department: employee.department,
      birth_date: employee.birth_date,
      hire_date: employee.hire_date,
      notes: employee.notes,
      company_name: employee.company_name,
      business_number: employee.business_number,
      last_updated_name: employee.last_updated_name,
      createdAt: employee.created_at,
      deletedAt: employee.deleted_at
    };
  },

  // 직원 삭제 (소프트 삭제)
  delete: async (id) => {
    if (!supabase) throw new Error('Supabase not configured');
    
    // 직원 정보 먼저 가져오기
    const { data: employee } = await supabase
      .from('employees')
      .select('name')
      .eq('id', id)
      .single();
    
    // 소프트 삭제
    const { data, error } = await supabase
      .from('employees')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    const deletedEmployee = data[0];
    
    // 변경 이력 추가
    await supabase
      .from('employee_changes')
      .insert([{
        employee_id: id,
        action: '삭제',
        employee_name: employee?.name || '알 수 없음'
      }]);
    
    return {
      id: deletedEmployee.id,
      name: deletedEmployee.name,
      department: deletedEmployee.department,
      birth_date: deletedEmployee.birth_date,
      hire_date: deletedEmployee.hire_date,
      notes: deletedEmployee.notes,
      company_name: deletedEmployee.company_name,
      business_number: deletedEmployee.business_number,
      last_updated_name: deletedEmployee.last_updated_name,
      createdAt: deletedEmployee.created_at,
      deletedAt: deletedEmployee.deleted_at
    };
  }
};

export const supabaseOvertimeAPI = {
  // 월별 초과근무 기록 조회
  getByMonth: async (month) => {
    if (!supabase) throw new Error('Supabase not configured');
    
    const [year, monthNum] = month.split('-');
    const startDate = `${year}-${monthNum}-01`;
    // 월의 마지막 날 정확히 계산
    const lastDay = new Date(year, monthNum, 0).getDate();
    const endDate = `${year}-${monthNum}-${lastDay.toString().padStart(2, '0')}`;
    
    const { data, error } = await supabase
      .from('overtime_records')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });
    
    if (error) throw error;
    
    return (data || []).map(record => ({
      id: record.id,
      employeeId: record.employee_id,
      date: record.date,
      totalMinutes: record.total_minutes,
      createdAt: record.created_at
    }));
  },

  // 초과근무 시간 입력/수정
  upsert: async (employeeId, date, totalMinutes) => {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('overtime_records')
      .upsert({
        employee_id: employeeId,
        date: date,
        total_minutes: totalMinutes
      })
      .select();
    
    if (error) throw error;
    
    const record = data[0];
    return {
      id: record.id,
      employeeId: record.employee_id,
      date: record.date,
      totalMinutes: record.total_minutes,
      createdAt: record.created_at
    };
  }
};

export const supabaseVacationAPI = {
  // 월별 휴가 사용 기록 조회
  getByMonth: async (month) => {
    if (!supabase) throw new Error('Supabase not configured');
    
    const [year, monthNum] = month.split('-');
    const startDate = `${year}-${monthNum}-01`;
    // 월의 마지막 날 정확히 계산
    const lastDay = new Date(year, monthNum, 0).getDate();
    const endDate = `${year}-${monthNum}-${lastDay.toString().padStart(2, '0')}`;
    
    const { data, error } = await supabase
      .from('vacation_records')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });
    
    if (error) throw error;
    
    return (data || []).map(record => ({
      id: record.id,
      employeeId: record.employee_id,
      date: record.date,
      totalMinutes: record.total_minutes,
      createdAt: record.created_at
    }));
  },

  // 휴가 시간 입력/수정
  upsert: async (employeeId, date, totalMinutes) => {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('vacation_records')
      .upsert({
        employee_id: employeeId,
        date: date,
        total_minutes: totalMinutes
      })
      .select();
    
    if (error) throw error;
    
    const record = data[0];
    return {
      id: record.id,
      employeeId: record.employee_id,
      date: record.date,
      totalMinutes: record.total_minutes,
      createdAt: record.created_at
    };
  }
};

export const supabaseHistoryAPI = {
  // 변경 이력 조회
  getAll: async () => {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('employee_changes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(record => ({
      id: record.id,
      employeeId: record.employee_id,
      action: record.action,
      employeeName: record.employee_name,
      createdAt: record.created_at
    }));
  }
};

export const supabaseSettingsAPI = {
  // 설정 조회
  get: async (key) => {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data?.value || null;
  },

  // 설정 저장
  set: async (key, value) => {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('settings')
      .upsert({
        key: key,
        value: value,
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (error) throw error;
    return data[0];
  }
};