/**
 * 负载测试脚本
 * 使用 k6 (https://k6.io/) 进行负载测试
 * 
 * 安装 k6:
 * - Linux: https://k6.io/docs/getting-started/installation/#debian-ubuntu
 * - macOS: brew install k6
 * - Windows: choco install k6
 * 
 * 运行测试:
 * k6 run load-test.js
 */

import http from 'k6/http';
import { sleep, check } from 'k6';
import { Rate } from 'k6/metrics';

// 自定义指标
const errorRate = new Rate('errors');

// 测试配置
export const options = {
  // 基本配置
  vus: 10,           // 虚拟用户数
  duration: '30s',   // 测试持续时间
  
  // 阶段式负载配置
  stages: [
    { duration: '10s', target: 10 },  // 逐渐增加到10个用户
    { duration: '1m', target: 50 },   // 1分钟内增加到50个用户
    { duration: '20s', target: 0 },   // 逐渐减少到0个用户
  ],
  
  // 阈值配置
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95%的请求应该在500ms内完成
    'http_req_duration{name:health}': ['p(99)<50'],  // 健康检查应该非常快
    'http_req_duration{name:projects}': ['p(95)<1000'],  // 项目API可以稍慢一些
    errors: ['rate<0.1'],  // 错误率应低于10%
  },
};

// 基础URL
const BASE_URL = 'http://localhost:3000';  // 修改为实际测试环境URL

// 测试数据
const PROJECT_IDS = [
  104, 105, 106, 107, 108, 109, 110,
  10128407, 10128531, 10128416, 10128568, 10128487
];

const USERNAMES = [
  'griffpatch', 'Scratch', 'ScratchCat', 'mres', 'ceebee',
  'natalie', 'paddle2see', 'harakou', 'designerd', 'cheddargirl'
];

// 主测试函数
export default function() {
  // 测试健康检查端点
  let healthRes = http.get(`${BASE_URL}/health`, {
    tags: { name: 'health' },
  });
  
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
    'health response has correct format': (r) => r.json('status') === 'healthy',
  }) || errorRate.add(1);
  
  sleep(1);
  
  // 测试API状态端点
  let statusRes = http.get(`${BASE_URL}/api/status`, {
    tags: { name: 'status' },
  });
  
  check(statusRes, {
    'status is 200': (r) => r.status === 200,
    'status response has correct format': (r) => r.json('status') === 'ok',
  }) || errorRate.add(1);
  
  sleep(1);
  
  // 测试项目API
  const randomProjectId = PROJECT_IDS[Math.floor(Math.random() * PROJECT_IDS.length)];
  let projectRes = http.get(`${BASE_URL}/projects/${randomProjectId}`, {
    tags: { name: 'projects' },
  });
  
  check(projectRes, {
    'project status is 200 or 404': (r) => r.status === 200 || r.status === 404,
  }) || errorRate.add(1);
  
  sleep(2);
  
  // 测试用户API
  const randomUsername = USERNAMES[Math.floor(Math.random() * USERNAMES.length)];
  let userRes = http.get(`${BASE_URL}/users/${randomUsername}`, {
    tags: { name: 'users' },
  });
  
  check(userRes, {
    'user status is 200 or 404': (r) => r.status === 200 || r.status === 404,
  }) || errorRate.add(1);
  
  sleep(2);
  
  // 测试缩略图API
  let thumbnailRes = http.get(`${BASE_URL}/thumbnails/${randomProjectId}`, {
    tags: { name: 'thumbnails' },
  });
  
  check(thumbnailRes, {
    'thumbnail status is 200 or 302 or 404': (r) => 
      r.status === 200 || r.status === 302 || r.status === 404,
  }) || errorRate.add(1);
  
  // 在请求之间添加随机延迟，模拟真实用户行为
  sleep(Math.random() * 3 + 1);
}
