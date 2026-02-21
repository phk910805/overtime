/**
 * useAuth Hook
 * 인증 상태 관리를 위한 React Hook
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getAuthService } from '../services/authService';

export function useAuth() {
  // useRef로 변경: 의존성 문제 해결 (성능 최적화)
  const authServiceRef = useRef(null);
  if (!authServiceRef.current) {
    authServiceRef.current = getAuthService();
  }
  const authService = authServiceRef.current;

  // authService 싱글톤에 이미 유저가 있으면 동기적으로 초기값 설정 (FOUC 방지)
  const [user, setUser] = useState(() => authService.currentUser || null);
  const [loading, setLoading] = useState(() => !authService.currentUser);
  const [initialized, setInitialized] = useState(() => !!authService.currentUser);

  // 초기 사용자 상태 확인
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      // authService에 이미 유저가 있으면 동기적으로 먼저 표시 (FOUC 방지)
      if (authService.currentUser) {
        if (isMounted) {
          setUser(authService.currentUser);
          setInitialized(true);
          setLoading(false);
        }
        // 프로필 역할이 아직 로드되지 않았으면 비동기로 로드 후 재렌더
        if (!authService._profileRole) {
          await authService._loadProfileRole(authService.currentUser.id);
          if (isMounted) {
            setUser({ ...authService.currentUser });
          }
        }
        return;
      }

      try {
        setLoading(true);

        // 현재 세션 확인
        await authService.getCurrentSession();
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // authService는 useRef로 안정적 - 의존성 불필요

  // 인증 상태 변경 리스너
  useEffect(() => {
    if (!initialized) return;

    const unsubscribe = authService.onAuthStateChange((event, newUser) => {
      // 중복 체크: 같은 사용자면 무시
      setUser(prevUser => {
        const prevUserId = prevUser?.id || prevUser?.email;
        const newUserId = newUser?.id || newUser?.email;
        
        if (prevUserId === newUserId) {
          console.log('🔄 Auth state: 같은 사용자, 업데이트 스킵');
          return prevUser;
        }
        
        console.log('🔄 Auth hook state change:', event, newUser?.email);
        setLoading(false);
        return newUser;
      });
    });

    return unsubscribe;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]); // authService는 useRef로 안정적 - 의존성 불필요

  // 회원가입
  const signUp = useCallback(async (email, password, userData) => {
    setLoading(true);
    try {
      const result = await authService.signUp(email, password, userData);
      if (!result.success) {
        throw new Error(result.error);
      }
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
      if (!result.success) {
        throw new Error(result.error);
      }
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
    isAdmin: authService.isAdmin(),           // owner + admin
    isOwner: authService.isOwner(),           // owner만
    isPlatformAdmin: authService.isPlatformAdmin(), // 마스터
    isManager: authService.isManager(),
    userRole: authService.getUserRole(),
    userPermission: authService.getPermission(),
    canInvite: authService.canInvite(),
    canEditSettings: authService.canEditSettings(),
    canEditOvertime: authService.canEditOvertime(),
    canEditEmployees: authService.canEditEmployees(),
    canManageEmployees: authService.canManageEmployees(),
    canManageTeam: authService.canManageTeam(),
    canSubmitOwnTime: authService.canSubmitOwnTime(),
    membershipStatus: authService.getMembershipStatus(),
    isPending: authService.isPending(),

    // 액션
    signUp,
    signIn,
    signOut
  };
}

export default useAuth;
