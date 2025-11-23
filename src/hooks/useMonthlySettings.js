// useMonthlySettings.js
// 월별 설정 관리를 위한 React Hook

import { useState, useEffect, useCallback } from 'react';
import MonthlySettingsService from '../services/monthlySettingsService';

/**
 * 월별 설정 관리 Hook
 * @param {Object} supabaseClient - Supabase 클라이언트
 * @returns {Object} 설정 관련 함수와 상태
 */
export function useMonthlySettings(supabaseClient) {
  const [service] = useState(() => new MonthlySettingsService(supabaseClient));
  const [currentSettings, setCurrentSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 특정 년월의 설정 로드
  const loadMonthlySettings = useCallback(async (year, month) => {
    try {
      setLoading(true);
      setError(null);
      
      const settings = await service.getMonthlySettings(year, month);
      setCurrentSettings(settings);
      
      return settings;
    } catch (err) {
      setError(err.message);
      console.error('설정 로드 실패:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // 설정 업데이트
  const updateSettings = useCallback(async (year, month, multiplier, value = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const updated = await service.updateMonthlySettings(year, month, multiplier, value);
      setCurrentSettings(updated);
      
      return updated;
    } catch (err) {
      setError(err.message);
      console.error('설정 업데이트 실패:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // 기록에 과거 배수 적용
  const applyHistoricalMultipliers = useCallback(async (records) => {
    try {
      return await service.applyHistoricalMultipliers(records);
    } catch (err) {
      console.error('배수 적용 실패:', err);
      return records;
    }
  }, [service]);

  // 월 변경 시 자동 설정 승계
  const ensureMonthlySettings = useCallback(async (year, month) => {
    try {
      setLoading(true);
      const result = await service.ensureMonthlySettings(year, month);
      
      if (result.status === 'created') {
        console.log(`${year}년 ${month}월 설정이 자동으로 승계되었습니다.`);
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      console.error('월 설정 확인 실패:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [service]);

  return {
    currentSettings,
    loading,
    error,
    loadMonthlySettings,
    updateSettings,
    applyHistoricalMultipliers,
    ensureMonthlySettings
  };
}

/**
 * 과거 기록 뷰어를 위한 Hook
 * 읽기 전용, 과거 설정값 표시
 */
export function useHistoricalView(supabaseClient, year, month) {
  const [settings, setSettings] = useState(null);
  const [multiplier, setMultiplier] = useState(1.0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistoricalSettings = async () => {
      try {
        setLoading(true);
        const service = new MonthlySettingsService(supabaseClient);
        const monthSettings = await service.getMonthlySettings(year, month);
        
        if (monthSettings) {
          setSettings(monthSettings);
          setMultiplier(monthSettings.multiplier || 1.0);
        }
      } catch (error) {
        console.error('과거 설정 로드 실패:', error);
        setMultiplier(1.0); // 기본값
      } finally {
        setLoading(false);
      }
    };

    if (year && month && supabaseClient) {
      loadHistoricalSettings();
    }
  }, [supabaseClient, year, month]);

  return {
    settings,
    multiplier,
    loading,
    isHistorical: true, // 과거 데이터임을 표시
    readOnly: true // 읽기 전용
  };
}

// 월별 설정 차이를 표시하는 컴포넌트를 위한 유틸리티
export function getSettingsDiff(prevSettings, currentSettings) {
  if (!prevSettings || !currentSettings) return null;

  const prevMultiplier = prevSettings.multiplier || 1.0;
  const currentMultiplier = currentSettings.multiplier || 1.0;
  
  return {
    multiplierChanged: prevMultiplier !== currentMultiplier,
    multiplierDiff: currentMultiplier - prevMultiplier,
    multiplierChangePercent: ((currentMultiplier - prevMultiplier) / prevMultiplier * 100).toFixed(1)
  };
}

// 날짜를 년월로 변환하는 유틸리티
export function dateToYearMonth(date) {
  const d = new Date(date);
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1
  };
}

// 년월을 문자열로 포맷팅
export function formatYearMonth(year, month) {
  return `${year}년 ${month}월`;
}
