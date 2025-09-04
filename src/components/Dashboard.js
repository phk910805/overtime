import React, { useState, useEffect, useCallback, memo } from 'react';
import { Plus } from 'lucide-react';
import { useOvertimeContext } from '../context';
import { timeUtils, dateUtils, holidayUtils } from '../utils';
import { Toast, Modal } from './CommonUI';
import BulkSettingModal from './BulkSettingModal';

const Dashboard = memo(() => {
  const {
    selectedMonth,
    updateDailyTime,
    getAllEmployeesWithRecords,
    getDailyData,
    getMonthlyStats,
    multiplier
  } = useOvertimeContext();

  const [showBulkSetting, setShowBulkSetting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [holidays, setHolidays] = useState({});

  useEffect(() => {
    let isCancelled = false;
    const loadHolidays = async () => {
      const year = selectedMonth.split('-')[0];
      const holidayData = await holidayUtils.fetchHolidays(year);
      if (!isCancelled) {
        setHolidays(holidayData);
      }
    };
    loadHolidays();
    return () => {
      isCancelled = true;
    };
  }, [selectedMonth]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast({ show: false, message: '', type: 'success' });
  }, []);

  const handleBulkApplySuccess = useCallback((message) => {
    showToast(message);
  }, [showToast]);

  const daysInMonth = React.useMemo(() => dateUtils.getDaysInMonth(selectedMonth), [selectedMonth]);
  const yearMonth = React.useMemo(() => selectedMonth.split('-'), [selectedMonth]);
  const daysArray = React.useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  return (
    <div className="space-y-6">
      <Toast 
        message={toast.message} 
        show={toast.show} 
        onClose={hideToast}
        type={toast.type}
        duration={3000}
      />
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {selectedMonth} 월별 현황
        </h2>
        <button
          onClick={() => setShowBulkSetting(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>일괄 설정</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex">
          <div className="flex-shrink-0 border-r-2 border-gray-300">
            <table className="divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="h-12">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-20">
                    이름
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-20">
                    초과시간
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-20">
                    사용시간
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-24">
                    잔여시간{multiplier !== 1.0 ? ` (${multiplier}배)` : ''}
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    구분
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getAllEmployeesWithRecords.map((employee) => {
                  const stats = getMonthlyStats(employee.id);
                  return (
                    <tr key={employee.id} className={employee.isActive ? '' : 'bg-gray-50'}>
                      <td className={`px-4 py-4 text-sm font-medium text-gray-900 border-r border-gray-200 ${employee.isActive ? 'bg-white' : 'bg-gray-50'}`}>
                        {employee.name}
                        {!employee.isActive && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            삭제
                          </span>
                        )}
                      </td>
                      <td className={`px-3 py-4 text-sm text-blue-600 border-r border-gray-200 ${employee.isActive ? 'bg-white' : 'bg-gray-50'}`}>
                        +{timeUtils.formatTime(stats.totalOvertime)}
                      </td>
                      <td className={`px-3 py-4 text-sm text-green-600 border-r border-gray-200 ${employee.isActive ? 'bg-white' : 'bg-gray-50'}`}>
                        -{timeUtils.formatTime(stats.totalVacation)}
                      </td>
                      <td className={`px-3 py-4 text-sm border-r border-gray-200 ${stats.remaining >= 0 ? 'text-orange-600' : 'text-red-600'} ${employee.isActive ? 'bg-white' : 'bg-gray-50'}`}>
                        {stats.remaining >= 0 ? '+' : '-'}{timeUtils.formatTime(Math.abs(stats.remaining))}
                        {stats.remaining < 0 && '(초과)'}
                      </td>
                      <td className={`px-2 py-2 text-center text-xs relative h-20 ${employee.isActive ? 'bg-white' : 'bg-gray-50'}`}>
                        <div className="absolute left-0 right-0 top-1/2 border-t border-gray-300 transform -translate-y-px"></div>
                        <div className="flex flex-col h-full">
                          <div className="h-10 flex items-center justify-center">
                            <span className="text-blue-600 font-medium">초과</span>
                          </div>
                          <div className="h-10 flex items-center justify-center">
                            <span className="text-green-600 font-medium">사용</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex-1 overflow-x-auto">
            <div className="p-8 text-center text-gray-500">
              날짜 테이블 구현 중...
            </div>
          </div>
        </div>
      </div>

      <BulkSettingModal
        show={showBulkSetting}
        onClose={() => setShowBulkSetting(false)}
        onApplySuccess={handleBulkApplySuccess}
      />
    </div>
  );
});

export default Dashboard;
