import { StorageAdapter } from './StorageAdapter.js';
import HistoryPolicy from '../historyPolicy.js';

/**
 * localStorage 기반 스토리지 어댑터
 */
export class LocalStorageAdapter extends StorageAdapter {
  constructor() {
    super();
    this.storageKeys = {
      employees: 'overtime-employees',
      overtimeRecords: 'overtime-records',
      vacationRecords: 'vacation-records',
      employeeChangeRecords: 'employee-change-records',
      settings: 'overtime-settings'
    };
  }

  // ========== 유틸리티 메서드 ==========

  _load(key) {
    try {
      const data = localStorage.getItem(this.storageKeys[key]);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Failed to load ${key}:`, error);
      return [];
    }
  }

  _save(key, data) {
    try {
      localStorage.setItem(this.storageKeys[key], JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
      throw error;
    }
  }

  _loadSettings() {
    try {
      const data = localStorage.getItem(this.storageKeys.settings);
      return data ? JSON.parse(data) : { multiplier: 1.0 };
    } catch (error) {
      console.error('Failed to load settings:', error);
      return { multiplier: 1.0 };
    }
  }

  // ========== 직원 관련 메서드 ==========

  async getEmployees() {
    return this._load('employees');
  }

  async addEmployee(employeeData) {
    const employees = this._load('employees');
    const newEmployee = {
      id: Date.now(),
      name: employeeData.name.trim(),
      createdAt: new Date().toISOString()
    };
    
    const updated = [...employees, newEmployee];
    this._save('employees', updated);

    // 직원 변경 이력 기록
    const changeRecord = HistoryPolicy.createEmployeeChangeRecord(
      newEmployee.id, 
      '생성', 
      newEmployee.name
    );
    await this.saveEmployeeChangeRecord(changeRecord);

    return newEmployee;
  }

  async updateEmployee(id, employeeData) {
    const employees = this._load('employees');
    const updated = employees.map(emp => 
      emp.id === id ? { ...emp, name: employeeData.name.trim() } : emp
    );
    this._save('employees', updated);

    // 직원 변경 이력 기록
    const changeRecord = HistoryPolicy.createEmployeeChangeRecord(
      id, 
      '수정', 
      employeeData.name.trim()
    );
    await this.saveEmployeeChangeRecord(changeRecord);

    return updated.find(emp => emp.id === id);
  }

  async deleteEmployee(id) {
    const employees = this._load('employees');
    const employeeToDelete = employees.find(emp => emp.id === id);
    if (!employeeToDelete) {
      throw new Error('Employee not found');
    }

    const updated = employees.filter(emp => emp.id !== id);
    this._save('employees', updated);

    // 직원 변경 이력 기록
    const changeRecord = HistoryPolicy.createEmployeeChangeRecord(
      id, 
      '삭제', 
      employeeToDelete.name
    );
    await this.saveEmployeeChangeRecord(changeRecord);

    return employeeToDelete;
  }

  // ========== 시간 기록 관련 메서드 ==========

  async getOvertimeRecords(filters = {}) {
    let records = this._load('overtimeRecords');
    
    if (filters.month) {
      const [year, month] = filters.month.split('-');
      records = records.filter(record => {
        if (!record.date) return false;
        const recordDate = new Date(record.date);
        return recordDate.getFullYear() === parseInt(year) && 
               (recordDate.getMonth() + 1).toString().padStart(2, '0') === month;
      });
    }

    if (filters.employeeId) {
      records = records.filter(record => record.employeeId === filters.employeeId);
    }

    return records;
  }

  async getVacationRecords(filters = {}) {
    let records = this._load('vacationRecords');
    
    if (filters.month) {
      const [year, month] = filters.month.split('-');
      records = records.filter(record => {
        if (!record.date) return false;
        const recordDate = new Date(record.date);
        return recordDate.getFullYear() === parseInt(year) && 
               (recordDate.getMonth() + 1).toString().padStart(2, '0') === month;
      });
    }

    if (filters.employeeId) {
      records = records.filter(record => record.employeeId === filters.employeeId);
    }

    return records;
  }

  async saveTimeRecord(type, recordData) {
    const { employeeId, date, totalMinutes } = recordData;
    const recordsKey = type === 'overtime' ? 'overtimeRecords' : 'vacationRecords';
    const existingRecords = this._load(recordsKey);

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

    // 기록 저장
    const updated = [...existingRecords, historyRecord];
    this._save(recordsKey, updated);

    return historyRecord;
  }

  async bulkSaveTimeRecords(type, updates) {
    const recordsKey = type === 'overtime' ? 'overtimeRecords' : 'vacationRecords';
    const existingRecords = this._load(recordsKey);

    // 대량 업데이트 히스토리 생성
    const newRecords = HistoryPolicy.createBulkRecords(updates);
    const updated = [...existingRecords, ...newRecords];
    
    this._save(recordsKey, updated);
    return newRecords;
  }

  // ========== 변경 이력 관련 메서드 ==========

  async getEmployeeChangeRecords(filters = {}) {
    let records = this._load('employeeChangeRecords');

    if (filters.month) {
      const [year, month] = filters.month.split('-');
      records = records.filter(record => {
        const recordDate = new Date(record.createdAt);
        return recordDate.getFullYear() === parseInt(year) && 
               (recordDate.getMonth() + 1).toString().padStart(2, '0') === month;
      });
    }

    return records;
  }

  async saveEmployeeChangeRecord(record) {
    const records = this._load('employeeChangeRecords');
    const updated = [...records, record];
    this._save('employeeChangeRecords', updated);
    return record;
  }

  // ========== 설정 관련 메서드 ==========

  async getSettings() {
    return this._loadSettings();
  }

  async saveSettings(settings) {
    try {
      localStorage.setItem(this.storageKeys.settings, JSON.stringify(settings));
      return settings;
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  // ========== 캐시 관리 ==========

  clearCache() {
    // localStorage는 즉시 반영되므로 캐시 클리어 불필요
    // 하지만 인터페이스 일관성을 위해 구현
  }
}

export default LocalStorageAdapter;
