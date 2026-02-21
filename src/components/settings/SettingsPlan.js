/**
 * SettingsPlan.js
 * 설정 > 플랜/결제 섹션 (owner only)
 * 현재 플랜 상태 + 플랜 비교표 + 결제정보 placeholder
 */

import React, { useState, memo, useCallback } from 'react';
import { Crown, Users, Calendar, Check, Zap } from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';
import { useOvertimeContext } from '../../context';
import { TRIAL_DAYS } from '../../services/subscriptionService';

const SettingsPlan = memo(() => {
  const { subscription, isTrialing, isFree, isPaid, remainingDays, elapsedDays } = useSubscription();
  const { employees } = useOvertimeContext();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [showUpgradeNotice, setShowUpgradeNotice] = useState(false);

  const employeeCount = (employees || []).length;

  // 상태 배지
  const getStatusBadge = () => {
    if (isTrialing) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          체험 중
        </span>
      );
    }
    if (isFree) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          무료 플랜
        </span>
      );
    }
    if (isPaid) {
      const planLabel = subscription?.planType === 'annual' ? '연 결제' : '월 결제';
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {planLabel}
        </span>
      );
    }
    return null;
  };

  const handleUpgradeClick = useCallback(() => {
    setShowUpgradeNotice(true);
  }, []);

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">플랜 / 결제</h3>

      {/* (A) 현재 플랜 상태 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Crown className="w-5 h-5 text-yellow-500" />
              <h4 className="text-base font-semibold text-gray-900">현재 플랜</h4>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {isTrialing && '14일 무료 체험 중 — 모든 기능을 사용할 수 있습니다.'}
              {isFree && '무료 플랜 — 당월 데이터만 조회 가능합니다.'}
              {isPaid && '유료 플랜 — 모든 기능을 무제한으로 사용할 수 있습니다.'}
              {!subscription && '플랜 정보를 불러오는 중...'}
            </p>
          </div>
        </div>

        {/* 체험 프로그레스 바 */}
        {isTrialing && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>체험 시작</span>
              <span>{remainingDays}일 남음</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (elapsedDays / TRIAL_DAYS) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* 직원 수 표시 */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1.5 text-gray-600">
            <Users className="w-4 h-4" />
            <span>활성 직원: <strong>{employeeCount}명</strong></span>
          </div>
          {isFree && (
            <div className="flex items-center space-x-1.5 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>당월 데이터만 조회 가능</span>
            </div>
          )}
        </div>
      </div>

      {/* (B) 플랜 비교표 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-semibold text-gray-900">플랜 비교</h4>
          {/* 월/연 토글 */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              월 결제
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors relative ${
                billingCycle === 'annual'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              연 결제
              <span className="ml-1 text-[10px] text-green-600 font-semibold">2개월 무료</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 무료 플랜 */}
          <PlanCard
            name="무료"
            price="₩0"
            period=""
            features={[
              '직원 무제한',
              '당월 데이터만 조회',
              '모든 기능 동일'
            ]}
            isCurrent={isFree}
            isTrialCurrent={false}
            onSelect={null}
          />

          {/* 월 결제 / 연 결제 */}
          {billingCycle === 'monthly' ? (
            <PlanCard
              name="월 결제"
              price="가격 미정"
              period="/월"
              features={[
                '직원 무제한',
                '전체 히스토리 조회',
                '모든 기능 동일'
              ]}
              isCurrent={isPaid && subscription?.planType === 'monthly'}
              isTrialCurrent={false}
              highlight
              onSelect={handleUpgradeClick}
            />
          ) : (
            <PlanCard
              name="연 결제"
              price="가격 미정"
              period="/월"
              features={[
                '직원 무제한',
                '전체 히스토리 조회',
                '모든 기능 동일',
                '2개월 무료 (~17% 할인)'
              ]}
              isCurrent={isPaid && subscription?.planType === 'annual'}
              isTrialCurrent={false}
              highlight
              onSelect={handleUpgradeClick}
            />
          )}

          {/* 반대 결제 주기 카드 */}
          {billingCycle === 'monthly' ? (
            <PlanCard
              name="연 결제"
              price="가격 미정"
              period="/월"
              features={[
                '직원 무제한',
                '전체 히스토리 조회',
                '모든 기능 동일',
                '2개월 무료 (~17% 할인)'
              ]}
              isCurrent={isPaid && subscription?.planType === 'annual'}
              isTrialCurrent={false}
              onSelect={handleUpgradeClick}
            />
          ) : (
            <PlanCard
              name="월 결제"
              price="가격 미정"
              period="/월"
              features={[
                '직원 무제한',
                '전체 히스토리 조회',
                '모든 기능 동일'
              ]}
              isCurrent={isPaid && subscription?.planType === 'monthly'}
              isTrialCurrent={false}
              onSelect={handleUpgradeClick}
            />
          )}
        </div>
      </div>

      {/* (C) 결제 정보 Placeholder */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h4 className="text-base font-semibold text-gray-900 mb-3">결제 정보</h4>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">결제 수단</span>
            <span className="text-gray-400">미등록</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">결제 내역</span>
            <span className="text-gray-400">없음</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4">
          결제 기능은 추후 업데이트 예정입니다.
        </p>
      </div>

      {/* 업그레이드 안내 모달 */}
      {showUpgradeNotice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">결제 시스템 준비 중</h3>
              <p className="text-sm text-gray-600 mb-4">
                결제 시스템을 준비하고 있습니다. 곧 업그레이드할 수 있습니다.
              </p>
              <button
                onClick={() => setShowUpgradeNotice(false)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// 플랜 카드 컴포넌트
const PlanCard = memo(({ name, price, period, features, isCurrent, highlight, onSelect }) => {
  return (
    <div className={`border rounded-lg p-5 relative ${
      highlight ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200'
    } ${isCurrent ? 'ring-2 ring-blue-500' : ''}`}>
      {isCurrent && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white">
          현재 플랜
        </span>
      )}
      <div className="text-center mb-4">
        <h5 className="text-sm font-semibold text-gray-900 mb-1">{name}</h5>
        <div className="flex items-baseline justify-center">
          <span className="text-2xl font-bold text-gray-900">{price}</span>
          {period && <span className="text-sm text-gray-500 ml-1">{period}</span>}
        </div>
      </div>
      <ul className="space-y-2 mb-5">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start space-x-2 text-sm text-gray-600">
            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      {isCurrent ? (
        <button
          disabled
          className="w-full px-4 py-2 bg-gray-100 text-gray-400 rounded-md text-sm font-medium cursor-not-allowed"
        >
          현재 플랜
        </button>
      ) : onSelect ? (
        <button
          onClick={onSelect}
          className={`w-full px-4 py-2 rounded-md text-sm font-medium ${
            highlight
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {highlight ? '업그레이드' : '선택'}
        </button>
      ) : null}
    </div>
  );
});

export default SettingsPlan;
