/**
 * 시간 입력 검증 유틸리티
 * 24시간 제한 및 사용자 경험 최적화
 */

export class TimeInputValidator {
  /**
   * 시간 입력값 검증 및 필터링
   * @param {string} value - 입력된 값
   * @param {string} type - 'hours' | 'minutes'
   * @returns {Object} {isValid, filteredValue, message}
   */
  static validateInput(value, type) {
    const numValue = parseInt(value) || 0;
    
    if (type === 'hours') {
      return this.validateHours(value, numValue);
    } else if (type === 'minutes') {
      return this.validateMinutes(value, numValue);
    }
    
    return { isValid: false, filteredValue: '', message: '잘못된 타입입니다' };
  }

  /**
   * 시간(0-23) 입력 검증
   */
  static validateHours(value, numValue) {
    // 빈 값 허용
    if (value === '' || value === null || value === undefined) {
      return { isValid: true, filteredValue: '', message: null };
    }

    // 숫자가 아닌 문자 제거
    const cleanValue = value.replace(/[^0-9]/g, '');
    
    // 2자리 초과 입력 방지
    if (cleanValue.length > 2) {
      return { 
        isValid: false, 
        filteredValue: cleanValue.slice(0, 2), 
        message: '2자리까지만 입력 가능합니다' 
      };
    }

    const hours = parseInt(cleanValue) || 0;

    // 24시간 초과 체크
    if (hours >= 24) {
      if (hours === 24) {
        return {
          isValid: true,
          filteredValue: '23',
          message: '24시간은 23시간으로 자동 보정됩니다',
          autoCorrect: true
        };
      } else {
        return {
          isValid: false,
          filteredValue: cleanValue.slice(0, 1), // 첫 자리만 유지
          message: '시간은 23까지만 입력 가능합니다'
        };
      }
    }

    // 스마트 입력 제한 (첫 자리가 2일 때)
    if (cleanValue.length === 2 && cleanValue[0] === '2') {
      const secondDigit = parseInt(cleanValue[1]);
      if (secondDigit > 3) {
        return {
          isValid: false,
          filteredValue: '2',
          message: '2로 시작하는 시간은 23까지만 가능합니다'
        };
      }
    }

    return { isValid: true, filteredValue: cleanValue, message: null };
  }

  /**
   * 분(0-59) 입력 검증
   */
  static validateMinutes(value, numValue) {
    // 빈 값 허용
    if (value === '' || value === null || value === undefined) {
      return { isValid: true, filteredValue: '', message: null };
    }

    // 숫자가 아닌 문자 제거
    const cleanValue = value.replace(/[^0-9]/g, '');
    
    // 2자리 초과 입력 방지
    if (cleanValue.length > 2) {
      return { 
        isValid: false, 
        filteredValue: cleanValue.slice(0, 2), 
        message: '2자리까지만 입력 가능합니다' 
      };
    }

    const minutes = parseInt(cleanValue) || 0;

    // 60분 초과 체크
    if (minutes >= 60) {
      return {
        isValid: false,
        filteredValue: cleanValue.slice(0, 1), // 첫 자리만 유지
        message: '분은 59까지만 입력 가능합니다'
      };
    }

    // 스마트 입력 제한 (첫 자리가 6 이상일 때)
    if (cleanValue.length === 1 && parseInt(cleanValue[0]) > 5) {
      return {
        isValid: false,
        filteredValue: '',
        message: '분의 첫 자리는 0-5까지만 가능합니다'
      };
    }

    return { isValid: true, filteredValue: cleanValue, message: null };
  }

  /**
   * 최종 시간 조합 검증 (저장 전)
   * @param {string} hours - 시간
   * @param {string} minutes - 분
   * @returns {Object} {isValid, totalMinutes, message}
   */
  static validateFinalTime(hours, minutes) {
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;

    // 개별 범위 체크
    if (h >= 24) {
      return {
        isValid: false,
        message: '시간은 23까지만 입력 가능합니다',
        focus: 'hours'
      };
    }

    if (m >= 60) {
      return {
        isValid: false,
        message: '분은 59까지만 입력 가능합니다',
        focus: 'minutes'
      };
    }

    // 24:00 정확히 체크
    if (h === 24 && m === 0) {
      return {
        isValid: false,
        message: '24:00은 입력할 수 없습니다. 23:59까지 가능합니다',
        focus: 'hours'
      };
    }

    const totalMinutes = h * 60 + m;

    return {
      isValid: true,
      totalMinutes,
      hours: h,
      minutes: m,
      message: null
    };
  }

  /**
   * 입력 자동 포맷팅 (2자리로 맞춤)
   * @param {string} value - 입력값
   * @returns {string} - 포맷된 값
   */
  static formatToTwoDigits(value) {
    if (!value || value === '') return '';
    const num = parseInt(value) || 0;
    return num.toString().padStart(2, '0');
  }

  /**
   * 키보드 네비게이션 체크
   * @param {string} value - 현재 값
   * @param {string} type - 'hours' | 'minutes'
   * @returns {boolean} - 다음 필드로 이동해야 하는지
   */
  static shouldMoveToNext(value, type) {
    if (!value || value.length < 2) return false;
    
    const num = parseInt(value);
    
    if (type === 'hours') {
      // 24시간 이상이거나 2자리 완성 시
      return num >= 24 || (value.length === 2 && num <= 23);
    } else if (type === 'minutes') {
      // 60분 이상이거나 2자리 완성 시
      return num >= 60 || (value.length === 2 && num <= 59);
    }
    
    return false;
  }
}

export default TimeInputValidator;
