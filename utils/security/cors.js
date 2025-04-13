/**
 * 安全增强模块 - CORS配置
 * 提供更严格和灵活的CORS配置
 */

/**
 * 创建增强的CORS配置
 * @param {Object} options - 配置选项
 * @returns {Object} CORS配置对象
 */
function createEnhancedCorsConfig(options = {}) {
  // 默认允许的域名列表
  const defaultAllowedDomains = [
    "localhost",
    "127.0.0.1",
    "zerocat.houlangs.com",
    "zerocat.wuyuan.dev",
    "z.8r.ink",
    "zerocatdev.github.io",
    "zeronext.wuyuan.dev",
    "scratch.190823.xyz",
    "scratch-editor.192325.xyz"
  ];

  // 合并用户提供的选项和默认选项
  const config = {
    allowedDomains: options.allowedDomains || defaultAllowedDomains,
    allowedMethods: options.allowedMethods || ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: options.allowedHeaders || ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: options.exposedHeaders || ["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
    maxAge: options.maxAge || 86400, // 预检请求结果缓存时间，默认24小时
    credentials: options.credentials !== undefined ? options.credentials : true,
    strictDomainMatching: options.strictDomainMatching !== undefined ? options.strictDomainMatching : true,
    enableWildcardSubdomains: options.enableWildcardSubdomains !== undefined ? options.enableWildcardSubdomains : false,
    logViolations: options.logViolations !== undefined ? options.logViolations : true
  };

  // 创建CORS配置对象
  return {
    origin: (origin, callback) => {
      // 如果没有origin（例如同源请求）或者是开发环境，允许请求
      if (!origin || process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }

      try {
        const originHostname = new URL(origin).hostname;
        
        // 检查是否在允许列表中
        let allowed = false;
        
        if (config.strictDomainMatching) {
          // 严格匹配模式
          allowed = config.allowedDomains.includes(originHostname);
        } else {
          // 宽松匹配模式（检查域名是否以允许的域名结尾）
          allowed = config.allowedDomains.some(domain => {
            if (config.enableWildcardSubdomains && domain.startsWith('*.')) {
              const baseDomain = domain.substring(2);
              return originHostname === baseDomain || originHostname.endsWith('.' + baseDomain);
            }
            return originHostname === domain;
          });
        }

        if (allowed) {
          callback(null, true);
        } else {
          if (config.logViolations) {
            console.warn(`CORS violation: ${origin} attempted to access the API`);
          }
          callback(new Error(`Origin ${origin} not allowed by CORS policy`));
        }
      } catch (error) {
        console.error('Error parsing origin in CORS check:', error);
        callback(new Error('Invalid origin'));
      }
    },
    methods: config.allowedMethods.join(','),
    allowedHeaders: config.allowedHeaders.join(','),
    exposedHeaders: config.exposedHeaders.join(','),
    maxAge: config.maxAge,
    credentials: config.credentials,
    preflightContinue: false,
    optionsSuccessStatus: 204
  };
}

/**
 * 创建默认的增强CORS配置
 * @returns {Object} 默认CORS配置对象
 */
function createDefaultCorsConfig() {
  return createEnhancedCorsConfig();
}

export {
  createEnhancedCorsConfig,
  createDefaultCorsConfig
};
