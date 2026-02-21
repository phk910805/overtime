import React, { useState, useMemo, useCallback, memo } from 'react';
import { ClipboardCheck, Clock, CheckCircle, XCircle, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOvertimeContext } from '../context';
import { useAuth } from '../hooks/useAuth';
import { Toast, Modal, Pagination } from './CommonUI';
import { timeUtils } from '../utils';
import { getDataService } from '../services/dataService';

const STATUS_CONFIG = {
  pending: { label: '대기', bgClass: 'bg-yellow-100', textClass: 'text-yellow-800', Icon: Clock },
  approved: { label: '승인', bgClass: 'bg-green-100', textClass: 'text-green-800', Icon: CheckCircle },
  rejected: { label: '반려', bgClass: 'bg-red-100', textClass: 'text-red-800', Icon: XCircle },
};

const StatusBadge = memo(({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const { label, bgClass, textClass, Icon } = config;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${bgClass} ${textClass}`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </span>
  );
});

const ITEMS_PER_PAGE = 10;
const FILTER_TABS = [
  { key: 'pending', label: '대기' },
  { key: 'all', label: '전체' },
  { key: 'approved', label: '승인됨' },
  { key: 'rejected', label: '반려됨' },
];

const ReviewModal = memo(({ record, action, onConfirm, onClose, isLoading }) => {
  const [reviewNote, setReviewNote] = useState('');

  const isApproval = action === 'approved';
  const actionLabel = isApproval ? '승인' : '반려';
  const typeLabel = record.recordType === 'overtime' ? '초과근무' : '휴가';

  const handleConfirm = useCallback(() => {
    onConfirm(record.id, record.recordType, action, reviewNote.trim());
  }, [onConfirm, record.id, record.recordType, action, reviewNote]);

  return (
    <Modal show={true} onClose={!isLoading ? onClose : undefined} title={`시간 기록 ${actionLabel}`}>
      <div className="space-y-4">
        {/* Record summary */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">직원</span>
            <span className="font-medium text-gray-900">{record.employeeName || '알 수 없음'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">날짜</span>
            <span className="font-medium text-gray-900">{record.date}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">유형</span>
            <span className="font-medium text-gray-900">{typeLabel}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">시간</span>
            <span className="font-medium text-gray-900">{timeUtils.formatTime(record.totalMinutes)}</span>
          </div>
          {record.submitReason && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">제출 사유</span>
              <span className="font-medium text-gray-900 text-right max-w-[200px]">{record.submitReason}</span>
            </div>
          )}
        </div>

        {/* Review note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            리뷰 노트 <span className="text-gray-400">(선택)</span>
          </label>
          <textarea
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            placeholder={isApproval ? '승인 사유를 입력하세요...' : '반려 사유를 입력하세요...'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            disabled={isLoading}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-white rounded-md disabled:opacity-50 flex items-center space-x-2 ${
              isApproval
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{actionLabel}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
});

const ApprovalManagement = memo(() => {
  const { overtimeRecords, vacationRecords, reviewTimeRecord, approvalMode } = useOvertimeContext();
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewModal, setReviewModal] = useState(null); // { record, action }
  const [isReviewing, setIsReviewing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Merge overtime + vacation records, tag with recordType
  const allSubmittedRecords = useMemo(() => {
    const tagged = [
      ...overtimeRecords.map(r => ({ ...r, recordType: 'overtime' })),
      ...vacationRecords.map(r => ({ ...r, recordType: 'vacation' })),
    ];

    // Only show records that were submitted by employees (not admin direct input)
    return tagged.filter(r => r.submittedBy || r.status === 'pending' || r.status === 'rejected');
  }, [overtimeRecords, vacationRecords]);

  // Summary stats
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const pending = allSubmittedRecords.filter(r => r.status === 'pending').length;
    const approvedThisMonth = allSubmittedRecords.filter(
      r => r.status === 'approved' && r.reviewedAt && r.reviewedAt.slice(0, 7) === currentMonth
    ).length;
    const rejectedThisMonth = allSubmittedRecords.filter(
      r => r.status === 'rejected' && r.reviewedAt && r.reviewedAt.slice(0, 7) === currentMonth
    ).length;

    return { pending, approvedThisMonth, rejectedThisMonth };
  }, [allSubmittedRecords]);

  // Filter and sort
  const filteredRecords = useMemo(() => {
    let filtered = allSubmittedRecords;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    // Sort: pending first, then by date descending
    return filtered.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return b.date.localeCompare(a.date);
    });
  }, [allSubmittedRecords, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRecords.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRecords, currentPage]);

  // Reset page when filter changes
  const handleFilterChange = useCallback((filter) => {
    setStatusFilter(filter);
    setCurrentPage(1);
  }, []);

  const handleReview = useCallback(async (recordId, recordType, status, reviewNote) => {
    setIsReviewing(true);
    try {
      await reviewTimeRecord(recordId, recordType, status, reviewNote);

      // 제출자에게 알림 생성
      try {
        const record = allSubmittedRecords.find(r => r.id === recordId && r.recordType === recordType);
        if (record?.submittedBy && user?.id) {
          const dataService = getDataService();
          const typeLabel = recordType === 'overtime' ? '초과근무' : '휴가';
          await dataService.createNotification({
            recipientId: record.submittedBy,
            senderId: user.id,
            type: status === 'approved' ? 'time_approved' : 'time_rejected',
            title: status === 'approved' ? '시간 기록 승인' : '시간 기록 반려',
            message: status === 'approved'
              ? `${record.date} ${typeLabel} 기록이 승인되었습니다.`
              : `${record.date} ${typeLabel} 기록이 반려되었습니다.${reviewNote ? ' 사유: ' + reviewNote : ''}`,
            relatedRecordType: recordType,
          });
          window.dispatchEvent(new Event('notification-created'));
        }
      } catch (e) { /* 알림 실패는 무시 */ }

      setReviewModal(null);
      setToast({
        show: true,
        message: status === 'approved' ? '승인되었습니다.' : '반려되었습니다.',
        type: status === 'approved' ? 'success' : 'warning',
      });
    } catch (err) {
      setToast({
        show: true,
        message: `처리 실패: ${err.message}`,
        type: 'error',
      });
    } finally {
      setIsReviewing(false);
    }
  }, [reviewTimeRecord, allSubmittedRecords, user]);

  if (!isAdmin) {
    return (
      <div className="text-center py-12 text-gray-500">
        접근 권한이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <ClipboardCheck className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900">승인 관리</h2>
      </div>

      {/* Approval mode banner */}
      {approvalMode === 'auto' ? (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-sm text-green-800">
              자동 승인이 활성화되어 있습니다. 구성원이 제출한 시간이 즉시 승인됩니다.
            </span>
          </div>
          <button
            onClick={() => navigate('/settings/multiplier')}
            className="flex items-center space-x-1 text-sm text-green-700 hover:text-green-900 font-medium flex-shrink-0 ml-3"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>설정 변경</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="text-sm text-blue-800">
              구성원이 제출한 시간을 자동으로 승인하도록 설정할 수 있습니다.
            </span>
          </div>
          <button
            onClick={() => navigate('/settings/multiplier')}
            className="flex items-center space-x-1 text-sm text-blue-700 hover:text-blue-900 font-medium flex-shrink-0 ml-3"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>설정 변경</span>
          </button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-1">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">대기 중</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900">{stats.pending}건</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">이번 달 승인</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{stats.approvedThisMonth}건</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-1">
            <XCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">이번 달 반려</span>
          </div>
          <p className="text-2xl font-bold text-red-900">{stats.rejectedThisMonth}건</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-3 sm:space-x-6">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => handleFilterChange(tab.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                statusFilter === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.key === 'pending' && stats.pending > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[700px] divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">직원</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">날짜</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">유형</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">시간</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">제출 사유</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                <th className="px-3 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 sm:px-4 py-12 text-center">
                    {statusFilter === 'pending' ? (
                      <div>
                        <CheckCircle className="w-10 h-10 text-green-300 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium">모든 제출을 처리했습니다</p>
                        <p className="text-sm text-gray-400 mt-1">대기 중인 제출이 없습니다.</p>
                      </div>
                    ) : (
                      <div>
                        <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">해당 상태의 기록이 없습니다.</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedRecords.map(record => (
                  <tr key={`${record.recordType}-${record.id}`} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-4 py-3 text-sm font-medium text-gray-900">
                      {record.employeeName || '알 수 없음'}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-sm text-gray-600">{record.date}</td>
                    <td className="px-3 sm:px-4 py-3 text-sm text-gray-600">
                      {record.recordType === 'overtime' ? '초과근무' : '휴가'}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-sm text-gray-600">
                      {timeUtils.formatTime(record.totalMinutes)}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-sm text-gray-600 max-w-[200px]">
                      <div style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        wordBreak: 'break-all',
                      }}>
                        {record.submitReason || '-'}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <StatusBadge status={record.status} />
                      {record.reviewNote && (
                        <p className="mt-1 text-xs text-gray-500 max-w-[150px] truncate" title={record.reviewNote}>
                          {record.reviewNote}
                        </p>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-right">
                      {record.status === 'pending' ? (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setReviewModal({ record, action: 'approved' })}
                            className="px-3 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
                          >
                            승인
                          </button>
                          <button
                            onClick={() => setReviewModal({ record, action: 'rejected' })}
                            className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                          >
                            반려
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">처리 완료</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredRecords.length > ITEMS_PER_PAGE && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={filteredRecords.length}
          />
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <ReviewModal
          record={reviewModal.record}
          action={reviewModal.action}
          onConfirm={handleReview}
          onClose={() => setReviewModal(null)}
          isLoading={isReviewing}
        />
      )}

      {/* Toast */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
});

export default ApprovalManagement;
