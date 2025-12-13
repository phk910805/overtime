import React from 'react';
import { timeUtils, dateUtils } from '../utils';

/**
 * 월 변경 알림 툴팁
 * 새로운 달로 접속 시 이월 안내 및 편집 가능 기한 표시
 */
const MonthChangeNotification = ({ 
  show, 
  onClose,
  onGoToLastMonth,
  currentMonth, // "12"
  lastMonth, // "11"
  carryoverList, // [{ employeeName, carryoverMinutes }]
  editDeadline // "2024.12.31"
}) => {
  if (!show) return null;

  // 이월이 있는 직원만 필터링 (0이 아닌 경우)
  const activeCarryovers = (carryoverList || []).filter(item => item.carryoverMinutes !== 0);
  const totalCount = activeCarryovers.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* 배경 오버레이 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30"
        onClick={onClose}
      />
      
      {/* 툴팁 */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-slideDown">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 제목 */}
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-2">📅</span>
          <h3 className="text-xl font-bold text-gray-900">
            {currentMonth}월이 되었습니다
          </h3>
        </div>

        {/* 이월 정보 */}
        {totalCount > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="text-sm font-medium text-blue-900 mb-2">
              • {lastMonth}월 잔여시간이 이월됨
            </div>
            <div className="space-y-1 ml-4">
              {activeCarryovers.slice(0, 5).map((item, index) => (
                <div key={index} className="text-sm text-gray-700">
                  → {item.employeeName}: 
                  <span className={item.carryoverMinutes >= 0 ? "text-orange-600 font-medium ml-1" : "text-red-600 font-medium ml-1"}>
                    {item.carryoverMinutes >= 0 ? '+' : '-'}
                    {timeUtils.formatTime(Math.abs(item.carryoverMinutes))}
                  </span>
                </div>
              ))}
              {totalCount > 5 && (
                <div className="text-sm text-gray-500">
                  ...외 {totalCount - 5}명
                </div>
              )}
            </div>
            <div className="mt-2 text-sm text-blue-900 font-medium">
              총 {totalCount}명
            </div>
          </div>
        )}

        {totalCount === 0 && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="text-sm text-gray-600">
              • {lastMonth}월에 이월된 잔여시간이 없습니다
            </div>
          </div>
        )}

        {/* 편집 기한 안내 */}
        <div className="bg-yellow-50 rounded-lg p-4 mb-4">
          <div className="text-sm text-yellow-900">
            • {lastMonth}월은 <span className="font-bold">{editDeadline}</span>까지 편집할 수 있습니다
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex space-x-2">
          <button
            onClick={onGoToLastMonth}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium"
          >
            {lastMonth}월 확인하기
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            확인
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MonthChangeNotification;
