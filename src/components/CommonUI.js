import React, { memo, useCallback, useEffect, useState } from 'react';
import { ChevronUp, ChevronDown, CheckCircle, XCircle, AlertTriangle, Info, Loader } from 'lucide-react';

// ========== BASIC COMPONENTS ==========
export const Modal = memo(({ show, onClose, title, size = 'md', children }) => {
  if (!show) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div className={`bg-white rounded-lg p-6 w-full ${sizeClasses[size]}`}>
        {title && (
          <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        )}
        {children}
      </div>
    </div>
  );
});

export const InputField = memo(({ 
  label, 
  value, 
  onChange, 
  onBlur,
  error, 
  type = "text", 
  placeholder, 
  className = "",
  autoFocus = false,
  ...rest 
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-300' : 'border-gray-300'
        }`}
        {...rest}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

// ========== TABLE COMPONENTS ==========
export const TableHeader = memo(({ children, className = "" }) => {
  return (
    <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
});

export const SortableHeader = memo(({ field, sortConfig, onSort, children, className = "" }) => {
  const getSortIcon = () => {
    if (sortConfig.field === field) {
      return sortConfig.direction === 'desc' ? 
        <ChevronDown className="w-4 h-4" /> : 
        <ChevronUp className="w-4 h-4" />;
    }
    return <ChevronDown className="w-4 h-4 text-gray-300" />;
  };

  return (
    <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
      <button
        onClick={() => onSort(field)}
        className="flex items-center space-x-1 hover:text-gray-700"
      >
        <span>{children}</span>
        {getSortIcon()}
      </button>
    </th>
  );
});

export const EmptyState = memo(({ message, colSpan }) => {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-8 text-center text-gray-500">
        {message}
      </td>
    </tr>
  );
});

// ========== ENHANCED TOAST COMPONENT ==========
export const Toast = memo(({ message, show, onClose, type = 'success', duration = 3000, position = 'bottom-center' }) => {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [show, onClose, duration]);

  if (!show) return null;

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-500',
          icon: <CheckCircle className="w-5 h-5" />,
          textColor: 'text-white'
        };
      case 'error':
        return {
          bgColor: 'bg-red-500',
          icon: <XCircle className="w-5 h-5" />,
          textColor: 'text-white'
        };
      case 'warning':
        return {
          bgColor: 'bg-orange-500',
          icon: <AlertTriangle className="w-5 h-5" />,
          textColor: 'text-white'
        };
      case 'info':
        return {
          bgColor: 'bg-blue-500',
          icon: <Info className="w-5 h-5" />,
          textColor: 'text-white'
        };
      default:
        return {
          bgColor: 'bg-gray-500',
          icon: <Info className="w-5 h-5" />,
          textColor: 'text-white'
        };
    }
  };

  const getPositionClass = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default: // top-center
        return 'top-4 left-1/2 transform -translate-x-1/2';
    }
  };

  const config = getToastConfig();

  return (
    <div className={`fixed ${getPositionClass()} z-50 animate-in slide-in-from-top-2 duration-300`}>
      <div className={`${config.bgColor} ${config.textColor} px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 min-w-[300px] max-w-[500px]`}>
        {config.icon}
        <span className="flex-1 text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
          title="닫기"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

// ========== LOADING COMPONENTS ==========
export const LoadingSpinner = memo(({ size = 'md', color = 'blue' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    red: 'text-red-500',
    gray: 'text-gray-500',
    white: 'text-white'
  };

  return (
    <Loader className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`} />
  );
});

export const LoadingOverlay = memo(({ show, message = '로딩 중...' }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4 min-w-[200px]">
        <LoadingSpinner size="lg" />
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
});

// ========== PROGRESS BAR ==========
export const ProgressBar = memo(({ progress, showPercent = true, color = 'blue', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500'
  };

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full">
      <div className={`w-full ${sizeClasses[size]} bg-gray-200 rounded-full overflow-hidden`}>
        <div
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showPercent && (
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">진행률</span>
          <span className="text-xs font-medium text-gray-700">{Math.round(clampedProgress)}%</span>
        </div>
      )}
    </div>
  );
});

