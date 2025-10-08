/**
 * ResetPasswordPage.js
 * 비밀번호 재설정 페이지 (이메일 링크에서 접근)
 */

import React, { useState, useEffect } from 'react';
import { Clock, Lock, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ResetPasswordPage = ({ onComplete }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 컴포넌트 마운트 시 세션 확인
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('세션 확인 실패:', error);
        setIsValidToken(false);
        setError('유효하지 않은 재설정 링크입니다. 다시 시도해주세요.');
        return;
      }

      if (!session) {
        setIsValidToken(false);
        setError('재설정 링크가 만료되었습니다. 다시 요청해주세요.');
        return;
      }

      console.log('✅ 유효한 재설정 토큰');
      setIsValidToken(true);
    } catch (error) {
      console.error('세션 확인 중 오류:', error);
      setIsValidToken(false);
      setError('오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const validatePassword = () => {
    if (!newPassword || !confirmPassword) {
      setError('비밀번호를 입력해주세요.');
      return false;
    }

    if (newPassword.length < 6) {
      setError('비밀번호는 6자리 이상이어야 합니다.');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return false;
    }

    // 비밀번호 강도 체크 (선택사항)
    const hasNumber = /\d/.test(newPassword);
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    
    if (!hasNumber || !hasLetter) {
      setError('비밀번호는 영문과 숫자를 포함해야 합니다.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) return;

    setLoading(true);
    setError('');

    try {
      // Supabase의 updateUser로 비밀번호 변경
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        let koreanError = error.message;
        
        if (error.message.includes('New password should be different from the old password')) {
          koreanError = '새 비밀번호는 기존 비밀번호와 달라야 합니다.';
        } else if (error.message.includes('Password should be at least')) {
          koreanError = '비밀번호는 6자리 이상이어야 합니다.';
        } else if (error.message.includes('same as the old password')) {
          koreanError = '기존 비밀번호와 동일합니다. 다른 비밀번호를 입력해주세요.';
        }
        
        throw new Error(koreanError);
      }

      console.log('✅ 비밀번호 재설정 성공');
      setSuccess(true);

      // 3초 후 로그인 화면으로 이동
      setTimeout(() => {
        // 세션 종료 후 로그인 화면으로
        supabase.auth.signOut().then(() => {
          if (onComplete) {
            onComplete();
          } else {
            window.location.href = '/';
          }
        });
      }, 3000);

    } catch (error) {
      console.error('❌ 비밀번호 재설정 실패:', error);
      setError(error.message || '비밀번호 재설정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    if (onComplete) {
      onComplete();
    } else {
      window.location.href = '/';
    }
  };

  // 토큰 확인 중
  if (isValidToken === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">재설정 링크 확인 중...</p>
        </div>
      </div>
    );
  }

  // 유효하지 않은 토큰
  if (isValidToken === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Clock className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            초과 근무시간 관리
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                재설정 링크 오류
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {error || '유효하지 않거나 만료된 링크입니다.'}
              </p>
              <button
                onClick={handleGoToLogin}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                로그인 화면으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 성공 화면
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Clock className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            초과 근무시간 관리
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                비밀번호가 재설정되었습니다
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                새로운 비밀번호로 로그인해주세요.<br />
                <span className="text-xs text-gray-500 mt-2 block">
                  (3초 후 자동으로 로그인 화면으로 이동합니다)
                </span>
              </p>
              <button
                onClick={handleGoToLogin}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                로그인하러 가기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 비밀번호 재설정 폼
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Clock className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          새 비밀번호 설정
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          안전한 비밀번호를 입력해주세요
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 새 비밀번호 */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                새 비밀번호
              </label>
              <div className="mt-1 relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError('');
                  }}
                  className="appearance-none block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="6자리 이상, 영문+숫자 포함"
                  disabled={loading}
                />
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                영문, 숫자를 포함하여 6자리 이상 입력해주세요
              </p>
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                비밀번호 확인
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  className="appearance-none block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="비밀번호 재입력"
                  disabled={loading}
                />
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="flex items-start space-x-2 text-red-600 text-sm p-3 bg-red-50 rounded-md">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 버튼 */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    변경 중...
                  </div>
                ) : (
                  '비밀번호 변경'
                )}
              </button>
              
              <button
                type="button"
                onClick={handleGoToLogin}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
                disabled={loading}
              >
                로그인 화면으로 돌아가기
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
