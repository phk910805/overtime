/**
 * 스토리지 어댑터 인터페이스
 * 모든 스토리지 구현체가 따라야 할 표준 인터페이스
 */

export class StorageAdapter {
  /**
   * 직원 관련 메서드
   */
  async getEmployees() {
    throw new Error('getEmployees must be implemented');
  }

  async addEmployee(employeeData) {
    throw new Error('addEmployee must be implemented');
  }

  async updateEmployee(id, employeeData) {
    throw new Error('updateEmployee must be implemented');
  }

  async deleteEmployee(id) {
    throw new Error('deleteEmployee must be implemented');
  }

  /**
   * 시간 기록 관련 메서드
   */
  async getOvertimeRecords(filters = {}) {
    throw new Error('getOvertimeRecords must be implemented');
  }

  async getVacationRecords(filters = {}) {
    throw new Error('getVacationRecords must be implemented');
  }

  async saveTimeRecord(type, record) {
    throw new Error('saveTimeRecord must be implemented');
  }

  async bulkSaveTimeRecords(type, records) {
    throw new Error('bulkSaveTimeRecords must be implemented');
  }

  /**
   * 변경 이력 관련 메서드
   */
  async getEmployeeChangeRecords(filters = {}) {
    throw new Error('getEmployeeChangeRecords must be implemented');
  }

  async saveEmployeeChangeRecord(record) {
    throw new Error('saveEmployeeChangeRecord must be implemented');
  }

  /**
   * 설정 관련 메서드
   */
  async getSettings() {
    throw new Error('getSettings must be implemented');
  }

  async saveSettings(settings) {
    throw new Error('saveSettings must be implemented');
  }

  /**
   * 캐시 관리
   */
  clearCache() {
    // 기본 구현 (필요시 override)
  }
}

/**
 * 표준 데이터 타입 정의
 */
export const DataTypes = {
  EMPLOYEE: 'employee',
  OVERTIME_RECORD: 'overtime_record',
  VACATION_RECORD: 'vacation_record',
  EMPLOYEE_CHANGE: 'employee_change',
  SETTINGS: 'settings'
};

/**
 * 표준 필터 타입 정의
 */
export const FilterTypes = {
  BY_MONTH: 'by_month',
  BY_EMPLOYEE: 'by_employee',
  BY_DATE_RANGE: 'by_date_range'
};
