import React from 'react';
import { TimeUtils as KoreanTimeUtils } from './utils/timeUtils.js';

export const timeUtils = {
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
      const [hourStr, minuteStr] = cleaned.split(':');
      const hours = parseInt(hourStr) || 0;
      const minutes = parseInt(minuteStr) || 0;
      
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

export const dateUtils = {
  getDaysInMonth: (yearMonth) => {
    const [year, month] = yearMonth.split('-');
    return new Date(year, month, 0).getDate();
  },

  formatDateString: (year, month, day) => {
    return `${year}-${month}-${day.toString().padStart(2, '0')}`;
  }
};

export const holidayUtils = {
  // 공휴일 데이터 캐시
  holidayCache: new Map(),

  // 환경별 분기 처리
  isClaudeEnvironment() {
    return window.location.hostname.includes('claude.ai') || 
           window.location.hostname.includes('claudeusercontent.com');
  },

  // 하드코딩된 공휴일 데이터 (폴백용)
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
    if (process.env.NODE_ENV === 'development') {
      console.log(`Fetching holidays for ${year} from API...`);
    }
    
    try {
      const response = await fetch(`https://holidays.hyunbin.page/${year}.json`);
      
      if (response.ok) {
        const holidays = await response.json();
        if (process.env.NODE_ENV === 'development') {
          console.log(`API response received for ${year}:`, holidays);
        }
        return holidays;
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`API request failed: ${response.status} ${response.statusText}`);
        }
        return null;
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('API fetch failed:', error.message);
      }
      return null;
    }
  },

  // 정적 데이터에서 가져오기
  getStaticHolidays(year) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Using static holiday data for ${year}`);
    }
    return this.staticHolidays[year] || {};
  },

  // 공휴일 데이터 가져오기 (통합 함수)
  async fetchHolidays(year) {
    if (this.holidayCache.has(year)) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`Using cached holiday data for ${year}`);
      }
      return this.holidayCache.get(year);
    }

    let holidays = {};

    if (this.isClaudeEnvironment()) {
      holidays = this.getStaticHolidays(year);
    } else {
      const apiData = await this.fetchFromAPI(year);
      if (apiData) {
        holidays = apiData;
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`API failed, falling back to static data for ${year}`);
        }
        holidays = this.getStaticHolidays(year);
      }
    }

    this.holidayCache.set(year, holidays);
    if (process.env.NODE_ENV === 'development') {
      console.log(`Holiday data loaded for ${year}:`, holidays);
    }
    
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
      return holiday[0];
    }
    if (typeof holiday === 'string') {
      return holiday;
    }
    return null;
  },

  clearCache() {
    this.holidayCache.clear();
    if (process.env.NODE_ENV === 'development') {
      console.log('Holiday cache cleared');
    }
  },

  getSupportedYears() {
    return Object.keys(this.staticHolidays);
  }
};

export const validators = {
  employeeName: (name, employees, excludeId = null) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return { isValid: false, message: '직원명을 입력해주세요.', type: 'error' };
    }
    
    if (trimmedName.length < 2) {
      return { isValid: false, message: '직원명은 2자 이상 입력해주세요.', type: 'error' };
    }
    
    if (trimmedName.length > 20) {
      return { isValid: false, message: '직원명은 20자 이하로 입력해주세요.', type: 'error' };
    }
    
    const isDuplicate = employees.some(emp => 
      emp.name.toLowerCase() === trimmedName.toLowerCase() && 
      emp.id !== excludeId
    );
    
    if (isDuplicate) {
      return { isValid: false, message: '동일한 직원명이 이미 존재합니다.', type: 'error' };
    }
    
    return { isValid: true, message: '사용 가능한 직원명입니다.', type: 'success' };
  },

  timeValue: (hours, minutes) => {
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    
    if (h < 0 || m < 0) {
      return { isValid: false, message: '음수는 입력할 수 없습니다.', type: 'error' };
    }
    
    if (h > 24) {
      return { isValid: false, message: '시간은 0-24 사이의 값을 입력해주세요', type: 'error' };
    }
    
    if (m >= 60) {
      return { isValid: false, message: '분은 0-59 사이의 값을 입력해주세요', type: 'error' };
    }
    
    if (h === 24 && m > 0) {
      return { isValid: false, message: '24시간을 초과할 수 없습니다', type: 'error' };
    }
    
    if (h === 0 && m === 0) {
      return { isValid: true, message: '시간이 삭제됩니다.', type: 'warning' };
    }
    
    return { isValid: true, message: `${h}시간 ${m}분으로 설정됩니다.`, type: 'info' };
  },

  multiplier: (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) {
      return { isValid: false, message: '숫자를 입력해주세요.', type: 'error' };
    }
    
    if (num < 1.0 || num > 3.0) {
      return { isValid: false, message: '배수는 1.0 ~ 3.0 사이의 값을 입력해주세요', type: 'error' };
    }
    
    if (num === 1.0) {
      return { isValid: true, message: '기본 배수로 설정됩니다.', type: 'info' };
    }
    
    return { isValid: true, message: `${num}배로 설정됩니다.`, type: 'success' };
  },

  bulkSettings: (settings) => {
    const errors = [];
    
    if (settings.rangeType === 'selected' && settings.selectedEmployees.length === 0) {
      errors.push({ field: 'employees', message: '직원을 선택해주세요.', type: 'error' });
    }
    
    if (settings.dateType === 'range') {
      const startDate = new Date(settings.startDate);
      const endDate = new Date(settings.endDate);
      
      if (startDate > endDate) {
        errors.push({ field: 'dateRange', message: '시작일이 종료일보다 늦을 수 없습니다.', type: 'error' });
      }
      
      const dayDiff = (endDate - startDate) / (1000 * 60 * 60 * 24);
      if (dayDiff > 31) {
        errors.push({ field: 'dateRange', message: '최대 31일까지만 선택 가능합니다.', type: 'warning' });
      }
    }
    
    const overtimeTotal = (parseInt(settings.overtimeHours) || 0) * 60 + (parseInt(settings.overtimeMinutes) || 0);
    const vacationTotal = (parseInt(settings.vacationHours) || 0) * 60 + (parseInt(settings.vacationMinutes) || 0);
    
    if (settings.timeType === 'overtime' && overtimeTotal === 0) {
      errors.push({ field: 'overtime', message: '초과시간을 입력해주세요.', type: 'error' });
    }
    
    if (settings.timeType === 'vacation' && vacationTotal === 0) {
      errors.push({ field: 'vacation', message: '사용시간을 입력해주세요.', type: 'error' });
    }
    
    if (settings.timeType === 'both' && overtimeTotal === 0 && vacationTotal === 0) {
      errors.push({ field: 'time', message: '시간을 입력해주세요.', type: 'error' });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      message: errors.length === 0 ? '설정이 올바릅니다.' : `${errors.length}개의 문제가 있습니다.`
    };
  }
};

// ========== SORTING & PAGING HOOK ==========
export const useSortingPaging = (initialSort = { field: 'createdAt', direction: 'desc' }, initialItemsPerPage = 10) => {
  const [sortConfig, setSortConfig] = React.useState(initialSort);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage] = React.useState(initialItemsPerPage);

  const handleSort = React.useCallback((field) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
    setCurrentPage(1);
  }, []);

  const resetPage = React.useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    sortConfig,
    currentPage,
    itemsPerPage,
    handleSort,
    resetPage,
    setCurrentPage
  };
};

// ========== VALIDATION HOOK ==========
export const useValidation = () => {
  const [errors, setErrors] = React.useState({});
  const [warnings, setWarnings] = React.useState({});
  const [infos, setInfos] = React.useState({});

  const validate = React.useCallback((fieldName, validatorName, ...args) => {
    const validator = validators[validatorName];
    if (!validator) return true;

    const result = validator(...args);
    
    // 에러 상태 초기화
    setErrors(prev => ({
      ...prev,
      [fieldName]: result.type === 'error' && !result.isValid ? result.message : ''
    }));
    
    setWarnings(prev => ({
      ...prev,
      [fieldName]: result.type === 'warning' ? result.message : ''
    }));
    
    setInfos(prev => ({
      ...prev,
      [fieldName]: result.type === 'info' || (result.type === 'success' && result.isValid) ? result.message : ''
    }));

    return result.isValid;
  }, []);

  const validateMultiple = React.useCallback((validations) => {
    const results = {};
    let allValid = true;
    
    validations.forEach(({ field, validator, args }) => {
      const isValid = validate(field, validator, ...args);
      results[field] = isValid;
      if (!isValid) allValid = false;
    });
    
    return { allValid, results };
  }, [validate]);

  const clearError = React.useCallback((fieldName) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: ''
    }));
    setWarnings(prev => ({
      ...prev,
      [fieldName]: ''
    }));
    setInfos(prev => ({
      ...prev,
      [fieldName]: ''
    }));
  }, []);

  const clearAllErrors = React.useCallback(() => {
    setErrors({});
    setWarnings({});
    setInfos({});
  }, []);

  const hasErrors = React.useMemo(() => {
    return Object.values(errors).some(error => error !== '');
  }, [errors]);

  const hasWarnings = React.useMemo(() => {
    return Object.values(warnings).some(warning => warning !== '');
  }, [warnings]);

  const getFieldStatus = React.useCallback((fieldName) => {
    if (errors[fieldName]) return { type: 'error', message: errors[fieldName] };
    if (warnings[fieldName]) return { type: 'warning', message: warnings[fieldName] };
    if (infos[fieldName]) return { type: 'info', message: infos[fieldName] };
    return { type: 'none', message: '' };
  }, [errors, warnings, infos]);

  return {
    errors,
    warnings,
    infos,
    validate,
    validateMultiple,
    clearError,
    clearAllErrors,
    hasErrors,
    hasWarnings,
    getFieldStatus
  };
};
