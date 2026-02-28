import React, { useState, useCallback, useEffect, useMemo, memo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Clock, BarChart3, ClipboardCheck, Menu } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import EmployeeManagement from './components/EmployeeManagement';
import Dashboard from './components/Dashboard';
import RecordHistory from './components/RecordHistory';
import MyTimeEntry from './components/MyTimeEntry';
import ApprovalManagement from './components/ApprovalManagement';
import MoreMenu from './components/MoreMenu';
import LoginButton from './components/LoginButton';
import NotificationBell from './components/NotificationBell';
import TrialBanner from './components/TrialBanner';

// 이니셜 생성 유틸
const getInitials = (name) => {
  if (!name) return 'U';
  const names = name.split(' ');
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
};

// ========== MAIN APP COMPONENT ==========
const OvertimeManagementApp = memo(() => {
  const { user, canManageEmployees, canSubmitOwnTime, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // URL → 활성 탭 매핑 (권한 없는 탭 접근 시 dashboard로)
  const activeTab = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/records')) return 'records';
    if (path.startsWith('/approvals')) {
      if (!isAdmin) return 'dashboard';
      return 'approvals';
    }
    if (path.startsWith('/my-time')) {
      if (!canSubmitOwnTime) return 'dashboard';
      return 'my-time';
    }
    if (path.startsWith('/employees')) {
      if (!canManageEmployees) return 'dashboard';
      return 'employees';
    }
    if (path.startsWith('/more')) return 'more';
    return 'dashboard';
  }, [location.pathname, canManageEmployees, canSubmitOwnTime, isAdmin]);

  // activeTab → mainTab 매핑 (바텀/탑 탭 하이라이트용)
  const mainTab = useMemo(() => {
    if (activeTab === 'records' || activeTab === 'my-time') return 'work';
    if (activeTab === 'more' || activeTab === 'employees') return 'more';
    return activeTab; // dashboard, approvals
  }, [activeTab]);

  // 권한 없는 탭 접근 시 리다이렉트
  useEffect(() => {
    if (location.pathname.startsWith('/employees') && !canManageEmployees) {
      navigate('/dashboard', { replace: true });
    }
    if (location.pathname.startsWith('/my-time') && !canSubmitOwnTime) {
      navigate('/dashboard', { replace: true });
    }
    if (location.pathname.startsWith('/approvals') && !isAdmin) {
      navigate('/dashboard', { replace: true });
    }
  }, [location.pathname, canManageEmployees, canSubmitOwnTime, isAdmin, navigate]);

  const handleTabChange = useCallback((tab) => {
    const paths = {
      dashboard: '/dashboard',
      work: '/records',
      approvals: '/approvals',
      more: '/more',
    };
    navigate(paths[tab] || '/dashboard');
  }, [navigate]);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '사용자';

  // 모바일 감지
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 바텀/탑 탭 목록 (권한 기반, mainTab 단위)
  const navTabs = useMemo(() => {
    const tabs = [
      { id: 'dashboard', mainId: 'dashboard', label: '홈', Icon: BarChart3 },
      { id: 'work', mainId: 'work', label: '근무', Icon: Calendar },
    ];
    if (isAdmin) tabs.push({ id: 'approvals', mainId: 'approvals', label: '승인', Icon: ClipboardCheck });
    tabs.push({ id: 'more', mainId: 'more', label: '더보기', Icon: Menu });
    return tabs;
  }, [isAdmin]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 — 모바일: 슬림(h-12), 데스크탑: 기존(h-16) */}
      <header className="bg-white shadow-sm border-b">
        <div className={isMobile ? "px-3" : "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"}>
          <div className={`flex items-center justify-between ${isMobile ? 'h-12' : 'h-16'}`}>
            <div className="flex items-center space-x-2">
              <Clock className={isMobile ? "w-5 h-5 text-blue-600" : "w-6 h-6 sm:w-8 sm:h-8 text-blue-600"} />
              <h1 className={isMobile
                ? "text-sm font-bold text-gray-900 truncate"
                : "text-base sm:text-xl font-bold text-gray-900 truncate"
              }>
                {isMobile ? '초과근무 관리' : '초과 근무시간 관리!'}
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              {user && <NotificationBell />}
              {user ? (
                <button
                  onClick={() => navigate('/more')}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="더보기"
                >
                  <div className={`${isMobile ? 'w-7 h-7 text-xs' : 'w-8 h-8 text-sm'} bg-blue-600 text-white rounded-full flex items-center justify-center font-medium`}>
                    {getInitials(userName)}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-32 truncate">
                    {userName}
                  </span>
                </button>
              ) : (
                <LoginButton onClick={() => navigate('/login')} />
              )}
            </div>
          </div>
        </div>
      </header>

      {user && <TrialBanner />}

      {/* 상단 탭 네비게이션 — 데스크탑 전용 */}
      {!isMobile && (
        <nav className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-4 sm:space-x-8 overflow-x-auto" style={{scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch'}}>
              {navTabs.map(({ id, mainId, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => handleTabChange(id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                    mainTab === mainId
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 inline-block sm:mr-2" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* 컨텐츠 영역 */}
      <div className={isMobile ? "px-3 py-3 pb-20" : "max-w-6xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8"}>
        {activeTab === 'dashboard' && (
          <Dashboard />
        )}

        {(activeTab === 'records' || activeTab === 'my-time') && (
          <>
            {/* 근무 서브탭 — canSubmitOwnTime일 때만 pill 토글 표시 */}
            {canSubmitOwnTime && (
              <div className="flex justify-center mb-4">
                <div className="inline-flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => navigate('/records')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'records'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    기록
                  </button>
                  <button
                    onClick={() => navigate('/my-time')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'my-time'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    내 근무
                  </button>
                </div>
              </div>
            )}
            {activeTab === 'records' && <RecordHistory />}
            {activeTab === 'my-time' && <MyTimeEntry />}
          </>
        )}

        {activeTab === 'approvals' && (
          <ApprovalManagement />
        )}

        {activeTab === 'employees' && (
          <EmployeeManagement />
        )}

        {activeTab === 'more' && (
          <MoreMenu />
        )}
      </div>

      {/* 바텀 탭 바 — 모바일 전용 */}
      {isMobile && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="flex items-center justify-around h-14">
            {navTabs.map(({ id, mainId, label, Icon }) => {
              const isActive = mainTab === mainId;
              return (
                <button
                  key={id}
                  onClick={() => handleTabChange(id)}
                  className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                    isActive ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="mt-0.5" style={{ fontSize: '10px' }}>{label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

    </div>
  );
});

// Root App without Provider (now managed by AuthApp)
const App = () => {
  return <OvertimeManagementApp />;
};

export default App;
