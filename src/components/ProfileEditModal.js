/**
 * ProfileEditModal Component
 * 사용자 프로필 편집 모달
 */

import React, { useState, useEffect } from 'react';
import { User, Mail, Save, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getAuthService } from '../services/authService';
import PasswordField from './PasswordField';
import { Toast } from './CommonUI';

const ProfileEditModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // 비밀번호 검증 관련 상태
  const [currentPasswordVerified, setCurrentPasswordVerified] = useState(false);
  const [passwordVerifying, setPasswordVerifying] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // 초기값 저장 (변경사항 감지용)
  const [initialData, setInitialData] = useState({
    fullName: '',
    email: ''
  });
  
  const authService = getAuthService();

  // Toast 헬퍼 함수
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: 'success' });
  };

  // 사용자 정보 로드
  useEffect(() => {
    if (user && isOpen) {
      const userData = {
        fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        email: user.email || ''
      };
      
      setFormData(prev => ({
        ...prev,
        ...userData
      }));
      
      // 초기값 저장
      setInitialData(userData);
    }
  }, [user, isOpen]);

  // 모달이 닫힐 때 폼 초기화
  useEffect(() => {
    if (!isOpen) {
      hideToast();
      setCurrentPasswordVerified(false);
      setPasswordVerifying(false);
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
    // 입력 시 토스트 메시지 클리어
    if (toast.show) hideToast();
    
    // 현재 비밀번호가 변경되면 검증 상태 초기화
    if (name === 'currentPassword' && currentPasswordVerified) {
      setCurrentPasswordVerified(false);
    }
  };

  // 현재 비밀번호 검증
  const verifyCurrentPassword = async () => {
    if (!formData.currentPassword) {
      showToast('현재 비밀번호를 입력해주세요.', 'error');
      return;
    }

    setPasswordVerifying(true);
    hideToast();

    try {
      const isValid = await authService.verifyCurrentPassword(formData.currentPassword);
      
      if (isValid) {
        setCurrentPasswordVerified(true);
        showToast('현재 비밀번호가 확인되었습니다.', 'success');
      } else {
        showToast('비밀번호를 정확히 입력해 주세요.', 'error');
        setCurrentPasswordVerified(false);
      }
    } catch (error) {
      showToast('비밀번호 검증 중 오류가 발생했습니다.', 'error');
      setCurrentPasswordVerified(false);
    } finally {
      setPasswordVerifying(false);
    }
  };

  // 현재 비밀번호 필드에서 Enter 키 처리
  const handleCurrentPasswordKeyPress = (e) => {
    if (e.key === 'Enter' && formData.currentPassword && !currentPasswordVerified) {
      e.preventDefault();
      verifyCurrentPassword();
    }
  };

  // 변경사항 감지 함수
  const hasChanges = () => {
    // 이름은 변경 불가능하므로 제외
    
    // 비밀번호 변경 확인 (현재 비밀번호 검증되고 새 비밀번호 있음)
    const passwordChanged = currentPasswordVerified && formData.newPassword;
    
    return passwordChanged;
  };
  
  // 폼 유효성 검사
  const validateForm = () => {
    // 이름은 변경 불가능하므로 검증 제외

    // 비밀번호 변경을 시도하는 경우에만 비밀번호 검증
    const isPasswordChangeAttempt = currentPasswordVerified && (formData.newPassword || formData.confirmPassword);
    
    if (isPasswordChangeAttempt) {
      if (!formData.newPassword) {
        showToast('새 비밀번호를 입력해주세요.', 'error');
        return false;
      }
      if (formData.newPassword.length < 6) {
        showToast('새 비밀번호는 6자리 이상이어야 합니다.', 'error');
        return false;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        showToast('새 비밀번호가 일치하지 않습니다.', 'error');
        return false;
      }
      // TODO: 새 비밀번호가 기존과 동일한지 검증 (추후 구현)
      // if (formData.newPassword === 기존비밀번호) {
      //   showToast('새 비밀번호는 기존 비밀번호와 달라야 합니다.', 'error');
      //   return false;
      // }
    }

    return true;
  };

  // 저장 처리
  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    hideToast();

    try {
      // 비밀번호 변경이 있는 경우에만 처리
      const isPasswordChange = currentPasswordVerified && formData.newPassword;
      if (isPasswordChange) {
        const result = await authService.updatePassword(formData.newPassword);
        if (!result.success) {
          showToast(result.error || '비밀번호 변경에 실패했습니다.', 'error');
          return;
        }
        
        showToast('비밀번호가 성공적으로 변경되었습니다.', 'success');
        
        // 비밀번호 필드 초기화
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        setCurrentPasswordVerified(false);

        // 2초 후 모달 닫기
        setTimeout(() => {
          onClose();
        }, 2000);
      }

    } catch (error) {
      console.error('프로필 업데이트 에러:', error);
      showToast('프로필 업데이트에 실패했습니다.', 'error');
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름
              </label>
              <div className="relative">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  readOnly
                  tabIndex={-1}
                  className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none focus:ring-0 focus:border-gray-300"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
              <p className="text-xs text-gray-500 mt-1">이름은 변경할 수 없습니다.</p>
            </div>

            {/* 이메일 (읽기 전용) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  readOnly
                  tabIndex={-1}
                  className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none focus:ring-0 focus:border-gray-300"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
              <p className="text-xs text-gray-500 mt-1">이메일은 변경할 수 없습니다.</p>
            </div>

            {/* 구분선 */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">비밀번호 변경하기</h4>
              
              {/* 현재 비밀번호 */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  현재 비밀번호
                </label>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <PasswordField
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      onKeyPress={handleCurrentPasswordKeyPress}
                      placeholder=""
                      disabled={currentPasswordVerified}
                      autoComplete="new-password"
                    />
                  </div>
                  {!currentPasswordVerified && formData.currentPassword && (
                    <button
                      type="button"
                      onClick={verifyCurrentPassword}
                      disabled={passwordVerifying}
                      className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {passwordVerifying ? '확인 중...' : '확인'}
                    </button>
                  )}
                  {currentPasswordVerified && (
                    <div className="flex items-center px-3 py-2 bg-green-50 text-green-600 text-sm rounded-md">
                      ✓ 확인됨
                    </div>
                  )}
                </div>
                
                {/* 비밀번호 찾기 버튼 */}
                <button
                  type="button"
                  onClick={() => alert('비밀번호 찾기 기능은 추후 개발됩니다.')}
                  className="text-xs text-blue-600 hover:text-blue-700 mt-2 underline"
                >
                  비밀번호 찾기
                </button>
              </div>

              {/* 새 비밀번호 필드들 (조건부 노출) */}
              {currentPasswordVerified && (
                <>
                  {/* 새 비밀번호 */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      새 비밀번호
                    </label>
                    <PasswordField
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder="새 비밀번호 (6자리 이상)"
                      autoComplete="new-password"
                    />
                  </div>

                  {/* 새 비밀번호 확인 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      새 비밀번호 확인
                    </label>
                    <PasswordField
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="새 비밀번호 재입력"
                      autoComplete="new-password"
                    />
                  </div>
                </>
              )}
            </div>

            {/* 버튼 영역 */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={!hasChanges() || loading}
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
      
      {/* Toast */}
      <Toast 
        message={toast.message} 
        show={toast.show} 
        onClose={hideToast}
        type={toast.type}
        duration={3000}
        position="bottom-center"
      />
    </div>
  );
};

export default ProfileEditModal;
