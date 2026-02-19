/**
 * 구독/플랜 관리 서비스
 * 리버스 트라이얼 모델: 14일 체험 → 무료 플랜(직원 3명/당월 제한)
 */

import { supabase } from '../lib/supabase';

// ========== 상수 ==========

export const PLAN_TYPES = {
  FREE: 'free',
  MONTHLY: 'monthly',
  ANNUAL: 'annual'
};

export const SUBSCRIPTION_STATUS = {
  TRIALING: 'trialing',
  ACTIVE: 'active',
  CANCELED: 'canceled',
  PAST_DUE: 'past_due'
};

export const FREE_EMPLOYEE_LIMIT = 3;
export const TRIAL_DAYS = 14;

// ========== SubscriptionService ==========

export class SubscriptionService {
  constructor() {
    this._subscriptionCache = null;
    this._subscriptionCacheTime = 0;
    this._cacheTTL = 5 * 60 * 1000; // 5분
  }

  // ========== 캐시 ==========

  clearCache() {
    this._subscriptionCache = null;
    this._subscriptionCacheTime = 0;
    if (process.env.NODE_ENV === 'development') {
      console.log('🧹 SubscriptionService cache cleared');
    }
  }

  _getCached() {
    if (!this._subscriptionCache) return null;
    if (Date.now() - this._subscriptionCacheTime > this._cacheTTL) {
      this._subscriptionCache = null;
      this._subscriptionCacheTime = 0;
      return null;
    }
    return this._subscriptionCache;
  }

  _setCache(data) {
    this._subscriptionCache = data;
    this._subscriptionCacheTime = Date.now();
  }

  // ========== 조회 ==========

