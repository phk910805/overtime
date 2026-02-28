import React, { useState, useEffect, useCallback, memo, useRef, useLayoutEffect } from 'react';
import { Plus, Calendar, Search, Download, Users, ChevronRight, ChevronLeft } from 'lucide-react';
import { useOvertimeContext } from '../context';
import { useAuth } from '../hooks/useAuth';
import { timeUtils, dateUtils, holidayUtils } from '../utils';
import { Toast, Modal } from './CommonUI';
import BulkSettingModal from './BulkSettingModal';
import CarryoverChangeModal from './CarryoverChangeModal';
import MonthChangeNotification from './MonthChangeNotification';
import HorizontalScrollContainer, { ScrollControlBar } from './HorizontalScrollContainer';
import TimeInputValidator from '../utils/timeInputValidator.js';
import MonthSelector from './MonthSelector';
import UpgradeModal from './UpgradeModal';
import { useSubscription } from '../hooks/useSubscription';

// 스타일 상수
const STYLES = {
  HEADER_PADDING: '6px 8px 2px 8px',
  LEFT_HEADER_CLASSES: 'text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300 whitespace-nowrap',
  CENTER_HEADER_CLASSES: 'text-center text-xs font-medium text-gray-500 uppercase tracking-wider',
  DATE_HEADER_CLASSES: 'text-center text-xs font-medium uppercase tracking-wider w-[72px] bg-gray-200 border-r border-gray-300',
  COLORS: {
    DEFAULT: '#6b7280', // text-gray-500
    WEEKEND_HOLIDAY: '#7c3aed' // text-violet-600
  }
};

// 타이밍 상수 (성능 최적화)
const TIMING = {
  DATA_LOAD_DELAY: 100,           // 데이터 로드 딜레이
  SCROLL_TO_TODAY_DELAY: 100,     // 오늘 날짜 스크롤 딜레이
  MONTH_CHANGE_SCROLL_DELAY: 100, // 월 변경 시 스크롤 딜레이
  INPUT_FOCUS_DELAY: 100,         // 입력 필드 포커스 딜레이
};

// 헬퍼 함수
const getEmployeeBgClass = (isActive) => isActive ? 'bg-white' : 'bg-gray-100';
const getDateTextColor = (isHoliday, isWeekend) => 
  (isHoliday || isWeekend) ? STYLES.COLORS.WEEKEND_HOLIDAY : STYLES.COLORS.DEFAULT;

const TOOLTIP_STORAGE_KEY = 'hideScrollTip';

const HeaderCell = memo(({ children, alignment = "start" }) => (
  <div className={`flex flex-col items-${alignment} justify-start`} style={{ minHeight: '32px', paddingTop: '4px', paddingBottom: '4px' }}>
    <div className="flex-shrink-0">
      {children}
    </div>
  </div>
));

const HeaderCellWithTooltip = memo(({ children, tooltipText, alignment = "start" }) => {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [tooltipPos, setTooltipPos] = React.useState({ x: 0, y: 0 });
  const iconRef = React.useRef(null);

  const handleMouseEnter = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setTooltipPos({
        x: Math.max(60, Math.min(rect.left + rect.width / 2, window.innerWidth - 60)),
        y: rect.top
      });
      setShowTooltip(true);
    }
  };

  return (
    <div className={`flex flex-col items-${alignment} justify-start`} style={{ minHeight: '32px', paddingTop: '4px', paddingBottom: '4px' }}>
      <div className="flex-shrink-0">
        <div className="flex items-center">
          <span>{children}</span>
          <span
            ref={iconRef}
            className="cursor-help text-gray-400 hover:text-gray-600"
            style={{ fontSize: '14px' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setShowTooltip(false)}
          >
            ⓘ
          </span>
        </div>
        {showTooltip && (
          <span
            style={{
              position: 'fixed',
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y - 8}px`,
              transform: 'translate(-50%, -100%)',
              backgroundColor: '#1f2937',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '11px',
              whiteSpace: 'nowrap',
              zIndex: 10000,
              pointerEvents: 'none'
            }}
          >
            {tooltipText}
          </span>
        )}
      </div>
    </div>
  );
});

const DateHeaderCell = memo(({ children, holidayName = '', birthdayEmployees = [] }) => {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [tooltipPos, setTooltipPos] = React.useState({ x: 0, y: 0 });
  const iconRef = React.useRef(null);
  const hasBirthday = birthdayEmployees.length > 0;
  const birthdayTooltip = hasBirthday
    ? birthdayEmployees.map(emp => `${emp}님`).join(', ') + ' 생일'
    : '';

  const handleMouseEnter = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setTooltipPos({
        x: Math.max(60, Math.min(rect.left + rect.width / 2, window.innerWidth - 60)),
        y: rect.top
      });
      setShowTooltip(true);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateRows: 'auto auto', paddingTop: '4px', paddingBottom: '4px' }}>
      {/* 날짜/요일 - 고정 */}
      <div className="flex items-center justify-center gap-0.5">
        {children}
        {hasBirthday && (
          <span 
            ref={iconRef}
            className="text-xs"
            style={{ cursor: 'default' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setShowTooltip(false)}
          >
            🎂
          </span>
        )}
      </div>
      {/* 기념일 - 있을 때만 렌더링 */}
      {holidayName && (
        <div 
          className="text-[8px] text-gray-500 normal-case leading-tight overflow-hidden text-ellipsis" 
          style={{ 
            maxWidth: hasBirthday ? '70px' : '60px',
            margin: '0 auto',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            wordBreak: 'keep-all'
          }}
        >
          {holidayName}
        </div>
      )}
      {showTooltip && hasBirthday && (
        <span 
          style={{
            position: 'fixed',
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y - 8}px`,
            transform: 'translate(-50%, -100%)',
            backgroundColor: '#1f2937',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            zIndex: 10000,
            pointerEvents: 'none'
          }}
        >
          {birthdayTooltip}
        </span>
      )}
    </div>
  );
});

