/**
 * Supabase Authentication 서비스
 * 회원가입, 로그인, 로그아웃, 사용자 상태 관리
 */

import { supabase } from '../lib/supabase';
import { createStorageAdapter } from './storage';

export class AuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = new Set();
    
    // StorageAdapter 초기화
    try {
      createStorageAdapter({
        type: 'supabase',
        options: {
          supabaseClient: supabase
        }
      });
      console.log('✅ StorageAdapter 초기화 성공');
    } catch (error) {
      // 이미 초기화된 경우 무시
      if (!error.message?.includes('already initialized')) {
        console.error('❌ StorageAdapter 초기화 실패:', error);
      }
    }
  }

  /**
   * 환경별 리다이렉트 URL 가져오기
   */
  getRedirectURL() {
    if (process.env.NODE_ENV === 'development') {
      return process.env.REACT_APP_AUTH_REDIRECT_URL_LOCAL || 'http://localhost:3000';
    }
    return process.env.REACT_APP_AUTH_REDIRECT_URL_PROD || 'https://phk910805.github.io/overtime';
  }

  /**
   * 회원가입
   * @param {string} email 
   * @param {string} password 
   * @param {object} userData 추가 사용자 정보
   */
  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: this.getRedirectURL(),
          data: {
            full_name: userData.full_name || ''
          }
        }
      });

      if (error) throw error;

      console.log('✅ 회원가입 성공:', data.user?.email);
      return { success: true, user: data.user, session: data.session };

    } catch (error) {
      console.error('❌ 회원가입 실패:', error.message);
      
      // Supabase 영어 에러 메시지를 한글로 변환
      let koreanError = error.message;
      
      if (error.message === 'User already registered') {
        koreanError = '이미 가입된 이메일입니다.';
      } else if (error.message.includes('Invalid email')) {
        koreanError = '올바른 이메일 주소를 입력해주세요.';
      } else if (error.message.includes('Password should be at least')) {
        koreanError = '비밀번호는 6자리 이상이어야 합니다.';
      } else if (error.message.includes('Signup is disabled')) {
        koreanError = '회원가입이 비활성화되어 있습니다.';
      }
      
      return { success: false, error: koreanError };
    }
  }

  /**
   * 로그인
   * @param {string} email 
   * @param {string} password 
   */
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      this.currentUser = data.user;
      this.notifyListeners('SIGNED_IN', data.user);
      
      console.log('✅ 로그인 성공:', data.user.email);
      return { success: true, user: data.user, session: data.session };

    } catch (error) {
      console.error('❌ 로그인 실패:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 로그아웃
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      this.currentUser = null;
      this.notifyListeners('SIGNED_OUT', null);
      
      console.log('✅ 로그아웃 성공');
      return { success: true };

    } catch (error) {
      console.error('❌ 로그아웃 실패:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 현재 사용자 정보 가져오기
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      // 'Auth session missing!' 는 정상적인 비로그인 상태
      if (error && error.message === 'Auth session missing!') {
        this.currentUser = null;
        return null;
      }
      
      if (error) throw error;
      
      this.currentUser = user;
      return user;

    } catch (error) {
      console.error('❌ 사용자 정보 가져오기 실패:', error.message);
      this.currentUser = null;
      return null;
    }
  }

  /**
   * 현재 세션 가져오기
   */
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      // 'Auth session missing!' 는 정상적인 비로그인 상태
      if (error && error.message === 'Auth session missing!') {
        return null;
      }
      
      if (error) throw error;
      
      return session;

    } catch (error) {
      console.error('❌ 세션 정보 가져오기 실패:', error.message);
      return null;
    }
  }

  /**
   * 인증 상태 변경 리스너 등록
   * @param {Function} callback 
   */
  onAuthStateChange(callback) {
    this.listeners.add(callback);

    // Supabase 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email);
        
        this.currentUser = session?.user || null;
        this.notifyListeners(event, session?.user || null);
      }
    );

    // 리스너 해제 함수 반환
    return () => {
      this.listeners.delete(callback);
      subscription.unsubscribe();
    };
  }

  /**
   * 리스너들에게 상태 변경 알림
   */
  notifyListeners(event, user) {
    this.listeners.forEach(listener => {
      try {
        listener(event, user);
      } catch (error) {
        console.error('Auth listener error:', error);
      }
    });
  }

  /**
   * 로그인 상태 확인
   */
  isAuthenticated() {
    return !!this.currentUser;
  }

  /**
   * 사용자 역할 확인
   */
  getUserRole() {
    return this.currentUser?.user_metadata?.role || 'employee';
  }

  /**
   * 관리자 권한 확인
   */
  isAdmin() {
    return this.getUserRole() === 'admin';
  }

  /**
   * 매니저 권한 확인
   */
  isManager() {
    const role = this.getUserRole();
    return role === 'admin' || role === 'manager';
  }

  /**
   * 현재 비밀번호 검증
   * @param {string} password - 검증할 비밀번호
   * @returns {Promise<boolean>} - 검증 성공 여부
   */
  async verifyCurrentPassword(password) {
    try {
      if (!this.currentUser?.email) {
        throw new Error('사용자 정보가 없습니다.');
      }

      // 현재 사용자 이메일과 입력된 비밀번호로 로그인 시도
      const { data, error } = await supabase.auth.signInWithPassword({
        email: this.currentUser.email,
        password: password
      });

      if (error) {
        // 비밀번호가 틀린 경우
        console.log('비밀번호 검증 실패:', error.message);
        return false;
      }

      console.log('✅ 현재 비밀번호 검증 성공');
      return true;
    } catch (error) {
      console.error('비밀번호 검증 중 오류:', error.message);
      return false;
    }
  }

  /**
   * 비밀번호 재설정 이메일 전송
   * @param {string} email - 재설정 이메일을 받을 주소
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async sendPasswordResetEmail(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${this.getRedirectURL()}/reset-password`
      });

      if (error) {
        // Supabase 영어 에러 메시지를 한글로 변환
        let koreanError = error.message;
        
        if (error.message.includes('Invalid email')) {
          koreanError = '올바른 이메일 형식을 입력해주세요.';
        } else if (error.message.includes('Email rate limit exceeded')) {
          koreanError = '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.';
        }
        
        throw new Error(koreanError);
      }

      console.log('✅ 비밀번호 재설정 이메일 전송 성공:', email);
      return { success: true };
    } catch (error) {
      console.error('❌ 비밀번호 재설정 이메일 전송 실패:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 비밀번호 변경
   * @param {string} newPassword - 새 비밀번호
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        // Supabase 영어 에러 메시지를 한글로 변환
        let koreanError = error.message;
        
        if (error.message.includes('New password should be different from the old password')) {
          koreanError = '새 비밀번호는 기존 비밀번호와 달라야 합니다.';
        } else if (error.message.includes('Password should be at least')) {
          koreanError = '비밀번호는 6자리 이상이어야 합니다.';
        } else if (error.message.includes('Unable to validate email address')) {
          koreanError = '이메일 주소를 확인할 수 없습니다.';
        } else if (error.message.includes('Password is too weak')) {
          koreanError = '비밀번호가 너무 약합니다.';
        }
        
        throw new Error(koreanError);
      }

      console.log('✅ 비밀번호 변경 성공');
      return { success: true };
    } catch (error) {
      console.error('❌ 비밀번호 변경 실패:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// 싱글톤 인스턴스 생성
let authServiceInstance = null;

/**
 * Auth 서비스 인스턴스 가져오기
 */
export function getAuthService() {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService();
  }
  return authServiceInstance;
}

export default AuthService;
