/**
 * useSubscription Hook
 * 구독 상태 조회 + 판별 로직 래핑
 */

import { useMemo } from 'react';
import { useOvertimeContext } from '../context';
import { getSubscriptionService } from '../services/subscriptionService';

export function useSubscription() {
  const { subscription, employees } = useOvertimeContext();

  const subService = useMemo(() => getSubscriptionService(), []);

  const computedStatus = useMemo(
    () => subService.getComputedStatus(subscription),
    [subService, subscription]
  );

  const isTrialing = computedStatus === 'trialing';
  const isFree = computedStatus === 'free';
  const isPaid = computedStatus === 'active';
  const hasFreeLimitations = isFree;

  const remainingDays = useMemo(
    () => subService.getRemainingTrialDays(subscription),
    [subService, subscription]
  );

  const elapsedDays = useMemo(
    () => subService.getTrialElapsedDays(subscription),
    [subService, subscription]
  );

  const canAddEmployee = useMemo(() => {
    const currentCount = (employees || []).length;
    return subService.canAddEmployee(subscription, currentCount);
  }, [subService, subscription, employees]);

  const canViewMonth = useMemo(() => {
    return (yearMonth) => subService.canViewMonth(subscription, yearMonth);
  }, [subService, subscription]);

  return {
    subscription,
    computedStatus,
    isTrialing,
    isFree,
    isPaid,
    hasFreeLimitations,
    remainingDays,
    elapsedDays,
    canAddEmployee,
    canViewMonth
  };
}

export default useSubscription;
