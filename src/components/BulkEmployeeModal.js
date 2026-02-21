/**
 * BulkEmployeeModal.js
 * 직원 일괄 등록 2단계 모달
 * Step 1: 직원 목록 입력 (테이블형 폼 + Excel 붙여넣기)
 * Step 2: 시작 잔여시간 설정 (선택)
 */

import React, { useState, useCallback, useMemo, useRef, memo } from 'react';
import { X, Plus, ChevronRight, ChevronLeft, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useOvertimeContext } from '../context';
import { getDataService } from '../services/dataService';
import { dateUtils } from '../utils';

// ========== 헬퍼 ==========

let rowIdCounter = 0;
const generateRowId = () => `row-${++rowIdCounter}`;

const createEmptyRow = () => ({
  id: generateRowId(),
  name: '',
  department: '',
  hireDate: ''
});

/**
 * 다양한 날짜 형식을 YYYY-MM-DD로 정규화
 */
const normalizeDate = (raw) => {
  if (!raw) return '';
  const trimmed = raw.trim();

  // 이미 YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  // YYYY.MM.DD or YYYY/MM/DD
  const match = trimmed.match(/^(\d{4})[./](\d{1,2})[./](\d{1,2})$/);
  if (match) {
    return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
  }

  return '';
};

/**
 * 잔여시간 문자열 → 분으로 변환
 * '29:57' → 1797, '-3:00' → -180, '' → 0
 */
const parseBalanceToMinutes = (str) => {
  if (!str || !str.trim()) return 0;
  const trimmed = str.trim();
  const isNegative = trimmed.startsWith('-');
  const abs = isNegative ? trimmed.slice(1) : trimmed;
  const parts = abs.split(':');
  if (parts.length !== 2) return null; // invalid
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes) || minutes < 0 || minutes > 59) return null;
  const total = hours * 60 + minutes;
  return isNegative ? -total : total;
};

// ========== COMPONENT ==========

