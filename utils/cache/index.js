/**
 * 缓存模块入口文件
 * 导出所有缓存相关功能
 */

import { MemoryCache, defaultCache } from './memoryCache.js';
import * as cacheManager from './cacheManager.js';

export { 
  MemoryCache, 
  defaultCache,
  cacheManager
};
