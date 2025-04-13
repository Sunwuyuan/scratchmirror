/**
 * 统一错误处理中间件
 * 为应用程序提供一致的错误处理机制
 */

import { createErrorHandler } from '../utils/security/errorHandler.js';
import { defaultLogger } from '../utils/security/logger.js';

// 创建自定义错误处理中间件
const errorHandler = createErrorHandler({
  logErrors: true,
  showStackInDev: true,
  defaultMessage: '服务器内部错误',
  formatError: (err, req, errorResponse) => {
    // 记录错误
    defaultLogger.error(`Error processing request: ${req.method} ${req.originalUrl}`, {
      error: err.message,
      stack: err.stack,
      statusCode: err.statusCode || 500
    }, req);
    
    // 返回格式化的错误响应
    return {
      status: 'error',
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || errorResponse.message,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      // 只在开发环境中包含堆栈信息
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
    };
  }
});

export default errorHandler;
