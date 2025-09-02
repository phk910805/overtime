import React, { useState, useEffect, createContext, useContext, useMemo, useCallback, memo, useRef } from 'react';
import { Calendar, Clock, Users, Plus, Edit2, Trash2, BarChart3, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Settings } from 'lucide-react';

// ========== UTILS ==========
const timeUtils = {
  formatTime: (totalMinutes) => {
    if (!totalMinutes) return '0:00';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  },

  formatTimeInput: (totalMinutes) => {
    if (!totalMinutes) return '';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  },

  parseTimeToMinutes: (timeStr) => {
    if (!timeStr?.trim()) return 0;
    
    const cleaned = timeStr.replace(/[^\d:]/g, '');
    
    if (cleaned.includes(':')) {
      const [h, m] = cleaned.split(':');
      const hours = parseInt(h) || 0;
      const minutes = parseInt(m) || 0;
      
      if (hours <= 23 && minutes <= 59) {
        return hours * 60 + minutes;
      }
    } else {
      const hours = parseInt(cleaned) || 0;
      if (hours <= 23) {
        return hours * 60;
      }
    }
    
    return 0;
  },

  convertTimeToMinutes: (hours, minutes) => {
    return parseInt(hours || 0) * 60 + parseInt(minutes || 0);
  }
};

const dateUtils = {
  getDaysInMonth: (yearMonth) => {
    const [year, month] = yearMonth.split('-');
    return new Date(year, month, 0).getDate();
  },

  formatDateString: (year, month, day) => {
    return `${year}-${month}-${day.toString().padStart(2, '0')}`;
  }
};

// ========== HOLIDAY UTILS ==========
const holidayUtils = {
  // 공휴일 데이터 캐시
  holidayCache: new Map(),

  // 환경별 분기 처리
  isClaudeEnvironment() {
    // Claude.ai 환경인지 간단히 체크
    return window.location.hostname.includes('claude.ai') || 
           window.location.hostname.includes('claudeusercontent.com');
  },

  // 하드코딩된 2025년 공휴일 데이터 (폴백용)
  staticHolidays: {
    '2025': {
      '2025-01-01': ['신정'],
      '2025-02-09': ['설날 연휴'],  
      '2025-02-10': ['설날'],
      '2025-02-11': ['설날 연휴'],
      '2025-03-01': ['3·1절'],
      '2025-05-01': ['근로자의 날'],
      '2025-05-05': ['어린이날'],
      '2025-05-13': ['부처님 오신 날'],
      '2025-06-06': ['현충일'],
      '2025-08-15': ['광복절'],
      '2025-09-06': ['추석 연휴'],
      '2025-09-07': ['추석 연휴'],
      '2025-09-08': ['추석'],
      '2025-09-09': ['추석 연휴'],
      '2025-10-03': ['개천절'],
      '2025-10-09': ['한글날'],
      '2025-12-25': ['크리스마스']
    },
    '2024': {
      '2024-01-01': ['신정'],
      '2024-02-09': ['설날 연휴'],
      '2024-02-10': ['설날'],
      '2024-02-11': ['설날 연휴'],
      '2024-02-12': ['설날 연휴'],
      '2024-03-01': ['3·1절'],
      '2024-04-10': ['제22대 국회의원선거'],
      '2024-05-05': ['어린이날'],
      '2024-05-06': ['어린이날 대체공휴일'],
      '2024-05-15': ['부처님 오신 날'],
      '2024-06-06': ['현충일'],
      '2024-08-15': ['광복절'],
      '2024-09-16': ['추석 연휴'],
      '2024-09-17': ['추석'],
      '2024-09-18': ['추석 연휴'],
      '2024-10-03': ['개천절'],
      '2024-10-09': ['한글날'],
      '2024-12-25': ['크리스마스']
    }
  },

  // API에서 공휴일 데이터 가져오기
  async fetchFromAPI(year) {
    console.log(`Fetching holidays for ${year} from API...`);
    
    try {
      // holidays-kr API 사용
      const response = await fetch(`https://holidays.hyunbin.page/${year}.json`);
      
      if (response.ok) {
        const holidays = await response.json();
        console.log(`API response received for ${year}:`, holidays);
        return holidays;
      } else {
        console.warn(`API request failed: ${response.status} ${response.statusText}`);
        return null;
      }
    } catch (error) {
      console.warn('API fetch failed:', error.message);
      return null;
    }
  },

  // 정적 데이터에서 가져오기
  getStaticHolidays(year) {
    console.log(`Using static holiday data for ${year}`);
    return this.staticHolidays[year] || {};
  },

  // 공휴일 데이터 가져오기 (통합 함수)
  async fetchHolidays(year) {
    // 캐시된 데이터가 있으면 반환
    if (this.holidayCache.has(year)) {
      console.log(`Using cached holiday data for ${year}`);
      return this.holidayCache.get(year);
    }

    let holidays = {};

    // 환경에 따라 데이터 소스 결정
    if (this.isClaudeEnvironment()) {
      // Claude 환경: 정적 데이터 사용
      holidays = this.getStaticHolidays(year);
    } else {
      // 일반 환경: API 시도 후 폴백
      const apiData = await this.fetchFromAPI(year);
      if (apiData) {
        holidays = apiData;
      } else {
        console.warn(`API failed, falling back to static data for ${year}`);
        holidays = this.getStaticHolidays(year);
      }
    }

    // 캐시에 저장
    this.holidayCache.set(year, holidays);
    console.log(`Holiday data loaded for ${year}:`, holidays);
    
    return holidays;
  },

  // 특정 날짜가 공휴일인지 확인
  isHoliday(dateString, holidays) {
    return Boolean(holidays && holidays[dateString]);
  },

  // 공휴일 이름 가져오기
  getHolidayName(dateString, holidays) {
    const holiday = holidays && holidays[dateString];
    if (Array.isArray(holiday)) {
      return holiday[0]; // 첫 번째 공휴일 이름
    }
    if (typeof holiday === 'string') {
      return holiday;
    }
    return null;
  },

  // 캐시 초기화 (필요시)
  clearCache() {
    this.holidayCache.clear();
    console.log('Holiday cache cleared');
  },

  // 지원 연도 확인
  getSupportedYears() {
    return Object.keys(this.staticHolidays);
  }
};

