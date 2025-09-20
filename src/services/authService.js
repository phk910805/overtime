// src/services/authService.js
// 사용자 인증 관리 서비스

/**
 * 사용자 역할 상수
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

/**
 * 인증 서비스 클래스
 */
export class AuthService {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.currentUser = null;
    this.authStateListeners = [];
  }

  // ========== 인증 상태 관리 ==========

  /**
   * 현재 인증 상태 조회
   */
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      if (error) throw error;
      
      if (session?.user) {
        // 사용자 프로필 정보도 함께 로드
        await this.loadUserProfile(session.user.id);
      }
      
      return session;
    } catch (error) {
      console.error('세션 조회 실패:', error);
      return null;
    }
  }

  /**
   * 사용자 프로필 정보 로드
   */
  async loadUserProfile(userId) {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      this.currentUser = data;
      return data;
    } catch (error) {
      console.error('사용자 프로필 로드 실패:', error);
      return null;
    }
  }

  /**
   * 인증 상태 변경 리스너 등록
   */
  onAuthStateChange(callback) {
    this.authStateListeners.push(callback);
    
    // Supabase 인증 상태 변경 리스너
    const { data: { subscription } } = this.supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await this.loadUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          this.currentUser = null;
        }
        
        // 모든 리스너에게 알림
        this.authStateListeners.forEach(listener => {
          listener(event, session, this.currentUser);
        });
      }
    );

    // 구독 해제 함수 반환
    return () => {
      subscription.unsubscribe();
      this.authStateListeners = this.authStateListeners.filter(l => l !== callback);
    };
  }

  // ========== 로그인/로그아웃 ==========

  /**
   * 이메일/비밀번호 로그인
   */
  async signIn(email, password) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        await this.loadUserProfile(data.user.id);
      }

      return { user: this.currentUser, session: data.session };
    } catch (error) {
      console.error('로그인 실패:', error);
      throw error;
    }
  }

  /**
   * 회원가입
   */
  async signUp(email, password, name, role = USER_ROLES.USER) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('회원가입 실패:', error);
      throw error;
    }
  }

  /**
   * 로그아웃
   */
  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
      
      this.currentUser = null;
      return true;
    } catch (error) {
      console.error('로그아웃 실패:', error);
      throw error;
    }
  }

  // ========== 권한 확인 ==========

  /**
   * 현재 사용자 정보 조회
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * 로그인 상태 확인
   */
  isAuthenticated() {
    return !!this.currentUser;
  }

  /**
   * 관리자 권한 확인
   */
  isAdmin() {
    return this.currentUser?.role === USER_ROLES.ADMIN;
  }

  /**
   * 특정 권한 확인 (향후 확장용)
   */
  hasPermission(permission) {
    if (!this.currentUser) return false;
    
    // 현재는 관리자만 모든 권한 보유
    if (this.currentUser.role === USER_ROLES.ADMIN) return true;
    
    // 향후 세분화된 권한 시스템 구현 시 확장
    // return this.currentUser.permissions?.includes(permission);
    
    return false;
  }

  /**
   * 급여 정보 접근 권한 확인
   */
  canAccessSalaryInfo() {
    return this.hasPermission('salary_access') || this.isAdmin();
  }

  /**
   * 보상 관리 권한 확인
   */
  canManageCompensation() {
    return this.hasPermission('compensation_manage') || this.isAdmin();
  }

  // ========== 프로필 관리 ==========

  /**
   * 사용자 프로필 업데이트
   */
  async updateProfile(updates) {
    try {
      if (!this.currentUser) throw new Error('로그인이 필요합니다.');

      const { data, error } = await this.supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', this.currentUser.id)
        .select()
        .single();

      if (error) throw error;
      
      this.currentUser = { ...this.currentUser, ...data };
      return this.currentUser;
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      throw error;
    }
  }

  /**
   * 비밀번호 변경
   */
  async updatePassword(newPassword) {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('비밀번호 변경 실패:', error);
      throw error;
    }
  }

  // ========== 관리자 기능 ==========

  /**
   * 모든 사용자 조회 (관리자만)
   */
  async getAllUsers() {
    try {
      if (!this.isAdmin()) {
        throw new Error('관리자 권한이 필요합니다.');
      }

      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('사용자 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 사용자 역할 변경 (관리자만)
   */
  async updateUserRole(userId, newRole) {
    try {
      if (!this.isAdmin()) {
        throw new Error('관리자 권한이 필요합니다.');
      }

      const { data, error } = await this.supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('사용자 역할 변경 실패:', error);
      throw error;
    }
  }

  // ========== 유틸리티 ==========

  /**
   * 이메일 형식 검증
   */
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 비밀번호 강도 검증
   */
  static validatePassword(password) {
    const minLength = 6;
    const errors = [];

    if (password.length < minLength) {
      errors.push(`비밀번호는 최소 ${minLength}자 이상이어야 합니다.`);
    }

    if (!/[A-Za-z]/.test(password)) {
      errors.push('비밀번호에 영문자가 포함되어야 합니다.');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('비밀번호에 숫자가 포함되어야 합니다.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * 인증 서비스 인스턴스 생성 함수
 */
export const createAuthService = (supabaseClient) => {
  return new AuthService(supabaseClient);
};
