import { Router } from "express";
var router = Router();
import { fetchFromScratchAPI } from "../utils/scratchAPI.js";
import { cacheUser } from "../utils/cacheData.js";
import { cacheManager } from "../utils/cache/index.js";

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/:username", async function (req, res) {
  const username = req.params.username;
  
  // 尝试从缓存获取用户数据（通过用户名）
  // 注意：这里使用特殊的缓存键格式，因为我们是通过用户名而不是ID查询
  const cacheKey = `user:username:${username}`;
  const cachedUser = cacheManager.caches.users.get(cacheKey);
  if (cachedUser) {
    return res.status(200).send(JSON.stringify(cachedUser));
  }
  
  fetchFromScratchAPI(`users/${username}/`, {}, function (error, data) {
    if (error) {
      console.error(`Error fetching user ${username}:`, error);
      res.status(500).send({
        message: "An error occurred while fetching user.",
        error: error.message || "Unknown error"
      });
    } else {
      try {
        const userData = JSON.parse(data);
        
        // 使用新的缓存管理器缓存用户数据
        cacheManager.cacheUserData(userData).catch(console.error);
        
        // 同时使用用户名作为键缓存
        cacheManager.caches.users.set(cacheKey, userData);
        
        // 保持向后兼容，也使用旧的缓存方法
        cacheUser(userData).catch(console.error);
      } catch (e) {
        console.error(`Error parsing or caching user ${username}:`, e);
      }
      
      res.status(200).send(data);
    }
  });
});

router.get("/:username/projects", function (req, res) {
  const username = req.params.username;
  const { limit, offset } = req.query;
  const params = { limit: limit || 20, offset: offset || 0 };
  
  // 尝试从缓存获取结果
  const cacheKey = `user:${username}:projects`;
  const cachedProjects = cacheManager.caches.users.get(cacheKey);
  if (cachedProjects) {
    return res.status(200).send(JSON.stringify(cachedProjects));
  }
  
  fetchFromScratchAPI(`users/${username}/projects`, params, function (error, data) {
    if (error) {
      console.error(`Error fetching projects for user ${username}:`, error);
      res.status(500).send({
        message: "An error occurred while fetching user projects.",
        error: error.message || "Unknown error"
      });
    } else {
      // 缓存结果
      try {
        const projectsData = JSON.parse(data);
        cacheManager.caches.users.set(cacheKey, projectsData, 1800); // 30分钟缓存
        
        // 缓存结果中的项目数据
        if (Array.isArray(projectsData)) {
          projectsData.forEach(project => {
            cacheManager.cacheProjectData(project).catch(console.error);
          });
        }
      } catch (e) {
        console.error(`Error parsing or caching projects for user ${username}:`, e);
      }
      
      res.status(200).send(data);
    }
  });
});

router.get("/:username/favorites", function (req, res) {
  const username = req.params.username;
  const { limit, offset } = req.query;
  const params = { limit: limit || 20, offset: offset || 0 };
  
  // 尝试从缓存获取结果
  const cacheKey = `user:${username}:favorites`;
  const cachedFavorites = cacheManager.caches.users.get(cacheKey);
  if (cachedFavorites) {
    return res.status(200).send(JSON.stringify(cachedFavorites));
  }
  
  fetchFromScratchAPI(`users/${username}/favorites`, params, function (error, data) {
    if (error) {
      console.error(`Error fetching favorites for user ${username}:`, error);
      res.status(500).send({
        message: "An error occurred while fetching user favorites.",
        error: error.message || "Unknown error"
      });
    } else {
      // 缓存结果
      try {
        const favoritesData = JSON.parse(data);
        cacheManager.caches.users.set(cacheKey, favoritesData, 1800); // 30分钟缓存
        
        // 缓存结果中的项目数据
        if (Array.isArray(favoritesData)) {
          favoritesData.forEach(project => {
            cacheManager.cacheProjectData(project).catch(console.error);
          });
        }
      } catch (e) {
        console.error(`Error parsing or caching favorites for user ${username}:`, e);
      }
      
      res.status(200).send(data);
    }
  });
});

router.get("/:username/following", function (req, res) {
  const username = req.params.username;
  const { limit, offset } = req.query;
  const params = { limit: limit || 20, offset: offset || 0 };
  
  // 尝试从缓存获取结果
  const cacheKey = `user:${username}:following`;
  const cachedFollowing = cacheManager.caches.users.get(cacheKey);
  if (cachedFollowing) {
    return res.status(200).send(JSON.stringify(cachedFollowing));
  }
  
  fetchFromScratchAPI(`users/${username}/following`, params, function (error, data) {
    if (error) {
      console.error(`Error fetching following for user ${username}:`, error);
      res.status(500).send({
        message: "An error occurred while fetching user following.",
        error: error.message || "Unknown error"
      });
    } else {
      // 缓存结果
      try {
        const followingData = JSON.parse(data);
        cacheManager.caches.users.set(cacheKey, followingData, 3600); // 1小时缓存
        
        // 缓存结果中的用户数据
        if (Array.isArray(followingData)) {
          followingData.forEach(user => {
            cacheManager.cacheUserData(user).catch(console.error);
          });
        }
      } catch (e) {
        console.error(`Error parsing or caching following for user ${username}:`, e);
      }
      
      res.status(200).send(data);
    }
  });
});

router.get("/:username/followers", function (req, res) {
  const username = req.params.username;
  const { limit, offset } = req.query;
  const params = { limit: limit || 20, offset: offset || 0 };
  
  // 尝试从缓存获取结果
  const cacheKey = `user:${username}:followers`;
  const cachedFollowers = cacheManager.caches.users.get(cacheKey);
  if (cachedFollowers) {
    return res.status(200).send(JSON.stringify(cachedFollowers));
  }
  
  fetchFromScratchAPI(`users/${username}/followers`, params, function (error, data) {
    if (error) {
      console.error(`Error fetching followers for user ${username}:`, error);
      res.status(500).send({
        message: "An error occurred while fetching user followers.",
        error: error.message || "Unknown error"
      });
    } else {
      // 缓存结果
      try {
        const followersData = JSON.parse(data);
        cacheManager.caches.users.set(cacheKey, followersData, 3600); // 1小时缓存
        
        // 缓存结果中的用户数据
        if (Array.isArray(followersData)) {
          followersData.forEach(user => {
            cacheManager.cacheUserData(user).catch(console.error);
          });
        }
      } catch (e) {
        console.error(`Error parsing or caching followers for user ${username}:`, e);
      }
      
      res.status(200).send(data);
    }
  });
});

export default router;
