/**
 * useAuth Hook
 * 인증 상태 관리를 위한 React Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { getAuthService } from '../services/authService';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const authService = getAuthService();

  // 초기 사용자 상태 확인
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // 현재 세션 확인
        const session = await authService.getCurrentSession();
        const currentUser = await authService.getCurrentUser();
        
        if (isMounted) {
          setUser(currentUser);
          setInitialized(true);
          setLoading(false);
        }

        console.log('🔐 Auth 초기화 완료:', currentUser?.email || '비로그인');

      } catch (error) {
        console.error('❌ Auth 초기화 실패:', error);
        if (isMounted) {
          setUser(null);
          setInitialized(true);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [authService]);

  // 인증 상태 변경 리스너
  useEffect(() => {
    if (!initialized) return;

    const unsubscribe = authService.onAuthStateChange((event, user) => {
      console.log('🔄 Auth hook state change:', event, user?.email);
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, [authService, initialized]);

  // 회원가입
  const signUp = useCallback(async (email, password, userData) => {
    setLoading(true);
    try {
      const result = await authService.signUp(email, password, userData);
      return result;
    } finally {
      setLoading(false);
    }
  }, [authService]);

  // 로그인
  const signIn = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const result = await authService.signIn(email, password);
      return result;
    } finally {
      setLoading(false);
    }
  }, [authService]);

  // 로그아웃
  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      const result = await authService.signOut();
      return result;
    } finally {
      setLoading(false);
    }
  }, [authService]);

  return {
    // 상태
    user,
    loading,
    initialized,
    isAuthenticated: !!user,
    
    // 권한 확인
    isAdmin: authService.isAdmin(),
    isManager: authService.isManager(),
    userRole: authService.getUserRole(),
    
    // 액션
    signUp,
    signIn,
    signOut
  };
}

export default useAuth;
