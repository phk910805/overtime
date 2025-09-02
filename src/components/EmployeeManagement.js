import React, { useState, useCallback, memo, useMemo } from 'react';
import { Users, Plus, Edit2, Trash2, Calendar } from 'lucide-react';
import { useOvertimeContext } from '../context';
import { useSortingPaging, useValidation } from '../utils';
import { Modal, ConfirmModal, InputField, TableHeader, SortableHeader, EmptyState, Pagination } from './CommonUI';

// ========== MAIN COMPONENT ==========
const EmployeeManagement = memo(() => {
  const { employees, addEmployee, updateEmployee, deleteEmployee, employeeChangeRecords } = useOvertimeContext();
  const [activeEmployeeTab, setActiveEmployeeTab] = useState('list');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [employeeName, setEmployeeName] = useState('');

  // 검증 훅 사용
  const { errors, validate, clearError, clearAllErrors } = useValidation();
  
  // 직원 목록용 정렬/페이징 훅
  const employeeListPaging = useSortingPaging({ field: 'name', direction: 'asc' }, 10);
  
  // 관리 이력용 정렬/페이징 훅
  const historyPaging = useSortingPaging({ field: 'createdAt', direction: 'desc' }, 10);

  const handleSubmit = useCallback(() => {
    const isValidName = validate('employeeName', 'employeeName', employeeName, employees, editingEmployee?.id);
    
    if (isValidName) {
      if (editingEmployee) {
        updateEmployee(editingEmployee.id, employeeName.trim());
      } else {
        addEmployee(employeeName.trim());
      }

      setEmployeeName('');
      clearAllErrors();
      setShowModal(false);
      setEditingEmployee(null);
    }
  }, [employeeName, editingEmployee, employees, addEmployee, updateEmployee, validate, clearAllErrors]);

  const resetForm = useCallback(() => {
    setEmployeeName('');
    clearAllErrors();
    setShowModal(false);
    setEditingEmployee(null);
  }, [clearAllErrors]);

  const handleEdit = useCallback((employee) => {
    setEditingEmployee(employee);
    setEmployeeName(employee.name);
    clearAllErrors();
    setShowModal(true);
  }, [clearAllErrors]);

  const handleEmployeeNameChange = useCallback((e) => {
    setEmployeeName(e.target.value);
    clearError('employeeName');
  }, [clearError]);

  const handleDeleteClick = useCallback((employee) => {
    setEmployeeToDelete(employee);
    setShowDeleteConfirm(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (employeeToDelete) {
      deleteEmployee(employeeToDelete.id);
    }
    setShowDeleteConfirm(false);
    setEmployeeToDelete(null);
  }, [employeeToDelete, deleteEmployee]);

  const handleEmployeeTabChange = useCallback((tab) => {
    setActiveEmployeeTab(tab);
  }, []);

  // 직원 관리 기록 계산
  const employeeManagementRecords = useMemo(() => {
    const records = [];
    
    employeeChangeRecords.forEach(changeRecord => {
      if (changeRecord.action === '생성') {
        records.push({
          id: `emp-create-${changeRecord.id}`,
          type: 'employee',
          action: '생성',
          employeeName: changeRecord.employeeName,
          createdAt: changeRecord.createdAt,
          details: `직원 "${changeRecord.employeeName}" 추가`
        });
      } else if (changeRecord.action === '수정') {
        records.push({
          id: `emp-update-${changeRecord.id}`,
          type: 'employee',
          action: '수정',
          employeeName: changeRecord.newName,
          createdAt: changeRecord.createdAt,
          details: `직원명 "${changeRecord.oldName}" -> "${changeRecord.newName}" 변경`
        });
      } else if (changeRecord.action === '삭제') {
        records.push({
          id: `emp-delete-${changeRecord.id}`,
          type: 'employee',
          action: '삭제',
          employeeName: changeRecord.employeeName,
          createdAt: changeRecord.createdAt,
          details: `직원 "${changeRecord.employeeName}" 삭제`
        });
      }
    });

    return records;
  }, [employeeChangeRecords]);

  // 정렬된 직원 목록
  const sortedEmployees = useMemo(() => {
    return [...employees].sort((a, b) => {
      let aValue, bValue;

      switch (employeeListPaging.sortConfig.field) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return employeeListPaging.sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return employeeListPaging.sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [employees, employeeListPaging.sortConfig]);

  // 정렬된 관리 기록
  const sortedHistoryRecords = useMemo(() => {
    return [...employeeManagementRecords].sort((a, b) => {
      let aValue, bValue;

      switch (historyPaging.sortConfig.field) {
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'employeeName':
          aValue = a.employeeName.toLowerCase();
          bValue = b.employeeName.toLowerCase();
          break;
        case 'action':
          aValue = a.action;
          bValue = b.action;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return historyPaging.sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return historyPaging.sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [employeeManagementRecords, historyPaging.sortConfig]);

  // 페이징된 직원 목록
  const paginatedEmployees = useMemo(() => {
    const startIndex = (employeeListPaging.currentPage - 1) * employeeListPaging.itemsPerPage;
    const endIndex = startIndex + employeeListPaging.itemsPerPage;
    return sortedEmployees.slice(startIndex, endIndex);
  }, [sortedEmployees, employeeListPaging.currentPage, employeeListPaging.itemsPerPage]);

  // 페이징된 관리 기록
  const paginatedHistoryRecords = useMemo(() => {
    const startIndex = (historyPaging.currentPage - 1) * historyPaging.itemsPerPage;
    const endIndex = startIndex + historyPaging.itemsPerPage;
    return sortedHistoryRecords.slice(startIndex, endIndex);
  }, [sortedHistoryRecords, historyPaging.currentPage, historyPaging.itemsPerPage]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">직원 관리</h2>
        {activeEmployeeTab === 'list' && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>직원 추가</span>
          </button>
        )}
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => handleEmployeeTabChange('list')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeEmployeeTab === 'list'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="w-4 h-4 inline-block mr-2" />
            직원 목록 ({employees.length})
          </button>
          <button
            onClick={() => handleEmployeeTabChange('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeEmployeeTab === 'history'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Calendar className="w-4 h-4 inline-block mr-2" />
            관리 이력 ({employeeManagementRecords.length})
          </button>
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {activeEmployeeTab === 'list' && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <SortableHeader 
                      field="name" 
                      sortConfig={employeeListPaging.sortConfig} 
                      onSort={employeeListPaging.handleSort}
                    >
                      직원명
                    </SortableHeader>
                    <SortableHeader 
                      field="createdAt" 
                      sortConfig={employeeListPaging.sortConfig} 
                      onSort={employeeListPaging.handleSort}
                    >
                      등록일
                    </SortableHeader>
                    <TableHeader className="text-right">작업</TableHeader>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedEmployees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {employee.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(employee.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(employee)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(employee)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {paginatedEmployees.length === 0 && (
                    <EmptyState message="등록된 직원이 없습니다." colSpan="3" />
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={employeeListPaging.currentPage}
              totalPages={Math.max(1, Math.ceil(sortedEmployees.length / employeeListPaging.itemsPerPage))}
              onPageChange={employeeListPaging.setCurrentPage}
              itemsPerPage={employeeListPaging.itemsPerPage}
              totalItems={sortedEmployees.length}
            />
          </>
        )}

        {activeEmployeeTab === 'history' && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <SortableHeader 
                      field="createdAt" 
                      sortConfig={historyPaging.sortConfig} 
                      onSort={historyPaging.handleSort}
                    >
                      일시
                    </SortableHeader>
                    <SortableHeader 
                      field="action" 
                      sortConfig={historyPaging.sortConfig} 
                      onSort={historyPaging.handleSort}
                    >
                      동작
                    </SortableHeader>
                    <SortableHeader 
                      field="employeeName" 
                      sortConfig={historyPaging.sortConfig} 
                      onSort={historyPaging.handleSort}
                    >
                      직원명
                    </SortableHeader>
                    <TableHeader>세부사항</TableHeader>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedHistoryRecords.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {new Date(record.createdAt).toLocaleString('ko-KR')}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        record.action === '생성' ? 'text-green-600' : 
                        record.action === '수정' ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {record.action}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.employeeName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {record.details}
                      </td>
                    </tr>
                  ))}
                  {paginatedHistoryRecords.length === 0 && (
                    <EmptyState message="관리 기록이 없습니다." colSpan="4" />
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={historyPaging.currentPage}
              totalPages={Math.max(1, Math.ceil(sortedHistoryRecords.length / historyPaging.itemsPerPage))}
              onPageChange={historyPaging.setCurrentPage}
              itemsPerPage={historyPaging.itemsPerPage}
              totalItems={sortedHistoryRecords.length}
            />
          </>
        )}
      </div>

      {showModal && (
        <Modal show={showModal} onClose={resetForm} title={editingEmployee ? '직원 수정' : '직원 추가'}>
          <InputField
            label="직원명"
            value={employeeName}
            onChange={handleEmployeeNameChange}
            error={errors.employeeName}
            autoFocus
            className="mb-4"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={resetForm}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              저장
            </button>
          </div>
        </Modal>
      )}

      {showDeleteConfirm && employeeToDelete && (
        <ConfirmModal
          show={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setEmployeeToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="직원 삭제 확인"
          message={
            <div>
              <p className="text-sm text-gray-600 mb-2">
                <strong>{employeeToDelete.name}</strong> 직원을 삭제하시겠습니까?
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-3">
                <p className="text-sm text-yellow-800">
                  직원 정보는 삭제되지만 과거 기록은 보존됩니다.
                </p>
              </div>
            </div>
          }
          confirmText="삭제"
          confirmColor="bg-red-600 hover:bg-red-700"
        />
      )}
    </div>
  );
});

export default EmployeeManagement;