// ========== ENHANCED CONFIRM MODAL ==========
export const ConfirmModal = memo(({ 
  show, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "확인", 
  cancelText = "취소", 
  type = 'danger', // danger, warning, info, success
  showIcon = true,
  loading = false
}) => {
  const getModalConfig = () => {
    switch (type) {
      case 'danger':
        return {
          confirmColor: 'bg-red-600 hover:bg-red-700',
          icon: <XCircle className="w-8 h-8 text-red-500" />,
          borderColor: 'border-red-200'
        };
      case 'warning':
        return {
          confirmColor: 'bg-orange-600 hover:bg-orange-700',
          icon: <AlertTriangle className="w-8 h-8 text-orange-500" />,
          borderColor: 'border-orange-200'
        };
      case 'info':
        return {
          confirmColor: 'bg-blue-600 hover:bg-blue-700',
          icon: <Info className="w-8 h-8 text-blue-500" />,
          borderColor: 'border-blue-200'
        };
      case 'success':
        return {
          confirmColor: 'bg-green-600 hover:bg-green-700',
          icon: <CheckCircle className="w-8 h-8 text-green-500" />,
          borderColor: 'border-green-200'
        };
      default:
        return {
          confirmColor: 'bg-gray-600 hover:bg-gray-700',
          icon: <Info className="w-8 h-8 text-gray-500" />,
          borderColor: 'border-gray-200'
        };
    }
  };

  const config = getModalConfig();

  return (
    <Modal show={show} onClose={!loading ? onClose : undefined} title={title}>
      <div className={`mb-6 ${showIcon ? 'flex items-start space-x-4' : ''}`}>
        {showIcon && (
          <div className={`flex-shrink-0 p-2 rounded-full bg-gray-50 border ${config.borderColor}`}>
            {config.icon}
          </div>
        )}
        <div className="flex-1">
          {typeof message === 'string' ? (
            <p className="text-sm text-gray-600">{message}</p>
          ) : (
            message
          )}
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-2 text-white rounded-md ${config.confirmColor} disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2`}
        >
          {loading && <LoadingSpinner size="sm" color="white" />}
          <span>{confirmText}</span>
        </button>
      </div>
    </Modal>
  );
});

// ========== PAGINATION COMPONENT ==========
export const Pagination = memo(({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems }) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // 현재 페이지 그룹 계산 (1-5, 6-10, 11-15...)
  const currentGroup = Math.ceil(currentPage / 5);
  const startPage = (currentGroup - 1) * 5 + 1;
  
  // 항상 5개의 페이지 번호 표시 (1,2,3,4,5 또는 6,7,8,9,10 등)
  const getPageNumbers = useCallback(() => {
    const pages = [];
    for (let i = 0; i < 5; i++) {
      const pageNumber = startPage + i;
      pages.push({
        number: pageNumber,
        isActive: pageNumber <= totalPages,
        isCurrent: pageNumber === currentPage
      });
    }
    return pages;
  }, [startPage, totalPages, currentPage]);

  // 버튼 활성화 상태 - 그룹 단위 이동
  const isFirstGroup = currentGroup === 1; // 1페이지가 포함된 그룹인지
  const isLastGroup = startPage + 4 >= totalPages; // 마지막 페이지가 포함된 그룹인지
  const canGoToPrevGroup = currentGroup > 1;
  const canGoToNextGroup = !isLastGroup;
  const canGoToFirstGroup = !isFirstGroup;
  const canGoToLastGroup = !isLastGroup;

  // 네비게이션 핸들러 - 그룹 단위 이동
  const goToFirstGroup = useCallback(() => {
    if (canGoToFirstGroup) {
      onPageChange(1); // 첫 번째 그룹의 첫 페이지로
    }
  }, [canGoToFirstGroup, onPageChange]);

  const goToPrevGroup = useCallback(() => {
    if (canGoToPrevGroup) {
      const prevGroupStart = (currentGroup - 2) * 5 + 1;
      const prevGroupEnd = Math.min(prevGroupStart + 4, totalPages);
      onPageChange(prevGroupEnd); // 이전 그룹의 마지막 페이지로
    }
  }, [canGoToPrevGroup, currentGroup, onPageChange, totalPages]);

  const goToNextGroup = useCallback(() => {
    if (canGoToNextGroup) {
      const nextGroupStart = currentGroup * 5 + 1;
      onPageChange(nextGroupStart);
    }
  }, [canGoToNextGroup, currentGroup, onPageChange]);

  const goToLastGroup = useCallback(() => {
    if (canGoToLastGroup) {
      // 마지막 그룹의 첫 페이지 계산
      const lastGroupNumber = Math.ceil(totalPages / 5);
      const lastGroupStart = (lastGroupNumber - 1) * 5 + 1;
      onPageChange(lastGroupStart);
    }
  }, [canGoToLastGroup, totalPages, onPageChange]);

  const handlePageClick = useCallback((pageNumber, isActive) => {
    if (isActive && pageNumber !== currentPage) {
      onPageChange(pageNumber);
    }
  }, [currentPage, onPageChange]);

  if (totalItems === 0) return null;

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-200" style={{minHeight: '60px'}}>
      <div className="flex-1 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">
            총 <span className="font-medium">{totalItems}</span>개 중{' '}
            <span className="font-medium">{startItem}</span>-<span className="font-medium">{endItem}</span>개 표시
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {/* 첫 번째 그룹으로 */}
          <button
            onClick={goToFirstGroup}
            disabled={!canGoToFirstGroup}
            className={`px-2 py-1 text-sm transition-colors ${
              canGoToFirstGroup
                ? 'text-gray-400 hover:text-gray-600 cursor-pointer'
                : 'text-gray-300 cursor-not-allowed'
            }`}
            title="첫 번째 그룹 (1-5페이지)"
          >
            &lt;&lt;
          </button>
          
          {/* 이전 그룹 */}
          <button
            onClick={goToPrevGroup}
            disabled={!canGoToPrevGroup}
            className={`px-2 py-1 text-sm transition-colors ${
              canGoToPrevGroup
                ? 'text-gray-400 hover:text-gray-600 cursor-pointer'
                : 'text-gray-300 cursor-not-allowed'
            }`}
            title={
              canGoToPrevGroup 
                ? `이전 그룹 (${(currentGroup - 2) * 5 + 1}-${(currentGroup - 2) * 5 + 5}페이지)`
                : '이전 그룹'
            }
          >
            &lt;
          </button>
          
          {/* 페이지 번호들 - 항상 5개 표시 */}
          <div className="flex items-center space-x-1 min-w-[200px] justify-center">
            {getPageNumbers().map((page) => (
              <button
                key={page.number}
                onClick={() => handlePageClick(page.number, page.isActive)}
                disabled={!page.isActive}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  page.isCurrent
                    ? 'bg-blue-100 text-blue-600 font-medium cursor-default'
                    : page.isActive
                      ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 cursor-pointer'
                      : 'text-gray-300 cursor-not-allowed'
                }`}
                title={!page.isActive ? '존재하지 않는 페이지' : `${page.number}페이지로 이동`}
              >
                {page.number}
              </button>
            ))}
          </div>
          
          {/* 다음 그룹 */}
          <button
            onClick={goToNextGroup}
            disabled={!canGoToNextGroup}
            className={`px-2 py-1 text-sm transition-colors ${
              canGoToNextGroup
                ? 'text-gray-400 hover:text-gray-600 cursor-pointer'
                : 'text-gray-300 cursor-not-allowed'
            }`}
            title={
              canGoToNextGroup 
                ? `다음 그룹 (${currentGroup * 5 + 1}-${currentGroup * 5 + 5}페이지)`
                : '다음 그룹'
            }
          >
            &gt;
          </button>
          
          {/* 마지막 그룹으로 */}
          <button
            onClick={goToLastGroup}
            disabled={!canGoToLastGroup}
            className={`px-2 py-1 text-sm transition-colors ${
              canGoToLastGroup
                ? 'text-gray-400 hover:text-gray-600 cursor-pointer'
                : 'text-gray-300 cursor-not-allowed'
            }`}
            title={
              canGoToLastGroup 
                ? `마지막 그룹 (${Math.ceil(totalPages / 5) * 5 - 4}-${totalPages}페이지)`
                : '마지막 그룹'
            }
          >
            &gt;&gt;
          </button>
        </div>
      </div>
    </div>
  );
});
