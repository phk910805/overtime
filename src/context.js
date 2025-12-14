import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { createStorageAdapter } from './services/storage/index.js';
import { getDataService } from './services/dataService.js';
import { dataCalculator } from './dataManager';
import { getConfig } from './services/config.js';
import { supabase } from './lib/supabase'; // Supabase client import

const OvertimeContext = createContext();

export const useOvertimeContext = () => {
  const context = useContext(OvertimeContext);
  if (!context) {
    throw new Error('useOvertimeContext must be used within OvertimeProvider');
  }
  return context;
};

let isInitialized = false;

// 환경변수 기반 초기화 로직
const initializeDataLayer = async () => {
  if (isInitialized) return;
  
  try {
    const config = getConfig();
    const storageConfig = config.getStorageConfig();
    const validation = config.validate();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Config validation:', validation);
      console.log('📦 Initializing data layer:', storageConfig.type);
      console.log('🌍 Environment variables:');
      console.log('  - REACT_APP_USE_SUPABASE:', process.env.REACT_APP_USE_SUPABASE);
      console.log('  - REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL ? '✅ Set' : '❌ Missing');
      console.log('  - REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
    }
    
    if (storageConfig.type === 'supabase') {
      const supabaseConfig = config.getSupabaseConfig();
      
      if (!validation.isValid) {
        console.warn('⚠️ Supabase config invalid, falling back to localStorage:', validation.errors);
        createStorageAdapter({ type: 'localStorage' });
      } else {
        // 기존 supabase client 사용 (중복 생성 방지)
        createStorageAdapter({ type: 'supabase', options: { supabaseClient: supabase } });
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Supabase client 사용 (lib/supabase.js)');
        }
      }
    } else {
      createStorageAdapter({ type: 'localStorage' });
      if (process.env.NODE_ENV === 'development') {
        console.log('📁 Using localStorage adapter');
      }
    }
    
    isInitialized = true;
    if (process.env.NODE_ENV === 'development') {
      console.log('🎉 Data layer initialized successfully');
    }
  } catch (error) {
    console.error('❌ Failed to initialize data layer:', error);
    console.warn('🔄 Falling back to localStorage');
    createStorageAdapter({ type: 'localStorage' });
    isInitialized = true;
  }
};

