import React, { useState, useCallback, memo, useMemo } from 'react';
import { Calendar, Clock, FileText } from 'lucide-react';
import { useOvertimeContext } from '../context';
import { timeUtils, useSortingPaging } from '../utils';
import { SortableHeader, TableHeader, EmptyState, Pagination } from './CommonUI';
import Dashboard from './Dashboard';
import MonthSelector from './MonthSelector';

// ========== RECORD TABLE COMPONENT ==========
const RecordTable = memo(({ records, type, sortConfig, onSort, employees, currentPage, itemsPerPage }) => {
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return records.slice(startIndex, endIndex);
  }, [records, currentPage, itemsPerPage]);

  // 직원 이름 조회 함수 (동기적 처리)
  const getEmployeeNameFromRecord = useCallback((record) => {
    // 1순위: 기록에 직원 이름이 저장되어 있는 경우 (새로운 방식 + 직원 변경 기록)
    if (record.employeeName) {
      return record.employeeName;
    }
    
    // 2순위: 초과근무/휴가 기록에서 employeeId로 조회 (호환성 유지)
    const employee = employees.find(emp => emp.id === record.employeeId);
    return employee ? employee.name : '알 수 없는 직원';
  }, [employees]);

  const getChangeDisplay = useCallback((record, records, type) => {
    const recordDate = new Date(record.createdAt);
    const previousRecord = records
      .filter(r => 
        r.employeeId === record.employeeId && 
        r.date === record.date &&
        new Date(r.createdAt) < recordDate
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    const currentTime = timeUtils.formatTime(record.totalMinutes);
    
    // 동작에 따른 색상 결정 (두 필드 모두 지원)
    const action = record.description || record.action;
    let textColor;
    switch(action) {
      case '생성':
        textColor = type === 'overtime' ? 'text-blue-600' : 'text-green-600';
        break;
      case '수정':
        textColor = 'text-orange-600';
        break;
      case '삭제':
        textColor = 'text-red-600';
        break;
      default:
        textColor = type === 'overtime' ? 'text-blue-600' : 'text-green-600';
    }

    if (!previousRecord || previousRecord.totalMinutes === 0) {
      return <span className={textColor}>{currentTime}</span>;
    }
    
    if (previousRecord.totalMinutes !== record.totalMinutes) {
      const prevTime = timeUtils.formatTime(previousRecord.totalMinutes);
      return (
        <span className={textColor}>
          {prevTime} → {currentTime}
        </span>
      );
    }

    return <span className={textColor}>{currentTime}</span>;
  }, []);

  const getDescriptionColor = useCallback((description, type) => {
    switch(description) {
      case '생성':
        // 초과근무는 파란색, 휴가전환은 초록색
        return type === 'overtime' ? 'text-blue-600' : 'text-green-600';
      case '수정': 
        return 'text-orange-600';
      case '삭제': 
        return 'text-red-600';
      default: 
        return 'text-blue-600';
    }
  }, []);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader field="createdAt" sortConfig={sortConfig} onSort={onSort}>
                수정일
              </SortableHeader>
              <SortableHeader field="employeeName" sortConfig={sortConfig} onSort={onSort}>
                직원명
              </SortableHeader>
              <SortableHeader field="date" sortConfig={sortConfig} onSort={onSort}>
                날짜
              </SortableHeader>
              <TableHeader>시간</TableHeader>
              <TableHeader>동작</TableHeader>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedRecords.map((record) => (
              <tr key={record.id}>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                  {new Date(record.createdAt).toLocaleString('ko-KR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {getEmployeeNameFromRecord(record)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {getChangeDisplay(record, records, type)}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${getDescriptionColor(record.description || record.action || '-', type)}`}>
                  {record.description || record.action || '-'}
                </td>
              </tr>
            ))}
            {paginatedRecords.length === 0 && (
              <EmptyState message="기록이 없습니다." colSpan="5" />
            )}
          </tbody>
        </table>
      </div>
    </>
  );
});