const BulkEmployeeModal = memo(({ show, onClose, onSuccess }) => {
  const { employees, addEmployee, createCarryoverRecord } = useOvertimeContext();

  // Step 관리
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: 테이블 폼
  const [rows, setRows] = useState(() => [createEmptyRow(), createEmptyRow(), createEmptyRow()]);
  const [rowErrors, setRowErrors] = useState({});
  const [deletedEmployeeNames, setDeletedEmployeeNames] = useState(null);

  // Step 2: 잔여시간
  const editPermission = dateUtils.getEditPermission(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  );
  const defaultMonth = editPermission.type === 'current'
    ? `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
    : `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [balances, setBalances] = useState({});

  // 처리 상태
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState(null);

  // Step 1에서 검증 통과한 행들
  const [validRows, setValidRows] = useState([]);

  const tableRef = useRef(null);

  // 월 선택 옵션 (2025-01 ~ 현재 월)
  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    const endYear = now.getFullYear();
    const endMonth = now.getMonth() + 1;

    for (let y = 2025; y <= endYear; y++) {
      const startM = y === 2025 ? 1 : 1;
      const endM = y === endYear ? endMonth : 12;
      for (let m = startM; m <= endM; m++) {
        const value = `${y}-${String(m).padStart(2, '0')}`;
        const label = `${y}년 ${m}월`;
        options.push({ value, label });
      }
    }
    return options;
  }, []);

  // ===== Step 1 핸들러 =====

  const updateRow = useCallback((rowId, field, value) => {
    setRows(prev => prev.map(r => r.id === rowId ? { ...r, [field]: value } : r));
    // 해당 필드 에러 클리어
    setRowErrors(prev => {
      const rowErr = prev[rowId];
      if (!rowErr) return prev;
      const newRowErr = { ...rowErr };
      delete newRowErr[field];
      if (Object.keys(newRowErr).length === 0) {
        const newErrors = { ...prev };
        delete newErrors[rowId];
        return newErrors;
      }
      return { ...prev, [rowId]: newRowErr };
    });
  }, []);

  const addRow = useCallback(() => {
    setRows(prev => [...prev, createEmptyRow()]);
  }, []);

  const removeRow = useCallback((rowId) => {
    setRows(prev => {
      if (prev.length <= 1) return prev;
      return prev.filter(r => r.id !== rowId);
    });
    setRowErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[rowId];
      return newErrors;
    });
  }, []);

  // Excel 붙여넣기 핸들러
  const handlePaste = useCallback((e, startRowId, startField) => {
    const pasteData = e.clipboardData.getData('text');
    if (!pasteData.includes('\t') && !pasteData.includes('\n')) return; // 단일 셀

    e.preventDefault();
    const lines = pasteData.split(/\r?\n/).filter(line => line.trim());
    if (lines.length === 0) return;

    const fields = ['name', 'department', 'hireDate'];
    const startFieldIdx = fields.indexOf(startField);

    setRows(prev => {
      const startRowIdx = prev.findIndex(r => r.id === startRowId);
      if (startRowIdx === -1) return prev;

      const newRows = [...prev];
      // 필요한 만큼 빈 행 추가
      while (newRows.length < startRowIdx + lines.length) {
        newRows.push(createEmptyRow());
      }

      lines.forEach((line, lineIdx) => {
        const cells = line.split('\t');
        const rowIdx = startRowIdx + lineIdx;
        const row = { ...newRows[rowIdx] };

        cells.forEach((cell, cellIdx) => {
          const fieldIdx = startFieldIdx + cellIdx;
          if (fieldIdx < fields.length) {
            const field = fields[fieldIdx];
            if (field === 'hireDate') {
              row[field] = normalizeDate(cell);
            } else {
              row[field] = cell.trim();
            }
          }
        });

        newRows[rowIdx] = row;
      });

      return newRows;
    });
  }, []);

  // Step 1 → Step 2 검증
  const validateAndProceed = useCallback(async () => {
    // 빈 행 제거
    const nonEmptyRows = rows.filter(r => r.name.trim() || r.department.trim() || r.hireDate);
    if (nonEmptyRows.length === 0) {
      setRowErrors({ _general: { message: '최소 1명 이상 입력해주세요.' } });
      return;
    }

    // 삭제 직원 목록 로드 (최초 1회)
    let deletedNames = deletedEmployeeNames;
    if (deletedNames === null) {
      try {
        const allEmps = await getDataService().getAllEmployeesIncludingDeleted();
        const activeIds = new Set(employees.map(e => e.id));
        deletedNames = new Set(
          allEmps
            .filter(e => !activeIds.has(e.id))
            .map(e => e.name.toLowerCase())
        );
        setDeletedEmployeeNames(deletedNames);
      } catch {
        deletedNames = new Set();
      }
    }

    const activeNames = new Set(employees.map(e => e.name.toLowerCase()));
    const newErrors = {};
    const namesInList = {};
    let hasBlockingError = false;

    nonEmptyRows.forEach((row) => {
      const errs = {};
      const trimName = row.name.trim();
      const trimDept = row.department.trim();

      // 필수 검증
      if (!trimName) {
        errs.name = '필수 항목입니다';
        hasBlockingError = true;
      } else if (trimName.length > 50) {
        errs.name = '50자 이하로 입력해주세요';
        hasBlockingError = true;
      } else {
        const lowerName = trimName.toLowerCase();
        // 활성 직원 중복
        if (activeNames.has(lowerName)) {
          errs.name = '이미 등록된 이름입니다';
          errs.nameLevel = 'error';
          hasBlockingError = true;
        }
        // 삭제 직원 동명
        else if (deletedNames.has(lowerName)) {
          errs.name = '삭제된 동명 직원이 있습니다';
          errs.nameLevel = 'warning';
        }
        // 목록 내 중복
        if (namesInList[lowerName]) {
          errs.name = '목록 내 이름이 중복됩니다';
          errs.nameLevel = 'error';
          hasBlockingError = true;
          // 첫 번째도 에러 표시
          const firstRowId = namesInList[lowerName];
          if (!newErrors[firstRowId]) newErrors[firstRowId] = {};
          newErrors[firstRowId].name = '목록 내 이름이 중복됩니다';
          newErrors[firstRowId].nameLevel = 'error';
        } else {
          namesInList[lowerName] = row.id;
        }
      }

      if (!trimDept) {
        errs.department = '필수 항목입니다';
        hasBlockingError = true;
      } else if (trimDept.length > 100) {
        errs.department = '100자 이하로 입력해주세요';
        hasBlockingError = true;
      }

      if (!row.hireDate) {
        errs.hireDate = '필수 항목입니다';
        hasBlockingError = true;
      }

      if (Object.keys(errs).length > 0) {
        newErrors[row.id] = { ...newErrors[row.id], ...errs };
      }
    });

    setRowErrors(newErrors);

    if (hasBlockingError) return;

    // 검증 통과 → Step 2
    setValidRows(nonEmptyRows);
    // 잔여시간 초기화
    const initBalances = {};
    nonEmptyRows.forEach(r => { initBalances[r.id] = ''; });
    setBalances(initBalances);
    setCurrentStep(2);
  }, [rows, employees, deletedEmployeeNames]);

  // ===== Step 2 핸들러 =====

  const updateBalance = useCallback((rowId, value) => {
    // 허용: 숫자, 콜론, 마이너스
    const cleaned = value.replace(/[^\d:-]/g, '');
    setBalances(prev => ({ ...prev, [rowId]: cleaned }));
  }, []);

  // 완료 처리 (직원 생성 + 이월 레코드)
  const handleComplete = useCallback(async (skipBalance = false) => {
    setIsProcessing(true);
    setProgress({ current: 0, total: validRows.length });

    const successList = [];
    const failedList = [];

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      try {
        // 1. 직원 생성
        const newEmployee = await addEmployee({
          name: row.name.trim(),
          department: row.department.trim(),
          hireDate: row.hireDate
        });

        // 2. 잔여시간 설정 (건너뛰기가 아닌 경우)
        if (!skipBalance) {
          const balanceStr = balances[row.id];
          const minutes = parseBalanceToMinutes(balanceStr);
          if (minutes !== null && minutes !== 0) {
            const [year, month] = selectedMonth.split('-');
            await createCarryoverRecord({
              employeeId: newEmployee.id,
              year: parseInt(year),
              month: parseInt(month),
              carryoverRemainingMinutes: minutes,
              sourceMonthMultiplier: 1.0
            });
          }
        }

        successList.push(row.name.trim());
      } catch (error) {
        failedList.push({ name: row.name.trim(), error: error.message });
      }

      setProgress({ current: i + 1, total: validRows.length });
    }

    setResults({ success: successList, failed: failedList });
    setIsProcessing(false);
  }, [validRows, balances, selectedMonth, addEmployee, createCarryoverRecord]);

  // 결과 확인 후 닫기
  const handleResultClose = useCallback(() => {
    if (results) {
      const msg = results.failed.length === 0
        ? `${results.success.length}명 등록 완료`
        : `${results.success.length}/${results.success.length + results.failed.length}명 등록 성공, ${results.failed.length}명 실패`;
      onSuccess(msg);
    }
    // 상태 리셋
    setCurrentStep(1);
    setRows([createEmptyRow(), createEmptyRow(), createEmptyRow()]);
    setRowErrors({});
    setValidRows([]);
    setBalances({});
    setResults(null);
    setProgress({ current: 0, total: 0 });
    setDeletedEmployeeNames(null);
    onClose();
  }, [results, onClose, onSuccess]);

  if (!show) return null;

  // 결과 화면
  if (results) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40" onClick={handleResultClose}>
        <div className="bg-white rounded-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
          <div className="text-center mb-4">
            {results.failed.length === 0 ? (
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            ) : (
              <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-2" />
            )}
            <h3 className="text-lg font-semibold text-gray-900">
              {results.failed.length === 0 ? '등록 완료' : '부분 완료'}
            </h3>
          </div>

          {results.success.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-green-700 mb-1">
                성공 ({results.success.length}명)
              </p>
              <p className="text-sm text-gray-600">
                {results.success.join(', ')}
              </p>
            </div>
          )}

          {results.failed.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-red-700 mb-1">
                실패 ({results.failed.length}명)
              </p>
              <div className="space-y-1">
                {results.failed.map((f, i) => (
                  <p key={i} className="text-sm text-red-600">
                    {f.name}: {f.error}
                  </p>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleResultClose}
            className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            확인
          </button>
        </div>
      </div>
    );
  }

  // 처리 중 화면
  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
        <div className="bg-white rounded-lg w-full max-w-sm p-6">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-blue-600 mx-auto mb-3 animate-spin" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">등록 처리 중...</h3>
            <p className="text-sm text-gray-600">
              {progress.current} / {progress.total}명 처리 완료
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40" onClick={onClose}>
      <div
        className="bg-white rounded-lg w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              직원 일괄 등록
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {currentStep === 1 ? '1단계: 직원 정보 입력' : '2단계: 시작 잔여시간 설정'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-auto p-4 sm:p-6" ref={tableRef}>
          {currentStep === 1 ? (
            <Step1Table
              rows={rows}
              rowErrors={rowErrors}
              onUpdateRow={updateRow}
              onAddRow={addRow}
              onRemoveRow={removeRow}
              onPaste={handlePaste}
            />
          ) : (
            <Step2Balance
              validRows={validRows}
              balances={balances}
              selectedMonth={selectedMonth}
              monthOptions={monthOptions}
              onMonthChange={setSelectedMonth}
              onUpdateBalance={updateBalance}
            />
          )}
        </div>

        {/* 푸터 */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-t border-gray-200 flex-shrink-0">
          {currentStep === 1 ? (
            <>
              <div />
              <div className="flex items-center space-x-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                >
                  취소
                </button>
                <button
                  onClick={validateAndProceed}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium flex items-center space-x-1"
                >
                  <span>다음: 시작 잔여시간</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-sm flex items-center space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>이전</span>
              </button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleComplete(true)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                >
                  건너뛰기
                </button>
                <button
                  onClick={() => handleComplete(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  완료
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

// ========== Step 1 서브 컴포넌트 ==========

const Step1Table = memo(({ rows, rowErrors, onUpdateRow, onAddRow, onRemoveRow, onPaste }) => {
  const generalError = rowErrors._general;

  return (
    <div>
      {generalError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-sm text-red-800">{generalError.message}</p>
        </div>
      )}

      <p className="text-xs text-gray-500 mb-3">
        Excel에서 복사한 데이터를 붙여넣으면 자동으로 채워집니다.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 w-[30%]">
                이름 <span className="text-red-500">*</span>
              </th>
              <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 w-[30%]">
                부서 <span className="text-red-500">*</span>
              </th>
              <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 w-[30%]">
                입사일 <span className="text-red-500">*</span>
              </th>
              <th className="w-[10%]" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const errs = rowErrors[row.id] || {};
              return (
                <tr key={row.id} className="border-b border-gray-100">
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => onUpdateRow(row.id, 'name', e.target.value)}
                      onPaste={(e) => onPaste(e, row.id, 'name')}
                      className={`w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        errs.name
                          ? errs.nameLevel === 'warning' ? 'border-yellow-400 bg-yellow-50' : 'border-red-400 bg-red-50'
                          : 'border-gray-300'
                      }`}
                      placeholder="이름"
                    />
                    {errs.name && (
                      <p className={`text-xs mt-0.5 ${
                        errs.nameLevel === 'warning' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {errs.name}
                      </p>
                    )}
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={row.department}
                      onChange={(e) => onUpdateRow(row.id, 'department', e.target.value)}
                      onPaste={(e) => onPaste(e, row.id, 'department')}
                      className={`w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        errs.department ? 'border-red-400 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="부서"
                    />
                    {errs.department && (
                      <p className="text-xs mt-0.5 text-red-600">{errs.department}</p>
                    )}
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="date"
                      value={row.hireDate}
                      onChange={(e) => onUpdateRow(row.id, 'hireDate', e.target.value)}
                      onPaste={(e) => {
                        const pasted = e.clipboardData.getData('text');
                        const normalized = normalizeDate(pasted);
                        if (normalized) {
                          e.preventDefault();
                          onUpdateRow(row.id, 'hireDate', normalized);
                        }
                      }}
                      className={`w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        errs.hireDate ? 'border-red-400 bg-red-50' : 'border-gray-300'
                      } ${row.hireDate ? 'has-value' : ''}`}
                    />
                    {errs.hireDate && (
                      <p className="text-xs mt-0.5 text-red-600">{errs.hireDate}</p>
                    )}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {rows.length > 1 && (
                      <button
                        onClick={() => onRemoveRow(row.id)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded"
                        title="행 삭제"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button
        onClick={onAddRow}
        className="mt-3 text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
      >
        <Plus className="w-4 h-4" />
        <span>행 추가</span>
      </button>
    </div>
  );
});

// ========== Step 2 서브 컴포넌트 ==========

const Step2Balance = memo(({ validRows, balances, selectedMonth, monthOptions, onMonthChange, onUpdateBalance }) => {
  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">대상 월</label>
        <select
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {monthOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <p className="text-xs text-gray-500 mb-3">
        각 직원의 시작 잔여시간을 입력하세요. 비워두면 0으로 처리됩니다. 음수는 '-' 접두사를 사용하세요.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-2 text-xs font-medium text-gray-500">이름</th>
              <th className="text-left py-2 px-2 text-xs font-medium text-gray-500">부서</th>
              <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 w-[140px]">잔여시간 (HH:MM)</th>
            </tr>
          </thead>
          <tbody>
            {validRows.map((row) => (
              <tr key={row.id} className="border-b border-gray-100">
                <td className="py-2 px-2 text-gray-900">{row.name}</td>
                <td className="py-2 px-2 text-gray-500">{row.department}</td>
                <td className="py-2 px-2">
                  <input
                    type="text"
                    value={balances[row.id] || ''}
                    onChange={(e) => onUpdateBalance(row.id, e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="0:00"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default BulkEmployeeModal;
