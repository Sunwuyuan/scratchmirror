/**
 * 安全增强模块 - 日志记录和安全审计
 * 提供详细的日志记录和安全审计功能
 */

import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';

// 日志级别
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SECURITY: 4
};

// 默认配置
const DEFAULT_CONFIG = {
  level: LOG_LEVELS.INFO,
  logToConsole: true,
  logToFile: false,
  logDir: './logs',
  logFileName: 'app.log',
  securityLogFileName: 'security.log',
  maxLogSize: 10 * 1024 * 1024, // 10MB
  maxLogFiles: 5,
  format: 'json',
  includeTimestamp: true,
  includeRequestId: true,
  maskSensitiveData: true,
  sensitiveFields: ['password', 'token', 'secret', 'authorization', 'cookie']
};

class Logger {
  constructor(options = {}) {
    this.config = { ...DEFAULT_CONFIG, ...options };
    this.logStreams = {};
    
    // 初始化日志目录和文件
    if (this.config.logToFile) {
      this.initLogFiles();
    }
  }
  
  /**
   * 初始化日志文件
   */
  initLogFiles() {
    try {
      // 创建日志目录
      if (!fs.existsSync(this.config.logDir)) {
        fs.mkdirSync(this.config.logDir, { recursive: true });
      }
      
      // 创建应用日志文件流
      const appLogPath = path.join(this.config.logDir, this.config.logFileName);
      this.logStreams.app = fs.createWriteStream(appLogPath, { flags: 'a' });
      
      // 创建安全日志文件流
      const securityLogPath = path.join(this.config.logDir, this.config.securityLogFileName);
      this.logStreams.security = fs.createWriteStream(securityLogPath, { flags: 'a' });
    } catch (error) {
      console.error('Failed to initialize log files:', error);
    }
  }
  
  /**
   * 关闭日志流
   */
  close() {
    Object.values(this.logStreams).forEach(stream => {
      if (stream && typeof stream.end === 'function') {
        stream.end();
      }
    });
  }
  
  /**
   * 记录日志
   * @param {string} level - 日志级别
   * @param {string} message - 日志消息
   * @param {Object} data - 附加数据
   * @param {Object} req - Express请求对象
   */
  log(level, message, data = {}, req = null) {
    // 检查日志级别
    if (LOG_LEVELS[level] < this.config.level) {
      return;
    }
    
    // 准备日志条目
    const logEntry = this.formatLogEntry(level, message, data, req);
    
    // 输出到控制台
    if (this.config.logToConsole) {
      console.log(this.config.format === 'json' ? JSON.stringify(logEntry) : this.formatPlainText(logEntry));
    }
    
    // 写入日志文件
    if (this.config.logToFile) {
      this.writeToLogFile(level, logEntry);
    }
  }
  
  /**
   * 格式化日志条目
   * @param {string} level - 日志级别
   * @param {string} message - 日志消息
   * @param {Object} data - 附加数据
   * @param {Object} req - Express请求对象
   * @returns {Object} 格式化的日志条目
   */
  formatLogEntry(level, message, data, req) {
    const entry = {
      level,
      message
    };
    
    // 添加时间戳
    if (this.config.includeTimestamp) {
      entry.timestamp = new Date().toISOString();
    }
    
    // 添加请求ID
    if (req && this.config.includeRequestId) {
      entry.requestId = req.id || 'unknown';
    }
    
    // 添加请求信息
    if (req) {
      entry.request = {
        method: req.method,
        url: req.originalUrl || req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      };
      
      // 添加用户信息（如果有）
      if (req.user) {
        entry.user = {
          id: req.user.id,
          username: req.user.username
        };
      }
    }
    
    // 添加附加数据
    if (data && Object.keys(data).length > 0) {
      // 如果需要，掩盖敏感数据
      const processedData = this.config.maskSensitiveData 
        ? this.maskSensitiveData(data) 
        : data;
      
      entry.data = processedData;
    }
    
    return entry;
  }
  
  /**
   * 掩盖敏感数据
   * @param {Object} data - 原始数据
   * @returns {Object} 掩盖敏感字段后的数据
   */
  maskSensitiveData(data) {
    if (!data || typeof data !== 'object') {
      return data;
    }
    
    const masked = { ...data };
    
    // 递归处理对象
    for (const [key, value] of Object.entries(masked)) {
      // 检查是否是敏感字段
      if (this.config.sensitiveFields.some(field => 
        key.toLowerCase().includes(field.toLowerCase())
      )) {
        // 掩盖敏感数据
        masked[key] = typeof value === 'string' 
          ? '******' 
          : '[REDACTED]';
      } 
      // 递归处理嵌套对象
      else if (value && typeof value === 'object') {
        masked[key] = this.maskSensitiveData(value);
      }
    }
    
    return masked;
  }
  
