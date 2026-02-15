import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Building2, AlertCircle, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getDataService } from '../services/dataService';

/**
 * 초대 수락 페이지
 * /invite/:token
 * - 토큰 유효성 검증 → 회사명 표시
 * - 미로그인: 회원가입/로그인 버튼
 * - 로그인 + 회사 없음: 참여하기 버튼
 * - 로그인 + 회사 있음: 이미 소속 안내
 * - 무효/만료: 에러 안내
 */
const InviteAccept = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, initialized } = useAuth();

  const [validating, setValidating] = useState(true);
  const [inviteInfo, setInviteInfo] = useState(null);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [hasCompany, setHasCompany] = useState(false);
  const [companyChecked, setCompanyChecked] = useState(false);

  // 1. 토큰 유효성 검증
  useEffect(() => {
    const validate = async () => {
      if (!token) {
        setError('초대 토큰이 없습니다.');
        setValidating(false);
        return;
      }

      try {
        const dataService = getDataService();
        const result = await dataService.validateInviteToken(token);

        if (result.valid) {
          setInviteInfo(result);
        } else {
          setError(result.error || '유효하지 않거나 만료된 초대 링크입니다.');
        }
      } catch (err) {
        setError('초대 링크가 만료되었거나 유효하지 않습니다.');
      } finally {
        setValidating(false);
      }
    };

    validate();
  }, [token]);

  // 2. 로그인 상태라면 회사 소속 여부 확인
  useEffect(() => {
    const checkCompany = async () => {
      if (!user || !initialized) return;

      try {
        const dataService = getDataService();
        const company = await dataService.getMyCompany();
        setHasCompany(!!company);
      } catch {
        setHasCompany(false);
      } finally {
        setCompanyChecked(true);
      }
    };

    checkCompany();
  }, [user, initialized]);

  // 3. 로그인 후 자동 참여 (sessionStorage에서 토큰 확인)
  useEffect(() => {
    const autoJoin = async () => {
      if (!user || !initialized || !companyChecked || hasCompany) return;
      if (!inviteInfo?.valid) return;

      // sessionStorage에서 자동 참여 플래그 확인
      const pendingToken = sessionStorage.getItem('pendingInviteToken');
      if (pendingToken === token) {
        sessionStorage.removeItem('pendingInviteToken');
        await handleJoin();
      }
    };

    autoJoin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, initialized, companyChecked, hasCompany, inviteInfo]);

  const handleJoin = async () => {
    setJoining(true);
    setError('');

    try {
      const dataService = getDataService();
      await dataService.joinViaInvite(token);
      // 전체 리로드로 authService._membershipStatus 갱신
      window.location.replace('/pending');
    } catch (err) {
      setError(err.message || '참여 요청에 실패했습니다.');
      setJoining(false);
    }
  };

  const handleGoToSignup = () => {
    sessionStorage.setItem('pendingInviteToken', token);
    navigate('/signup');
  };

  const handleGoToLogin = () => {
    sessionStorage.setItem('pendingInviteToken', token);
    navigate('/login');
  };

  // 로딩 중
  if (validating || authLoading || !initialized || (user && !companyChecked)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">초대 링크 확인 중...</p>
        </div>
      </div>
    );
  }

  // 에러 (만료/무효)
  if (error && !inviteInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">초대 링크 오류</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            로그인 페이지로 이동
          </button>
        </div>
      </div>
    );
  }

  // 유효한 초대 — 미로그인
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {inviteInfo.company_name}
          </h2>
          <p className="text-gray-600 mb-6">
            에서 초대했습니다.<br />
            로그인 또는 회원가입 후 참여할 수 있습니다.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleGoToSignup}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4" />
              회원가입
            </button>
            <button
              onClick={handleGoToLogin}
              className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 py-2 px-4 rounded-md hover:bg-gray-50"
            >
              <LogIn className="w-4 h-4" />
              로그인
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center text-xs text-gray-500 gap-1">
            <Clock className="w-3 h-3" />
            <span>이 링크는 1시간 동안 유효합니다</span>
          </div>
        </div>
      </div>
    );
  }

  // 로그인 + 이미 회사 소속
  if (hasCompany) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">이미 회사에 소속되어 있습니다</h2>
          <p className="text-gray-600 mb-6">
            현재 계정은 이미 다른 회사에 소속되어 있어<br />
            초대를 수락할 수 없습니다.
          </p>
          <button
            onClick={() => navigate('/dashboard', { replace: true })}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            대시보드로 이동
          </button>
        </div>
      </div>
    );
  }

  // 로그인 + 회사 없음 — 참여하기
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {inviteInfo.company_name}
        </h2>
        <p className="text-gray-600 mb-6">
          에 참여하시겠습니까?<br />
          관리자의 승인 후 입장할 수 있습니다.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <button
          onClick={handleJoin}
          disabled={joining}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {joining ? '참여 요청 중...' : '참여하기'}
        </button>

        <div className="mt-6 flex items-center justify-center text-xs text-gray-500 gap-1">
          <Clock className="w-3 h-3" />
          <span>이 링크는 1시간 동안 유효합니다</span>
        </div>
      </div>
    </div>
  );
};

export default InviteAccept;
