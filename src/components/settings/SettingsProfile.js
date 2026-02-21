import React, { useState, useEffect, useCallback, memo } from 'react';
import { Save, Lock } from 'lucide-react';
import { getAuthService } from '../../services/authService';
import { supabase } from '../../lib/supabase';
import PasswordField from '../PasswordField';
import { Toast } from '../CommonUI';

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: '', color: '' },
    { label: '매우 약함', color: 'bg-red-500' },
    { label: '약함', color: 'bg-orange-500' },
    { label: '보통', color: 'bg-yellow-500' },
    { label: '강함', color: 'bg-green-500' },
    { label: '매우 강함', color: 'bg-green-700' },
  ];
  return { score, ...levels[score] };
};

const PasswordStrengthBar = memo(({ password }) => {
  const strength = getPasswordStrength(password);
  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex space-x-1 mb-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i <= strength.score ? strength.color : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <span className="text-xs text-gray-500">{strength.label}</span>
    </div>
  );
});

const SettingsProfile = memo(({ profileData, user, onProfileUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [currentPasswordVerified, setCurrentPasswordVerified] = useState(false);
  const [passwordVerifying, setPasswordVerifying] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [nameSaving, setNameSaving] = useState(false);
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

  const getRoleDisplayName = useCallback((role, permission) => {
    if (role === 'owner') return '소유자';
    const roleName = role === 'admin' ? '관리자' : '구성원';
    if (permission && permission !== 'editor') {
      return `${roleName}(뷰어)`;
    }
    return `${roleName}(편집)`;
  }, []);

  // Reset password fields when component unmounts or profileData changes
  useEffect(() => {
    setCurrentPasswordVerified(false);
    setPasswordVerifying(false);
    setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setNameValue(profileData?.fullName || '');
    setEditingName(false);
  }, [profileData]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'currentPassword' && currentPasswordVerified) {
      setCurrentPasswordVerified(false);
    }
  }, [currentPasswordVerified]);

  // 이름 저장
  const handleSaveName = useCallback(async () => {
    const trimmed = nameValue.trim();
    if (!trimmed) {
      showToast('이름을 입력해주세요.', 'error');
      return;
    }
    if (trimmed === profileData?.fullName) {
      setEditingName(false);
      return;
    }
    setNameSaving(true);
    try {
      // Supabase Auth 메타데이터 업데이트
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: trimmed }
      });
      if (authError) throw authError;

      // profiles 테이블 업데이트
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ full_name: trimmed })
        .eq('id', user.id);
      if (dbError) throw dbError;

      showToast('이름이 변경되었습니다.');
      setEditingName(false);
      if (onProfileUpdate) onProfileUpdate();
    } catch (err) {
      console.error('이름 변경 실패:', err);
      showToast('이름 변경에 실패했습니다.', 'error');
    } finally {
      setNameSaving(false);
    }
  }, [nameValue, profileData, user, showToast, onProfileUpdate]);

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
      />
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">프로필 편집</h3>

        <div className="space-y-4">
          {/* 이름 (편집 가능) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
            {editingName ? (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') { setEditingName(false); setNameValue(profileData?.fullName || ''); }
                  }}
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  disabled={nameSaving}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {nameSaving ? '저장 중...' : '저장'}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditingName(false); setNameValue(profileData?.fullName || ''); }}
                  className="px-3 py-2 text-gray-600 border border-gray-300 text-sm rounded-md hover:bg-gray-50"
                >
                  취소
                </button>
              </div>
            ) : (
              <div
                onClick={() => setEditingName(true)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 cursor-pointer hover:bg-gray-50"
              >
                {profileData?.fullName || ''}
              </div>
            )}
          </div>

          {/* 이메일 (읽기전용) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-1">이메일 <Lock className="w-3 h-3 text-gray-400" /><span className="text-xs text-gray-400 font-normal">수정 불가</span></span>
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-1">권한 <Lock className="w-3 h-3 text-gray-400" /><span className="text-xs text-gray-400 font-normal">수정 불가</span></span>
            </label>
            <input
              type="text"
              value={getRoleDisplayName(profileData?.role, profileData?.permission)}
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
                  <PasswordStrengthBar password={formData.newPassword} />
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
