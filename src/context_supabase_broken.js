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
  const [employees, setEmployees] = useState([]);
  const [overtimeRecords, setOvertimeRecords] = useState([]);
  const [vacationRecords, setVacationRecords] = useState([]);
  const [employeeChangeRecords, setEmployeeChangeRecords] = useState([]);

  // Supabase 사용 여부 결정
  const USE_SUPABASE = process.env.REACT_APP_USE_SUPABASE === 'true';

  useEffect(() => {
    const loadData = async () => {
      try {
        if (USE_SUPABASE) {
          // Supabase에서 데이터 로드
          const [employeesData, historyData] = await Promise.all([
            employeeAPI.getAll(),
            historyAPI.getAll()
          ]);
          
          setEmployees(employeesData);
          setEmployeeChangeRecords(historyData);
          
          // 현재 월의 기록만 로드
          const currentMonth = new Date().toISOString().slice(0, 7);
          const [overtimeData, vacationData] = await Promise.all([
            overtimeAPI.getByMonth(currentMonth),
            vacationAPI.getByMonth(currentMonth)
          ]);
          
          setOvertimeRecords(overtimeData);
          setVacationRecords(vacationData);
        } else {
          // 기존 localStorage 로직
          setEmployees(storageManager.load('overtime-employees'));
          setOvertimeRecords(storageManager.load('overtime-records'));
          setVacationRecords(storageManager.load('vacation-records'));
          setEmployeeChangeRecords(storageManager.load('employee-change-records'));
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        // 오류 시 localStorage 폴백
        setEmployees(storageManager.load('overtime-employees'));
        setOvertimeRecords(storageManager.load('overtime-records'));
        setVacationRecords(storageManager.load('vacation-records'));
        setEmployeeChangeRecords(storageManager.load('employee-change-records'));
      }
    };

    loadData();
  }, [USE_SUPABASE]);

  const addEmployee = useCallback(async (name) => {
    try {
      if (USE_SUPABASE) {
        const newEmployee = await employeeAPI.create(name);
        setEmployees(prev => [...prev, newEmployee]);
        
        // 변경 이력 새로고침
        const historyData = await historyAPI.getAll();
        setEmployeeChangeRecords(historyData);
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
    } catch (error) {
      console.error('Failed to add employee:', error);
      throw error;
    }
  }, [USE_SUPABASE, employees, employeeChangeRecords]);

  const updateEmployee = useCallback(async (id, newName) => {
    try {
      if (USE_SUPABASE) {
        const updatedEmployee = await employeeAPI.update(id, newName);
        setEmployees(prev => prev.map(emp => 
          emp.id === id ? updatedEmployee : emp
        ));
        
        // 변경 이력 새로고침
        const historyData = await historyAPI.getAll();
        setEmployeeChangeRecords(historyData);
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
    } catch (error) {
      console.error('Failed to update employee:', error);
      throw error;
    }
  }, [USE_SUPABASE, employees, employeeChangeRecords]);

  const deleteEmployee = useCallback(async (id) => {
    try {
      if (USE_SUPABASE) {
        await employeeAPI.delete(id);
        setEmployees(prev => prev.filter(emp => emp.id !== id));
        
        // 변경 이력 새로고침
        const historyData = await historyAPI.getAll();
        setEmployeeChangeRecords(historyData);
      } else {
        // 기존 localStorage 로직
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
    } catch (error) {
      console.error('Failed to delete employee:', error);
      throw error;
    }
  }, [USE_SUPABASE, employees, employeeChangeRecords]);

  const updateOvertimeRecord = useCallback(async (employeeId, date, totalMinutes) => {
    try {
      if (USE_SUPABASE) {
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
    } catch (error) {
      console.error('Failed to update overtime record:', error);
      throw error;
    }
  }, [USE_SUPABASE, overtimeRecords]);

  const updateVacationRecord = useCallback(async (employeeId, date, totalMinutes) => {
    try {
      if (USE_SUPABASE) {
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
    } catch (error) {
      console.error('Failed to update vacation record:', error);
      throw error;
    }
  }, [USE_SUPABASE, vacationRecords]);

  const bulkUpdateOvertimeRecords = useCallback(async (updates) => {
    try {
      if (USE_SUPABASE) {
        // Supabase에서는 개별 업데이트
        for (const update of updates) {
          await overtimeAPI.upsert(update.employeeId, update.date, update.totalMinutes);
        }
        
        // 현재 월 데이터 새로고침
        const currentMonth = new Date().toISOString().slice(0, 7);
        const overtimeData = await overtimeAPI.getByMonth(currentMonth);
        setOvertimeRecords(overtimeData);
      } else {
        // 기존 localStorage 로직
        const newRecords = updates.map(update => ({
          id: Date.now() + Math.random(),
          employeeId: update.employeeId,
          date: update.date,
          totalMinutes: update.totalMinutes,
          createdAt: new Date().toISOString()
        }));
        
        const updated = [...overtimeRecords, ...newRecords];
        setOvertimeRecords(updated);
        storageManager.save('overtime-records', updated);
      }
      
      dataCalculator.clearCache();
    } catch (error) {
      console.error('Failed to bulk update overtime records:', error);
      throw error;
    }
  }, [USE_SUPABASE, overtimeRecords]);

  const bulkUpdateVacationRecords = useCallback(async (updates) => {
    try {
      if (USE_SUPABASE) {
        // Supabase에서는 개별 업데이트
        for (const update of updates) {
          await vacationAPI.upsert(update.employeeId, update.date, update.totalMinutes);
        }
        
        // 현재 월 데이터 새로고침
        const currentMonth = new Date().toISOString().slice(0, 7);
        const vacationData = await vacationAPI.getByMonth(currentMonth);
        setVacationRecords(vacationData);
      } else {
        // 기존 localStorage 로직
        const newRecords = updates.map(update => ({
          id: Date.now() + Math.random(),
          employeeId: update.employeeId,
          date: update.date,
          totalMinutes: update.totalMinutes,
          createdAt: new Date().toISOString()
        }));
        
        const updated = [...vacationRecords, ...newRecords];
        setVacationRecords(updated);
        storageManager.save('vacation-records', updated);
      }
      
      dataCalculator.clearCache();
    } catch (error) {
      console.error('Failed to bulk update vacation records:', error);
      throw error;
    }
  }, [USE_SUPABASE, vacationRecords]);

  // 월 변경 시 데이터 로딩
  const loadMonthData = useCallback(async (month) => {
    if (!USE_SUPABASE) return; // localStorage는 이미 모든 데이터가 로드됨
    
    try {
      const [overtimeData, vacationData] = await Promise.all([
        overtimeAPI.getByMonth(month),
        vacationAPI.getByMonth(month)
      ]);
      
      setOvertimeRecords(overtimeData);
      setVacationRecords(vacationData);
    } catch (error) {
      console.error('Failed to load month data:', error);
    }
  }, [USE_SUPABASE]);

  return {
    employees,
    overtimeRecords,
    vacationRecords,
    employeeChangeRecords,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    updateOvertimeRecord,
    updateVacationRecord,
    bulkUpdateOvertimeRecords,
    bulkUpdateVacationRecords,
    loadMonthData,
    USE_SUPABASE
  };
};

// ========== PROVIDER ==========
export const OvertimeProvider = ({ children }) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return new Date().toISOString().slice(0, 7);
  });

  const overtimeData = useOvertimeData();

  // 월 변경 시 Supabase 데이터 로딩
  useEffect(() => {
    if (overtimeData.USE_SUPABASE) {
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
