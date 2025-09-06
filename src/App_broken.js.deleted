import React, { useState } from 'react';
import { Clock, Database, Settings } from 'lucide-react';
import { OvertimeProvider, useOvertimeContext } from './context';
import EmployeeManagement from './components/EmployeeManagement';
import Dashboard from './components/Dashboard';
import RecordHistory from './components/RecordHistory';
import SettingsModal from './components/SettingsModal';
import SupabaseConnectionTest from './components/SupabaseConnectionTest';

// ========== 메인 앱 컴포넌트 ==========
const MainApp = () => {
  const { selectedMonth, setSelectedMonth, USE_SUPABASE } = useOvertimeContext();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);

  const changeMonth = (direction) => {
    const currentDate = new Date(selectedMonth + '-01');
    if (direction === 'prev') {
      currentDate.setMonth(currentDate.getMonth() - 1);
    } else if (direction === 'next') {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    setSelectedMonth(currentDate.toISOString().slice(0, 7));
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              {USE_SUPABASE ? (
                <Database className="w-8 h-8 text-green-600" />
              ) : (
                <Clock className="w-8 h-8 text-blue-600" />
              )}
              <h1 className="text-xl font-bold text-gray-900">
                초과 근무시간 관리 {USE_SUPABASE ? '(Supabase)' : '(LocalStorage)'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => changeMonth('prev')}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  ←
                </button>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => changeMonth('next')}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  →
                </button>
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
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
              { key: 'dashboard', label: '대시보드' },
              { key: 'employees', label: '직원 관리' },
              { key: 'history', label: '히스토리' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-1 py-4 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === key
                    ? `border-${USE_SUPABASE ? 'green' : 'blue'}-500 text-${USE_SUPABASE ? 'green' : 'blue'}-600`
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
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
};

// ========== 모드 선택 컴포넌트 ==========
const ModeSelector = ({ onModeChange }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-center mb-8">초과근무시간 관리 시스템</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="text-center mb-4">
              <Clock className="w-12 h-12 mx-auto text-blue-600 mb-2" />
              <h3 className="text-lg font-semibold">LocalStorage 모드</h3>
              <p className="text-sm text-gray-600 mt-2">기존 브라우저 저장소</p>
            </div>
            <button
              onClick={() => onModeChange('localStorage')}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              LocalStorage 시작
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="text-center mb-4">
              <Database className="w-12 h-12 mx-auto text-green-600 mb-2" />
              <h3 className="text-lg font-semibold">Supabase 모드</h3>
              <p className="text-sm text-gray-600 mt-2">클라우드 데이터베이스</p>
            </div>
            <button
              onClick={() => onModeChange('supabase')}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Supabase 시작
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="text-center mb-4">
              <Settings className="w-12 h-12 mx-auto text-purple-600 mb-2" />
              <h3 className="text-lg font-semibold">연결 테스트</h3>
              <p className="text-sm text-gray-600 mt-2">Supabase 상태 확인</p>
            </div>
            <button
              onClick={() => onModeChange('test')}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              연결 테스트
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== 앱 진입점 ==========
function App() {
  const [mode, setMode] = useState(null);

  // 환경 변수로 모드 설정 (개발용)
  const envMode = process.env.REACT_APP_USE_SUPABASE === 'true' ? 'supabase' : null;

  if (mode === 'test') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-4">
          <button
            onClick={() => setMode(null)}
            className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ← 뒤로가기
          </button>
          <SupabaseConnectionTest />
        </div>
      </div>
    );
  }

  if (!mode && !envMode) {
    return <ModeSelector onModeChange={setMode} />;
  }

  // 환경 변수로 Supabase 모드 설정
  if (mode === 'supabase' || envMode === 'supabase') {
    process.env.REACT_APP_USE_SUPABASE = 'true';
  } else {
    process.env.REACT_APP_USE_SUPABASE = 'false';
  }

  return (
    <OvertimeProvider>
      <div className="relative">
        <button
          onClick={() => setMode(null)}
          className="fixed top-4 right-4 z-50 px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
        >
          모드 변경
        </button>
        <MainApp />
      </div>
    </OvertimeProvider>
  );
}

export default App;
