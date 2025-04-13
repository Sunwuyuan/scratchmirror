import { Router } from "express";
var router = Router();
import { fetchFromScratchAPI } from "../utils/scratchAPI.js";
import { cacheManager } from "../utils/cache/index.js";

router.get("/:username", function (req, res) {
  const username = req.params.username;
  
  // 尝试从缓存获取头像数据
  const cachedAvatar = cacheManager.getAvatarFromCache(username);
  if (cachedAvatar) {
    // 如果是Buffer或字符串形式的图片数据，直接返回
    if (typeof cachedAvatar === 'string' && cachedAvatar.startsWith('data:image')) {
      const base64Data = cachedAvatar.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      res.set('Content-Type', 'image/png');
      return res.send(buffer);
    }
    // 如果是URL，重定向到该URL
    else if (typeof cachedAvatar === 'string' && (cachedAvatar.startsWith('http://') || cachedAvatar.startsWith('https://'))) {
      return res.redirect(cachedAvatar);
    }
    // 如果是JSON对象，返回JSON
    else if (typeof cachedAvatar === 'object') {
      return res.status(200).send(cachedAvatar);
    }
  }
  
  // 如果缓存中没有，先尝试获取用户信息以找到正确的头像ID
  fetchFromScratchAPI(`users/${username}/`, {}, function (error, data) {
    if (error) {
      console.error(`Error fetching user ${username} for avatar:`, error);
      // 如果获取用户信息失败，使用默认头像URL
      const defaultAvatarUrl = `https://cdn2.scratch.mit.edu/get_image/user/default_32x32.png`;
      cacheManager.cacheAvatar(username, defaultAvatarUrl, 3600); // 缓存1小时
      return res.redirect(defaultAvatarUrl);
    } else {
      try {
        const userData = JSON.parse(data);
        // 从用户数据中获取头像ID
        const avatarId = userData.id;
        const avatarUrl = `https://cdn2.scratch.mit.edu/get_image/user/${avatarId}_60x60.png`;
        
        // 缓存头像URL
        cacheManager.cacheAvatar(username, avatarUrl, 86400); // 缓存24小时
        
        // 同时缓存用户数据
        cacheManager.cacheUserData(userData).catch(console.error);
        
        return res.redirect(avatarUrl);
      } catch (e) {
        console.error(`Error parsing user data for avatar ${username}:`, e);
        // 如果解析失败，使用用户名作为ID尝试获取头像
        const avatarUrl = `https://cdn2.scratch.mit.edu/get_image/user/${username}_60x60.png`;
        cacheManager.cacheAvatar(username, avatarUrl, 3600); // 缓存1小时
        return res.redirect(avatarUrl);
      }
    }
  });
});

export default router;
