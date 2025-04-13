/**
 * 缓存管理器
 * 统一管理内存缓存和数据库缓存，提供一致的缓存接口
 */

import { MemoryCache, defaultCache } from './memoryCache.js';
import { cacheUser, cacheUsers, cacheProject, cacheProjects } from '../cacheData.js';
import { PrismaClient } from '@prisma/client';

// 环境变量配置
const useDatabase = process.env.USE_DATABASE === 'true';
const prisma = useDatabase ? new PrismaClient() : null;

// 为不同类型的资源创建独立的缓存实例
const caches = {
  users: new MemoryCache({ ttl: 3600 }), // 用户缓存1小时
  projects: new MemoryCache({ ttl: 1800 }), // 项目缓存30分钟
  thumbnails: new MemoryCache({ ttl: 7200 }), // 缩略图缓存2小时
  avatars: new MemoryCache({ ttl: 7200 }), // 头像缓存2小时
  studios: new MemoryCache({ ttl: 3600 }), // 工作室缓存1小时
  search: new MemoryCache({ ttl: 600 }), // 搜索结果缓存10分钟
};

/**
 * 缓存键生成器
 * @param {string} type - 缓存类型
 * @param {string|number} id - 资源ID
 * @param {Object} [params] - 附加参数
 * @returns {string} 缓存键
 */
function generateCacheKey(type, id, params = {}) {
  let key = `${type}:${id}`;
  
  if (Object.keys(params).length > 0) {
    const paramsStr = Object.entries(params)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    key += `:${paramsStr}`;
  }
  
  return key;
}

/**
 * 获取用户数据，优先从缓存获取
 * @param {number} userId - 用户ID
 * @returns {Promise<Object|null>} 用户数据
 */
async function getUserWithCache(userId) {
  const cacheKey = generateCacheKey('user', userId);
  
  // 尝试从内存缓存获取
  const cachedUser = caches.users.get(cacheKey);
  if (cachedUser) {
    return cachedUser;
  }
  
  // 如果启用了数据库，尝试从数据库获取
  if (useDatabase && prisma) {
    try {
      const dbUser = await prisma.scratchmirror_users.findUnique({
        where: { id: userId }
      });
      
      if (dbUser) {
        // 转换为API格式
        const formattedUser = formatUserFromDb(dbUser);
        // 存入内存缓存
        caches.users.set(cacheKey, formattedUser);
        return formattedUser;
      }
    } catch (error) {
      console.error(`Error fetching user ${userId} from database:`, error);
    }
  }
  
  return null;
}

/**
 * 获取项目数据，优先从缓存获取
 * @param {number} projectId - 项目ID
 * @returns {Promise<Object|null>} 项目数据
 */
async function getProjectWithCache(projectId) {
  const cacheKey = generateCacheKey('project', projectId);
  
  // 尝试从内存缓存获取
  const cachedProject = caches.projects.get(cacheKey);
  if (cachedProject) {
    return cachedProject;
  }
  
  // 如果启用了数据库，尝试从数据库获取
  if (useDatabase && prisma) {
    try {
      const dbProject = await prisma.scratchmirror_projects.findUnique({
        where: { id: BigInt(projectId) }
      });
      
      if (dbProject) {
        // 转换为API格式
        const formattedProject = formatProjectFromDb(dbProject);
        // 存入内存缓存
        caches.projects.set(cacheKey, formattedProject);
        return formattedProject;
      }
    } catch (error) {
      console.error(`Error fetching project ${projectId} from database:`, error);
    }
  }
  
  return null;
}

/**
 * 缓存用户数据到内存和数据库
 * @param {Object} userData - 用户数据
 */
async function cacheUserData(userData) {
  if (!userData || !userData.id) return;
  
  const cacheKey = generateCacheKey('user', userData.id);
  
  // 存入内存缓存
  caches.users.set(cacheKey, userData);
  
  // 存入数据库缓存
  try {
    await cacheUser(userData);
  } catch (error) {
    console.error(`Error caching user ${userData.id} to database:`, error);
  }
}

/**
 * 缓存项目数据到内存和数据库
 * @param {Object} projectData - 项目数据
 */
async function cacheProjectData(projectData) {
  if (!projectData || !projectData.id) return;
  
  const cacheKey = generateCacheKey('project', projectData.id);
  
  // 存入内存缓存
  caches.projects.set(cacheKey, projectData);
  
  // 存入数据库缓存
  try {
    await cacheProject(projectData);
  } catch (error) {
    console.error(`Error caching project ${projectData.id} to database:`, error);
  }
}

/**
 * 缓存搜索或探索结果
 * @param {string} type - 搜索类型 (search/explore)
 * @param {Object} params - 搜索参数
 * @param {Array} results - 搜索结果
 * @param {number} [ttl] - 缓存时间（秒）
 */
function cacheSearchResults(type, params, results, ttl) {
  const cacheKey = generateCacheKey(type, 'projects', params);
  caches.search.set(cacheKey, results, ttl);
  
  // 同时缓存结果中的项目和用户数据
  if (Array.isArray(results)) {
    results.forEach(item => {
      if (item.type === 'project' && item.id) {
        caches.projects.set(generateCacheKey('project', item.id), item);
      }
    });
  }
}

/**
 * 获取缓存的搜索或探索结果
 * @param {string} type - 搜索类型 (search/explore)
 * @param {Object} params - 搜索参数
 * @returns {Array|null} 缓存的搜索结果
 */