const validators = {
  employeeName: (name, employees, excludeId = null) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return { isValid: false, message: '직원명을 입력해주세요.' };
    }
    
    const isDuplicate = employees.some(emp => 
      emp.name.toLowerCase() === trimmedName.toLowerCase() && 
      emp.id !== excludeId
    );
    
    if (isDuplicate) {
      return { isValid: false, message: '동일한 직원명이 이미 존재합니다.' };
    }
    
    return { isValid: true, message: '' };
  },

  timeValue: (hours, minutes) => {
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    
    if (h > 24) {
      return { isValid: false, message: '시간은 0-24 사이의 값을 입력해주세요' };
    }
    
    if (m >= 60) {
      return { isValid: false, message: '분은 0-59 사이의 값을 입력해주세요' };
    }
    
    if (h === 24 && m > 0) {
      return { isValid: false, message: '24시간을 초과할 수 없습니다' };
    }
    
    return { isValid: true, message: '' };
  },

  multiplier: (value) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 1.0 || num > 3.0) {
      return { isValid: false, message: '배수는 1.0 ~ 3.0 사이의 값을 입력해주세요' };
    }
    return { isValid: true, message: '' };
  }
};

// 저장소 관리
class StorageManager {
  constructor() {
    this.cache = new Map();
    this.maxCacheSize = 100;
  }

  _evictOldestCache() {
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  save(key, data) {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
      this._evictOldestCache();
      this.cache.set(key, data);
      return true;
    } catch (error) {
      console.error('Failed to save to storage:', error);
      return false;
    }
  }

  load(key, defaultValue = []) {
    try {
      if (this.cache.has(key)) {
        return this.cache.get(key);
      }
      
      const item = localStorage.getItem(key);
      const data = item ? JSON.parse(item) : defaultValue;
      this._evictOldestCache();
      this.cache.set(key, data);
      return data;
    } catch (error) {
      console.error('Failed to load from storage:', error);
      return defaultValue;
    }
  }

  loadSettings() {
    return this.load('overtime-settings', { multiplier: 1.0 });
  }

  saveSettings(settings) {
    return this.save('overtime-settings', settings);
  }

  clearCache() {
    this.cache.clear();
  }
}

const storageManager = new StorageManager();

// 데이터 계산 클래스
class DataCalculator {
  constructor() {
    this.statsCache = new Map();
    this.dailyDataCache = new Map();
    this.filteredRecordsCache = new Map();
    this.maxCacheSize = 200;
  }

