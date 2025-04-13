/**
 * 限速配置模块
 * 提供针对不同API端点的差异化限速策略
 */

import rateLimit from 'express-rate-limit';

// 默认限速配置
const defaultLimiterConfig = {
  windowMs: 15 * 60 * 1000, // 15分钟窗口期
  max: 100, // 每个IP在窗口期内最多100个请求
  standardHeaders: true, // 返回标准的RateLimit头部信息
  legacyHeaders: false, // 禁用旧版头部
  message: {
    status: 'error',
    message: '请求过于频繁，请稍后再试',
    retryAfter: '15分钟'
  }
};

// 创建默认限速器
const defaultLimiter = rateLimit(defaultLimiterConfig);

// 创建严格限速器（用于敏感API）
const strictLimiter = rateLimit({
  ...defaultLimiterConfig,
  windowMs: 60 * 60 * 1000, // 1小时窗口期
  max: 30, // 每个IP在窗口期内最多30个请求
  message: {
    status: 'error',
    message: '请求过于频繁，请稍后再试',
    retryAfter: '1小时'
  }
});

// 创建宽松限速器（用于静态资源）
const relaxedLimiter = rateLimit({
  ...defaultLimiterConfig,
  windowMs: 5 * 60 * 1000, // 5分钟窗口期
  max: 300, // 每个IP在窗口期内最多300个请求
  message: {
    status: 'error',
    message: '请求过于频繁，请稍后再试',
    retryAfter: '5分钟'
  }
});

// 针对不同API端点的限速器
const apiLimiters = {
  // 项目相关API
  projects: rateLimit({
    ...defaultLimiterConfig,
    windowMs: 15 * 60 * 1000, // 15分钟窗口期
    max: 150, // 每个IP在窗口期内最多150个请求
    message: {
      status: 'error',
      message: '项目API请求过于频繁，请稍后再试',
      retryAfter: '15分钟'
    }
  }),
  
  // 用户相关API
  users: rateLimit({
    ...defaultLimiterConfig,
    windowMs: 15 * 60 * 1000, // 15分钟窗口期
    max: 100, // 每个IP在窗口期内最多100个请求
    message: {
      status: 'error',
      message: '用户API请求过于频繁，请稍后再试',
      retryAfter: '15分钟'
    }
  }),
  
  // 搜索相关API
  search: rateLimit({
    ...defaultLimiterConfig,
    windowMs: 15 * 60 * 1000, // 15分钟窗口期
    max: 50, // 每个IP在窗口期内最多50个请求
    message: {
      status: 'error',
      message: '搜索API请求过于频繁，请稍后再试',
      retryAfter: '15分钟'
    }
  }),
  
  // 缩略图相关API
  thumbnails: rateLimit({
    ...defaultLimiterConfig,
    windowMs: 5 * 60 * 1000, // 5分钟窗口期
    max: 200, // 每个IP在窗口期内最多200个请求
    message: {
      status: 'error',
      message: '缩略图API请求过于频繁，请稍后再试',
      retryAfter: '5分钟'
    }
  }),
  
  // 头像相关API
  avatars: rateLimit({
    ...defaultLimiterConfig,
    windowMs: 5 * 60 * 1000, // 5分钟窗口期
    max: 200, // 每个IP在窗口期内最多200个请求
    message: {
      status: 'error',
      message: '头像API请求过于频繁，请稍后再试',
      retryAfter: '5分钟'
    }
  }),
  
  // 工作室相关API
  studios: rateLimit({
    ...defaultLimiterConfig,
    windowMs: 15 * 60 * 1000, // 15分钟窗口期
    max: 100, // 每个IP在窗口期内最多100个请求
    message: {
      status: 'error',
      message: '工作室API请求过于频繁，请稍后再试',
      retryAfter: '15分钟'
    }
  }),
  
  // 代理相关API
  proxy: strictLimiter,
  
  // 新闻相关API
  news: relaxedLimiter
};

export {
  defaultLimiter,
  strictLimiter,
  relaxedLimiter,
  apiLimiters
};
