import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { createStorageAdapter } from './services/storage/index.js';
import { getDataService } from './services/dataService.js';
import { dataCalculator } from './dataManager';

// BACKUP: 복원용 imports (Supabase 모드용)
// import { getConfig } from './services/config.js';
// import { createClient } from '@supabase/supabase-js';

const OvertimeContext = createContext();

export const useOvertimeContext = () => {
  const context = useContext(OvertimeContext);
  if (!context) {
    throw new Error('useOvertimeContext must be used within OvertimeProvider');
  }
  return context;
};

let isInitialized = false;

// BACKUP: 기존 복잡한 초기화 로직 (복원용)
// const initializeDataLayer_COMPLEX = async () => {
//   if (isInitialized) return;
//   try {
//     const config = getConfig();
//     const storageConfig = config.getStorageConfig();
//     console.log('Initializing data layer:', storageConfig.type);
//     if (storageConfig.type === 'supabase') {
//       const supabaseConfig = config.getSupabaseConfig();
//       if (!supabaseConfig.url || !supabaseConfig.anonKey) {
//         console.warn('Supabase config missing, falling back to localStorage');
//         createStorageAdapter({ type: 'localStorage' });
//       } else {
//         const supabaseClient = createClient(supabaseConfig.url, supabaseConfig.anonKey);
//         createStorageAdapter({ type: 'supabase', options: { supabaseClient } });
//       }
//     } else {
//       createStorageAdapter({ type: 'localStorage' });
//     }
//     isInitialized = true;
//     console.log('Data layer initialized successfully');
//   } catch (error) {
//     console.error('Failed to initialize data layer:', error);
//     createStorageAdapter({ type: 'localStorage' });
//     isInitialized = true;
//   }
// };

// 단순화된 초기화 로직 (현재 환경: localStorage 전용)
const initializeDataLayer = () => {
  if (isInitialized) return;
  if (process.env.NODE_ENV === 'development') {
    console.log('Initializing data layer: localStorage');
  }
  createStorageAdapter({ type: 'localStorage' });
  isInitialized = true;
  if (process.env.NODE_ENV === 'development') {
    console.log('Data layer initialized successfully');
  }
};

const useOvertimeData = () => {
  const [employees, setEmployees] = useState([]);
  const [overtimeRecords, setOvertimeRecords] = useState([]);
  const [vacationRecords, setVacationRecords] = useState([]);
  const [employeeChangeRecords, setEmployeeChangeRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const dataService = getDataService();

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 데이터 계층 초기화
        initializeDataLayer();
        // 데이터 로드
        const [employeesData, employeeChangesData] = await Promise.all([
          dataService.getEmployees(),
          dataService.getEmployeeChangeRecords()
        ]);

        setEmployees(employeesData || []);
        setEmployeeChangeRecords(employeeChangesData || []);
        // 현재 월 시간 기록 로드
        const currentMonth = new Date().toISOString().slice(0, 7);
        const monthlyRecords = await dataService.getMonthlyRecords(currentMonth);
        
        setOvertimeRecords(monthlyRecords.overtimeRecords || []);
        setVacationRecords(monthlyRecords.vacationRecords || []);

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

  const getAllEmployeesWithRecords = useMemo(() => {
    return employees.map(employee => ({
      ...employee,
      isActive: true
    }));
  }, [employees]);

  const getDailyData = useCallback((employeeId, date, type) => {
    return dataCalculator.getDailyData(employeeId, date, type, overtimeRecords, vacationRecords);
  }, [overtimeRecords, vacationRecords]);

  const getMonthlyStats = useCallback((employeeId) => {
    const selectedMonth = new Date().toISOString().slice(0, 7);
    const safeMultiplier = 1.0; // 기본값 사용, Dashboard에서 multiplier 적용
    return dataCalculator.getMonthlyStats(employeeId, selectedMonth, overtimeRecords, vacationRecords, safeMultiplier);
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
    // 상태
    employees,
    overtimeRecords,
    vacationRecords,
    employeeChangeRecords,
    isLoading,
    error,
    multiplier,

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

    // 유틸리티
    getEmployeeNameFromRecord,

    // 설정 관리
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