function getSearchResultsFromCache(type, params) {
  const cacheKey = generateCacheKey(type, 'projects', params);
  return caches.search.get(cacheKey);
}

/**
 * 缓存缩略图数据
 * @param {number} id - 缩略图ID
 * @param {string} imageData - 图片数据
 * @param {number} [ttl] - 缓存时间（秒）
 */
function cacheThumbnail(id, imageData, ttl) {
  const cacheKey = generateCacheKey('thumbnail', id);
  caches.thumbnails.set(cacheKey, imageData, ttl);
}

/**
 * 获取缓存的缩略图数据
 * @param {number} id - 缩略图ID
 * @returns {string|null} 缓存的图片数据
 */
function getThumbnailFromCache(id) {
  const cacheKey = generateCacheKey('thumbnail', id);
  return caches.thumbnails.get(cacheKey);
}

/**
 * 缓存头像数据
 * @param {number} id - 用户ID
 * @param {string} imageData - 图片数据
 * @param {number} [ttl] - 缓存时间（秒）
 */
function cacheAvatar(id, imageData, ttl) {
  const cacheKey = generateCacheKey('avatar', id);
  caches.avatars.set(cacheKey, imageData, ttl);
}

/**
 * 获取缓存的头像数据
 * @param {number} id - 用户ID
 * @returns {string|null} 缓存的图片数据
 */
function getAvatarFromCache(id) {
  const cacheKey = generateCacheKey('avatar', id);
  return caches.avatars.get(cacheKey);
}

/**
 * 获取所有缓存的统计信息
 * @returns {Object} 缓存统计信息
 */
function getCacheStats() {
  const stats = {};
  
  for (const [name, cache] of Object.entries(caches)) {
    stats[name] = cache.getStats();
  }
  
  return stats;
}

/**
 * 清除特定类型的缓存
 * @param {string} type - 缓存类型
 */
function clearCache(type) {
  if (caches[type]) {
    caches[type].clear();
  }
}

/**
 * 清除所有缓存
 */
function clearAllCaches() {
  for (const cache of Object.values(caches)) {
    cache.clear();
  }
}

/**
 * 从数据库格式转换为API格式的用户数据
 * @param {Object} dbUser - 数据库用户数据
 * @returns {Object} API格式的用户数据
 */
function formatUserFromDb(dbUser) {
  return {
    id: dbUser.id,
    username: dbUser.username,
    scratchteam: dbUser.scratchteam === 1,
    history: {
      joined: dbUser.history_joined
    },
    profile: {
      id: dbUser.profile_id,
      status: dbUser.status,
      bio: dbUser.bio,
      country: dbUser.country
    }
  };
}

/**
 * 从数据库格式转换为API格式的项目数据
 * @param {Object} dbProject - 数据库项目数据
 * @returns {Object} API格式的项目数据
 */
function formatProjectFromDb(dbProject) {
  return {
    id: Number(dbProject.id),
    title: dbProject.title,
    description: dbProject.description,
    instructions: dbProject.instructions,
    visibility: dbProject.visibility,
    public: dbProject.public,
    comments_allowed: dbProject.comments_allowed,
    is_published: dbProject.is_published,
    author_id: Number(dbProject.author_id),
    image: dbProject.image,
    history: {
      created: dbProject.history_created_at,
      modified: dbProject.history_modified_at,
      shared: dbProject.history_shared_at
    },
    stats: {
      views: dbProject.stats_views,
      loves: dbProject.stats_loves,
      favorites: dbProject.stats_favorites,
      remixes: dbProject.stats_remixes
    },
    remix: {
      parent: dbProject.remix_parent,
      root: dbProject.remix_root
    }
  };
}

/**
 * 预热缓存
 * @param {string} type - 缓存类型
 * @param {number} limit - 预热数量限制
 */
async function warmupCache(type, limit = 100) {
  if (!useDatabase || !prisma) return;
  
  try {
    if (type === 'users') {
      const users = await prisma.scratchmirror_users.findMany({
        take: limit,
        orderBy: { id: 'desc' }
      });
      
      users.forEach(dbUser => {
        const user = formatUserFromDb(dbUser);
        const cacheKey = generateCacheKey('user', user.id);
        caches.users.set(cacheKey, user);
      });
      
      console.log(`Warmed up cache with ${users.length} users`);
    } else if (type === 'projects') {
      const projects = await prisma.scratchmirror_projects.findMany({
        take: limit,
        orderBy: { id: 'desc' }
      });
      
      projects.forEach(dbProject => {
        const project = formatProjectFromDb(dbProject);
        const cacheKey = generateCacheKey('project', project.id);
        caches.projects.set(cacheKey, project);
      });
      
      console.log(`Warmed up cache with ${projects.length} projects`);
    }
  } catch (error) {
    console.error(`Error warming up ${type} cache:`, error);
  }
}

export {
  getUserWithCache,
  getProjectWithCache,
  cacheUserData,
  cacheProjectData,
  cacheSearchResults,
  getSearchResultsFromCache,
  cacheThumbnail,
  getThumbnailFromCache,
  cacheAvatar,
  getAvatarFromCache,
  getCacheStats,
  clearCache,
  clearAllCaches,
  warmupCache,
  generateCacheKey,
  caches
};
