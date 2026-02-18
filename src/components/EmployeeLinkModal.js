import React, { useState, useCallback, useMemo, memo } from 'react';
import { Users } from 'lucide-react';
import { getDataService } from '../services/dataService';
import { useOvertimeContext } from '../context';

const EmployeeLinkModal = memo(({ member, onClose, onLinked }) => {
  const { employees, addEmployee, updateEmployee } = useOvertimeContext();

  const [linkMode, setLinkMode] = useState('new');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [existingEmployeeName, setExistingEmployeeName] = useState('');
  const [newEmployeeForm, setNewEmployeeForm] = useState({
    name: member?.fullName || '',
    department: '',
    hireDate: ''
  });
  const [linkProcessing, setLinkProcessing] = useState(false);

  const unlinkedEmployees = useMemo(() => {
    return employees.filter(emp => !emp.linkedUserId);
  }, [employees]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleLinkEmployee = useCallback(async () => {
    if (!member) return;

    setLinkProcessing(true);
    try {
      const dataService = getDataService();

      if (linkMode === 'new') {
        if (!newEmployeeForm.name?.trim() || !newEmployeeForm.department?.trim() || !newEmployeeForm.hireDate) {
          onLinked('이름, 부서, 입사일은 필수입니다.', 'error');
          setLinkProcessing(false);
          return;
        }
        await addEmployee({
          name: newEmployeeForm.name.trim(),
          department: newEmployeeForm.department.trim(),
          hireDate: newEmployeeForm.hireDate,
          linkedUserId: member.id
        });
        onLinked(`새 직원 "${newEmployeeForm.name.trim()}"이(가) 추가되고 연결되었습니다.`);
      } else if (linkMode === 'existing') {
        if (!selectedEmployeeId) {
          onLinked('연결할 직원을 선택해주세요.', 'error');
          setLinkProcessing(false);
          return;
        }
        const linkedEmp = employees.find(e => e.id === selectedEmployeeId);
        const trimmedName = existingEmployeeName.trim();
        if (trimmedName && linkedEmp && trimmedName !== linkedEmp.name) {
          await updateEmployee(selectedEmployeeId, { ...linkedEmp, name: trimmedName });
        }
        await dataService.linkEmployeeToProfile(selectedEmployeeId, member.id);
        onLinked(`"${trimmedName || linkedEmp?.name || '직원'}"에 연결되었습니다.`);
      }

      handleClose();
    } catch (err) {
      onLinked(err.message || '직원 연결에 실패했습니다.', 'error');
    } finally {
      setLinkProcessing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member, linkMode, newEmployeeForm, selectedEmployeeId, existingEmployeeName, addEmployee, updateEmployee, employees, onLinked, handleClose]);

  if (!member) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">직원 연결</h3>
          </div>

          <p className="text-sm text-gray-600 mb-5">
            <strong>{member.fullName || member.email}</strong>을(를) 직원 데이터에 연결하세요.
          </p>

          <div className="space-y-2 mb-5">
            <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="employeeLinkMode"
                value="new"
                checked={linkMode === 'new'}
                onChange={() => setLinkMode('new')}
                className="text-blue-600"
              />
              <span className="text-sm font-medium text-gray-900">새 직원 추가</span>
            </label>
            <label className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${unlinkedEmployees.length === 0 ? 'opacity-50' : ''}`}>
              <input
                type="radio"
                name="employeeLinkMode"
                value="existing"
                checked={linkMode === 'existing'}
                onChange={() => setLinkMode('existing')}
                disabled={unlinkedEmployees.length === 0}
                className="text-blue-600"
              />
              <span className="text-sm font-medium text-gray-900">기존 직원 연결</span>
              {unlinkedEmployees.length === 0 && (
                <span className="text-xs text-gray-400 ml-1">(미연결 직원 없음)</span>
              )}
            </label>
          </div>

          {linkMode === 'new' && (
            <div className="space-y-3 border-t pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newEmployeeForm.name}
                  onChange={(e) => setNewEmployeeForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="직원명"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  부서 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newEmployeeForm.department}
                  onChange={(e) => setNewEmployeeForm(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="부서명"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  입사일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newEmployeeForm.hireDate}
                  onChange={(e) => setNewEmployeeForm(prev => ({ ...prev, hireDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          )}

          {linkMode === 'existing' && (
            <div className="border-t pt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  직원 선택 <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => {
                    setSelectedEmployeeId(e.target.value);
                    const emp = employees.find(el => el.id === e.target.value);
                    setExistingEmployeeName(emp?.name || '');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">-- 직원을 선택하세요 --</option>
                  {unlinkedEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.department || '부서 미지정'})
                    </option>
                  ))}
                </select>
              </div>
              {selectedEmployeeId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    직원명 수정
                  </label>
                  <input
                    type="text"
                    value={existingEmployeeName}
                    onChange={(e) => setExistingEmployeeName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="이름을 수정하려면 입력하세요"
                  />
                  <p className="mt-1 text-xs text-gray-400">변경하지 않으면 기존 이름이 유지됩니다.</p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={handleClose}
              disabled={linkProcessing}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              나중에 연결
            </button>
            <button
              onClick={handleLinkEmployee}
              disabled={linkProcessing}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 flex items-center gap-1"
            >
              {linkProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  처리 중...
                </>
              ) : (
                '연결 완료'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default EmployeeLinkModal;
