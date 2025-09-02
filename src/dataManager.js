// ========== STORAGE MANAGER ==========
class StorageManager {
  constructor() {
    this.cache = new Map();
    this.maxCacheSize = 100;
    this.statistics = {
      hits: 0,
      misses: 0,
      evictions: 0
    };
    this.keyTypes = new Map(); // key 타입별 분류
    this.lastCleanup = Date.now();
  }

  _evictOldestCache() {
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
      this.keyTypes.delete(oldestKey);
      this.statistics.evictions++;
    }
  }

  _shouldCleanup() {
    return Date.now() - this.lastCleanup > 300000; // 5분마다
  }

  _performCleanup() {
    const now = Date.now();
    const expiredKeys = [];
    
    for (const [key, data] of this.cache) {
      if (data.timestamp && now - data.timestamp > 1800000) { // 30분 TTL
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => {
      this.cache.delete(key);
      this.keyTypes.delete(key);
    });
    
    this.lastCleanup = now;
    console.log(`Cache cleanup: removed ${expiredKeys.length} expired entries`);
  }

  _optimizeCache() {
    if (this.cache.size > this.maxCacheSize * 0.8) {
      // 타입별 우선순위: statistics > employee > settings
      const priorityOrder = ['statistics', 'employee', 'settings'];
      const keysToEvict = [];
      
      for (const type of priorityOrder.reverse()) {
        if (this.cache.size <= this.maxCacheSize * 0.6) break;
        
        for (const [key, keyType] of this.keyTypes) {
          if (keyType === type) {
            keysToEvict.push(key);
            if (this.cache.size - keysToEvict.length <= this.maxCacheSize * 0.6) break;
          }
        }
      }
      
      keysToEvict.forEach(key => {
        this.cache.delete(key);
        this.keyTypes.delete(key);
      });
      
      this.statistics.evictions += keysToEvict.length;
    }
  }

  save(key, data, type = 'default') {
    try {
      if (this._shouldCleanup()) {
        this._performCleanup();
      }
      
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
      
      this._evictOldestCache();
      
      const cacheData = {
        data,
        timestamp: Date.now(),
        size: serializedData.length
      };
      
      this.cache.set(key, cacheData);
      this.keyTypes.set(key, type);
      
      this._optimizeCache();
      
      return true;
    } catch (error) {
      console.error('Failed to save to storage:', error);
      return false;
    }
  }

  load(key, defaultValue = [], type = 'default') {
    try {
      if (this.cache.has(key)) {
        const cachedData = this.cache.get(key);
        this.statistics.hits++;
        
        // TTL 검사
        if (cachedData.timestamp && Date.now() - cachedData.timestamp > 1800000) {
          this.cache.delete(key);
          this.keyTypes.delete(key);
          this.statistics.misses++;
        } else {
          return cachedData.data;
        }
      }
      
      this.statistics.misses++;
      const item = localStorage.getItem(key);
      const data = item ? JSON.parse(item) : defaultValue;
      
      this._evictOldestCache();
      
      const cacheData = {
        data,
        timestamp: Date.now(),
        size: item ? item.length : 0
      };
      
      this.cache.set(key, cacheData);
      this.keyTypes.set(key, type);
      
      return data;
    } catch (error) {
      console.error('Failed to load from storage:', error);
      return defaultValue;
    }
  }

  loadSettings() {
    return this.load('overtime-settings', { multiplier: 1.0 }, 'settings');
  }

  saveSettings(settings) {
    return this.save('overtime-settings', settings, 'settings');
  }

  clearCache() {
    this.cache.clear();
    this.keyTypes.clear();
    this.statistics = { hits: 0, misses: 0, evictions: 0 };
  }

  getCacheStats() {
    const hitRate = this.statistics.hits + this.statistics.misses > 0 
      ? (this.statistics.hits / (this.statistics.hits + this.statistics.misses) * 100).toFixed(2)
      : '0.00';
    
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      hitRate: `${hitRate}%`,
      statistics: this.statistics,
      memoryUsage: Array.from(this.cache.values()).reduce((total, item) => total + (item.size || 0), 0)
    };
  }

  // 타입별 캐시 삭제
  clearCacheByType(type) {
    const keysToDelete = [];
    for (const [key, keyType] of this.keyTypes) {
      if (keyType === type) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.keyTypes.delete(key);
    });
  }
}

export const storageManager = new StorageManager();

// ========== DATA CALCULATOR ==========
class DataCalculator {
  constructor() {
    this.statsCache = new Map();
    this.dailyDataCache = new Map();
    this.filteredRecordsCache = new Map();
    this.maxCacheSize = 200;
  }

