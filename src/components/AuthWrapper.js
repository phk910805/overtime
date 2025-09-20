/**
 * 인증 래퍼 컴포넌트
 * 로그인 상태에 따라 로그인 폼 또는 메인 앱을 표시
 */

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import LoginForm from './LoginForm';

const AuthWrapper = ({ children }) => {
  const { user, loading, initialized, signIn, signOut, signUp } = useAuth();
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

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
      
      {/* 사용자 정보 및 로그아웃 버튼 (임시) */}
      <div className="fixed top-4 right-4 bg-white shadow-md rounded-lg p-3 border">
        <div className="text-sm text-gray-600">
          로그인: {user.email}
        </div>
        <button
          onClick={signOut}
          className="mt-2 text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
        >
          로그아웃
        </button>
      </div>
    </>
  );
};

export default AuthWrapper;
