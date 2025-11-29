import React, { useState, useCallback, memo, useMemo } from 'react';
import { Users, Plus, Edit2, UserMinus, Calendar } from 'lucide-react';
import { useOvertimeContext } from '../context';
import { useSortingPaging, useValidation } from '../utils';
import { Modal, ConfirmModal, InputField, TableHeader, SortableHeader, EmptyState, Pagination } from './CommonUI';

// ========== MAIN COMPONENT ==========
const EmployeeManagement = memo(() => {
  const { employees, addEmployee, updateEmployee, deleteEmployee, employeeChangeRecords } = useOvertimeContext();
  const [activeEmployeeTab, setActiveEmployeeTab] = useState('list');
  const [showModal, setShowModal] = useState(false);
  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeeToResign, setEmployeeToResign] = useState(null);
  
  // 폼 상태
  const [employeeName, setEmployeeName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [department, setDepartment] = useState('');
  const [hireDate, setHireDate] = useState('');
  const [notes, setNotes] = useState('');

  // 검증 훅 사용
  const { errors, validate, clearError, clearAllErrors, setError } = useValidation();
  
  // 직원 목록용 정렬/페이징 훅
  const employeeListPaging = useSortingPaging({ field: 'name', direction: 'asc' }, 10);
  
  // 관리 이력용 정렬/페이징 훅
  const historyPaging = useSortingPaging({ field: 'createdAt', direction: 'desc' }, 10);

  const validateForm = useCallback(() => {
    let isValid = true;
    
    // 이름 검증
    const isValidName = validate('employeeName', 'employeeName', employeeName, employees, editingEmployee?.id);
    if (!isValidName) isValid = false;
    
    // 생년월일 검증 (필수)
    if (!birthDate) {
      setError('birthDate', '생년월일은 필수입니다.');
      isValid = false;
    }
    
    // 부서 검증 (필수)
    if (!department || !department.trim()) {
      setError('department', '부서는 필수입니다.');
      isValid = false;
    }
    
    // 메모 길이 검증 (최대 1000자)
    if (notes && notes.length > 1000) {
      setError('notes', '메모는 최대 1000자까지 입력 가능합니다.');
      isValid = false;
    }
    
    return isValid;
  }, [employeeName, birthDate, department, notes, employees, editingEmployee, validate, setError]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;
    
    try {
      const employeeData = {
        name: employeeName.trim(),
        birthDate: birthDate,
        department: department.trim(),
        hireDate: hireDate || null,
        notes: notes || null
      };
      
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, employeeData);
      } else {
        await addEmployee(employeeData);
      }

      resetForm();
    } catch (error) {
      console.error('직원 저장 실패:', error);
      setError('general', error.message || '저장 중 오류가 발생했습니다.');
    }
  }, [employeeName, birthDate, department, hireDate, notes, editingEmployee, addEmployee, updateEmployee, validateForm, setError]);

  const resetForm = useCallback(() => {
    setEmployeeName('');
    setBirthDate('');
    setDepartment('');
    setHireDate('');
    setNotes('');
    clearAllErrors();
    setShowModal(false);
    setEditingEmployee(null);
  }, [clearAllErrors]);

  const handleEdit = useCallback((employee) => {
    setEditingEmployee(employee);
    setEmployeeName(employee.name);
    setBirthDate(employee.birthDate || '');
    setDepartment(employee.department || '');
    setHireDate(employee.hireDate || '');
    setNotes(employee.notes || '');
    clearAllErrors();
    setShowModal(true);
  }, [clearAllErrors]);

  const handleResignClick = useCallback((employee) => {
    setEmployeeToResign(employee);
    setShowResignConfirm(true);
  }, []);

  const confirmResign = useCallback(() => {
    if (employeeToResign) {
      deleteEmployee(employeeToResign.id, 'employees');
    }
    setShowResignConfirm(false);
    setEmployeeToResign(null);
  }, [employeeToResign, deleteEmployee]);

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
          employeeName: changeRecord.employeeName,
          createdAt: changeRecord.createdAt,
          details: `직원명 "${changeRecord.oldName || '알 수 없음'}" -> "${changeRecord.employeeName}" 변경`
        });
      } else if (changeRecord.action === '삭제') {
        records.push({
          id: `emp-delete-${changeRecord.id}`,
          type: 'employee',
          action: '퇴사',
          employeeName: changeRecord.employeeName,
          createdAt: changeRecord.createdAt,
          details: `직원 "${changeRecord.employeeName}" 퇴사 처리`
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
        case 'department':
          aValue = (a.department || '').toLowerCase();
          bValue = (b.department || '').toLowerCase();
          break;
        case 'birthDate':
          aValue = a.birthDate ? new Date(a.birthDate) : new Date(0);
          bValue = b.birthDate ? new Date(b.birthDate) : new Date(0);
          break;
        case 'hireDate':
          aValue = a.hireDate ? new Date(a.hireDate) : new Date(0);
          bValue = b.hireDate ? new Date(b.hireDate) : new Date(0);
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
                      field="department" 
                      sortConfig={employeeListPaging.sortConfig} 
                      onSort={employeeListPaging.handleSort}
                    >
                      부서
                    </SortableHeader>
                    <SortableHeader 
                      field="birthDate" 
                      sortConfig={employeeListPaging.sortConfig} 
                      onSort={employeeListPaging.handleSort}
                    >
                      생년월일
                    </SortableHeader>
                    <SortableHeader 
                      field="hireDate" 
                      sortConfig={employeeListPaging.sortConfig} 
                      onSort={employeeListPaging.handleSort}
                    >
                      입사일
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
                        {employee.department || '미지정'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.birthDate ? new Date(employee.birthDate).toLocaleDateString('ko-KR') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString('ko-KR') : new Date(employee.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(employee)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                          title="수정"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleResignClick(employee)}
                          className="text-orange-600 hover:text-orange-900"
                          title="퇴사 처리"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {paginatedEmployees.length === 0 && (
                    <EmptyState message="등록된 직원이 없습니다." colSpan="5" />
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
          <div className="space-y-4">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800">{errors.general}</p>
              </div>
            )}
            
            <InputField
              label="직원명"
              value={employeeName}
              onChange={(e) => {
                setEmployeeName(e.target.value);
                clearError('employeeName');
              }}
              error={errors.employeeName}
              autoFocus
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                생년월일 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => {
                  setBirthDate(e.target.value);
                  clearError('birthDate');
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.birthDate ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.birthDate && (
                <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>
              )}
            </div>
            
            <InputField
              label="부서"
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                clearError('department');
              }}
              error={errors.department}
              placeholder="예: 개발팀, 영업팀"
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                입사일 <span className="text-gray-400">(선택)</span>
              </label>
              <input
                type="date"
                value={hireDate}
                onChange={(e) => setHireDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                비워두면 등록일이 입사일로 표시됩니다
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                메모 <span className="text-gray-400">(선택, 최대 1000자)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  clearError('notes');
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.notes ? 'border-red-500' : 'border-gray-300'
                }`}
                rows="3"
                placeholder="직원 관련 메모 (야간근무 불가, 건강상 특이사항 등)"
                maxLength="1000"
              />
              <div className="flex justify-between mt-1">
                {errors.notes && (
                  <p className="text-sm text-red-600">{errors.notes}</p>
                )}
                <p className="text-xs text-gray-500 ml-auto">
                  {notes.length}/1000
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
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

      {showResignConfirm && employeeToResign && (
        <ConfirmModal
          show={showResignConfirm}
          onClose={() => {
            setShowResignConfirm(false);
            setEmployeeToResign(null);
          }}
          onConfirm={confirmResign}
          title="퇴사 처리 확인"
          message={
            <div>
              <p className="text-sm text-gray-600 mb-2">
                <strong>{employeeToResign.name}</strong> 직원을 퇴사 처리하시겠습니까?
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-3">
                <p className="text-sm text-yellow-800">
                  퇴사 처리 후에도 과거 근무 기록은 보존됩니다.
                </p>
              </div>
            </div>
          }
          confirmText="퇴사 처리"
          confirmColor="bg-orange-600 hover:bg-orange-700"
        />
      )}
    </div>
  );
});

export default EmployeeManagement;
