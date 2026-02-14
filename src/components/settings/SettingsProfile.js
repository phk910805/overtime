import React, { useState, useEffect, useCallback, memo } from 'react';
import { Save } from 'lucide-react';
import { getAuthService } from '../../services/authService';
import PasswordField from '../PasswordField';
import { Toast } from '../CommonUI';

const SettingsProfile = memo(({ profileData, user }) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [currentPasswordVerified, setCurrentPasswordVerified] = useState(false);
  const [passwordVerifying, setPasswordVerifying] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const authService = getAuthService();

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast({ show: false, message: '', type: 'success' });
  }, []);

  const getRoleDisplayName = useCallback((role) => {
    switch (role) {
      case 'operator': return '운영자';
      case 'admin': return '관리자';
      case 'employee': return '일반';
      default: return role || '일반';
    }
  }, []);

  // Reset password fields when component unmounts or profileData changes
  useEffect(() => {
    setCurrentPasswordVerified(false);
    setPasswordVerifying(false);
    setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  }, [profileData]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'currentPassword' && currentPasswordVerified) {
      setCurrentPasswordVerified(false);
    }
  }, [currentPasswordVerified]);

  const verifyCurrentPassword = useCallback(async () => {
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
    } catch (err) {
      showToast('비밀번호 검증 중 오류가 발생했습니다.', 'error');
      setCurrentPasswordVerified(false);
    } finally {
      setPasswordVerifying(false);
    }
  }, [formData.currentPassword, authService, showToast, hideToast]);

  const handleCurrentPasswordKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && formData.currentPassword && !currentPasswordVerified) {
      e.preventDefault();
      verifyCurrentPassword();
    }
  }, [formData.currentPassword, currentPasswordVerified, verifyCurrentPassword]);

  const handleSave = useCallback(async (e) => {
    e.preventDefault();

    if (!currentPasswordVerified || !formData.newPassword) return;

    if (formData.newPassword.length < 6) {
      showToast('새 비밀번호는 6자리 이상이어야 합니다.', 'error');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      showToast('새 비밀번호가 일치하지 않습니다.', 'error');
      return;
    }

    setLoading(true);
    hideToast();

    try {
      const result = await authService.updatePassword(formData.newPassword);
      if (!result.success) {
        showToast(result.error || '비밀번호 변경에 실패했습니다.', 'error');
        return;
      }

      showToast('비밀번호가 성공적으로 변경되었습니다.', 'success');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setCurrentPasswordVerified(false);
    } catch (err) {
      console.error('비밀번호 변경 에러:', err);
      showToast('비밀번호 변경에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPasswordVerified, formData, authService, showToast, hideToast]);

  const hasChanges = currentPasswordVerified && formData.newPassword;

  return (
    <>
      <Toast
        message={toast.message}
        show={toast.show}
        onClose={hideToast}
        type={toast.type}
        duration={3000}
        position="bottom-center"
      />
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">프로필 편집</h3>

        <div className="space-y-4">
          {/* 이름 (읽기전용) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
            <input
              type="text"
              value={profileData?.fullName || ''}
              readOnly
              tabIndex={-1}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* 이메일 (읽기전용) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
            <input
              type="text"
              value={profileData?.email || ''}
              readOnly
              tabIndex={-1}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* 권한 (읽기전용) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">권한</label>
            <input
              type="text"
              value={getRoleDisplayName(profileData?.role)}
              readOnly
              tabIndex={-1}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* 비밀번호 변경 섹션 */}
          <form onSubmit={handleSave} className="border-t border-gray-200 pt-4 mt-6">
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
                    확인됨
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => alert('비밀번호 찾기 기능은 추후 개발됩니다.')}
                className="text-xs text-blue-600 hover:text-blue-700 mt-2 underline"
              >
                비밀번호 찾기
              </button>
            </div>

            {/* 새 비밀번호 필드 (조건부) */}
            {currentPasswordVerified && (
              <>
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

                <div className="mb-3">
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

            {hasChanges && (
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>비밀번호 변경</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
});

export default SettingsProfile;
