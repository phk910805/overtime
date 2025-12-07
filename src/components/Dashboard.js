import React, { useState, useEffect, useCallback, memo, useRef, useLayoutEffect } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { useOvertimeContext } from '../context';
import { timeUtils, dateUtils, holidayUtils } from '../utils';
import { Toast, Modal } from './CommonUI';
import BulkSettingModal from './BulkSettingModal';
import HorizontalScrollContainer, { ScrollControlBar } from './HorizontalScrollContainer';
import TimeInputValidator from '../utils/timeInputValidator.js';

// 스타일 상수
const STYLES = {
  HEADER_PADDING: '6px 8px 2px 8px',
  LEFT_HEADER_CLASSES: 'text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300 min-w-max whitespace-nowrap',
  CENTER_HEADER_CLASSES: 'text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16',
  DATE_HEADER_CLASSES: 'text-center text-xs font-medium uppercase tracking-wider w-16 bg-gray-200 border-r border-gray-300',
  COLORS: {
    DEFAULT: '#6b7280', // text-gray-500
    WEEKEND_HOLIDAY: '#7c3aed' // text-violet-600
  }
};

// 헬퍼 함수
const getEmployeeBgClass = (isActive) => isActive ? 'bg-white' : 'bg-gray-100';
const getDateTextColor = (isHoliday, isWeekend) => 
  (isHoliday || isWeekend) ? STYLES.COLORS.WEEKEND_HOLIDAY : STYLES.COLORS.DEFAULT;

const TOOLTIP_STORAGE_KEY = 'hideScrollTip';

const HeaderCell = memo(({ children, alignment = "start" }) => (
  <div className={`flex flex-col items-${alignment} justify-center`} style={{ minHeight: '32px', maxHeight: '32px', height: '32px', overflow: 'hidden' }}>
    <div className="flex-shrink-0">
      {children}
    </div>
    <div className="h-2" />
  </div>
));

const DateHeaderCell = memo(({ children, holidayName = '' }) => (
  <div className="flex flex-col items-center justify-center" style={{ minHeight: '32px', maxHeight: '32px', height: '32px', overflow: 'hidden', padding: '2px 0' }}>
    <div className="flex-shrink-0 text-center" style={{ marginBottom: '1px' }}>
      {children}
    </div>
    <div className="text-[8px] text-gray-500 normal-case leading-none whitespace-nowrap overflow-hidden text-ellipsis" style={{ maxWidth: '60px', height: '10px' }}>
      {holidayName}
    </div>
  </div>
));

