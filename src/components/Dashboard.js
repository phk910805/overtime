import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { Plus } from 'lucide-react';
import { useOvertimeContext } from '../context';
import { timeUtils, dateUtils, holidayUtils } from '../utils';
import BulkSettingModal from './BulkSettingModal';

// ========== COMMON COMPONENTS ==========
const Modal = memo(({ show, onClose, title, size = 'md', children }) => {
  if (!show) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div className={`bg-white rounded-lg p-6 w-full ${sizeClasses[size]}`}>
        {title && (
          <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        )}
        {children}
      </div>
    </div>
  );
});

// Toast 컴포넌트
const Toast = memo(({ message, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-green-500 text-white px-4 py-2 rounded-md shadow-lg">
        {message}
      </div>
    </div>
  );
});

// 시간 표시 컴포넌트
const TimeDisplay = memo(({ value, onClick, disabled = false, placeholder = "00:00", color = "blue" }) => {
  const colorClass = color === "green" ? "text-green-600" : "text-blue-600";
  const prefix = color === "green" ? "-" : "+";

  const baseClasses = "w-16 h-8 rounded text-xs flex items-center justify-center";
  const dynamicClasses = disabled ? 
    `${baseClasses} bg-gray-50 text-gray-400` : 
    `${baseClasses} cursor-pointer hover:bg-gray-100`;

  const displayText = value === 0 ? placeholder : `${prefix}${timeUtils.formatTimeInput(value)}`;
  const textColor = value === 0 ? "text-gray-400" : colorClass;

  if (disabled) {
    return (
      <div className={dynamicClasses}>
        {value > 0 ? `${prefix}${timeUtils.formatTimeInput(value)}` : placeholder}
      </div>
    );
  }

  return (
    <div
      className={dynamicClasses}
      onClick={onClick}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <span className={textColor}>{displayText}</span>
    </div>
  );
});

