/**
 * 히스토리 정책 관리
 * 환경에 관계없이 일관된 히스토리 로직 적용
 */

import { TimeUtils } from '../utils/timeUtils.js';

export class HistoryPolicy {
  /**
   * 시간 기록 히스토리 정책 적용
   * @param {number} employeeId - 직원 ID
   * @param {string} date - 날짜 (YYYY-MM-DD)
   * @param {number} totalMinutes - 입력된 시간(분)
   * @param {Array} existingRecords - 기존 기록들
   * @returns {Object|null} - 생성할 히스토리 기록 또는 null (기록하지 않을 경우)
   */
  static createTimeRecord(employeeId, date, totalMinutes, existingRecords) {
    // 해당 직원의 해당 날짜 기록들을 시간순으로 정렬
    const dayRecords = existingRecords
      .filter(record => 
        record.employeeId === employeeId && 
        record.date === date
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const lastRecord = dayRecords[0];

    // 정책 1: 00:00 상태에서 00:00 입력은 의미 없음
    if (totalMinutes === 0 && (!lastRecord || lastRecord.totalMinutes === 0)) {
      return null; // 히스토리에 기록하지 않음
    }

    // 정책 2: 동일한 값 입력은 의미 없음 (2번 옵션 적용)
    if (lastRecord && lastRecord.totalMinutes === totalMinutes) {
      return null; // 동일한 값이므로 히스토리에 기록하지 않음
    }

    // 동작 타입 결정
    let description;
    if (totalMinutes === 0) {
      description = '삭제'; // 기존 시간을 00:00으로 변경
    } else if (lastRecord && lastRecord.totalMinutes > 0) {
      description = '수정'; // 마지막이 의미있는 기록이면 수정
    } else {
      description = '생성'; // 삭제 후 재입력 또는 처음 입력
    }

    // 히스토리 기록 생성
    return {
      id: Date.now() + Math.random(),
      employeeId,
      date,
      totalMinutes,
      description,
      createdAt: TimeUtils.getKoreanTimeAsUTC() // 한국시간 기준 UTC 사용
    };
  }

  /**
   * 직원 변경 히스토리 기록 생성
   * @param {number} employeeId - 직원 ID
   * @param {string} action - 동작 ('생성', '수정', '삭제')
   * @param {string} employeeName - 직원명
   * @param {string} oldName - 이전 직원명 (수정 시만 사용)
   * @returns {Object} - 히스토리 기록
   */
  static createEmployeeChangeRecord(employeeId, action, employeeName, oldName = null) {
    // 디버깅용 로그 추가
    console.log('🎯 HistoryPolicy.createEmployeeChangeRecord called with:', {
      employeeId, 
      action, 
      employeeName,
      oldName
    });
    
    const record = {
      id: Date.now() + Math.random(),
      employeeId,
      action,
      employeeName,
      oldName, // 이전 이름 추가
      createdAt: TimeUtils.getKoreanTimeAsUTC() // 한국시간 기준 UTC 사용
    };
    
    console.log('📋 Created history record:', record);
    return record;
  }

  /**
   * 대량 업데이트 히스토리 기록 생성
   * @param {Array} updates - 업데이트 목록
   * @returns {Array} - 히스토리 기록들
   */
  static createBulkRecords(updates) {
    return updates.map(update => ({
      id: Date.now() + Math.random(),
      employeeId: update.employeeId,
      date: update.date,
      totalMinutes: update.totalMinutes,
      description: '생성', // 대량 업데이트는 생성으로 처리
      createdAt: TimeUtils.getKoreanTimeAsUTC() // 한국시간 기준 UTC 사용
    }));
  }

  /**
   * 색상 정책 (UI에서 사용)
   * @param {string} description - 동작 설명
   * @param {string} type - 기록 타입 ('overtime' | 'vacation')
   * @returns {string} - CSS 클래스명
   */
  static getDescriptionColor(description, type) {
    switch(description) {
      case '생성':
        return type === 'overtime' ? 'text-blue-600' : 'text-green-600';
      case '수정': 
        return 'text-orange-600';
      case '삭제': 
        return 'text-red-600';
      default: 
        return type === 'overtime' ? 'text-blue-600' : 'text-green-600';
    }
  }

  /**
   * 시간 변경 표시 로직
   * @param {Object} record - 현재 기록
   * @param {Array} allRecords - 모든 기록
   * @param {string} type - 기록 타입
   * @param {Function} timeFormatter - 시간 포맷터 함수
   * @returns {Object} - {display: JSX, color: string}
   */
  static getChangeDisplay(record, allRecords, type, timeFormatter) {
    const recordDate = new Date(record.createdAt);
    const previousRecord = allRecords
      .filter(r => 
        r.employeeId === record.employeeId && 
        r.date === record.date &&
        new Date(r.createdAt) < recordDate
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    const currentTime = timeFormatter(record.totalMinutes);
    const action = record.description || record.action;
    const textColor = this.getDescriptionColor(action, type);

    if (!previousRecord || previousRecord.totalMinutes === 0) {
      return {
        display: currentTime,
        color: textColor
      };
    }
    
    if (previousRecord.totalMinutes !== record.totalMinutes) {
      const prevTime = timeFormatter(previousRecord.totalMinutes);
      return {
        display: `${prevTime} → ${currentTime}`,
        color: textColor
      };
    }

    return {
      display: currentTime,
      color: textColor
    };
  }
}

export default HistoryPolicy;