  /**
   * 格式化为纯文本
   * @param {Object} entry - 日志条目
   * @returns {string} 格式化的纯文本
   */
  formatPlainText(entry) {
    const parts = [];
    
    if (entry.timestamp) {
      parts.push(`[${entry.timestamp}]`);
    }
    
    parts.push(`[${entry.level}]`);
    
    if (entry.requestId) {
      parts.push(`[${entry.requestId}]`);
    }
    
    parts.push(entry.message);
    
    if (entry.request) {
      parts.push(`${entry.request.method} ${entry.request.url} (${entry.request.ip})`);
    }
    
    if (entry.user) {
      parts.push(`User: ${entry.user.username} (${entry.user.id})`);
    }
    
    if (entry.data) {
      parts.push(JSON.stringify(entry.data));
    }
    
    return parts.join(' ');
  }
  
  /**
   * 写入日志文件
   * @param {string} level - 日志级别
   * @param {Object} entry - 日志条目
   */
  writeToLogFile(level, entry) {
    try {
      const logText = this.config.format === 'json' 
        ? JSON.stringify(entry) + '\n'
        : this.formatPlainText(entry) + '\n';
      
      // 选择日志流
      const stream = level === 'SECURITY' 
        ? this.logStreams.security 
        : this.logStreams.app;
      
      if (stream) {
        stream.write(logText);
      }
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }
  
  /**
   * 记录调试日志
   * @param {string} message - 日志消息
   * @param {Object} data - 附加数据
   * @param {Object} req - Express请求对象
   */
  debug(message, data, req) {
    this.log('DEBUG', message, data, req);
  }
  
  /**
   * 记录信息日志
   * @param {string} message - 日志消息
   * @param {Object} data - 附加数据
   * @param {Object} req - Express请求对象
   */
  info(message, data, req) {
    this.log('INFO', message, data, req);
  }
  
  /**
   * 记录警告日志
   * @param {string} message - 日志消息
   * @param {Object} data - 附加数据
   * @param {Object} req - Express请求对象
   */
  warn(message, data, req) {
    this.log('WARN', message, data, req);
  }
  
  /**
   * 记录错误日志
   * @param {string} message - 日志消息
   * @param {Object} data - 附加数据
   * @param {Object} req - Express请求对象
   */
  error(message, data, req) {
    this.log('ERROR', message, data, req);
  }
  
  /**
   * 记录安全日志
   * @param {string} message - 日志消息
   * @param {Object} data - 附加数据
   * @param {Object} req - Express请求对象
   */
  security(message, data, req) {
    this.log('SECURITY', message, data, req);
  }
}

/**
 * 创建请求ID中间件
 * @returns {Function} Express中间件
 */
function requestIdMiddleware() {
  return (req, res, next) => {
    // 生成唯一请求ID
    const requestId = createHash('sha256')
      .update(`${Date.now()}-${Math.random()}`)
      .digest('hex')
      .substring(0, 16);
    
    req.id = requestId;
    
    // 添加请求ID到响应头
    res.setHeader('X-Request-ID', requestId);
    
    next();
  };
}

/**
 * 创建日志中间件
 * @param {Logger} logger - 日志记录器实例
 * @returns {Function} Express中间件
 */
function loggerMiddleware(logger) {
  return (req, res, next) => {
    // 记录请求开始
    const startTime = Date.now();
    
    logger.info('Request received', {
      method: req.method,
      url: req.originalUrl || req.url,
      query: req.query,
      headers: req.headers
    }, req);
    
    // 捕获响应完成事件
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      // 记录请求完成
      logger.info('Request completed', {
        method: req.method,
        url: req.originalUrl || req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`
      }, req);
      
      // 记录可疑请求
      if (res.statusCode >= 400) {
        const level = res.statusCode >= 500 ? 'error' : 'warn';
        logger[level](`HTTP ${res.statusCode} response`, {
          method: req.method,
          url: req.originalUrl || req.url,
          query: req.query,
          body: req.body,
          headers: req.headers,
          duration: `${duration}ms`
        }, req);
      }
    });
    
    next();
  };
}

/**
 * 创建安全审计中间件
 * @param {Logger} logger - 日志记录器实例
 * @returns {Function} Express中间件
 */
function securityAuditMiddleware(logger) {
  return (req, res, next) => {
    // 审计敏感操作
    const sensitiveRoutes = [
      { path: /\/admin/, methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { path: /\/api\/.*\/delete/, methods: ['POST', 'DELETE'] },
      { path: /\/api\/.*\/update/, methods: ['POST', 'PUT'] }
    ];
    
    // 检查是否是敏感操作
    const isSensitiveOperation = sensitiveRoutes.some(route => 
      route.path.test(req.originalUrl || req.url) && 
      route.methods.includes(req.method)
    );
    
    if (isSensitiveOperation) {
      logger.security('Sensitive operation detected', {
        method: req.method,
        url: req.originalUrl || req.url,
        query: req.query,
        body: req.body,
        user: req.user
      }, req);
    }
    
    next();
  };
}

// 创建默认日志记录器实例
const defaultLogger = new Logger();

export {
  Logger,
  defaultLogger,
  requestIdMiddleware,
  loggerMiddleware,
  securityAuditMiddleware,
  LOG_LEVELS
};
