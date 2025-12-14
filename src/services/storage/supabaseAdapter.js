import { StorageAdapter } from './StorageAdapter.js';
import HistoryPolicy from '../historyPolicy.js';
import { TimeUtils } from '../../utils/timeUtils.js';

/**
 * Supabase 기반 스토리지 어댑터
 */
export class SupabaseAdapter extends StorageAdapter {
  constructor(supabaseClient) {
    super();
    this.supabase = supabaseClient;
    this.tables = {
      employees: 'employees',
      overtimeRecords: 'overtime_records',
      vacationRecords: 'vacation_records',
      employeeChangeRecords: 'employee_changes',
      settings: 'settings',
      carryoverRecords: 'carryover_records'
    };
  }

  // ========== 유틸리티 메서드 ==========

  _handleError(error, operation) {
    console.error(`Supabase ${operation} 실패:`, error);
    throw new Error(`${operation} failed: ${error.message}`);
  }

  // ========== 직원 관련 메서드 ==========

  async getEmployees() {
    try {
      const { data, error } = await this.supabase
        .from(this.tables.employees)
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // _convertSupabaseEmployee 메서드를 사용하여 변환
      const converted = (data || []).map(emp => this._convertSupabaseEmployee(emp));
      return converted;
    } catch (error) {
      this._handleError(error, 'getEmployees');
    }
  }

  // 삭제된 직원 포함 전체 조회
  async getAllEmployeesIncludingDeleted() {
    try {
      const { data, error } = await this.supabase
        .from(this.tables.employees)
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const converted = (data || []).map(emp => this._convertSupabaseEmployee(emp));
      return converted;
    } catch (error) {
      this._handleError(error, 'getAllEmployeesIncludingDeleted');
    }
  }

  // 월별 직원 조회 (삭제 상태를 월 기준으로 판단)
  async getEmployeesForMonth(yearMonth) {
    try {
      // yearMonth 형식: "2025-11"
      const targetDate = `${yearMonth}-01`;
      
      // Supabase 함수 호출
      const { data, error } = await this.supabase
        .rpc('get_employees_for_month', { target_date: targetDate });

      if (error) throw error;
      
      // 활성 직원만 반환 (삭제된 직원은 overtime_records에서 가져옴)
      const activeEmployees = (data || [])
        .filter(emp => emp.is_active)
        .map(emp => ({
          id: emp.id,
          name: emp.name,
          createdAt: emp.created_at,
          deletedAt: emp.deleted_at,
          lastUpdatedName: emp.last_updated_name
        }));
      
      return activeEmployees;
    } catch (error) {
      console.warn('월별 직원 조회 실패, 기본 조회로 폴백:', error);
      // 폴백: 기본 getEmployees 사용
      return this.getEmployees();
    }
  }

  async addEmployee(employeeData) {
    try {
      // 로그인한 사용자 정보 가져오기
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }
      
      // 회사 정보 가져오기
      let companyName = null;
      let businessNumber = null;
      
      try {
        const { data: profile } = await this.supabase
          .from('profiles')
          .select('company_name, business_number')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          companyName = profile.company_name;
          businessNumber = profile.business_number;
        }
      } catch (profileError) {
        console.warn('프로필 정보 조회 실패:', profileError);
      }

      const newEmployee = {
        name: employeeData.name.trim(),
        birth_date: employeeData.birthDate, // 필수
        department: employeeData.department, // 필수
        hire_date: employeeData.hireDate, // 필수
        notes: employeeData.notes || null, // 선택
        company_name: companyName,
        business_number: businessNumber,
        user_id: user.id // 로그인한 사용자 ID
        // created_at과 last_updated_name은 DB default/trigger로 자동 생성
      };

      const { data, error } = await this.supabase
        .from(this.tables.employees)
        .insert([newEmployee])
        .select()
        .single();

      if (error) throw error;

      // 직원 변경 이력 기록
      const changeRecord = HistoryPolicy.createEmployeeChangeRecord(
        data.id, 
        '생성', 
        data.name
      );
      await this.saveEmployeeChangeRecord(changeRecord);

