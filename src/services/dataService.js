import { getStorageAdapter } from './storage/index.js';
import HistoryPolicy from './historyPolicy.js';

/**
 * 통합 데이터 서비스
 * 비즈니스 로직과 스토리지 계층 사이의 인터페이스
 * 환경에 관계없이 일관된 API 제공
 */
export class DataService {
  constructor() {
    this._storageAdapter = null;
  }

  /**
   * 전체 데이터 조회 (모든 월의 데이터)
   * 대시보드에서 월별 전환 시 사용
   */
  async getAllRecords() {
    const [overtimeRecords, vacationRecords] = await Promise.all([
      this.getOvertimeRecords(), // 필터 없이 전체 데이터
      this.getVacationRecords()  // 필터 없이 전체 데이터
    ]);

    return {
      overtimeRecords,
      vacationRecords
    };
  }

  /**
   * 스토리지 어댑터 설정
   */
  setStorageAdapter(adapter) {
    this._storageAdapter = adapter;
  }

  /**
   * 스토리지 어댑터 가져오기
   */
  _getAdapter() {
    if (!this._storageAdapter) {
      this._storageAdapter = getStorageAdapter();
    }
    return this._storageAdapter;
  }

  // ========== 직원 관리 ==========

  /**
   * 모든 직원 조회
   */
  async getEmployees() {
    return await this._getAdapter().getEmployees();
  }

  /**
   * 삭제된 직원 포함 전체 조회
   */
  async getAllEmployeesIncludingDeleted() {
    const adapter = this._getAdapter();
    if (adapter.getAllEmployeesIncludingDeleted) {
      return await adapter.getAllEmployeesIncludingDeleted();
    }
    // 폴백: 기본 getEmployees 사용
    return await this.getEmployees();
  }

  /**
   * 특정 월 기준으로 직원 조회 (삭제 상태를 월별로 판단)
   * @param {string} yearMonth - YYYY-MM 형식
   */
  async getEmployeesForMonth(yearMonth) {
    const adapter = this._getAdapter();
    
    // Supabase 어댑터인 경우 월별 조회 사용
    if (adapter.getEmployeesForMonth) {
      return await adapter.getEmployeesForMonth(yearMonth);
    }
    
    // localStorage 등 다른 어댑터는 기본 조회 사용
    return await this.getEmployees();
  }

  /**
   * 직원 추가
   * @param {Object} employeeData - 직원 정보
   * @param {string} employeeData.name - 직원 이름 (필수)
   * @param {string} [employeeData.birthDate] - 생년월일 (선택)
   * @param {string} employeeData.department - 부서 (필수)
   * @param {string} employeeData.hireDate - 입사일 (필수)
   * @param {string} [employeeData.notes] - 메모 (선택)
   */
  async addEmployee(employeeData) {
    // 이전 버전 호환성 (문자열로 호출된 경우)
    if (typeof employeeData === 'string') {
      employeeData = { name: employeeData };
    }
    
    if (!employeeData.name || !employeeData.name.trim()) {
      throw new Error('Employee name is required');
    }
    
    if (!employeeData.department || !employeeData.department.trim()) {
      throw new Error('Department is required');
    }
    
    if (!employeeData.hireDate) {
      throw new Error('Hire date is required');
    }

    return await this._getAdapter().addEmployee(employeeData);
  }

  /**
   * 직원 정보 수정
   * @param {number} id - 직원 ID
   * @param {Object|string} employeeData - 직원 정보 또는 이름 (이전 버전 호환성)
   */
  async updateEmployee(id, employeeData) {
    // 이전 버전 호환성 (문자열로 호출된 경우)
    if (typeof employeeData === 'string') {
      employeeData = { name: employeeData };
    }
    
    if (!employeeData.name || !employeeData.name.trim()) {
      throw new Error('Employee name is required');
    }

    return await this._getAdapter().updateEmployee(id, employeeData);
  }

  /**
   * 직원 삭제
   * @param {number} id - 직원 ID
   */
  async deleteEmployee(id) {
    return await this._getAdapter().deleteEmployee(id);
  }

  /**
   * 직원 이름 조회 (히스토리에서 사용)
   * @param {Object} record - 기록 객체
   */
  async getEmployeeNameFromRecord(record) {
    if (record.employeeName) {
      // 직원 변경 기록에서는 employeeName 필드 사용
      return record.employeeName;
    }
    
    // 초과근무/휴가 기록에서는 employeeId로 조회
    const employees = await this.getEmployees();
    const employee = employees.find(emp => emp.id === record.employeeId);
    return employee ? employee.name : '알 수 없는 직원';
  }

  // ========== 시간 기록 관리 ==========

  /**
   * 초과근무 기록 조회
   * @param {Object} filters - 필터 조건
   */
  async getOvertimeRecords(filters = {}) {
    return await this._getAdapter().getOvertimeRecords(filters);
  }

  /**
   * 휴가 기록 조회
   * @param {Object} filters - 필터 조건
   */
  async getVacationRecords(filters = {}) {
    return await this._getAdapter().getVacationRecords(filters);
  }

  /**
   * 시간 기록 저장
   * @param {string} type - 'overtime' | 'vacation'
   * @param {number} employeeId - 직원 ID
   * @param {string} date - 날짜 (YYYY-MM-DD)
   * @param {number} totalMinutes - 시간(분)
   */
  async updateTimeRecord(type, employeeId, date, totalMinutes) {
    if (typeof employeeId !== 'number' || !date || typeof totalMinutes !== 'number') {
      throw new Error('Invalid parameters for time record');
    }

    return await this._getAdapter().saveTimeRecord(type, {
      employeeId,
      date,
      totalMinutes
    });
  }

