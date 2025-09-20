import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { createStorageAdapter } from './services/storage/index.js';
import { getDataService } from './services/dataService.js';
import { dataCalculator } from './dataManager';
import { getConfig } from './services/config.js';
import { createClient } from '@supabase/supabase-js';
import { createAuthService } from './services/authService.js';

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
        const supabaseClient = createClient(supabaseConfig.url, supabaseConfig.anonKey);
        createStorageAdapter({ type: 'supabase', options: { supabaseClient } });
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Supabase client created successfully');
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
  const [overtimeRecords, setOvertimeRecords] = useState([]);
  const [vacationRecords, setVacationRecords] = useState([]);
  const [employeeChangeRecords, setEmployeeChangeRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔐 인증 관련 상태
  const [currentUser, setCurrentUser] = useState(null);
  const [authService, setAuthService] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const dataService = getDataService();

  // 🔐 인증 서비스 초기화
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsAuthLoading(true);
        
        const config = getConfig();
        const storageConfig = config.getStorageConfig();
        
        if (storageConfig.type === 'supabase') {
          const supabaseConfig = config.getSupabaseConfig();
          const validation = config.validate();
          
          if (validation.isValid) {
            const supabaseClient = createClient(supabaseConfig.url, supabaseConfig.anonKey);
            const authSvc = createAuthService(supabaseClient);
            setAuthService(authSvc);
            
            // 현재 세션 확인
            const session = await authSvc.getCurrentSession();
            if (session?.user) {
              setCurrentUser(authSvc.getCurrentUser());
            }
            
            // 인증 상태 변경 리스너 등록
            authSvc.onAuthStateChange((event, session, user) => {
              setCurrentUser(user);
            });
            
            if (process.env.NODE_ENV === 'development') {
              console.log('🔐 Auth service initialized');
            }
          }
        }
      } catch (error) {
        console.error('인증 서비스 초기화 실패:', error);
      } finally {
        setIsAuthLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 데이터 계층 초기화
        await initializeDataLayer();
        // 데이터 로드
        const [employeesData, employeeChangesData] = await Promise.all([
          dataService.getEmployees(),
          dataService.getEmployeeChangeRecords()
        ]);

        setEmployees(employeesData || []);
        setEmployeeChangeRecords(employeeChangesData || []);
        
        // 전체 데이터 로드 (모든 월의 데이터)
        const allRecords = await dataService.getAllRecords();
        setOvertimeRecords(allRecords.overtimeRecords || []);
        setVacationRecords(allRecords.vacationRecords || []);

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
  }, [dataService]);

  // 🔐 인증 관련 함수들
  const signIn = useCallback(async (email, password) => {
    if (!authService) throw new Error('인증 서비스가 초기화되지 않았습니다.');
    return await authService.signIn(email, password);
  }, [authService]);

  const signOut = useCallback(async () => {
    if (!authService) return;
    return await authService.signOut();
  }, [authService]);

  const isAuthenticated = useCallback(() => {
    return authService?.isAuthenticated() || false;
  }, [authService]);

  const isAdmin = useCallback(() => {
    return authService?.isAdmin() || false;
  }, [authService]);

  const canAccessSalaryInfo = useCallback(() => {
    return authService?.canAccessSalaryInfo() || false;
  }, [authService]);

  const addEmployee = useCallback(async (name) => {
    try {
      const newEmployee = await dataService.addEmployee(name);
      setEmployees(prev => [...prev, newEmployee]);
      
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
  }, [dataService]);

  const updateEmployee = useCallback(async (id, newName) => {
    try {
      const updatedEmployee = await dataService.updateEmployee(id, newName);
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

  const deleteEmployee = useCallback(async (id) => {
    try {
      const deletedEmployee = await dataService.deleteEmployee(id);
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      
      // 변경 이력 새로고침
      const updatedChanges = await dataService.getEmployeeChangeRecords();
      setEmployeeChangeRecords(updatedChanges);
      
      dataCalculator.invalidateRelatedCaches(id);
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
    const deletedEmployees = [];
    
    records.forEach(record => {
      if (record.employeeName && record.totalMinutes > 0 && 
          !activeEmployees.find(emp => emp.id === record.employeeId)) {
        if (!deletedEmployees.find(emp => emp.id === record.employeeId)) {
          deletedEmployees.push({
            id: record.employeeId,
            name: record.employeeName,
            createdAt: record.createdAt,
            isActive: false
          });
        }
      }
    });
    
    return deletedEmployees;
  };

  const getAllEmployeesWithRecords = useCallback((currentSelectedMonth) => {
    // 활성 직원들 (생성월 이후에만 표시)
    const activeEmployees = employees
      .filter(employee => {
        if (!isValidEmployeeDate(employee)) return true;
        const employeeCreatedMonth = getEmployeeCreatedMonth(employee);
        return employeeCreatedMonth <= currentSelectedMonth;
      })
      .map(employee => ({
        ...employee,
        isActive: true
      }));

    // 선택된 월의 데이터만 필터링
    const [year, month] = currentSelectedMonth.split('-');
    const monthlyOvertimeRecords = filterRecordsByMonth(overtimeRecords, year, month);
    const monthlyVacationRecords = filterRecordsByMonth(vacationRecords, year, month);

    // 삭제된 직원 중 해당 월에 데이터가 있는 직원들 추출
    const deletedFromOvertime = extractDeletedEmployeesFromRecords(monthlyOvertimeRecords, activeEmployees);
    const deletedFromVacation = extractDeletedEmployeesFromRecords(monthlyVacationRecords, activeEmployees);
    
    // 중복 제거하여 동일한 삭제된 직원 결합
    const allDeletedEmployees = [...deletedFromOvertime];
    deletedFromVacation.forEach(vacEmployee => {
      if (!allDeletedEmployees.find(emp => emp.id === vacEmployee.id)) {
        allDeletedEmployees.push(vacEmployee);
      }
    });

    // 활성 직원 + 해당 월에 데이터가 있는 삭제된 직원 결합
    return [...activeEmployees, ...allDeletedEmployees];
  }, [employees, overtimeRecords, vacationRecords]);


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

  return {
    // 기존 상태
    employees,
    overtimeRecords,
    vacationRecords,
    employeeChangeRecords,
    isLoading,
    error,
    multiplier,

    // 🔐 인증 관련 상태
    currentUser,
    isAuthLoading,
    isAuthEnabled: !!authService,

    // 기존 직원 관리
    addEmployee,
    updateEmployee,
    deleteEmployee,

    // 기존 시간 기록 관리
    updateOvertimeRecord,
    updateVacationRecord,
    bulkUpdateOvertimeRecords,
    bulkUpdateVacationRecords,

    // 기존 Dashboard 지원
    getAllEmployeesWithRecords,
    getDailyData,
    getMonthlyStats,
    updateDailyTime,

    // 🔐 인증 관련 함수
    signIn,
    signOut,
    isAuthenticated,
    isAdmin,
    canAccessSalaryInfo,

    // 기존 유틸리티
    getEmployeeNameFromRecord,
    updateSettings,
    clearCache: () => dataService.clearCache()
  };
};

export const OvertimeProvider = ({ children }) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return new Date().toISOString().slice(0, 7);
  });

  const overtimeData = useOvertimeData();

  const value = useMemo(() => ({
    selectedMonth,
    setSelectedMonth,
    ...overtimeData
  }), [selectedMonth, overtimeData]);

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
