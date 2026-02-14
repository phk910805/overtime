/**
 * 인증 래퍼 컴포넌트
 * 리다이렉트 기반 가드 — 모든 라우트를 감싸며 인증/회사 상태에 따라 Navigate
 */

import React, { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDataService } from '../services/dataService';

// 공개 경로 (인증 불필요)
const PUBLIC_PATHS = ['/login', '/signup'];

// 회사 설정 경로 (인증 필요, 회사 불필요)
const SETUP_PATHS = ['/setup', '/setup/register', '/setup/join'];

const AuthWrapper = ({ children }) => {
  const { user, loading, initialized } = useAuth();
  const location = useLocation();

  // 회사 설정 상태
  const [companyChecked, setCompanyChecked] = useState(false);
  const [hasCompany, setHasCompany] = useState(false);

  // URL에서 비밀번호 재설정 경로 판별
  const isResetPassword = location.pathname === '/reset-password'
    || location.hash.includes('reset-password')
    || location.hash.includes('access_token');

  const isPublicPath = PUBLIC_PATHS.includes(location.pathname);
  const isSetupPath = SETUP_PATHS.includes(location.pathname);

  // 로그인 후 회사 정보 확인
  useEffect(() => {
    const checkCompany = async () => {
      if (!user) {
        setCompanyChecked(false);
        setHasCompany(false);
        return;
      }

      // StorageAdapter 초기화 대기 (최대 3번 재시도)
      let retries = 3;
      let delay = 500;

      while (retries > 0) {
        try {
          const dataService = getDataService();
          const company = await dataService.getMyCompany();

          setHasCompany(!!company);
          setCompanyChecked(true);
          return;
        } catch (error) {
          if (error.message?.includes('not initialized') && retries >= 1) {
            console.log(`StorageAdapter 초기화 대기 중... (재시도 ${4 - retries}/3)`);
            // eslint-disable-next-line no-loop-func
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
            retries--;
          } else {
            console.error('회사 정보 확인 실패:', error);
            setHasCompany(false);
            setCompanyChecked(true);
            return;
          }
        }
      }
    };

    checkCompany();
  }, [user]);

  // 1. 로딩/초기화 중 → 스피너
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

  // 2. 비밀번호 재설정 → 그대로 통과
  if (isResetPassword) {
    return <>{children}</>;
  }

  // 3. 미로그인 + 공개 경로 → 그대로 통과
  if (!user && isPublicPath) {
    return <>{children}</>;
  }

  // 4. 미로그인 + 비공개 경로 → /login으로 리다이렉트
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 5. 로그인 + 공개 경로 → 회사 유무에 따라 리다이렉트
  if (user && isPublicPath) {
    if (!companyChecked) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">회사 정보 확인 중...</p>
          </div>
        </div>
      );
    }
    return <Navigate to={hasCompany ? '/dashboard' : '/setup'} replace />;
  }

  // 6. 로그인 + 회사 체크 중 → 스피너
  if (!companyChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">회사 정보 확인 중...</p>
        </div>
      </div>
    );
  }

  // 7. 로그인 + 회사 없음 + 설정 경로 → 그대로 통과
  if (!hasCompany && isSetupPath) {
    return <>{children}</>;
  }

  // 8. 로그인 + 회사 없음 + 기타 경로 → /setup으로 리다이렉트
  if (!hasCompany) {
    return <Navigate to="/setup" replace />;
  }

  // 9. 로그인 + 회사 있음 + 설정 경로 → /dashboard로 리다이렉트
  if (hasCompany && isSetupPath) {
    return <Navigate to="/dashboard" replace />;
  }

  // 10. 로그인 + 회사 있음 + 기타 경로 → 그대로 통과
  return <>{children}</>;
};

export default AuthWrapper;