  /**
   * 대량 시간 기록 저장
   * @param {string} type - 'overtime' | 'vacation'
   * @param {Array} updates - 업데이트 목록
   */
  async bulkUpdateTimeRecords(type, updates) {
    if (!Array.isArray(updates) || updates.length === 0) {
      throw new Error('Updates array is required and must not be empty');
    }

    return await this._getAdapter().bulkSaveTimeRecords(type, updates);
  }

  // ========== 변경 이력 관리 ==========

  /**
   * 직원 변경 이력 조회
   * @param {Object} filters - 필터 조건
   */
  async getEmployeeChangeRecords(filters = {}) {
    return await this._getAdapter().getEmployeeChangeRecords(filters);
  }

  // ========== 설정 관리 ==========

  /**
   * 설정 조회
   */
  async getSettings() {
    return await this._getAdapter().getSettings();
  }

  /**
   * 설정 저장
   * @param {Object} settings - 설정 객체
   */
  async saveSettings(settings) {
    return await this._getAdapter().saveSettings(settings);
  }

  // ========== 통계 및 계산 ==========

  /**
   * 월별 직원 기록 조회 (히스토리 페이지용)
   * @param {string} month - 월 (YYYY-MM)
   */
  async getMonthlyRecords(month) {
    const [overtimeRecords, vacationRecords] = await Promise.all([
      this.getOvertimeRecords({ month }),
      this.getVacationRecords({ month })
    ]);

    return {
      overtimeRecords,
      vacationRecords
    };
  }

  /**
   * 일별 데이터 조회
   * @param {number} employeeId - 직원 ID
   * @param {string} date - 날짜
   * @param {string} type - 'overtime' | 'vacation'
   */
  async getDailyData(employeeId, date, type) {
    const records = await this[type === 'overtime' ? 'getOvertimeRecords' : 'getVacationRecords']({
      employeeId
    });

    const dayRecords = records.filter(record => record.date === date);
    const totalMinutes = dayRecords.reduce((sum, record) => sum + record.totalMinutes, 0);

    return {
      totalMinutes,
      records: dayRecords
    };
  }

  /**
   * 설정 업데이트
   */
  async updateSettings(settings) {
    return await this._getAdapter().updateSettings(settings);
  }

  // ========== 이월 관리 ==========

  /**
   * 이월 기록 조회
   * @param {Object} filters - 필터 조건 (yearMonth, year, month, employeeId)
   */
  async getCarryoverRecords(filters = {}) {
    return await this._getAdapter().getCarryoverRecords(filters);
  }

  /**
   * 이월 기록 생성
   * @param {Object} carryoverData - 이월 데이터
   */
  async createCarryoverRecord(carryoverData) {
    return await this._getAdapter().createCarryoverRecord(carryoverData);
  }

  /**
   * 이월 기록 수정
   * @param {number} id - 이월 기록 ID
   * @param {Object} carryoverData - 수정할 데이터
   */
  async updateCarryoverRecord(id, carryoverData) {
    return await this._getAdapter().updateCarryoverRecord(id, carryoverData);
  }

  /**
   * 이월 기록 삭제
   * @param {number} id - 이월 기록 ID
   */
  async deleteCarryoverRecord(id) {
    return await this._getAdapter().deleteCarryoverRecord(id);
  }

  // ========== 유틸리티 ==========

  /**
   * 캐시 클리어
   */
  clearCache() {
    this._getAdapter().clearCache();
  }

  /**
   * 히스토리 정책 적용 (UI에서 사용)
   */
  getHistoryPolicy() {
    return HistoryPolicy;
  }

  // ========== Multi-tenancy 회사 관리 ==========

  /**
   * 현재 사용자의 회사 정보 조회
   */
  async getMyCompany() {
    return await this._getAdapter().getMyCompany();
  }

  /**
   * 새 회사 생성
   * @param {string} businessNumber - 사업자번호 (###-##-#####)
   * @param {string} companyName - 회사명
   */
  async createCompany(businessNumber, companyName) {
    if (!businessNumber || !companyName) {
      throw new Error('사업자번호와 회사명은 필수입니다.');
    }
    return await this._getAdapter().createCompany(businessNumber, companyName);
  }

  /**
   * 초대 코드 생성
   * @param {string} email - 초대할 이메일
   */
  async createInviteCode(email) {
    if (!email) {
      throw new Error('이메일은 필수입니다.');
    }
    return await this._getAdapter().createInviteCode(email);
  }

  /**
   * 초대 코드 검증
   * @param {string} code - 초대 코드
   * @param {string} email - 가입 이메일
   */
  async validateInviteCode(code, email) {
    if (!code || !email) {
      throw new Error('초대 코드와 이메일은 필수입니다.');
    }
    return await this._getAdapter().validateInviteCode(code, email);
  }

  /**
   * 초대 코드 사용 (회사 참여)
   * @param {number} inviteId - 초대 ID
   */
  async useInviteCode(inviteId) {
    if (!inviteId) {
      throw new Error('초대 ID는 필수입니다.');
    }
    return await this._getAdapter().useInviteCode(inviteId);
  }

  /**
   * 활성 초대 코드 목록 조회
   */
  async getActiveInviteCodes() {
    return await this._getAdapter().getActiveInviteCodes();
  }
}

// 싱글톤 인스턴스
let dataServiceInstance = null;

/**
 * 데이터 서비스 인스턴스 가져오기
 */
export function getDataService() {
  if (!dataServiceInstance) {
    dataServiceInstance = new DataService();
  }
  return dataServiceInstance;
}

export default DataService;
