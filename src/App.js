import React, { useState, useCallback, memo } from 'react';
import { Calendar, Clock, Users, BarChart3, Settings } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import EmployeeManagement from './components/EmployeeManagement';
import Dashboard from './components/Dashboard';
import RecordHistory from './components/RecordHistory';
import SettingsModal from './components/SettingsModal';
import ProfileDropdown from './components/ProfileDropdown';
import LoginButton from './components/LoginButton';

// ========== MAIN APP COMPONENT ==========
const OvertimeManagementApp = memo(() => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    // sessionStorage에서 저장된 탭 확인
    const savedTab = sessionStorage.getItem('activeTabAfterDelete');
    if (savedTab) {
      // 지금 바로 삭제하지 말고 나중에 삭제
      return savedTab;
    }
    return 'dashboard';
  });
  
  // useEffect로 sessionStorage 정리
  React.useEffect(() => {
    const savedTab = sessionStorage.getItem('activeTabAfterDelete');
    if (savedTab) {
      sessionStorage.removeItem('activeTabAfterDelete');
    }
  }, []);
  const [showSettings, setShowSettings] = useState(false);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">초과 근무시간 관리!</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                title="설정"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              {/* 사용자 프로필 또는 로그인 버튼 */}
              {user ? (
                <ProfileDropdown 
                  user={user} 
                  onSignOut={signOut}
                  onProfileEdit={() => console.log('프로필 편집 클릭')}
                />
              ) : (
                <LoginButton onClick={() => console.log('로그인 버튼 클릭')} />
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

      <SettingsModal
        show={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
});

// Root App without Provider (now managed by AuthApp)
const App = () => {
  return <OvertimeManagementApp />;
};

export default App;