      return this._convertSupabaseEmployee(data);
    } catch (error) {
      this._handleError(error, 'addEmployee');
    }
  }

  async updateEmployee(id, employeeData) {
    try {
      // 디버깅용 로그 추가
      console.log('🔍 updateEmployee called with:', { id, employeeData });
      
      // 이전 직원 정보 조회 (old_name을 위해)
      const { data: currentEmployee, error: fetchError } = await this.supabase
        .from(this.tables.employees)
        .select('name')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        console.warn('이전 직원 정보 조회 실패:', fetchError);
      }
      
      const oldName = currentEmployee?.name || '알 수 없는 이름';
      
      // 업데이트할 필드 구성
      const updateData = {
        name: employeeData.name.trim()
      };
      
      // 선택 필드 추가 (제공된 경우에만)
      if (employeeData.birthDate !== undefined) updateData.birth_date = employeeData.birthDate;
      if (employeeData.department !== undefined) updateData.department = employeeData.department;
      if (employeeData.hireDate !== undefined) updateData.hire_date = employeeData.hireDate;
      if (employeeData.notes !== undefined) updateData.notes = employeeData.notes;
      
      const { data, error } = await this.supabase
        .from(this.tables.employees)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // 디버깅용 로그 추가
      console.log('📝 Employee updated in DB:', data);

      // 직원 변경 이력 기록 (이전 이름 포함)
      const changeRecord = HistoryPolicy.createEmployeeChangeRecord(
        id, 
        '수정', 
        employeeData.name.trim(),
        oldName // 이전 이름 추가
      );
      
      // 디버깅용 로그 추가
      console.log('📋 Change record to save:', changeRecord);
      
      await this.saveEmployeeChangeRecord(changeRecord);

      return this._convertSupabaseEmployee(data);
    } catch (error) {
      this._handleError(error, 'updateEmployee');
    }
  }

  async deleteEmployee(id) {
    try {
      // 삭제 전 현재 직원 정보 조회 (last_updated_name을 위해)
      const { data: currentEmployee, error: fetchError } = await this.supabase
        .from(this.tables.employees)
        .select('name, last_updated_name')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.warn('직원 정보 조회 실패:', fetchError);
      }

      // 소프트 삭제
      const { data, error } = await this.supabase
        .from(this.tables.employees)
        .update({ deleted_at: TimeUtils.getKoreanTimeAsUTC() }) // 한국시간 기준 UTC 사용
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // 직원 변경 이력 기록 (last_updated_name 우선 사용)
      const nameToRecord = currentEmployee?.last_updated_name || currentEmployee?.name || data.name;
      const changeRecord = HistoryPolicy.createEmployeeChangeRecord(
        id, 
        '삭제', 
        nameToRecord
      );
      await this.saveEmployeeChangeRecord(changeRecord);

      return this._convertSupabaseEmployee(data);
    } catch (error) {
      this._handleError(error, 'deleteEmployee');
    }
  }

  // ========== 시간 기록 관련 메서드 ==========

  async getOvertimeRecords(filters = {}) {
    try {
      let query = this.supabase
        .from(this.tables.overtimeRecords)
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.month) {
        const [year, month] = filters.month.split('-');
        const startDate = `${year}-${month}-01`;
        // 올바른 월말 계산
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
        const endDate = `${year}-${month}-${lastDay.toString().padStart(2, '0')}`;
        query = query.gte('date', startDate).lte('date', endDate);
      }

      if (filters.employeeId) {
        query = query.eq('employee_id', filters.employeeId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(this._convertSupabaseTimeRecord);
    } catch (error) {
      this._handleError(error, 'getOvertimeRecords');
    }
  }

  async getVacationRecords(filters = {}) {
    try {
      let query = this.supabase
        .from(this.tables.vacationRecords)
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.month) {
        const [year, month] = filters.month.split('-');
        const startDate = `${year}-${month}-01`;
        // 올바른 월말 계산
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
        const endDate = `${year}-${month}-${lastDay.toString().padStart(2, '0')}`;
        query = query.gte('date', startDate).lte('date', endDate);
      }

      if (filters.employeeId) {
        query = query.eq('employee_id', filters.employeeId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(this._convertSupabaseTimeRecord);
    } catch (error) {
      this._handleError(error, 'getVacationRecords');
    }
  }

  async saveTimeRecord(type, recordData) {
    const { employeeId, date, totalMinutes } = recordData;
    const tableName = type === 'overtime' ? this.tables.overtimeRecords : this.tables.vacationRecords;

    try {
      // 직원 정보 조회 (이름 포함)
      const { data: employeeData, error: employeeError } = await this.supabase
        .from(this.tables.employees)
        .select('name')
        .eq('id', employeeId)
        .single();

      if (employeeError) {
        console.warn(`직원 정보 조회 실패 (ID: ${employeeId}):`, employeeError);
      }

      const employeeName = employeeData?.name || '알 수 없는 직원';

      // 기존 기록들 조회 (히스토리 정책 적용을 위해)
      const existingRecords = await this[type === 'overtime' ? 'getOvertimeRecords' : 'getVacationRecords']({
        employeeId
      });

      // 히스토리 정책 적용
      const historyRecord = HistoryPolicy.createTimeRecord(
        employeeId, 
        date, 
        totalMinutes, 
        existingRecords
      );

      // 정책에 따라 기록하지 않을 경우
      if (!historyRecord) {
        return null;
      }

      // Supabase에 저장 (employee_name 포함)
      const supabaseRecord = {
        employee_id: employeeId,
        date: date,
        total_minutes: totalMinutes,
        employee_name: employeeName, // 직원 이름 추가
        description: historyRecord.description || null,
        created_at: historyRecord.createdAt
      };

      const { data, error } = await this.supabase
        .from(tableName)
        .insert([supabaseRecord])
        .select()
        .single();

      if (error) throw error;

      return this._convertSupabaseTimeRecord(data);
    } catch (error) {
      this._handleError(error, 'saveTimeRecord');
    }
  }

  async bulkSaveTimeRecords(type, updates) {
    const tableName = type === 'overtime' ? this.tables.overtimeRecords : this.tables.vacationRecords;

    try {
      // 대량 업데이트 히스토리 생성
      const historyRecords = HistoryPolicy.createBulkRecords(updates);
      
      // 직원 이름 조회 (대량 업데이트에 사용된 모든 직원 ID)
      const employeeIds = [...new Set(historyRecords.map(record => record.employeeId))];
      const { data: employeesData, error: employeesError } = await this.supabase
        .from(this.tables.employees)
        .select('id, name')
        .in('id', employeeIds);

      if (employeesError) {
        console.warn('직원 정보 대량 조회 실패:', employeesError);
      }

      // 직원 ID -> 이름 매핑
      const employeeNameMap = {};
      (employeesData || []).forEach(emp => {
        employeeNameMap[emp.id] = emp.name;
      });
      
      // Supabase 형식으로 변환 (employee_name 포함)
      const supabaseRecords = historyRecords.map(record => ({
        employee_id: record.employeeId,
        date: record.date,
        total_minutes: record.totalMinutes,
        employee_name: employeeNameMap[record.employeeId] || '알 수 없는 직원', // 직원 이름 추가
        description: record.description,
        created_at: record.createdAt
      }));

      const { data, error } = await this.supabase
        .from(tableName)
        .insert(supabaseRecords)
        .select();

      if (error) throw error;

      return (data || []).map(this._convertSupabaseTimeRecord);
    } catch (error) {
      this._handleError(error, 'bulkSaveTimeRecords');
    }
  }

  // ========== 변경 이력 관련 메서드 ==========

  async getEmployeeChangeRecords(filters = {}) {
    try {
      let query = this.supabase
        .from(this.tables.employeeChangeRecords)
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.month) {
        const [year, month] = filters.month.split('-');
        const startDate = `${year}-${month}-01`;
        const endDate = `${year}-${month}-31`;
        query = query.gte('created_at', startDate).lt('created_at', `${year}-${String(parseInt(month) + 1).padStart(2, '0')}-01`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(this._convertSupabaseChangeRecord);
    } catch (error) {
      this._handleError(error, 'getEmployeeChangeRecords');
    }
  }

  async saveEmployeeChangeRecord(record) {
    try {
      const supabaseRecord = {
        employee_id: record.employeeId,
        action: record.action,
        employee_name: record.employeeName,
        old_name: record.oldName || null, // old_name 필드 추가
        created_at: record.createdAt
      };

      const { data, error } = await this.supabase
        .from(this.tables.employeeChangeRecords)
        .insert([supabaseRecord])
        .select()
        .single();

      if (error) throw error;

      return this._convertSupabaseChangeRecord(data);
    } catch (error) {
      this._handleError(error, 'saveEmployeeChangeRecord');
    }
  }

  // ========== 설정 관련 메서드 ==========

  async getSettings() {
    try {
      const { data, error } = await this.supabase
        .from(this.tables.settings)
        .select('multiplier')
        .eq('key', 'app_settings')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return data ? { multiplier: data.multiplier } : { multiplier: 1.0 };
    } catch (error) {
      console.warn('Supabase settings error, using localStorage fallback:', error.message);
      // localStorage 폴백
      const localSettings = localStorage.getItem('overtime-settings');
      return localSettings ? JSON.parse(localSettings) : { multiplier: 1.0 };
    }
  }

  async saveSettings(settings) {
    try {
      const { data, error } = await this.supabase
        .from(this.tables.settings)
        .upsert({ 
          key: 'app_settings',
          multiplier: settings.multiplier,
          value: { multiplier: settings.multiplier },
          updated_at: TimeUtils.getKoreanTimeAsUTC() // 한국시간 기준 UTC 사용
        }, {
          onConflict: 'key'
        })
        .select('multiplier')
        .single();

      if (error) throw error;

      return { multiplier: data.multiplier };
    } catch (error) {
      console.warn('Supabase settings save failed, using localStorage fallback:', error.message);
      // localStorage 폴백
      localStorage.setItem('overtime-settings', JSON.stringify(settings));
      return settings;
    }
  }

  async updateSettings(settings) {
    const currentSettings = await this.getSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    return await this.saveSettings(updatedSettings);
  }

  // ========== 이월 관련 메서드 ==========

  async getCarryoverRecords(filters = {}) {
    try {
      let query = this.supabase
        .from(this.tables.carryoverRecords)
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.year) {
        query = query.eq('year', filters.year);
      }

      if (filters.month) {
        query = query.eq('month', filters.month);
      }

      if (filters.employeeId) {
        query = query.eq('employee_id', filters.employeeId);
      }

      // yearMonth 형식 (YYYY-MM) 지원
      if (filters.yearMonth) {
        const [year, month] = filters.yearMonth.split('-');
        query = query.eq('year', parseInt(year)).eq('month', parseInt(month));
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(this._convertSupabaseCarryoverRecord);
    } catch (error) {
      this._handleError(error, 'getCarryoverRecords');
    }
  }

  async createCarryoverRecord(carryoverData) {
    try {
      // 로그인한 사용자 정보 가져오기
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      const supabaseRecord = {
        employee_id: carryoverData.employeeId,
        year: carryoverData.year,
        month: carryoverData.month,
        carryover_remaining_minutes: carryoverData.carryoverRemainingMinutes,
        source_month_multiplier: carryoverData.sourceMonthMultiplier,
        user_id: user.id
      };

      const { data, error } = await this.supabase
        .from(this.tables.carryoverRecords)
        .insert([supabaseRecord])
        .select()
        .single();

      if (error) throw error;

      return this._convertSupabaseCarryoverRecord(data);
    } catch (error) {
      this._handleError(error, 'createCarryoverRecord');
    }
  }

  async updateCarryoverRecord(id, carryoverData) {
    try {
      const updateData = {
        carryover_remaining_minutes: carryoverData.carryoverRemainingMinutes,
        updated_at: TimeUtils.getKoreanTimeAsUTC()
      };

      if (carryoverData.sourceMonthMultiplier !== undefined) {
        updateData.source_month_multiplier = carryoverData.sourceMonthMultiplier;
      }

      const { data, error } = await this.supabase
        .from(this.tables.carryoverRecords)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return this._convertSupabaseCarryoverRecord(data);
    } catch (error) {
      this._handleError(error, 'updateCarryoverRecord');
    }
  }

  async deleteCarryoverRecord(id) {
    try {
      const { error } = await this.supabase
        .from(this.tables.carryoverRecords)
        .delete()
        .eq('id', id);

      if (error) throw error;

      return true;
    } catch (error) {
      this._handleError(error, 'deleteCarryoverRecord');
    }
  }

  // ========== 캐시 관리 ==========

  clearCache() {
    // Supabase는 서버 기반이므로 로컬 캐시가 있다면 여기서 클리어
    // 현재는 별도 캐시 구현이 없으므로 빈 구현
  }

  // ========== 데이터 변환 유틸리티 ==========

  _convertSupabaseEmployee(supabaseData) {
    return {
      id: supabaseData.id,
      name: supabaseData.name,
      birthDate: supabaseData.birth_date,
      department: supabaseData.department,
      hireDate: supabaseData.hire_date,
      notes: supabaseData.notes,
      companyName: supabaseData.company_name,
      businessNumber: supabaseData.business_number,
      createdAt: supabaseData.created_at,
      deletedAt: supabaseData.deleted_at,
      lastUpdatedName: supabaseData.last_updated_name
    };
  }

  _convertSupabaseTimeRecord(supabaseData) {
    return {
      id: supabaseData.id,
      employeeId: supabaseData.employee_id,
      employeeName: supabaseData.employee_name, // 직원 이름 추가
      date: supabaseData.date,
      totalMinutes: supabaseData.total_minutes,
      description: supabaseData.description,
      createdAt: supabaseData.created_at
    };
  }

  _convertSupabaseChangeRecord(supabaseData) {
    return {
      id: supabaseData.id,
      employeeId: supabaseData.employee_id,
      action: supabaseData.action,
      employeeName: supabaseData.employee_name,
      oldName: supabaseData.old_name, // old_name 필드 추가
      createdAt: supabaseData.created_at
    };
  }

  _convertSupabaseCarryoverRecord(supabaseData) {
    return {
      id: supabaseData.id,
      employeeId: supabaseData.employee_id,
      year: supabaseData.year,
      month: supabaseData.month,
      carryoverRemainingMinutes: supabaseData.carryover_remaining_minutes,
      sourceMonthMultiplier: supabaseData.source_month_multiplier,
      userId: supabaseData.user_id,
      createdAt: supabaseData.created_at,
      updatedAt: supabaseData.updated_at
    };
  }

  // ========== Multi-tenancy 회사 관련 메서드 ==========

  /**
   * 현재 사용자의 회사 정보 조회
   */
  async getMyCompany() {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      if (!profile.company_id) return null;

      const { data: company, error: companyError } = await this.supabase
        .from('companies')
        .select('*')
        .eq('id', profile.company_id)
        .single();

      if (companyError) throw companyError;

      return {
        id: company.id,
        businessNumber: company.business_number,
        companyName: company.company_name,
        ownerId: company.owner_id,
        createdAt: company.created_at
      };
    } catch (error) {
      this._handleError(error, 'getMyCompany');
    }
  }

  /**
   * 새 회사 생성
   */
  async createCompany(businessNumber, companyName) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      const { data: existing } = await this.supabase
        .from('companies')
        .select('id, company_name')
        .eq('business_number', businessNumber)
        .single();

      if (existing) {
        throw new Error(`이미 등록된 사업자번호입니다. 회사명: ${existing.company_name}`);
      }

      const { data: newCompany, error: companyError } = await this.supabase
        .from('companies')
        .insert({
          business_number: businessNumber,
          company_name: companyName,
          owner_id: user.id
        })
        .select()
        .single();

      if (companyError) throw companyError;

      const { error: profileError } = await this.supabase
        .from('profiles')
        .update({ 
          company_id: newCompany.id,
          company_name: companyName,
          business_number: businessNumber,
          role: 'owner'
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      return {
        id: newCompany.id,
        businessNumber: newCompany.business_number,
        companyName: newCompany.company_name,
        ownerId: newCompany.owner_id
      };
    } catch (error) {
      this._handleError(error, 'createCompany');
    }
  }

  /**
   * 초대 코드 생성
   */
  async createInviteCode(email) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      const { data: profile } = await this.supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile.company_id) {
        throw new Error('회사 정보가 없습니다. 먼저 회사를 등록해주세요.');
      }

      // 이미 동일 이메일로 활성 초대 코드가 있는지 확인
      const { data: pendingInvite } = await this.supabase
        .from('company_invites')
        .select('*')
        .eq('invited_email', email)
        .eq('company_id', profile.company_id)
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle(); // single() 대신 maybeSingle() 사용

      // 기존 초대 코드가 있으면 무효화
      if (pendingInvite) {
        console.log('기존 초대 코드 무효화:', pendingInvite.invite_code);
        await this.supabase
          .from('company_invites')
          .update({ is_used: true })
          .eq('id', pendingInvite.id);
      }

      // 새 초대 코드 생성
      const inviteCode = this._generateInviteCode();

      const { data: invite, error } = await this.supabase
        .from('company_invites')
        .insert({
          company_id: profile.company_id,
          invite_code: inviteCode,
          invited_email: email,
          created_by: user.id,
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return {
        inviteCode: invite.invite_code,
        email: invite.invited_email,
        expiresAt: invite.expires_at
      };
    } catch (error) {
      this._handleError(error, 'createInviteCode');
    }
  }

  /**
   * 초대 코드 검증
   */
  async validateInviteCode(code, email) {
    try {
      const { data: invite, error } = await this.supabase
        .from('company_invites')
        .select('*, companies(*)')
        .eq('invite_code', code.toUpperCase())
        .single();

      if (error || !invite) {
        throw new Error('유효하지 않은 초대 코드입니다.');
      }

      if (invite.invited_email !== email) {
        throw new Error('초대받은 이메일과 가입 이메일이 다릅니다.');
      }

      if (new Date(invite.expires_at) < new Date()) {
        throw new Error('초대 코드가 만료되었습니다.');
      }

      if (invite.is_used) {
        throw new Error('이미 사용된 초대 코드입니다.');
      }

      return {
        companyId: invite.company_id,
        companyName: invite.companies.company_name,
        businessNumber: invite.companies.business_number,
        inviteId: invite.id
      };
    } catch (error) {
      this._handleError(error, 'validateInviteCode');
    }
  }

  /**
   * 초대 코드 사용 (회사 참여)
   */
  async useInviteCode(inviteId) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      const { data: invite } = await this.supabase
        .from('company_invites')
        .select('company_id, is_used')
        .eq('id', inviteId)
        .single();

      if (!invite || invite.is_used) {
        throw new Error('유효하지 않거나 이미 사용된 초대입니다.');
      }

      const { error: profileError } = await this.supabase
        .from('profiles')
        .update({ 
          company_id: invite.company_id,
          role: 'admin'
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      const { error: inviteError } = await this.supabase
        .from('company_invites')
        .update({
          is_used: true,
          used_at: new Date().toISOString(),
          used_by: user.id
        })
        .eq('id', inviteId);

      if (inviteError) throw inviteError;

      return { success: true };
    } catch (error) {
      this._handleError(error, 'useInviteCode');
    }
  }

  /**
   * 활성 초대 코드 목록 조회
   */
  async getActiveInviteCodes() {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      const { data: profile } = await this.supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile.company_id) {
        return [];
      }

      const { data: invites, error } = await this.supabase
        .from('company_invites')
        .select('*')
        .eq('company_id', profile.company_id)
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (invites || []).map(invite => ({
        id: invite.id,
        inviteCode: invite.invite_code,
        email: invite.invited_email,
        createdAt: invite.created_at,
        expiresAt: invite.expires_at
      }));
    } catch (error) {
      this._handleError(error, 'getActiveInviteCodes');
    }
  }

  /**
   * 초대 코드 생성 헬퍼
   */
  _generateInviteCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}

export default SupabaseAdapter;
