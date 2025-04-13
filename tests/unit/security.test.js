/**
 * 安全功能单元测试
 */

import { 
  validateAndSanitizeQuery, 
  sanitizeString, 
  commonQuerySchemas 
} from '../../utils/security/validation.js';

import { 
  ApiError 
} from '../../utils/security/errorHandler.js';

import { 
  createDefaultCorsConfig 
} from '../../utils/security/cors.js';

describe('请求验证和清洁功能测试', () => {
  test('应该正确验证和清洁查询参数', () => {
    const query = {
      limit: '30',
      offset: '-5',  // 无效值
      q: '<script>alert("XSS")</script>Hello',
      sort: 'invalid'  // 无效枚举值
    };
    
    const schema = {
      limit: {
        type: 'number',
        min: 1,
        max: 100,
        default: 20
      },
      offset: {
        type: 'number',
        min: 0,
        default: 0
      },
      q: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        default: ''
      },
      sort: {
        type: 'enum',
        values: ['relevance', 'newest', 'oldest', 'popular'],
        default: 'relevance'
      }
    };
    
    const result = validateAndSanitizeQuery(query, schema);
    
    expect(result.isValid).toBe(false);  // 因为有无效值
    expect(result.errors.length).toBeGreaterThan(0);
    
    // 检查清洁后的值
    expect(result.sanitized.limit).toBe(30);
    expect(result.sanitized.offset).toBe(0);  // 使用默认值，因为原值无效
    expect(result.sanitized.q).toBe('Hello');  // 脚本标签被移除
    expect(result.sanitized.sort).toBe('relevance');  // 使用默认值，因为原值无效
  });
  
  test('应该正确清洁字符串中的危险内容', () => {
    const dirtyString = '<script>alert("XSS")</script><img src="x" onerror="alert(1)">Hello<iframe src="javascript:alert(2)"></iframe>';
    const cleanString = sanitizeString(dirtyString);
    
    expect(cleanString).not.toContain('<script>');
    expect(cleanString).not.toContain('onerror=');
    expect(cleanString).not.toContain('javascript:');
    expect(cleanString).toContain('Hello');
  });
  
  test('应该提供常用的查询参数验证模式', () => {
    expect(commonQuerySchemas.pagination).toBeDefined();
    expect(commonQuerySchemas.search).toBeDefined();
    expect(commonQuerySchemas.id).toBeDefined();
    expect(commonQuerySchemas.username).toBeDefined();
  });
});

describe('API错误处理测试', () => {
  test('应该创建正确的API错误实例', () => {
    const error = new ApiError('测试错误', 400, 'TEST_ERROR');
    
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('测试错误');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('TEST_ERROR');
  });
  
  test('应该提供便捷的错误创建方法', () => {
    const badRequestError = ApiError.badRequest('无效参数');
    expect(badRequestError.statusCode).toBe(400);
    
    const notFoundError = ApiError.notFound('资源不存在');
    expect(notFoundError.statusCode).toBe(404);
    
    const tooManyRequestsError = ApiError.tooManyRequests('请求过于频繁');
    expect(tooManyRequestsError.statusCode).toBe(429);
  });
});

describe('CORS配置测试', () => {
  test('应该创建默认的CORS配置', () => {
    const corsConfig = createDefaultCorsConfig();
    
    expect(corsConfig).toHaveProperty('origin');
    expect(corsConfig).toHaveProperty('methods');
    expect(corsConfig).toHaveProperty('credentials');
    expect(typeof corsConfig.origin).toBe('function');
  });
  
  test('CORS配置应该正确处理允许的域名', () => {
    const corsConfig = createDefaultCorsConfig();
    const originFunction = corsConfig.origin;
    
    // 模拟回调函数
    const callback = jest.fn();
    
    // 测试允许的域名
    originFunction('https://zerocat.houlangs.com', callback);
    expect(callback).toHaveBeenCalledWith(null, true);
    
    // 测试不允许的域名
    callback.mockClear();
    originFunction('https://malicious-site.com', callback);
    expect(callback).toHaveBeenCalledWith(expect.any(Error), undefined);
    
    // 测试空origin（同源请求）
    callback.mockClear();
    originFunction(null, callback);
    expect(callback).toHaveBeenCalledWith(null, true);
  });
});