  /**
   * 회사의 구독 정보 조회
   * @param {number} companyId
   * @returns {Promise<Object|null>}
   */
  async getSubscription(companyId) {
    const cached = this._getCached();
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('company_id', companyId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // no rows
        throw error;
      }

      const converted = this._convertSubscription(data);
      this._setCache(converted);
      return converted;
    } catch (error) {
      console.error('구독 정보 조회 실패:', error.message);
      return null;
    }
  }

  // ========== 상태 판별 (순수 함수) ==========

  /**
   * 실제 계산된 상태 반환
   * DB status가 'trialing'이지만 기간이 지났으면 'free' 반환
   */
  getComputedStatus(sub) {
    if (!sub) return 'free';

    // 유료 상태는 그대로 반환
    if (sub.status === SUBSCRIPTION_STATUS.ACTIVE) return 'active';
    if (sub.status === SUBSCRIPTION_STATUS.CANCELED) return 'canceled';
    if (sub.status === SUBSCRIPTION_STATUS.PAST_DUE) return 'past_due';

    // trialing 상태: 기간 체크
    if (sub.status === SUBSCRIPTION_STATUS.TRIALING) {
      if (sub.currentPeriodEnd && new Date(sub.currentPeriodEnd) < new Date()) {
        return 'free'; // 체험 만료 → 무료
      }
      return 'trialing';
    }

    return sub.status || 'free';
  }

  isTrialing(sub) {
    return this.getComputedStatus(sub) === 'trialing';
  }

  isFree(sub) {
    return this.getComputedStatus(sub) === 'free';
  }

  isPaid(sub) {
    const status = this.getComputedStatus(sub);
    return status === 'active';
  }

  /**
   * 무료 플랜 제한이 적용되는지 여부
   * trialing 중에는 제한 없음, free일 때만 제한
   */
  hasFreeLimitations(sub) {
    return this.isFree(sub);
  }

  /**
   * 남은 체험일 수
   */
  getRemainingTrialDays(sub) {
    if (!sub || !sub.currentPeriodEnd) return 0;
    if (this.getComputedStatus(sub) !== 'trialing') return 0;

    const now = new Date();
    const end = new Date(sub.currentPeriodEnd);
    const diffMs = end - now;
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }

  /**
   * 체험 경과일 수
   */
  getTrialElapsedDays(sub) {
    if (!sub || !sub.currentPeriodStart) return 0;

    const now = new Date();
    const start = new Date(sub.currentPeriodStart);
    const diffMs = now - start;
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }

  // ========== 제한 체크 ==========

  /**
   * 직원 추가 가능 여부
   * @param {Object} sub - 구독 객체
   * @param {number} currentCount - 현재 직원 수 (owner+admin+employee 모두 포함)
   * @returns {{ allowed: boolean, reason?: string }}
   */
  canAddEmployee(sub, currentCount) {
    if (!this.hasFreeLimitations(sub)) {
      return { allowed: true };
    }

    const limit = sub?.employeeLimit || FREE_EMPLOYEE_LIMIT;
    if (currentCount >= limit) {
      return {
        allowed: false,
        reason: `무료 플랜은 최대 ${limit}명까지 등록할 수 있습니다. 유료 플랜으로 업그레이드해주세요.`
      };
    }

    return { allowed: true };
  }

  /**
   * 특정 월 데이터 조회 가능 여부
   * @param {Object} sub - 구독 객체
   * @param {string} yearMonth - 'YYYY-MM' 형식
   * @returns {{ allowed: boolean, reason?: string }}
   */
  canViewMonth(sub, yearMonth) {
    if (!this.hasFreeLimitations(sub)) {
      return { allowed: true };
    }

    // 당월만 허용
    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    if (yearMonth !== currentYearMonth) {
      return {
        allowed: false,
        reason: '무료 플랜은 당월 데이터만 조회할 수 있습니다. 유료 플랜으로 업그레이드해주세요.'
      };
    }

    return { allowed: true };
  }

  // ========== 변경 ==========

  /**
   * 구독 정보 업데이트
   * @param {number} companyId
   * @param {Object} updates - camelCase 키
   */
  async updateSubscription(companyId, updates) {
    try {
      const snakeUpdates = {};
      if (updates.planType !== undefined) snakeUpdates.plan_type = updates.planType;
      if (updates.status !== undefined) snakeUpdates.status = updates.status;
      if (updates.employeeLimit !== undefined) snakeUpdates.employee_limit = updates.employeeLimit;
      if (updates.currentPeriodStart !== undefined) snakeUpdates.current_period_start = updates.currentPeriodStart;
      if (updates.currentPeriodEnd !== undefined) snakeUpdates.current_period_end = updates.currentPeriodEnd;
      if (updates.cancelAtPeriodEnd !== undefined) snakeUpdates.cancel_at_period_end = updates.cancelAtPeriodEnd;
      if (updates.canceledAt !== undefined) snakeUpdates.canceled_at = updates.canceledAt;

      const { data, error } = await supabase
        .from('subscriptions')
        .update(snakeUpdates)
        .eq('company_id', companyId)
        .select()
        .single();

      if (error) throw error;

      const converted = this._convertSubscription(data);
      this._setCache(converted);
      return converted;
    } catch (error) {
      console.error('구독 정보 업데이트 실패:', error.message);
      throw error;
    }
  }

  // ========== 내부 ==========

  _convertSubscription(data) {
    if (!data) return null;
    return {
      id: data.id,
      companyId: data.company_id,
      planType: data.plan_type,
      status: data.status,
      employeeLimit: data.employee_limit,
      currentPeriodStart: data.current_period_start,
      currentPeriodEnd: data.current_period_end,
      cancelAtPeriodEnd: data.cancel_at_period_end,
      canceledAt: data.canceled_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}

// ========== 싱글톤 ==========

let subscriptionServiceInstance = null;

export function getSubscriptionService() {
  if (!subscriptionServiceInstance) {
    subscriptionServiceInstance = new SubscriptionService();
  }
  return subscriptionServiceInstance;
}

export default SubscriptionService;
