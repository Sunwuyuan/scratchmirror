/**
 * 高级限速中间件
 * 提供更复杂的限速功能，如基于用户的限速和动态限速
 */

import { MemoryCache } from '../cache/memoryCache.js';

// 创建用于存储用户请求计数的缓存
const userRequestCache = new MemoryCache({
  ttl: 3600, // 1小时过期
  checkInterval: 300, // 5分钟清理一次
  maxSize: 10000 // 最多存储10000个用户
});

/**
 * 创建基于用户的限速中间件
 * @param {Object} options - 配置选项
 * @returns {Function} Express中间件
 */
function createUserRateLimiter(options = {}) {
  const config = {
    windowMs: options.windowMs || 60 * 60 * 1000, // 默认1小时窗口期
    max: options.max || 1000, // 默认每个用户1000个请求
    message: options.message || {
      status: 'error',
      message: '您的请求过于频繁，请稍后再试',
      retryAfter: '1小时'
    },
    getUserId: options.getUserId || ((req) => {
      // 默认从请求中获取用户ID的方法
      // 可以从请求头、cookie、查询参数等获取
      return req.headers['x-user-id'] || 
             req.query.userId || 
             (req.cookies && req.cookies.userId) || 
             'anonymous';
    }),
    keyGenerator: options.keyGenerator,
    skip: options.skip || (() => false),
    handler: options.handler
  };

  // 返回中间件函数
  return function userRateLimiter(req, res, next) {
    // 检查是否跳过限速
    if (config.skip(req, res)) {
      return next();
    }

    // 获取用户ID
    const userId = config.getUserId(req);
    
    // 生成缓存键
    const key = config.keyGenerator 
      ? config.keyGenerator(req, res) 
      : `user-rate-limit:${userId}`;
    
    // 获取当前请求计数和时间窗口
    let requestData = userRequestCache.get(key);
    const now = Date.now();
    
    if (!requestData) {
      // 如果没有记录，创建新记录
      requestData = {
        count: 0,
        resetTime: now + config.windowMs
      };
    }
    
    // 检查是否需要重置计数
    if (now > requestData.resetTime) {
      requestData = {
        count: 0,
        resetTime: now + config.windowMs
      };
    }
    
    // 增加请求计数
    requestData.count += 1;
    
    // 更新缓存
    userRequestCache.set(key, requestData, config.windowMs / 1000);
    
    // 设置RateLimit头部
    res.setHeader('X-RateLimit-Limit', config.max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, config.max - requestData.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(requestData.resetTime / 1000));
    
    // 检查是否超过限制
    if (requestData.count > config.max) {
      // 如果有自定义处理函数，使用它
      if (config.handler) {
        return config.handler(req, res, next);
      }
      
      // 默认处理：返回429状态码和错误消息
      res.status(429).json({
        ...config.message,
        limit: config.max,
        remaining: 0,
        reset: Math.ceil((requestData.resetTime - now) / 1000 / 60) // 剩余分钟
      });
      return;
    }
    
    // 继续处理请求
    next();
  };
}

/**
 * 创建动态限速中间件，根据请求特征动态调整限制
 * @param {Object} options - 配置选项
 * @returns {Function} Express中间件
 */
function createDynamicRateLimiter(options = {}) {
  const config = {
    getLimit: options.getLimit || (() => 100), // 获取限制数的函数
    windowMs: options.windowMs || 60 * 60 * 1000, // 默认1小时窗口期
    keyGenerator: options.keyGenerator || ((req) => {
      return `dynamic-rate-limit:${req.ip}`;
    }),
    message: options.message || {
      status: 'error',
      message: '请求过于频繁，请稍后再试'
    },
    skip: options.skip || (() => false),
    handler: options.handler
  };

  // 返回中间件函数
  return function dynamicRateLimiter(req, res, next) {
    // 检查是否跳过限速
    if (config.skip(req, res)) {
      return next();
    }

    // 生成缓存键
    const key = config.keyGenerator(req, res);
    
    // 获取当前请求计数和时间窗口
    let requestData = userRequestCache.get(key);
    const now = Date.now();
    
    // 获取当前请求的限制数
    const currentLimit = config.getLimit(req, res);
    
    if (!requestData) {
      // 如果没有记录，创建新记录
      requestData = {
        count: 0,
        resetTime: now + config.windowMs,
        limit: currentLimit
      };
    } else if (requestData.limit !== currentLimit) {
      // 如果限制数发生变化，更新限制数
      requestData.limit = currentLimit;
    }
    
    // 检查是否需要重置计数
    if (now > requestData.resetTime) {
      requestData = {
        count: 0,
        resetTime: now + config.windowMs,
        limit: currentLimit
      };
    }
    
    // 增加请求计数
    requestData.count += 1;
    
    // 更新缓存
    userRequestCache.set(key, requestData, config.windowMs / 1000);
    
    // 设置RateLimit头部
    res.setHeader('X-RateLimit-Limit', requestData.limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, requestData.limit - requestData.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(requestData.resetTime / 1000));
    
    // 检查是否超过限制
    if (requestData.count > requestData.limit) {
      // 如果有自定义处理函数，使用它
      if (config.handler) {
        return config.handler(req, res, next);
      }
      
      // 默认处理：返回429状态码和错误消息
      res.status(429).json({
        ...config.message,
        limit: requestData.limit,
        remaining: 0,
        reset: Math.ceil((requestData.resetTime - now) / 1000 / 60) // 剩余分钟
      });
      return;
    }
    
    // 继续处理请求
    next();
  };
}

/**
 * 获取用户限速统计信息
 * @returns {Object} 统计信息
 */
function getUserRateLimitStats() {
  return userRequestCache.getStats();
}

/**
 * 重置特定用户的限速计数
 * @param {string} userId - 用户ID
 * @returns {boolean} 是否成功重置
 */
function resetUserRateLimit(userId) {
  const key = `user-rate-limit:${userId}`;
  return userRequestCache.delete(key);
}

/**
 * 重置所有用户的限速计数
 */
function resetAllUserRateLimits() {
  userRequestCache.clear();
}

export {
  createUserRateLimiter,
  createDynamicRateLimiter,
  getUserRateLimitStats,
  resetUserRateLimit,
  resetAllUserRateLimits,
  userRequestCache
};
