/**
 * 限速功能单元测试
 */

import { 
  createBasicLimiter, 
  createAdvancedLimiter 
} from '../../utils/ratelimit/limiters.js';

// 模拟 Express 请求和响应对象
const mockRequest = (ip = '127.0.0.1', headers = {}) => ({
  ip,
  headers,
  get: (key) => headers[key.toLowerCase()]
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.set = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe('限速功能测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本限速器', () => {
    test('应该允许未超过限制的请求通过', () => {
      // 创建一个限速器，每分钟最多5个请求
      const limiter = createBasicLimiter({
        windowMs: 60000,
        max: 5,
        message: '请求过于频繁，请稍后再试'
      });

      const req = mockRequest();
      const res = mockResponse();

      // 模拟5个请求，都应该通过
      for (let i = 0; i < 5; i++) {
        limiter(req, res, mockNext);
        expect(mockNext).toHaveBeenCalled();
        mockNext.mockClear();
      }
    });

    test('应该阻止超过限制的请求', () => {
      // 创建一个限速器，每分钟最多3个请求
      const limiter = createBasicLimiter({
        windowMs: 60000,
        max: 3,
        message: '请求过于频繁，请稍后再试'
      });

      const req = mockRequest();
      const res = mockResponse();

      // 模拟3个请求，都应该通过
      for (let i = 0; i < 3; i++) {
        limiter(req, res, mockNext);
        expect(mockNext).toHaveBeenCalled();
        mockNext.mockClear();
      }

      // 第4个请求应该被阻止
      limiter(req, res, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'error',
        message: '请求过于频繁，请稍后再试'
      }));
    });

    test('应该设置正确的限速响应头', () => {
      // 创建一个限速器，每分钟最多2个请求
      const limiter = createBasicLimiter({
        windowMs: 60000,
        max: 2,
        standardHeaders: true
      });

      const req = mockRequest();
      const res = mockResponse();

      // 第一个请求
      limiter(req, res, mockNext);
      expect(res.set).toHaveBeenCalledWith('X-RateLimit-Limit', 2);
      expect(res.set).toHaveBeenCalledWith('X-RateLimit-Remaining', 1);
      expect(res.set).toHaveBeenCalledWith('X-RateLimit-Reset', expect.any(Number));
    });
  });

  describe('高级限速器', () => {
    test('应该根据不同的键应用不同的限制', () => {
      // 创建一个根据IP地址限速的高级限速器
      const limiter = createAdvancedLimiter({
        windowMs: 60000,
        max: 2,
        keyGenerator: (req) => req.ip
      });

      const req1 = mockRequest('192.168.1.1');
      const req2 = mockRequest('192.168.1.2');
      const res = mockResponse();

      // IP1的两个请求应该通过
      limiter(req1, res, mockNext);
      expect(mockNext).toHaveBeenCalled();
      mockNext.mockClear();

      limiter(req1, res, mockNext);
      expect(mockNext).toHaveBeenCalled();
      mockNext.mockClear();

      // IP1的第三个请求应该被阻止
      limiter(req1, res, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(429);
      mockNext.mockClear();
      res.status.mockClear();
      res.json.mockClear();

      // IP2的请求应该通过，因为它有自己的限制计数
      limiter(req2, res, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    test('应该跳过白名单IP的限速', () => {
      // 创建一个带有白名单的限速器
      const limiter = createAdvancedLimiter({
        windowMs: 60000,
        max: 1,
        skip: (req) => req.ip === '127.0.0.1'
      });

      const whitelistedReq = mockRequest('127.0.0.1');
      const normalReq = mockRequest('192.168.1.1');
      const res = mockResponse();

      // 白名单IP可以无限制请求
      for (let i = 0; i < 5; i++) {
        limiter(whitelistedReq, res, mockNext);
        expect(mockNext).toHaveBeenCalled();
        mockNext.mockClear();
      }

      // 普通IP受到限制
      limiter(normalReq, res, mockNext);
      expect(mockNext).toHaveBeenCalled();
      mockNext.mockClear();

      limiter(normalReq, res, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
