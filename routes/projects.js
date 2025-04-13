import { Router } from "express";
var router = Router();
import { fetchFromScratchAPI, fetchFromProjectAPI } from "../utils/scratchAPI.js";
import { cacheProject } from "../utils/cacheData.js";
import { cacheManager } from "../utils/cache/index.js";

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/explore/projects", function (req, res) {
  const { limit, language, mode, q, offset } = req.query;
  const params = { 
    limit: limit || 16, 
    language: language || "zh-cn", 
    mode: mode || "popular", 
    q: q || "*", 
    offset: offset || 0 
  };
  
  // 尝试从缓存获取结果
  const cachedResults = cacheManager.getSearchResultsFromCache('explore', params);
  if (cachedResults) {
    return res.status(200).send(cachedResults);
  }
  
  fetchFromScratchAPI("explore/projects", params, function (error, data) {
    if (error) {
      console.error("Error fetching explore projects:", error);
      res.status(500).send({
        message: "An error occurred while fetching explore projects.",
        error: error.message || "Unknown error"
      });
    } else {
      // 缓存结果，设置10分钟过期时间
      try {
        const parsedData = JSON.parse(data);
        cacheManager.cacheSearchResults('explore', params, parsedData, 600);
        
        // 缓存结果中的项目数据
        if (Array.isArray(parsedData)) {
          parsedData.forEach(project => {
            cacheManager.cacheProjectData(project).catch(console.error);
          });
        }
      } catch (e) {
        console.error("Error parsing or caching explore results:", e);
      }
      
      res.status(200).send(data);
    }
  });
});

router.get("/search/projects", function (req, res) {
  const { limit, language, mode, q, offset } = req.query;
  const params = { 
    limit: limit || 16, 
    language: language || "zh-cn", 
    mode: mode || "popular", 
    q: q || "*", 
    offset: offset || 0 
  };
  
  // 尝试从缓存获取结果
  const cachedResults = cacheManager.getSearchResultsFromCache('search', params);
  if (cachedResults) {
    return res.status(200).send(cachedResults);
  }
  
  fetchFromScratchAPI("search/projects", params, function (error, data) {
    if (error) {
      console.error("Error searching projects:", error);
      res.status(500).send({
        message: "An error occurred while searching projects.",
        error: error.message || "Unknown error"
      });
    } else {
      // 缓存结果，设置5分钟过期时间（搜索结果变化较快）
      try {
        const parsedData = JSON.parse(data);
        cacheManager.cacheSearchResults('search', params, parsedData, 300);
        
        // 缓存结果中的项目数据
        if (Array.isArray(parsedData)) {
          parsedData.forEach(project => {
            cacheManager.cacheProjectData(project).catch(console.error);
          });
        }
      } catch (e) {
        console.error("Error parsing or caching search results:", e);
      }
      
      res.status(200).send(data);
    }
  });
});

router.get("/source/:id", function (req, res) {
  const projectId = req.params.id;
  const token = req.query.token;
  
  fetchFromProjectAPI(`${projectId}?token=${token}`, {}, function (error, data) {
    if (error) {
      console.error(`Error fetching project source for ID ${projectId}:`, error);
      res.status(500).send({
        message: "An error occurred while fetching project source.",
        error: error.message || "Unknown error"
      });
    } else {
      res.status(200).send(data);
    }
  });
});

router.get("/:id", async function (req, res) {
  const projectId = req.params.id;
  
  // 尝试从缓存获取项目数据
  try {
    const cachedProject = await cacheManager.getProjectWithCache(projectId);
    if (cachedProject) {
      return res.status(200).send(JSON.stringify(cachedProject));
    }
  } catch (error) {
    console.error(`Error fetching project ${projectId} from cache:`, error);
  }
  
  fetchFromScratchAPI(`projects/${projectId}/`, {}, function (error, data) {
    if (error) {
      console.error(`Error fetching project for ID ${projectId}:`, error);
      res.status(500).send({
        message: "An error occurred while fetching project.",
        error: error.message || "Unknown error"
      });
    } else {
      try {
        const projectData = JSON.parse(data);
        // 使用新的缓存管理器缓存项目数据
        cacheManager.cacheProjectData(projectData).catch(console.error);
        // 保持向后兼容，也使用旧的缓存方法
        cacheProject(projectData).catch(console.error);
      } catch (e) {
        console.error(`Error parsing or caching project ${projectId}:`, e);
      }
      
      res.status(200).send(data);
    }
  });
});

router.get("/:id/remixes", function (req, res) {
  const projectId = req.params.id;
  const { limit, offset } = req.query;
  const params = { limit: limit || 16, offset: offset || 0 };
  
  // 尝试从缓存获取结果
  const cacheKey = `project:${projectId}:remixes`;
  const cachedRemixes = cacheManager.caches.projects.get(cacheKey);
  if (cachedRemixes) {
    return res.status(200).send(JSON.stringify(cachedRemixes));
  }
  
  fetchFromScratchAPI(`projects/${projectId}/remixes`, params, function (error, data) {
    if (error) {
      console.error(`Error fetching remixes for project ID ${projectId}:`, error);
      res.status(500).send({
        message: "An error occurred while fetching project remixes.",
        error: error.message || "Unknown error"
      });
    } else {
      // 缓存结果
      try {
        const remixesData = JSON.parse(data);
        cacheManager.caches.projects.set(cacheKey, remixesData, 1800); // 30分钟缓存
        
        // 缓存结果中的项目数据
        if (Array.isArray(remixesData)) {
          remixesData.forEach(project => {
            cacheManager.cacheProjectData(project).catch(console.error);
          });
        }
      } catch (e) {
        console.error(`Error parsing or caching remixes for project ${projectId}:`, e);
      }
      
      res.status(200).send(data);
    }
  });
});

export default router;