// ========== TIME INPUT POPUP ==========
const TimeInputPopup = memo(({ show, value, onClose, onSave, title = "시간 입력", type = "overtime" }) => {
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });
  const hoursRef = useRef(null);
  const minutesRef = useRef(null);

  useEffect(() => {
    if (show) {
      const totalHours = Math.floor(value / 60);
      const totalMinutes = value % 60;
      
      setHours(totalHours > 0 ? totalHours.toString().padStart(2, '0') : '');
      setMinutes(totalMinutes > 0 ? totalMinutes.toString().padStart(2, '0') : '');
      
      setTimeout(() => {
        if (hoursRef.current) {
          hoursRef.current.focus();
          hoursRef.current.select();
        }
      }, 100);
    }
  }, [show, value]);

  const showToast = useCallback((message) => {
    setToast({ show: true, message });
  }, []);

  const hideToast = useCallback(() => {
    setToast({ show: false, message: '' });
  }, []);

  const validateAndFormatHours = useCallback((value) => {
    if (!value.trim()) return { valid: true, formatted: '' };
    
    const num = parseInt(value);
    if (isNaN(num)) return { valid: false, formatted: value };
    
    if (num > 24) {
      showToast('시간은 0-24 사이의 값을 입력해주세요');
      return { valid: false, formatted: value };
    }
    
    return { valid: true, formatted: num.toString().padStart(2, '0') };
  }, [showToast]);

  const validateAndFormatMinutes = useCallback((value, currentHours) => {
    if (!value.trim()) return { valid: true, formatted: '' };
    
    const num = parseInt(value);
    if (isNaN(num)) return { valid: false, formatted: value };
    
    if (num >= 60) {
      showToast('분은 0-59 사이의 값을 입력해주세요');
      return { valid: false, formatted: value };
    }
    
    const hoursNum = parseInt(currentHours) || 0;
    if (hoursNum === 24 && num > 0) {
      showToast('24시간을 초과할 수 없습니다');
      return { valid: false, formatted: value };
    }
    
    return { valid: true, formatted: num.toString().padStart(2, '0') };
  }, [showToast]);

  const handleHoursChange = useCallback((e) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    
    if (value.length <= 2) {
      const validation = validateAndFormatHours(value);
      if (validation.valid) {
        setHours(value);
        
        if (value.length === 2 && minutesRef.current) {
          setTimeout(() => minutesRef.current.focus(), 0);
        }
      }
    }
  }, [validateAndFormatHours]);

  const handleMinutesChange = useCallback((e) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    
    if (value.length <= 2) {
      const validation = validateAndFormatMinutes(value, hours);
      if (validation.valid) {
        setMinutes(value);
      }
    }
  }, [validateAndFormatMinutes, hours]);

  const handleHoursBlur = useCallback(() => {
    if (hours) {
      const validation = validateAndFormatHours(hours);
      if (validation.valid && validation.formatted !== hours) {
        setHours(validation.formatted);
      }
    }
  }, [hours, validateAndFormatHours]);

  const handleMinutesBlur = useCallback(() => {
    if (minutes) {
      const validation = validateAndFormatMinutes(minutes, hours);
      if (validation.valid && validation.formatted !== minutes) {
        setMinutes(validation.formatted);
      }
    }
  }, [minutes, hours, validateAndFormatMinutes]);

  const handleSave = useCallback(() => {
    const finalHours = parseInt(hours) || 0;
    const finalMinutes = parseInt(minutes) || 0;
    
    if (finalHours === 24 && finalMinutes > 0) {
      showToast('24시간을 초과할 수 없습니다');
      return;
    }
    
    const totalMinutes = finalHours * 60 + finalMinutes;
    onSave(totalMinutes);
    onClose();
  }, [hours, minutes, onSave, onClose, showToast]);

  const handleDelete = useCallback(() => {
    onSave(0);
    onClose();
  }, [onSave, onClose]);

  const handleKeyDown = useCallback((e, field) => {
    if (e.key === 'Enter') {
      if (field === 'hours' && minutesRef.current) {
        minutesRef.current.focus();
      } else {
        handleSave();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose, handleSave]);

  const getTotalTimeDisplay = useCallback(() => {
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    
    if (h === 0 && m === 0) {
      return type === 'overtime' ? 
        <span className="text-blue-600">+0분 초과</span> : 
        <span className="text-green-600">-0분 사용</span>;
    }
    
    let timeText = '';
    if (h === 0) timeText = `${m}분`;
    else if (m === 0) timeText = `${h}시간`;
    else timeText = `${h}시간 ${m}분`;
    
    return type === 'overtime' ? 
      <span className="text-blue-600">+{timeText} 초과</span> : 
      <span className="text-green-600">-{timeText} 사용</span>;
  }, [hours, minutes, type]);

  if (!show) return null;

  return (
    <>
      <Toast message={toast.message} show={toast.show} onClose={hideToast} />
      <Modal show={show} onClose={onClose} title={title}>
        <div className="mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">시간</label>
              <input
                ref={hoursRef}
                type="text"
                value={hours}
                onChange={handleHoursChange}
                onBlur={handleHoursBlur}
                onKeyDown={(e) => handleKeyDown(e, 'hours')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="00"
                maxLength={2}
                inputMode="numeric"
              />
            </div>
            <div className="text-xl font-bold text-gray-400 mt-6">:</div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">분</label>
              <input
                ref={minutesRef}
                type="text"
                value={minutes}
                onChange={handleMinutesChange}
                onBlur={handleMinutesBlur}
                onKeyDown={(e) => handleKeyDown(e, 'minutes')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="00"
                maxLength={2}
                inputMode="numeric"
              />
            </div>
          </div>
          <div className="mt-3 text-center">
            {getTotalTimeDisplay()}
          </div>
        </div>
        <div className="flex justify-between">
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
          >
            삭제
          </button>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              저장
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
});

// ========== MAIN DASHBOARD COMPONENT ==========
const Dashboard = memo(() => {
  const {
    selectedMonth,
    updateDailyTime,
    getAllEmployeesWithRecords,
    getDailyData,
    getMonthlyStats,
    multiplier
  } = useOvertimeContext();

  const [showTimeInputPopup, setShowTimeInputPopup] = useState(false);
  const [showBulkSetting, setShowBulkSetting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [holidays, setHolidays] = useState({});
  const [currentTimeInput, setCurrentTimeInput] = useState({
    employeeId: null,
    day: null,
    value: 0,
    type: 'overtime'
  });

  // 공휴일 데이터 로드
  useEffect(() => {
    const loadHolidays = async () => {
      const year = selectedMonth.split('-')[0];
      console.log('Loading holidays for year:', year);
      const holidayData = await holidayUtils.fetchHolidays(year);
      console.log('Holiday data loaded:', holidayData);
      setHolidays(holidayData);
    };
    
    loadHolidays();
  }, [selectedMonth]);

  const showToast = useCallback((message) => {
    setToast({ show: true, message });
  }, []);

  const hideToast = useCallback(() => {
    setToast({ show: false, message: '' });
  }, []);

  const handleBulkApplySuccess = useCallback((message) => {
    showToast(message);
  }, [showToast]);

  const handleDailyTimeChange = useCallback((employeeId, day, totalMinutes, type) => {
    const [year, month] = selectedMonth.split('-');
    const date = dateUtils.formatDateString(year, month, day);
    updateDailyTime(type, employeeId, date, totalMinutes);
  }, [selectedMonth, updateDailyTime]);

  const handleTimeInputClick = useCallback((employeeId, day, currentValue, type = 'overtime') => {
    setCurrentTimeInput({ employeeId, day, value: currentValue, type });
    setShowTimeInputPopup(true);
  }, []);

  const handleTimeInputSave = useCallback((newValue) => {
    handleDailyTimeChange(currentTimeInput.employeeId, currentTimeInput.day, newValue, currentTimeInput.type);
    setShowTimeInputPopup(false);
  }, [currentTimeInput, handleDailyTimeChange]);

  const daysInMonth = React.useMemo(() => dateUtils.getDaysInMonth(selectedMonth), [selectedMonth]);
  const yearMonth = React.useMemo(() => selectedMonth.split('-'), [selectedMonth]);
  const daysArray = React.useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  return (
    <div className="space-y-6">
      <Toast message={toast.message} show={toast.show} onClose={hideToast} />
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
        <div className="relative">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="h-12">
                  <th className="sticky left-0 z-20 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 whitespace-nowrap">
                    이름
                  </th>
                  <th className="sticky left-[120px] z-20 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 whitespace-nowrap">
                    초과시간
                  </th>
                  <th className="sticky left-[200px] z-20 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 whitespace-nowrap">
                    사용시간
                  </th>
                  <th className="sticky left-[280px] z-20 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r-2 border-gray-300 whitespace-nowrap">
                    잔여시간{multiplier !== 1.0 ? ` (${multiplier}배)` : ''}
                  </th>
                  <th className="sticky left-[360px] z-20 bg-gray-50 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-16 whitespace-nowrap">
                    구분
                  </th>
                  {daysArray.map((day) => {
                    // 해당 날짜의 요일 계산
                    const date = new Date(yearMonth[0], yearMonth[1] - 1, day);
                    const dayOfWeekIndex = date.getDay();
                    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][dayOfWeekIndex];
                    
                    // 날짜 문자열 생성 (YYYY-MM-DD)
                    const dateString = dateUtils.formatDateString(yearMonth[0], yearMonth[1], day);
                    const isHolidayDate = holidayUtils.isHoliday(dateString, holidays);
                    
                    // 요일별 색상 결정
                    let textColor = 'text-gray-500';
                    if (isHolidayDate || dayOfWeekIndex === 0 || dayOfWeekIndex === 6) { // 공휴일, 일요일, 토요일
                      textColor = 'text-violet-600';
                    }
                    
                    return (
                      <th key={day} className={`px-2 py-3 text-center text-xs font-medium ${textColor} uppercase tracking-wider w-16 bg-gray-50 border-l border-gray-200`}>
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="flex-shrink-0">
                            {day.toString().padStart(2, '0')}({dayOfWeek})
                          </div>
                          {isHolidayDate && (
                            <div className="text-[10px] text-gray-400 normal-case leading-tight mt-0.5">
                              {holidayUtils.getHolidayName(dateString, holidays)}
                            </div>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getAllEmployeesWithRecords.map((employee) => {
                  const stats = getMonthlyStats(employee.id);
                  
                  return (
                    <tr key={employee.id} className={employee.isActive ? '' : 'bg-gray-50'}>
                      <td className={`sticky left-0 z-10 px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200 ${
                        employee.isActive ? 'bg-white' : 'bg-gray-50'
                      }`}>
                        {employee.name}
                        {!employee.isActive && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            삭제
                          </span>
                        )}
                      </td>
                      <td className={`sticky left-[120px] z-10 px-4 py-4 whitespace-nowrap text-sm text-blue-600 border-r border-gray-200 ${
                        employee.isActive ? 'bg-white' : 'bg-gray-50'
                      }`}>
                        +{timeUtils.formatTime(stats.totalOvertime)}
                      </td>
                      <td className={`sticky left-[200px] z-10 px-4 py-4 whitespace-nowrap text-sm text-green-600 border-r border-gray-200 ${
                        employee.isActive ? 'bg-white' : 'bg-gray-50'
                      }`}>
                        -{timeUtils.formatTime(stats.totalVacation)}
                      </td>
                      <td className={`sticky left-[280px] z-10 px-4 py-4 whitespace-nowrap text-sm border-r-2 border-gray-300 ${
                        stats.remaining >= 0 ? 'text-orange-600' : 'text-red-600'
                      } ${employee.isActive ? 'bg-white' : 'bg-gray-50'}`}>
                        {stats.remaining >= 0 ? '+' : '-'}{timeUtils.formatTime(Math.abs(stats.remaining))}
                        {stats.remaining < 0 && '(초과)'}
                      </td>
                      <td className={`sticky left-[360px] z-10 px-2 py-2 text-center text-xs border-r border-gray-200 relative h-20 ${
                        employee.isActive ? 'bg-white' : 'bg-gray-50'
                      }`}>
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
                      {daysArray.map((day) => {
                        const date = dateUtils.formatDateString(yearMonth[0], yearMonth[1], day);
                        const dailyMinutes = getDailyData(employee.id, date, 'overtime');
                        const vacationMinutes = getDailyData(employee.id, date, 'vacation');
                        
                        return (
                          <td key={day} className={`px-2 py-2 text-center text-xs align-top border-l border-gray-200 relative ${
                            employee.isActive ? 'bg-white' : 'bg-gray-50'
                          }`}>
                            <div className="absolute left-0 right-0 top-1/2 border-t border-gray-300 transform -translate-y-px"></div>
                            <div className="flex flex-col items-center justify-start h-full">
                              <div className="flex-1 flex items-center justify-center py-1">
                                <TimeDisplay 
                                  value={dailyMinutes}
                                  onClick={() => handleTimeInputClick(employee.id, day, dailyMinutes, 'overtime')}
                                  disabled={!employee.isActive}
                                  color="blue"
                                />
                              </div>
                              <div className="flex-1 flex items-center justify-center py-1">
                                <TimeDisplay 
                                  value={vacationMinutes}
                                  onClick={() => handleTimeInputClick(employee.id, day, vacationMinutes, 'vacation')}
                                  disabled={!employee.isActive}
                                  placeholder="00:00"
                                  color="green"
                                />
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                {getAllEmployeesWithRecords.length === 0 && (
                  <tr>
                    <td colSpan={5 + daysArray.length} className="px-6 py-8 text-center text-gray-500">
                      등록된 직원이 없습니다. 먼저 직원을 추가해주세요.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <TimeInputPopup
        show={showTimeInputPopup}
        value={currentTimeInput.value}
        onClose={() => setShowTimeInputPopup(false)}
        onSave={handleTimeInputSave}
        title={currentTimeInput.type === 'overtime' ? "초과근무 시간 입력" : "휴가사용 시간 입력"}
        type={currentTimeInput.type}
      />

      <BulkSettingModal
        show={showBulkSetting}
        onClose={() => setShowBulkSetting(false)}
        onApplySuccess={handleBulkApplySuccess}
      />
    </div>
  );
});

export default Dashboard;
