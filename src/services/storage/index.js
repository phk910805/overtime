import LocalStorageAdapter from './localStorageAdapter.js';
import SupabaseAdapter from './supabaseAdapter.js';

/**
 * 스토리지 어댑터 팩토리
 * 환경 설정에 따라 적절한 어댑터를 생성하고 반환
 */
export class StorageAdapterFactory {
  static _instance = null;

  constructor() {
    if (StorageAdapterFactory._instance) {
      return StorageAdapterFactory._instance;
    }
    
    this.adapter = null;
    StorageAdapterFactory._instance = this;
  }

  /**
   * 어댑터 초기화
   * @param {Object} config - 설정 객체
   * @param {string} config.type - 스토리지 타입 ('localStorage' | 'supabase')
   * @param {Object} config.options - 어댑터별 옵션
   */
  initialize(config) {
    const { type, options = {} } = config;

    switch (type) {
      case 'localStorage':
        this.adapter = new LocalStorageAdapter();
        break;

      case 'supabase':
        if (!options.supabaseClient) {
          throw new Error('Supabase client is required for supabase adapter');
        }
        this.adapter = new SupabaseAdapter(options.supabaseClient);
        break;

      default:
        throw new Error(`Unsupported storage type: ${type}`);
    }

    console.log(`Storage adapter initialized: ${type}`);
    return this.adapter;
  }

  /**
   * 현재 어댑터 반환
   */
  getAdapter() {
    if (!this.adapter) {
      throw new Error('Storage adapter not initialized. Call initialize() first.');
    }
    return this.adapter;
  }

  /**
   * 싱글톤 인스턴스 반환
   */
  static getInstance() {
    if (!StorageAdapterFactory._instance) {
      new StorageAdapterFactory();
    }
    return StorageAdapterFactory._instance;
  }
}

/**
 * 편의를 위한 팩토리 함수
 */
export function createStorageAdapter(config) {
  const factory = StorageAdapterFactory.getInstance();
  return factory.initialize(config);
}

/**
 * 현재 어댑터 가져오기
 */
export function getStorageAdapter() {
  const factory = StorageAdapterFactory.getInstance();
  return factory.getAdapter();
}

export default StorageAdapterFactory;
