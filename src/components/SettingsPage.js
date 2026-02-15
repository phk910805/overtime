/**
 * SettingsPage.js
 * 설정 풀페이지 (UnifiedSettingsModal의 레이아웃을 페이지로 전환)
 * URL: /settings/:section (profile, company, multiplier, invite)
 */

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Building2, SlidersHorizontal, UserPlus, Users, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { getDataService } from '../services/dataService';
import { ConfirmModal } from './CommonUI';
import SettingsProfile from './settings/SettingsProfile';
import SettingsCompany from './settings/SettingsCompany';
import SettingsMultiplier from './settings/SettingsMultiplier';
import SettingsInvite from './settings/SettingsInvite';
import SettingsTeamManagement from './settings/SettingsTeamManagement';

const ALL_MENU_ITEMS = [
  { id: 'profile', label: '프로필 편집', icon: User, minRole: 'employee' },
  { id: 'company', label: '회사 정보', icon: Building2, minRole: 'employee' },
  { id: 'multiplier', label: '배수 설정', icon: SlidersHorizontal, minRole: 'admin' },
  { id: 'invite', label: '팀원 초대', icon: UserPlus, minRole: 'admin' },
  { id: 'team', label: '팀원 관리', icon: Users, minRole: 'owner' },
];

const ROLE_LEVEL = { owner: 3, admin: 2, employee: 1 };

const getFilteredMenuItems = (userRole) => {
  const userLevel = ROLE_LEVEL[userRole] || 1;
  return ALL_MENU_ITEMS.filter(item => userLevel >= (ROLE_LEVEL[item.minRole] || 1));
};

