import { StorageAdapter } from './StorageAdapter.js';
import HistoryPolicy from '../historyPolicy.js';
import { TimeUtils } from '../../utils/timeUtils.js';

// 캠시 Duration 상수 (성능 최적화)
const CACHE_DURATIONS = {
  SETTINGS: 10 * 60 * 1000,  // 10분
  PROFILE: 5 * 60 * 1000,    // 5분
};

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
    
    // 캐시 추가
    this._settingsCache = null;
    this._settingsCacheTime = 0;
    this.SETTINGS_CACHE_DURATION = CACHE_DURATIONS.SETTINGS;
    
    // profiles 캐시 추가
    this._profileCache = null;
    this._profileCacheTime = 0;
    this.PROFILE_CACHE_DURATION = CACHE_DURATIONS.PROFILE;
  }

  // ========== 유틸리티 메서드 ==========

  _handleError(error, operation) {
    console.error(`Supabase ${operation} 실패:`, error);
    throw new Error(`${operation} failed: ${error.message}`);
  }

  /**
   * 프로필 정보 가져오기 (캐시 사용)
   */
  async _getProfileInfo() {
    const now = Date.now();
    
    // 캐시가 유효하면 재사용
    if (this._profileCache && 
        (now - this._profileCacheTime) < this.PROFILE_CACHE_DURATION) {
      return this._profileCache;
    }

    // 캐시가 없거나 만료됨 → DB 조회
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    const { data: profile, error } = await this.supabase
      .from('profiles')
      .select('company_id, company_name, business_number, role, permission')
      .eq('id', user.id)
      .single();

    if (error) {
      console.warn('프로필 정보 조회 실패:', error);
      return null;
    }

    this._profileCache = profile;
    this._profileCacheTime = now;
    
    return profile;
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

      // 회사 정보 가져오기 (캐시 사용)
      const profile = await this._getProfileInfo();

      // linked_user_id가 있으면 기존 직원 확인 (활성 → 반환, 삭제 → 복원)
      if (employeeData.linkedUserId) {
        // 활성 직원이 이미 연결되어 있으면 그대로 반환
        const { data: activeEmp } = await this.supabase
          .from(this.tables.employees)
          .select('*')
          .eq('linked_user_id', employeeData.linkedUserId)
          .eq('company_id', profile?.company_id)
          .is('deleted_at', null)
          .maybeSingle();

        if (activeEmp) {
          return this._convertSupabaseEmployee(activeEmp);
        }

        // soft-deleted된 직원이 있으면 복원
        const { data: deletedEmp } = await this.supabase
          .from(this.tables.employees)
          .select('*')
          .eq('linked_user_id', employeeData.linkedUserId)
          .eq('company_id', profile?.company_id)
          .not('deleted_at', 'is', null)
          .maybeSingle();

        if (deletedEmp) {
          const { data: restored, error: restoreErr } = await this.supabase
            .from(this.tables.employees)
            .update({
              deleted_at: null,
              name: employeeData.name.trim(),
              department: employeeData.department,
              hire_date: employeeData.hireDate,
              notes: employeeData.notes || null
            })
            .eq('id', deletedEmp.id)
            .select()
            .single();

          if (restoreErr) throw restoreErr;

          const changeRecord = HistoryPolicy.createEmployeeChangeRecord(
            restored.id, '복원', restored.name
          );
          await this.saveEmployeeChangeRecord(changeRecord);

          return this._convertSupabaseEmployee(restored);
        }
      }

      const newEmployee = {
        name: employeeData.name.trim(),
        birth_date: employeeData.birthDate,
        department: employeeData.department,
        hire_date: employeeData.hireDate,
        notes: employeeData.notes || null,
        company_id: profile?.company_id,
        company_name: profile?.company_name,
        business_number: profile?.business_number,
        user_id: user.id,
        linked_user_id: employeeData.linkedUserId || null
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
      // 로그인한 사용자 정보 가져오기
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      // 회사 ID 가져오기 (캐시 사용)
      const profile = await this._getProfileInfo();

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

      // Supabase에 저장 (employee_name, company_id 포함)
      const supabaseRecord = {
        employee_id: employeeId,
        date: date,
        total_minutes: totalMinutes,
        employee_name: employeeName,
        company_id: profile?.company_id,
        user_id: user.id,
        description: historyRecord.description || null,
        created_at: historyRecord.createdAt,
        status: recordData.status || 'approved',
        submitted_by: recordData.submittedBy || user.id,
        submit_reason: recordData.submitReason || null
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
      // 로그인한 사용자 정보 가져오기
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      // 회사 ID 가져오기 (캐시 사용)
      const profile = await this._getProfileInfo();

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
      
      // Supabase 형식으로 변환 (employee_name, company_id 포함)
      const supabaseRecords = historyRecords.map(record => ({
        employee_id: record.employeeId,
        date: record.date,
        total_minutes: record.totalMinutes,
        employee_name: employeeNameMap[record.employeeId] || '알 수 없는 직원',
        company_id: profile?.company_id,
        user_id: user.id,
        description: record.description,
        created_at: record.createdAt,
        status: record.status || 'approved',
        submitted_by: record.submittedBy || user.id,
        submit_reason: record.submitReason || null
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
      // 로그인한 사용자 정보 가져오기
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      // 회사 ID 가져오기 (캐시 사용)
      const profile = await this._getProfileInfo();

      const supabaseRecord = {
        employee_id: record.employeeId,
        action: record.action,
        employee_name: record.employeeName,
        old_name: record.oldName || null, // old_name 필드 추가
        company_id: profile?.company_id, // 회사 ID 추가
        user_id: user.id, // 사용자 ID 추가
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
      // 캐시 확인
      const now = Date.now();
      if (this._settingsCache && 
          (now - this._settingsCacheTime) < this.SETTINGS_CACHE_DURATION) {
        return this._settingsCache;
      }

      // 로그인한 사용자 정보 가져오기
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      // 회사 ID 가져오기 (캐시 사용)
      const profile = await this._getProfileInfo();

      const { data, error } = await this.supabase
        .from(this.tables.settings)
        .select('multiplier, value')
        .eq('key', 'app_settings')
        .eq('company_id', profile?.company_id)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      const jsonValue = data?.value || {};
      const settings = data ? {
        multiplier: data.multiplier,
        approvalMode: jsonValue.approval_mode || 'manual',
        employeeInputScope: jsonValue.employee_input_scope || 'self'
      } : { multiplier: 1.0, approvalMode: 'manual', employeeInputScope: 'self' };
      
      // 캐시 저장
      this._settingsCache = settings;
      this._settingsCacheTime = now;
      
      return settings;
    } catch (error) {
      console.warn('Supabase settings error, using localStorage fallback:', error.message);
      // localStorage 폴백
      const localSettings = localStorage.getItem('overtime-settings');
      return localSettings ? JSON.parse(localSettings) : { multiplier: 1.0 };
    }
  }

  async saveSettings(settings) {
    try {
      // 캐시 무효화
      this._settingsCache = null;
      this._settingsCacheTime = 0;

      // 로그인한 사용자 정보 가져오기
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      // 회사 ID 가져오기 (캐시 사용)
      const profile = await this._getProfileInfo();

      const valueJsonb = {
        multiplier: settings.multiplier,
        approval_mode: settings.approvalMode || 'manual',
        employee_input_scope: settings.employeeInputScope || 'self'
      };

      const { data, error } = await this.supabase
        .from(this.tables.settings)
        .upsert({
          key: 'app_settings',
          multiplier: settings.multiplier,
          value: valueJsonb,
          company_id: profile?.company_id,
          updated_at: TimeUtils.getKoreanTimeAsUTC()
        }, {
          onConflict: 'key,company_id'
        })
        .select('multiplier, value')
        .single();

      if (error) throw error;

      const jsonValue = data?.value || {};
      return {
        multiplier: data.multiplier,
        approvalMode: jsonValue.approval_mode || 'manual',
        employeeInputScope: jsonValue.employee_input_scope || 'self'
      };
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

      // 회사 ID 가져오기 (캐시 사용)
      const profile = await this._getProfileInfo();

      const supabaseRecord = {
        employee_id: carryoverData.employeeId,
        year: carryoverData.year,
        month: carryoverData.month,
        carryover_remaining_minutes: carryoverData.carryoverRemainingMinutes,
        source_month_multiplier: carryoverData.sourceMonthMultiplier,
        company_id: profile?.company_id, // 회사 ID 추가
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
    // settings 캐시 초기화
    this._settingsCache = null;
    this._settingsCacheTime = 0;
    // profile 캐시 초기화
    this._profileCache = null;
    this._profileCacheTime = 0;
  }

  /**
   * 프로필 캐시만 초기화 (로그아웃 시 사용)
   */
  clearProfileCache() {
    this._profileCache = null;
    this._profileCacheTime = 0;
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
      lastUpdatedName: supabaseData.last_updated_name,
      linkedUserId: supabaseData.linked_user_id || null
    };
  }

  _convertSupabaseTimeRecord(supabaseData) {
    return {
      id: supabaseData.id,
      employeeId: supabaseData.employee_id,
      employeeName: supabaseData.employee_name,
      date: supabaseData.date,
      totalMinutes: supabaseData.total_minutes,
      description: supabaseData.description,
      createdAt: supabaseData.created_at,
      status: supabaseData.status || 'approved',
      submittedBy: supabaseData.submitted_by || null,
      reviewedBy: supabaseData.reviewed_by || null,
      reviewedAt: supabaseData.reviewed_at || null,
      reviewNote: supabaseData.review_note || null,
      submitReason: supabaseData.submit_reason || null
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
        createdAt: company.created_at,
        trialStartedAt: company.trial_started_at,
        trialEndsAt: company.trial_ends_at
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

      // 사업자번호 중복 체크
      const { data: existing, error: checkError } = await this.supabase
        .from('companies')
        .select('id, company_name')
        .eq('business_number', businessNumber)
        .maybeSingle(); // single() 대신 maybeSingle() 사용

      // 406 에러 무시 (RLS 정책 문제)
      if (checkError && checkError.code !== 'PGRST116') {
        console.warn('중복 체크 실패 (무시):', checkError);
      }

      if (existing) {
        throw new Error(`이미 등록된 사업자등록번호입니다.\n- 회사명: ${existing.company_name}\n- 사업자등록번호: ${businessNumber}`);
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
  async createInviteCode(email, role = 'employee', permission = 'editor') {
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
          invited_role: role,
          invited_permission: permission,
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

      const { data, error } = await this.supabase
        .rpc('use_invite_and_set_role', {
          p_invite_id: inviteId,
          p_user_id: user.id
        });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      // 프로필 캐시 무효화
      this._profileCache = null;
      this._profileCacheTime = 0;

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
        invitedRole: invite.invited_role || 'employee',
        invitedPermission: invite.invited_permission || 'editor',
        createdAt: invite.created_at,
        expiresAt: invite.expires_at
      }));
    } catch (error) {
      this._handleError(error, 'getActiveInviteCodes');
    }
  }

  /**
   * 회사 팀원 목록 조회
   */
  async getCompanyMembers() {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      const { data, error } = await this.supabase.rpc('get_company_members', {
        p_user_id: user.id
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      this._handleError(error, 'getCompanyMembers');
    }
  }

  /**
   * 팀원 역할/권한 변경 (소유자 전용)
   */
  async updateMemberRole(memberId, newRole, newPermission) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      const { data, error } = await this.supabase.rpc('update_member_role', {
        p_owner_id: user.id,
        p_member_id: memberId,
        p_new_role: newRole,
        p_new_permission: newPermission
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      return data;
    } catch (error) {
      this._handleError(error, 'updateMemberRole');
    }
  }

  /**
   * 팀원 내보내기 (소유자 전용)
   */
  async removeMember(memberId) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const { data, error } = await this.supabase.rpc('remove_company_member', {
        p_owner_id: user.id,
        p_member_id: memberId
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      return data;
    } catch (error) {
      this._handleError(error, 'removeMember');
    }
  }

  /**
   * 탈퇴 대상의 대기 중(pending) 기록 수 조회
   */
  async getMemberPendingCount(memberId) {
    try {
      const { company_id } = await this._getProfileInfo();
      if (!company_id) throw new Error('회사 정보가 없습니다.');

      // 해당 멤버에 연결된 직원 찾기
      const { data: employee, error: empError } = await this.supabase
        .from('employees')
        .select('id')
        .eq('linked_user_id', memberId)
        .eq('company_id', company_id)
        .is('deleted_at', null)
        .maybeSingle();

      if (empError) throw empError;
      if (!employee) return 0;

      // pending 초과근무 + 휴가 기록 수 조회
      const [overtimeRes, vacationRes] = await Promise.all([
        this.supabase
          .from('overtime_records')
          .select('id', { count: 'exact', head: true })
          .eq('employee_id', employee.id)
          .eq('company_id', company_id)
          .eq('status', 'pending'),
        this.supabase
          .from('vacation_records')
          .select('id', { count: 'exact', head: true })
          .eq('employee_id', employee.id)
          .eq('company_id', company_id)
          .eq('status', 'pending')
      ]);

      if (overtimeRes.error) throw overtimeRes.error;
      if (vacationRes.error) throw vacationRes.error;

      return (overtimeRes.count || 0) + (vacationRes.count || 0);
    } catch (error) {
      this._handleError(error, 'getMemberPendingCount');
    }
  }

  /**
   * 구성원 Auth 계정 삭제 (Edge Function 호출)
   */
  async withdrawMemberAuth(memberId) {
    try {
      const { data, error } = await this.supabase.functions.invoke('withdraw-member', {
        body: { memberId }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    } catch (error) {
      this._handleError(error, 'withdrawMemberAuth');
    }
  }

  // ========== 초대 링크 기반 메서드 ==========

  /**
   * 초대 링크 생성 (또는 갱신)
   */
  async createInviteLink() {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const { data, error } = await this.supabase.rpc('create_or_refresh_invite_link', {
        p_user_id: user.id
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return { token: data.token, expiresAt: data.expires_at };
    } catch (error) {
      this._handleError(error, 'createInviteLink');
    }
  }

  /**
   * 초대 토큰 유효성 검증 (공개 — 로그인 불필요)
   */
  async validateInviteToken(token) {
    try {
      const { data, error } = await this.supabase.rpc('validate_invite_token', {
        p_token: token
      });

      if (error) throw error;
      return data;
    } catch (error) {
      this._handleError(error, 'validateInviteToken');
    }
  }

  /**
   * 초대 링크로 회사 참여 (pending 상태)
   */
  async joinViaInvite(token) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const { data, error } = await this.supabase.rpc('join_company_via_invite', {
        p_user_id: user.id,
        p_token: token
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      // 프로필 캐시 무효화
      this._profileCache = null;
      this._profileCacheTime = 0;

      return data;
    } catch (error) {
      this._handleError(error, 'joinViaInvite');
    }
  }

  /**
   * 현재 활성 초대 링크 조회
   */
  async getActiveInviteLink() {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const profile = await this._getProfileInfo();
      if (!profile?.company_id) return null;

      const { data, error } = await this.supabase
        .from('company_invites')
        .select('invite_token, expires_at')
        .eq('company_id', profile.company_id)
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return { token: data.invite_token, expiresAt: data.expires_at };
    } catch (error) {
      this._handleError(error, 'getActiveInviteLink');
    }
  }

  /**
   * 참여 대기 중인 멤버 목록 조회
   */
  async getPendingMembers() {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const { data, error } = await this.supabase.rpc('get_pending_members', {
        p_admin_id: user.id
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      this._handleError(error, 'getPendingMembers');
    }
  }

  /**
   * 참여 요청 승인
   */
  async approveJoinRequest(memberId, role, permission) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const { data, error } = await this.supabase.rpc('approve_join_request', {
        p_admin_id: user.id,
        p_member_id: memberId,
        p_role: role,
        p_permission: permission
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return data;
    } catch (error) {
      this._handleError(error, 'approveJoinRequest');
    }
  }

  /**
   * 참여 요청 거절
   */
  async rejectJoinRequest(memberId) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const { data, error } = await this.supabase.rpc('reject_join_request', {
        p_admin_id: user.id,
        p_member_id: memberId
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return data;
    } catch (error) {
      this._handleError(error, 'rejectJoinRequest');
    }
  }

  // ========== 직원-프로필 연결 메서드 ==========

  /**
   * 직원을 사용자 프로필에 연결
   */
  async linkEmployeeToProfile(employeeId, userId) {
    try {
      const { data, error } = await this.supabase
        .from(this.tables.employees)
        .update({ linked_user_id: userId })
        .eq('id', employeeId)
        .select()
        .single();

      if (error) throw error;
      return this._convertSupabaseEmployee(data);
    } catch (error) {
      this._handleError(error, 'linkEmployeeToProfile');
    }
  }

  /**
   * 직원-프로필 연결 해제
   */
  async unlinkEmployeeFromProfile(employeeId) {
    try {
      const { data, error } = await this.supabase
        .from(this.tables.employees)
        .update({ linked_user_id: null })
        .eq('id', employeeId)
        .select()
        .single();

      if (error) throw error;
      return this._convertSupabaseEmployee(data);
    } catch (error) {
      this._handleError(error, 'unlinkEmployeeFromProfile');
    }
  }

  /**
   * 사용자 ID로 연결된 직원 조회
   */
  async getLinkedEmployeeForUser(userId) {
    try {
      const { data, error } = await this.supabase
        .from(this.tables.employees)
        .select('*')
        .eq('linked_user_id', userId)
        .is('deleted_at', null)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      return this._convertSupabaseEmployee(data);
    } catch (error) {
      this._handleError(error, 'getLinkedEmployeeForUser');
    }
  }

  // ========== 알림 메서드 ==========

  /**
   * 알림 생성
   */
  async createNotification(notificationData) {
    try {
      // company_id는 BEFORE INSERT 트리거(set_company_id_from_user)가 자동 설정
      const { error } = await this.supabase
        .from('notifications')
        .insert({
          recipient_id: notificationData.recipientId,
          sender_id: notificationData.senderId || null,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message || null,
          related_record_id: notificationData.relatedRecordId || null,
          related_record_type: notificationData.relatedRecordType || null,
        });

      if (error) throw error;
      return true;
    } catch (error) {
      this._handleError(error, 'createNotification');
    }
  }

  /**
   * 알림 목록 조회
   */
  async getNotifications(userId, options = {}) {
    try {
      let query = this.supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false });

      if (options.unreadOnly) {
        query = query.eq('is_read', false);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(n => this._convertSupabaseNotification(n));
    } catch (error) {
      this._handleError(error, 'getNotifications');
    }
  }

  /**
   * 알림 읽음 처리
   */
  async markNotificationRead(notificationId) {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) throw error;
      return this._convertSupabaseNotification(data);
    } catch (error) {
      this._handleError(error, 'markNotificationRead');
    }
  }

  /**
   * 전체 알림 읽음 처리
   */
  async markAllNotificationsRead(userId) {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      this._handleError(error, 'markAllNotificationsRead');
    }
  }

  /**
   * 안읽은 알림 수 조회
   */
  async getUnreadNotificationCount(userId) {
    try {
      const { count, error } = await this.supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      this._handleError(error, 'getUnreadNotificationCount');
    }
  }

  /**
   * 시간 기록 승인/거절 처리
   */
  async reviewTimeRecord(recordId, type, status, reviewNote) {
    const tableName = type === 'overtime' ? this.tables.overtimeRecords : this.tables.vacationRecords;

    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const { data, error } = await this.supabase
        .from(tableName)
        .update({
          status,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          review_note: reviewNote || null
        })
        .eq('id', recordId)
        .select()
        .single();

      if (error) throw error;
      return this._convertSupabaseTimeRecord(data);
    } catch (error) {
      this._handleError(error, 'reviewTimeRecord');
    }
  }

  /**
   * 알림 데이터 변환
   */
  _convertSupabaseNotification(data) {
    return {
      id: data.id,
      recipientId: data.recipient_id,
      senderId: data.sender_id,
      type: data.type,
      title: data.title,
      message: data.message,
      relatedRecordId: data.related_record_id,
      relatedRecordType: data.related_record_type,
      isRead: data.is_read,
      createdAt: data.created_at,
      companyId: data.company_id
    };
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
