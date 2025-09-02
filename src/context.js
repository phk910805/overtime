import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { storageManager, dataCalculator } from './dataManager';

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

  useEffect(() => {
    setEmployees(storageManager.load('overtime-employees'));
    setOvertimeRecords(storageManager.load('overtime-records'));
    setVacationRecords(storageManager.load('vacation-records'));
    setEmployeeChangeRecords(storageManager.load('employee-change-records'));
  }, []);

  const addEmployee = useCallback((name) => {
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
    
    dataCalculator.clearCache();
    dataCalculator.invalidateRelatedCaches(newEmployee.id, null);
    return newEmployee;
  }, [employees, employeeChangeRecords]);

  const updateEmployee = useCallback((id, name) => {
    const employee = employees.find(emp => emp.id === id);
    if (!employee) return;
    
    const oldName = employee.name;
    const newName = name.trim();
    
    if (oldName !== newName) {
      const updated = employees.map(emp => 
        emp.id === id ? { ...emp, name: newName } : emp
      );
      setEmployees(updated);
      storageManager.save('overtime-employees', updated);
      
      const changeRecord = {
        id: Date.now() + Math.random(),
        employeeId: id,
        action: '수정',
        oldName,
        newName,
        createdAt: new Date().toISOString()
      };
      
      const updatedChangeRecords = [...employeeChangeRecords, changeRecord];
      setEmployeeChangeRecords(updatedChangeRecords);
      storageManager.save('employee-change-records', updatedChangeRecords);
      
      dataCalculator.clearCache();
      dataCalculator.invalidateRelatedCaches(id, null);
    }
  }, [employees, employeeChangeRecords]);

  const deleteEmployee = useCallback((id) => {
    const employee = employees.find(emp => emp.id === id);
    if (!employee) return false;

    const deleteRecord = {
      id: Date.now() + Math.random(),
      employeeId: id,
      action: '삭제',
      employeeName: employee.name,
      createdAt: new Date().toISOString()
    };
    
    const updatedChangeRecords = [...employeeChangeRecords, deleteRecord];
    setEmployeeChangeRecords(updatedChangeRecords);
    storageManager.save('employee-change-records', updatedChangeRecords);

    const updatedOvertime = overtimeRecords.map(record =>
      record.employeeId === id ? { ...record, employeeName: employee.name } : record
    );
    const updatedVacation = vacationRecords.map(record =>
      record.employeeId === id ? { ...record, employeeName: employee.name } : record
    );

    setOvertimeRecords(updatedOvertime);
    setVacationRecords(updatedVacation);
    storageManager.save('overtime-records', updatedOvertime);
    storageManager.save('vacation-records', updatedVacation);

    const updatedEmployees = employees.filter(emp => emp.id !== id);
    setEmployees(updatedEmployees);
    storageManager.save('overtime-employees', updatedEmployees);
    dataCalculator.clearCache();
    dataCalculator.invalidateRelatedCaches(id, null);
    return true;
  }, [employees, overtimeRecords, vacationRecords, employeeChangeRecords]);

  const updateDailyTime = useCallback((type, employeeId, date, totalMinutes) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;

    const records = type === 'overtime' ? overtimeRecords : vacationRecords;
    const existingRecords = records
      .filter(record => record.employeeId === employeeId && record.date === date)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const previousValue = existingRecords[0]?.totalMinutes || 0;

    let description;
    if (previousValue === 0 && totalMinutes > 0) {
      description = '생성';
    } else if (previousValue > 0 && totalMinutes === 0) {
      description = '삭제';
    } else if (previousValue > 0 && totalMinutes > 0) {
      description = '수정';
    } else {
      description = '수정';
    }

    const recordData = {
      id: Date.now() + Math.random(),
      employeeId,
      employeeName: employee.name,
      date,
      totalMinutes,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (type === 'overtime') {
      setOvertimeRecords(prevRecords => {
        const updated = [...prevRecords, recordData];
        storageManager.save('overtime-records', updated);
        return updated;
      });
    } else {
      setVacationRecords(prevRecords => {
        const updated = [...prevRecords, recordData];
        storageManager.save('vacation-records', updated);
        return updated;
      });
    }

    dataCalculator.clearCache();
    dataCalculator.invalidateRelatedCaches(employeeId, date);
  }, [employees, overtimeRecords, vacationRecords]);

  return {
    employees,
    overtimeRecords,
    vacationRecords,
    employeeChangeRecords,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    updateDailyTime
  };
};

