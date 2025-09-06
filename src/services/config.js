/**
 * 환경 설정 관리
 * 모든 환경 변수와 설정을 중앙에서 관리
 */

export class ConfigService {
  constructor() {
    this.config = this._loadConfig();
  }

  _loadConfig() {
    // Supabase 스키마 수정 완료 - 정상 모드로 복귀
    const forceLocalStorage = false; // 수정 완료, Supabase 모드 재활성화
    
    return {
      // 스토리지 설정
      storage: {
        type: (process.env.REACT_APP_USE_SUPABASE === 'true' && !forceLocalStorage) ? 'supabase' : 'localStorage',
        supabase: {
          url: process.env.REACT_APP_SUPABASE_URL,
          anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY
        }
      },

      // API 설정
      apis: {
        holiday: process.env.REACT_APP_HOLIDAY_API_URL || 'https://holidays.hyunbin.page'
      },

      // 앱 설정
      app: {
        environment: process.env.NODE_ENV || 'development',
        version: process.env.REACT_APP_VERSION || '0.1.0'
      },

      // 기능 플래그
      features: {
        accountManagement: process.env.REACT_APP_ENABLE_ACCOUNT_MANAGEMENT === 'true'
      }
    };
  }

  /**
   * 설정 값 가져오기
   * @param {string} path - 설정 경로 (예: 'storage.type')
   * @returns {any} 설정 값
   */
  get(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this.config);
  }

  /**
   * 스토리지 설정 가져오기
   */
  getStorageConfig() {
    return this.config.storage;
  }

  /**
   * Supabase 클라이언트 생성을 위한 설정
   */
  getSupabaseConfig() {
    return {
      url: this.config.storage.supabase.url,
      anonKey: this.config.storage.supabase.anonKey
    };
  }

  /**
   * 개발 모드 여부
   */
  isDevelopment() {
    return this.config.app.environment === 'development';
  }

  /**
   * 프로덕션 모드 여부
   */
  isProduction() {
    return this.config.app.environment === 'production';
  }

  /**
   * 기능 플래그 확인
   * @param {string} feature - 기능명
   */
  isFeatureEnabled(feature) {
    return this.config.features[feature] || false;
  }

  /**
   * 전체 설정 반환 (디버깅용)
   */
  getAll() {
    return this.config;
  }

  /**
   * 설정 유효성 검사
   */
  validate() {
    const errors = [];

    // Supabase 설정 검사
    if (this.config.storage.type === 'supabase') {
      if (!this.config.storage.supabase.url) {
        errors.push('REACT_APP_SUPABASE_URL is required for supabase storage');
      }
      if (!this.config.storage.supabase.anonKey) {
        errors.push('REACT_APP_SUPABASE_ANON_KEY is required for supabase storage');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// 싱글톤 인스턴스
let configInstance = null;

/**
 * 설정 서비스 인스턴스 가져오기
 */
export function getConfig() {
  if (!configInstance) {
    configInstance = new ConfigService();
  }
  return configInstance;
}

export default ConfigService;
