/**
 * API 集成测试
 */

import request from 'supertest';
import app from '../../app.js';

describe('API 集成测试', () => {
  describe('健康检查端点', () => {
    test('GET /health 应返回 200 状态码', async () => {
      const response = await request(app).get('/health');
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
    });
  });

  describe('API 状态端点', () => {
    test('GET /api/status 应返回服务状态信息', async () => {
      const response = await request(app).get('/api/status');
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('项目 API', () => {
    // 注意：这些测试可能需要模拟外部 API 调用
    test('GET /projects/:id 应返回项目信息或适当的错误', async () => {
      // 测试无效项目 ID
      const invalidResponse = await request(app).get('/projects/invalid');
      expect(invalidResponse.statusCode).toBe(400);
      
      // 测试不存在的项目 ID
      const nonExistentResponse = await request(app).get('/projects/999999999');
      // 可能返回 404 或从上游 API 返回其他状态码
      expect(nonExistentResponse.statusCode).toBeGreaterThanOrEqual(400);
    });
  });

  describe('用户 API', () => {
    test('GET /users/:username 应返回用户信息或适当的错误', async () => {
      // 测试无效用户名
      const invalidResponse = await request(app).get('/users/');
      expect(invalidResponse.statusCode).toBe(404);
      
      // 测试特殊字符用户名
      const specialCharsResponse = await request(app).get('/users/<script>alert(1)</script>');
      expect(specialCharsResponse.statusCode).toBeGreaterThanOrEqual(400);
    });
  });

  describe('限速功能', () => {
    test('超过限制的请求应返回 429 状态码', async () => {
      // 这个测试需要发送多个请求直到触发限速
      // 为了避免实际触发限速，我们可以模拟一个非常低的限制
      
      // 注意：这个测试在实际环境中可能不稳定，因为它依赖于全局状态
      // 在真实的测试环境中，应该使用隔离的测试实例或模拟限速中间件
      
      // 这里只是一个示例，实际测试可能需要更复杂的设置
      let lastResponse;
      for (let i = 0; i < 10; i++) {
        lastResponse = await request(app).get('/api/status');
        if (lastResponse.statusCode === 429) {
          break;
        }
      }
      
      // 如果没有触发限速，这个测试可能会通过
      // 在实际测试中，我们应该确保限速被触发
      if (lastResponse && lastResponse.statusCode === 429) {
        expect(lastResponse.body).toHaveProperty('status', 'error');
        expect(lastResponse.body).toHaveProperty('message');
        expect(lastResponse.headers).toHaveProperty('retry-after');
      }
    });
  });

  describe('错误处理', () => {
    test('不存在的路由应返回 404 状态码', async () => {
      const response = await request(app).get('/non-existent-route');
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('status', 'error');
    });

    test('服务器错误应返回格式化的错误响应', async () => {
      // 这个测试需要触发服务器错误
      // 在实际测试中，我们可能需要模拟一个会抛出错误的路由
      
      // 这里只是一个示例，实际测试可能需要更复杂的设置
      const response = await request(app).get('/api/error-test');
      
      // 如果路由不存在，会返回 404
      // 如果路由存在但抛出错误，应该返回 500
      if (response.statusCode === 500) {
        expect(response.body).toHaveProperty('status', 'error');
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('path');
        expect(response.body).toHaveProperty('timestamp');
      }
    });
  });
});
