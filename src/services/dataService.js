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
    this._cache = new Map();
    this._cacheTTL = 5 * 60 * 1000; // 5분
  }

  // ========== 캐시 헬퍼 ==========

  _getCached(key) {
    const entry = this._cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this._cacheTTL) {
      this._cache.delete(key);
      return null;
    }
    if (process.env.NODE_ENV === 'development') {
      console.log(`📦 Cache HIT: ${key}`);
    }
    return entry.data;
  }

  _setCache(key, data) {
    this._cache.set(key, { data, timestamp: Date.now() });
  }

  _invalidateCache(...keys) {
    keys.forEach(key => this._cache.delete(key));
  }

  _invalidateCacheByPrefix(prefix) {
    for (const key of this._cache.keys()) {
      if (key.startsWith(prefix)) {
        this._cache.delete(key);
      }
    }
  }

  /**
   * 전체 데이터 조회 (모든 월의 데이터)
   * 대시보드에서 월별 전환 시 사용
   */
  async getAllRecords() {
    const cached = this._getCached('allRecords');
    if (cached) return cached;

    const [overtimeRecords, vacationRecords] = await Promise.all([
      this.getOvertimeRecords(), // 필터 없이 전체 데이터
      this.getVacationRecords()  // 필터 없이 전체 데이터
    ]);

    const result = { overtimeRecords, vacationRecords };
    this._setCache('allRecords', result);
    return result;
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
    const cached = this._getCached('employees');
    if (cached) return cached;
    const result = await this._getAdapter().getEmployees();
    this._setCache('employees', result);
    return result;
  }

  /**
   * 삭제된 직원 포함 전체 조회
   */
  async getAllEmployeesIncludingDeleted() {
    const cached = this._getCached('allEmployees');
    if (cached) return cached;
    const adapter = this._getAdapter();
    let result;
    if (adapter.getAllEmployeesIncludingDeleted) {
      result = await adapter.getAllEmployeesIncludingDeleted();
    } else {
      result = await this.getEmployees();
    }
    this._setCache('allEmployees', result);
    return result;
  }

  /**
   * 특정 월 기준으로 직원 조회 (삭제 상태를 월별로 판단)
   * @param {string} yearMonth - YYYY-MM 형식
   */
  async getEmployeesForMonth(yearMonth) {
    const cacheKey = `employeesForMonth:${yearMonth}`;
    const cached = this._getCached(cacheKey);
    if (cached) return cached;

    const adapter = this._getAdapter();
    let result;
    if (adapter.getEmployeesForMonth) {
      result = await adapter.getEmployeesForMonth(yearMonth);
    } else {
      result = await this.getEmployees();
    }
    this._setCache(cacheKey, result);
    return result;
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

    const result = await this._getAdapter().addEmployee(employeeData);
    this._invalidateCache('employees', 'allEmployees');
    this._invalidateCacheByPrefix('employeesForMonth:');
    this._invalidateCacheByPrefix('changeRecords');
    return result;
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

    const result = await this._getAdapter().updateEmployee(id, employeeData);
    this._invalidateCache('employees', 'allEmployees');
    this._invalidateCacheByPrefix('employeesForMonth:');
    this._invalidateCacheByPrefix('changeRecords');
    return result;
  }

  /**
   * 직원 삭제
   * @param {number} id - 직원 ID
   */
  async deleteEmployee(id) {
    const result = await this._getAdapter().deleteEmployee(id);
    this._invalidateCache('employees', 'allEmployees');
    this._invalidateCacheByPrefix('employeesForMonth:');
    this._invalidateCacheByPrefix('changeRecords');
    return result;
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

    const result = await this._getAdapter().saveTimeRecord(type, {
      employeeId,
      date,
      totalMinutes
    });
    this._invalidateCache('allRecords');
    return result;
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

    const result = await this._getAdapter().bulkSaveTimeRecords(type, updates);
    this._invalidateCache('allRecords');
    return result;
  }

  // ========== 변경 이력 관리 ==========

  /**
   * 직원 변경 이력 조회
   * @param {Object} filters - 필터 조건
   */
  async getEmployeeChangeRecords(filters = {}) {
    const cacheKey = Object.keys(filters).length === 0
      ? 'changeRecords'
      : `changeRecords:${JSON.stringify(filters)}`;
    const cached = this._getCached(cacheKey);
    if (cached) return cached;
    const result = await this._getAdapter().getEmployeeChangeRecords(filters);
    this._setCache(cacheKey, result);
    return result;
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
    const cacheKey = Object.keys(filters).length === 0
      ? 'carryover'
      : `carryover:${JSON.stringify(filters)}`;
    const cached = this._getCached(cacheKey);
    if (cached) return cached;
    const result = await this._getAdapter().getCarryoverRecords(filters);
    this._setCache(cacheKey, result);
    return result;
  }

  /**
   * 이월 기록 생성
   * @param {Object} carryoverData - 이월 데이터
   */
  async createCarryoverRecord(carryoverData) {
    const result = await this._getAdapter().createCarryoverRecord(carryoverData);
    this._invalidateCacheByPrefix('carryover');
    return result;
  }

  /**
   * 이월 기록 수정
   * @param {number} id - 이월 기록 ID
   * @param {Object} carryoverData - 수정할 데이터
   */
  async updateCarryoverRecord(id, carryoverData) {
    const result = await this._getAdapter().updateCarryoverRecord(id, carryoverData);
    this._invalidateCacheByPrefix('carryover');
    return result;
  }

  /**
   * 이월 기록 삭제
   * @param {number} id - 이월 기록 ID
   */
  async deleteCarryoverRecord(id) {
    const result = await this._getAdapter().deleteCarryoverRecord(id);
    this._invalidateCacheByPrefix('carryover');
    return result;
  }

  // ========== 유틸리티 ==========

  /**
   * 현재 사용자의 company_id 조회 (Supabase 어댑터에서)
   */
  async getCompanyId() {
    const adapter = this._getAdapter();
    if (adapter._companyId) return adapter._companyId;
    // profile에서 가져오기
    if (adapter.getUserProfile) {
      const profile = await adapter.getUserProfile();
      return profile?.company_id || null;
    }
    return null;
  }

  /**
   * 캐시 클리어
   */
  clearCache() {
    this._cache.clear();
    this._getAdapter().clearCache();
    if (process.env.NODE_ENV === 'development') {
      console.log('🧹 DataService cache cleared');
    }
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
  async createInviteCode(email, role = 'employee', permission = 'editor') {
    if (!email) {
      throw new Error('이메일은 필수입니다.');
    }
    return await this._getAdapter().createInviteCode(email, role, permission);
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

  /**
   * 회사 팀원 목록 조회
   */
  async getCompanyMembers() {
    return await this._getAdapter().getCompanyMembers();
  }

  /**
   * 팀원 역할/권한 변경 (소유자 전용)
   * @param {string} memberId - 팀원 UUID
   * @param {string} newRole - 새 역할 (admin/employee)
   * @param {string} newPermission - 새 권한 (editor/viewer)
   */
  async updateMemberRole(memberId, newRole, newPermission) {
    return await this._getAdapter().updateMemberRole(memberId, newRole, newPermission);
  }

  /**
   * 팀원 내보내기 (소유자 전용)
   * @param {string} memberId - 팀원 UUID
   */
  async removeMember(memberId) {
    return await this._getAdapter().removeMember(memberId);
  }

  // ========== 초대 링크 기반 메서드 ==========

  /**
   * 초대 링크 생성 (또는 갱신)
   */
  async createInviteLink() {
    return await this._getAdapter().createInviteLink();
  }

  /**
   * 초대 토큰 유효성 검증
   * @param {string} token - UUID 토큰
   */
  async validateInviteToken(token) {
    if (!token) throw new Error('토큰은 필수입니다.');
    return await this._getAdapter().validateInviteToken(token);
  }

  /**
   * 초대 링크로 회사 참여 (pending 상태)
   * @param {string} token - UUID 토큰
   */
  async joinViaInvite(token) {
    if (!token) throw new Error('토큰은 필수입니다.');
    return await this._getAdapter().joinViaInvite(token);
  }

  /**
   * 현재 활성 초대 링크 조회
   */
  async getActiveInviteLink() {
    return await this._getAdapter().getActiveInviteLink();
  }

  /**
   * 참여 대기 중인 멤버 목록 조회
   */
  async getPendingMembers() {
    return await this._getAdapter().getPendingMembers();
  }

  /**
   * 참여 요청 승인
   * @param {string} memberId - 멤버 UUID
   * @param {string} role - 역할
   * @param {string} permission - 권한
   */
  async approveJoinRequest(memberId, role, permission) {
    return await this._getAdapter().approveJoinRequest(memberId, role, permission);
  }

  /**
   * 참여 요청 거절
   * @param {string} memberId - 멤버 UUID
   */
  async rejectJoinRequest(memberId) {
    return await this._getAdapter().rejectJoinRequest(memberId);
  }

  // ========== 직원-프로필 연결 ==========

  /**
   * 직원을 사용자 프로필에 연결
   */
  async linkEmployeeToProfile(employeeId, userId) {
    const result = await this._getAdapter().linkEmployeeToProfile(employeeId, userId);
    this._invalidateCache('employees', 'allEmployees');
    this._invalidateCacheByPrefix('employeesForMonth:');
    this._invalidateCacheByPrefix('linkedEmployee:');
    return result;
  }

  /**
   * 직원-프로필 연결 해제
   */
  async unlinkEmployeeFromProfile(employeeId) {
    const result = await this._getAdapter().unlinkEmployeeFromProfile(employeeId);
    this._invalidateCache('employees', 'allEmployees');
    this._invalidateCacheByPrefix('employeesForMonth:');
    this._invalidateCacheByPrefix('linkedEmployee:');
    return result;
  }

  /**
   * 사용자 ID로 연결된 직원 조회
   */
  async getLinkedEmployee(userId) {
    const cacheKey = `linkedEmployee:${userId}`;
    const cached = this._getCached(cacheKey);
    if (cached) return cached;
    const result = await this._getAdapter().getLinkedEmployeeForUser(userId);
    if (result) {
      this._setCache(cacheKey, result);
    }
    return result;
  }

  // ========== 알림 ==========

  /**
   * 알림 생성
   */
  async createNotification(data) {
    const result = await this._getAdapter().createNotification(data);
    this._invalidateCacheByPrefix('notifications:');
    this._invalidateCacheByPrefix('unreadCount:');
    return result;
  }

  /**
   * 알림 목록 조회
   */
  async getNotifications(userId, options = {}) {
    const cacheKey = `notifications:${userId}:${JSON.stringify(options)}`;
    const cached = this._getCached(cacheKey);
    if (cached) return cached;
    const result = await this._getAdapter().getNotifications(userId, options);
    this._setCache(cacheKey, result);
    return result;
  }

  /**
   * 알림 읽음 처리
   */
  async markNotificationRead(notificationId) {
    const result = await this._getAdapter().markNotificationRead(notificationId);
    this._invalidateCacheByPrefix('notifications:');
    this._invalidateCacheByPrefix('unreadCount:');
    return result;
  }

  /**
   * 안읽은 알림 수 조회
   */
  async getUnreadNotificationCount(userId) {
    const cacheKey = `unreadCount:${userId}`;
    const cached = this._getCached(cacheKey);
    if (cached !== null) return cached;
    const result = await this._getAdapter().getUnreadNotificationCount(userId);
    this._setCache(cacheKey, result);
    return result;
  }

  // ========== 시간 기록 승인 ==========

  /**
   * 구성원 본인 시간 제출 (pending 상태로 저장)
   * @param {string} type - 'overtime' | 'vacation'
   * @param {number} employeeId - 직원 ID
   * @param {string} date - 날짜 (YYYY-MM-DD)
   * @param {number} totalMinutes - 시간(분)
   * @param {string} submitReason - 제출 사유
   */
  async submitOwnTimeRecord(type, employeeId, date, totalMinutes, submitReason) {
    const result = await this._getAdapter().saveTimeRecord(type, {
      employeeId,
      date,
      totalMinutes,
      status: 'pending',
      submitReason: submitReason || null
    });
    this._invalidateCache('allRecords');
    return result;
  }

  /**
   * 시간 기록 승인/거절
   * @param {number} recordId - 기록 ID
   * @param {string} type - 'overtime' | 'vacation'
   * @param {string} status - 'approved' | 'rejected'
   * @param {string} reviewNote - 사유
   */
  async reviewTimeRecord(recordId, type, status, reviewNote) {
    const result = await this._getAdapter().reviewTimeRecord(recordId, type, status, reviewNote);
    this._invalidateCache('allRecords');
    return result;
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
