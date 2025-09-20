// src/components/auth/UserMenu.js
// 사용자 메뉴 컴포넌트 (헤더에 표시)

import React, { useState } from 'react';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';

const UserMenu = ({ user, onLogout, onSettings }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    setIsOpen(false);
    await onLogout();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-gray-500">{user.role === 'admin' ? '관리자' : '사용자'}</p>
        </div>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          {/* 오버레이 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* 드롭다운 메뉴 */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            
            <div className="py-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onSettings?.();
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Settings className="w-4 h-4 mr-3" />
                설정
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-3" />
                로그아웃
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;
