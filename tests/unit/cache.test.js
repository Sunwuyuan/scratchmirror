/**
 * 缓存管理器单元测试
 */

import { MemoryCache } from '../../utils/cache/memoryCache.js';
import { CacheManager } from '../../utils/cache/cacheManager.js';

// 模拟时间函数
jest.useFakeTimers();

describe('MemoryCache', () => {
  let cache;

  beforeEach(() => {
    cache = new MemoryCache({
      maxSize: 100,
      defaultTTL: 1000,
      cleanupInterval: 500
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  test('应该正确设置和获取缓存项', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  test('应该返回undefined当获取不存在的缓存项', () => {
    expect(cache.get('nonexistent')).toBeUndefined();
  });

  test('应该在TTL过期后删除缓存项', () => {
    cache.set('key2', 'value2', 100); // 100ms TTL
    expect(cache.get('key2')).toBe('value2');
    
    // 前进150ms
    jest.advanceTimersByTime(150);
    
    expect(cache.get('key2')).toBeUndefined();
  });

  test('应该在达到最大大小时删除最旧的缓存项', () => {
    const smallCache = new MemoryCache({ maxSize: 2 });
    
    smallCache.set('key1', 'value1');
    smallCache.set('key2', 'value2');
    expect(smallCache.size()).toBe(2);
    
    smallCache.set('key3', 'value3');
    expect(smallCache.size()).toBe(2);
    expect(smallCache.get('key1')).toBeUndefined();
    expect(smallCache.get('key2')).toBe('value2');
    expect(smallCache.get('key3')).toBe('value3');
  });

  test('应该正确计算缓存命中率', () => {
    cache.set('key1', 'value1');
    
    // 两次命中
    cache.get('key1');
    cache.get('key1');
    
    // 一次未命中
    cache.get('nonexistent');
    
    expect(cache.getStats().hits).toBe(2);
    expect(cache.getStats().misses).toBe(1);
    expect(cache.getStats().hitRate).toBe(2/3);
  });

  test('应该正确清除所有缓存项', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    expect(cache.size()).toBe(2);
    
    cache.clear();
    expect(cache.size()).toBe(0);
    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBeUndefined();
  });
});

describe('CacheManager', () => {
  let cacheManager;

  beforeEach(() => {
    cacheManager = new CacheManager({
      projectsCache: new MemoryCache({ maxSize: 100, defaultTTL: 1000 }),
      usersCache: new MemoryCache({ maxSize: 100, defaultTTL: 1000 }),
      thumbnailsCache: new MemoryCache({ maxSize: 100, defaultTTL: 1000 }),
      avatarsCache: new MemoryCache({ maxSize: 100, defaultTTL: 1000 })
    });
  });

  test('应该正确获取所有缓存的统计信息', () => {
    // 设置一些缓存项
    cacheManager.projectsCache.set('project1', { id: 1, name: 'Test Project' });
    cacheManager.usersCache.set('user1', { id: 1, username: 'testuser' });
    
    // 获取一些缓存项
    cacheManager.projectsCache.get('project1');
    cacheManager.projectsCache.get('project2'); // 未命中
    cacheManager.usersCache.get('user1');
    
    const stats = cacheManager.getStats();
    
    expect(stats).toHaveProperty('projects');
    expect(stats).toHaveProperty('users');
    expect(stats).toHaveProperty('thumbnails');
    expect(stats).toHaveProperty('avatars');
    
    expect(stats.projects.hits).toBe(1);
    expect(stats.projects.misses).toBe(1);
    expect(stats.users.hits).toBe(1);
    expect(stats.users.misses).toBe(0);
  });

  test('应该正确预热缓存', async () => {
    // 模拟数据获取函数
    const mockDataFetcher = jest.fn().mockResolvedValue([
      { id: 1, name: 'Project 1' },
      { id: 2, name: 'Project 2' }
    ]);
    
    await cacheManager.preloadCache('projects', mockDataFetcher, 'id');
    
    expect(mockDataFetcher).toHaveBeenCalled();
    expect(cacheManager.projectsCache.get('1')).toEqual({ id: 1, name: 'Project 1' });
    expect(cacheManager.projectsCache.get('2')).toEqual({ id: 2, name: 'Project 2' });
  });
});
