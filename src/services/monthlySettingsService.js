// monthlySettingsService.js
// 월별 설정 이력 관리 서비스

import { createClient } from '@supabase/supabase-js';

class MonthlySettingsService {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * 특정 년월의 설정을 가져오거나 자동 생성
   * @param {number} year - 년도
   * @param {number} month - 월
   * @returns {Object} 설정 정보
   */
  async ensureMonthlySettings(year, month) {
    try {
      const { data: user } = await this.supabase.auth.getUser();
      if (!user?.user?.id) {
        throw new Error('사용자 인증이 필요합니다');
      }

      // ensure_monthly_settings 함수 호출
      const { data, error } = await this.supabase.rpc('ensure_monthly_settings', {
        p_year: year,
        p_month: month,
        p_user_id: user.user.id
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('월별 설정 확인 오류:', error);
      throw error;
    }
  }

  /**
   * 특정 년월의 설정 조회
   * @param {number} year - 년도
   * @param {number} month - 월
   * @returns {Object} 설정 정보
   */
  async getMonthlySettings(year, month) {
    try {
      const { data, error } = await this.supabase
        .from('settings_history')
        .select('*')
        .eq('year', year)
        .eq('month', month)
        .eq('key', 'overtimeSettings')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116: 결과 없음
        throw error;
      }

      // 설정이 없으면 자동 생성 시도
      if (!data) {
        const ensureResult = await this.ensureMonthlySettings(year, month);
        if (ensureResult.status === 'created' || ensureResult.status === 'exists') {
          // 다시 조회
          const { data: newData, error: newError } = await this.supabase
            .from('settings_history')
            .select('*')
            .eq('year', year)
            .eq('month', month)
            .eq('key', 'overtimeSettings')
            .single();
          
          if (newError) throw newError;
          return newData;
        }
      }

      return data;
    } catch (error) {
      console.error('월별 설정 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 특정 년월의 설정 업데이트
   * @param {number} year - 년도
   * @param {number} month - 월
   * @param {number} multiplier - 배수
   * @param {Object} value - 추가 설정값
   * @returns {Object} 업데이트된 설정
   */
  async updateMonthlySettings(year, month, multiplier, value = {}) {
    try {
      const { data: user } = await this.supabase.auth.getUser();
      if (!user?.user?.id) {
        throw new Error('사용자 인증이 필요합니다');
      }

      // 먼저 해당 월의 설정이 있는지 확인 (없으면 생성)
      await this.ensureMonthlySettings(year, month);

      // 설정 업데이트
      const { data, error } = await this.supabase
        .from('settings_history')
        .update({
          multiplier: multiplier,
          value: value,
          updated_at: new Date().toISOString(),
          note: `${new Date().toLocaleDateString('ko-KR')} 수정됨`
        })
        .eq('year', year)
        .eq('month', month)
        .eq('key', 'overtimeSettings')
        .eq('user_id', user.user.id)
        .select()
        .single();

      if (error) throw error;

      // 현재 월이면 settings 테이블도 업데이트
      const currentDate = new Date();
      if (year === currentDate.getFullYear() && month === currentDate.getMonth() + 1) {
        await this.supabase
          .from('settings')
          .upsert({
            key: 'overtimeSettings',
            value: value,
            multiplier: multiplier
          })
          .eq('key', 'overtimeSettings');
      }

      return data;
    } catch (error) {
      console.error('월별 설정 업데이트 오류:', error);
      throw error;
    }
  }

  /**
   * 특정 날짜 범위의 모든 월별 설정 조회
   * @param {Date} startDate - 시작 날짜
   * @param {Date} endDate - 끝 날짜
   * @returns {Array} 설정 목록
   */
  async getSettingsRange(startDate, endDate) {
    try {
      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth() + 1;
      const endYear = endDate.getFullYear();
      const endMonth = endDate.getMonth() + 1;

      const { data, error } = await this.supabase
        .from('settings_history')
        .select('*')
        .eq('key', 'overtimeSettings')
        .or(`and(year.eq.${startYear},month.gte.${startMonth}),and(year.gt.${startYear},year.lt.${endYear}),and(year.eq.${endYear},month.lte.${endMonth})`)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('설정 범위 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 과거 기록에 대한 배수 적용 계산
   * @param {Array} records - 초과근무/휴가 기록
   * @returns {Array} 배수가 적용된 기록
   */
  async applyHistoricalMultipliers(records) {
    try {
      if (!records || records.length === 0) return [];

      // 모든 고유한 년월 추출
      const uniqueMonths = [...new Set(records.map(r => {
        const date = new Date(r.date);
        return `${date.getFullYear()}-${date.getMonth() + 1}`;
      }))];

      // 각 월의 설정 가져오기
      const settingsMap = {};
      for (const monthKey of uniqueMonths) {
        const [year, month] = monthKey.split('-').map(Number);
        const settings = await this.getMonthlySettings(year, month);
        settingsMap[monthKey] = settings?.multiplier || 1.0;
      }

      // 각 기록에 배수 적용
      return records.map(record => {
        const date = new Date(record.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        const multiplier = settingsMap[monthKey] || 1.0;
        
        return {
          ...record,
          originalMinutes: record.totalMinutes,
          totalMinutes: record.totalMinutes,
          adjustedMinutes: Math.round(record.totalMinutes * multiplier),
          appliedMultiplier: multiplier
        };
      });
    } catch (error) {
      console.error('과거 배수 적용 오류:', error);
      return records;
    }
  }
}

export default MonthlySettingsService;
