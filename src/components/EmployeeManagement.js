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
  const { errors, validate, clearError, clearAllErrors } = useValidation();
  
  // 추가 에러 상태 (생년월일, 부서, 메모용)
  const [customErrors, setCustomErrors] = useState({});
  
  // 직원 목록용 정렬/페이징 훅
  const employeeListPaging = useSortingPaging(
    { field: 'name', direction: 'asc' }, 
    10, 
    'employeeManagement_employeeList_sort'
  );
  
  // 관리 이력용 정렬/페이징 훅
  const historyPaging = useSortingPaging(
    { field: 'createdAt', direction: 'desc' }, 
    10, 
    'employeeManagement_history_sort'
  );

  const validateForm = useCallback(() => {
    let isValid = true;
    const newCustomErrors = {};
    
    // 이름 검증
    const isValidName = validate('employeeName', 'employeeName', employeeName, employees, editingEmployee?.id);
    if (!isValidName) isValid = false;
    
    // 직원명 길이 검증 (추가)
    if (employeeName && employeeName.length > 50) {
      newCustomErrors.employeeName = '직원명은 50자 이하로 입력해주세요.';
      isValid = false;
    }
    
    // 부서 검증 (필수)
    if (!department || !department.trim()) {
      newCustomErrors.department = '부서는 필수입니다.';
      isValid = false;
    } else if (department.length > 100) {
      newCustomErrors.department = '부서명은 100자 이하로 입력해주세요.';
      isValid = false;
    }
    
    // 입사일 검증 (필수)
    if (!hireDate) {
      newCustomErrors.hireDate = '입사일은 필수입니다.';
      isValid = false;
    }
    
    // 메모 길이 검증 (최대 1000자)
    if (notes && notes.length > 1000) {
      newCustomErrors.notes = '메모는 1000자 이하로 입력해주세요.';
      isValid = false;
    }
    
    setCustomErrors(newCustomErrors);
    return isValid;
  }, [employeeName, birthDate, department, hireDate, notes, employees, editingEmployee, validate]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;
    
    try {
      const employeeData = {
        name: employeeName.trim(),
        birthDate: birthDate || null,
        department: department.trim(),
        hireDate: hireDate, // 필수값
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
      setCustomErrors(prev => ({ ...prev, general: error.message || '저장 중 오류가 발생했습니다.' }));
    }
  }, [employeeName, birthDate, department, hireDate, notes, editingEmployee, addEmployee, updateEmployee, validateForm]);

  const resetForm = useCallback(() => {
    setEmployeeName('');
    setBirthDate('');
    setDepartment('');
    setHireDate('');
    setNotes('');
    clearAllErrors();
    setCustomErrors({});
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
    setCustomErrors({});
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

  const clearCustomError = useCallback((fieldName) => {
    setCustomErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
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
              <table className="min-w-full divide-y divide-gray-200" style={{tableLayout: 'fixed'}}>
                <thead className="bg-gray-50">
                  <tr>
                    <SortableHeader 
                      field="createdAt" 
                      sortConfig={employeeListPaging.sortConfig} 
                      onSort={employeeListPaging.handleSort}
                      style={{width: '120px'}}
                    >
                      등록일
                    </SortableHeader>
                    <SortableHeader 
                      field="name" 
                      sortConfig={employeeListPaging.sortConfig} 
                      onSort={employeeListPaging.handleSort}
                      style={{width: '120px'}}
                    >
                      직원명
                    </SortableHeader>
                    <SortableHeader 
                      field="department" 
                      sortConfig={employeeListPaging.sortConfig} 
                      onSort={employeeListPaging.handleSort}
                      style={{width: '120px'}}
                    >
                      부서
                    </SortableHeader>
                    <SortableHeader 
                      field="hireDate" 
                      sortConfig={employeeListPaging.sortConfig} 
                      onSort={employeeListPaging.handleSort}
                      style={{width: '120px'}}
                    >
                      입사일
                    </SortableHeader>
                    <TableHeader style={{width: '200px'}}>메모</TableHeader>
                    <TableHeader className="text-right" style={{width: '100px'}}>작업</TableHeader>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedEmployees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate">
                        {new Date(employee.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate">
                        {employee.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate">
                        {employee.department || '미지정'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate">
                        {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString('ko-KR') : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 truncate" title={employee.notes || ''}>
                        {employee.notes ? (
                          employee.notes.length > 10 
                            ? `${employee.notes.substring(0, 10)}...` 
                            : employee.notes
                        ) : '-'}
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
                    <EmptyState message="등록된 직원이 없습니다." colSpan="6" />
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
            {customErrors.general && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800">{customErrors.general}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                직원명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={employeeName}
                onChange={(e) => {
                  const value = e.target.value;
                  setEmployeeName(value);
                  clearError('employeeName');
                  
                  // 실시간 길이 검증
                  if (value.length > 50) {
                    setCustomErrors(prev => ({
                      ...prev,
                      employeeName: '직원명은 50자 이하로 입력해주세요.'
                    }));
                  } else {
                    setCustomErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.employeeName;
                      return newErrors;
                    });
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.employeeName || customErrors.employeeName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="직원명을 입력해 주세요. (최대 50자)"
                autoFocus
                required
              />
              {(errors.employeeName || customErrors.employeeName) ? (
                <p className="mt-1 text-sm text-red-600">{errors.employeeName || customErrors.employeeName}</p>
              ) : employeeName && (
                <p className={`mt-1 text-xs ${
                  employeeName.length > 50 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {employeeName.length}/50
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                부서 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => {
                  const value = e.target.value;
                  setDepartment(value);
                  
                  // 실시간 길이 검증
                  if (value.length > 100) {
                    setCustomErrors(prev => ({
                      ...prev,
                      department: '부서명은 100자 이하로 입력해주세요.'
                    }));
                  } else {
                    clearCustomError('department');
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  customErrors.department ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="부서명을 입력해 주세요. (최대 100자)"
                required
              />
              {customErrors.department ? (
                <p className="mt-1 text-sm text-red-600">{customErrors.department}</p>
              ) : department && (
                <p className={`mt-1 text-xs ${
                  department.length > 100 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {department.length}/100
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                입사일 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={hireDate}
                onChange={(e) => {
                  setHireDate(e.target.value);
                  clearCustomError('hireDate');
                }}
                onMouseDown={(e) => {
                  // 텍스트 선택 방지
                  e.preventDefault();
                }}
                onClick={(e) => {
                  // 필드 전체 클릭 시 캠린더 열기
                  try {
                    e.target.showPicker?.();
                  } catch (error) {
                    // 브라우저가 showPicker를 지원하지 않을 경우 무시
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  customErrors.hireDate ? 'border-red-500' : 'border-gray-300'
                } ${hireDate ? 'has-value' : ''}`}
                required
              />
              {customErrors.hireDate && (
                <p className="mt-1 text-sm text-red-600">{customErrors.hireDate}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                생년월일
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => {
                  setBirthDate(e.target.value);
                  clearCustomError('birthDate');
                }}
                onMouseDown={(e) => {
                  // 텍스트 선택 방지
                  e.preventDefault();
                }}
                onClick={(e) => {
                  // 필드 전체 클릭 시 캠린더 열기
                  try {
                    e.target.showPicker?.();
                  } catch (error) {
                    // 브라우저가 showPicker를 지원하지 않을 경우 무시
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  customErrors.birthDate ? 'border-red-500' : 'border-gray-300'
                } ${birthDate ? 'has-value' : ''}`}
              />
              <p className="mt-1 text-xs text-gray-500">
                생년월일을 입력하면, 생일을 잊지 않도록 대시보드에서 알려드려요.
              </p>
              {customErrors.birthDate && (
                <p className="mt-1 text-sm text-red-600">{customErrors.birthDate}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                메모
              </label>
              <textarea
                value={notes}
                onChange={(e) => {
                  const value = e.target.value;
                  setNotes(value);
                  
                  // 실시간 길이 검증
                  if (value.length > 1000) {
                    setCustomErrors(prev => ({
                      ...prev,
                      notes: '메모는 1000자 이하로 입력해주세요.'
                    }));
                  } else {
                    clearCustomError('notes');
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  customErrors.notes ? 'border-red-500' : 'border-gray-300'
                }`}
                rows="3"
                placeholder="내용을 입력해 주세요."
              />
              {customErrors.notes ? (
                <p className="mt-1 text-sm text-red-600">{customErrors.notes}</p>
              ) : notes && (
                <p className={`mt-1 text-xs ${
                  notes.length > 1000 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {notes.length}/1000
                </p>
              )}
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
