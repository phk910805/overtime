import { useContext } from 'react';
import { useOvertimeContext as useLocalStorageContext } from './context';
import { useOvertimeContext as useSupabaseContext } from './context_supabase';

// Context가 어떤 Provider에서 왔는지 감지하는 Universal Hook
export const useOvertimeContext = () => {
  let context = null;
  let contextType = null;

  // Supabase Context 시도
  try {
    context = useSupabaseContext();
    if (context && context.hasOwnProperty('useSupabase')) {
      contextType = 'supabase';
    }
  } catch (error) {
    // Supabase Context가 없으면 무시
  }

  // LocalStorage Context 시도 (Supabase Context가 없을 때)
  if (!context) {
    try {
      context = useLocalStorageContext();
      contextType = 'localStorage';
    } catch (error) {
      // LocalStorage Context도 없으면 오류
    }
  }

  if (!context) {
    throw new Error('useOvertimeContext must be used within OvertimeProvider or SupabaseOvertimeProvider');
  }

  return {
    ...context,
    contextType
  };
};