  _evictOldestCache(cache) {
    if (cache.size >= this.maxCacheSize) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }
  }

  clearCache() {
    this.statsCache.clear();
    this.dailyDataCache.clear();
    this.filteredRecordsCache.clear();
  }

  _getFilteredMonthlyRecords(selectedMonth, overtimeRecords, vacationRecords) {
    const cacheKey = `${selectedMonth}`;
    
    if (this.filteredRecordsCache.has(cacheKey)) {
      return this.filteredRecordsCache.get(cacheKey);
    }

    const [year, month] = selectedMonth.split('-');

    const filterByMonth = (records) => records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getFullYear() === parseInt(year) && 
             (recordDate.getMonth() + 1).toString().padStart(2, '0') === month;
    });

    const result = {
      overtimeRecords: filterByMonth(overtimeRecords),
      vacationRecords: filterByMonth(vacationRecords)
    };

    this._evictOldestCache(this.filteredRecordsCache);
    this.filteredRecordsCache.set(cacheKey, result);
    return result;
  }

  getMonthlyStats(employeeId, selectedMonth, overtimeRecords, vacationRecords, multiplier = 1.0) {
    const cacheKey = `${employeeId}-${selectedMonth}-${multiplier}`;
    
    if (this.statsCache.has(cacheKey)) {
      return this.statsCache.get(cacheKey);
    }

    const { overtimeRecords: monthlyOvertime, vacationRecords: monthlyVacation } = 
      this._getFilteredMonthlyRecords(selectedMonth, overtimeRecords, vacationRecords);

    const filterByEmployee = (records) => employeeId ? 
      records.filter(record => record.employeeId === employeeId) : records;

    const employeeOvertime = filterByEmployee(monthlyOvertime);
    const employeeVacation = filterByEmployee(monthlyVacation);

    const calculateLatestTotals = (records) => {
      const latestRecords = new Map();
      
      records.forEach(record => {
        const key = `${record.employeeId}-${record.date}`;
        const existing = latestRecords.get(key);
        
        if (!existing || new Date(record.createdAt) > new Date(existing.createdAt)) {
          latestRecords.set(key, record);
        }
      });
      
      return Array.from(latestRecords.values()).reduce((sum, record) => sum + record.totalMinutes, 0);
    };

    const totalOvertimeMinutes = calculateLatestTotals(employeeOvertime);
    const totalVacationMinutes = calculateLatestTotals(employeeVacation);
    
    const adjustedOvertimeMinutes = Math.round(totalOvertimeMinutes * multiplier);

    const result = {
      totalOvertime: totalOvertimeMinutes,
      totalVacation: totalVacationMinutes,
      adjustedOvertime: adjustedOvertimeMinutes,
      remaining: adjustedOvertimeMinutes - totalVacationMinutes,
      multiplier: multiplier
    };

    this._evictOldestCache(this.statsCache);
    this.statsCache.set(cacheKey, result);
    return result;
  }

  getDailyData(employeeId, date, type, overtimeRecords, vacationRecords) {
    const cacheKey = `${employeeId}-${date}-${type}`;
    
    if (this.dailyDataCache.has(cacheKey)) {
      return this.dailyDataCache.get(cacheKey);
    }

    const records = type === 'overtime' ? overtimeRecords : vacationRecords;
    const dayRecords = records
      .filter(record => record.employeeId === employeeId && record.date === date)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const result = dayRecords[0]?.totalMinutes || 0;
    
    this._evictOldestCache(this.dailyDataCache);
    this.dailyDataCache.set(cacheKey, result);
    return result;
  }
}

const dataCalculator = new DataCalculator();

// Context
const OvertimeContext = createContext();

const useOvertimeContext = () => {
  const context = useContext(OvertimeContext);
  if (!context) {
    throw new Error('useOvertimeContext must be used within OvertimeProvider');
  }
  return context;
};

// 메인 앱을 위한 미니멀한 구현을 만들어 테스트하겠습니다
const OvertimeProvider = ({ children }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [employees, setEmployees] = useState([]);
  const [overtimeRecords, setOvertimeRecords] = useState([]);
  const [vacationRecords, setVacationRecords] = useState([]);

  useEffect(() => {
    setEmployees(storageManager.load('overtime-employees'));
    setOvertimeRecords(storageManager.load('overtime-records'));
    setVacationRecords(storageManager.load('vacation-records'));
  }, []);

  const value = useMemo(() => ({
    selectedMonth,
    setSelectedMonth,
    employees,
    overtimeRecords,
    vacationRecords
  }), [selectedMonth, employees, overtimeRecords, vacationRecords]);

  return (
    <OvertimeContext.Provider value={value}>
      {children}
    </OvertimeContext.Provider>
  );
};

// 메인 앱 컴포넌트
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
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            초과근무시간 관리 시스템이 복원되었습니다!
          </h2>
          <p className="text-gray-600 mb-4">
            현재는 기본 구조만 로드된 상태입니다.<br/>
            완전한 기능을 사용하려면 전체 컴포넌트가 필요합니다.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-800">
              선택된 월: <strong>{selectedMonth}</strong><br/>
              활성 탭: <strong>{activeTab}</strong><br/>
              데이터 저장: <strong>LocalStorage 연동완료</strong>
            </p>
          </div>
        </div>
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