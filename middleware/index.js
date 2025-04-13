/**
 * 应用程序入口中间件
 * 集中配置和应用所有中间件
 */

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { createDefaultCorsConfig } from '../utils/security/cors.js';
import { requestIdMiddleware, loggerMiddleware, securityAuditMiddleware, defaultLogger } from '../utils/security/logger.js';
import { defaultLimiter } from '../utils/ratelimit/index.js';
import errorHandler from './errorHandler.js';

/**
 * 配置应用程序中间件
 * @param {express.Application} app - Express应用实例
 */
function setupMiddleware(app) {
  // 请求ID中间件
  app.use(requestIdMiddleware());
  
  // CORS配置
  app.use(cors(createDefaultCorsConfig()));
  
  // 日志中间件
  app.use(logger('dev'));
  app.use(loggerMiddleware(defaultLogger));
  
  // 安全审计中间件
  app.use(securityAuditMiddleware(defaultLogger));
  
  // 全局限速中间件
  app.use(defaultLimiter);
  
  // 请求解析中间件
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  
  // 视图引擎设置
  app.set('views', process.cwd() + '/views');
  app.set('view engine', 'ejs');
  
  return app;
}

export default setupMiddleware;
