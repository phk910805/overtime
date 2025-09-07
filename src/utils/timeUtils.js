/**
 * 시간 유틸리티
 * 한국시간 기준 시간 처리
 */

export class TimeUtils {
  /**
   * 한국시간 기준 현재 시간을 UTC ISO 문자열로 반환
   * Supabase에 저장할 때 한국시간 기준으로 맞춤
   */
  static getKoreanTimeAsUTC() {
    const now = new Date();
    // 한국은 UTC+9이므로 9시간을 더해서 저장
    const koreanTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    return koreanTime.toISOString();
  }

  /**
   * UTC 시간을 한국시간으로 변환하여 표시
   * @param {string} utcTimeString - UTC ISO 문자열
   * @returns {string} - 한국시간 표시용 문자열
   */
  static formatKoreanTime(utcTimeString) {
    const utcDate = new Date(utcTimeString);
    const koreanDate = new Date(utcDate.getTime() + (9 * 60 * 60 * 1000));
    
    const year = koreanDate.getFullYear();
    const month = (koreanDate.getMonth() + 1).toString().padStart(2, '0');
    const day = koreanDate.getDate().toString().padStart(2, '0');
    const hours = koreanDate.getHours().toString().padStart(2, '0');
    const minutes = koreanDate.getMinutes().toString().padStart(2, '0');
    const seconds = koreanDate.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * 현재 한국시간 기준 날짜 문자열 반환 (YYYY-MM-DD)
   */
  static getCurrentKoreanDate() {
    const now = new Date();
    const koreanTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    
    const year = koreanTime.getFullYear();
    const month = (koreanTime.getMonth() + 1).toString().padStart(2, '0');
    const day = koreanTime.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  /**
   * 디버깅용: 현재 시간 정보 출력
   */
  static debugTimeInfo() {
    const now = new Date();
    console.log('=== 시간 디버깅 정보 ===');
    console.log('로컬 시간:', now);
    console.log('UTC ISO:', now.toISOString());
    console.log('한국 시간 UTC:', TimeUtils.getKoreanTimeAsUTC());
    console.log('시간대 오프셋:', now.getTimezoneOffset(), '분');
  }
}

export default TimeUtils;
