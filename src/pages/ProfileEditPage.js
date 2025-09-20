/**
 * ProfileEditPage Component
 * 사용자 프로필 편집 페이지
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Lock, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProfileEditPage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // 사용자 정보 로드
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  // 입력 처리
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 입력 시 메시지 클리어
    if (error) setError('');
    if (message) setMessage('');
  };

  // 폼 유효성 검사
  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('이름을 입력해주세요.');
      return false;
    }

    // 비밀번호 변경 시 유효성 검사
    if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        setError('현재 비밀번호를 입력해주세요.');
        return false;
      }
      if (!formData.newPassword) {
        setError('새 비밀번호를 입력해주세요.');
        return false;
      }
      if (formData.newPassword.length < 6) {
        setError('새 비밀번호는 6자리 이상이어야 합니다.');
        return false;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError('새 비밀번호가 일치하지 않습니다.');
        return false;
      }
    }

    return true;
  };

  // 저장 처리
  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // TODO: 실제 프로필 업데이트 API 호출
      // 현재는 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage('프로필이 성공적으로 업데이트되었습니다.');
      
      // 비밀번호 필드 초기화
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

    } catch (error) {
      console.error('프로필 업데이트 에러:', error);
      setError('프로필 업데이트에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 뒤로가기
  const handleGoBack = () => {
    navigate(-1);
  };

  // 취소 (홈으로)
  const handleCancel = () => {
    navigate('/');
  };

  // 로그인되지 않은 경우 리다이렉트
  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGoBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">뒤로가기</span>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">프로필 편집</h1>
            </div>
            
            <button
              onClick={signOut}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {/* 프로필 아바타 영역 */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-semibold mb-4">
              {formData.fullName ? formData.fullName[0].toUpperCase() : 'U'}
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{formData.fullName}</h2>
            <p className="text-gray-500">{formData.email}</p>
          </div>

          {/* 편집 폼 */}
          <form onSubmit={handleSave} className="space-y-6">
            {/* 이름 */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                이름
              </label>
              <div className="relative">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="이름을 입력하세요"
                />
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* 이메일 (읽기 전용) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  readOnly
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              </div>
              <p className="text-xs text-gray-500 mt-1">이메일은 변경할 수 없습니다.</p>
            </div>

            {/* 구분선 */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">비밀번호 변경</h3>
              
              {/* 현재 비밀번호 */}
              <div className="mb-4">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  현재 비밀번호
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="현재 비밀번호"
                  />
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
              </div>

              {/* 새 비밀번호 */}
              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  새 비밀번호
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="새 비밀번호 (6자리 이상)"
                  />
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
              </div>

              {/* 비밀번호 확인 */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  새 비밀번호 확인
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="새 비밀번호 재입력"
                  />
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
              </div>
            </div>

            {/* 메시지 영역 */}
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            {message && (
              <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                {message}
              </div>
            )}

            {/* 버튼 영역 */}
            <div className="flex space-x-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>저장하기</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="w-5 h-5" />
                <span>취소</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProfileEditPage;
