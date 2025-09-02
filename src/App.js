import React, { useState, useCallback, memo } from 'react';
import { Calendar, Clock, Users, BarChart3, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { OvertimeProvider, useOvertimeContext } from './context';
import EmployeeManagement from './components/EmployeeManagement';

// ========== MAIN APP COMPONENT ==========
const OvertimeManagementApp = memo(() => {
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
              <h1 className="text-xl font-bold text-gray-900">초과 근무시간 관리</h1>
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
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => changeMonth('next')}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  title="다음 달"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors ml-2"
                  title="설정"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
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
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              대시보드
            </h2>
            <p className="text-gray-600">
              월별 현황표가 곧 추가될 예정입니다.
            </p>
          </div>
        )}
        
        {activeTab === 'records' && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              히스토리
            </h2>
            <p className="text-gray-600">
              기록 히스토리가 곧 추가될 예정입니다.
            </p>
          </div>
        )}
        
        {activeTab === 'employees' && (
          <EmployeeManagement />
        )}
      </div>
    </div>
  );
});

// Root App with Provider
const App = () => {
  return (
    <OvertimeProvider>
      <OvertimeManagementApp />
    </OvertimeProvider>
  );
};

export default App;
