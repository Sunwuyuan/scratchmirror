# API 文档

本文档详细介绍了 ScratchMirror 提供的 API 端点、参数和使用方法。ScratchMirror 作为 Scratch API 的代理服务，提供了与原始 Scratch API 相同的功能，同时增加了缓存、限速和安全增强等特性。

## 基础信息

- **基础 URL**: `https://your-scratchmirror-domain.com`
- **响应格式**: JSON (除非特别说明)
- **认证**: 大多数端点不需要认证，与原始 Scratch API 保持一致

## 限速说明

为了保护服务稳定性，ScratchMirror 实施了请求限速机制。不同的 API 端点有不同的限速规则：

| API 类别 | 时间窗口 | 最大请求数 | 超出限制后恢复时间 |
|---------|---------|-----------|-----------------|
| 项目相关 | 15分钟   | 150次      | 15分钟           |
| 用户相关 | 15分钟   | 100次      | 15分钟           |
| 搜索相关 | 15分钟   | 50次       | 15分钟           |
| 缩略图   | 5分钟    | 200次      | 5分钟            |
| 头像     | 5分钟    | 200次      | 5分钟            |
| 工作室   | 15分钟   | 100次      | 15分钟           |
| 代理     | 60分钟   | 30次       | 60分钟           |
| 新闻     | 5分钟    | 300次      | 5分钟            |

超出限制时，API 将返回 HTTP 状态码 429 (Too Many Requests)，并在响应中包含以下信息：
- 剩余恢复时间
- 限制数量
- 友好的错误消息

## API 端点

### 项目相关 API

#### 获取项目信息

```
GET /projects/:id
```

获取指定 ID 的项目详细信息。

**参数**:
- `id` (路径参数, 必需): 项目 ID

**响应示例**:
```json
{
  "id": 123456,
  "title": "示例项目",
  "description": "这是一个示例项目",
  "instructions": "使用方法说明",
  "visibility": "visible",
  "public": true,
  "comments_allowed": true,
  "is_published": true,
  "author": {
    "id": 654321,
    "username": "scratch_user",
    "profile": {
      "images": {
        "90x90": "https://cdn2.scratch.mit.edu/get_image/user/654321_90x90.png"
      }
    }
  },
  "image": "https://cdn2.scratch.mit.edu/get_image/project/123456_480x360.png",
  "history": {
    "created": "2023-01-01T00:00:00.000Z",
    "modified": "2023-01-02T00:00:00.000Z",
    "shared": "2023-01-03T00:00:00.000Z"
  },
  "stats": {
    "views": 100,
    "loves": 50,
    "favorites": 30,
    "remixes": 5
  },
  "remix": {
    "parent": null,
    "root": null
  }
}
```

#### 获取项目源代码

```
GET /projects/source/:id
```

获取指定 ID 的项目源代码。

**参数**:
- `id` (路径参数, 必需): 项目 ID
- `token` (查询参数, 可选): 访问令牌，用于访问非公开项目

**响应**:
返回项目的完整源代码数据。

#### 获取项目衍生作品

```
GET /projects/:id/remixes
```

获取指定项目的衍生作品列表。

**参数**:
- `id` (路径参数, 必需): 项目 ID
- `limit` (查询参数, 可选): 返回结果数量限制，默认为 16
- `offset` (查询参数, 可选): 结果偏移量，用于分页

**响应示例**:
```json
[
  {
    "id": 123457,
    "title": "示例项目的衍生作品",
    "description": "这是一个衍生作品",
    "author": {
      "id": 654322,
      "username": "another_user"
    },
    "image": "https://cdn2.scratch.mit.edu/get_image/project/123457_480x360.png",
    "stats": {
      "views": 50,
      "loves": 20,
      "favorites": 10,
      "remixes": 0
    }
  }
]
```

#### 探索项目

```
GET /projects/explore/projects
```

探索 Scratch 平台上的项目。

