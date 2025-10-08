/**
 * 인증 래퍼 컴포넌트
 * 로그인 상태 및 URL 라우팅에 따라 적절한 화면 표시
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import LoginForm from './LoginForm';
import ResetPasswordPage from './ResetPasswordPage';

const AuthWrapper = ({ children }) => {
  const { user, loading, initialized, signIn, signUp } = useAuth();
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('login');

  // URL 변경 감지
  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      
      // /reset-password 또는 hash에 reset-password나 access_token이 있는 경우
      if (path.includes('reset-password') || hash.includes('reset-password') || hash.includes('access_token')) {
        setCurrentRoute('reset-password');
      } else {
        setCurrentRoute('login');
      }
    };

    checkRoute();
    
    // URL 변경 감지
    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);
    
    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
    };
  }, []);

  // 로그인 처리
  const handleLogin = async (email, password) => {
    setAuthLoading(true);
    setAuthError('');
    
    try {
      const result = await signIn(email, password);
      
      if (!result.success) {
        setAuthError(result.error || '로그인에 실패했습니다');
      }
    } catch (error) {
      setAuthError('로그인 중 오류가 발생했습니다');
      console.error('Login error:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  // 회원가입 처리
  const handleSignUp = async (email, password, userData) => {
    setAuthLoading(true);
    setAuthError('');
    
    try {
      const result = await signUp(email, password, userData);
      
      if (result.success) {
        // 회원가입 성공 시 안내 메시지
        setAuthError(''); // 에러 초기화
        alert('회원가입이 완료되었습니다. 이메일 인증 후 로그인해주세요.');
      } else {
        setAuthError(result.error || '회원가입에 실패했습니다');
      }
    } catch (error) {
      setAuthError('회원가입 중 오류가 발생했습니다');
      console.error('Sign up error:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  // 비밀번호 재설정 완료 후 처리
  const handleResetComplete = () => {
    setCurrentRoute('login');
    // URL 정리
    window.history.pushState({}, '', '/overtime/');
  };

  // 로딩 중
  if (loading || !initialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 비밀번호 재설정 페이지 (로그인 여부 무관)
  if (currentRoute === 'reset-password') {
    return <ResetPasswordPage onComplete={handleResetComplete} />;
  }

  // 로그인되지 않은 상태
  if (!user) {
    return (
      <LoginForm
        onLogin={handleLogin}
        onSignUp={handleSignUp}
        loading={authLoading}
        error={authError}
      />
    );
  }

  // 로그인된 상태 - 기존 앱 표시
  return (
    <>
      {children}
    </>
  );
};

export default AuthWrapper;
