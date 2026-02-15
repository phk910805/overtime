import React, { useState, useEffect, useCallback, memo } from 'react';
import { Users, UserMinus, Calendar } from 'lucide-react';
import { getDataService } from '../../services/dataService';
import { useAuth } from '../../hooks/useAuth';
import { Toast, ConfirmModal } from '../CommonUI';

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
};

const SettingsTeamManagement = memo(() => {
  const { canManageTeam, user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [removeTarget, setRemoveTarget] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast({ show: false, message: '', type: 'success' });
  }, []);

  const loadMembers = useCallback(async () => {
    try {
      setLoading(true);
      const dataService = getDataService();
      const data = await dataService.getCompanyMembers();
      // RPC가 active만 반환하므로 추가 필터 불필요
      setMembers(data || []);
    } catch (err) {
      console.error('팀원 목록 로드 실패:', err);
      showToast('팀원 목록을 불러오는데 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleRoleChange = useCallback(async (memberId, newRole, currentPermission) => {
    setUpdating(memberId);
    try {
      const dataService = getDataService();
      await dataService.updateMemberRole(memberId, newRole, currentPermission);
      showToast('역할이 변경되었습니다.');
      await loadMembers();
    } catch (err) {
      console.error('역할 변경 실패:', err);
      showToast(err.message || '역할 변경에 실패했습니다.', 'error');
    } finally {
      setUpdating(null);
    }
  }, [showToast, loadMembers]);

  const handlePermissionChange = useCallback(async (memberId, currentRole, newPermission) => {
    setUpdating(memberId);
    try {
      const dataService = getDataService();
      await dataService.updateMemberRole(memberId, currentRole, newPermission);
      showToast('권한이 변경되었습니다.');
      await loadMembers();
    } catch (err) {
      console.error('권한 변경 실패:', err);
      showToast(err.message || '권한 변경에 실패했습니다.', 'error');
    } finally {
      setUpdating(null);
    }
  }, [showToast, loadMembers]);

  const handleRemoveConfirm = useCallback(async () => {
    if (!removeTarget) return;

    setUpdating(removeTarget.id);
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
      setUpdating(null);
    }
  }, [removeTarget, showToast, loadMembers]);

  if (!canManageTeam) {
    return (
      <div className="text-center py-16">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">소유자만 접근할 수 있습니다.</p>
      </div>
    );
  }

  return (
    <>
      <Toast
        message={toast.message}
        show={toast.show}
        onClose={hideToast}
        type={toast.type}
      />
      <ConfirmModal
        show={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemoveConfirm}
        title="팀원 내보내기"
        message={`${removeTarget?.name || '이 팀원'}을(를) 회사에서 내보내시겠습니까?\n내보낸 팀원은 다시 초대 링크를 통해 재참여해야 합니다.`}
        confirmText="내보내기"
        cancelText="취소"
        type="danger"
        loading={!!updating}
      />
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">팀원 관리</h3>
          {!loading && (
            <span className="text-sm text-gray-500">
              총 {members.length}명
            </span>
          )}
        </div>

        {loading ? (
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
              const isUpdating = updating === member.id;
              const canRemove = !isOwner && !isMe;

              return (
                <div key={member.id} className={`border rounded-lg p-4 ${isUpdating ? 'opacity-50' : ''} ${isOwner ? 'bg-blue-50 border-blue-200' : 'border-gray-200'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* 이름/이메일/가입일 */}
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
                    </div>

                    {/* 역할/권한 선택 + 내보내기 */}
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
          </ul>
        </div>
      </div>
    </>
  );
});

export default SettingsTeamManagement;
