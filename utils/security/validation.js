/**
 * 安全增强模块 - 请求验证和清洁
 * 提供请求参数验证和清洁功能，防止注入攻击和恶意输入
 */

import { URL } from 'url';

/**
 * 验证并清洁查询参数
 * @param {Object} query - 请求查询参数
 * @param {Object} schema - 参数验证模式
 * @returns {Object} 清洁后的参数和验证结果
 */
function validateAndSanitizeQuery(query, schema) {
  const result = {
    isValid: true,
    sanitized: {},
    errors: []
  };

  // 遍历模式中定义的每个参数
  for (const [param, rules] of Object.entries(schema)) {
    const value = query[param];
    
    // 如果参数是必需的但未提供
    if (rules.required && (value === undefined || value === null || value === '')) {
      result.isValid = false;
      result.errors.push(`参数 ${param} 是必需的`);
      continue;
    }
    
    // 如果参数未提供但有默认值
    if ((value === undefined || value === null || value === '') && rules.default !== undefined) {
      result.sanitized[param] = rules.default;
      continue;
    }
    
    // 如果参数未提供且不是必需的
    if (value === undefined || value === null || value === '') {
      continue;
    }
    
    // 根据类型验证和清洁
    switch (rules.type) {
      case 'string':
        if (typeof value !== 'string') {
          result.sanitized[param] = String(value);
        } else {
          // 清洁字符串，移除潜在的危险字符
          let sanitized = value;
          if (rules.sanitize !== false) {
            sanitized = sanitizeString(value, rules.allowHtml);
          }
          
          // 验证长度
          if (rules.minLength !== undefined && sanitized.length < rules.minLength) {
            result.isValid = false;
            result.errors.push(`参数 ${param} 长度不能小于 ${rules.minLength}`);
          }
          
          if (rules.maxLength !== undefined && sanitized.length > rules.maxLength) {
            result.isValid = false;
            result.errors.push(`参数 ${param} 长度不能大于 ${rules.maxLength}`);
            // 截断过长的字符串
            sanitized = sanitized.substring(0, rules.maxLength);
          }
          
          // 验证模式
          if (rules.pattern && !rules.pattern.test(sanitized)) {
            result.isValid = false;
            result.errors.push(`参数 ${param} 格式不正确`);
          }
          
          result.sanitized[param] = sanitized;
        }
        break;
        
      case 'number':
        let numValue;
        if (typeof value === 'number') {
          numValue = value;
        } else {
          numValue = Number(value);
          if (isNaN(numValue)) {
            result.isValid = false;
            result.errors.push(`参数 ${param} 必须是数字`);
            continue;
          }
        }
        
        // 验证范围
        if (rules.min !== undefined && numValue < rules.min) {
          result.isValid = false;
          result.errors.push(`参数 ${param} 不能小于 ${rules.min}`);
          numValue = rules.min;
        }
        
        if (rules.max !== undefined && numValue > rules.max) {
          result.isValid = false;
          result.errors.push(`参数 ${param} 不能大于 ${rules.max}`);
          numValue = rules.max;
        }
        
        result.sanitized[param] = numValue;
        break;
        
      case 'boolean':
        if (typeof value === 'boolean') {
          result.sanitized[param] = value;
        } else if (typeof value === 'string') {
          const lowerValue = value.toLowerCase();
          if (['true', '1', 'yes', 'y'].includes(lowerValue)) {
            result.sanitized[param] = true;
          } else if (['false', '0', 'no', 'n'].includes(lowerValue)) {
            result.sanitized[param] = false;
          } else {
            result.isValid = false;
            result.errors.push(`参数 ${param} 必须是布尔值`);
          }
        } else {
          result.sanitized[param] = Boolean(value);
        }
        break;
        
      case 'array':
        let arrayValue;
        if (Array.isArray(value)) {
          arrayValue = value;
        } else if (typeof value === 'string') {
          try {
            // 尝试解析JSON数组
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
              arrayValue = parsed;
            } else {
              // 尝试按逗号分隔
              arrayValue = value.split(',').map(item => item.trim());
            }
          } catch (e) {
            // 按逗号分隔
            arrayValue = value.split(',').map(item => item.trim());
          }
        } else {
          result.isValid = false;
          result.errors.push(`参数 ${param} 必须是数组`);
          continue;
        }
        
        // 验证数组长度
        if (rules.minItems !== undefined && arrayValue.length < rules.minItems) {
          result.isValid = false;
          result.errors.push(`参数 ${param} 项目数不能小于 ${rules.minItems}`);
        }
        
        if (rules.maxItems !== undefined && arrayValue.length > rules.maxItems) {
          result.isValid = false;
          result.errors.push(`参数 ${param} 项目数不能大于 ${rules.maxItems}`);
          // 截断过长的数组
          arrayValue = arrayValue.slice(0, rules.maxItems);
        }
        
        // 如果有项目类型验证
        if (rules.items && rules.items.type) {
          const itemResults = arrayValue.map((item, index) => 
            validateAndSanitizeValue(item, rules.items, `${param}[${index}]`)
          );
          
          const invalidItems = itemResults.filter(item => !item.isValid);
          if (invalidItems.length > 0) {
            result.isValid = false;
            invalidItems.forEach(item => {
              result.errors.push(...item.errors);
            });
          }
          
          arrayValue = itemResults.map(item => item.value);
        }
        
        result.sanitized[param] = arrayValue;
        break;
        
      case 'url':
        try {
          const url = new URL(value);
          // 只允许http和https协议
          if (!['http:', 'https:'].includes(url.protocol)) {
            result.isValid = false;
            result.errors.push(`参数 ${param} 必须是有效的http或https URL`);
          } else {
            result.sanitized[param] = url.toString();
          }
        } catch (e) {
          result.isValid = false;
          result.errors.push(`参数 ${param} 必须是有效的URL`);
        }
        break;
        
      case 'enum':
        if (!rules.values || !Array.isArray(rules.values)) {
          throw new Error(`参数 ${param} 的enum类型必须提供values数组`);
        }
        
        if (!rules.values.includes(value)) {
          result.isValid = false;
          result.errors.push(`参数 ${param} 必须是以下值之一: ${rules.values.join(', ')}`);
          // 使用默认值或第一个有效值
          result.sanitized[param] = rules.default !== undefined ? rules.default : rules.values[0];
        } else {
          result.sanitized[param] = value;
        }
        break;
        
      default:
        // 未知类型，保持原样
        result.sanitized[param] = value;
    }
  }
  
  // 处理未在模式中定义的参数
  for (const [param, value] of Object.entries(query)) {
    if (schema[param] === undefined) {
      // 如果模式中没有定义此参数，根据策略决定是否保留
      if (schema._allowUnknown === true) {
        result.sanitized[param] = value;
      }
      // 否则忽略未知参数
    }
  }
  
  return result;
}

