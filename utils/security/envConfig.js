/**
 * 安全增强模块 - 环境变量管理
 * 提供安全的环境变量管理和验证功能
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

/**
 * 环境变量配置类
 */
class EnvConfig {
  constructor(options = {}) {
    this.config = {
      envFile: options.envFile || '.env',
      requiredVars: options.requiredVars || [],
      optionalVars: options.optionalVars || [],
      defaults: options.defaults || {},
      validators: options.validators || {},
      maskSensitive: options.maskSensitive !== undefined ? options.maskSensitive : true,
      sensitiveVars: options.sensitiveVars || [
        'PASSWORD', 'SECRET', 'KEY', 'TOKEN', 'AUTH', 'CREDENTIAL'
      ]
    };
    
    // 加载环境变量
    this.loadEnv();
    
    // 验证环境变量
    this.validateEnv();
  }
  
  /**
   * 加载环境变量
   */
  loadEnv() {
    try {
      // 检查环境文件是否存在
      const envPath = path.resolve(process.cwd(), this.config.envFile);
      if (fs.existsSync(envPath)) {
        // 加载环境文件
        const result = dotenv.config({ path: envPath });
        if (result.error) {
          console.error(`Error loading environment file: ${result.error.message}`);
        }
      } else {
        console.warn(`Environment file not found: ${this.config.envFile}`);
      }
      
      // 应用默认值
      for (const [key, value] of Object.entries(this.config.defaults)) {
        if (process.env[key] === undefined) {
          process.env[key] = value;
        }
      }
    } catch (error) {
      console.error('Error loading environment variables:', error);
    }
  }
  
  /**
   * 验证环境变量
   * @returns {boolean} 验证是否通过
   */
  validateEnv() {
    let isValid = true;
    const missingVars = [];
    const invalidVars = [];
    
    // 检查必需的环境变量
    for (const varName of this.config.requiredVars) {
      if (process.env[varName] === undefined) {
        missingVars.push(varName);
        isValid = false;
      } else if (this.config.validators[varName] && !this.config.validators[varName](process.env[varName])) {
        invalidVars.push(varName);
        isValid = false;
      }
    }
    
    // 检查可选的环境变量（如果提供了）
    for (const varName of this.config.optionalVars) {
      if (process.env[varName] !== undefined && this.config.validators[varName] && !this.config.validators[varName](process.env[varName])) {
        invalidVars.push(varName);
        isValid = false;
      }
    }
    
    // 输出验证结果
    if (!isValid) {
      if (missingVars.length > 0) {
        console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
      }
      if (invalidVars.length > 0) {
        console.error(`Invalid environment variables: ${invalidVars.join(', ')}`);
      }
    }
    
    return isValid;
  }
  
  /**
   * 获取环境变量
   * @param {string} name - 环境变量名称
   * @param {*} defaultValue - 默认值
   * @returns {string} 环境变量值
   */
  get(name, defaultValue = null) {
    return process.env[name] !== undefined ? process.env[name] : defaultValue;
  }
  
  /**
   * 获取数字类型的环境变量
   * @param {string} name - 环境变量名称
   * @param {number} defaultValue - 默认值
   * @returns {number} 环境变量值
   */
  getNumber(name, defaultValue = null) {
    const value = this.get(name);
    if (value === null) return defaultValue;
    
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  }
  
  /**
   * 获取布尔类型的环境变量
   * @param {string} name - 环境变量名称
   * @param {boolean} defaultValue - 默认值
   * @returns {boolean} 环境变量值
   */
  getBoolean(name, defaultValue = null) {
    const value = this.get(name);
    if (value === null) return defaultValue;
    
    return ['true', '1', 'yes', 'y'].includes(value.toLowerCase());
  }
  
  /**
   * 获取JSON类型的环境变量
   * @param {string} name - 环境变量名称
   * @param {*} defaultValue - 默认值
   * @returns {*} 解析后的环境变量值
   */
  getJSON(name, defaultValue = null) {
    const value = this.get(name);
    if (value === null) return defaultValue;
    
    try {
      return JSON.parse(value);
    } catch (error) {
      console.error(`Error parsing JSON from environment variable ${name}:`, error);
      return defaultValue;
    }
  }
  