  _evictOldestCache(cache) {
    if (cache.size >= this.maxCacheSize) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }
  }

  clearCache() {
    this.statsCache.clear();
    this.dailyDataCache.clear();
    this.filteredRecordsCache.clear();
  }

  _getFilteredMonthlyRecords(selectedMonth, overtimeRecords, vacationRecords) {
    const     const cacheKey = `${selectedMonth}-${overtimeRecords.length}-${vacationRecords.length}`;
    
    const cached = this._getCacheEntry(this.filteredRecordsCache, cacheKey);
    if (cached) return cached;

    const [year, month] = selectedMonth.split('-');

    const filterByMonth = (records) => records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getFullYear() === parseInt(year) && 
             (recordDate.getMonth() + 1).toString().padStart(2, '0') === month;
    });

    const result = {
      overtimeRecords: filterByMonth(overtimeRecords),
      vacationRecords: filterByMonth(vacationRecords)
    };

    this._setCacheEntry(this.filteredRecordsCache, cacheKey, result);
    return result;
  }

  getMonthlyStats(employeeId, selectedMonth, overtimeRecords, vacationRecords, multiplier = 1.0) {
    const cacheKey = `${employeeId || 'all'}-${selectedMonth}-${multiplier}-${overtimeRecords.length}-${vacationRecords.length}`;
    
    const cached = this._getCacheEntry(this.statsCache, cacheKey);
    if (cached) return cached;

    this.statistics.calculations++;

    const { overtimeRecords: monthlyOvertime, vacationRecords: monthlyVacation } = 
      this._getFilteredMonthlyRecords(selectedMonth, overtimeRecords, vacationRecords);

    const filterByEmployee = (records) => employeeId ? 
      records.filter(record => record.employeeId === employeeId) : records;

    const employeeOvertime = filterByEmployee(monthlyOvertime);
    const employeeVacation = filterByEmployee(monthlyVacation);

    const calculateLatestTotals = (records) => {
      const latestRecords = new Map();
      
      records.forEach(record => {
        const key = `${record.employeeId}-${record.date}`;
        const existing = latestRecords.get(key);
        
        if (!existing || new Date(record.createdAt) > new Date(existing.createdAt)) {
          latestRecords.set(key, record);
        }
      });
      
      return Array.from(latestRecords.values()).reduce((sum, record) => sum + record.totalMinutes, 0);
    };

    const totalOvertimeMinutes = calculateLatestTotals(employeeOvertime);
    const totalVacationMinutes = calculateLatestTotals(employeeVacation);
    
    const adjustedOvertimeMinutes = Math.round(totalOvertimeMinutes * multiplier);

    const result = {
      totalOvertime: totalOvertimeMinutes,
      totalVacation: totalVacationMinutes,
      adjustedOvertime: adjustedOvertimeMinutes,
      remaining: adjustedOvertimeMinutes - totalVacationMinutes,
      multiplier: multiplier,
      calculatedAt: Date.now()
    };

    this._setCacheEntry(this.statsCache, cacheKey, result);
    return result;
  }

  getDailyData(employeeId, date, type, overtimeRecords, vacationRecords) {
    const recordsHash = type === 'overtime' ? overtimeRecords.length : vacationRecords.length;
    const cacheKey = `${employeeId}-${date}-${type}-${recordsHash}`;
    
    const cached = this._getCacheEntry(this.dailyDataCache, cacheKey);
    if (cached) return cached;

    const records = type === 'overtime' ? overtimeRecords : vacationRecords;
    const dayRecords = records
      .filter(record => record.employeeId === employeeId && record.date === date)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const result = dayRecords[0]?.totalMinutes || 0;
    
    this._setCacheEntry(this.dailyDataCache, cacheKey, result);
    return result;
  }

  // 캐시 무효화 (데이터 변경 시 호출)
  invalidateRelatedCaches(employeeId = null, date = null) {
    const keysToDelete = [];
    
    [this.statsCache, this.dailyDataCache, this.filteredRecordsCache].forEach(cache => {
      for (const key of cache.keys()) {
        if (employeeId && key.includes(employeeId)) {
          keysToDelete.push({ cache, key });
        } else if (date && key.includes(date)) {
          keysToDelete.push({ cache, key });
        }
      }
    });
    
    keysToDelete.forEach(({ cache, key }) => {
      cache.delete(key);
    });
    
    if (keysToDelete.length > 0) {
      console.log(`Invalidated ${keysToDelete.length} cache entries`);
    }
  }
}

export const dataCalculator = new DataCalculator();
