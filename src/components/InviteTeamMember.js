import React, { useState } from 'react';
import { Mail, Clock, CheckCircle, Copy } from 'lucide-react';
import { getDataService } from '../services/dataService';

/**
 * 팀원 초대 모달
 * - 이메일 입력
 * - 초대 코드 생성
 * - 초대 코드 표시 및 복사
 */
const InviteTeamMember = ({ companyName, onClose, onInvite }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [inviteData, setInviteData] = useState(null);
  const [copied, setCopied] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async () => {
    setError('');

    // 검증
    if (!email || !validateEmail(email)) {
      setError('올바른 이메일 주소를 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const dataService = getDataService();
      const result = await dataService.createInviteCode(email);

      setInviteData(result);
      setSuccess(true);

      // 부모 컴포넌트에 알림
      if (onInvite) {
        onInvite(result);
      }
    } catch (err) {
      setError(err.message || '초대 코드 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (inviteData?.inviteCode) {
      navigator.clipboard.writeText(inviteData.inviteCode);
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
  if (success && inviteData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              초대 코드가 생성되었습니다!
            </h3>
            
            <p className="text-gray-600 mb-6">
              {inviteData.email}으로<br />
              초대 코드를 전달해주세요
            </p>

            {/* 초대 코드 표시 */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
              <div className="text-sm text-gray-600 mb-2">초대 코드</div>
              <div className="flex items-center justify-center gap-2">
                <div className="text-3xl font-mono font-bold text-blue-600">
                  {inviteData.inviteCode}
                </div>
                <button
                  onClick={handleCopyCode}
                  className="p-2 hover:bg-blue-100 rounded-md transition-colors"
                  title="복사"
                >
                  <Copy className="w-5 h-5 text-blue-600" />
                </button>
              </div>
              {copied && (
                <div className="text-xs text-green-600 mt-2">
                  ✓ 복사되었습니다
                </div>
              )}
            </div>

            {/* 만료 시간 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <div className="flex items-center justify-center gap-2 text-sm text-yellow-800">
                <Clock className="w-4 h-4" />
                <span>
                  만료 시간: {formatExpiryTime(inviteData.expiresAt)}
                </span>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                (1시간 후 자동 만료)
              </p>
            </div>

            {/* 안내 메시지 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-700 mb-2">
                📧 <strong>다음 정보를 전달해주세요:</strong>
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• 초대 코드: <span className="font-mono font-semibold">{inviteData.inviteCode}</span></li>
                <li>• 가입 이메일: {inviteData.email}</li>
                <li>• 만료 시간: 1시간</li>
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

  // 입력 화면
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">팀원 초대</h3>
        
        <p className="text-gray-600 mb-6">
          초대할 팀원의 이메일을 입력하세요
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이메일 주소 <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            placeholder="user@example.com"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
            autoFocus
          />
        </div>

        {/* 안내 메시지 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <div className="flex items-start gap-2 mb-2">
            <Mail className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              초대 코드가 생성되면 이메일로 전달해주세요
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              코드는 <strong>1시간 동안</strong> 유효합니다
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
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={loading || !email}
          >
            {loading ? '생성 중...' : '초대 코드 생성'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteTeamMember;