  /**
   * 获取所有环境变量
   * @param {boolean} maskSensitive - 是否掩盖敏感变量
   * @returns {Object} 所有环境变量
   */
  getAll(maskSensitive = null) {
    const shouldMask = maskSensitive !== null ? maskSensitive : this.config.maskSensitive;
    const result = {};
    
    for (const [key, value] of Object.entries(process.env)) {
      // 检查是否是敏感变量
      const isSensitive = shouldMask && this.config.sensitiveVars.some(
        pattern => key.toUpperCase().includes(pattern)
      );
      
      result[key] = isSensitive ? '******' : value;
    }
    
    return result;
  }
  
  /**
   * 检查是否是生产环境
   * @returns {boolean} 是否是生产环境
   */
  isProduction() {
    const nodeEnv = this.get('NODE_ENV', '').toLowerCase();
    return nodeEnv === 'production';
  }
  
  /**
   * 检查是否是开发环境
   * @returns {boolean} 是否是开发环境
   */
  isDevelopment() {
    const nodeEnv = this.get('NODE_ENV', '').toLowerCase();
    return nodeEnv === 'development' || nodeEnv === '';
  }
  
  /**
   * 检查是否是测试环境
   * @returns {boolean} 是否是测试环境
   */
  isTest() {
    const nodeEnv = this.get('NODE_ENV', '').toLowerCase();
    return nodeEnv === 'test';
  }
}

/**
 * 常用的环境变量验证器
 */
const envValidators = {
  /**
   * 验证URL
   * @param {string} value - 要验证的值
   * @returns {boolean} 是否是有效的URL
   */
  isUrl: (value) => {
    try {
      new URL(value);
      return true;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * 验证端口号
   * @param {string} value - 要验证的值
   * @returns {boolean} 是否是有效的端口号
   */
  isPort: (value) => {
    const port = Number(value);
    return !isNaN(port) && port >= 0 && port <= 65535;
  },
  
  /**
   * 验证是否是正整数
   * @param {string} value - 要验证的值
   * @returns {boolean} 是否是正整数
   */
  isPositiveInteger: (value) => {
    const num = Number(value);
    return !isNaN(num) && Number.isInteger(num) && num > 0;
  },
  
  /**
   * 验证是否是布尔值
   * @param {string} value - 要验证的值
   * @returns {boolean} 是否是布尔值
   */
  isBoolean: (value) => {
    return ['true', 'false', '1', '0', 'yes', 'no', 'y', 'n'].includes(value.toLowerCase());
  },
  
  /**
   * 验证是否是有效的JSON
   * @param {string} value - 要验证的值
   * @returns {boolean} 是否是有效的JSON
   */
  isJSON: (value) => {
    try {
      JSON.parse(value);
      return true;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * 验证是否是有效的电子邮件
   * @param {string} value - 要验证的值
   * @returns {boolean} 是否是有效的电子邮件
   */
  isEmail: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },
  
  /**
   * 验证是否不为空
   * @param {string} value - 要验证的值
   * @returns {boolean} 是否不为空
   */
  notEmpty: (value) => {
    return value !== undefined && value !== null && value.trim() !== '';
  }
};

/**
 * 创建默认的环境配置
 * @returns {EnvConfig} 环境配置实例
 */
function createDefaultEnvConfig() {
  return new EnvConfig({
    requiredVars: [
      'NODE_ENV',
      'PORT'
    ],
    optionalVars: [
      'DATABASE_URL',
      'AXIOM_API_TOKEN',
      'AXIOM_DATASET',
      'USE_DATABASE',
      'ADMIN_API_KEY'
    ],
    defaults: {
      'NODE_ENV': 'development',
      'PORT': '3000',
      'USE_DATABASE': 'false'
    },
    validators: {
      'PORT': envValidators.isPort,
      'NODE_ENV': (value) => ['development', 'production', 'test'].includes(value)
    }
  });
}

// 创建默认环境配置实例
const defaultEnvConfig = createDefaultEnvConfig();

export {
  EnvConfig,
  envValidators,
  createDefaultEnvConfig,
  defaultEnvConfig
};