**参数**:
- `limit` (查询参数, 可选): 返回结果数量限制，默认为 16
- `language` (查询参数, 可选): 语言筛选，默认为 "zh-cn"
- `mode` (查询参数, 可选): 排序模式，可选值为 "popular", "trending", "recent"，默认为 "popular"
- `q` (查询参数, 可选): 搜索关键词，默认为 "*"
- `offset` (查询参数, 可选): 结果偏移量，用于分页

**响应**:
返回符合条件的项目列表。

#### 搜索项目

```
GET /projects/search/projects
```

搜索 Scratch 平台上的项目。

**参数**:
- `limit` (查询参数, 可选): 返回结果数量限制，默认为 16
- `language` (查询参数, 可选): 语言筛选，默认为 "zh-cn"
- `mode` (查询参数, 可选): 排序模式，可选值为 "popular", "trending", "recent"，默认为 "popular"
- `q` (查询参数, 必需): 搜索关键词
- `offset` (查询参数, 可选): 结果偏移量，用于分页

**响应**:
返回符合搜索条件的项目列表。

### 用户相关 API

#### 获取用户信息

```
GET /users/:username
```

获取指定用户名的用户信息。

**参数**:
- `username` (路径参数, 必需): 用户名

**响应示例**:
```json
{
  "id": 654321,
  "username": "scratch_user",
  "scratchteam": false,
  "history": {
    "joined": "2020-01-01T00:00:00.000Z"
  },
  "profile": {
    "id": 123,
    "status": "I'm a Scratcher!",
    "bio": "Hello, I love coding with Scratch!",
    "country": "China",
    "images": {
      "90x90": "https://cdn2.scratch.mit.edu/get_image/user/654321_90x90.png",
      "60x60": "https://cdn2.scratch.mit.edu/get_image/user/654321_60x60.png",
      "55x55": "https://cdn2.scratch.mit.edu/get_image/user/654321_55x55.png",
      "50x50": "https://cdn2.scratch.mit.edu/get_image/user/654321_50x50.png",
      "32x32": "https://cdn2.scratch.mit.edu/get_image/user/654321_32x32.png"
    }
  }
}
```

#### 获取用户项目

```
GET /users/:username/projects
```

获取指定用户创建的项目列表。

**参数**:
- `username` (路径参数, 必需): 用户名
- `limit` (查询参数, 可选): 返回结果数量限制，默认为 20
- `offset` (查询参数, 可选): 结果偏移量，用于分页

**响应**:
返回用户创建的项目列表。

#### 获取用户收藏

```
GET /users/:username/favorites
```

获取指定用户收藏的项目列表。

**参数**:
- `username` (路径参数, 必需): 用户名
- `limit` (查询参数, 可选): 返回结果数量限制，默认为 20
- `offset` (查询参数, 可选): 结果偏移量，用于分页

**响应**:
返回用户收藏的项目列表。

#### 获取用户关注

```
GET /users/:username/following
```

获取指定用户关注的用户列表。

**参数**:
- `username` (路径参数, 必需): 用户名
- `limit` (查询参数, 可选): 返回结果数量限制，默认为 20
- `offset` (查询参数, 可选): 结果偏移量，用于分页

**响应**:
返回用户关注的用户列表。

#### 获取用户粉丝

```
GET /users/:username/followers
```

获取关注指定用户的用户列表。

**参数**:
- `username` (路径参数, 必需): 用户名
- `limit` (查询参数, 可选): 返回结果数量限制，默认为 20
- `offset` (查询参数, 可选): 结果偏移量，用于分页

**响应**:
返回关注该用户的用户列表。

### 资源相关 API

#### 获取项目缩略图

```
GET /thumbnails/:id
```

获取指定项目的缩略图。

**参数**:
- `id` (路径参数, 必需): 项目 ID

**响应**:
返回项目缩略图图片，或重定向到 Scratch CDN。

#### 获取用户头像

```
GET /avatars/:username
```

获取指定用户的头像。

**参数**:
- `username` (路径参数, 必需): 用户名

**响应**:
返回用户头像图片，或重定向到 Scratch CDN。

### 工作室相关 API

```
GET /studios/:id
```

获取指定工作室的信息。

