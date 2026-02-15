import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { getDataService } from '../services/dataService';
import { useAuth } from '../hooks/useAuth';

/**
 * 회사 설정 화면
 * - 새 회사 등록 전용 (기존 회사 참여는 초대 링크로)
 * URL: /setup, /setup/register
 */
const CompanySetup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signOut } = useAuth();

  // 새 회사 등록 폼 상태
  const [businessNumber, setBusinessNumber] = useState('');
  const [companyName, setCompanyName] = useState('');

  const handleLogout = async () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      await signOut();
    }
  };

  const formatBusinessNumber = (value) => {
    const numbers = value.replace(/[^\d]/g, '');
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

    if (!businessNumber || !companyName) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    const numbers = businessNumber.replace(/[^\d]/g, '');
    if (numbers.length !== 10) {
      setError('사업자번호는 10자리 숫자여야 합니다.');
      return;
    }

    setLoading(true);

    try {
      const dataService = getDataService();
      await dataService.createCompany(numbers, companyName);
      window.location.replace('/dashboard');
    } catch (err) {
      setError(err.message || '회사 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="flex justify-end mb-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">회사 등록</h2>
          <p className="text-gray-600 mb-6">
            회사 정보를 등록하고 시작하세요.<br />
            <span className="text-sm text-gray-500">
              초대 링크를 받으셨다면 링크를 통해 참여하세요.
            </span>
          </p>

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
};

export default CompanySetup;
