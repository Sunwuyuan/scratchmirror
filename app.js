import dotenv from 'dotenv';
dotenv.config();
import './instrumentation.js';

import createError from 'http-errors';
import express from 'express';
import setupMiddleware from './middleware/index.js';
import errorHandler from './middleware/errorHandler.js';
import { apiLimiters } from './utils/ratelimit/index.js';
import { getCacheStats } from './utils/cache/cacheManager.js';
import { getUserRateLimitStats } from './utils/ratelimit/index.js';
import { defaultEnvConfig } from './utils/security/envConfig.js';

// 处理未捕获的异常
process.on('uncaughtException', function (err) {
  console.error('Caught exception: ', err);
});

// 创建Express应用
const app = express();

// 应用中间件
setupMiddleware(app);

// 导入路由
import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import projectsRouter from './routes/projects.js';
import thumbnailsRouter from './routes/thumbnails.js';
import avatarsRouter from './routes/avatars.js';
import studiosRouter from './routes/studios.js';
import proxyRouter from './routes/proxy.js';
import asdmRouter from './routes/asdm.js';
import newsRouter from './routes/news.js';

// 应用路由和路由特定的限速中间件
app.use('/', indexRouter);
app.use('/users', apiLimiters.users, usersRouter);
app.use('/projects', apiLimiters.projects, projectsRouter);
app.use('/thumbnails', apiLimiters.thumbnails, thumbnailsRouter);
app.use('/avatars', apiLimiters.avatars, avatarsRouter);
app.use('/studios', apiLimiters.studios, studiosRouter);
app.use('/proxy', apiLimiters.proxy, proxyRouter);
app.use('/asdm', apiLimiters.proxy, asdmRouter); // 使用与proxy相同的严格限制
app.use('/news', apiLimiters.news, newsRouter);

// 添加API状态和限速统计端点
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: defaultEnvConfig.isDevelopment() ? 'development' : 'production'
  });
});

app.get('/api/stats', (req, res) => {
  // 只允许本地或授权请求访问统计信息
  const isAuthorized = req.ip === '127.0.0.1' || 
                       req.ip === '::1' || 
                       req.headers['x-admin-key'] === process.env.ADMIN_API_KEY;
  
  if (!isAuthorized) {
    return res.status(403).json({
      status: 'error',
      message: '没有权限访问此资源'
    });
  }
  
  res.json({
    status: 'ok',
    rateLimit: getUserRateLimitStats(),
    cache: getCacheStats(),
    memory: {
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024)
    }
  });
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// 捕获404并转发到错误处理程序
app.use(function(req, res, next) {
  next(createError(404));
});

// 错误处理中间件
app.use(errorHandler);

export default app;
