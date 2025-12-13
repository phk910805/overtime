import React from 'react';
import { Modal } from './CommonUI';
import { timeUtils } from '../utils';

/**
 * 이월 변경 안내 모달
 * 지난 달 데이터 수정 시 다음 달 이월이 변경되었음을 알림
 */
const CarryoverChangeModal = ({ 
  show, 
  onClose, 
  employeeName,
  sourceMonth, // 수정한 달 (예: "11")
  targetMonth, // 이월되는 달 (예: "12")
  oldRemaining,
  newRemaining,
  oldCarryover,
  newCarryover,
  targetMonthOldRemaining,
  targetMonthNewRemaining
}) => {
  if (!show) return null;

  const remainingDiff = newRemaining - oldRemaining;
  const carryoverDiff = newCarryover - oldCarryover;
  const targetRemainingDiff = targetMonthNewRemaining - targetMonthOldRemaining;

  return (
    <Modal show={show} onClose={onClose} title="💡 이월 변경 안내">
      <div className="space-y-4">
        {/* 직원 이름 */}
        <div className="text-center pb-2 border-b border-gray-200">
          <span className="text-lg font-semibold text-gray-900">{employeeName}</span>
        </div>

        {/* 수정한 달 잔여시간 변경 */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm font-medium text-blue-900 mb-2">
            {sourceMonth}월 잔여시간 변경
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">변경 전:</span>
            <span className={oldRemaining >= 0 ? "text-orange-600 font-medium" : "text-red-600 font-medium"}>
              {oldRemaining >= 0 ? '+' : '-'}{timeUtils.formatTime(Math.abs(oldRemaining))}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-600">변경 후:</span>
            <span className={newRemaining >= 0 ? "text-orange-600 font-medium" : "text-red-600 font-medium"}>
              {newRemaining >= 0 ? '+' : '-'}{timeUtils.formatTime(Math.abs(newRemaining))}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-blue-200">
            <span className="text-gray-700 font-medium">변화:</span>
            <span className={remainingDiff >= 0 ? "text-blue-600 font-bold" : "text-red-600 font-bold"}>
              {remainingDiff >= 0 ? '+' : ''}{timeUtils.formatTime(Math.abs(remainingDiff))}
            </span>
          </div>
        </div>

        {/* 이월 변경 */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-sm font-medium text-purple-900 mb-2">
            {targetMonth}월 이월시간 변경
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">변경 전:</span>
            <span className={oldCarryover >= 0 ? "text-orange-600 font-medium" : "text-red-600 font-medium"}>
              {oldCarryover >= 0 ? '+' : '-'}{timeUtils.formatTime(Math.abs(oldCarryover))}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-600">변경 후:</span>
            <span className={newCarryover >= 0 ? "text-orange-600 font-medium" : "text-red-600 font-medium"}>
              {newCarryover >= 0 ? '+' : '-'}{timeUtils.formatTime(Math.abs(newCarryover))}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-purple-200">
            <span className="text-gray-700 font-medium">변화:</span>
            <span className={carryoverDiff >= 0 ? "text-purple-600 font-bold" : "text-red-600 font-bold"}>
              {carryoverDiff >= 0 ? '+' : ''}{timeUtils.formatTime(Math.abs(carryoverDiff))}
            </span>
          </div>
        </div>

        {/* 다음 달 잔여시간 영향 */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm font-medium text-green-900 mb-2">
            💡 {targetMonth}월 잔여시간 영향
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">변경 전:</span>
            <span className={targetMonthOldRemaining >= 0 ? "text-orange-600 font-medium" : "text-red-600 font-medium"}>
              {targetMonthOldRemaining >= 0 ? '+' : '-'}{timeUtils.formatTime(Math.abs(targetMonthOldRemaining))}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-600">변경 후:</span>
            <span className={targetMonthNewRemaining >= 0 ? "text-orange-600 font-medium" : "text-red-600 font-medium"}>
              {targetMonthNewRemaining >= 0 ? '+' : '-'}{timeUtils.formatTime(Math.abs(targetMonthNewRemaining))}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-green-200">
            <span className="text-gray-700 font-medium">변화:</span>
            <span className={targetRemainingDiff >= 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
              {targetRemainingDiff >= 0 ? '+' : ''}{timeUtils.formatTime(Math.abs(targetRemainingDiff))}
            </span>
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
          ℹ️ {sourceMonth}월 데이터 수정으로 {targetMonth}월 이월이 자동으로 재계산되었습니다.
        </div>
      </div>

      {/* 버튼 */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          확인
        </button>
      </div>
    </Modal>
  );
};

export default CarryoverChangeModal;
