import React, { memo, useCallback } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

// ========== COMMON UI COMPONENTS ==========
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

export const ConfirmModal = memo(({ 
  show, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "확인", 
  cancelText = "취소", 
  confirmColor = "bg-red-600 hover:bg-red-700" 
}) => {
  return (
    <Modal show={show} onClose={onClose} title={title}>
      <div className="mb-6">
        {typeof message === 'string' ? (
          <p className="text-sm text-gray-600">{message}</p>
        ) : (
          message
        )}
      </div>
      <div className="flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 text-white rounded-md ${confirmColor}`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
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

// ========== PAGINATION COMPONENT ==========
export const Pagination = memo(({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems }) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // 현재 페이지 그룹 계산 (1-5, 6-10, 11-15...)
  const currentGroup = Math.ceil(currentPage / 5);
  const startPage = (currentGroup - 1) * 5 + 1;
  const endPage = Math.min(startPage + 4, totalPages);
  
  // 페이지 번호 배열 생성
  const getPageNumbers = useCallback(() => {
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }, [startPage, endPage]);

  // 버튼 활성화 상태
  const canGoToPrevGroup = currentGroup > 1;
  const canGoToNextGroup = currentGroup < Math.ceil(totalPages / 5);
  const canGoToFirst = currentPage > 1;
  const canGoToLast = currentPage < totalPages;

  // 네비게이션 핸들러
  const goToFirstPage = useCallback(() => {
    onPageChange(1);
  }, [onPageChange]);

  const goToLastPage = useCallback(() => {
    onPageChange(totalPages);
  }, [onPageChange, totalPages]);

  const goToPrevGroup = useCallback(() => {
    if (canGoToPrevGroup) {
      const prevGroupStart = (currentGroup - 2) * 5 + 1;
      onPageChange(prevGroupStart);
    }
  }, [canGoToPrevGroup, currentGroup, onPageChange]);

  const goToNextGroup = useCallback(() => {
    if (canGoToNextGroup) {
      const nextGroupStart = currentGroup * 5 + 1;
      onPageChange(Math.min(nextGroupStart, totalPages));
    }
  }, [canGoToNextGroup, currentGroup, totalPages, onPageChange]);

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
          {/* 처음으로 */}
          <button
            onClick={goToFirstPage}
            disabled={!canGoToFirst}
            className="px-2 py-1 text-sm text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            title="처음으로"
          >
            &lt;&lt;
          </button>
          
          {/* 이전 그룹 */}
          <button
            onClick={goToPrevGroup}
            disabled={!canGoToPrevGroup}
            className="px-2 py-1 text-sm text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            title="이전 5개"
          >
            &lt;
          </button>
          
          {/* 페이지 번호들 */}
          <div className="flex items-center space-x-1 min-w-[200px] justify-center">
            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 text-sm rounded ${
                  page === currentPage
                    ? 'bg-blue-100 text-blue-600 font-medium'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          
          {/* 다음 그룹 */}
          <button
            onClick={goToNextGroup}
            disabled={!canGoToNextGroup}
            className="px-2 py-1 text-sm text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            title="다음 5개"
          >
            &gt;
          </button>
          
          {/* 마지막으로 */}
          <button
            onClick={goToLastPage}
            disabled={!canGoToLast}
            className="px-2 py-1 text-sm text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            title="마지막으로"
          >
            &gt;&gt;
          </button>
        </div>
      </div>
    </div>
  );
});