const SettingsPage = memo(() => {
  const { section } = useParams();
  const navigate = useNavigate();
  const { user, signOut, userRole: authUserRole } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // 역할 기반 메뉴 필터링
  const menuItems = useMemo(() => getFilteredMenuItems(authUserRole), [authUserRole]);
  const validSections = useMemo(() => menuItems.map(item => item.id), [menuItems]);

  // 유효하지 않은 section이면 /settings/profile로 리다이렉트
  useEffect(() => {
    if (!section || !validSections.includes(section)) {
      navigate('/settings/profile', { replace: true });
    }
  }, [section, navigate, validSections]);

  const activeSection = validSections.includes(section) ? section : 'profile';

  // 사용자 이니셜 생성
  const getInitials = useCallback((name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }, []);

  // 권한 한글 변환
  const getRoleDisplayName = useCallback((role, permission) => {
    if (role === 'owner') return '소유자';
    const roleName = role === 'admin' ? '관리자' : '구성원';
    if (permission && permission !== 'editor') {
      return `${roleName}(뷰어)`;
    }
    return `${roleName}(편집)`;
  }, []);

  // 프로필 데이터 로드
  const loadProfile = useCallback(async () => {
    if (!user) return;
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        setProfileData({
          fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          email: user.email || '',
          companyName: user.user_metadata?.company_name || '',
          businessNumber: user.user_metadata?.business_number || '',
          role: user.user_metadata?.role || 'employee',
          permission: 'editor'
        });
        return;
      }

      setProfileData({
        fullName: data.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        email: data.email || user.email || '',
        companyName: data.company_name || user.user_metadata?.company_name || '',
        businessNumber: data.business_number || user.user_metadata?.business_number || '',
        role: data.role || user.user_metadata?.role || 'employee',
        permission: data.permission || 'editor'
      });
    } catch (err) {
      console.error('프로필 로드 실패:', err);
      setProfileData({
        fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        email: user.email || '',
        companyName: user.user_metadata?.company_name || '',
        businessNumber: user.user_metadata?.business_number || '',
        role: user.user_metadata?.role || 'employee',
        permission: 'editor'
      });
    } finally {
      setProfileLoading(false);
    }
  }, [user]);

  // 마운트 시 프로필 로드
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // 대기 멤버 수 로드 (admin 이상)
  const loadPendingCount = useCallback(async () => {
    const level = ROLE_LEVEL[authUserRole] || 1;
    if (level < ROLE_LEVEL['admin']) return;
    try {
      const dataService = getDataService();
      const members = await dataService.getPendingMembers();
      setPendingCount((members || []).length);
    } catch {
      // 실패 시 무시
    }
  }, [authUserRole]);

  useEffect(() => {
    loadPendingCount();
  }, [loadPendingCount]);

  // 로그아웃 처리
  const handleLogout = useCallback(async () => {
    setShowLogoutConfirm(false);
    try {
      await signOut();
    } catch (err) {
      console.error('로그아웃 에러:', err);
    }
  }, [signOut]);

  // 섹션 전환
  const handleSectionChange = useCallback((sectionId) => {
    navigate(`/settings/${sectionId}`, { replace: true });
  }, [navigate]);

  const userName = profileData?.fullName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || '사용자';
  const userEmail = profileData?.email || user?.email || '';
  const userRole = profileData?.role || user?.user_metadata?.role || 'employee';
  const userPermission = profileData?.permission || 'editor';

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-14">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                <span className="text-sm font-medium">뒤로</span>
              </button>
              <h1 className="text-lg font-bold text-gray-900">설정</h1>
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row min-h-[calc(100vh-3.5rem)]">

            {/* === 모바일: 상단 유저 정보 + 가로 탭 === */}
            <div className="sm:hidden border-b border-gray-200 bg-white">
              {/* 컴팩트 유저 정보 */}
              <div className="flex items-center space-x-3 px-4 pt-4 pb-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {getInitials(userName)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 truncate">{userName}</div>
                  <div className="text-xs text-gray-500 truncate">{userEmail}</div>
                </div>
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex-shrink-0">
                  {getRoleDisplayName(userRole, userPermission)}
                </span>
              </div>

              {/* 가로 스크롤 탭 */}
              <div className="flex overflow-x-auto px-2 pb-2 space-x-1 scrollbar-hide">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const showBadge = item.id === 'invite' && pendingCount > 0;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSectionChange(item.id)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                        activeSection === item.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                      {showBadge && (
                        <span className="bg-red-500 text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full">
                          {pendingCount}
                        </span>
                      )}
                    </button>
                  );
                })}
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>로그아웃</span>
                </button>
              </div>
            </div>

            {/* === 데스크톱: 좌측 사이드바 === */}
            <div className="hidden sm:flex sm:flex-col sm:w-56 bg-white border-r border-gray-200 flex-shrink-0">
              {/* 유저 정보 */}
              <div className="p-5 border-b border-gray-200">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-semibold mb-2">
                    {getInitials(userName)}
                  </div>
                  <div className="text-sm font-medium text-gray-900 truncate max-w-full">{userName}</div>
                  <div className="text-xs text-gray-500 truncate max-w-full">{userEmail}</div>
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-1">
                    {getRoleDisplayName(userRole, userPermission)}
                  </span>
                </div>
              </div>

              {/* 네비게이션 */}
              <nav className="flex-1 py-3">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const showBadge = item.id === 'invite' && pendingCount > 0;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSectionChange(item.id)}
                      className={`w-full flex items-center space-x-3 px-5 py-2.5 text-sm transition-colors ${
                        activeSection === item.id
                          ? 'bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-700 border-l-2 border-transparent'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                      {showBadge && (
                        <span className="bg-red-500 text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full ml-auto">
                          {pendingCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* 로그아웃 */}
              <div className="border-t border-gray-200 py-3">
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full flex items-center space-x-3 px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-l-2 border-transparent"
                >
                  <LogOut className="w-4 h-4" />
                  <span>로그아웃</span>
                </button>
              </div>
            </div>

            {/* === 콘텐츠 영역 === */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              {profileLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">프로필 정보 로딩 중...</span>
                </div>
              ) : (
                <>
                  {activeSection === 'profile' && (
                    <SettingsProfile profileData={profileData} user={user} />
                  )}
                  {activeSection === 'company' && (
                    <SettingsCompany profileData={profileData} />
                  )}
                  {activeSection === 'multiplier' && (
                    <SettingsMultiplier />
                  )}
                  {activeSection === 'invite' && (
                    <SettingsInvite onPendingChange={loadPendingCount} />
                  )}
                  {activeSection === 'team' && (
                    <SettingsTeamManagement />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 로그아웃 확인 모달 */}
      <ConfirmModal
        show={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="로그아웃"
        message="정말 로그아웃하시겠습니까?"
        confirmText="로그아웃"
        cancelText="취소"
        type="danger"
      />
    </>
  );
});

export default SettingsPage;