**参数**:
- `id` (路径参数, 必需): 工作室 ID

**响应**:
返回工作室的详细信息。

### 系统相关 API

#### 健康检查

```
GET /health
```

检查 API 服务的健康状态。

**响应示例**:
```json
{
  "status": "healthy"
}
```

#### API 状态

```
GET /api/status
```

获取 API 服务的状态信息。

**响应示例**:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "uptime": 3600,
  "timestamp": "2023-01-01T00:00:00.000Z",
  "environment": "production"
}
```

#### 统计信息 (仅限管理员)

```
GET /api/stats
```

获取 API 服务的详细统计信息，包括缓存和限速统计。

**请求头**:
- `X-Admin-Key`: 管理员 API 密钥

**响应示例**:
```json
{
  "status": "ok",
  "rateLimit": {
    "hits": 1000,
    "size": 50
  },
  "cache": {
    "users": {
      "hits": 500,
      "misses": 100,
      "size": 200,
      "hitRate": "0.83"
    },
    "projects": {
      "hits": 800,
      "misses": 200,
      "size": 300,
      "hitRate": "0.80"
    }
  },
  "memory": {
    "heapTotal": 50,
    "heapUsed": 30,
    "rss": 60,
    "external": 10
  }
}
```

## 错误处理

所有 API 端点在发生错误时都会返回一致的错误响应格式：

```json
{
  "status": "error",
  "code": "ERROR_CODE",
  "message": "错误描述信息",
  "path": "/请求路径",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### 常见错误代码

| HTTP 状态码 | 错误代码 | 描述 |
|------------|---------|------|
| 400 | BAD_REQUEST | 请求参数无效或格式错误 |
| 401 | UNAUTHORIZED | 未授权的访问 |
| 403 | FORBIDDEN | 禁止访问此资源 |
| 404 | NOT_FOUND | 请求的资源不存在 |
| 429 | TOO_MANY_REQUESTS | 请求过于频繁，超出限速 |
| 500 | INTERNAL_ERROR | 服务器内部错误 |
| 503 | SERVICE_UNAVAILABLE | 服务暂时不可用 |

## 最佳实践

1. **实施缓存**: 在客户端实施适当的缓存机制，减少不必要的请求
2. **处理限速**: 实现指数退避算法处理限速情况
3. **批量请求**: 尽可能合并请求，减少 API 调用次数
4. **错误处理**: 妥善处理所有可能的错误情况
5. **监控使用**: 监控 API 使用情况，避免超出限制

## 示例代码

### JavaScript (Node.js)

```javascript
const axios = require('axios');

const API_BASE_URL = 'https://your-scratchmirror-domain.com';

async function getProject(projectId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/projects/${projectId}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(`Error: ${error.response.status} - ${error.response.data.message}`);
    } else {
      console.error(`Error: ${error.message}`);
    }
    throw error;
  }
}

// 使用示例
getProject(123456)
  .then(project => console.log(project))
  .catch(err => console.error('Failed to get project:', err));
```

### Python

```python
import requests

API_BASE_URL = 'https://your-scratchmirror-domain.com'

def get_project(project_id):
    try:
        response = requests.get(f'{API_BASE_URL}/projects/{project_id}')
        response.raise_for_status()  # 抛出HTTP错误
        return response.json()
    except requests.exceptions.HTTPError as http_err:
        error_data = response.json() if response.headers.get('content-type') == 'application/json' else {}
        print(f"HTTP Error: {http_err} - {error_data.get('message', '')}")
        raise
    except Exception as err:
        print(f"Error: {err}")
        raise

# 使用示例
try:
    project = get_project(123456)
    print(project)
except Exception as e:
    print(f"Failed to get project: {e}")
```

## 联系与支持

如果您在使用 API 过程中遇到任何问题，或有任何建议，请通过以下方式联系我们：

- 提交 GitHub Issue: [https://github.com/Sunwuyuan/scratchmirror/issues](https://github.com/Sunwuyuan/scratchmirror/issues)
- 联系邮箱: sun@wuyuan.dev
