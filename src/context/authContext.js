/**
 * Authentication Context
 * 인증 상태를 전역으로 관리하는 컨텍스트
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAuthService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
  const authService = getAuthService();

  // 인증 서비스 초기화
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const success = await authService.initialize();
        
        if (success) {
          setUser(authService.getCurrentUser());
          setSession(authService.getCurrentSession());
        }
        
        setInitialized(true);
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Auth 상태 변경 리스너
  useEffect(() => {
    if (!initialized) return;

    const unsubscribe = authService.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user || null);
      
      // 로그인/로그아웃 시 로딩 상태 업데이트
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [initialized]);

  // 회원가입
  const signUp = useCallback(async (email, password, userData = {}) => {
    try {
      setLoading(true);
      const result = await authService.signUp(email, password, userData);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // 로그인
  const signIn = useCallback(async (email, password) => {
    try {
      setLoading(true);
      const result = await authService.signIn(email, password);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // 로그아웃
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await authService.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // 로그인 상태 확인
  const isAuthenticated = useCallback(() => {
    return authService.isAuthenticated();
  }, [user, session]);

  const value = {
    // 상태
    user,
    session,
    loading,
    initialized,
    
    // 메서드
    signUp,
    signIn,
    signOut,
    isAuthenticated,
    
    // 유틸리티
    isLoggedIn: !!user,
    userEmail: user?.email || null,
    userId: user?.id || null
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