const TimeDisplay = memo(({ value, onClick, disabled = false, placeholder = "00:00", color = "blue" }) => {
  const colorClass = color === "green" ? "text-green-600" : "text-blue-600";
  const prefix = color === "green" ? "-" : "+";
  const baseClasses = "w-16 h-8 rounded text-xs flex items-center justify-center";
  const dynamicClasses = disabled ? 
    `${baseClasses} text-gray-500 cursor-not-allowed` : 
    `${baseClasses} cursor-pointer hover:bg-gray-100`;
  const displayText = value === 0 ? placeholder : `${prefix}${timeUtils.formatTimeInput(value)}`;
  const textColor = value === 0 ? "text-gray-500" : colorClass;

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

const TimeInputPopup = memo(({ show, value, onClose, onSave, title = "시간 입력", type = "overtime" }) => {
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
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

  const showToast = useCallback((message, type = 'error') => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast({ show: false, message: '', type: 'error' });
  }, []);

  const handleSave = useCallback(() => {
    // 최종 검증
    const validation = TimeInputValidator.validateFinalTime(hours, minutes);
    
    if (!validation.isValid) {
      showToast(validation.message);
      // 문제가 있는 필드에 포커스
      if (validation.focus === 'hours' && hoursRef.current) {
        hoursRef.current.focus();
      } else if (validation.focus === 'minutes' && minutesRef.current) {
        minutesRef.current.focus();
      }
      return;
    }

    onSave(validation.totalMinutes);
    onClose();
  }, [hours, minutes, onSave, onClose, showToast]);

  const handleHoursChange = useCallback((e) => {
    const inputValue = e.target.value;
    const validation = TimeInputValidator.validateInput(inputValue, 'hours');
    
    if (validation.isValid) {
      setHours(validation.filteredValue);
      
      // 자동 보정 메시지 표시
      if (validation.autoCorrect && validation.message) {
        showToast(validation.message, 'success');
      }
      
      // 2자리 완성 시 다음 필드로 이동
      if (TimeInputValidator.shouldMoveToNext(validation.filteredValue, 'hours') && minutesRef.current) {
        setTimeout(() => {
          minutesRef.current.focus();
          minutesRef.current.select();
        }, 0);
      }
    } else {
      setHours(validation.filteredValue);
      if (validation.message) {
        showToast(validation.message, 'warning');
      }
    }
  }, [showToast]);

  const handleMinutesChange = useCallback((e) => {
    const inputValue = e.target.value;
    const validation = TimeInputValidator.validateInput(inputValue, 'minutes');
    
    if (validation.isValid) {
      setMinutes(validation.filteredValue);
    } else {
      setMinutes(validation.filteredValue);
      if (validation.message) {
        showToast(validation.message, 'warning');
      }
    }
  }, [showToast]);

  if (!show) return null;

  return (
    <>
      <Toast 
        message={toast.message} 
        show={toast.show} 
        onClose={hideToast}
        type={toast.type}
        duration={3000}
        position="bottom-center"
      />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="00"
                maxLength={2}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="00"
                maxLength={2}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <button
            onClick={() => { onSave(0); onClose(); }}
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

const Dashboard = memo(({ editable = true, showReadOnlyBadge = false, isHistoryMode = false, customMonth = null } = {}) => {
  const {
    updateDailyTime,
    getAllEmployeesWithRecords,
    getDailyData,
    getMonthlyStats,
    multiplier,
    selectedMonth: contextSelectedMonth,
    setSelectedMonth: contextSetSelectedMonth
  } = useOvertimeContext();

  // Dashboard는 customMonth가 제공되지 않으면 context의 selectedMonth를 사용
  const selectedMonth = customMonth || contextSelectedMonth || new Date().toISOString().slice(0, 7);

  const [showTimeInputPopup, setShowTimeInputPopup] = useState(false);
  const [showBulkSetting, setShowBulkSetting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [holidays, setHolidays] = useState({});
  const [currentTimeInput, setCurrentTimeInput] = useState({
    employeeId: null,
    day: null,
    value: 0,
    type: 'overtime'
  });
  
  // 가로 스크롤 상태 및 ref
  const scrollContainerRef = useRef(null);
  const leftTableRef = useRef(null);
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
    scrollPercent: 0,
    thumbWidth: 20,
  });
  const [leftTableWidth, setLeftTableWidth] = useState(0);
  
  // 툴팁 상태
  const [showScrollTooltip, setShowScrollTooltip] = useState(() => {
    return !localStorage.getItem(TOOLTIP_STORAGE_KEY);
  });
  
  const handleCloseTooltip = useCallback(() => {
    setShowScrollTooltip(false);
    localStorage.setItem(TOOLTIP_STORAGE_KEY, 'true');
  }, []);

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

  // 왼쪽 테이블 너비 측정
  useEffect(() => {
    const updateLeftTableWidth = () => {
      if (leftTableRef.current) {
        setLeftTableWidth(leftTableRef.current.offsetWidth);
      }
    };
    
    // 초기 측정 + 지연 측정 (렌더링 완료 후)
    updateLeftTableWidth();
    const timer = setTimeout(updateLeftTableWidth, 100);
    const timer2 = setTimeout(updateLeftTableWidth, 300);
    
    window.addEventListener('resize', updateLeftTableWidth);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      window.removeEventListener('resize', updateLeftTableWidth);
    };
  }, [selectedMonth]); // selectedMonth 변경 시에도 재측정

  // 직원 데이터 변경 시 너비 재측정
  const employees = getAllEmployeesWithRecords(selectedMonth);
  useEffect(() => {
    if (leftTableRef.current) {
      const timer = setTimeout(() => {
        setLeftTableWidth(leftTableRef.current?.offsetWidth || 0);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [employees.length]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast({ show: false, message: '', type: 'success' });
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

  // 스크롤 핸들러
  const handleScroll = useCallback((direction) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scroll(direction);
    }
  }, []);

  const handleTrackClick = useCallback((e) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.handleTrackClick(e);
    }
  }, []);

  const handleThumbDrag = useCallback((percent) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollToPercent(percent);
    }
  }, []);

  const handleThumbDragEnd = useCallback((finalPercent) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.onThumbDragEnd(finalPercent);
    }
  }, []);

  const daysInMonth = React.useMemo(() => dateUtils.getDaysInMonth(selectedMonth), [selectedMonth]);
  const yearMonth = React.useMemo(() => selectedMonth.split('-'), [selectedMonth]);
  const daysArray = React.useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  // 오늘 날짜 계산
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
  const todayDay = today.getDate();
  const isCurrentMonth = selectedMonth === `${todayYear}-${todayMonth}`;
  const todayColumnIndex = isCurrentMonth ? todayDay : -1; // 이월 컬럼(0) 다음부터 시작하므로 day 그대로 사용

  // 오늘 날짜로 스크롤하는 함수
  const scrollToToday = useCallback((behavior = 'smooth') => {
    if (!isCurrentMonth || !scrollContainerRef.current) return;

    const scrollContainer = scrollContainerRef.current;

    // 각 날짜 셀의 너비는 고정 (w-16 = 4rem = 64px)
    const cellWidth = 64;
    // 이월 컬럼도 w-16이므로 동일한 너비
    const carryoverColumnWidth = 64;
    
    // 오늘 날짜 셀의 왼쪽 위치 = 이월 컬럼 너비 + (오늘 날짜 - 1) * 셀 너비
    const todayPosition = carryoverColumnWidth + (todayDay - 1) * cellWidth;

    // scrollTo 메서드 직접 호출
    scrollContainer.scrollTo(todayPosition, behavior);
  }, [isCurrentMonth, todayDay]);

  // 초기 로드 시 오늘 날짜로 자동 스크롤
  useEffect(() => {
    console.log('🟢 자동 스크롤 useEffect 실행:', { 
      isCurrentMonth, 
      hasRef: !!scrollContainerRef.current,
      selectedMonth 
    });
    
    if (!isCurrentMonth) {
      console.log('⚠️ 현재 월이 아님 - 스크롤 스킵');
      return;
    }
    
    // ref가 설정될 때까지 기다림 (배포 환경 대응)
    const timer = setTimeout(() => {
      console.log('🕒 100ms 후 ref 상태:', !!scrollContainerRef.current);
      if (scrollContainerRef.current) {
        console.log('✅ 오늘 날짜로 스크롤 실행!');
        scrollToToday('auto');
      } else {
        console.error('❌ ref가 여전히 null!');
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isCurrentMonth, selectedMonth, scrollToToday]);

  return (
    <div className="space-y-6">
      <Toast 
        message={toast.message} 
        show={toast.show} 
        onClose={hideToast}
        type={toast.type}
        duration={3000}
      />
      {/* 읽기 전용 배지 */}
      {showReadOnlyBadge && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-yellow-800 font-medium">
              {isHistoryMode ? '과거 기록 - 읽기 전용' : '이전 월 데이터는 수정할 수 없습니다'}
            </span>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {selectedMonth} 월별 현황
        </h2>
        <div className="flex items-center space-x-2">
          {/* 오늘로 가기 버튼 */}
          {isCurrentMonth && (
            <button
              onClick={() => scrollToToday('smooth')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 text-sm"
            >
              <Calendar className="w-4 h-4" />
              <span>오늘</span>
            </button>
          )}
          {editable && (
            <button
              onClick={() => setShowBulkSetting(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>일괄 설정</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex">
          <div ref={leftTableRef} className="flex-shrink-0 border-r-2 border-gray-300">
            <table className="divide-y divide-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className={STYLES.LEFT_HEADER_CLASSES} style={{padding: STYLES.HEADER_PADDING, height: '32px', maxHeight: '32px', minHeight: '32px'}}>
                    <HeaderCell>
                      이름
                    </HeaderCell>
                  </th>
                  <th className={STYLES.LEFT_HEADER_CLASSES} style={{padding: STYLES.HEADER_PADDING, height: '32px', maxHeight: '32px', minHeight: '32px'}}>
                    <HeaderCell>
                      초과시간
                    </HeaderCell>
                  </th>
                  <th className={STYLES.LEFT_HEADER_CLASSES} style={{padding: STYLES.HEADER_PADDING, height: '32px', maxHeight: '32px', minHeight: '32px'}}>
                    <HeaderCell>
                      사용시간
                    </HeaderCell>
                  </th>
                  <th className={STYLES.LEFT_HEADER_CLASSES} style={{padding: STYLES.HEADER_PADDING, height: '32px', maxHeight: '32px', minHeight: '32px'}}>
                    <HeaderCell>
                      잔여시간{multiplier !== 1.0 ? ` (${multiplier}배)` : ''}
                    </HeaderCell>
                  </th>
                  <th className={STYLES.CENTER_HEADER_CLASSES} style={{padding: STYLES.HEADER_PADDING, height: '32px', maxHeight: '32px', minHeight: '32px'}}>
                    <HeaderCell alignment="center">
                      구분
                    </HeaderCell>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-300">
                {employees.map((employee) => {
                  const stats = getMonthlyStats(employee.id, selectedMonth, multiplier);
                  // dataManager에서 계산된 remaining 값 사용 (이미 반올림 적용됨)
                  const adjustedRemaining = stats.remaining;
                  return (
                    <tr key={employee.id} className={employee.isActive ? '' : 'bg-gray-50'}>
                      <td className={`px-4 py-4 text-sm font-medium text-gray-900 border-r border-gray-300 ${getEmployeeBgClass(employee.isActive)}`}>
                        {employee.lastUpdatedName || employee.name}
                        {!employee.isActive && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            삭제
                          </span>
                        )}
                      </td>
                      <td className={`px-3 py-4 text-sm text-blue-600 border-r border-gray-300 ${getEmployeeBgClass(employee.isActive)}`}>
                        +{timeUtils.formatTime(stats.totalOvertime)}
                      </td>
                      <td className={`px-3 py-4 text-sm text-green-600 border-r border-gray-300 ${getEmployeeBgClass(employee.isActive)}`}>
                        -{timeUtils.formatTime(stats.totalVacation)}
                      </td>
                      <td className={`px-3 py-4 text-sm border-r border-gray-300 ${adjustedRemaining >= 0 ? 'text-orange-600' : 'text-red-600'} ${getEmployeeBgClass(employee.isActive)}`}>
                        {adjustedRemaining >= 0 ? '+' : '-'}{timeUtils.formatTime(Math.abs(adjustedRemaining))}
                        {adjustedRemaining < 0 && '(초과)'}
                      </td>
                      <td className={`px-2 py-2 text-center text-xs relative h-20 ${getEmployeeBgClass(employee.isActive)}`}>
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

          <HorizontalScrollContainer 
            ref={scrollContainerRef}
            className="flex-1 overflow-x-auto"
            onScrollStateChange={setScrollState}
          >
            <table className="w-full divide-y divide-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  {/* 이월 열 추가 */}
                  <th className={`${STYLES.CENTER_HEADER_CLASSES} border-r border-gray-300`} style={{padding: STYLES.HEADER_PADDING, height: '32px', maxHeight: '32px', minHeight: '32px'}}>
                    <HeaderCell alignment="center">
                      이월
                    </HeaderCell>
                  </th>
                  {daysArray.map((day) => {
                    const date = new Date(yearMonth[0], yearMonth[1] - 1, day);
                    const dayOfWeekIndex = date.getDay();
                    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][dayOfWeekIndex];
                    const dateString = dateUtils.formatDateString(yearMonth[0], yearMonth[1], day);
                    const isHolidayDate = holidayUtils.isHoliday(dateString, holidays);
                    const isWeekend = dayOfWeekIndex === 0 || dayOfWeekIndex === 6;
                    const textColorValue = getDateTextColor(isHolidayDate, isWeekend);
                    const isTodayColumn = day === todayColumnIndex;
                    
                    return (
                      <th 
                        key={day} 
                        className={STYLES.DATE_HEADER_CLASSES}
                        style={{
                          padding: STYLES.HEADER_PADDING, 
                          color: textColorValue, 
                          height: '32px', 
                          maxHeight: '32px', 
                          minHeight: '32px',
                          ...(isTodayColumn && { backgroundColor: '#D1D5DB' })
                        }}
                      >
                        <DateHeaderCell holidayName={isHolidayDate ? holidayUtils.getHolidayName(dateString, holidays) : ''}>
                          {day.toString().padStart(2, '0')}({dayOfWeek})
                        </DateHeaderCell>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-300">
                {employees.map((employee) => {
                  // TODO: 실제 이월 데이터 가져오기 (현재는 더미 데이터)
                  const carryoverOvertime = 0; // 이월된 초과근무 시간
                  const carryoverVacation = 0; // 이월된 사용 시간
                  
                  return (
                    <tr key={employee.id} className={employee.isActive ? '' : 'bg-gray-50'}>
                      {/* 이월 열 - 첫 번째 셀 */}
                      <td className={`px-2 py-2 text-center text-xs align-top relative h-20 border-r border-gray-300 ${getEmployeeBgClass(employee.isActive)}`}>
                        <div className="absolute left-0 right-0 top-1/2 border-t border-gray-300 transform -translate-y-px"></div>
                        <div className="flex flex-col items-center justify-start h-full">
                          {/* 이월 초과 (상단) */}
                          <div className="flex-1 flex items-center justify-center py-1">
                            <div className="w-16 h-8 rounded text-xs flex items-center justify-center">
                              <span className={carryoverOvertime > 0 ? "text-blue-600" : "text-gray-500"}>
                                {carryoverOvertime > 0 ? `+${timeUtils.formatTime(carryoverOvertime)}` : '00:00'}
                              </span>
                            </div>
                          </div>
                          {/* 이월 사용 (하단) */}
                          <div className="flex-1 flex items-center justify-center py-1">
                            <div className="w-16 h-8 rounded text-xs flex items-center justify-center">
                              <span className={carryoverVacation > 0 ? "text-green-600" : "text-gray-500"}>
                                {carryoverVacation > 0 ? `-${timeUtils.formatTime(carryoverVacation)}` : '00:00'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* 기존 날짜별 데이터 셀들 */}
                      {daysArray.map((day) => {
                        const date = dateUtils.formatDateString(yearMonth[0], yearMonth[1], day);
                        const dailyMinutes = getDailyData(employee.id, date, 'overtime');
                        const vacationMinutes = getDailyData(employee.id, date, 'vacation');
                        const isTodayColumn = day === todayColumnIndex;
                        
                        // 오늘 날짜면 파란 배경, 단 삭제된 직원은 gray-100 유지
                        const bgClass = isTodayColumn && employee.isActive ? 'bg-blue-50' : getEmployeeBgClass(employee.isActive);
                        
                        return (
                          <td key={day} className={`px-2 py-2 text-center text-xs align-top relative h-20 ${bgClass}`}>
                            <div className="absolute left-0 right-0 top-1/2 border-t border-gray-300 transform -translate-y-px"></div>
                            <div className="flex flex-col items-center justify-start h-full">
                              <div className="flex-1 flex items-center justify-center py-1">
                                <TimeDisplay 
                                  value={dailyMinutes}
                                  onClick={() => handleTimeInputClick(employee.id, day, dailyMinutes, 'overtime')}
                                  disabled={!employee.isActive || !editable}
                                  color="blue"
                                />
                              </div>
                              <div className="flex-1 flex items-center justify-center py-1">
                                <TimeDisplay 
                                  value={vacationMinutes}
                                  onClick={() => handleTimeInputClick(employee.id, day, vacationMinutes, 'vacation')}
                                  disabled={!employee.isActive || !editable}
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
              </tbody>
            </table>
          </HorizontalScrollContainer>
        </div>
      </div>

      {/* 가로 스크롤 컨트롤 바 - overflow-hidden 바깥에 배치 */}
      <ScrollControlBar 
        scrollState={scrollState}
        onScroll={handleScroll}
        onTrackClick={handleTrackClick}
        onThumbDrag={handleThumbDrag}
        onThumbDragEnd={handleThumbDragEnd}
        leftWidth={leftTableWidth}
        showTooltip={showScrollTooltip}
        onCloseTooltip={handleCloseTooltip}
      />

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
