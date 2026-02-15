import React from 'react';
import { Clock, LogOut, Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

/**
 * 승인 대기 화면
 * /pending
 * - 시계 아이콘 + 승인 대기 안내
 * - 현재 로그인 계정 표시
 * - 로그아웃 버튼
 */
const PendingApproval = () => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    window.location.replace('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-12 h-12 text-yellow-600" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          승인 대기 중
        </h2>
        <p className="text-gray-600 mb-6">
          관리자의 승인을 기다리고 있습니다.<br />
          승인이 완료되면 서비스를 이용할 수 있습니다.
        </p>

        {/* 로그인 계정 정보 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span>{user?.email || '알 수 없음'}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 py-2 px-4 rounded-md hover:bg-gray-50"
        >
          <LogOut className="w-4 h-4" />
          로그아웃
        </button>
      </div>
    </div>
  );
};

export default PendingApproval;
