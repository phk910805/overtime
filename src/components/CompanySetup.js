import React, { useState } from 'react';
import { Building2, Users, ArrowLeft, LogOut } from 'lucide-react';
import { getDataService } from '../services/dataService';
import { useAuth } from '../hooks/useAuth';

/**
 * 회사 설정 메인 화면
 * - 새 회사 등록
 * - 기존 회사 참여
 */
const CompanySetup = ({ onComplete }) => {
  const [step, setStep] = useState('choice'); // 'choice' | 'register' | 'join'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signOut } = useAuth();

  // 새 회사 등록 폼 상태
  const [businessNumber, setBusinessNumber] = useState('');
  const [companyName, setCompanyName] = useState('');

  // 기존 회사 참여 폼 상태
  const [inviteCode, setInviteCode] = useState('');
  const [email, setEmail] = useState('');

  const handleLogout = async () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      await signOut();
    }
  };

  const handleBack = () => {
    setStep('choice');
    setError('');
  };

  const formatBusinessNumber = (value) => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, '');
    
    // ###-##-##### 형식으로 포맷
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 5) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 10)}`;
    }
  };

  const handleBusinessNumberChange = (e) => {
    const formatted = formatBusinessNumber(e.target.value);
    setBusinessNumber(formatted);
  };

  const handleRegisterCompany = async () => {
    setError('');

    // 유효성 검사
    if (!businessNumber || !companyName) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    // 사업자번호 형식 검사
    const numbers = businessNumber.replace(/[^\d]/g, '');
    if (numbers.length !== 10) {
      setError('사업자번호는 10자리 숫자여야 합니다.');
      return;
    }

    setLoading(true);

    try {
      const dataService = getDataService();
      // 하이픈 제거하고 숫자만 전송
      const result = await dataService.createCompany(numbers, companyName);
      
      console.log('회사 등록 성공:', result);
      
      // 완료 콜백
      if (onComplete) {
        onComplete({ type: 'register', company: result });
      }
    } catch (err) {
      setError(err.message || '회사 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCompany = async () => {
    setError('');

    // 유효성 검사
    if (!inviteCode || !email) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const dataService = getDataService();
      
      // 1) 초대 코드 검증
      const validation = await dataService.validateInviteCode(inviteCode, email);
      
      // 2) 초대 코드 사용 (회사 참여)
      await dataService.useInviteCode(validation.inviteId);
      
      console.log('회사 참여 성공:', validation);
      
      // 완료 콜백
      if (onComplete) {
        onComplete({ type: 'join', company: validation });
      }
    } catch (err) {
      setError(err.message || '회사 참여에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 선택 화면
  if (step === 'choice') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* 로그아웃 버튼 */}
          <div className="flex justify-end mb-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">환영합니다!</h1>
            <p className="text-gray-600">회사 정보를 설정해주세요</p>
          </div>

          <div className="space-y-4">
            {/* 새 회사 등록 */}
            <button
              onClick={() => setStep('register')}
              className="w-full bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">새 회사 등록</h3>
                  <p className="text-sm text-gray-600">
                    처음 사용하시는 회사라면<br />
                    회사를 등록해주세요
                  </p>
                </div>
              </div>
            </button>

            {/* 기존 회사 참여 */}
            <button
              onClick={() => setStep('join')}
              className="w-full bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">기존 회사 참여</h3>
                  <p className="text-sm text-gray-600">
                    이미 등록된 회사에<br />
                    초대받으셨나요?
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 새 회사 등록 화면
  if (step === 'register') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              뒤로
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">새 회사 등록</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  사업자등록번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={businessNumber}
                  onChange={handleBusinessNumberChange}
                  placeholder="123-45-67890"
                  maxLength={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  하이픈(-) 포함해서 입력해주세요
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  회사명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="(주)테크스타트"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              onClick={handleRegisterCompany}
              disabled={loading}
              className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? '등록 중...' : '회사 등록하기'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 기존 회사 참여 화면
  if (step === 'join') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              뒤로
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">기존 회사 참여</h2>
            <p className="text-gray-600 mb-6">
              관리자가 발급한 초대 코드를 입력해주세요
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  초대받은 이메일 주소를 입력하세요
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  초대 코드 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="TECH2025"
                  maxLength={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-lg"
                />
                <p className="mt-1 text-xs text-gray-500">
                  대소문자 구분없이 입력하세요
                </p>
              </div>
            </div>

            <button
              onClick={handleJoinCompany}
              disabled={loading}
              className="w-full mt-6 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? '참여 중...' : '참여하기'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default CompanySetup;
