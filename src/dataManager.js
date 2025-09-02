// ========== STORAGE MANAGER ==========
class StorageManager {
  constructor() {
    this.cache = new Map();
    this.maxCacheSize = 100;
  }

  _evictOldestCache() {
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  save(key, data) {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
      this._evictOldestCache();
      this.cache.set(key, data);
      return true;
    } catch (error) {
      console.error('Failed to save to storage:', error);
      return false;
    }
  }

  load(key, defaultValue = []) {
    try {
      if (this.cache.has(key)) {
        return this.cache.get(key);
      }
      
      const item = localStorage.getItem(key);
      const data = item ? JSON.parse(item) : defaultValue;
      this._evictOldestCache();
      this.cache.set(key, data);
      return data;
    } catch (error) {
      console.error('Failed to load from storage:', error);
      return defaultValue;
    }
  }

  loadSettings() {
    return this.load('overtime-settings', { multiplier: 1.0 });
  }

  saveSettings(settings) {
    return this.save('overtime-settings', settings);
  }

  clearCache() {
    this.cache.clear();
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
    const cacheKey = `${selectedMonth}`;
    
    if (this.filteredRecordsCache.has(cacheKey)) {
      return this.filteredRecordsCache.get(cacheKey);
    }

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

    this._evictOldestCache(this.filteredRecordsCache);
    this.filteredRecordsCache.set(cacheKey, result);
    return result;
  }

  getMonthlyStats(employeeId, selectedMonth, overtimeRecords, vacationRecords, multiplier = 1.0) {
    const cacheKey = `${employeeId}-${selectedMonth}-${multiplier}`;
    
    if (this.statsCache.has(cacheKey)) {
      return this.statsCache.get(cacheKey);
    }

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
      multiplier: multiplier
    };

    this._evictOldestCache(this.statsCache);
    this.statsCache.set(cacheKey, result);
    return result;
  }

  getDailyData(employeeId, date, type, overtimeRecords, vacationRecords) {
    const cacheKey = `${employeeId}-${date}-${type}`;
    
    if (this.dailyDataCache.has(cacheKey)) {
      return this.dailyDataCache.get(cacheKey);
    }

    const records = type === 'overtime' ? overtimeRecords : vacationRecords;
    const dayRecords = records
      .filter(record => record.employeeId === employeeId && record.date === date)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const result = dayRecords[0]?.totalMinutes || 0;
    
    this._evictOldestCache(this.dailyDataCache);
    this.dailyDataCache.set(cacheKey, result);
    return result;
  }
}

export const dataCalculator = new DataCalculator();
