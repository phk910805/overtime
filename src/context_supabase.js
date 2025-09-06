import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { storageManager, dataCalculator } from './dataManager';
import { employeeAPI, overtimeAPI, vacationAPI, historyAPI, settingsAPI } from './services/api';

// ========== CONTEXT ==========
const OvertimeContext = createContext();

export const useOvertimeContext = () => {
  const context = useContext(OvertimeContext);
  if (!context) {
    throw new Error('useOvertimeContext must be used within OvertimeProvider');
  }
  return context;
};

// ========== CUSTOM HOOKS ==========
const useOvertimeData = () => {
  // 상태 관리
  const [employees, setEmployees] = useState([]);
  const [overtimeRecords, setOvertimeRecords] = useState([]);
  const [vacationRecords, setVacationRecords] = useState([]);
  const [employeeChangeRecords, setEmployeeChangeRecords] = useState([]);
  const [settings, setSettings] = useState({ multiplier: 1.0 });
  
  // 로딩 및 에러 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Supabase 사용 여부 플래그
  const useSupabase = process.env.REACT_APP_USE_SUPABASE === 'true';

  // ========== 데이터 로딩 함수들 ==========
  const loadEmployees = useCallback(async () => {
    try {
      if (useSupabase) {
        const data = await employeeAPI.getAll();
        setEmployees(data);
      } else {
        // 기존 localStorage 로직
        setEmployees(storageManager.load('overtime-employees'));
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
      setError(err.message);
    }
  }, [useSupabase]);

  const loadOvertimeRecords = useCallback(async () => {
    try {
      if (useSupabase) {
        // 현재 월의 데이터만 로드 (성능 최적화)
        const currentMonth = new Date().toISOString().slice(0, 7);
        const data = await overtimeAPI.getByMonth(currentMonth);
        setOvertimeRecords(data);
      } else {
        setOvertimeRecords(storageManager.load('overtime-records'));
      }
    } catch (err) {
      console.error('Failed to load overtime records:', err);
      setError(err.message);
    }
  }, [useSupabase]);

  const loadVacationRecords = useCallback(async () => {
    try {
      if (useSupabase) {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const data = await vacationAPI.getByMonth(currentMonth);
        setVacationRecords(data);
      } else {
        setVacationRecords(storageManager.load('vacation-records'));
      }
    } catch (err) {
      console.error('Failed to load vacation records:', err);
      setError(err.message);
    }
  }, [useSupabase]);

  const loadEmployeeChangeRecords = useCallback(async () => {
    try {
      if (useSupabase) {
        const data = await historyAPI.getAll();
        setEmployeeChangeRecords(data);
      } else {
        setEmployeeChangeRecords(storageManager.load('employee-change-records'));
      }
    } catch (err) {
      console.error('Failed to load employee change records:', err);
      setError(err.message);
    }
  }, [useSupabase]);

  const loadSettings = useCallback(async () => {
    try {
      if (useSupabase) {
        const multiplier = await settingsAPI.get('multiplier');
        setSettings({ multiplier: multiplier ? parseFloat(multiplier) : 1.0 });
      } else {
        setSettings(storageManager.loadSettings());
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError(err.message);
    }
  }, [useSupabase]);

  // ========== 초기 데이터 로딩 ==========
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          loadEmployees(),
          loadOvertimeRecords(),
          loadVacationRecords(),
          loadEmployeeChangeRecords(),
          loadSettings()
        ]);
      } catch (err) {
        console.error('Failed to load initial data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [loadEmployees, loadOvertimeRecords, loadVacationRecords, loadEmployeeChangeRecords, loadSettings]);

  // ========== 직원 관리 함수들 ==========
  const addEmployee = useCallback(async (name) => {
    try {
      setLoading(true);
      
      if (useSupabase) {
        const newEmployee = await employeeAPI.create(name);
        setEmployees(prev => [...prev, newEmployee]);
        await loadEmployeeChangeRecords(); // 변경 이력 새로고침
      } else {
        // 기존 localStorage 로직
        const newEmployee = {
          id: Date.now(),
          name: name.trim(),
          createdAt: new Date().toISOString()
        };
        const updated = [...employees, newEmployee];
        setEmployees(updated);
        storageManager.save('overtime-employees', updated);
        
        const createRecord = {
          id: Date.now() + Math.random(),
          employeeId: newEmployee.id,
          action: '생성',
          employeeName: newEmployee.name,
          createdAt: newEmployee.createdAt
        };
        
        const updatedChangeRecords = [...employeeChangeRecords, createRecord];
        setEmployeeChangeRecords(updatedChangeRecords);
        storageManager.save('employee-change-records', updatedChangeRecords);
      }
      
      dataCalculator.invalidateRelatedCaches();
    } catch (err) {
      console.error('Failed to add employee:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [useSupabase, employees, employeeChangeRecords, loadEmployeeChangeRecords]);

  const updateEmployee = useCallback(async (id, newName) => {
    try {
      setLoading(true);
      
      if (useSupabase) {
        const updatedEmployee = await employeeAPI.update(id, newName);
        setEmployees(prev => prev.map(emp => 
          emp.id === id ? updatedEmployee : emp
        ));
        await loadEmployeeChangeRecords();
      } else {
        // 기존 localStorage 로직
        const updated = employees.map(emp => 
          emp.id === id ? { ...emp, name: newName.trim() } : emp
        );
        setEmployees(updated);
        storageManager.save('overtime-employees', updated);
        
        const updateRecord = {
          id: Date.now() + Math.random(),
          employeeId: id,
          action: '수정',
          employeeName: newName.trim(),
          createdAt: new Date().toISOString()
        };
        
        const updatedChangeRecords = [...employeeChangeRecords, updateRecord];
        setEmployeeChangeRecords(updatedChangeRecords);
        storageManager.save('employee-change-records', updatedChangeRecords);
      }
      
      dataCalculator.invalidateRelatedCaches(id);
    } catch (err) {
      console.error('Failed to update employee:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [useSupabase, employees, employeeChangeRecords, loadEmployeeChangeRecords]);

  const deleteEmployee = useCallback(async (id) => {
    try {
      setLoading(true);
      
      if (useSupabase) {
        await employeeAPI.delete(id);
        setEmployees(prev => prev.filter(emp => emp.id !== id));
        await loadEmployeeChangeRecords();
      } else {
        // 기존 localStorage 로직 (소프트 삭제)
        const employeeToDelete = employees.find(emp => emp.id === id);
        if (!employeeToDelete) return;
        
        const updated = employees.filter(emp => emp.id !== id);
        setEmployees(updated);
        storageManager.save('overtime-employees', updated);
        
        const deleteRecord = {
          id: Date.now() + Math.random(),
          employeeId: id,
          action: '삭제',
          employeeName: employeeToDelete.name,
          createdAt: new Date().toISOString()
        };
        
        const updatedChangeRecords = [...employeeChangeRecords, deleteRecord];
        setEmployeeChangeRecords(updatedChangeRecords);
        storageManager.save('employee-change-records', updatedChangeRecords);
      }
      
      dataCalculator.invalidateRelatedCaches(id);
    } catch (err) {
      console.error('Failed to delete employee:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [useSupabase, employees, employeeChangeRecords, loadEmployeeChangeRecords]);

  // ========== 시간 기록 함수들 ==========
  const updateOvertimeRecord = useCallback(async (employeeId, date, totalMinutes) => {
    try {
      setLoading(true);
      
      if (useSupabase) {
        const updatedRecord = await overtimeAPI.upsert(employeeId, date, totalMinutes);
        setOvertimeRecords(prev => {
          const filtered = prev.filter(record => 
            !(record.employeeId === employeeId && record.date === date)
          );
          return [...filtered, updatedRecord];
        });
      } else {
        // 기존 localStorage 로직
        const newRecord = {
          id: Date.now() + Math.random(),
          employeeId,
          date,
          totalMinutes,
          createdAt: new Date().toISOString()
        };
        
        const updated = [...overtimeRecords, newRecord];
        setOvertimeRecords(updated);
        storageManager.save('overtime-records', updated);
      }
      
      dataCalculator.invalidateRelatedCaches(employeeId, date);
    } catch (err) {
      console.error('Failed to update overtime record:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [useSupabase, overtimeRecords]);

  const updateVacationRecord = useCallback(async (employeeId, date, totalMinutes) => {
    try {
      setLoading(true);
      
      if (useSupabase) {
        const updatedRecord = await vacationAPI.upsert(employeeId, date, totalMinutes);
        setVacationRecords(prev => {
          const filtered = prev.filter(record => 
            !(record.employeeId === employeeId && record.date === date)
          );
          return [...filtered, updatedRecord];
        });
      } else {
        // 기존 localStorage 로직
        const newRecord = {
          id: Date.now() + Math.random(),
          employeeId,
          date,
          totalMinutes,
          createdAt: new Date().toISOString()
        };
        
        const updated = [...vacationRecords, newRecord];
        setVacationRecords(updated);
        storageManager.save('vacation-records', updated);
      }
      
      dataCalculator.invalidateRelatedCaches(employeeId, date);
    } catch (err) {
      console.error('Failed to update vacation record:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [useSupabase, vacationRecords]);

  // ========== 설정 함수들 ==========
  const updateSettings = useCallback(async (newSettings) => {
    try {
      setLoading(true);
      
      if (useSupabase) {
        await settingsAPI.set('multiplier', newSettings.multiplier.toString());
        setSettings(newSettings);
      } else {
        setSettings(newSettings);
        storageManager.saveSettings(newSettings);
      }
      
      dataCalculator.clearCache();
    } catch (err) {
      console.error('Failed to update settings:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [useSupabase]);

  // ========== 월별 데이터 로딩 ==========
  const loadMonthData = useCallback(async (month) => {
    if (!useSupabase) return; // localStorage는 모든 데이터가 이미 로드됨
    
    try {
      setLoading(true);
      const [overtimeData, vacationData] = await Promise.all([
        overtimeAPI.getByMonth(month),
        vacationAPI.getByMonth(month)
      ]);
      
      setOvertimeRecords(overtimeData);
      setVacationRecords(vacationData);
    } catch (err) {
      console.error('Failed to load month data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [useSupabase]);

  return {
    // 상태
    employees,
    overtimeRecords,
    vacationRecords,
    employeeChangeRecords,
    settings,
    loading,
    error,
    useSupabase,
    
    // 함수
    addEmployee,
    updateEmployee,
    deleteEmployee,
    updateOvertimeRecord,
    updateVacationRecord,
    updateSettings,
    loadMonthData,
    
    // 유틸리티
    clearError: () => setError(null),
    refreshData: () => {
      loadEmployees();
      loadOvertimeRecords();
      loadVacationRecords();
      loadEmployeeChangeRecords();
      loadSettings();
    }
  };
};

// ========== PROVIDER ==========
export const OvertimeProvider = ({ children }) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return new Date().toISOString().slice(0, 7);
  });

  const overtimeData = useOvertimeData();

  // 월 변경 시 해당 월 데이터 로딩
  useEffect(() => {
    if (overtimeData.useSupabase) {
      overtimeData.loadMonthData(selectedMonth);
    }
  }, [selectedMonth, overtimeData]);

  const value = useMemo(() => ({
    selectedMonth,
    setSelectedMonth,
    ...overtimeData
  }), [selectedMonth, overtimeData]);

  return (
    <OvertimeContext.Provider value={value}>
      {children}
    </OvertimeContext.Provider>
  );
};
