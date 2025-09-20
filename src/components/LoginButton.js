/**
 * LoginButton Component
 * 비로그인 상태에서 표시되는 로그인 버튼
 */

import React from 'react';
import { LogIn } from 'lucide-react';

const LoginButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <LogIn className="w-4 h-4" />
      <span className="text-sm font-medium">로그인</span>
    </button>
  );
};

export default LoginButton;
