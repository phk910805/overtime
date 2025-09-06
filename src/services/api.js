import { supabase } from '../lib/supabase'

// ========== EMPLOYEE API ==========
export const employeeAPI = {
  // 모든 직원 조회 (삭제되지 않은 직원만)
  getAll: async () => {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return (data || []).map(employee => ({
      id: employee.id,
      name: employee.name,
      createdAt: employee.created_at
    }))
  },

  // 직원 생성
  create: async (name) => {
    const { data, error } = await supabase
      .from('employees')
      .insert([{ name: name.trim() }])
      .select()
    
    if (error) throw error
    
    // 직원 변경 이력 추가
    const employee = data[0]
    await supabase
      .from('employee_changes')
      .insert([{
        employee_id: employee.id,
        action: '생성',
        employee_name: employee.name
      }])
    
    return {
      id: employee.id,
      name: employee.name,
      createdAt: employee.created_at
    }
  },

  // 직원 수정
  update: async (id, name) => {
    const { data, error } = await supabase
      .from('employees')
      .update({ name: name.trim() })
      .eq('id', id)
      .select()
    
    if (error) throw error
    
    // 직원 변경 이력 추가
    const employee = data[0]
    await supabase
      .from('employee_changes')
      .insert([{
        employee_id: employee.id,
        action: '수정',
        employee_name: employee.name
      }])
    
    return {
      id: employee.id,
      name: employee.name,
      createdAt: employee.created_at
    }
  },

  // 직원 삭제 (소프트 삭제)
  delete: async (id) => {
    // 직원 정보 먼저 가져오기
    const { data: employee } = await supabase
      .from('employees')
      .select('name')
      .eq('id', id)
      .single()
    
    // 소프트 삭제
    const { data, error } = await supabase
      .from('employees')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
    
    if (error) throw error
    
    // 직원 변경 이력 추가
    await supabase
      .from('employee_changes')
      .insert([{
        employee_id: id,
        action: '삭제',
        employee_name: employee?.name || '알 수 없음'
      }])
    
    return {
      id: data[0].id,
      name: data[0].name,
      createdAt: data[0].created_at
    }
  }
}

// ========== OVERTIME API ==========
export const overtimeAPI = {
  // 월별 초과근무 기록 조회
  getByMonth: async (month) => {
    const [year, monthNum] = month.split('-')
    const startDate = `${year}-${monthNum}-01`
    const endDate = `${year}-${monthNum}-31`
    
    const { data, error } = await supabase
      .from('overtime_records')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })
    
    if (error) throw error
    return (data || []).map(record => ({
      id: record.id,
      employeeId: record.employee_id,
      date: record.date,
      totalMinutes: record.total_minutes,
      createdAt: record.created_at
    }))
  },

  // 초과근무 시간 입력/수정
  upsert: async (employeeId, date, totalMinutes) => {
    const { data, error } = await supabase
      .from('overtime_records')
      .upsert({
        employee_id: employeeId,
        date: date,
        total_minutes: totalMinutes
      })
      .select()
    
    if (error) throw error
    
    const record = data[0]
    return {
      id: record.id,
      employeeId: record.employee_id,
      date: record.date,
      totalMinutes: record.total_minutes,
      createdAt: record.created_at
    }
  }
}

// ========== VACATION API ==========
export const vacationAPI = {
  // 월별 휴가 사용 기록 조회
  getByMonth: async (month) => {
    const [year, monthNum] = month.split('-')
    const startDate = `${year}-${monthNum}-01`
    const endDate = `${year}-${monthNum}-31`
    
    const { data, error } = await supabase
      .from('vacation_records')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })
    
    if (error) throw error
    return (data || []).map(record => ({
      id: record.id,
      employeeId: record.employee_id,
      date: record.date,
      totalMinutes: record.total_minutes,
      createdAt: record.created_at
    }))
  },

  // 휴가 시간 입력/수정
  upsert: async (employeeId, date, totalMinutes) => {
    const { data, error } = await supabase
      .from('vacation_records')
      .upsert({
        employee_id: employeeId,
        date: date,
        total_minutes: totalMinutes
      })
      .select()
    
    if (error) throw error
    
    const record = data[0]
    return {
      id: record.id,
      employeeId: record.employee_id,
      date: record.date,
      totalMinutes: record.total_minutes,
      createdAt: record.created_at
    }
  }
}

// ========== HISTORY API ==========
export const historyAPI = {
  // 변경 이력 조회
  getAll: async () => {
    const { data, error } = await supabase
      .from('employee_changes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return (data || []).map(record => ({
      id: record.id,
      employeeId: record.employee_id,
      action: record.action,
      employeeName: record.employee_name,
      createdAt: record.created_at
    }))
  }
}

// ========== SETTINGS API ==========
export const settingsAPI = {
  // 설정 조회
  get: async (key) => {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data?.value || null
  },

  // 설정 저장
  set: async (key, value) => {
    const { data, error } = await supabase
      .from('settings')
      .upsert({
        key: key,
        value: value,
        updated_at: new Date().toISOString()
      })
      .select()
    
    if (error) throw error
    return {
      id: data[0].id,
      key: data[0].key,
      value: data[0].value,
      updatedAt: data[0].updated_at
    }
  },

  // 모든 설정 조회
  getAll: async () => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
    
    if (error) throw error
    return (data || []).map(setting => ({
      id: setting.id,
      key: setting.key,
      value: setting.value,
      updatedAt: setting.updated_at
    }))
  }
}
