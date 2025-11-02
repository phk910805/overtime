// MonthSelector Component - Updated
import React, { memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MonthSelector = memo(({ selectedMonth, onMonthChange, minMonth = null, maxMonth = null }) => {
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    
    let newYear = year;
    let newMonth = month - 1;
    
    // 1월에서 이전 월로 가면 전년도 12월
    if (newMonth < 1) {
      newMonth = 12;
      newYear = year - 1;
    }
    
    const newMonthStr = `${newYear}-${String(newMonth).padStart(2, '0')}`;
    
    if (!minMonth || newMonthStr >= minMonth) {
      onMonthChange(newMonthStr);
    }
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    
    let newYear = year;
    let newMonth = month + 1;
    
    // 12월에서 다음 월로 가면 다음년도 1월
    if (newMonth > 12) {
      newMonth = 1;
      newYear = year + 1;
    }
    
    const newMonthStr = `${newYear}-${String(newMonth).padStart(2, '0')}`;
    
    if (!maxMonth || newMonthStr <= maxMonth) {
      onMonthChange(newMonthStr);
    }
  };

  const isPrevDisabled = minMonth && selectedMonth <= minMonth;
  const isNextDisabled = maxMonth && selectedMonth >= maxMonth;

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handlePrevMonth}
        disabled={isPrevDisabled}
        className={`p-2 rounded-md transition-colors ${
          isPrevDisabled
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
        }`}
        title="이전 월"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <div className="min-w-[120px] text-center">
        <span className="text-lg font-semibold text-gray-900">
          {selectedMonth}
        </span>
      </div>
      
      <button
        onClick={handleNextMonth}
        disabled={isNextDisabled}
        className={`p-2 rounded-md transition-colors ${
          isNextDisabled
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
        }`}
        title="다음 월"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
});

MonthSelector.displayName = 'MonthSelector';

export default MonthSelector;
