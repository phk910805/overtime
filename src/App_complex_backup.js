import React, { useState, useCallback, memo } from 'react';
import { Calendar, Clock, Users, BarChart3, ChevronLeft, ChevronRight, Settings, Database } from 'lucide-react';
import { OvertimeProvider, useOvertimeContext } from './context';
import { OvertimeProvider as SupabaseOvertimeProvider, useOvertimeContext as useSupabaseOvertimeContext } from './context_supabase';
import EmployeeManagement from './components/EmployeeManagement';
import Dashboard from './components/Dashboard';
import RecordHistory from './components/RecordHistory';
import SettingsModal from './components/SettingsModal';
import SupabaseConnectionTest from './components/SupabaseConnectionTest';

// ========== 모드 선택 컴포넌트 ==========
const ModeSelector = ({ currentMode, onModeChange }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-center mb-8">초과근무시간 관리 시스템</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LocalStorage 모드 */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="text-center mb-4">
              <Clock className="w-12 h-12 mx-auto text-blue-600 mb-2" />
              <h3 className="text-lg font-semibold">LocalStorage 모드</h3>
              <p className="text-sm text-gray-600 mt-2">기존 브라우저 저장소 사용</p>
            </div>
            <button
              onClick={() => onModeChange('localStorage')}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              LocalStorage로 시작
            </button>
            <div className="mt-3 text-xs text-gray-500">
              • 오프라인 사용 가능<br/>
              • 브라우저 내 데이터 저장<br/>
              • 기존 데이터 유지
            </div>
          </div>

          {/* Supabase 모드 */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="text-center mb-4">
              <Database className="w-12 h-12 mx-auto text-green-600 mb-2" />
              <h3 className="text-lg font-semibold">Supabase 모드</h3>
              <p className="text-sm text-gray-600 mt-2">클라우드 데이터베이스 사용</p>
            </div>
            <button
              onClick={() => onModeChange('supabase')}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Supabase로 시작
            </button>
            <div className="mt-3 text-xs text-gray-500">
              • 실시간 동기화<br/>
              • 클라우드 백업<br/>
              • 다중 기기 지원
            </div>
          </div>

          {/* 연결 테스트 */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="text-center mb-4">
              <Settings className="w-12 h-12 mx-auto text-purple-600 mb-2" />
              <h3 className="text-lg font-semibold">연결 테스트</h3>
              <p className="text-sm text-gray-600 mt-2">Supabase 연결 상태 확인</p>
            </div>
            <button
              onClick={() => onModeChange('test')}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            >
              연결 테스트
            </button>
            <div className="mt-3 text-xs text-gray-500">
              • 데이터베이스 연결 확인<br/>
              • API 기능 테스트<br/>
              • 디버깅 정보
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            모드는 언제든지 변경할 수 있습니다. 
            테스트 후 실제 사용할 모드를 선택하세요.
          </p>
        </div>
      </div>
    </div>
  );
};

// ========== MAIN APP COMPONENT (LocalStorage) ==========
const LocalStorageApp = memo(() => {
  const { selectedMonth, setSelectedMonth } = useOvertimeContext();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);

  const changeMonth = useCallback((direction) => {
    const currentDate = new Date(selectedMonth + '-01');
    if (direction === 'prev') {
      currentDate.setMonth(currentDate.getMonth() - 1);
    } else if (direction === 'next') {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    setSelectedMonth(currentDate.toISOString().slice(0, 7));
  }, [selectedMonth, setSelectedMonth]);

  const handleMonthChange = useCallback((e) => {
    setSelectedMonth(e.target.value);
  }, [setSelectedMonth]);

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
              <h1 className="text-xl font-bold text-gray-900">초과 근무시간 관리 (LocalStorage)</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => changeMonth('prev')}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  title="이전 달"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => changeMonth('next')}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  title="다음 달"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                title="설정"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { key: 'dashboard', label: '대시보드', icon: BarChart3 },
              { key: 'employees', label: '직원 관리', icon: Users },
              { key: 'history', label: '히스토리', icon: Calendar }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                className={`flex items-center space-x-2 px-1 py-4 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'employees' && <EmployeeManagement />}
        {activeTab === 'history' && <RecordHistory />}
      </main>

      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
});

// ========== MAIN APP COMPONENT (Supabase) ==========
const SupabaseApp = memo(() => {
  const { selectedMonth, setSelectedMonth, loading, error } = useSupabaseOvertimeContext();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);

  const changeMonth = useCallback((direction) => {
    const currentDate = new Date(selectedMonth + '-01');
    if (direction === 'prev') {
      currentDate.setMonth(currentDate.getMonth() - 1);
    } else if (direction === 'next') {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    setSelectedMonth(currentDate.toISOString().slice(0, 7));
  }, [selectedMonth, setSelectedMonth]);

  const handleMonthChange = useCallback((e) => {
    setSelectedMonth(e.target.value);
  }, [setSelectedMonth]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-bold text-red-600 mb-4">❌ 연결 오류</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Database className="w-8 h-8 text-green-600" />
              <h1 className="text-xl font-bold text-gray-900">
                초과 근무시간 관리 (Supabase)
                {loading && <span className="text-sm text-gray-500 ml-2">로딩 중...</span>}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => changeMonth('prev')}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  title="이전 달"
                  disabled={loading}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  disabled={loading}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                />
                <button
                  onClick={() => changeMonth('next')}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  title="다음 달"
                  disabled={loading}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                title="설정"
                disabled={loading}
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { key: 'dashboard', label: '대시보드', icon: BarChart3 },
              { key: 'employees', label: '직원 관리', icon: Users },
              { key: 'history', label: '히스토리', icon: Calendar }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                disabled={loading}
                className={`flex items-center space-x-2 px-1 py-4 border-b-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                  activeTab === key
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'employees' && <EmployeeManagement />}
        {activeTab === 'history' && <RecordHistory />}
      </main>

      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
});

// ========== 메인 앱 컴포넌트 ==========
function App() {
  const [appMode, setAppMode] = useState(null);

  // 환경 변수로 기본 모드 설정 (개발용)
  const defaultMode = process.env.REACT_APP_USE_SUPABASE === 'true' ? 'supabase' : null;
  
  const currentMode = appMode || defaultMode;

  if (!currentMode) {
    return <ModeSelector currentMode={currentMode} onModeChange={setAppMode} />;
  }

  if (currentMode === 'test') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-4">
          <button
            onClick={() => setAppMode(null)}
            className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ← 모드 선택으로 돌아가기
          </button>
          <SupabaseConnectionTest />
        </div>
      </div>
    );
  }

  if (currentMode === 'supabase') {
    return (
      <SupabaseOvertimeProvider>
        <div className="relative">
          <button
            onClick={() => setAppMode(null)}
            className="fixed top-4 right-4 z-50 px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
          >
            모드 변경
          </button>
          <SupabaseApp />
        </div>
      </SupabaseOvertimeProvider>
    );
  }

  // localStorage 모드 (기본)
  return (
    <OvertimeProvider>
      <div className="relative">
        <button
          onClick={() => setAppMode(null)}
          className="fixed top-4 right-4 z-50 px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
        >
          모드 변경
        </button>
        <LocalStorageApp />
      </div>
    </OvertimeProvider>
  );
}

export default App;
