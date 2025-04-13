/**
 * 限速模块入口文件
 * 导出所有限速相关功能
 */

import { defaultLimiter, strictLimiter, relaxedLimiter, apiLimiters } from './limiters.js';
import { 
  createUserRateLimiter, 
  createDynamicRateLimiter,
  getUserRateLimitStats,
  resetUserRateLimit,
  resetAllUserRateLimits,
  userRequestCache
} from './advancedLimiters.js';

export {
  defaultLimiter,
  strictLimiter,
  relaxedLimiter,
  apiLimiters,
  createUserRateLimiter,
  createDynamicRateLimiter,
  getUserRateLimitStats,
  resetUserRateLimit,
  resetAllUserRateLimits,
  userRequestCache
};
