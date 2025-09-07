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
      settings: 'settings'
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
        .is('deleted_at', null)  // .eq('deleted_at', null) → .is('deleted_at', null)로 수정
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      this._handleError(error, 'getEmployees');
    }
  }

  async addEmployee(employeeData) {
    try {
      const newEmployee = {
        name: employeeData.name.trim(),
        created_at: TimeUtils.getKoreanTimeAsUTC() // 한국시간 기준 UTC 사용
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
      const { data, error } = await this.supabase
        .from(this.tables.employees)
        .update({ name: employeeData.name.trim() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // 직원 변경 이력 기록
      const changeRecord = HistoryPolicy.createEmployeeChangeRecord(
        id, 
        '수정', 
        employeeData.name.trim()
      );
      await this.saveEmployeeChangeRecord(changeRecord);

      return this._convertSupabaseEmployee(data);
    } catch (error) {
      this._handleError(error, 'updateEmployee');
    }
  }

  async deleteEmployee(id) {
    try {
      // 소프트 삭제
      const { data, error } = await this.supabase
        .from(this.tables.employees)
        .update({ deleted_at: TimeUtils.getKoreanTimeAsUTC() }) // 한국시간 기준 UTC 사용
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // 직원 변경 이력 기록
      const changeRecord = HistoryPolicy.createEmployeeChangeRecord(
        id, 
        '삭제', 
        data.name
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

      // Supabase에 저장 (description 포함)
      const supabaseRecord = {
        employee_id: employeeId,
        date: date,
        total_minutes: totalMinutes,
        description: historyRecord.description || null, // description 추가
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
      
      // Supabase 형식으로 변환
      const supabaseRecords = historyRecords.map(record => ({
        employee_id: record.employeeId,
        date: record.date,
        total_minutes: record.totalMinutes,
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
      createdAt: supabaseData.created_at
    };
  }

  _convertSupabaseTimeRecord(supabaseData) {
    return {
      id: supabaseData.id,
      employeeId: supabaseData.employee_id,
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
      createdAt: supabaseData.created_at
    };
  }
}

export default SupabaseAdapter;
