/**
 * Scratch API 工具模块
 * 使用 axios 替代过时的 request 库，提供更现代化的 HTTP 请求功能
 */

import axios from 'axios';
import { defaultLogger } from '../utils/security/logger.js';
import { ApiError } from '../utils/security/errorHandler.js';

// 创建 Scratch API 的 axios 实例
const scratchApiClient = axios.create({
  baseURL: 'https://api.scratch.mit.edu/',
  timeout: 10000,
  headers: {
    'User-Agent': 'ScratchMirror/1.0',
    'Accept': 'application/json'
  }
});

// 创建 Scratch 项目 API 的 axios 实例
const projectApiClient = axios.create({
  baseURL: 'https://projects.scratch.mit.edu/',
  timeout: 10000,
  headers: {
    'User-Agent': 'ScratchMirror/1.0',
    'Accept': 'application/json'
  }
});

/**
 * 从 Scratch API 获取数据
 * @param {string} path - API 路径
 * @param {Object} query - 查询参数
 * @param {Function} callback - 回调函数
 */
function fetchFromScratchAPI(path, query, callback) {
  const queryString = new URLSearchParams(query).toString();
  const url = queryString ? `${path}?${queryString}` : path;
  
  defaultLogger.debug(`Fetching from Scratch API: ${url}`);
  
  scratchApiClient.get(url)
    .then(response => {
      if (response.status === 200) {
        // 如果响应是 JSON 对象，转换为字符串
        const responseData = typeof response.data === 'object' 
          ? JSON.stringify(response.data) 
          : response.data;
        
        callback(null, responseData);
      } else {
        callback(new ApiError(`Unexpected status code: ${response.status}`, response.status));
      }
    })
    .catch(error => {
      defaultLogger.error(`Error fetching from Scratch API: ${url}`, { error: error.message });
      
      if (error.response) {
        // 服务器返回了错误状态码
        callback(new ApiError(`API error: ${error.response.status}`, error.response.status));
      } else if (error.request) {
        // 请求已发送但没有收到响应
        callback(new ApiError('No response received from API', 503));
      } else {
        // 请求配置出错
        callback(new ApiError(`Request error: ${error.message}`, 500));
      }
    });
}

/**
 * 从 Scratch 项目 API 获取数据
 * @param {string} path - API 路径
 * @param {Object} query - 查询参数
 * @param {Function} callback - 回调函数
 */
function fetchFromProjectAPI(path, query, callback) {
  const queryString = new URLSearchParams(query).toString();
  const url = queryString ? `${path}?${queryString}` : path;
  
  defaultLogger.debug(`Fetching from Project API: ${url}`);
  
  projectApiClient.get(url)
    .then(response => {
      if (response.status === 200) {
        // 如果响应是 JSON 对象，转换为字符串
        const responseData = typeof response.data === 'object' 
          ? JSON.stringify(response.data) 
          : response.data;
        
        callback(null, responseData);
      } else {
        callback(new ApiError(`Unexpected status code: ${response.status}`, response.status));
      }
    })
    .catch(error => {
      defaultLogger.error(`Error fetching from Project API: ${url}`, { error: error.message });
      
      if (error.response) {
        // 服务器返回了错误状态码
        callback(new ApiError(`API error: ${error.response.status}`, error.response.status));
      } else if (error.request) {
        // 请求已发送但没有收到响应
        callback(new ApiError('No response received from API', 503));
      } else {
        // 请求配置出错
        callback(new ApiError(`Request error: ${error.message}`, 500));
      }
    });
}

/**
 * 使用 Promise 从 Scratch API 获取数据
 * @param {string} path - API 路径
 * @param {Object} query - 查询参数
 * @returns {Promise<Object>} 响应数据
 */
function fetchFromScratchAPIAsync(path, query = {}) {
  return new Promise((resolve, reject) => {
    fetchFromScratchAPI(path, query, (error, data) => {
      if (error) {
        reject(error);
      } else {
        try {
          // 尝试解析 JSON 数据
          const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
          resolve(parsedData);
        } catch (parseError) {
          // 如果不是 JSON 数据，直接返回
          resolve(data);
        }
      }
    });
  });
}

/**
 * 使用 Promise 从 Scratch 项目 API 获取数据
 * @param {string} path - API 路径
 * @param {Object} query - 查询参数
 * @returns {Promise<Object>} 响应数据
 */
function fetchFromProjectAPIAsync(path, query = {}) {
  return new Promise((resolve, reject) => {
    fetchFromProjectAPI(path, query, (error, data) => {
      if (error) {
        reject(error);
      } else {
        try {
          // 尝试解析 JSON 数据
          const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
          resolve(parsedData);
        } catch (parseError) {
          // 如果不是 JSON 数据，直接返回
          resolve(data);
        }
      }
    });
  });
}

export { 
  fetchFromScratchAPI, 
  fetchFromProjectAPI,
  fetchFromScratchAPIAsync,
  fetchFromProjectAPIAsync,
  scratchApiClient,
  projectApiClient
};
