/**
 * Login Component
 * 기본 로그인/회원가입 폼
 */

import React, { useState } from 'react';
import { Clock, Mail, Lock, User, AlertCircle, Building, FileText } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const LoginForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    companyName: '',
    businessNumber: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const { signIn, signUp, loading } = useAuth();

  // 사업자등록번호 형식 검증 함수
  const validateBusinessNumber = (number) => {
    // 숫자만 추출
    const cleanNumber = number.replace(/[^0-9]/g, '');
    
    if (cleanNumber.length !== 10) {
      return false;
    }

    // 체크섬 검증 (간단한 알고리즘)
    const digits = cleanNumber.split('').map(Number);
    const checksum = digits[9];
    
    // 가중치: 1,3,7,1,3,7,1,3,5
    const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];
    let sum = 0;
    
    for (let i = 0; i < 9; i++) {
      sum += digits[i] * weights[i];
    }
    
    const calculatedChecksum = (10 - (sum % 10)) % 10;
    return checksum === calculatedChecksum;
  };

  // 사업자등록번호 입력 포맷팅
  const formatBusinessNumber = (value) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    if (cleanValue.length <= 3) return cleanValue;
    if (cleanValue.length <= 5) return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3)}`;
    return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3, 5)}-${cleanValue.slice(5, 10)}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let newValue = value;
    
    // 사업자등록번호 자동 포맷팅
    if (name === 'businessNumber') {
      newValue = formatBusinessNumber(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
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
      if (!formData.companyName.trim()) {
        setError('회사명을 입력해주세요.');
        return false;
      }
      if (formData.companyName.length > 50) {
        setError('회사명은 50자 이내로 입력해주세요.');
        return false;
      }
      if (!formData.businessNumber.trim()) {
        setError('사업자등록번호를 입력해주세요.');
        return false;
      }
      if (!validateBusinessNumber(formData.businessNumber)) {
        setError('올바른 사업자등록번호를 입력해주세요.');
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
        // 로그인 성공 시 자동으로 AuthContext에서 처리됨
      } else {
        await signUp(formData.email, formData.password, {
          full_name: formData.fullName,
          company_name: formData.companyName,
          business_number: formData.businessNumber.replace(/[^0-9]/g, ''), // 숫자만 저장
          role: 'admin' // 관리자 권한 자동 부여
        });
        setMessage('회원가입이 완료되었습니다. 이메일을 확인해주세요.');
        setIsLogin(true); // 로그인 폼으로 전환
        setFormData({
          email: formData.email,
          password: '',
          confirmPassword: '',
          fullName: '',
          companyName: '',
          businessNumber: ''
        });
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message || '로그인에 실패했습니다.');
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setMessage('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      companyName: '',
      businessNumber: ''
    });
  };

  return (
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
              <>
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

                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    회사명
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      maxLength="50"
                      className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="회사명을 입력하세요"
                    />
                    <Building className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label htmlFor="businessNumber" className="block text-sm font-medium text-gray-700">
                    사업자등록번호
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="businessNumber"
                      name="businessNumber"
                      type="text"
                      value={formData.businessNumber}
                      onChange={handleInputChange}
                      maxLength="12"
                      className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="000-00-00000"
                    />
                    <FileText className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>
              </>
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
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={isLogin ? "비밀번호" : "6자리 이상 입력"}
                />
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
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
                    type="password"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="비밀번호 재입력"
                  />
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
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

            {/* 회원가입 안내 문구 */}
            {!isLogin && (
              <div className="text-xs text-gray-500 text-center">
                가입에 어려움이 있으신 경우 고객센터로 문의주세요.
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

          <div className="mt-6">
            <div className="text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;