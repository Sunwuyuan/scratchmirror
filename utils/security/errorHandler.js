/**
 * 安全增强模块 - 错误处理
 * 提供统一的错误处理机制，防止敏感信息泄露
 */

/**
 * 创建统一的错误处理中间件
 * @param {Object} options - 配置选项
 * @returns {Function} Express错误处理中间件
 */
function createErrorHandler(options = {}) {
  const config = {
    logErrors: options.logErrors !== undefined ? options.logErrors : true,
    showStackInDev: options.showStackInDev !== undefined ? options.showStackInDev : true,
    defaultMessage: options.defaultMessage || '服务器内部错误',
    formatError: options.formatError || null
  };

  // 返回错误处理中间件
  return function errorHandler(err, req, res, next) {
    // 记录错误
    if (config.logErrors) {
      console.error('Error occurred:', err);
    }

    // 确定状态码
    const statusCode = err.status || err.statusCode || 500;

    // 准备错误响应
    const errorResponse = {
      status: 'error',
      message: err.message || config.defaultMessage
    };

    // 在开发环境中添加堆栈信息
    if (config.showStackInDev && process.env.NODE_ENV === 'development') {
      errorResponse.stack = err.stack;
    }

    // 添加错误代码（如果有）
    if (err.code) {
      errorResponse.code = err.code;
    }

    // 使用自定义格式化函数（如果提供）
    const finalResponse = config.formatError 
      ? config.formatError(err, req, errorResponse) 
      : errorResponse;

    // 发送响应
    res.status(statusCode).json(finalResponse);
  };
}

/**
 * 创建API错误类
 */
class ApiError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = '无效的请求参数', code = 'BAD_REQUEST') {
    return new ApiError(message, 400, code);
  }

  static unauthorized(message = '未授权的访问', code = 'UNAUTHORIZED') {
    return new ApiError(message, 401, code);
  }

  static forbidden(message = '禁止访问此资源', code = 'FORBIDDEN') {
    return new ApiError(message, 403, code);
  }

  static notFound(message = '请求的资源不存在', code = 'NOT_FOUND') {
    return new ApiError(message, 404, code);
  }

  static methodNotAllowed(message = '不支持的请求方法', code = 'METHOD_NOT_ALLOWED') {
    return new ApiError(message, 405, code);
  }

  static tooManyRequests(message = '请求过于频繁', code = 'TOO_MANY_REQUESTS') {
    return new ApiError(message, 429, code);
  }

  static internal(message = '服务器内部错误', code = 'INTERNAL_ERROR') {
    return new ApiError(message, 500, code);
  }

  static serviceUnavailable(message = '服务暂时不可用', code = 'SERVICE_UNAVAILABLE') {
    return new ApiError(message, 503, code);
  }
}

/**
 * 创建异步处理包装器，自动捕获异步错误
 * @param {Function} fn - 异步处理函数
 * @returns {Function} 包装后的函数
 */
function asyncHandler(fn) {
  return function(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export {
  createErrorHandler,
  ApiError,
  asyncHandler
};