/**
 * 验证并清洁单个值
 * @param {*} value - 要验证的值
 * @param {Object} rules - 验证规则
 * @param {string} paramName - 参数名称（用于错误消息）
 * @returns {Object} 验证结果
 */
function validateAndSanitizeValue(value, rules, paramName) {
  const result = {
    isValid: true,
    value: value,
    errors: []
  };
  
  // 根据类型验证和清洁
  switch (rules.type) {
    case 'string':
      if (typeof value !== 'string') {
        result.value = String(value);
      } else {
        // 清洁字符串
        let sanitized = value;
        if (rules.sanitize !== false) {
          sanitized = sanitizeString(value, rules.allowHtml);
        }
        
        // 验证长度
        if (rules.minLength !== undefined && sanitized.length < rules.minLength) {
          result.isValid = false;
          result.errors.push(`${paramName} 长度不能小于 ${rules.minLength}`);
        }
        
        if (rules.maxLength !== undefined && sanitized.length > rules.maxLength) {
          result.isValid = false;
          result.errors.push(`${paramName} 长度不能大于 ${rules.maxLength}`);
          // 截断过长的字符串
          sanitized = sanitized.substring(0, rules.maxLength);
        }
        
        // 验证模式
        if (rules.pattern && !rules.pattern.test(sanitized)) {
          result.isValid = false;
          result.errors.push(`${paramName} 格式不正确`);
        }
        
        result.value = sanitized;
      }
      break;
      
    case 'number':
      let numValue;
      if (typeof value === 'number') {
        numValue = value;
      } else {
        numValue = Number(value);
        if (isNaN(numValue)) {
          result.isValid = false;
          result.errors.push(`${paramName} 必须是数字`);
          return result;
        }
      }
      
      // 验证范围
      if (rules.min !== undefined && numValue < rules.min) {
        result.isValid = false;
        result.errors.push(`${paramName} 不能小于 ${rules.min}`);
        numValue = rules.min;
      }
      
      if (rules.max !== undefined && numValue > rules.max) {
        result.isValid = false;
        result.errors.push(`${paramName} 不能大于 ${rules.max}`);
        numValue = rules.max;
      }
      
      result.value = numValue;
      break;
      
    // 其他类型的处理类似...
  }
  
  return result;
}

/**
 * 清洁字符串，移除潜在的危险字符
 * @param {string} str - 要清洁的字符串
 * @param {boolean} allowHtml - 是否允许HTML标签
 * @returns {string} 清洁后的字符串
 */
function sanitizeString(str, allowHtml = false) {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  let sanitized = str;
  
  // 如果不允许HTML，移除所有HTML标签
  if (!allowHtml) {
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  }
  
  // 移除控制字符
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  
  // 移除脚本标签（即使allowHtml为true）
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // 移除on*事件处理程序
  sanitized = sanitized.replace(/\bon\w+=\s*[^>\s]*/gi, '');
  
  // 移除javascript:协议
  sanitized = sanitized.replace(/javascript\s*:/gi, '');
  
  return sanitized;
}

/**
 * 创建常用的查询参数验证模式
 */
const commonQuerySchemas = {
  // 分页参数
  pagination: {
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
    page: {
      type: 'number',
      min: 1,
      default: 1
    }
  },
  
  // 搜索参数
  search: {
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
  },
  
  // ID参数
  id: {
    id: {
      type: 'number',
      min: 1,
      required: true
    }
  },
  
  // 用户名参数
  username: {
    username: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_-]+$/,
      required: true
    }
  }
};

export {
  validateAndSanitizeQuery,
  validateAndSanitizeValue,
  sanitizeString,
  commonQuerySchemas
};
