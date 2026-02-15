import React, { useState, useEffect, useCallback, memo } from 'react';
import { getDataService } from '../../services/dataService';
import { useAuth } from '../../hooks/useAuth';
import InviteTeamMember from '../InviteTeamMember';
import { Clock, Link, Copy, Check, X, UserCheck, Calendar } from 'lucide-react';
import { Toast, ConfirmModal } from '../CommonUI';

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
};

const SettingsInvite = memo(({ onPendingChange }) => {
  const { canInvite, isAdmin } = useAuth();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [activeLink, setActiveLink] = useState(null);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [loadingLink, setLoadingLink] = useState(true);
  const [loadingPending, setLoadingPending] = useState(true);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // 승인/거절 시 각 멤버별 역할/권한 상태
  const [memberSettings, setMemberSettings] = useState({});
  const [processingMember, setProcessingMember] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast({ show: false, message: '', type: 'success' });
  }, []);

  const loadActiveLink = useCallback(async () => {
    try {
      setLoadingLink(true);
      const dataService = getDataService();
      const link = await dataService.getActiveInviteLink();
      setActiveLink(link);
    } catch (err) {
      console.error('활성 링크 로드 실패:', err);
      setActiveLink(null);
    } finally {
      setLoadingLink(false);
    }
  }, []);

  const loadPendingMembers = useCallback(async () => {
    try {
      setLoadingPending(true);
      const dataService = getDataService();
      const members = await dataService.getPendingMembers();
      setPendingMembers(members || []);
      // 초기 역할/권한 설정
      const settings = {};
      (members || []).forEach(m => {
        settings[m.id] = { role: 'employee', permission: 'editor' };
      });
      setMemberSettings(settings);
    } catch (err) {
      console.error('대기 멤버 로드 실패:', err);
      setPendingMembers([]);
    } finally {
      setLoadingPending(false);
    }
  }, []);

  useEffect(() => {
    loadActiveLink();
    loadPendingMembers();
  }, [loadActiveLink, loadPendingMembers]);

  const handleInviteCreated = useCallback(() => {
    showToast('초대 링크가 생성되었습니다');
    setShowInviteModal(false);
    loadActiveLink();
  }, [showToast, loadActiveLink]);

  const getInviteUrl = () => {
    if (!activeLink?.token) return '';
    return `${window.location.origin}/invite/${activeLink.token}`;
  };

  const handleCopyLink = () => {
    const url = getInviteUrl();
    if (url) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getRemainingTime = () => {
    if (!activeLink?.expiresAt) return '';
    const now = new Date();
    const expires = new Date(activeLink.expiresAt);
    const diff = expires - now;
    if (diff <= 0) return '만료됨';
    const minutes = Math.floor(diff / 60000);
    if (minutes >= 60) {
      return `${Math.floor(minutes / 60)}시간 ${minutes % 60}분 남음`;
    }
    return `${minutes}분 남음`;
  };

  const handleMemberSettingChange = (memberId, field, value) => {
    setMemberSettings(prev => ({
      ...prev,
      [memberId]: { ...prev[memberId], [field]: value }
    }));
  };

  const handleApprove = useCallback(async (memberId) => {
    const settings = memberSettings[memberId];
    if (!settings) return;

    setProcessingMember(memberId);
    try {
      const dataService = getDataService();
      await dataService.approveJoinRequest(memberId, settings.role, settings.permission);
      showToast('참여 요청을 승인했습니다.');
      await loadPendingMembers();
      onPendingChange?.();
    } catch (err) {
      showToast(err.message || '승인에 실패했습니다.', 'error');
    } finally {
      setProcessingMember(null);
    }
  }, [memberSettings, showToast, loadPendingMembers, onPendingChange]);

  const handleRejectConfirm = useCallback(async () => {
    if (!rejectTarget) return;

    setProcessingMember(rejectTarget.id);
    try {
      const dataService = getDataService();
      await dataService.rejectJoinRequest(rejectTarget.id);
      showToast('참여 요청을 거절했습니다.');
      setRejectTarget(null);
      await loadPendingMembers();
      onPendingChange?.();
    } catch (err) {
      showToast(err.message || '거절에 실패했습니다.', 'error');
    } finally {
      setProcessingMember(null);
    }
  }, [rejectTarget, showToast, loadPendingMembers, onPendingChange]);

  return (
    <>
      <Toast
        message={toast.message}
        show={toast.show}
        onClose={hideToast}
        type={toast.type}
      />
      <ConfirmModal
        show={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleRejectConfirm}
        title="참여 요청 거절"
        message={`${rejectTarget?.name || '이 사용자'}의 참여 요청을 거절하시겠습니까?`}
        confirmText="거절"
        cancelText="취소"
        type="danger"
        loading={!!processingMember}
      />
      {showInviteModal && (
        <InviteTeamMember
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInviteCreated}
        />
      )}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">팀원 초대</h3>

        <div className="space-y-8">
          {/* 섹션 1: 초대 링크 */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-medium text-gray-700">초대 링크</h4>
              {canInvite && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm flex items-center gap-2"
                >
                  <Link className="w-4 h-4" />
                  {activeLink ? '링크 갱신' : '초대 링크 생성'}
                </button>
              )}
            </div>

            {loadingLink ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : activeLink ? (
              <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 text-sm font-mono text-blue-600 break-all">
                    {getInviteUrl()}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="p-2 hover:bg-blue-100 rounded-md transition-colors flex-shrink-0"
                    title="복사"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-1 text-xs text-blue-700">
                  <Clock className="w-3 h-3" />
                  <span>{getRemainingTime()}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Link className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">활성 초대 링크가 없습니다</p>
                <p className="text-gray-500 text-xs mt-1">초대 링크를 생성하여 팀원을 초대하세요</p>
              </div>
            )}
          </div>

          {/* 섹션 2: 참여 대기 목록 */}
          {isAdmin && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">
                참여 대기 목록
                {pendingMembers.length > 0 && (
                  <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                    {pendingMembers.length}
                  </span>
                )}
              </h4>

              {loadingPending ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : pendingMembers.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <UserCheck className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">대기 중인 참여 요청이 없습니다</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingMembers.map((member) => {
                    const isProcessing = processingMember === member.id;
                    const settings = memberSettings[member.id] || { role: 'employee', permission: 'editor' };

                    return (
                      <div key={member.id} className={`border border-gray-200 rounded-lg p-4 ${isProcessing ? 'opacity-50' : ''}`}>
                        <div className="flex flex-col gap-3">
                          {/* 이름/이메일/신청일 */}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {member.fullName || '이름 없음'}
                            </div>
                            <div className="text-xs text-gray-500">{member.email}</div>
                            {formatDate(member.appliedAt) && (
                              <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                                <Calendar className="w-3 h-3" />
                                <span>신청 {formatDate(member.appliedAt)}</span>
                              </div>
                            )}
                          </div>

                          {/* 역할/권한 선택 + 버튼 */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <select
                              value={settings.role}
                              onChange={(e) => handleMemberSettingChange(member.id, 'role', e.target.value)}
                              disabled={isProcessing}
                              className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="admin">관리자</option>
                              <option value="employee">구성원</option>
                            </select>
                            <select
                              value={settings.permission}
                              onChange={(e) => handleMemberSettingChange(member.id, 'permission', e.target.value)}
                              disabled={isProcessing}
                              className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="editor">편집</option>
                              <option value="viewer">뷰어</option>
                            </select>
                            <div className="flex gap-1 ml-auto">
                              <button
                                onClick={() => handleApprove(member.id)}
                                disabled={isProcessing}
                                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:bg-gray-300 flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                승인
                              </button>
                              <button
                                onClick={() => setRejectTarget({ id: member.id, name: member.fullName })}
                                disabled={isProcessing}
                                className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-md hover:bg-red-200 disabled:bg-gray-100 flex items-center gap-1"
                              >
                                <X className="w-3 h-3" />
                                거절
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>안내:</strong>
            </p>
            <ul className="text-xs text-blue-700 mt-2 space-y-1 ml-4">
              <li>초대 링크는 1시간 동안 유효합니다</li>
              <li>링크를 통해 여러 명이 참여 신청할 수 있습니다</li>
              <li>참여 신청 후 관리자가 역할/권한을 설정하여 승인합니다</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
});

export default SettingsInvite;
