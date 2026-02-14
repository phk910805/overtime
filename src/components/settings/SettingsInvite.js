import React, { useState, useEffect, useCallback, memo } from 'react';
import { getDataService } from '../../services/dataService';
import InviteTeamMember from '../InviteTeamMember';
import { Users, Clock, Mail } from 'lucide-react';
import { Toast } from '../CommonUI';

const SettingsInvite = memo(() => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [activeInvites, setActiveInvites] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast({ show: false, message: '', type: 'success' });
  }, []);

  const loadActiveInvites = useCallback(async () => {
    try {
      const dataService = getDataService();
      const invites = await dataService.getActiveInviteCodes();
      setActiveInvites(invites);
    } catch (err) {
      console.error('초대 코드 로드 실패:', err);
      setActiveInvites([]);
    }
  }, []);

  useEffect(() => {
    loadActiveInvites();
  }, [loadActiveInvites]);

  const handleInviteCreated = useCallback((inviteData) => {
    showToast('초대 코드가 생성되었습니다');
    setShowInviteModal(false);
    loadActiveInvites();
  }, [showToast, loadActiveInvites]);

  return (
    <>
      <Toast
        message={toast.message}
        show={toast.show}
        onClose={hideToast}
        type={toast.type}
      />
      {showInviteModal && (
        <InviteTeamMember
          companyName="회사명"
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInviteCreated}
        />
      )}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">팀원 초대</h3>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-700">활성 초대 코드</h4>
            <button
              onClick={() => setShowInviteModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              초대 코드 생성
            </button>
          </div>

          {activeInvites.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">생성된 초대 코드가 없습니다</p>
              <p className="text-sm text-gray-500">팀원을 초대하려면 초대 코드를 생성하세요</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeInvites.map((invite) => (
                <div key={invite.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-mono font-bold text-lg text-blue-600">
                        {invite.inviteCode}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <Mail className="w-3 h-3 inline mr-1" />
                        {invite.email}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        만료: {new Date(invite.expiresAt).toLocaleString('ko-KR')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>안내:</strong>
            </p>
            <ul className="text-xs text-blue-700 mt-2 space-y-1 ml-4">
              <li>초대 코드는 1시간 동안 유효합니다</li>
              <li>초대받은 이메일로만 가입할 수 있습니다</li>
              <li>코드는 1회만 사용 가능합니다</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
});

export default SettingsInvite;
