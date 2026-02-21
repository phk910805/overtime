/**
 * TrialBanner.js
 * 헤더 아래 체험 타이머 배너
 * Day 1~6: 숨김 / Day 7~10: 노란색 / Day 11~13: 주황색 / Day 14: 빨간색 / 만료후: 파란색 / 유료: 숨김
 */

import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';

const TrialBanner = memo(() => {
  const navigate = useNavigate();
  const { isTrialing, isFree, isPaid, remainingDays, elapsedDays, subscription } = useSubscription();

  // 유료 플랜이면 숨김
  if (isPaid) return null;

  // 구독 정보 없으면 숨김
  if (!subscription) return null;

  // 체험 중 Day 1~6: 숨김
  if (isTrialing && elapsedDays < 7) return null;

  const handleClick = () => {
    navigate('/settings/plan');
  };

  let bgClass, borderClass, textClass, message, linkText;

  if (isTrialing) {
    if (remainingDays === 0) {
      // Day 14 (당일)
      bgClass = 'bg-red-50';
      borderClass = 'border-red-200';
      textClass = 'text-red-800';
      message = '오늘 무료 체험이 종료됩니다';
      linkText = '업그레이드 →';
    } else if (remainingDays <= 3) {
      // Day 11~13
      bgClass = 'bg-orange-50';
      borderClass = 'border-orange-200';
      textClass = 'text-orange-800';
      message = `무료 체험 ${remainingDays}일 남음`;
      linkText = '지금 업그레이드 →';
    } else {
      // Day 7~10
      bgClass = 'bg-yellow-50';
      borderClass = 'border-yellow-200';
      textClass = 'text-yellow-800';
      message = `무료 체험 ${remainingDays}일 남음`;
      linkText = '플랜 보기 →';
    }
  } else if (isFree) {
    // 만료 후 (무료 플랜)
    bgClass = 'bg-blue-50';
    borderClass = 'border-blue-200';
    textClass = 'text-blue-800';
    message = '무료 플랜 사용 중 (당월 데이터만)';
    linkText = '업그레이드 →';
  } else {
    return null;
  }

  return (
    <div className={`${bgClass} border-b ${borderClass}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-2">
          <span className={`text-sm font-medium ${textClass}`}>
            {message}
          </span>
          <span className={`mx-2 ${textClass} opacity-40`}>|</span>
          <button
            onClick={handleClick}
            className={`text-sm font-semibold ${textClass} hover:underline`}
          >
            {linkText}
          </button>
        </div>
      </div>
    </div>
  );
});

export default TrialBanner;
