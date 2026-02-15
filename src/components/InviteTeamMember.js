import React, { useState } from 'react';
import { Clock, CheckCircle, Copy, Link } from 'lucide-react';
import { getDataService } from '../services/dataService';

/**
 * 팀원 초대 모달 (링크 기반)
 * - 초대 링크 생성 버튼
 * - 생성된 링크 표시 및 복사
 */
const InviteTeamMember = ({ onClose, onInvite }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [linkData, setLinkData] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCreateLink = async () => {
    setError('');
    setLoading(true);

    try {
      const dataService = getDataService();
      const result = await dataService.createInviteLink();

      setLinkData(result);
      setSuccess(true);

      if (onInvite) {
        onInvite(result);
      }
    } catch (err) {
      setError(err.message || '초대 링크 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getInviteUrl = () => {
    if (!linkData?.token) return '';
    const origin = window.location.origin;
    return `${origin}/invite/${linkData.token}`;
  };

  const handleCopyLink = () => {
    const url = getInviteUrl();
    if (url) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatExpiryTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('ko-KR', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 성공 화면
  if (success && linkData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              초대 링크가 생성되었습니다!
            </h3>

            <p className="text-gray-600 mb-6">
              아래 링크를 팀원에게 공유해주세요
            </p>

            {/* 초대 링크 표시 */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
              <div className="text-sm text-gray-600 mb-2">초대 링크</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 text-sm font-mono text-blue-600 break-all text-left">
                  {getInviteUrl()}
                </div>
                <button
                  onClick={handleCopyLink}
                  className="p-2 hover:bg-blue-100 rounded-md transition-colors flex-shrink-0"
                  title="복사"
                >
                  <Copy className="w-5 h-5 text-blue-600" />
                </button>
              </div>
              {copied && (
                <div className="text-xs text-green-600 mt-2">
                  복사되었습니다
                </div>
              )}
            </div>

            {/* 만료 시간 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <div className="flex items-center justify-center gap-2 text-sm text-yellow-800">
                <Clock className="w-4 h-4" />
                <span>
                  만료 시간: {formatExpiryTime(linkData.expiresAt)}
                </span>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                (1시간 후 자동 만료)
              </p>
            </div>

            {/* 안내 메시지 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-700 mb-2">
                <strong>안내:</strong>
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>링크를 클릭하면 누구나 가입 신청할 수 있습니다</li>
                <li>가입 신청 후 관리자가 역할/권한을 설정하여 승인합니다</li>
                <li>1시간 내 여러 명이 같은 링크로 참여할 수 있습니다</li>
              </ul>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 생성 화면
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">팀원 초대</h3>

        <p className="text-gray-600 mb-6">
          초대 링크를 생성하여 팀원에게 공유하세요.<br />
          링크를 받은 사람은 가입 후 참여 신청할 수 있습니다.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* 안내 메시지 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <div className="flex items-start gap-2 mb-2">
            <Link className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              링크 1개로 여러 팀원을 초대할 수 있습니다
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              링크는 <strong>1시간 동안</strong> 유효합니다
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={loading}
          >
            취소
          </button>
          <button
            onClick={handleCreateLink}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={loading}
          >
            {loading ? '생성 중...' : (
              <>
                <Link className="w-4 h-4" />
                초대 링크 생성
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteTeamMember;
