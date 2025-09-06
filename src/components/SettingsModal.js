import React, { useState, useEffect, useCallback, memo } from 'react';
import { validators } from '../utils';
import { useOvertimeContext } from '../context';

// ========== MODAL COMPONENTS ==========
const Modal = memo(({ show, onClose, title, size = 'md', children }) => {
  if (!show) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-lg p-6 w-full ${sizeClasses[size]}`}>
        {title && (
          <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        )}
        {children}
      </div>
    </div>
  );
});

const Toast = memo(({ message, show, onClose, type = 'success' }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className={`${bgColor} text-white px-4 py-2 rounded-md shadow-lg`}>
        {message}
      </div>
    </div>
  );
});

// ========== SETTINGS MODAL ==========
const SettingsModal = memo(({ show, onClose }) => {
  const { multiplier: contextMultiplier, updateSettings } = useOvertimeContext();
  const [multiplier, setMultiplier] = useState('1.0');
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // 자주 사용하는 배수 프리셋
  const presets = [
    { value: '1.0', label: '1.0배 (기본)' },
    { value: '1.2', label: '1.2배' },
    { value: '1.5', label: '1.5배' },
    { value: '2.0', label: '2.0배' }
  ];

  // 모달이 열릴 때 현재 설정 로드
  useEffect(() => {
    if (show) {
      setMultiplier(contextMultiplier?.toString() || '1.0');
      setError('');
    }
  }, [show, contextMultiplier]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast({ show: false, message: '', type: 'success' });
  }, []);

  const handleMultiplierChange = useCallback((e) => {
    const value = e.target.value;
    setMultiplier(value);
    setError('');
  }, []);

  const handlePresetClick = useCallback((presetValue) => {
    setMultiplier(presetValue);
    setError('');
  }, []);

  const validateMultiplier = useCallback((value) => {
    const validation = validators.multiplier(value);
    if (!validation.isValid) {
      setError(validation.message);
      return false;
    }
    setError('');
    return true;
  }, []);

  const handleSave = useCallback(async () => {
    if (!validateMultiplier(multiplier)) {
      return;
    }

    try {
      const multiplierValue = parseFloat(multiplier);
      await updateSettings({ multiplier: multiplierValue });
      showToast('설정이 저장되었습니다');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('설정 저장 실패:', error);
      showToast('설정 저장에 실패했습니다', 'error');
    }
  }, [multiplier, validateMultiplier, updateSettings, showToast, onClose]);

  const handleReset = useCallback(() => {
    setMultiplier('1.0');
    setError('');
  }, []);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const getCurrentMultiplierDisplay = useCallback(() => {
    const value = parseFloat(multiplier);
    return isNaN(value) ? '1.0배' : `${value}배`;
  }, [multiplier]);

  const getExampleCalculation = useCallback(() => {
    const value = parseFloat(multiplier);
    if (isNaN(value)) return '예: 초과근무 10시간 × 1.0배 = 잔여시간 10시간';
    return `예: 초과근무 10시간 × ${value}배 = 잔여시간 ${(10 * value).toFixed(1)}시간`;
  }, [multiplier]);

  if (!show) return null;

  return (
    <>
      <Toast 
        message={toast.message} 
        show={toast.show} 
        onClose={hideToast}
        type={toast.type}
      />
      <Modal show={show} onClose={onClose} title="설정" size="lg">
        <div className="space-y-6">
          {/* 배수 설정 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              잔여시간 계산 배수
            </label>
            <input
              type="text"
              value={multiplier}
              onChange={handleMultiplierChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="예: 1.5"
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* 프리셋 버튼들 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              자주 사용하는 배수
            </label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetClick(preset.value)}
                  className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                    multiplier === preset.value
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* 현재 설정 미리보기 */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="text-sm text-blue-800">
              <div className="font-medium mb-1">현재 설정: {getCurrentMultiplierDisplay()}</div>
              <div className="text-xs text-blue-600">
                {getExampleCalculation()}
              </div>
            </div>
          </div>

          {/* 설명 */}
          <div className="mt-4 text-sm text-gray-600">
            <p className="mb-2">
              <strong>배수 적용 방법:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>초과근무 시간에 배수를 곱하여 잔여시간을 계산합니다</li>
              <li>예: 초과근무 10시간 × 1.5배 = 잔여시간 15시간</li>
              <li>휴가사용 시간에는 배수가 적용되지 않습니다</li>
              <li>잔여시간 = (초과시간 × 배수) - 사용시간</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-between mt-8 pt-4 border-t">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            기본값으로 재설정
          </button>
          <div className="flex space-x-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              저장
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
});

export default SettingsModal;
