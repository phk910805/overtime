/**
 * MoreMenu.js
 * "더보기" 탭 — 프로필 카드 + 그룹별 메뉴 리스트 + 로그아웃
 */

import React, { useState, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, SlidersHorizontal, User, Bell, Building2, CreditCard, FileText, Lock, Mail, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ConfirmModal } from './CommonUI';

const ROLE_LEVEL = { owner: 3, admin: 2, employee: 1 };

const getRoleDisplayName = (role, permission) => {
  if (role === 'owner') return '소유자';
  const roleName = role === 'admin' ? '관리자' : '구성원';
  if (permission && permission !== 'editor') {
    return `${roleName}(뷰어)`;
  }
  return `${roleName}(편집)`;
};

const getInitials = (name) => {
  if (!name) return 'U';
  const names = name.split(' ');
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
};

const MoreMenu = memo(() => {
  const navigate = useNavigate();
  const { user, signOut, userRole, userPermission, isOwner } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '사용자';
  const userEmail = user?.email || '';
  const roleLevel = ROLE_LEVEL[userRole] || 1;

  const menuSections = useMemo(() => {
    const sections = [];

    // 관리 섹션 (admin 이상)
    if (roleLevel >= ROLE_LEVEL['admin']) {
      sections.push({
        title: '관리',
        items: [
          { id: 'employees', label: '구성원 관리', icon: Users, path: '/employees' },
          { id: 'invite', label: '팀원 초대', icon: UserPlus, path: '/settings/invite' },
          { id: 'multiplier', label: '계산/승인 설정', icon: SlidersHorizontal, path: '/settings/multiplier' },
        ],
      });
    }

    // 내 계정 섹션
    sections.push({
      title: '내 계정',
      items: [
        { id: 'profile', label: '프로필 편집', icon: User, path: '/settings/profile' },
        { id: 'notifications', label: '알림 설정', icon: Bell, path: '/settings/notifications' },
        { id: 'company', label: '회사 정보', icon: Building2, path: '/settings/company' },
      ],
    });

    // 기타 섹션
    const etcItems = [];
    if (isOwner) {
      etcItems.push({ id: 'plan', label: '플랜/결제', icon: CreditCard, path: '/settings/plan' });
    }
    etcItems.push(
      { id: 'terms', label: '이용약관', icon: FileText, path: '/terms' },
      { id: 'privacy', label: '개인정보처리방침', icon: Lock, path: '/privacy' },
      { id: 'contact', label: '문의하기', icon: Mail, href: 'mailto:support@overtime.dev' },
    );
    sections.push({ title: '기타', items: etcItems });

    return sections;
  }, [roleLevel, isOwner]);

  const handleMenuClick = useCallback((item) => {
    if (item.href) {
      window.location.href = item.href;
    } else {
      navigate(item.path);
    }
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    setShowLogoutConfirm(false);
    try {
      await signOut();
    } catch (err) {
      console.error('로그아웃 에러:', err);
    }
  }, [signOut]);

  return (
    <div className="max-w-lg mx-auto">
      {/* 프로필 카드 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium text-lg">
            {getInitials(userName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-gray-900 truncate">{userName}</p>
            <p className="text-sm text-gray-500 truncate">
              {userEmail}{userRole ? ` · ${getRoleDisplayName(userRole, userPermission)}` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* 메뉴 섹션들 */}
      {menuSections.map((section) => (
        <div key={section.title} className="mb-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-1 mb-1.5">{section.title}</p>
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* 로그아웃 */}
      <div className="mt-6 mb-8">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>로그아웃</span>
        </button>
      </div>

      {/* 로그아웃 확인 모달 */}
      <ConfirmModal
        show={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="로그아웃"
        message="정말 로그아웃 하시겠습니까?"
        confirmText="로그아웃"
        cancelText="취소"
        type="danger"
      />
    </div>
  );
});

export default MoreMenu;
