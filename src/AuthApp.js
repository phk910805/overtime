/**
 * AuthApp.js
 * 인증 기능이 통합된 메인 애플리케이션
 * 라우트 구조: 공개/회사설정/보호 라우트 분리
 */

import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import AuthWrapper from './components/AuthWrapper';
import { OvertimeProvider } from './context';
import App from './App';
import LoginForm from './components/LoginForm';
import ResetPasswordPage from './components/ResetPasswordPage';
import CompanySetup from './components/CompanySetup';
import SettingsPage from './components/SettingsPage';
import InviteAccept from './components/InviteAccept';
import PendingApproval from './components/PendingApproval';
import LandingPage from './pages/LandingPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';

// 로딩 컴포넌트
const LoadingScreen = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">시스템 초기화 중...</p>
    </div>
  </div>
);

// OvertimeProvider를 Layout Route로 — 보호된 라우트들이 동일 Provider 인스턴스 공유
const ProtectedLayout = () => (
  <OvertimeProvider>
    <Outlet />
  </OvertimeProvider>
);

// 인증이 통합된 메인 앱
const AuthenticatedApp = () => {
  const { loading, initialized } = useAuth();

  // 인증 시스템 초기화 중
  if (loading || !initialized) {
    return <LoadingScreen />;
  }

  return (
    <AuthWrapper>
      <Routes>
        {/* 공개 라우트 */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<LoginForm />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/invite/:token" element={<InviteAccept />} />

        {/* 승인 대기 라우트 (인증 필요, pending 상태) */}
        <Route path="/pending" element={<PendingApproval />} />

        {/* 회사 설정 라우트 (인증 필요, 회사 불필요) */}
        <Route path="/setup" element={<CompanySetup />} />
        <Route path="/setup/register" element={<CompanySetup />} />

        {/* 보호된 라우트 (인증 + 회사 필요, OvertimeProvider 공유) */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<App />} />
          <Route path="/records" element={<App />} />
          <Route path="/records/:tab" element={<App />} />
          <Route path="/approvals" element={<App />} />
          <Route path="/my-time" element={<App />} />
          <Route path="/employees" element={<App />} />
          <Route path="/more" element={<App />} />
          <Route path="/settings" element={<Navigate to="/settings/profile" replace />} />
          <Route path="/settings/:section" element={<SettingsPage />} />
        </Route>

        {/* 폴백 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthWrapper>
  );
};

// 최종 루트 컴포넌트
const AuthApp = () => {
  return <AuthenticatedApp />;
};

export default AuthApp;
