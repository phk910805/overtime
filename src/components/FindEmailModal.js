/**
 * FindEmailModal.js
 * 이메일 찾기 모달 (마스킹된 힌트 제공)
 */

import React, { useState } from 'react';
import { Mail, X, AlertCircle, Search, HelpCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const FindEmailModal = ({ show, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    businessNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  if (!show) return null;

  // 이메일 마스킹 함수
  const maskEmail = (email) => {
    if (!email) return '';
    
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return email;
    
    // 첫 글자만 보여주고 나머지는 ***
    const maskedLocal = localPart[0] + '***';
    return `${maskedLocal}@${domain}`;
  };

  // 사업자등록번호 포맷팅
  const formatBusinessNumber = (value) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    if (cleanValue.length <= 3) return cleanValue;
    if (cleanValue.length <= 5) return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3)}`;
    return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3, 5)}-${cleanValue.slice(5, 10)}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let newValue = value;
    
    if (name === 'businessNumber') {
      newValue = formatBusinessNumber(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    if (error) setError('');
    if (result) setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 입력 검증
    if (!formData.fullName.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }
    if (!formData.companyName.trim()) {
      setError('회사명을 입력해주세요.');
      return;
    }
    if (!formData.businessNumber.trim()) {
      setError('사업자등록번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // profiles 테이블에서 일치하는 계정 검색
      const cleanBusinessNumber = formData.businessNumber.replace(/[^0-9]/g, '');
      
      const { data, error: queryError } = await supabase
        .from('profiles')
        .select('email')
        .eq('full_name', formData.fullName.trim())
        .eq('company_name', formData.companyName.trim())
        .eq('business_number', cleanBusinessNumber)
        .single();

      if (queryError || !data) {
        setError('입력하신 정보와 일치하는 계정을 찾을 수 없습니다.');
        setResult(null);
      } else {
        setResult({
          maskedEmail: maskEmail(data.email),
          found: true
        });
        setError('');
      }
    } catch (error) {
      console.error('Find email error:', error);
      setError('계정 정보를 조회하는 중 오류가 발생했습니다.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      fullName: '',
      companyName: '',
      businessNumber: ''
    });
    setError('');
    setResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">이메일 찾기</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="p-6">
          {!result ? (
            <>
              <p className="text-sm text-gray-600 mb-4">
                가입 시 입력한 정보를 입력해주세요.<br />
                일치하는 계정의 이메일 힌트를 제공해드립니다.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 이름 */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    이름
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="홍길동"
                    disabled={loading}
                  />
                </div>

                {/* 회사명 */}
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                    회사명
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="회사명을 입력하세요"
                    disabled={loading}
                  />
                </div>

                {/* 사업자등록번호 */}
                <div>
                  <label htmlFor="businessNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    사업자등록번호
                  </label>
                  <input
                    id="businessNumber"
                    name="businessNumber"
                    type="text"
                    value={formData.businessNumber}
                    onChange={handleInputChange}
                    maxLength="12"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="000-00-00000"
                    disabled={loading}
                  />
                </div>

                {/* 에러 메시지 */}
                {error && (
                  <div className="flex items-start space-x-2 text-red-600 text-sm p-3 bg-red-50 rounded-md">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* 버튼 */}
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    disabled={loading}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        검색 중...
                      </div>
                    ) : (
                      <>
                        <Search className="w-4 h-4 inline-block mr-2" />
                        이메일 찾기
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <Mail className="w-16 h-16 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                이메일을 찾았습니다
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                가입하신 이메일 주소 힌트입니다:
              </p>
              
              {/* 마스킹된 이메일 표시 */}
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="text-2xl font-mono font-bold text-blue-600">
                  {result.maskedEmail}
                </div>
              </div>

              {/* 안내 메시지 */}
              <div className="bg-yellow-50 p-3 rounded-md mb-4 text-left">
                <div className="flex items-start space-x-2">
                  <HelpCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-700">
                    <p className="font-medium mb-1">이메일이 기억나지 않으시나요?</p>
                    <p className="text-xs text-gray-600">
                      정확한 이메일 주소가 기억나지 않으시면<br />
                      고객센터로 문의해주세요.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                확인
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindEmailModal;
