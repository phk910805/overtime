/**
 * AuthApp.js
 * 인증 기능이 통합된 메인 애플리케이션
 * 기존 App.js를 래핑하여 인증 상태에 따라 로그인 폼 또는 메인 앱을 표시
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import AuthWrapper from './components/AuthWrapper';
import { OvertimeProvider } from './context';
import App from './App';

// 로딩 컴포넌트
const LoadingScreen = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">시스템 초기화 중...</p>
    </div>
  </div>
);

// 인증이 통합된 메인 앱
const AuthenticatedApp = () => {
  const { loading, initialized } = useAuth();

  // 인증 시스템 초기화 중
  if (loading || !initialized) {
    return <LoadingScreen />;
  }

  // 인증 래퍼로 기존 앱을 감싸기
  return (
    <AuthWrapper>
      <OvertimeProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<App />} />
          <Route path="/records" element={<App />} />
          <Route path="/records/:tab" element={<App />} />
          <Route path="/employees" element={<App />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </OvertimeProvider>
    </AuthWrapper>
  );
};

// 최종 루트 컴포넌트
const AuthApp = () => {
  return <AuthenticatedApp />;
};

export default AuthApp;
