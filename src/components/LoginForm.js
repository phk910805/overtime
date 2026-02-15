/**
 * Login Component
 * 기본 로그인/회원가입 폼
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Clock, Mail, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ForgotPasswordModal from './ForgotPasswordModal';
import FindEmailModal from './FindEmailModal';

const LoginForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = location.pathname !== '/signup';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showFindEmail, setShowFindEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { signIn, signUp, loading } = useAuth();

  // pathname 변경 시 폼 초기화
  useEffect(() => {
    setFormData({ email: '', password: '', confirmPassword: '', fullName: '' });
    setError('');
    setMessage('');
  }, [location.pathname]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 입력 시 에러 메시지 클리어
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return false;
    }

    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        setError('비밀번호가 일치하지 않습니다.');
        return false;
      }
      if (formData.password.length < 6) {
        setError('비밀번호는 6자리 이상이어야 합니다.');
        return false;
      }
      if (!formData.fullName.trim()) {
        setError('이름을 입력해주세요.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setError('');
    setMessage('');

    try {
      if (isLogin) {
        await signIn(formData.email, formData.password);
        // 로그인 성공 시 pendingInviteToken 확인 → 초대 수락 페이지로 이동
        const pendingToken = sessionStorage.getItem('pendingInviteToken');
        if (pendingToken) {
          navigate(`/invite/${pendingToken}`, { replace: true });
          return;
        }
        // 그 외 자동으로 AuthContext에서 처리됨
      } else {
        await signUp(formData.email, formData.password, {
          full_name: formData.fullName
        });
        setMessage('회원가입이 완료되었습니다. 이메일을 확인해주세요.');
        // 회원가입 성공 → 로그인 페이지로 이동
        navigate('/login', { replace: true });
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message || '로그인에 실패했습니다.');
    }
  };

  const toggleMode = () => {
    navigate(isLogin ? '/signup' : '/login', { replace: true });
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Clock className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            초과 근무시간 관리
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin ? '로그인하여 시작하세요' : '새 계정을 만들어보세요'}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {!isLogin && (
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    이름
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="홍길동"
                    />
                    <User className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  이메일
                </label>
                <div className="mt-1 relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="user@example.com"
                  />
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  비밀번호
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="appearance-none block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder={isLogin ? "비밀번호" : "6자리 이상 입력"}
                  />
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    비밀번호 확인
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="appearance-none block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="비밀번호 재입력"
                    />
                    <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* 에러 메시지 */}
              {error && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              {/* 성공 메시지 */}
              {message && (
                <div className="text-green-600 text-sm text-center">
                  {message}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      처리 중...
                    </div>
                  ) : (
                    isLogin ? '로그인' : '회원가입'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 space-y-3">
              {/* 로그인/회원가입 전환 */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
                </button>
              </div>

              {/* 이메일/비밀번호 찾기 (로그인 화면에서만 표시) */}
              {isLogin && (
                <div className="text-center text-sm text-gray-600 space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-blue-600 hover:underline"
                  >
                    비밀번호 찾기
                  </button>
                  <span className="text-gray-400">·</span>
                  <button
                    type="button"
                    onClick={() => setShowFindEmail(true)}
                    className="text-blue-600 hover:underline"
                  >
                    이메일 찾기
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 비밀번호 재설정 모달 */}
      <ForgotPasswordModal 
        show={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />

      {/* 이메일 찾기 모달 */}
      <FindEmailModal
        show={showFindEmail}
        onClose={() => setShowFindEmail(false)}
      />
    </>
  );
};

export default LoginForm;
