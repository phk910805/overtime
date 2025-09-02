import React, { useState, useCallback, memo } from 'react';
import { Users, Plus, Edit2, Trash2, Calendar } from 'lucide-react';
import { useOvertimeContext } from '../context';
import { validators } from '../utils';

// ========== COMMON COMPONENTS ==========
const Modal = memo(({ show, onClose, title, size = 'md', children }) => {
  if (!show) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div className={`bg-white rounded-lg p-6 w-full ${sizeClasses[size]}`}>
        {title && (
          <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        )}
        {children}
      </div>
    </div>
  );
});

const ConfirmModal = memo(({ 
  show, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "확인", 
  cancelText = "취소", 
  confirmColor = "bg-red-600 hover:bg-red-700" 
}) => {
  return (
    <Modal show={show} onClose={onClose} title={title}>
      <div className="mb-6">
        {typeof message === 'string' ? (
          <p className="text-sm text-gray-600">{message}</p>
        ) : (
          message
        )}
      </div>
      <div className="flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 text-white rounded-md ${confirmColor}`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
});

const InputField = memo(({ 
  label, 
  value, 
  onChange, 
  onBlur,
  error, 
  type = "text", 
  placeholder, 
  className = "",
  autoFocus = false,
  ...rest 
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-300' : 'border-gray-300'
        }`}
        {...rest}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
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

// ========== VALIDATION HOOK ==========
const useValidation = () => {
  const [errors, setErrors] = useState({});

  const validate = useCallback((fieldName, validatorName, ...args) => {
    const validator = validators[validatorName];
    if (!validator) return true;

    const result = validator(...args);
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: result.isValid ? '' : result.message
    }));

    return result.isValid;
  }, []);

  const clearError = useCallback((fieldName) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: ''
    }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validate,
    clearError,
    clearAllErrors
  };
};

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
  const employeeManagementRecords = React.useMemo(() => {
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

    return records.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA; // 최신순
    });
  }, [employeeChangeRecords]);

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
            관리 이력
          </button>
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {activeEmployeeTab === 'list' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeader>직원명</TableHeader>
                  <TableHeader>등록일</TableHeader>
                  <TableHeader className="text-right">작업</TableHeader>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
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
                {employees.length === 0 && (
                  <EmptyState message="등록된 직원이 없습니다." colSpan="3" />
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeEmployeeTab === 'history' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeader>일시</TableHeader>
                  <TableHeader>동작</TableHeader>
                  <TableHeader>직원명</TableHeader>
                  <TableHeader>세부사항</TableHeader>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employeeManagementRecords.map((record) => (
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
                {employeeManagementRecords.length === 0 && (
                  <EmptyState message="관리 기록이 없습니다." colSpan="4" />
                )}
              </tbody>
            </table>
          </div>
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
