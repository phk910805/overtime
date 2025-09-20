/**
 * ProfileEditModal Component
 * 사용자 프로필 편집 모달
 */

import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Save, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const ProfileEditModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
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
    if (user && isOpen) {
      setFormData(prev => ({
        ...prev,
        fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        email: user.email || ''
      }));
    }
  }, [user, isOpen]);

  // 모달이 닫힐 때 폼 초기화
  useEffect(() => {
    if (!isOpen) {
      setError('');
      setMessage('');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    }
  }, [isOpen]);

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

      // 2초 후 모달 닫기
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('프로필 업데이트 에러:', error);
      setError('프로필 업데이트에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 모달이 열려있지 않으면 렌더링하지 않음
  if (!isOpen) return null;

  // 사용자 이니셜 생성
  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 배경 오버레이 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* 모달 컨텐츠 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">프로필 편집</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* 프로필 아바타 */}
          <div className="flex flex-col items-center py-6 border-b border-gray-200">
            <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-semibold mb-3">
              {getInitials(formData.fullName)}
            </div>
            <h3 className="text-lg font-medium text-gray-900">{formData.fullName}</h3>
            <p className="text-sm text-gray-500">{formData.email}</p>
          </div>

          {/* 편집 폼 */}
          <form onSubmit={handleSave} className="p-6 space-y-4">
            {/* 이름 */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                이름
              </label>
              <div className="relative">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="이름을 입력하세요"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* 이메일 (읽기 전용) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  readOnly
                  className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
              <p className="text-xs text-gray-500 mt-1">이메일은 변경할 수 없습니다.</p>
            </div>

            {/* 구분선 */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">비밀번호 변경 (선택사항)</h4>
              
              {/* 현재 비밀번호 */}
              <div className="mb-3">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  현재 비밀번호
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="현재 비밀번호"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* 새 비밀번호 */}
              <div className="mb-3">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  새 비밀번호
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="새 비밀번호 (6자리 이상)"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* 비밀번호 확인 */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  새 비밀번호 확인
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="새 비밀번호 재입력"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>
            </div>

            {/* 메시지 영역 */}
            {error && (
              <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-md">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md">
                {message}
              </div>
            )}

            {/* 버튼 영역 */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>저장</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={onClose}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>취소</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;