// ========== MAIN RECORD HISTORY COMPONENT ==========
const RecordHistory = memo(() => {
  const {
    employees,
    overtimeRecords,
    vacationRecords,
    selectedMonth: contextSelectedMonth,
    setSelectedMonth
  } = useOvertimeContext();
  
  const [activeHistoryTab, setActiveHistoryTab] = useState('snapshot');
  const [historySelectedMonth, setHistorySelectedMonth] = useState(contextSelectedMonth);
  
  // 히스토리 탭에서만 사용할 월 선택 핸들러
  const handleMonthChange = useCallback((newMonth) => {
    setHistorySelectedMonth(newMonth);
  }, []);
  
  // 히스토리에서는 historySelectedMonth를 사용
  const selectedMonth = historySelectedMonth;
  
  const overtimeSorting = useSortingPaging({ field: 'createdAt', direction: 'desc' }, 10);
  const vacationSorting = useSortingPaging({ field: 'createdAt', direction: 'desc' }, 10);

  const getMonthlyRecords = useMemo(() => {
    const [year, month] = selectedMonth.split('-');

    const filterByMonth = (records) => records.filter(record => {
      if (!record.date) return false;
      const recordDate = new Date(record.date);
      return recordDate.getFullYear() === parseInt(year) && 
             (recordDate.getMonth() + 1).toString().padStart(2, '0') === month;
    });

    return {
      overtimeRecords: filterByMonth(overtimeRecords),
      vacationRecords: filterByMonth(vacationRecords)
    };
  }, [selectedMonth, overtimeRecords, vacationRecords]);

  const sortRecords = useCallback((records, sortConfig, employees) => {
    const getEmployeeNameFromRecord = (record) => {
      // 1순위: 기록에 직원 이름이 저장되어 있는 경우 (새로운 방식 + 직원 변경 기록)
      if (record.employeeName) {
        return record.employeeName;
      }
      // 2순위: 초과근무/휴가 기록에서 employeeId로 조회 (호환성 유지)
      const employee = employees.find(emp => emp.id === record.employeeId);
      return employee ? employee.name : '알 수 없는 직원';
    };

    return [...records].sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.field) {
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'employeeName':
          aValue = getEmployeeNameFromRecord(a).toLowerCase();
          bValue = getEmployeeNameFromRecord(b).toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, []);

  const sortedOvertimeRecords = useMemo(() => {
    return sortRecords(getMonthlyRecords.overtimeRecords, overtimeSorting.sortConfig, employees);
  }, [getMonthlyRecords.overtimeRecords, overtimeSorting.sortConfig, sortRecords, employees]);

  const sortedVacationRecords = useMemo(() => {
    return sortRecords(getMonthlyRecords.vacationRecords, vacationSorting.sortConfig, employees);
  }, [getMonthlyRecords.vacationRecords, vacationSorting.sortConfig, sortRecords, employees]);

  const handleTabChange = useCallback((tab) => {
    setActiveHistoryTab(tab);
  }, []);

  const getTotalPages = useCallback((totalItems, itemsPerPage) => {
    return Math.ceil(totalItems / itemsPerPage);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">히스토리</h2>
        {/* 월 선택기를 히스토리 탭에 추가 */}
        <MonthSelector
          selectedMonth={historySelectedMonth}
          onMonthChange={handleMonthChange}
          maxMonth={new Date().toISOString().slice(0, 7)}
        />
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => handleTabChange('snapshot')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeHistoryTab === 'snapshot'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Calendar className="w-4 h-4 inline-block mr-1" />
            과거 기록
          </button>
          <button
            onClick={() => handleTabChange('overtime')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeHistoryTab === 'overtime'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Clock className="w-4 h-4 inline-block mr-1" />
            초과근무 기록 ({sortedOvertimeRecords.length})
          </button>
          <button
            onClick={() => handleTabChange('vacation')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeHistoryTab === 'vacation'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="w-4 h-4 inline-block mr-1" />
            휴가전환 기록 ({sortedVacationRecords.length})
          </button>
        </nav>
      </div>

      {/* 과거 기록 탭 - 대시보드 스냅샷 */}
      {activeHistoryTab === 'snapshot' && (
        <div>
          <Dashboard 
            editable={false}
            showReadOnlyBadge={true}
            isHistoryMode={true}
            customMonth={historySelectedMonth}
          />
        </div>
      )}

      {/* 초과근무 및 휴가전환 기록 탭 */}
      {(activeHistoryTab === 'overtime' || activeHistoryTab === 'vacation') && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {activeHistoryTab === 'overtime' && (
          <>
            <RecordTable
              records={sortedOvertimeRecords}
              type="overtime"
              sortConfig={overtimeSorting.sortConfig}
              onSort={overtimeSorting.handleSort}
              employees={employees}
              currentPage={overtimeSorting.currentPage}
              itemsPerPage={overtimeSorting.itemsPerPage}
            />
            <Pagination
              currentPage={overtimeSorting.currentPage}
              totalPages={Math.max(1, getTotalPages(sortedOvertimeRecords.length, overtimeSorting.itemsPerPage))}
              onPageChange={overtimeSorting.setCurrentPage}
              itemsPerPage={overtimeSorting.itemsPerPage}
              totalItems={sortedOvertimeRecords.length}
            />
          </>
          )}

          {activeHistoryTab === 'vacation' && (
          <>
            <RecordTable
              records={sortedVacationRecords}
              type="vacation"
              sortConfig={vacationSorting.sortConfig}
              onSort={vacationSorting.handleSort}
              employees={employees}
              currentPage={vacationSorting.currentPage}
              itemsPerPage={vacationSorting.itemsPerPage}
            />
            <Pagination
              currentPage={vacationSorting.currentPage}
              totalPages={Math.max(1, getTotalPages(sortedVacationRecords.length, vacationSorting.itemsPerPage))}
              onPageChange={vacationSorting.setCurrentPage}
              itemsPerPage={vacationSorting.itemsPerPage}
              totalItems={sortedVacationRecords.length}
            />
          </>
          )}
        </div>
      )}
    </div>
  );
});

export default RecordHistory;
