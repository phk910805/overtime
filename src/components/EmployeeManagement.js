import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { Users, Plus, Edit2, UserMinus, Calendar, Link2, Search } from 'lucide-react';
import { useOvertimeContext } from '../context';
import { useAuth } from '../hooks/useAuth';
import { useSortingPaging, useValidation } from '../utils';
import { getDataService } from '../services/dataService';
import { Modal, ConfirmModal, Toast, TableHeader, SortableHeader, EmptyState, Pagination } from './CommonUI';
import EmployeeLinkModal from './EmployeeLinkModal';
import BulkEmployeeModal from './BulkEmployeeModal';

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
};

// ========== MAIN COMPONENT ==========
const EmployeeManagement = memo(() => {
  const { canManageEmployees, canEditEmployees, canManageTeam, user } = useAuth();
  const { employees, addEmployee, updateEmployee, deleteEmployee, employeeChangeRecords } = useOvertimeContext();
  const [activeEmployeeTab, setActiveEmployeeTab] = useState('list');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
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

  // ===== 팀원 관리 탭 상태 =====
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [memberUpdating, setMemberUpdating] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [removeTarget, setRemoveTarget] = useState(null);
  const [linkingMember, setLinkingMember] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast({ show: false, message: '', type: 'success' });
  }, []);

  const loadMembers = useCallback(async () => {
    try {
      setMembersLoading(true);
      const dataService = getDataService();
      const data = await dataService.getCompanyMembers();
      setMembers(data || []);
    } catch (err) {
      console.error('팀원 목록 로드 실패:', err);
      showToast('팀원 목록을 불러오는데 실패했습니다.', 'error');
    } finally {
      setMembersLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (canManageTeam && activeEmployeeTab === 'team') {
      loadMembers();
    }
  }, [canManageTeam, activeEmployeeTab, loadMembers]);

  const handleRoleChange = useCallback(async (memberId, newRole, currentPermission) => {
    setMemberUpdating(memberId);
    try {
      const dataService = getDataService();
      await dataService.updateMemberRole(memberId, newRole, currentPermission);
      showToast('역할이 변경되었습니다.');
      await loadMembers();
    } catch (err) {
      console.error('역할 변경 실패:', err);
      showToast(err.message || '역할 변경에 실패했습니다.', 'error');
    } finally {
      setMemberUpdating(null);
    }
  }, [showToast, loadMembers]);

  const handlePermissionChange = useCallback(async (memberId, currentRole, newPermission) => {
    setMemberUpdating(memberId);
    try {
      const dataService = getDataService();
      await dataService.updateMemberRole(memberId, currentRole, newPermission);
      showToast('권한이 변경되었습니다.');
      await loadMembers();
    } catch (err) {
      console.error('권한 변경 실패:', err);
      showToast(err.message || '권한 변경에 실패했습니다.', 'error');
    } finally {
      setMemberUpdating(null);
    }
  }, [showToast, loadMembers]);

  const handleRemoveConfirm = useCallback(async () => {
    if (!removeTarget) return;

    setMemberUpdating(removeTarget.id);
    try {
      const dataService = getDataService();
      await dataService.removeMember(removeTarget.id);
      showToast('팀원을 내보냈습니다.');
      setRemoveTarget(null);
      await loadMembers();
    } catch (err) {
      console.error('팀원 내보내기 실패:', err);
      showToast(err.message || '팀원 내보내기에 실패했습니다.', 'error');
    } finally {
      setMemberUpdating(null);
    }
  }, [removeTarget, showToast, loadMembers]);

  const linkedEmployeeMap = useMemo(() => {
    const map = {};
    employees.forEach(emp => {
      if (emp.linkedUserId) {
        map[emp.linkedUserId] = emp;
      }
    });
    return map;
  }, [employees]);

  const openLinkingModal = useCallback((member) => {
    setLinkingMember(member);
  }, []);

  const handleLinkModalClose = useCallback(() => {
    setLinkingMember(null);
  }, []);

  const handleLinked = useCallback((message, type = 'success') => {
    showToast(message, type);
  }, [showToast]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // 검색 필터 적용된 직원 목록
  const filteredEmployees = useMemo(() => {
    if (!employeeSearchTerm.trim()) return sortedEmployees;
    const term = employeeSearchTerm.trim().toLowerCase();
    return sortedEmployees.filter(emp =>
      emp.name.toLowerCase().includes(term) ||
      (emp.department || '').toLowerCase().includes(term)
    );
  }, [sortedEmployees, employeeSearchTerm]);

  // 페이징된 직원 목록
  const paginatedEmployees = useMemo(() => {
    const startIndex = (employeeListPaging.currentPage - 1) * employeeListPaging.itemsPerPage;
    const endIndex = startIndex + employeeListPaging.itemsPerPage;
    return filteredEmployees.slice(startIndex, endIndex);
  }, [filteredEmployees, employeeListPaging.currentPage, employeeListPaging.itemsPerPage]);

  // 페이징된 관리 기록
  const paginatedHistoryRecords = useMemo(() => {
    const startIndex = (historyPaging.currentPage - 1) * historyPaging.itemsPerPage;
    const endIndex = startIndex + historyPaging.itemsPerPage;
    return sortedHistoryRecords.slice(startIndex, endIndex);
  }, [sortedHistoryRecords, historyPaging.currentPage, historyPaging.itemsPerPage]);

  // 방어적 권한 체크: employee 역할은 접근 불가
  if (!canManageEmployees) {
    return (
      <div className="text-center py-16">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">접근 권한이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toast
        message={toast.message}
        show={toast.show}
        onClose={hideToast}
        type={toast.type}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">구성원 관리</h2>
        {activeEmployeeTab === 'list' && canEditEmployees && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowBulkModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>여러 명 추가</span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>직원 추가</span>
            </button>
          </div>
        )}
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-4 sm:space-x-8" aria-label="Tabs">
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
          {canManageTeam && (
            <button
              onClick={() => handleEmployeeTabChange('team')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeEmployeeTab === 'team'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Link2 className="w-4 h-4 inline-block mr-2" />
              팀원 관리 ({members.length})
            </button>
          )}
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

      {/* 직원 검색 (목록 탭에서만) */}
      {activeEmployeeTab === 'list' && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={employeeSearchTerm}
            onChange={(e) => { setEmployeeSearchTerm(e.target.value); employeeListPaging.setCurrentPage(1); }}
            placeholder="이름 또는 부서로 검색..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {activeEmployeeTab === 'list' && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-[700px] divide-y divide-gray-200" style={{tableLayout: 'fixed'}}>
                <colgroup>
                  <col style={{width: '15%'}} />
                  <col style={{width: '15%'}} />
                  <col style={{width: '15%'}} />
                  <col style={{width: '15%'}} />
                  <col style={{width: '25%'}} />
                  <col style={{width: '15%'}} />
                </colgroup>
                <thead className="bg-gray-50">
                  <tr>
                    <SortableHeader
                      field="createdAt"
                      sortConfig={employeeListPaging.sortConfig}
                      onSort={employeeListPaging.handleSort}
                    >
                      등록일
                    </SortableHeader>
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
                      field="hireDate"
                      sortConfig={employeeListPaging.sortConfig}
                      onSort={employeeListPaging.handleSort}
                    >
                      입사일
                    </SortableHeader>
                    <TableHeader>메모</TableHeader>
                    <TableHeader className="text-right">작업</TableHeader>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedEmployees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-500">
                        <div style={{display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-all'}}>
                          {new Date(employee.createdAt).toLocaleDateString('ko-KR')}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm font-medium text-gray-900">
                        <div style={{display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-all'}}>
                          {employee.name}
                          {employee.linkedUserId && (
                            <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full ml-1">✓ 연결됨</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-500">
                        <div style={{display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-all'}}>
                          {employee.department || '미지정'}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-500">
                        <div style={{display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-all'}}>
                          {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString('ko-KR') : '-'}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-500" title={employee.notes || ''}>
                        <div style={{display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-all'}}>
                          {employee.notes || '-'}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {canEditEmployees ? (
                          <>
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
                          </>
                        ) : (
                          <span className="text-gray-400 text-xs">조회만 가능</span>
                        )}
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
              totalPages={Math.max(1, Math.ceil(filteredEmployees.length / employeeListPaging.itemsPerPage))}
              onPageChange={employeeListPaging.setCurrentPage}
              itemsPerPage={employeeListPaging.itemsPerPage}
              totalItems={filteredEmployees.length}
            />
          </>
        )}

        {activeEmployeeTab === 'team' && canManageTeam && (
          <div className="p-6">
            <ConfirmModal
              show={!!removeTarget}
              onClose={() => setRemoveTarget(null)}
              onConfirm={handleRemoveConfirm}
              title="팀원 내보내기"
              message={`${removeTarget?.name || '이 팀원'}을(를) 회사에서 내보내시겠습니까?\n내보낸 팀원은 다시 초대 링크를 통해 재참여해야 합니다.`}
              confirmText="내보내기"
              cancelText="취소"
              type="danger"
              loading={!!memberUpdating}
            />

            <EmployeeLinkModal
              member={linkingMember}
              onClose={handleLinkModalClose}
              onLinked={handleLinked}
            />

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">팀원 관리</h3>
              {!membersLoading && (
                <span className="text-sm text-gray-500">
                  총 {members.length}명
                </span>
              )}
            </div>

            {membersLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">팀원 목록 로딩 중...</span>
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">팀원이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => {
                  const isOwner = member.role === 'owner';
                  const isMe = member.id === user?.id;
                  const isDisabled = isOwner || isMe;
                  const isUpdating = memberUpdating === member.id;
                  const canRemove = !isOwner && !isMe;

                  return (
                    <div key={member.id} className={`border rounded-lg p-4 ${isUpdating ? 'opacity-50' : ''} ${isOwner ? 'bg-blue-50 border-blue-200' : 'border-gray-200'}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {member.fullName || '이름 없음'}
                            </span>
                            {isMe && (
                              <span className="text-xs text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">나</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 truncate">{member.email}</div>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            {formatDate(member.appliedAt) && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                신청 {formatDate(member.appliedAt)}
                              </span>
                            )}
                            {formatDate(member.approvedAt) && (
                              <span>
                                승인 {formatDate(member.approvedAt)}
                              </span>
                            )}
                          </div>
                          <div className="mt-1">
                            {linkedEmployeeMap[member.id] ? (
                              <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                                ✓ {linkedEmployeeMap[member.id].name} 연결됨
                              </span>
                            ) : (
                              <button
                                onClick={() => openLinkingModal(member)}
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                <Link2 className="w-3 h-3" />
                                직원 연결
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isDisabled ? (
                            <span className="text-sm text-blue-700 font-medium px-3 py-1.5 bg-blue-100 rounded-md">
                              {isOwner ? '소유자' : member.role === 'admin' ? '관리자' : '구성원'}
                            </span>
                          ) : (
                            <>
                              <select
                                value={member.role}
                                onChange={(e) => handleRoleChange(member.id, e.target.value, member.permission)}
                                disabled={isUpdating}
                                className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="admin">관리자</option>
                                <option value="employee">구성원</option>
                              </select>
                              <select
                                value={member.permission}
                                onChange={(e) => handlePermissionChange(member.id, member.role, e.target.value)}
                                disabled={isUpdating}
                                className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="editor">편집</option>
                                <option value="viewer">뷰어</option>
                              </select>
                            </>
                          )}
                          {canRemove && (
                            <button
                              onClick={() => setRemoveTarget({ id: member.id, name: member.fullName })}
                              disabled={isUpdating}
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                              title="내보내기"
                            >
                              <UserMinus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-blue-800">
                <strong>안내:</strong>
              </p>
              <ul className="text-xs text-blue-700 mt-2 space-y-1 ml-4">
                <li>역할/권한 변경은 해당 팀원이 다음 로그인 시 적용됩니다</li>
                <li>소유자 역할은 변경할 수 없습니다</li>
                <li>뷰어 권한은 조회만 가능합니다</li>
                <li>내보낸 팀원은 다시 초대 링크를 통해 재참여해야 합니다</li>
                <li>구성원 + 편집 권한 = 직접 시간 제출 가능 (내 근무 탭)</li>
              </ul>
            </div>
          </div>
        )}

        {activeEmployeeTab === 'history' && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-[600px] divide-y divide-gray-200" style={{tableLayout: 'fixed'}}>
                <colgroup>
                  <col style={{width: '20%'}} />
                  <col style={{width: '10%'}} />
                  <col style={{width: '35%'}} />
                  <col style={{width: '35%'}} />
                </colgroup>
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
                      <td className="px-3 sm:px-6 py-4 text-xs text-gray-500">
                        <div style={{display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-all'}}>
                          {new Date(record.createdAt).toLocaleString('ko-KR')}
                        </div>
                      </td>
                      <td className={`px-3 sm:px-6 py-4 text-sm font-medium ${
                        record.action === '생성' ? 'text-green-600' :
                        record.action === '수정' ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        <div style={{display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-all'}}>
                          {record.action}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm font-medium text-gray-900">
                        <div style={{display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-all'}}>
                          {record.employeeName}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-500">
                        <div style={{display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-all'}}>
                          {record.details}
                        </div>
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

      <BulkEmployeeModal
        show={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSuccess={(message) => {
          setShowBulkModal(false);
          showToast(message);
        }}
      />
    </div>
  );
});

export default EmployeeManagement;
