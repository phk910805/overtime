/**
 * 인증 래퍼 컴포넌트
 * 리다이렉트 기반 가드 — 모든 라우트를 감싸며 인증/회사 상태에 따라 Navigate
 */

import React, { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDataService } from '../services/dataService';
import { getAuthService } from '../services/authService';

// 공개 경로 (인증 불필요)
const PUBLIC_PATHS = ['/login', '/signup', '/', '/terms', '/privacy'];

// 회사 설정 경로 (인증 필요, 회사 불필요)
const SETUP_PATHS = ['/setup', '/setup/register'];

const AuthWrapper = ({ children }) => {
  const { user, loading, initialized } = useAuth();
  const location = useLocation();

  // 회사 설정 상태
  const [companyChecked, setCompanyChecked] = useState(false);
  const [hasCompany, setHasCompany] = useState(false);
  const [membershipPending, setMembershipPending] = useState(false);

  // URL에서 비밀번호 재설정 경로 판별
  const isResetPassword = location.pathname === '/reset-password'
    || location.hash.includes('reset-password')
    || location.hash.includes('access_token');

  const isPublicPath = PUBLIC_PATHS.includes(location.pathname);
  const isSetupPath = SETUP_PATHS.includes(location.pathname);
  const isInvitePath = location.pathname.startsWith('/invite/');
  const isAlwaysAccessible = ['/terms', '/privacy'].includes(location.pathname);
  const isPendingPath = location.pathname === '/pending';

  // 로그인 후 회사 정보 + 멤버십 상태 확인
  useEffect(() => {
    const checkCompany = async () => {
      if (!user) {
        setCompanyChecked(false);
        setHasCompany(false);
        setMembershipPending(false);
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

          // authService에서 membership_status 확인 (DB에서 이미 로드됨)
          const authService = getAuthService();
          setMembershipPending(authService.isPending());

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
            setMembershipPending(false);
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

  // 2.5. 초대 링크 경로 → 항상 통과 (InviteAccept가 자체 인증 처리)
  if (isInvitePath) {
    return <>{children}</>;
  }

  // 2.6. 이용약관/개인정보처리방침 → 로그인 여부 무관하게 항상 통과
  if (isAlwaysAccessible) {
    return <>{children}</>;
  }

  // 3. 미로그인 + 공개 경로 → 그대로 통과
  if (!user && isPublicPath) {
    return <>{children}</>;
  }

  // 4. 미로그인 + 비공개 경로 → /로 리다이렉트 (랜딩 페이지)
  if (!user) {
    return <Navigate to="/" replace />;
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
    if (hasCompany && membershipPending) {
      return <Navigate to="/pending" replace />;
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

  // 6.5. 로그인 + 회사 있음 + pending 상태 → /pending으로
  if (hasCompany && membershipPending) {
    if (isPendingPath) {
      return <>{children}</>;
    }
    return <Navigate to="/pending" replace />;
  }

  // 6.6. /pending 경로인데 pending이 아님 → /dashboard로
  if (isPendingPath && !membershipPending) {
    return <Navigate to="/dashboard" replace />;
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