const TimeDisplay = memo(({ value, onClick, disabled = false, placeholder = "00:00", color = "blue" }) => {
  const colorClass = color === "green" ? "text-green-600" : "text-blue-600";
  const prefix = color === "green" ? "-" : "+";
  const baseClasses = "w-[72px] h-8 rounded text-xs flex items-center justify-center";
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
      }, TIMING.INPUT_FOCUS_DELAY);
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
        position="top-center"
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

const MobileEmployeeRow = memo(({ employee, adjustedRemaining, onClick }) => {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 cursor-pointer active:bg-gray-50"
      onClick={onClick}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 text-sm truncate">
            {employee.lastUpdatedName || employee.name}
          </span>
          {!employee.isActive && (
            <span className="flex-shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              삭제
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500">{employee.department || '(부서 없음)'}</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`text-sm font-medium ${adjustedRemaining >= 0 ? 'text-orange-600' : 'text-red-600'}`}>
          {adjustedRemaining >= 0 ? '+' : '-'}{timeUtils.formatTime(Math.abs(adjustedRemaining))}
        </span>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
});

const MobileEmployeeDetail = memo(({
  employee, selectedMonth, multiplier,
  getMonthlyStats, getCarryoverForEmployee, getDailyData,
  daysArray, yearMonth, holidays, todayColumnIndex,
  isEditable, onTimeInputClick, onBack
}) => {
  const stats = getMonthlyStats(employee.id, selectedMonth, multiplier);
  const carryoverMinutes = getCarryoverForEmployee(employee.id, selectedMonth);
  const adjustedRemaining = carryoverMinutes + stats.remaining;

  return (
    <div className="bg-white rounded-lg shadow">
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-blue-600 text-sm active:text-blue-800 -ml-1"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>뒤로</span>
        </button>
        <div className="text-sm font-medium text-gray-900 truncate">
          {employee.lastUpdatedName || employee.name}
          <span className="font-normal text-gray-500"> · {employee.department || '(부서 없음)'}</span>
        </div>
      </div>

      {/* 요약 바 */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex gap-4 mb-1.5">
          <div className="text-xs">
            <span className="text-gray-500">초과 </span>
            <span className="text-blue-600 font-medium">+{timeUtils.formatTime(stats.totalOvertime)}</span>
          </div>
          <div className="text-xs">
            <span className="text-gray-500">사용 </span>
            <span className="text-green-600 font-medium">-{timeUtils.formatTime(stats.totalVacation)}</span>
          </div>
        </div>
        <div className="text-sm">
          <span className="text-gray-500">잔여 </span>
          <span className={`font-semibold ${adjustedRemaining >= 0 ? 'text-orange-600' : 'text-red-600'}`}>
            {adjustedRemaining >= 0 ? '+' : '-'}{timeUtils.formatTime(Math.abs(adjustedRemaining))}
          </span>
        </div>
      </div>

      {/* 일별 리스트 */}
      <div>
        {daysArray.map((day) => {
          const dateString = dateUtils.formatDateString(yearMonth[0], yearMonth[1], day);
          const dayDate = new Date(yearMonth[0], yearMonth[1] - 1, day);
          const dayOfWeekIndex = dayDate.getDay();
          const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][dayOfWeekIndex];
          const isHolidayDate = holidayUtils.isHoliday(dateString, holidays);
          const isWeekend = dayOfWeekIndex === 0 || dayOfWeekIndex === 6;
          const holidayName = isHolidayDate ? holidayUtils.getHolidayName(dateString, holidays) : '';
          const isTodayRow = day === todayColumnIndex;
          const dailyMinutes = getDailyData(employee.id, dateString, 'overtime');
          const vacationMinutes = getDailyData(employee.id, dateString, 'vacation');
          const canEdit = isEditable && employee.isActive;
          const dateColorClass = (isHolidayDate || isWeekend) ? 'text-violet-600' : 'text-gray-700';

          return (
            <div
              key={day}
              className={`flex items-center justify-between px-4 py-2 text-xs border-b border-gray-100 last:border-b-0${isTodayRow ? ' bg-blue-50' : ''}`}
            >
              <div className={`flex-shrink-0 ${dateColorClass}`} style={{width: '80px'}}>
                <span className="font-medium">{String(day).padStart(2, '0')}({dayOfWeek})</span>
                {isTodayRow && <span className="ml-0.5 text-blue-500">★</span>}
                {holidayName && <div className="text-[10px] text-gray-400 truncate">{holidayName}</div>}
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`${canEdit ? 'cursor-pointer active:bg-gray-100 rounded px-1.5 py-0.5' : ''} ${dailyMinutes > 0 ? 'text-blue-600 font-medium' : 'text-gray-400'}`}
                  onClick={canEdit ? () => onTimeInputClick(employee.id, day, dailyMinutes, 'overtime') : undefined}
                >
                  초과 {dailyMinutes > 0 ? timeUtils.formatTimeInput(dailyMinutes) : '00:00'}
                </span>
                <span
                  className={`${canEdit ? 'cursor-pointer active:bg-gray-100 rounded px-1.5 py-0.5' : ''} ${vacationMinutes > 0 ? 'text-green-600 font-medium' : 'text-gray-400'}`}
                  onClick={canEdit ? () => onTimeInputClick(employee.id, day, vacationMinutes, 'vacation') : undefined}
                >
                  사용 {vacationMinutes > 0 ? timeUtils.formatTimeInput(vacationMinutes) : '00:00'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

const MobileView = memo(({
  employees, selectedMonth, multiplier,
  getMonthlyStats, getCarryoverForEmployee, getDailyData,
  daysArray, yearMonth, holidays, todayColumnIndex,
  isEditable, onTimeInputClick
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  const selectedEmployee = selectedEmployeeId ? employees.find(e => e.id === selectedEmployeeId) : null;

  // 선택된 직원이 목록에서 사라지면 리스트로 복귀
  useEffect(() => {
    if (selectedEmployeeId && !selectedEmployee) {
      setSelectedEmployeeId(null);
    }
  }, [selectedEmployeeId, selectedEmployee]);

  if (selectedEmployee) {
    return (
      <MobileEmployeeDetail
        employee={selectedEmployee}
        selectedMonth={selectedMonth}
        multiplier={multiplier}
        getMonthlyStats={getMonthlyStats}
        getCarryoverForEmployee={getCarryoverForEmployee}
        getDailyData={getDailyData}
        daysArray={daysArray}
        yearMonth={yearMonth}
        holidays={holidays}
        todayColumnIndex={todayColumnIndex}
        isEditable={isEditable}
        onTimeInputClick={onTimeInputClick}
        onBack={() => setSelectedEmployeeId(null)}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow divide-y divide-gray-100">
      {employees.map((employee) => {
        const stats = getMonthlyStats(employee.id, selectedMonth, multiplier);
        const carryoverMinutes = getCarryoverForEmployee(employee.id, selectedMonth);
        const adjustedRemaining = carryoverMinutes + stats.remaining;

        return (
          <MobileEmployeeRow
            key={employee.id}
            employee={employee}
            adjustedRemaining={adjustedRemaining}
            onClick={() => setSelectedEmployeeId(employee.id)}
          />
        );
      })}
    </div>
  );
});

const Dashboard = memo(({ editable = true, showReadOnlyBadge = false, isHistoryMode = false, customMonth = null } = {}) => {
  const {
    updateDailyTime,
    getAllEmployeesWithRecords,
    getDailyData,
    getMonthlyStats,
    getCarryoverForEmployee,
    checkAndRecalculateCarryover,
    multiplier,
    selectedMonth: contextSelectedMonth
  } = useOvertimeContext();

  const { canEditOvertime, canEditSettings: canBulkEdit, canManageEmployees } = useAuth();
  const { canViewMonth } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');

  // Dashboard 내부에서 월 선택 state 관리 (customMonth가 없을 때만)
  const [internalMonth, setInternalMonth] = useState(() => {
    if (customMonth) return customMonth;
    if (contextSelectedMonth) return contextSelectedMonth;
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // customMonth가 제공되면 사용, 아니면 내부 state 사용
  const selectedMonth = customMonth || internalMonth;

  // 월 변경 핸들러 (구독 체크 포함)
  const handleMonthChange = useCallback((newMonth) => {
    if (!customMonth) {
      const check = canViewMonth(newMonth);
      if (!check.allowed) {
        setUpgradeMessage(check.reason);
        setShowUpgradeModal(true);
        return;
      }
      setInternalMonth(newMonth);
    }
  }, [customMonth, canViewMonth]);

  // 편집 권한 계산
  const editPermission = React.useMemo(() => {
    if (customMonth) {
      return { editable: false, type: 'custom', message: null };
    }
    return dateUtils.getEditPermission(selectedMonth);
  }, [customMonth, selectedMonth]);
  
  const isEditable = editable && editPermission.editable && canEditOvertime && canManageEmployees;
  // 직전 달(편집 가능) 또는 편집 불가능한 달에 메시지 표시
  const shouldShowEditNotice = !customMonth && editPermission.message;

  // 오늘 날짜 및 현재 월 (기타 로직에서 사용)
  const today = new Date();
  const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  // customMonth가 변경될 때 internalMonth 업데이트
  useEffect(() => {
    if (customMonth) {
      setInternalMonth(customMonth);
    }
  }, [customMonth]);

  const [showTimeInputPopup, setShowTimeInputPopup] = useState(false);
  const [showBulkSetting, setShowBulkSetting] = useState(false);
  const [showCarryoverChangeModal, setShowCarryoverChangeModal] = useState(false);
  const [carryoverChangeData, setCarryoverChangeData] = useState(null);
  const [showMonthChangeNotification, setShowMonthChangeNotification] = useState(false);
  const [monthChangeData, setMonthChangeData] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [holidays, setHolidays] = useState({});
  
  // 직원 검색
  const [searchTerm, setSearchTerm] = useState('');

  // 간단한 로딩 상태 (고정 딜레이)
  const [isReady, setIsReady] = useState(false);
  const [currentTimeInput, setCurrentTimeInput] = useState({
    employeeId: null,
    day: null,
    value: 0,
    type: 'overtime'
  });
  
  // 모바일 감지 (640px 이하)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 가로 스크롤 상태 및 ref
  const scrollContainerRef = useRef(null);
  const leftTableRef = useRef(null);
  const leftHeaderRowRef = useRef(null);
  const rightHeaderRowRef = useRef(null);
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
    
    // 월 변경 시 로딩 상태로 리셋
    setIsReady(false);
    
    const loadHolidays = async () => {
      try {
        const year = selectedMonth.split('-')[0];
        const holidayData = await holidayUtils.fetchHolidays(year);
        if (!isCancelled) {
          setHolidays(holidayData || {});
          
          // holidays 로드 후 헤더 동기화 시간 확보 (100ms)
          setTimeout(() => {
            if (!isCancelled) {
              setIsReady(true);
            }
          }, TIMING.DATA_LOAD_DELAY);
        }
      } catch (error) {
        console.warn('Holiday fetch failed:', error);
        if (!isCancelled) {
          setHolidays({});
          // 실패해도 100ms 후 표시
          setTimeout(() => {
            if (!isCancelled) {
              setIsReady(true);
            }
          }, TIMING.DATA_LOAD_DELAY);
        }
      }
    };
    loadHolidays();
    
    return () => {
      isCancelled = true;
    };
  }, [selectedMonth]);

  // 왼쪽 테이블 너비 측정 (초기 로드와 리사이즈만)
  useEffect(() => {
    const updateLeftTableWidth = () => {
      if (leftTableRef.current) {
        setLeftTableWidth(leftTableRef.current.offsetWidth);
      }
    };
    
    // 즉시 측정 (지연 타이머 제거)
    updateLeftTableWidth();
    
    window.addEventListener('resize', updateLeftTableWidth);
    
    return () => {
      window.removeEventListener('resize', updateLeftTableWidth);
    };
  }, []); // 초기 로드 시에만 실행

  // 직원 데이터 캠싱 (불필요한 재계산 방지)
  const allEmployees = React.useMemo(() =>
    getAllEmployeesWithRecords(selectedMonth),
    [getAllEmployeesWithRecords, selectedMonth]
  );

  // 검색 필터 적용
  const employees = React.useMemo(() => {
    if (!searchTerm.trim()) return allEmployees;
    const term = searchTerm.trim().toLowerCase();
    return allEmployees.filter(emp =>
      (emp.lastUpdatedName || emp.name || '').toLowerCase().includes(term) ||
      (emp.department || '').toLowerCase().includes(term)
    );
  }, [allEmployees, searchTerm]);
  
  useEffect(() => {
    if (leftTableRef.current) {
      // 지연 없이 즉시 재측정
      setLeftTableWidth(leftTableRef.current.offsetWidth);
    }
  }, [employees.length, isMobile]);

  // 월 변경 감지 및 알림
  useEffect(() => {
    // customMonth이거나 현재 월이 아니면 알림 표시 안 함
    if (customMonth || selectedMonth !== currentYearMonth) {
      return;
    }

    const LAST_VISIT_MONTH_KEY = 'lastVisitMonth';
    const lastVisitMonth = localStorage.getItem(LAST_VISIT_MONTH_KEY);

    // 처음 방문이거나 다른 달에서 돌아온 경우
    if (lastVisitMonth && lastVisitMonth !== selectedMonth) {
      // 이월 데이터 준비
      const carryoverList = allEmployees
        .map(emp => ({
          employeeName: emp.lastUpdatedName || emp.name,
          carryoverMinutes: getCarryoverForEmployee(emp.id, selectedMonth)
        }))
        .filter(item => item.carryoverMinutes !== 0)
        .sort((a, b) => Math.abs(b.carryoverMinutes) - Math.abs(a.carryoverMinutes)); // 절댓값 큰 순

      // 지난 달 정보
      const [currentYear, currentMonthNum] = selectedMonth.split('-');
      const lastMonthNum = currentMonthNum === '01' ? '12' : String(parseInt(currentMonthNum) - 1).padStart(2, '0');
      const lastMonthYear = currentMonthNum === '01' ? String(parseInt(currentYear) - 1) : currentYear;

      // 편집 기한 (익월 말일)
      const nextMonthLastDay = new Date(parseInt(currentYear), parseInt(currentMonthNum), 0).getDate();
      const editDeadline = `${currentYear}.${currentMonthNum}.${String(nextMonthLastDay).padStart(2, '0')}`;

      setMonthChangeData({
        currentMonth: currentMonthNum,
        lastMonth: lastMonthNum,
        lastMonthYearMonth: `${lastMonthYear}-${lastMonthNum}`,
        carryoverList,
        editDeadline
      });
      setShowMonthChangeNotification(true);
    }

    // 현재 월로 업데이트
    localStorage.setItem(LAST_VISIT_MONTH_KEY, selectedMonth);
  }, [selectedMonth, currentYearMonth, customMonth, allEmployees, getCarryoverForEmployee]);

  // 헤더 높이 동기화 (setTimeout 방식 - 안정적)
  useLayoutEffect(() => {
    // holidays가 아직 로드되지 않았으면 건너뛰기
    const hasHolidays = holidays && Object.keys(holidays).length > 0;
    
    if (!hasHolidays) {
      return;
    }
    
    // 50ms 딜레이 후 높이 동기화
    const timerId = setTimeout(() => {
      if (rightHeaderRowRef.current && leftHeaderRowRef.current) {
        // 이전 높이를 리셋하여 자연 높이 측정
        leftHeaderRowRef.current.style.height = '';
        rightHeaderRowRef.current.style.height = '';

        const rightHeight = rightHeaderRowRef.current.offsetHeight;
        const leftHeight = leftHeaderRowRef.current.offsetHeight;
        const maxHeight = Math.max(leftHeight, rightHeight);

        leftHeaderRowRef.current.style.height = `${maxHeight}px`;
        rightHeaderRowRef.current.style.height = `${maxHeight}px`;
      }
    }, 50);

    return () => clearTimeout(timerId);
  }, [selectedMonth, holidays, allEmployees.length, isMobile]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast({ show: false, message: '', type: 'success' });
  }, []);

  const handleBulkApplySuccess = useCallback((message) => {
    showToast(message);
  }, [showToast]);

  // CSV 내보내기
  const handleExportCSV = useCallback(() => {
    if (allEmployees.length === 0) return;
    const headers = ['이름', '부서', '이월', `초과시간(×${multiplier})`, '사용시간', '잔여시간'];
    const rows = allEmployees.map(emp => {
      const stats = getMonthlyStats(emp.id, selectedMonth, multiplier);
      const carryover = getCarryoverForEmployee(emp.id, selectedMonth);
      const remaining = carryover + stats.remaining;
      return [
        emp.lastUpdatedName || emp.name,
        emp.department || '-',
        timeUtils.formatTime(Math.abs(carryover)),
        timeUtils.formatTime(stats.totalOvertime),
        timeUtils.formatTime(stats.totalVacation),
        timeUtils.formatTime(Math.abs(remaining))
      ].map(v => `"${v}"`).join(',');
    });
    const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `초과근무_${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [allEmployees, selectedMonth, multiplier, getMonthlyStats, getCarryoverForEmployee]);

  const handleCloseMonthChangeNotification = useCallback(() => {
    setShowMonthChangeNotification(false);
  }, []);

  const handleGoToLastMonth = useCallback(() => {
    setShowMonthChangeNotification(false);
    if (monthChangeData?.lastMonthYearMonth) {
      handleMonthChange(monthChangeData.lastMonthYearMonth);
    }
  }, [monthChangeData, handleMonthChange]);

  const handleDailyTimeChange = useCallback((employeeId, day, totalMinutes, type) => {
    const [year, month] = selectedMonth.split('-');
    const date = dateUtils.formatDateString(year, month, day);
    updateDailyTime(type, employeeId, date, totalMinutes);
  }, [selectedMonth, updateDailyTime]);

  const handleTimeInputClick = useCallback((employeeId, day, currentValue, type = 'overtime') => {
    setCurrentTimeInput({ employeeId, day, value: currentValue, type });
    setShowTimeInputPopup(true);
  }, []);

  const handleTimeInputSave = useCallback(async (newValue) => {
    const { employeeId, day, type } = currentTimeInput;
    
    // 데이터 저장
    await handleDailyTimeChange(employeeId, day, newValue, type);
    setShowTimeInputPopup(false);
    
    // 편집 권한 확인
    const permission = dateUtils.getEditPermission(selectedMonth);
    
    // 직전 달 편집이면 이월 재계산 체크
    if (permission.type === 'lastMonth' && permission.editable) {
      const impact = await checkAndRecalculateCarryover(employeeId, selectedMonth);
      
      if (impact.hasImpact) {
        setCarryoverChangeData(impact);
        setShowCarryoverChangeModal(true);
      }
    }
  }, [currentTimeInput, handleDailyTimeChange, selectedMonth, checkAndRecalculateCarryover]);

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

  // 오늘 날짜 계산 (위에서 선언한 today 변수 사용)
  const todayYear = today.getFullYear();
  const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
  const todayDay = today.getDate();
  const isCurrentMonth = selectedMonth === `${todayYear}-${todayMonth}`;
  const todayColumnIndex = isCurrentMonth ? todayDay : -1; // 이월 컬럼(0) 다음부터 시작하므로 day 그대로 사용

  // 오늘 날짜로 이동하는 함수 (현재 달로 이동 + 스크롤)
  const goToToday = useCallback(() => {
    // 현재 달이 아니면 먼저 현재 달로 이동
    if (selectedMonth !== currentYearMonth) {
      handleMonthChange(currentYearMonth);
    }
    
    // 스크롤은 다음 렌더링 후에 실행
    setTimeout(() => {
      if (scrollContainerRef.current) {
        const cellWidth = 72;
        const todayPosition = (todayDay - 1) * cellWidth;
        scrollContainerRef.current.scrollTo(todayPosition, 'smooth');
      }
    }, TIMING.SCROLL_TO_TODAY_DELAY);
  }, [selectedMonth, currentYearMonth, handleMonthChange, todayDay]);

  // 초기 로드 시 이번 달이면 오늘 날짜로 자동 스크롤
  useEffect(() => {
    if (!isCurrentMonth) return;
    
    if (scrollContainerRef.current) {
      const cellWidth = 72;
      const todayPosition = (todayDay - 1) * cellWidth;
      scrollContainerRef.current.scrollTo(todayPosition, 'auto');
    }
  }, [isCurrentMonth, selectedMonth, todayDay]);

  // 월 변경 시 스크롤 위치 초기화 (이번 달 제외)
  useEffect(() => {
    if (selectedMonth !== currentYearMonth && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo(0, 'auto');
    }
  }, [selectedMonth, currentYearMonth]);

  return (
    <div className="space-y-6">
      <Toast 
        message={toast.message} 
        show={toast.show} 
        onClose={hideToast}
        type={toast.type}
        duration={3000}
      />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* 월 선택 네비게이션 */}
        {!customMonth && (
          <MonthSelector
            selectedMonth={selectedMonth}
            onMonthChange={handleMonthChange}
            minMonth="2025-01"  // 시스템 시작 월
            maxMonth={currentYearMonth}  // 현재 월까지만 선택 가능
          />
        )}
        {customMonth && (
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedMonth} 월별 현황
          </h2>
        )}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* 오늘로 가기 버튼 - 항상 표시 */}
          {!customMonth && (
            <button
              onClick={goToToday}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 text-sm whitespace-nowrap"
            >
              <Calendar className="w-4 h-4" />
              <span>오늘</span>
            </button>
          )}
          {/* CSV 내보내기 */}
          {!customMonth && allEmployees.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center space-x-2 text-sm whitespace-nowrap"
              title="CSV 내보내기"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">CSV</span>
            </button>
          )}
          {/* 일괄 설정 버튼 - admin/owner만 표시 */}
          {!customMonth && canBulkEdit && (
            <button
              onClick={() => setShowBulkSetting(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2 text-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>일괄 설정</span>
            </button>
          )}
        </div>
      </div>

      {/* 편집 권한 안내 배지 - MonthSelector 아래로 이동 */}
      {shouldShowEditNotice && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-yellow-800 font-medium">
              {editPermission.message}
            </span>
          </div>
        </div>
      )}

      {/* 직원 검색 */}
      {!customMonth && allEmployees.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="이름 또는 부서로 검색..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}

      {/* 빈 상태 (직원 0명) */}
      {allEmployees.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 직원이 없습니다</h3>
          <p className="text-sm text-gray-500">구성원 관리 탭에서 직원을 추가해 주세요.</p>
        </div>
      ) : isMobile ? (
        <MobileView
          employees={employees}
          selectedMonth={selectedMonth}
          multiplier={multiplier}
          getMonthlyStats={getMonthlyStats}
          getCarryoverForEmployee={getCarryoverForEmployee}
          getDailyData={getDailyData}
          daysArray={daysArray}
          yearMonth={yearMonth}
          holidays={holidays}
          todayColumnIndex={todayColumnIndex}
          isEditable={isEditable}
          onTimeInputClick={handleTimeInputClick}
        />
      ) : (
      <>
      <div className="bg-white rounded-lg shadow overflow-hidden" style={{
        visibility: isReady ? 'visible' : 'hidden',
        minHeight: isReady ? 'auto' : '400px'
      }}>
        <div className="flex">
          <div ref={leftTableRef} className="flex-shrink-0 border-r-2 border-gray-300">
            <table className="divide-y divide-gray-300" style={{tableLayout: 'fixed', minWidth: isMobile ? '340px' : '560px'}}>
              <colgroup>
                <col style={{width: isMobile ? '100px' : '112px'}} />
                {!isMobile && <col style={{width: '112px'}} />}
                {!isMobile && <col style={{width: '72px'}} />}
                <col />
                <col style={{width: '72px'}} />
                <col style={{width: '72px'}} />
                <col style={{width: '48px'}} />
              </colgroup>
              <thead className="bg-gray-200">
                <tr ref={leftHeaderRowRef} style={{ minHeight: '43px' }}>
                  <th className={STYLES.LEFT_HEADER_CLASSES} style={{padding: STYLES.HEADER_PADDING, minHeight: '43px', verticalAlign: 'top'}}>
                    <HeaderCell>
                      이름
                    </HeaderCell>
                  </th>
                  {!isMobile && (
                    <th className={STYLES.LEFT_HEADER_CLASSES} style={{padding: STYLES.HEADER_PADDING, minHeight: '43px', verticalAlign: 'top'}}>
                      <HeaderCell>
                        부서
                      </HeaderCell>
                    </th>
                  )}
                  {!isMobile && (
                    <th className={STYLES.LEFT_HEADER_CLASSES} style={{padding: STYLES.HEADER_PADDING, minHeight: '43px', verticalAlign: 'top'}}>
                      <HeaderCell>
                        이월
                      </HeaderCell>
                    </th>
                  )}
                  <th className={STYLES.LEFT_HEADER_CLASSES} style={{padding: STYLES.HEADER_PADDING, minHeight: '43px', verticalAlign: 'top'}}>
                    <HeaderCell>
                      초과시간{multiplier !== 1.0 ? `(×${multiplier})` : ''}
                    </HeaderCell>
                  </th>
                  <th className={STYLES.LEFT_HEADER_CLASSES} style={{padding: STYLES.HEADER_PADDING, minHeight: '43px', verticalAlign: 'top'}}>
                    <HeaderCell>
                      사용시간
                    </HeaderCell>
                  </th>
                  <th className={STYLES.LEFT_HEADER_CLASSES} style={{padding: STYLES.HEADER_PADDING, minHeight: '43px', verticalAlign: 'top'}}>
                    <HeaderCellWithTooltip tooltipText={`이월 + 초과시간(×${multiplier}배) - 사용시간 = 잔여시간`}>
                      잔여시간
                    </HeaderCellWithTooltip>
                  </th>
                  <th className={STYLES.CENTER_HEADER_CLASSES} style={{padding: STYLES.HEADER_PADDING, minHeight: '43px', verticalAlign: 'top'}}>
                    <HeaderCell alignment="center">
                      구분
                    </HeaderCell>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-300">
                {employees.map((employee) => {
                  const stats = getMonthlyStats(employee.id, selectedMonth, multiplier);
                  // 이월 데이터 가져오기
                  const carryoverMinutes = getCarryoverForEmployee(employee.id, selectedMonth);
                  // 이월 포함 잔여시간 계산
                  const adjustedRemaining = carryoverMinutes + stats.remaining;
                  return (
                    <tr key={employee.id} className={employee.isActive ? '' : 'bg-gray-50'}>
                      <td className={`px-2 py-4 text-sm font-medium text-gray-900 border-r border-gray-300 ${getEmployeeBgClass(employee.isActive)}`} title={employee.lastUpdatedName || employee.name}>
                        <div style={{display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-all'}}>
                          {employee.lastUpdatedName || employee.name}
                          {!employee.isActive && (
                            <span className="ml-1 inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              삭제
                            </span>
                          )}
                        </div>
                      </td>
                      {!isMobile && (
                        <td className={`px-2 py-4 text-sm text-gray-600 border-r border-gray-300 ${getEmployeeBgClass(employee.isActive)}`} title={employee.department || '-'}>
                          <div style={{display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-all'}}>
                            {employee.department || '-'}
                          </div>
                        </td>
                      )}
                      {!isMobile && (
                        <td className={`px-3 py-4 text-sm border-r border-gray-300 ${getEmployeeBgClass(employee.isActive)}`}>
                          <span className={carryoverMinutes > 0 ? "text-orange-600" : carryoverMinutes < 0 ? "text-red-600" : "text-gray-500"}>
                            {carryoverMinutes > 0 && '+'}{carryoverMinutes < 0 && '-'}{timeUtils.formatTime(Math.abs(carryoverMinutes))}
                          </span>
                        </td>
                      )}
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
            <table className="divide-y divide-gray-300" style={{tableLayout: 'fixed', width: `${daysInMonth * 72}px`}}>
              <thead className="bg-gray-200">
                <tr ref={rightHeaderRowRef} style={{ minHeight: '43px' }}>
                  {daysArray.map((day) => {
                    const date = new Date(yearMonth[0], yearMonth[1] - 1, day);
                    const dayOfWeekIndex = date.getDay();
                    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][dayOfWeekIndex];
                    const dateString = dateUtils.formatDateString(yearMonth[0], yearMonth[1], day);
                    const isHolidayDate = holidayUtils.isHoliday(dateString, holidays);
                    const isWeekend = dayOfWeekIndex === 0 || dayOfWeekIndex === 6;
                    const textColorValue = getDateTextColor(isHolidayDate, isWeekend);
                    const isTodayColumn = day === todayColumnIndex;
                    
                    // 생일 체크: 해당 날짜가 직원의 생일인지 확인
                    const birthdayEmployees = employees
                      .filter(emp => {
                        if (!emp.isActive) return false;
                        // snake_case와 camelCase 모두 지원
                        const birthDateValue = emp.birthDate || emp.birth_date;
                        if (!birthDateValue) return false;
                        const birthDate = new Date(birthDateValue);
                        return birthDate.getMonth() === parseInt(yearMonth[1]) - 1 && 
                               birthDate.getDate() === day;
                      })
                      .map(emp => emp.lastUpdatedName || emp.name);
                    
                    return (
                      <th 
                        key={day} 
                        className={STYLES.DATE_HEADER_CLASSES}
                        style={{
                          padding: STYLES.HEADER_PADDING,
                          color: textColorValue,
                          minHeight: '43px',
                          verticalAlign: 'top',
                          ...(isTodayColumn && { backgroundColor: '#D1D5DB' })
                        }}
                      >
                        <DateHeaderCell 
                          holidayName={isHolidayDate ? holidayUtils.getHolidayName(dateString, holidays) : ''}
                          birthdayEmployees={birthdayEmployees}
                        >
                          {day.toString().padStart(2, '0')}({dayOfWeek})
                        </DateHeaderCell>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-300">
                {employees.map((employee) => {
                  return (
                    <tr key={employee.id} className={employee.isActive ? '' : 'bg-gray-50'}>
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
                                  disabled={!employee.isActive || !isEditable}
                                  color="blue"
                                />
                              </div>
                              <div className="flex-1 flex items-center justify-center py-1">
                                <TimeDisplay 
                                  value={vacationMinutes}
                                  onClick={() => handleTimeInputClick(employee.id, day, vacationMinutes, 'vacation')}
                                  disabled={!employee.isActive || !isEditable}
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
      </>
      )}

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

      <CarryoverChangeModal
        show={showCarryoverChangeModal}
        onClose={() => setShowCarryoverChangeModal(false)}
        employeeName={carryoverChangeData?.employeeName}
        sourceMonth={carryoverChangeData?.sourceMonth}
        targetMonth={carryoverChangeData?.targetMonth}
        oldRemaining={carryoverChangeData?.oldRemaining || 0}
        newRemaining={carryoverChangeData?.newRemaining || 0}
        oldCarryover={carryoverChangeData?.oldCarryover || 0}
        newCarryover={carryoverChangeData?.newCarryover || 0}
        targetMonthOldRemaining={carryoverChangeData?.targetMonthOldRemaining || 0}
        targetMonthNewRemaining={carryoverChangeData?.targetMonthNewRemaining || 0}
      />

      <MonthChangeNotification
        show={showMonthChangeNotification}
        onClose={handleCloseMonthChangeNotification}
        onGoToLastMonth={handleGoToLastMonth}
        currentMonth={monthChangeData?.currentMonth}
        lastMonth={monthChangeData?.lastMonth}
        carryoverList={monthChangeData?.carryoverList || []}
        editDeadline={monthChangeData?.editDeadline}
      />

      <UpgradeModal
        show={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="이전 달 조회 제한"
        message={upgradeMessage || '무료 플랜은 당월 데이터만 조회할 수 있습니다. 이전 기록을 확인하려면 플랜을 업그레이드하세요.'}
      />
    </div>
  );
});

export default Dashboard;
