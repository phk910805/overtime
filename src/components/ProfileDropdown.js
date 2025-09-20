/**
 * ProfileDropdown Component
 * 사용자 프로필 정보와 메뉴를 표시하는 드롭다운
 */

import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Edit, ChevronDown } from 'lucide-react';

const ProfileDropdown = ({ user, onSignOut, onProfileEdit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 사용자 이름에서 이니셜 생성
  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 드롭다운 토글
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // 로그아웃 처리
  const handleSignOut = async () => {
    setIsOpen(false);
    try {
      await onSignOut();
    } catch (error) {
      console.error('로그아웃 에러:', error);
    }
  };

  // 프로필 편집 처리 (향후 구현)
  const handleProfileEdit = () => {
    setIsOpen(false);
    if (onProfileEdit) {
      onProfileEdit();
    } else {
      // 임시: 알림만 표시
      alert('프로필 편집 기능은 다음 단계에서 구현됩니다.');
    }
  };

  // 사용자 정보 추출
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '사용자';
  const userEmail = user?.email || '';
  const userInitials = getInitials(userName);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 프로필 버튼 */}
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="사용자 메뉴"
      >
        {/* 프로필 아이콘 */}
        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
          {userInitials}
        </div>
        
        {/* 사용자 이름 (데스크톱에서만 표시) */}
        <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-32 truncate">
          {userName}
        </span>
        
        {/* 드롭다운 화살표 */}
        <ChevronDown 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* 사용자 정보 섹션 */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                {userInitials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {userName}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {userEmail}
                </div>
              </div>
            </div>
          </div>

          {/* 메뉴 항목들 */}
          <div className="py-1">
            {/* 프로필 편집 */}
            <button
              onClick={handleProfileEdit}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
            >
              <Edit className="w-4 h-4 text-gray-400" />
              <span>프로필 편집</span>
            </button>

            {/* 구분선 */}
            <div className="border-t border-gray-100 my-1"></div>

            {/* 로그아웃 */}
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
