// src/components/auth/ProtectedRoute.js
// 보호된 경로 컴포넌트

import React from 'react';
import { AlertCircle, Lock } from 'lucide-react';

const ProtectedRoute = ({ 
  children, 
  user, 
  requiredRole = null,
  requiredPermission = null,
  fallback = null,
  showLoginPrompt = true,
  onLoginRequired
}) => {
  // 로그인 확인
  if (!user) {
    if (fallback) return fallback;
    
    if (showLoginPrompt) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">로그인이 필요합니다</h3>
            <p className="text-gray-600 mb-4">이 기능을 사용하려면 로그인해주세요.</p>
            {onLoginRequired && (
              <button
                onClick={onLoginRequired}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                로그인
              </button>
            )}
          </div>
        </div>
      );
    }
    
    return null;
  }

  // 역할 확인
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">접근 권한이 없습니다</h3>
          <p className="text-gray-600">이 기능은 {requiredRole === 'admin' ? '관리자' : '특정 사용자'}만 사용할 수 있습니다.</p>
        </div>
      </div>
    );
  }

  // 권한 확인 (향후 확장용)
  if (requiredPermission && !user.permissions?.includes(requiredPermission)) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">권한이 부족합니다</h3>
          <p className="text-gray-600">이 기능을 사용할 권한이 없습니다.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
