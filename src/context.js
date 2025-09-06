import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { storageManager, dataCalculator } from './dataManager';
// Supabase API 추가 (기존 코드와 독립적)
import { 
  supabaseEmployeeAPI, 
  supabaseOvertimeAPI, 
  supabaseVacationAPI, 
  supabaseHistoryAPI 
} from './services/supabaseAPI';

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

  // 모드 전환 로직 (기본값: localStorage)
  const useSupabase = process.env.REACT_APP_USE_SUPABASE === 'true';

  useEffect(() => {
    const loadData = async () => {
      if (useSupabase) {
        // Supabase 모드
        try {
          const [employeesData, historyData] = await Promise.all([
            supabaseEmployeeAPI.getAll(),
            supabaseHistoryAPI.getAll()
          ]);
          setEmployees(employeesData || []);
          setEmployeeChangeRecords(historyData || []);
          
          const currentMonth = new Date().toISOString().slice(0, 7);
          const [overtimeData, vacationData] = await Promise.all([
            supabaseOvertimeAPI.getByMonth(currentMonth),
            supabaseVacationAPI.getByMonth(currentMonth)
          ]);
          setOvertimeRecords(overtimeData || []);
          setVacationRecords(vacationData || []);
        } catch (error) {
          console.error('Supabase 로드 실패, localStorage로 폴백:', error);
          // 오류 시 localStorage로 폴백
          setEmployees(storageManager.load('overtime-employees'));
          setOvertimeRecords(storageManager.load('overtime-records'));
          setVacationRecords(storageManager.load('vacation-records'));
          setEmployeeChangeRecords(storageManager.load('employee-change-records'));
        }
      } else {
        // 기존 localStorage 모드 (기본값)
        setEmployees(storageManager.load('overtime-employees'));
        setOvertimeRecords(storageManager.load('overtime-records'));
        setVacationRecords(storageManager.load('vacation-records'));
        setEmployeeChangeRecords(storageManager.load('employee-change-records'));
      }
    };
    
    loadData();
  }, [useSupabase]);

  const addEmployee = useCallback(async (name) => {
    if (useSupabase) {
      // Supabase 모드
      try {
        const newEmployee = await supabaseEmployeeAPI.create(name);
        setEmployees(prev => [...prev, newEmployee]);
        // 새로고침된 이력 데이터 로드
        const historyData = await supabaseHistoryAPI.getAll();
        setEmployeeChangeRecords(historyData || []);
      } catch (error) {
        console.error('Supabase addEmployee 실패:', error);
        throw error;
      }
    } else {
      // 기존 localStorage 모드
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
  }, [useSupabase, employees, employeeChangeRecords]);

  const updateEmployee = useCallback(async (id, newName) => {
    if (useSupabase) {
      try {
        const updatedEmployee = await supabaseEmployeeAPI.update(id, newName);
        setEmployees(prev => prev.map(emp => emp.id === id ? updatedEmployee : emp));
        const historyData = await supabaseHistoryAPI.getAll();
        setEmployeeChangeRecords(historyData || []);
      } catch (error) {
        console.error('Supabase updateEmployee 실패:', error);
        throw error;
      }
    } else {
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
  }, [useSupabase, employees, employeeChangeRecords]);

  const deleteEmployee = useCallback(async (id) => {
    if (useSupabase) {
      try {
        await supabaseEmployeeAPI.delete(id);
        setEmployees(prev => prev.filter(emp => emp.id !== id));
        const historyData = await supabaseHistoryAPI.getAll();
        setEmployeeChangeRecords(historyData || []);
      } catch (error) {
        console.error('Supabase deleteEmployee 실패:', error);
        throw error;
      }
    } else {
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
  }, [useSupabase, employees, employeeChangeRecords]);

  const updateOvertimeRecord = useCallback(async (employeeId, date, totalMinutes) => {
    if (useSupabase) {
      try {
        const updatedRecord = await supabaseOvertimeAPI.upsert(employeeId, date, totalMinutes);
        setOvertimeRecords(prev => {
          const filtered = prev.filter(record => 
            !(record.employeeId === employeeId && record.date === date)
          );
          return [...filtered, updatedRecord];
        });
      } catch (error) {
        console.error('Supabase updateOvertimeRecord 실패:', error);
        throw error;
      }
    } else {
      // 기존 기록이 있는지 확인하여 동작 타입 결정
      const existingRecord = overtimeRecords.find(record => 
        record.employeeId === employeeId && record.date === date
      );
      
      let description;
      if (totalMinutes === 0) {
        description = '삭제';
      } else if (existingRecord) {
        description = '수정';
      } else {
        description = '생성';
      }
      
      const newRecord = {
        id: Date.now() + Math.random(),
        employeeId,
        date,
        totalMinutes,
        description, // 동작 타입 추가
        createdAt: new Date().toISOString()
      };
      
      const updated = [...overtimeRecords, newRecord];
      setOvertimeRecords(updated);
      storageManager.save('overtime-records', updated);
    }
    
    dataCalculator.invalidateRelatedCaches(employeeId, date);
  }, [useSupabase, overtimeRecords]);

  const updateVacationRecord = useCallback(async (employeeId, date, totalMinutes) => {
    if (useSupabase) {
      try {
        const updatedRecord = await supabaseVacationAPI.upsert(employeeId, date, totalMinutes);
        setVacationRecords(prev => {
          const filtered = prev.filter(record => 
            !(record.employeeId === employeeId && record.date === date)
          );
          return [...filtered, updatedRecord];
        });
      } catch (error) {
        console.error('Supabase updateVacationRecord 실패:', error);
        throw error;
      }
    } else {
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
  }, [useSupabase, vacationRecords]);

  const bulkUpdateOvertimeRecords = useCallback(async (updates) => {
    if (useSupabase) {
      try {
        for (const update of updates) {
          await supabaseOvertimeAPI.upsert(update.employeeId, update.date, update.totalMinutes);
        }
        const currentMonth = new Date().toISOString().slice(0, 7);
        const overtimeData = await supabaseOvertimeAPI.getByMonth(currentMonth);
        setOvertimeRecords(overtimeData || []);
      } catch (error) {
        console.error('Supabase bulkUpdateOvertimeRecords 실패:', error);
        throw error;
      }
    } else {
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
  }, [useSupabase, overtimeRecords]);

  const bulkUpdateVacationRecords = useCallback(async (updates) => {
    if (useSupabase) {
      try {
        for (const update of updates) {
          await supabaseVacationAPI.upsert(update.employeeId, update.date, update.totalMinutes);
        }
        const currentMonth = new Date().toISOString().slice(0, 7);
        const vacationData = await supabaseVacationAPI.getByMonth(currentMonth);
        setVacationRecords(vacationData || []);
      } catch (error) {
        console.error('Supabase bulkUpdateVacationRecords 실패:', error);
        throw error;
      }
    } else {
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
  }, [useSupabase, vacationRecords]);

  // 직원 이름 조회 함수 (히스토리에서 사용)
  const getEmployeeNameFromRecord = useCallback((record) => {
    if (record.employeeName) {
      // 직원 변경 기록에서는 employeeName 필드 사용
      return record.employeeName;
    }
    
    // 초과근무/휴가 기록에서는 employeeId로 조회
    const employee = employees.find(emp => emp.id === record.employeeId);
    return employee ? employee.name : '알 수 없는 직원';
  }, [employees]);

  // Dashboard에서 사용하는 기능들 (기존과 동일)
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
    const settings = storageManager.loadSettings();
    const selectedMonth = new Date().toISOString().slice(0, 7);
    return dataCalculator.getMonthlyStats(employeeId, selectedMonth, overtimeRecords, vacationRecords, settings.multiplier);
  }, [overtimeRecords, vacationRecords]);

  const updateDailyTime = useCallback(async (type, employeeId, date, totalMinutes) => {
    if (type === 'overtime') {
      await updateOvertimeRecord(employeeId, date, totalMinutes);
    } else {
      await updateVacationRecord(employeeId, date, totalMinutes);
    }
  }, [updateOvertimeRecord, updateVacationRecord]);

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
    getAllEmployeesWithRecords,
    getDailyData,
    getMonthlyStats,
    updateDailyTime,
    getEmployeeNameFromRecord, // 추가된 함수
    multiplier: storageManager.loadSettings().multiplier || 1.0,
    useSupabase // 모드 확인용
  };
};

// ========== PROVIDER ==========
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

  return (
    <OvertimeContext.Provider value={value}>
      {children}
    </OvertimeContext.Provider>
  );
};