import React, { useCallback, useEffect, useMemo, memo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, BarChart3 } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import EmployeeManagement from './components/EmployeeManagement';
import Dashboard from './components/Dashboard';
import RecordHistory from './components/RecordHistory';
import LoginButton from './components/LoginButton';

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
  const { user, canManageEmployees } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // URL → 활성 탭 매핑 (권한 없는 탭 접근 시 dashboard로)
  const activeTab = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/records')) return 'records';
    if (path.startsWith('/employees')) {
      if (!canManageEmployees) return 'dashboard';
      return 'employees';
    }
    return 'dashboard';
  }, [location.pathname, canManageEmployees]);

  // 권한 없는 탭 접근 시 리다이렉트
  useEffect(() => {
    if (location.pathname.startsWith('/employees') && !canManageEmployees) {
      navigate('/dashboard', { replace: true });
    }
  }, [location.pathname, canManageEmployees, navigate]);

  const handleTabChange = useCallback((tab) => {
    const paths = { dashboard: '/dashboard', records: '/records', employees: '/employees' };
    navigate(paths[tab] || '/dashboard');
  }, [navigate]);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '사용자';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">초과 근무시간 관리!</h1>
            </div>
            <div className="flex items-center">
              {/* 사용자 프로필 또는 로그인 버튼 */}
              {user ? (
                <button
                  onClick={() => navigate('/settings')}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="설정"
                >
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
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

      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => handleTabChange('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline-block mr-2" />
              대시보드
            </button>
            <button
              onClick={() => handleTabChange('records')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'records'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="w-4 h-4 inline-block mr-2" />
              히스토리
            </button>
            {canManageEmployees && (
              <button
                onClick={() => handleTabChange('employees')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'employees'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-4 h-4 inline-block mr-2" />
                직원 관리
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard />
        )}

        {activeTab === 'records' && (
          <RecordHistory />
        )}

        {activeTab === 'employees' && (
          <EmployeeManagement />
        )}
      </div>

    </div>
  );
});

// Root App without Provider (now managed by AuthApp)
const App = () => {
  return <OvertimeManagementApp />;
};

export default App;
