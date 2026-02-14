import React, { memo } from 'react';
import { Building2, FileText } from 'lucide-react';

const SettingsCompany = memo(({ profileData }) => {
  const formatBusinessNumber = (number) => {
    if (!number) return '';
    const cleanNumber = number.replace(/[^0-9]/g, '');
    if (cleanNumber.length === 10) {
      return `${cleanNumber.slice(0, 3)}-${cleanNumber.slice(3, 5)}-${cleanNumber.slice(5)}`;
    }
    return number;
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">회사 정보</h3>

      <div className="space-y-4">
        {/* 회사명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">회사명</label>
          <div className="relative">
            <input
              type="text"
              value={profileData?.companyName || ''}
              readOnly
              tabIndex={-1}
              className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>
        </div>

        {/* 사업자등록번호 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">사업자등록번호</label>
          <div className="relative">
            <input
              type="text"
              value={formatBusinessNumber(profileData?.businessNumber || '')}
              readOnly
              tabIndex={-1}
              className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>
        </div>

        {/* 안내 문구 */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
          <p className="text-sm text-gray-600">
            회사 정보 변경이 필요한 경우 관리자에게 문의해주세요.
          </p>
        </div>
      </div>
    </div>
  );
});

export default SettingsCompany;
