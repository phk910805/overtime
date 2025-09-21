import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useOvertimeContext } from '../context';
import { timeUtils, dateUtils } from '../utils';
import TimeInputValidator from '../utils/timeInputValidator.js';

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

const Toast = memo(({ message, show, onClose, type = 'error' }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return { bgColor: 'bg-green-500', textColor: 'text-white' };
      case 'warning':
        return { bgColor: 'bg-orange-500', textColor: 'text-white' };
      case 'error':
      default:
        return { bgColor: 'bg-red-500', textColor: 'text-white' };
    }
  };

  const config = getToastConfig();

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className={`${config.bgColor} ${config.textColor} px-4 py-2 rounded-md shadow-lg`}>
        {message}
      </div>
    </div>
  );
});

// ========== BULK SETTING MODAL ==========
const BulkSettingModal = memo(({ show, onClose, onApplySuccess }) => {
  const { employees, getAllEmployeesWithRecords, selectedMonth, updateDailyTime, getDailyData } = useOvertimeContext();
  
  const [settings, setSettings] = useState({
    rangeType: 'all',
    selectedEmployees: [],
    dateType: 'single',
    singleDate: new Date().toISOString().slice(0, 10),
    startDate: selectedMonth + '-01',
    endDate: selectedMonth + '-' + dateUtils.getDaysInMonth(selectedMonth).toString().padStart(2, '0'),
    timeType: 'overtime',
    overtimeHours: '',
    overtimeMinutes: '',
    vacationHours: '',
    vacationMinutes: ''
  });

  const [previewData, setPreviewData] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  const initialEndDate = useMemo(() => 
    selectedMonth + '-' + dateUtils.getDaysInMonth(selectedMonth).toString().padStart(2, '0'),
    [selectedMonth]
  );

  useEffect(() => {
    if (show) {
      setSettings(prev => ({
        ...prev,
        startDate: selectedMonth + '-01',
        endDate: initialEndDate,
        singleDate: selectedMonth + '-01'
      }));
      setPreviewData(null);
    }
  }, [show, selectedMonth, initialEndDate]);

  const showToast = useCallback((message, type = 'error') => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast({ show: false, message: '' });
  }, []);

  const handleSettingChange = useCallback((field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setPreviewData(null);
  }, []);

  // 시간 입력 전용 핸들러 추가
  const handleTimeInputChange = useCallback((field, value, type) => {
    const validation = TimeInputValidator.validateInput(value, type);
    
    if (validation.isValid) {
      setSettings(prev => ({ ...prev, [field]: validation.filteredValue }));
      setPreviewData(null);
      
      // 자동 보정 메시지 표시
      if (validation.autoCorrect && validation.message) {
        showToast(validation.message, 'success');
      }
    } else {
      // 입력 오류 시 필터링된 값으로 설정
      setSettings(prev => ({ ...prev, [field]: validation.filteredValue }));
      setPreviewData(null);
      
      if (validation.message) {
        showToast(validation.message, 'warning');
      }
    }
  }, [showToast]);

  const getTargetEmployees = useCallback(() => {
    const allEmployees = getAllEmployeesWithRecords(selectedMonth).filter(emp => emp.isActive);
    return settings.rangeType === 'all' ? allEmployees : 
           allEmployees.filter(emp => settings.selectedEmployees.includes(emp.id.toString()));
  }, [settings.rangeType, settings.selectedEmployees, getAllEmployeesWithRecords, selectedMonth]);

  const getTargetDates = useCallback(() => {
    if (settings.dateType === 'single') {
      return [settings.singleDate];
    } else {
      const start = new Date(settings.startDate);
      const end = new Date(settings.endDate);
      const dates = [];
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().slice(0, 10));
      }
      return dates;
    }
  }, [settings.dateType, settings.singleDate, settings.startDate, settings.endDate]);

  const calculatePreview = useCallback(() => {
    const targetEmployees = getTargetEmployees();
    const targetDates = getTargetDates();
    
    if (targetEmployees.length === 0 || targetDates.length === 0) {
      showToast('적용 대상을 선택해주세요');
      return;
    }

    // 시간 입력 최종 검증
    let overtimeMinutes = 0;
    let vacationMinutes = 0;

    if (settings.timeType === 'overtime' || settings.timeType === 'both') {
      const overtimeValidation = TimeInputValidator.validateFinalTime(settings.overtimeHours, settings.overtimeMinutes);
      if (!overtimeValidation.isValid) {
        showToast('초과시간: ' + overtimeValidation.message);
        return;
      }
      overtimeMinutes = overtimeValidation.totalMinutes;
    }
    
    if (settings.timeType === 'vacation' || settings.timeType === 'both') {
      const vacationValidation = TimeInputValidator.validateFinalTime(settings.vacationHours, settings.vacationMinutes);
      if (!vacationValidation.isValid) {
        showToast('사용시간: ' + vacationValidation.message);
        return;
      }
      vacationMinutes = vacationValidation.totalMinutes;
    }

    if (overtimeMinutes === 0 && vacationMinutes === 0) {
      showToast('설정할 시간을 입력해주세요');
      return;
    }

    let overtimeCount = 0;
    let vacationCount = 0;
    let totalOvertimeCells = 0;
    let totalVacationCells = 0;
    let existingOvertimeCells = 0;
    let existingVacationCells = 0;

    targetEmployees.forEach(employee => {
      targetDates.forEach(date => {
        const currentOvertime = getDailyData(employee.id, date, 'overtime');
        const currentVacation = getDailyData(employee.id, date, 'vacation');

        if (overtimeMinutes > 0) {
          totalOvertimeCells++;
          if (currentOvertime === 0) {
            overtimeCount++;
          } else {
            existingOvertimeCells++;
          }
        }

        if (vacationMinutes > 0) {
          totalVacationCells++;
          if (currentVacation === 0) {
            vacationCount++;
          } else {
            existingVacationCells++;
          }
        }
      });
    });

    setPreviewData({
      employeeCount: targetEmployees.length,
      employeeNames: targetEmployees.map(emp => emp.name),
      dateCount: targetDates.length,
      totalCells: overtimeCount + vacationCount,
      totalTargetCells: totalOvertimeCells + totalVacationCells,
      existingCells: existingOvertimeCells + existingVacationCells,
      overtimeCount,
      vacationCount,
      overtimeTime: timeUtils.formatTime(overtimeMinutes),
      vacationTime: timeUtils.formatTime(vacationMinutes)
    });
  }, [getTargetEmployees, getTargetDates, settings, showToast, getDailyData]);

  const resetSettings = useCallback(() => {
    setSettings({
      rangeType: 'all',
      selectedEmployees: [],
      dateType: 'single',
      singleDate: selectedMonth + '-01',
      startDate: selectedMonth + '-01',
      endDate: initialEndDate,
      timeType: 'overtime',
      overtimeHours: '',
      overtimeMinutes: '',
      vacationHours: '',
      vacationMinutes: ''
    });
    setPreviewData(null);
  }, [selectedMonth, initialEndDate]);

  const handleClose = useCallback(() => {
    resetSettings();
    onClose();
  }, [resetSettings, onClose]);

  const handleApply = useCallback(() => {
    if (!previewData) {
      showToast('먼저 미리보기를 확인해주세요');
      return;
    }

    if (previewData.overtimeCount === 0 && previewData.vacationCount === 0) {
      showToast('적용할 빈 셀이 없습니다');
      return;
    }

    const targetEmployees = getTargetEmployees();
    const targetDates = getTargetDates();
    
    // 시간 입력 최종 검증
    let overtimeMinutes = 0;
    let vacationMinutes = 0;

    if (settings.timeType === 'overtime' || settings.timeType === 'both') {
      const overtimeValidation = TimeInputValidator.validateFinalTime(settings.overtimeHours, settings.overtimeMinutes);
      if (!overtimeValidation.isValid) {
        showToast('초과시간: ' + overtimeValidation.message);
        return;
      }
      overtimeMinutes = overtimeValidation.totalMinutes;
    }
    
    if (settings.timeType === 'vacation' || settings.timeType === 'both') {
      const vacationValidation = TimeInputValidator.validateFinalTime(settings.vacationHours, settings.vacationMinutes);
      if (!vacationValidation.isValid) {
        showToast('사용시간: ' + vacationValidation.message);
        return;
      }
      vacationMinutes = vacationValidation.totalMinutes;
    }

    targetEmployees.forEach(employee => {
      targetDates.forEach(date => {
        const currentOvertime = getDailyData(employee.id, date, 'overtime');
        const currentVacation = getDailyData(employee.id, date, 'vacation');

        if (overtimeMinutes > 0 && currentOvertime === 0) {
          updateDailyTime('overtime', employee.id, date, overtimeMinutes);
        }
        if (vacationMinutes > 0 && currentVacation === 0) {
          updateDailyTime('vacation', employee.id, date, vacationMinutes);
        }
      });
    });

    const resultMessage = `일괄 설정이 완료되었습니다 (초과: ${previewData.overtimeCount}개, 사용: ${previewData.vacationCount}개)`;
    
    resetSettings();
    onClose();
    
    if (onApplySuccess) {
      setTimeout(() => {
        onApplySuccess(resultMessage);
      }, 100);
    }
  }, [previewData, getTargetEmployees, getTargetDates, settings, updateDailyTime, getDailyData, resetSettings, onClose, onApplySuccess]);

  if (!show) return null;

  return (
    <>
      <Toast message={toast.message} show={toast.show} onClose={hideToast} type={toast.type} />
      <Modal show={show} onClose={handleClose} title="일괄 시간 설정" size="lg">
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">설정 범위</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="rangeType"
                  value="all"
                  checked={settings.rangeType === 'all'}
                  onChange={(e) => handleSettingChange('rangeType', e.target.value)}
                  className="mr-2"
                />
                전체 직원
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="rangeType"
                  value="selected"
                  checked={settings.rangeType === 'selected'}
                  onChange={(e) => handleSettingChange('rangeType', e.target.value)}
                  className="mr-2"
                />
                선택된 직원
              </label>
              {settings.rangeType === 'selected' && (
                <div className="ml-6">
                  <select
                    multiple
                    value={settings.selectedEmployees}
                    onChange={(e) => handleSettingChange('selectedEmployees', Array.from(e.target.selectedOptions, option => option.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    size="4"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Ctrl 키를 누른 채로 여러 직원 선택 가능</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">기간 설정</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="dateType"
                  value="single"
                  checked={settings.dateType === 'single'}
                  onChange={(e) => handleSettingChange('dateType', e.target.value)}
                  className="mr-2"
                />
                특정일
              </label>
              {settings.dateType === 'single' && (
                <div className="ml-6">
                  <input
                    type="date"
                    value={settings.singleDate}
                    onChange={(e) => handleSettingChange('singleDate', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              )}
              <label className="flex items-center">
                <input
                  type="radio"
                  name="dateType"
                  value="range"
                  checked={settings.dateType === 'range'}
                  onChange={(e) => handleSettingChange('dateType', e.target.value)}
                  className="mr-2"
                />
                기간
              </label>
              {settings.dateType === 'range' && (
                <div className="ml-6 flex items-center">
                  <input
                    type="date"
                    value={settings.startDate}
                    onChange={(e) => handleSettingChange('startDate', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <span className="mx-2">~</span>
                  <input
                    type="date"
                    value={settings.endDate}
                    onChange={(e) => handleSettingChange('endDate', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">시간 설정</label>
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="timeType"
                    value="overtime"
                    checked={settings.timeType === 'overtime'}
                    onChange={(e) => handleSettingChange('timeType', e.target.value)}
                    className="mr-2"
                  />
                  초과시간만 설정
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="timeType"
                    value="vacation"
                    checked={settings.timeType === 'vacation'}
                    onChange={(e) => handleSettingChange('timeType', e.target.value)}
                    className="mr-2"
                  />
                  사용시간만 설정
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="timeType"
                    value="both"
                    checked={settings.timeType === 'both'}
                    onChange={(e) => handleSettingChange('timeType', e.target.value)}
                    className="mr-2"
                  />
                  둘 다 설정
                </label>
              </div>

              {(settings.timeType === 'overtime' || settings.timeType === 'both') && (
                <div className="flex items-center ml-6">
                  <span className="w-16 text-sm text-blue-600">초과시간:</span>
                  <input
                    type="text"
                    placeholder="시간"
                    value={settings.overtimeHours}
                    onChange={(e) => handleTimeInputChange('overtimeHours', e.target.value, 'hours')}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                    maxLength={2}
                  />
                  <span className="mx-2">:</span>
                  <input
                    type="text"
                    placeholder="분"
                    value={settings.overtimeMinutes}
                    onChange={(e) => handleTimeInputChange('overtimeMinutes', e.target.value, 'minutes')}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                    maxLength={2}
                  />
                </div>
              )}

              {(settings.timeType === 'vacation' || settings.timeType === 'both') && (
                <div className="flex items-center ml-6">
                  <span className="w-16 text-sm text-green-600">사용시간:</span>
                  <input
                    type="text"
                    placeholder="시간"
                    value={settings.vacationHours}
                    onChange={(e) => handleTimeInputChange('vacationHours', e.target.value, 'hours')}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                    maxLength={2}
                  />
                  <span className="mx-2">:</span>
                  <input
                    type="text"
                    placeholder="분"
                    value={settings.vacationMinutes}
                    onChange={(e) => handleTimeInputChange('vacationMinutes', e.target.value, 'minutes')}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                    maxLength={2}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              * 이미 입력된 시간은 변경되지 않습니다 (빈 칸에만 적용)
            </p>
          </div>

          {previewData && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
              <p className="text-sm font-medium text-gray-800 mb-2">적용 예정:</p>
              <div className="text-sm text-gray-600 space-y-1">
                <div>대상: 총 {previewData.employeeCount}명 {previewData.employeeNames.join(', ')}</div>
                <div>날짜: {previewData.dateCount}일 (셀 {previewData.totalCells}개)</div>
                {previewData.overtimeCount > 0 && settings.timeType === 'overtime' && (
                  <div>초과시간: {previewData.overtimeTime}</div>
                )}
                {previewData.vacationCount > 0 && settings.timeType === 'vacation' && (
                  <div>사용시간: {previewData.vacationTime}</div>
                )}
                {settings.timeType === 'both' && (
                  <>
                    {previewData.overtimeCount > 0 && (
                      <div>초과시간: {previewData.overtimeTime}</div>
                    )}
                    {previewData.vacationCount > 0 && (
                      <div>사용시간: {previewData.vacationTime}</div>
                    )}
                  </>
                )}
                {previewData.totalCells === 0 && (
                  <div className="text-orange-600">적용할 빈 셀이 없습니다</div>
                )}
                {previewData.existingCells > 0 && previewData.totalCells > 0 && (
                  <div className="text-blue-600 text-xs mt-2">
                    * 총 {previewData.totalTargetCells}개 셀 중 {previewData.existingCells}개는 이미 입력되어 있어, 빈 셀 {previewData.totalCells}개에만 적용됩니다.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={calculatePreview}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            미리보기
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            적용
          </button>
        </div>
      </Modal>
    </>
  );
});

export default BulkSettingModal;
