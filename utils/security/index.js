/**
 * 安全增强模块 - 入口文件
 * 导出所有安全相关功能
 */

import { createEnhancedCorsConfig, createDefaultCorsConfig } from './cors.js';
import { validateAndSanitizeQuery, validateAndSanitizeValue, sanitizeString, commonQuerySchemas } from './validation.js';
import { createErrorHandler, ApiError, asyncHandler } from './errorHandler.js';
import { 
  Logger, 
  defaultLogger, 
  requestIdMiddleware, 
  loggerMiddleware, 
  securityAuditMiddleware, 
  LOG_LEVELS 
} from './logger.js';
import {
  EnvConfig,
  envValidators,
  createDefaultEnvConfig,
  defaultEnvConfig
} from './envConfig.js';

export {
  // CORS配置
  createEnhancedCorsConfig,
  createDefaultCorsConfig,
  
  // 请求验证和清洁
  validateAndSanitizeQuery,
  validateAndSanitizeValue,
  sanitizeString,
  commonQuerySchemas,
  
  // 错误处理
  createErrorHandler,
  ApiError,
  asyncHandler,
  
  // 日志记录和安全审计
  Logger,
  defaultLogger,
  requestIdMiddleware,
  loggerMiddleware,
  securityAuditMiddleware,
  LOG_LEVELS,
  
  // 环境变量管理
  EnvConfig,
  envValidators,
  createDefaultEnvConfig,
  defaultEnvConfig
};
