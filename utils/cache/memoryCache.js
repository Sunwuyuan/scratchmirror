/**
 * 内存缓存模块
 * 提供高性能的内存缓存功能，支持TTL过期、缓存统计和自动清理
 */

class MemoryCache {
  constructor(options = {}) {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
    };
    this.options = {
      ttl: options.ttl || 3600, // 默认缓存时间1小时（秒）
      checkInterval: options.checkInterval || 300, // 默认清理间隔5分钟（秒）
      maxSize: options.maxSize || 1000, // 默认最大缓存项数量
    };

    // 启动定期清理过期缓存的任务
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.options.checkInterval * 1000);
  }

  /**
   * 获取缓存项
   * @param {string} key - 缓存键
   * @returns {*} 缓存值或undefined（如果不存在或已过期）
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return undefined;
    }

    // 检查是否过期
    if (item.expiry && item.expiry < Date.now()) {
      this.delete(key);
      this.stats.misses++;
      return undefined;
    }

    this.stats.hits++;
    return item.value;
  }

  /**
   * 设置缓存项
   * @param {string} key - 缓存键
   * @param {*} value - 缓存值
   * @param {number} [ttl] - 过期时间（秒），不指定则使用默认值
   */
  set(key, value, ttl) {
    // 如果达到最大缓存项数量，且当前键不存在，则清理最旧的项
    if (this.cache.size >= this.options.maxSize && !this.cache.has(key)) {
      this.evictOldest();
    }

    const expiry = ttl !== undefined 
      ? Date.now() + (ttl * 1000) 
      : Date.now() + (this.options.ttl * 1000);

    this.cache.set(key, {
      value,
      expiry,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
    });
    
    this.stats.sets++;
  }

  /**
   * 删除缓存项
   * @param {string} key - 缓存键
   * @returns {boolean} 是否成功删除
   */
  delete(key) {
    const result = this.cache.delete(key);
    if (result) {
      this.stats.deletes++;
    }
    return result;
  }

  /**
   * 清空所有缓存
   */
  clear() {
    this.cache.clear();
    this.resetStats();
  }

  /**
   * 检查键是否存在且未过期
   * @param {string} key - 缓存键
   * @returns {boolean} 是否存在且未过期
   */
  has(key) {
    const item = this.cache.get(key);
    if (!item) return false;
    
    // 检查是否过期
    if (item.expiry && item.expiry < Date.now()) {
      this.delete(key);
      return false;
    }
    
    // 更新最后访问时间
    item.lastAccessed = Date.now();
    return true;
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses === 0 
      ? 0 
      : this.stats.hits / (this.stats.hits + this.stats.misses);
    
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: hitRate.toFixed(2),
    };
  }

  /**
   * 重置统计信息
   */
  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
    };
  }

  /**
   * 清理过期的缓存项
   */
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.expiry && item.expiry < now) {
        this.delete(key);
      }
    }
  }

  /**
   * 驱逐最旧的缓存项
   * @private
   */
  evictOldest() {
    let oldestKey = null;
    let oldestTime = Infinity;
    
    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestKey = key;
        oldestTime = item.lastAccessed;
      }
    }
    
    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  /**
   * 停止清理任务
   */
  stop() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// 创建默认缓存实例
const defaultCache = new MemoryCache();

export { MemoryCache, defaultCache };
