import React, { useState, useCallback, memo } from 'react';
import { Bell } from 'lucide-react';

const NOTIFICATION_TYPES = [
  { key: 'time_submitted', label: '시간 기록 제출', description: '구성원이 시간 기록을 제출했을 때' },
  { key: 'time_approved', label: '시간 기록 승인', description: '제출한 시간 기록이 승인되었을 때' },
  { key: 'time_rejected', label: '시간 기록 반려', description: '제출한 시간 기록이 반려되었을 때' },
  { key: 'join_approved', label: '가입 승인', description: '회사 가입 신청이 승인되었을 때' },
  { key: 'join_rejected', label: '가입 거절', description: '회사 가입 신청이 거절되었을 때' },
];

const STORAGE_KEY = 'notification_preferences';

const getPreferences = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  // 기본값: 모두 true
  const defaults = {};
  NOTIFICATION_TYPES.forEach(t => { defaults[t.key] = true; });
  return defaults;
};

const SettingsNotifications = memo(() => {
  const [prefs, setPrefs] = useState(getPreferences);

  const handleToggle = useCallback((key) => {
    setPrefs(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">알림 설정</h3>
      <p className="text-sm text-gray-500 mb-6">받고 싶은 알림 유형을 선택하세요.</p>

      <div className="space-y-3">
        {NOTIFICATION_TYPES.map(type => (
          <div key={type.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Bell className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-900">{type.label}</div>
                <div className="text-xs text-gray-500">{type.description}</div>
              </div>
            </div>
            <button
              onClick={() => handleToggle(type.key)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                prefs[type.key] ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  prefs[type.key] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});

export default SettingsNotifications;
