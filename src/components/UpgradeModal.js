/**
 * UpgradeModal.js
 * 업그레이드 유도 공통 모달 — 직원 추가 제한 / 월 변경 제한 시 표시
 */

import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown } from 'lucide-react';

const UpgradeModal = memo(({ show, onClose, title, message }) => {
  const navigate = useNavigate();

  if (!show) return null;

  const handleViewPlan = () => {
    onClose();
    navigate('/settings/plan');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Crown className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title || '업그레이드가 필요합니다'}
          </h3>
          <p className="text-sm text-gray-600 mb-5">
            {message}
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
            >
              닫기
            </button>
            <button
              onClick={handleViewPlan}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              플랜 보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default UpgradeModal;