const useOvertimeData = () => {
  const [employees, setEmployees] = useState([]);
  const [allEmployeesIncludingDeleted, setAllEmployeesIncludingDeleted] = useState([]); // 삭제된 직원 포함
  const [overtimeRecords, setOvertimeRecords] = useState([]);
  const [vacationRecords, setVacationRecords] = useState([]);
  const [employeeChangeRecords, setEmployeeChangeRecords] = useState([]);
  const [carryoverRecords, setCarryoverRecords] = useState([]); // 이월 기록
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  // 이월 자동 생성 실행 플래그 (중복 실행 방지)
  const isCreatingCarryoverRef = React.useRef(false);

  const dataService = getDataService();

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 데이터 계층 초기화
        await initializeDataLayer();
        
        // 월별 직원 데이터 로드 - 현재 월에서는 활성 직원만
        let employeesData;
        const currentMonth = new Date().toISOString().slice(0, 7);
        
        if (selectedMonth === currentMonth) {
          // 현재 월: 활성 직원만
          employeesData = await dataService.getEmployees();
        } else {
          // 과거 월: 해당 월의 직원
          if (dataService.getEmployeesForMonth) {
            employeesData = await dataService.getEmployeesForMonth(selectedMonth);
          } else {
            employeesData = await dataService.getEmployees();
          }
        }
        
        const employeeChangesData = await dataService.getEmployeeChangeRecords();
        
        // 삭제된 직원 포함 전체 목록 로드
        let allEmployeesData = [];
        if (dataService.getAllEmployeesIncludingDeleted) {
          allEmployeesData = await dataService.getAllEmployeesIncludingDeleted();
        }

        setEmployees(employeesData || []);
        setAllEmployeesIncludingDeleted(allEmployeesData || []);
        setEmployeeChangeRecords(employeeChangesData || []);
        
        // 전체 데이터 로드 (모든 월의 데이터)
        const allRecords = await dataService.getAllRecords();
        setOvertimeRecords(allRecords.overtimeRecords || []);
        setVacationRecords(allRecords.vacationRecords || []);
        
        // 이월 데이터 로드
        const carryoverData = await dataService.getCarryoverRecords();
        setCarryoverRecords(carryoverData || []);

      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to load data:', error);
        }
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dataService, selectedMonth]);

  const addEmployee = useCallback(async (employeeData) => {
    try {
      const newEmployee = await dataService.addEmployee(employeeData);
      
      // 현재 월인 경우에만 직원 목록에 추가
      const currentMonth = new Date().toISOString().slice(0, 7);
      if (selectedMonth === currentMonth) {
        setEmployees(prev => [...prev, newEmployee]);
      }
      
      // 변경 이력 새로고침
      const updatedChanges = await dataService.getEmployeeChangeRecords();
      setEmployeeChangeRecords(updatedChanges);
      
      dataCalculator.invalidateRelatedCaches();
      return newEmployee;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to add employee:', error);
      }
      throw error;
    }
  }, [dataService, selectedMonth]);

  const updateEmployee = useCallback(async (id, employeeData) => {
    try {
      const updatedEmployee = await dataService.updateEmployee(id, employeeData);
      
      // 직접 상태 업데이트
      setEmployees(prev => prev.map(emp => emp.id === id ? updatedEmployee : emp));
      
      // 변경 이력 새로고침
      const updatedChanges = await dataService.getEmployeeChangeRecords();
      setEmployeeChangeRecords(updatedChanges);
      
      dataCalculator.invalidateRelatedCaches(id);
      return updatedEmployee;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to update employee:', error);
      }
      throw error;
    }
  }, [dataService]);

  const deleteEmployee = useCallback(async (id, currentTab = 'dashboard') => {
    try {
      const deletedEmployee = await dataService.deleteEmployee(id);
      
      // 현재 탭 정보를 sessionStorage에 저장
      sessionStorage.setItem('activeTabAfterDelete', currentTab);
      
      // 삭제 후 화면 새로고침으로 최신 데이터 반영
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
      return deletedEmployee;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to delete employee:', error);
      }
      throw error;
    }
  }, [dataService]);

  const updateOvertimeRecord = useCallback(async (employeeId, date, totalMinutes) => {
    try {
      const newRecord = await dataService.updateTimeRecord('overtime', employeeId, date, totalMinutes);
      
      if (newRecord) {
        setOvertimeRecords(prev => [...prev, newRecord]);
      }
      
      dataCalculator.invalidateRelatedCaches(employeeId, date);
      return newRecord;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to update overtime record:', error);
      }
      throw error;
    }
  }, [dataService]);

  const updateVacationRecord = useCallback(async (employeeId, date, totalMinutes) => {
    try {
      const newRecord = await dataService.updateTimeRecord('vacation', employeeId, date, totalMinutes);
      
      if (newRecord) {
        setVacationRecords(prev => [...prev, newRecord]);
      }
      
      dataCalculator.invalidateRelatedCaches(employeeId, date);
      return newRecord;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to update vacation record:', error);
      }
      throw error;
    }
  }, [dataService]);

  const bulkUpdateOvertimeRecords = useCallback(async (updates) => {
    try {
      const newRecords = await dataService.bulkUpdateTimeRecords('overtime', updates);
      setOvertimeRecords(prev => [...prev, ...newRecords]);
      dataCalculator.clearCache();
      return newRecords;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to bulk update overtime records:', error);
      }
      throw error;
    }
  }, [dataService]);

  const bulkUpdateVacationRecords = useCallback(async (updates) => {
    try {
      const newRecords = await dataService.bulkUpdateTimeRecords('vacation', updates);
      setVacationRecords(prev => [...prev, ...newRecords]);
      dataCalculator.clearCache();
      return newRecords;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to bulk update vacation records:', error);
      }
      throw error;
    }
  }, [dataService]);

  const getEmployeeNameFromRecord = useCallback(async (record) => {
    return await dataService.getEmployeeNameFromRecord(record);
  }, [dataService]);

  // 헬퍼 함수들
  const isValidEmployeeDate = (employee) => {
    if (!employee.createdAt) return true; // 기존 데이터 호환성
    
    try {
      const employeeCreatedDate = new Date(employee.createdAt);
      return !isNaN(employeeCreatedDate.getTime());
    } catch (error) {
      console.warn('직원 생성일 변환 오류:', employee.name, employee.createdAt);
      return true; // 오류 시 항상 표시
    }
  };

  const getEmployeeCreatedMonth = (employee) => {
    if (!employee.createdAt) return '1900-01'; // 매우 이른 날짜로 항상 통과
    
    try {
      const employeeCreatedDate = new Date(employee.createdAt);
      if (isNaN(employeeCreatedDate.getTime())) return '1900-01';
      return employeeCreatedDate.toISOString().slice(0, 7);
    } catch (error) {
      return '1900-01';
    }
  };

  const filterRecordsByMonth = (records, year, month) => {
    return records.filter(record => {
      if (!record.date) return false;
      const recordDate = new Date(record.date);
      return recordDate.getFullYear() === parseInt(year) && 
             (recordDate.getMonth() + 1).toString().padStart(2, '0') === month;
    });
  };

  const extractDeletedEmployeesFromRecords = (records, activeEmployees) => {
    const deletedEmployeeMap = new Map();
    
    records.forEach(record => {
      if (record.employeeName && record.totalMinutes > 0 && 
          !activeEmployees.find(emp => emp.id === record.employeeId)) {
        if (!deletedEmployeeMap.has(record.employeeId)) {
          // 활성 직원 목록에서 삭제된 직원의 최신 정보 찾기
          const deletedEmployee = employees.find(emp => emp.id === record.employeeId);
          
          deletedEmployeeMap.set(record.employeeId, {
            id: record.employeeId,
            name: deletedEmployee?.lastUpdatedName || deletedEmployee?.name || record.employeeName,
            lastUpdatedName: deletedEmployee?.lastUpdatedName || record.employeeName,
            createdAt: record.createdAt,
            isActive: false
          });
        }
      }
    });
    
    return Array.from(deletedEmployeeMap.values());
  };

  const getAllEmployeesWithRecords = useCallback((currentSelectedMonth) => {
    // 직원이 선택된 월에 표시되어야 하는지 확인하는 함수
    // 등록월 <= 선택된 월 <= 삭제월 (삭제된 경우)
    const isEmployeeVisibleInMonth = (employee, targetMonth) => {
      // 등록월 확인
      let createdMonth = '1900-01';
      if (employee.createdAt) {
        try {
          const createdDate = new Date(employee.createdAt);
          if (!isNaN(createdDate.getTime())) {
            createdMonth = createdDate.toISOString().slice(0, 7);
          }
        } catch (error) {
          // 오류 시 기본값 사용
        }
      }
      
      // 삭제월 확인 (삭제되지 않은 경우 먼 미래)
      let deletedMonth = '9999-12';
      if (employee.deletedAt) {
        try {
          const deletedDate = new Date(employee.deletedAt);
          if (!isNaN(deletedDate.getTime())) {
            deletedMonth = deletedDate.toISOString().slice(0, 7);
          }
        } catch (error) {
          // 오류 시 기본값 사용
        }
      }
      
      // 등록월 <= 선택된 월 <= 삭제월
      return targetMonth >= createdMonth && targetMonth <= deletedMonth;
    };

    // 활성 직원들 (등록월 필터링 적용)
    const activeEmployees = employees
      .filter(employee => isEmployeeVisibleInMonth(employee, currentSelectedMonth))
      .map(employee => ({
        ...employee,
        isActive: true
      }));

    // 삭제된 직원들 (등록월~삭제월 범위 내에서 표시)
    const deletedEmployees = allEmployeesIncludingDeleted
      .filter(employee => {
        // 삭제된 직원만
        if (!employee.deletedAt) return false;
        // 활성 직원 목록에 이미 있으면 제외
        if (activeEmployees.find(emp => emp.id === employee.id)) return false;
        // 등록월~삭제월 범위 확인
        return isEmployeeVisibleInMonth(employee, currentSelectedMonth);
      })
      .map(employee => ({
        ...employee,
        isActive: false
      }))
      .sort((a, b) => {
        // 이름순 정렬
        const nameA = (a.lastUpdatedName || a.name || '').toLowerCase();
        const nameB = (b.lastUpdatedName || b.name || '').toLowerCase();
        return nameA.localeCompare(nameB, 'ko');
      });

    // 활성 직원 + 삭제된 직원 결합
    return [...activeEmployees, ...deletedEmployees];
  }, [employees, allEmployeesIncludingDeleted]);


  const getDailyData = useCallback((employeeId, date, type) => {
    return dataCalculator.getDailyData(employeeId, date, type, overtimeRecords, vacationRecords);
  }, [overtimeRecords, vacationRecords]);

  const getMonthlyStats = useCallback((employeeId, selectedMonth, multiplier = 1.0) => {
    return dataCalculator.getMonthlyStats(employeeId, selectedMonth, overtimeRecords, vacationRecords, multiplier);
  }, [overtimeRecords, vacationRecords]);

  const updateDailyTime = useCallback(async (type, employeeId, date, totalMinutes) => {
    if (type === 'overtime') {
      return await updateOvertimeRecord(employeeId, date, totalMinutes);
    } else {
      return await updateVacationRecord(employeeId, date, totalMinutes);
    }
  }, [updateOvertimeRecord, updateVacationRecord]);

  const [multiplier, setMultiplier] = useState(1.0);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await dataService.getSettings();
        setMultiplier(settings.multiplier || 1.0);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to load settings:', error);
        }
      }
    };
    
    if (!isLoading) {
      loadSettings();
    }
  }, [dataService, isLoading]);

  const updateSettings = useCallback(async (newSettings) => {
    try {
      await dataService.updateSettings(newSettings);
      if (newSettings.multiplier !== undefined) {
        setMultiplier(newSettings.multiplier);
      }
      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to update settings:', error);
      }
      throw error;
    }
  }, [dataService]);

  // ========== 이월 관리 ==========

  const getCarryoverForEmployee = useCallback((employeeId, yearMonth) => {
    const [year, month] = yearMonth.split('-');
    const carryover = carryoverRecords.find(
      record => record.employeeId === employeeId && 
                record.year === parseInt(year) && 
                record.month === parseInt(month)
    );
    return carryover ? carryover.carryoverRemainingMinutes : 0;
  }, [carryoverRecords]);

  const createCarryoverRecord = useCallback(async (carryoverData) => {
    try {
      const newCarryover = await dataService.createCarryoverRecord(carryoverData);
      setCarryoverRecords(prev => [...prev, newCarryover]);
      return newCarryover;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to create carryover:', error);
      }
      throw error;
    }
  }, [dataService]);

  const updateCarryoverRecord = useCallback(async (id, carryoverData) => {
    try {
      const updatedCarryover = await dataService.updateCarryoverRecord(id, carryoverData);
      setCarryoverRecords(prev => prev.map(record => 
        record.id === id ? updatedCarryover : record
      ));
      return updatedCarryover;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to update carryover:', error);
      }
      throw error;
    }
  }, [dataService]);

  /**
   * 지난 달 수정 시 이월 영향 체크 및 재계산
   * @param {number} employeeId - 직원 ID
   * @param {string} sourceMonth - 수정한 달 (YYYY-MM)
   * @returns {Promise<object>} { hasImpact, employeeName, sourceMonth, targetMonth, ... }
   */
  const checkAndRecalculateCarryover = useCallback(async (employeeId, sourceMonth) => {
    try {
      const { dateUtils } = require('./utils');
      
      // 다음 달 구하기
      const targetMonth = dateUtils.getNextMonth(sourceMonth);
      const [targetYear, targetMonthNum] = targetMonth.split('-');
      
      // 수정한 달의 새 잠여시간 계산
      const sourceStats = dataCalculator.getMonthlyStats(
        employeeId, 
        sourceMonth, 
        overtimeRecords, 
        vacationRecords, 
        multiplier
      );
      const newSourceRemaining = sourceStats.remaining;
      
      // 기존 이월 조회
      const [year, month] = targetMonth.split('-');
      const existingCarryover = carryoverRecords.find(
        record => record.employeeId === employeeId && 
                  record.year === parseInt(year) && 
                  record.month === parseInt(month)
      );
      
      const oldCarryover = existingCarryover ? existingCarryover.carryoverRemainingMinutes : 0;
      const newCarryover = newSourceRemaining;
      
      // 변경 없으면 종료
      if (oldCarryover === newCarryover) {
        return { hasImpact: false };
      }
      
      // 이월 업데이트
      if (existingCarryover) {
        await updateCarryoverRecord(existingCarryover.id, {
          carryoverRemainingMinutes: newCarryover,
          sourceMonthMultiplier: multiplier
        });
      } else {
        await createCarryoverRecord({
          employeeId,
          year: parseInt(targetYear),
          month: parseInt(targetMonthNum),
          carryoverRemainingMinutes: newCarryover,
          sourceMonthMultiplier: multiplier
        });
      }
      
      // 다음 달 잠여시간 영향 계산
      const targetStats = dataCalculator.getMonthlyStats(
        employeeId, 
        targetMonth, 
        overtimeRecords, 
        vacationRecords, 
        multiplier
      );
      
      const targetMonthOldRemaining = oldCarryover + targetStats.remaining;
      const targetMonthNewRemaining = newCarryover + targetStats.remaining;
      
      // 직원 이름 가져오기
      const employee = employees.find(emp => emp.id === employeeId) || 
                      allEmployeesIncludingDeleted.find(emp => emp.id === employeeId);
      const employeeName = employee?.lastUpdatedName || employee?.name || '알 수 없는 직원';
      
      // 수정한 달의 이전 잠여시간 (역산: 새 이월 - 변화량)
      const oldSourceRemaining = oldCarryover;
      
      return {
        hasImpact: true,
        employeeName,
        sourceMonth: sourceMonth.split('-')[1], // "11"
        targetMonth: targetMonth.split('-')[1], // "12"
        oldRemaining: oldSourceRemaining,
        newRemaining: newSourceRemaining,
        oldCarryover,
        newCarryover,
        targetMonthOldRemaining,
        targetMonthNewRemaining
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to check carryover impact:', error);
      }
      return { hasImpact: false };
    }
  }, [dataService, overtimeRecords, vacationRecords, multiplier, carryoverRecords, employees, allEmployeesIncludingDeleted, createCarryoverRecord, updateCarryoverRecord]);

  /**
   * 월 자동 이월 생성
   * 현재 달의 이월이 없으면 전월 잔여를 계산하여 자동 생성
   * @param {string} currentMonth - YYYY-MM 형식
   * @returns {Promise<number>} 생성된 이월 개수
   */
  const autoCreateMonthlyCarryover = useCallback(async (currentMonth) => {
    try {
      const { dateUtils } = require('./utils');
      const [currentYear, currentMonthNum] = currentMonth.split('-');
      
      // 1. 현재 달의 이월이 이미 있는지 확인 (DB에서 직접 확인)
      const allCarryovers = await dataService.getCarryoverRecords();
      const existingCarryovers = allCarryovers.filter(
        record => record.year === parseInt(currentYear) && 
                  record.month === parseInt(currentMonthNum)
      );
      
      if (existingCarryovers.length > 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ ${currentMonth} 이월이 이미 있음 (${existingCarryovers.length}건), Skip`);
        }
        return 0; // 이미 있으면 종료
      }
      
      // 2. 지난 달 구하기
      const lastMonthNum = currentMonthNum === '01' ? '12' : String(parseInt(currentMonthNum) - 1).padStart(2, '0');
      const lastMonthYear = currentMonthNum === '01' ? String(parseInt(currentYear) - 1) : currentYear;
      const lastMonth = `${lastMonthYear}-${lastMonthNum}`;
      
      // 3. 활성 직원 목록 가져오기
      const activeEmployees = employees.filter(emp => !emp.deletedAt);
      
      if (activeEmployees.length === 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log('⚠️ 활성 직원이 없음, 이월 생성 Skip');
        }
        return 0;
      }
      
      // 4. 각 직원별 지난 달 잔여시간 계산 및 이월 생성
      let createdCount = 0;
      let skippedCount = 0;
      
      for (const employee of activeEmployees) {
        try {
          // 지난 달 잔여시간 계산
          const lastMonthStats = dataCalculator.getMonthlyStats(
            employee.id,
            lastMonth,
            overtimeRecords,
            vacationRecords,
            multiplier
          );
          
          const carryoverMinutes = lastMonthStats.remaining;
          
          // 이월 레코드 생성 (잔여가 0이어도 생성)
          await createCarryoverRecord({
            employeeId: employee.id,
            year: parseInt(currentYear),
            month: parseInt(currentMonthNum),
            carryoverRemainingMinutes: carryoverMinutes,
            sourceMonthMultiplier: multiplier
          });
          
          createdCount++;
        } catch (error) {
          // duplicate key 에러는 무시 (이미 있음)
          if (error.message && error.message.includes('unique_employee_year_month')) {
            skippedCount++;
          } else {
            // 다른 에러는 로그
            if (process.env.NODE_ENV === 'development') {
              console.error(`⚠️ ${employee.name} 이월 생성 실패:`, error.message);
            }
          }
        }
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ ${currentMonth} 이월 자동 생성 완료: ${createdCount}건 생성, ${skippedCount}건 스킵`);
      }
      
      return createdCount;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ 이월 자동 생성 실패:', error);
      }
      return 0;
    }
  }, [employees, overtimeRecords, vacationRecords, multiplier, createCarryoverRecord, dataService]);

  /**
   * 과거 모든 달 이월 백필 (일회성 작업)
   * @param {string} startMonth - 시작 월 (YYYY-MM)
   * @param {string} endMonth - 종료 월 (YYYY-MM)
   * @returns {Promise<object>} { total, created, skipped }
   */
  const backfillCarryovers = useCallback(async (startMonth, endMonth) => {
    try {
      console.log(`🔄 이월 백필 시작: ${startMonth} ~ ${endMonth}`);
      
      let totalMonths = 0;
      let totalCreated = 0;
      let totalSkipped = 0;
      
      // 월 목록 생성
      const months = [];
      let current = new Date(startMonth + '-01');
      const end = new Date(endMonth + '-01');
      
      while (current <= end) {
        const yearMonth = current.toISOString().slice(0, 7);
        months.push(yearMonth);
        current.setMonth(current.getMonth() + 1);
      }
      
      console.log(`📅 총 ${months.length}개월 처리 예정:`, months);
      
      // 각 달에 대해 이월 생성
      for (const month of months) {
        console.log(`\n🔄 ${month} 처리 중...`);
        const created = await autoCreateMonthlyCarryover(month);
        
        totalMonths++;
        if (created > 0) {
          totalCreated += created;
          console.log(`  ✅ ${created}건 생성`);
        } else {
          totalSkipped++;
          console.log(`  ⏭️ 스킵 (이미 있음)`);
        }
        
        // 진행률
        const progress = Math.round((totalMonths / months.length) * 100);
        console.log(`📊 진행률: ${progress}% (${totalMonths}/${months.length})`);
      }
      
      const result = {
        total: totalMonths,
        created: totalCreated,
        skipped: totalSkipped
      };
      
      console.log('\n🎉 백필 완료!');
      console.log(`  - 처리한 월: ${result.total}개월`);
      console.log(`  - 생성됨: ${result.created}건`);
      console.log(`  - 스킵됨: ${result.skipped}개월`);
      
      return result;
    } catch (error) {
      console.error('❌ 백필 실패:', error);
      throw error;
    }
  }, [autoCreateMonthlyCarryover]);

  // 월 변경 시 자동 이월 생성
  useEffect(() => {
    // 중복 실행 방지
    if (isCreatingCarryoverRef.current) {
      return;
    }
    
    // 데이터 로딩 중이거나 직원이 없으면 Skip
    if (isLoading || employees.length === 0) {
      return;
    }
    
    // 현재 달만 자동 생성 (과거 달은 수동 관리)
    const currentYearMonth = new Date().toISOString().slice(0, 7);
    if (selectedMonth !== currentYearMonth) {
      return;
    }
    
    isCreatingCarryoverRef.current = true;
    
    autoCreateMonthlyCarryover(selectedMonth).finally(() => {
      isCreatingCarryoverRef.current = false;
    });
  }, [selectedMonth, isLoading, employees.length, autoCreateMonthlyCarryover]);

  return {
    // 상태
    employees,
    overtimeRecords,
    vacationRecords,
    employeeChangeRecords,
    carryoverRecords,
    isLoading,
    error,
    multiplier,
    selectedMonth,
    setSelectedMonth,

    // 직원 관리
    addEmployee,
    updateEmployee,
    deleteEmployee,

    // 시간 기록 관리
    updateOvertimeRecord,
    updateVacationRecord,
    bulkUpdateOvertimeRecords,
    bulkUpdateVacationRecords,

    // Dashboard 지원
    getAllEmployeesWithRecords,
    getDailyData,
    getMonthlyStats,
    updateDailyTime,

    // 이월 관리
    getCarryoverForEmployee,
    createCarryoverRecord,
    updateCarryoverRecord,
    checkAndRecalculateCarryover,
    autoCreateMonthlyCarryover,
    backfillCarryovers,

    // 유틸리티
    getEmployeeNameFromRecord,

    // 설정 관리
    updateSettings,

    clearCache: () => dataService.clearCache()
  };
};

export const OvertimeProvider = ({ children }) => {
  const overtimeData = useOvertimeData();

  const value = useMemo(() => ({
    ...overtimeData
  }), [overtimeData]);
  
  // 개발 환경에서 콘솔에 함수 노출
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      window.__overtimeContext = {
        backfillCarryovers: overtimeData.backfillCarryovers,
        autoCreateMonthlyCarryover: overtimeData.autoCreateMonthlyCarryover,
      };
    }
  }, [overtimeData.backfillCarryovers, overtimeData.autoCreateMonthlyCarryover]);

  // 로딩 상태 표시
  if (overtimeData.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">데이터를 로드하는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태 표시
  if (overtimeData.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">데이터 로드 실패</h3>
          <p className="text-red-600 mb-4">{overtimeData.error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <OvertimeContext.Provider value={value}>
      {children}
    </OvertimeContext.Provider>
  );
};