const useEmployeeHelpers = (employees, overtimeRecords, vacationRecords, selectedMonth) => {
  const [multiplier, setMultiplier] = useState(1.0);

  useEffect(() => {
    const handleSettingsChange = () => {
      const settings = storageManager.loadSettings();
      setMultiplier(settings.multiplier || 1.0);
      dataCalculator.clearCache();
    };

    handleSettingsChange();
    window.addEventListener('settingsChanged', handleSettingsChange);
    
    return () => {
      window.removeEventListener('settingsChanged', handleSettingsChange);
      // 추가 메모리 정리
      dataCalculator.clearCache();
    };
  }, []);

  const getEmployeeNameFromRecord = useCallback((record) => {
    if (record.employeeName) return record.employeeName;
    const employee = employees.find(emp => emp.id === record.employeeId);
    return employee?.name || '삭제된 직원';
  }, [employees]);

  const getAllEmployeesWithRecords = useMemo(() => {
    const [year, month] = selectedMonth.split('-');
    
    const activeEmployees = employees.map(emp => ({
      ...emp,
      isActive: true
    }));
    
    const deletedEmployeesMap = new Map();
    
    const allRecords = [...overtimeRecords, ...vacationRecords];
    
    for (const record of allRecords) {
      const recordDate = new Date(record.date);
      const isInSelectedMonth = recordDate.getFullYear() === parseInt(year) && 
                               (recordDate.getMonth() + 1).toString().padStart(2, '0') === month;
      
      if (isInSelectedMonth && record.employeeName && !employees.find(emp => emp.id === record.employeeId)) {
        if (!deletedEmployeesMap.has(record.employeeId)) {
          deletedEmployeesMap.set(record.employeeId, {
            id: record.employeeId,
            name: record.employeeName,
            isActive: false,
            createdAt: record.createdAt || new Date().toISOString()
          });
        }
      }
    }
    
    return [...activeEmployees, ...Array.from(deletedEmployeesMap.values())];
  }, [employees, overtimeRecords, vacationRecords, selectedMonth]);

  const getDailyData = useCallback((employeeId, date, type = 'overtime') => {
    return dataCalculator.getDailyData(employeeId, date, type, overtimeRecords, vacationRecords);
  }, [overtimeRecords, vacationRecords]);

  const getMonthlyStats = useCallback((employeeId = null) => {
    return dataCalculator.getMonthlyStats(employeeId, selectedMonth, overtimeRecords, vacationRecords, multiplier);
  }, [selectedMonth, overtimeRecords, vacationRecords, multiplier]);

  return {
    getEmployeeNameFromRecord,
    getAllEmployeesWithRecords,
    getDailyData,
    getMonthlyStats,
    multiplier
  };
};

// ========== CONTEXT PROVIDER ==========
export const OvertimeProvider = ({ children }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const dataHooks = useOvertimeData();
  const helpers = useEmployeeHelpers(
    dataHooks.employees,
    dataHooks.overtimeRecords,
    dataHooks.vacationRecords,
    selectedMonth
  );

  const value = useMemo(() => ({
    selectedMonth,
    setSelectedMonth,
    ...dataHooks,
    ...helpers
  }), [selectedMonth, dataHooks, helpers]);

  return (
    <OvertimeContext.Provider value={value}>
      {children}
    </OvertimeContext.Provider>
  );
};
