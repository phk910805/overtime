import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { Clock, Send, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useOvertimeContext } from '../context';
import { useAuth } from '../hooks/useAuth';
import { getDataService } from '../services/dataService';
import { timeUtils } from '../utils';
import TimeInputValidator from '../utils/timeInputValidator';
import { Toast } from './CommonUI';

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

const MyTimeEntry = memo(() => {
  const { overtimeRecords, vacationRecords, submitOwnTimeRecord, selectedMonth } = useOvertimeContext();
  const { user, canSubmitOwnTime } = useAuth();

  const [linkedEmployee, setLinkedEmployee] = useState(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState(true);

  // Form state
  const [date, setDate] = useState('');
  const [type, setType] = useState('overtime');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const hoursRef = useRef(null);
  const minutesRef = useRef(null);

  // Load linked employee
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    const load = async () => {
      try {
        setIsLoadingEmployee(true);
        const dataService = getDataService();
        const emp = await dataService.getLinkedEmployee(user.id);
        if (!cancelled) setLinkedEmployee(emp);
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to load linked employee:', err);
        }
      } finally {
        if (!cancelled) setIsLoadingEmployee(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [user?.id]);

  // Set default date to today
  useEffect(() => {
    if (!date) {
      const today = new Date().toISOString().slice(0, 10);
      setDate(today);
    }
  }, [date]);

  const showToast = useCallback((message, toastType = 'success') => {
    setToast({ show: true, message, type: toastType });
  }, []);

  const hideToast = useCallback(() => {
    setToast({ show: false, message: '', type: 'success' });
  }, []);

  // Filter records for linked employee
  const myRecords = React.useMemo(() => {
    if (!linkedEmployee) return [];
    const empId = linkedEmployee.id;

    const overtime = overtimeRecords
      .filter(r => r.employeeId === empId)
      .map(r => ({ ...r, recordType: 'overtime' }));
    const vacation = vacationRecords
      .filter(r => r.employeeId === empId)
      .map(r => ({ ...r, recordType: 'vacation' }));

    return [...overtime, ...vacation].sort((a, b) => {
      // Sort by date desc, then by created_at desc
      if (b.date !== a.date) return b.date.localeCompare(a.date);
      return (b.created_at || '').localeCompare(a.created_at || '');
    });
  }, [linkedEmployee, overtimeRecords, vacationRecords]);

  // Filter by current selected month
  const filteredRecords = React.useMemo(() => {
    return myRecords.filter(r => r.date && r.date.startsWith(selectedMonth));
  }, [myRecords, selectedMonth]);

  // Summary stats
  const summary = React.useMemo(() => {
    const monthRecords = myRecords.filter(r => r.date && r.date.startsWith(selectedMonth));
    const approvedOvertime = monthRecords
      .filter(r => r.recordType === 'overtime' && r.status === 'approved')
      .reduce((sum, r) => sum + (r.totalMinutes || 0), 0);
    const pendingCount = monthRecords.filter(r => r.status === 'pending').length;
    const rejectedCount = monthRecords.filter(r => r.status === 'rejected').length;
    return { approvedOvertime, pendingCount, rejectedCount };
  }, [myRecords, selectedMonth]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / ITEMS_PER_PAGE));
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when month changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth]);

  const handleHoursChange = useCallback((e) => {
    const validation = TimeInputValidator.validateInput(e.target.value, 'hours');
    setHours(validation.filteredValue);
    if (TimeInputValidator.shouldMoveToNext(validation.filteredValue, 'hours') && minutesRef.current) {
      setTimeout(() => {
        minutesRef.current.focus();
        minutesRef.current.select();
      }, 0);
    }
  }, []);

  const handleMinutesChange = useCallback((e) => {
    const validation = TimeInputValidator.validateInput(e.target.value, 'minutes');
    setMinutes(validation.filteredValue);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!linkedEmployee) return;

    // Validate time
    const validation = TimeInputValidator.validateFinalTime(hours, minutes);
    if (!validation.isValid) {
      showToast(validation.message, 'error');
      return;
    }
    if (validation.totalMinutes === 0) {
      showToast('시간을 입력해주세요.', 'error');
      return;
    }
    if (!date) {
      showToast('날짜를 선택해주세요.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitOwnTimeRecord(type, linkedEmployee.id, date, validation.totalMinutes, reason);
      showToast('시간이 제출되었습니다. 관리자 승인을 기다려주세요.');

      // 회사 owner에게 제출 알림 (employee는 getCompanyMembers로 다른 멤버 조회 불가)
      try {
        const dataService = getDataService();
        const company = await dataService.getMyCompany();
        if (company?.ownerId && user?.id && company.ownerId !== user.id) {
          const typeLabel = type === 'overtime' ? '초과근무' : '휴가';
          const h = Math.floor(validation.totalMinutes / 60);
          const m = validation.totalMinutes % 60;
          const timeStr = m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
          await dataService.createNotification({
            recipientId: company.ownerId,
            senderId: user.id,
            type: 'time_submitted',
            title: '초과근무 시간 제출',
            message: `${linkedEmployee.name}님이 ${date} ${typeLabel} ${timeStr}을 제출했습니다.`,
            relatedRecordType: type,
          });
          window.dispatchEvent(new Event('notification-created'));
        }
      } catch (e) { /* 알림 실패는 무시 */ }

      // Reset form
      setHours('');
      setMinutes('');
      setReason('');
    } catch (err) {
      showToast(err.message || '제출에 실패했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkedEmployee, hours, minutes, date, type, reason, submitOwnTimeRecord, showToast, user]);

  if (!canSubmitOwnTime) {
    return null;
  }

  if (isLoadingEmployee) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">로딩 중...</span>
      </div>
    );
  }

  // Not linked to an employee
  if (!linkedEmployee) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">직원 연결이 필요합니다</h3>
        <p className="text-gray-600">관리자에게 직원 연결을 요청하세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toast message={toast.message} show={toast.show} onClose={hideToast} type={toast.type} duration={3000} />

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">내 근무</h2>
        <p className="text-sm text-gray-500 mt-1">
          {linkedEmployee.name} {linkedEmployee.department ? `| ${linkedEmployee.department}` : ''}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 mb-1">승인된 초과근무</div>
          <div className="text-xl font-bold text-blue-600">{timeUtils.formatTime(summary.approvedOvertime)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 mb-1">대기 중</div>
          <div className="text-xl font-bold text-yellow-600">{summary.pendingCount}건</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 mb-1">반려</div>
          <div className="text-xl font-bold text-red-600">{summary.rejectedCount}건</div>
        </div>
      </div>

      {/* Submit Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">시간 제출</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">유형</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="overtime">초과근무</option>
                <option value="vacation">휴가전환</option>
              </select>
            </div>
          </div>

          {/* Time Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">시간</label>
            <div className="flex items-center space-x-2">
              <input
                ref={hoursRef}
                type="text"
                value={hours}
                onChange={handleHoursChange}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="00"
                maxLength={2}
              />
              <span className="text-xl font-bold text-gray-400">:</span>
              <input
                ref={minutesRef}
                type="text"
                value={minutes}
                onChange={handleMinutesChange}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="00"
                maxLength={2}
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">사유 (선택)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="사유를 입력하세요"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{isSubmitting ? '제출 중...' : '제출'}</span>
          </button>
        </form>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            제출 내역 ({selectedMonth})
          </h3>
        </div>
        {filteredRecords.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            이번 달 제출 내역이 없습니다.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">날짜</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">유형</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">시간</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">사유</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">리뷰노트</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedRecords.map((record) => (
                    <tr key={`${record.recordType}-${record.id}`}>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.date}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {record.recordType === 'overtime' ? '초과근무' : '휴가전환'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {timeUtils.formatTime(record.totalMinutes)}
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <StatusBadge status={record.status || 'approved'} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                        {record.submit_reason || record.submitReason || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                        {record.review_note || record.reviewNote || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <span className="text-sm text-gray-500">
                  {filteredRecords.length}건 중 {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredRecords.length)}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    이전
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    다음
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});

export default MyTimeEntry;
