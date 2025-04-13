import { Router } from "express";
var router = Router();
import { fetchFromScratchAPI } from "../utils/scratchAPI.js";
import { cacheManager } from "../utils/cache/index.js";

router.get("/:id", function (req, res) {
  const id = req.params.id;
  
  // 尝试从缓存获取缩略图数据
  const cachedThumbnail = cacheManager.getThumbnailFromCache(id);
  if (cachedThumbnail) {
    // 如果是Buffer或字符串形式的图片数据，直接返回
    if (typeof cachedThumbnail === 'string' && cachedThumbnail.startsWith('data:image')) {
      const base64Data = cachedThumbnail.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      res.set('Content-Type', 'image/png');
      return res.send(buffer);
    }
    // 如果是URL，重定向到该URL
    else if (typeof cachedThumbnail === 'string' && (cachedThumbnail.startsWith('http://') || cachedThumbnail.startsWith('https://'))) {
      return res.redirect(cachedThumbnail);
    }
    // 如果是JSON对象，返回JSON
    else if (typeof cachedThumbnail === 'object') {
      return res.status(200).send(cachedThumbnail);
    }
  }
  
  // 如果缓存中没有，从Scratch API获取
  const thumbnailUrl = `https://cdn2.scratch.mit.edu/get_image/project/${id}_480x360.png`;
  
  // 对于缩略图，我们直接重定向到Scratch CDN
  // 这样可以减少服务器负载，同时保持响应速度
  // 但我们仍然在缓存中记录这个URL，以便将来可能的优化
  cacheManager.cacheThumbnail(id, thumbnailUrl, 86400); // 缓存24小时
  
  res.redirect(thumbnailUrl);
});

export default router;
