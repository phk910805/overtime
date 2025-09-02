import React, { useState, useCallback, memo, useMemo } from 'react';
import { Calendar, ChevronUp, ChevronDown } from 'lucide-react';
import { useOvertimeContext } from '../context';
import { timeUtils } from '../utils';

// ========== COMMON COMPONENTS ==========
const SortableHeader = memo(({ field, sortConfig, onSort, children, className = "" }) => {
  const getSortIcon = () => {
    if (sortConfig.field === field) {
      return sortConfig.direction === 'desc' ? 
        <ChevronDown className="w-4 h-4" /> : 
        <ChevronUp className="w-4 h-4" />;
    }
    return <ChevronDown className="w-4 h-4 text-gray-300" />;
  };

  return (
    <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
      <button
        onClick={() => onSort(field)}
        className="flex items-center space-x-1 hover:text-gray-700"
      >
        <span>{children}</span>
        {getSortIcon()}
      </button>
    </th>
  );
});

const TableHeader = memo(({ children, className = "" }) => {
  return (
    <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
});

const EmptyState = memo(({ message, colSpan }) => {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-8 text-center text-gray-500">
        {message}
      </td>
    </tr>
  );
});

// ========== PAGINATION COMPONENT ==========
const Pagination = memo(({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems }) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // 현재 페이지 그룹 계산 (1-5, 6-10, 11-15...)
  const currentGroup = Math.ceil(currentPage / 5);
  const startPage = (currentGroup - 1) * 5 + 1;
  const endPage = Math.min(startPage + 4, totalPages);
  
  // 페이지 번호 배열 생성
  const getPageNumbers = useCallback(() => {
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }, [startPage, endPage]);

  // 버튼 활성화 상태
  const canGoToPrevGroup = currentGroup > 1;
  const canGoToNextGroup = currentGroup < Math.ceil(totalPages / 5);
  const canGoToFirst = currentPage > 1;
  const canGoToLast = currentPage < totalPages;

  // 네비게이션 핸들러
  const goToFirstPage = useCallback(() => {
    onPageChange(1);
  }, [onPageChange]);

  const goToLastPage = useCallback(() => {
    onPageChange(totalPages);
  }, [onPageChange, totalPages]);

  const goToPrevGroup = useCallback(() => {
    if (canGoToPrevGroup) {
      const prevGroupStart = (currentGroup - 2) * 5 + 1;
      onPageChange(prevGroupStart);
    }
  }, [canGoToPrevGroup, currentGroup, onPageChange]);

  const goToNextGroup = useCallback(() => {
    if (canGoToNextGroup) {
      const nextGroupStart = currentGroup * 5 + 1;
      onPageChange(Math.min(nextGroupStart, totalPages));
    }
  }, [canGoToNextGroup, currentGroup, totalPages, onPageChange]);

  if (totalItems === 0) return null;

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-200" style={{minHeight: '60px'}}>
      <div className="flex-1 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">
            총 <span className="font-medium">{totalItems}</span>개 중{' '}
            <span className="font-medium">{startItem}</span>-<span className="font-medium">{endItem}</span>개 표시
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {/* 처음으로 */}
          <button
            onClick={goToFirstPage}
            disabled={!canGoToFirst}
            className="px-2 py-1 text-sm text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            title="처음으로"
          >
            &lt;&lt;
          </button>
          
          {/* 이전 그룹 */}
          <button
            onClick={goToPrevGroup}
            disabled={!canGoToPrevGroup}
            className="px-2 py-1 text-sm text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            title="이전 5개"
          >
            &lt;
          </button>
          
          {/* 페이지 번호들 */}
          <div className="flex items-center space-x-1 min-w-[200px] justify-center">
            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 text-sm rounded ${
                  page === currentPage
                    ? 'bg-blue-100 text-blue-600 font-medium'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          
          {/* 다음 그룹 */}
          <button
            onClick={goToNextGroup}
            disabled={!canGoToNextGroup}
            className="px-2 py-1 text-sm text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            title="다음 5개"
          >
            &gt;
          </button>
          
          {/* 마지막으로 */}
          <button
            onClick={goToLastPage}
            disabled={!canGoToLast}
            className="px-2 py-1 text-sm text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            title="마지막으로"
          >
            &gt;&gt;
          </button>
        </div>
      </div>
    </div>
  );
});

// ========== SORTING & PAGING HOOK ==========
const useSortingPaging = (initialSort = { field: 'createdAt', direction: 'desc' }, initialItemsPerPage = 10) => {
  const [sortConfig, setSortConfig] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(initialItemsPerPage);

  const handleSort = useCallback((field) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
    setCurrentPage(1);
  }, []);

  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    sortConfig,
    currentPage,
    itemsPerPage,
    handleSort,
    resetPage,
    setCurrentPage
  };
};

// ========== RECORD TABLE COMPONENT ==========
const RecordTable = memo(({ records, type, sortConfig, onSort, getEmployeeNameFromRecord, currentPage, itemsPerPage }) => {
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return records.slice(startIndex, endIndex);
  }, [records, currentPage, itemsPerPage]);

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
    
    // 동작에 따른 색상 결정
    let textColor;
    switch(record.description) {
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
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${getDescriptionColor(record.description, type)}`}>
                  {record.description || '-'}
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
    overtimeRecords,
    vacationRecords,
    selectedMonth,
    getEmployeeNameFromRecord
  } = useOvertimeContext();
  
  const [activeHistoryTab, setActiveHistoryTab] = useState('overtime');
  
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

  const sortRecords = useCallback((records, sortConfig, getEmployeeNameFromRecord) => {
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
    return sortRecords(getMonthlyRecords.overtimeRecords, overtimeSorting.sortConfig, getEmployeeNameFromRecord);
  }, [getMonthlyRecords.overtimeRecords, overtimeSorting.sortConfig, sortRecords, getEmployeeNameFromRecord]);

  const sortedVacationRecords = useMemo(() => {
    return sortRecords(getMonthlyRecords.vacationRecords, vacationSorting.sortConfig, getEmployeeNameFromRecord);
  }, [getMonthlyRecords.vacationRecords, vacationSorting.sortConfig, sortRecords, getEmployeeNameFromRecord]);

  const handleTabChange = useCallback((tab) => {
    setActiveHistoryTab(tab);
  }, []);

  const getTotalPages = useCallback((totalItems, itemsPerPage) => {
    return Math.ceil(totalItems / itemsPerPage);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{selectedMonth} 기록 히스토리</h2>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => handleTabChange('overtime')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeHistoryTab === 'overtime'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
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
            휴가전환 기록 ({sortedVacationRecords.length})
          </button>
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {activeHistoryTab === 'overtime' && (
          <>
            <RecordTable
              records={sortedOvertimeRecords}
              type="overtime"
              sortConfig={overtimeSorting.sortConfig}
              onSort={overtimeSorting.handleSort}
              getEmployeeNameFromRecord={getEmployeeNameFromRecord}
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
              getEmployeeNameFromRecord={getEmployeeNameFromRecord}
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
    </div>
  );
});

export default RecordHistory;
