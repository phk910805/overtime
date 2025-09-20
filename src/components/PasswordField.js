/**
 * PasswordField Component
 * Eye 아이콘이 포함된 비밀번호 입력 필드
 */

import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

const PasswordField = ({
  id,
  name,
  value,
  onChange,
  onKeyPress,
  placeholder,
  className = '',
  disabled = false,
  required = false,
  autoComplete = 'current-password'
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        className={`w-full px-3 py-2 pl-9 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${className}`}
      />
      
      {/* Lock 아이콘 (좌측) */}
      <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
      
      {/* Eye 아이콘 (우측) */}
      <button
        type="button"
        onClick={togglePasswordVisibility}
        disabled={disabled}
        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
        tabIndex={-1}
      >
        {showPassword ? (
          <EyeOff className="w-4 h-4" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};

export default PasswordField;
