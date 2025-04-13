# 部署指南

本文档详细介绍了如何部署和运行 ScratchMirror 服务。ScratchMirror 支持多种部署方式，包括 Docker 容器化部署和传统的直接部署方式。

## 系统要求

### 最低配置
- **CPU**: 2 核
- **内存**: 2 GB RAM
- **存储**: 10 GB 可用空间
- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+ / Windows Server 2019+
- **Node.js**: 16.x 或更高版本
- **数据库**: MySQL 5.7+ 或 MariaDB 10.5+ (可选，用于持久化缓存)

### 推荐配置
- **CPU**: 4 核
- **内存**: 4 GB RAM
- **存储**: 20 GB SSD
- **操作系统**: Ubuntu 22.04 LTS
- **Node.js**: 18.x 或更高版本
- **数据库**: MySQL 8.0+ 或 MariaDB 10.6+

## Docker 部署 (推荐)

使用 Docker 是最简单和推荐的部署方式，它可以确保在不同环境中的一致性。

### 前提条件
- 安装 [Docker](https://docs.docker.com/get-docker/)
- 安装 [Docker Compose](https://docs.docker.com/compose/install/)

### 步骤 1: 克隆仓库

```bash
git clone https://github.com/Sunwuyuan/scratchmirror.git
cd scratchmirror
```

### 步骤 2: 配置环境变量

创建 `.env` 文件并设置必要的环境变量：

```bash
cp .env.example .env
```

编辑 `.env` 文件，根据需要修改配置：

```
# 基本配置
NODE_ENV=production
PORT=3000

# 数据库配置 (可选)
USE_DATABASE=false
DATABASE_URL=mysql://username:password@localhost:3306/scratchmirror

# 监控配置 (可选)
AXIOM_API_TOKEN=your_axiom_token
AXIOM_DATASET=your_axiom_dataset

# 安全配置
ADMIN_API_KEY=your_admin_api_key
```

### 步骤 3: 使用 Docker Compose 启动服务

```bash
docker-compose up -d
```

这将构建 Docker 镜像并在后台启动服务。

### 步骤 4: 验证部署

访问 `http://your-server-ip:3000/health` 检查服务是否正常运行。如果返回 `{"status":"healthy"}`，则表示服务已成功部署。

### Docker 部署的管理命令

- **查看日志**:
  ```bash
  docker-compose logs -f
  ```

- **停止服务**:
  ```bash
  docker-compose down
  ```

- **重启服务**:
  ```bash
  docker-compose restart
  ```

- **更新服务**:
  ```bash
  git pull
  docker-compose down
  docker-compose up -d --build
  ```

## 直接部署

如果您不想使用 Docker，也可以直接在服务器上部署 ScratchMirror。

### 步骤 1: 安装 Node.js

在 Ubuntu/Debian 上:

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

在 CentOS/RHEL 上:

```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

### 步骤 2: 克隆仓库

```bash
git clone https://github.com/Sunwuyuan/scratchmirror.git
cd scratchmirror
```

### 步骤 3: 安装依赖

```bash
npm install
```

### 步骤 4: 配置环境变量

创建 `.env` 文件并设置必要的环境变量：

```bash
cp .env.example .env
```

编辑 `.env` 文件，根据需要修改配置。

### 步骤 5: 启动服务

对于开发环境:

```bash
npm run dev
```

对于生产环境:

```bash
npm start
```

### 步骤 6: 设置进程管理器 (生产环境)

为了确保服务在后台运行并在崩溃时自动重启，建议使用进程管理器如 PM2。

安装 PM2:

```bash
npm install -g pm2
```

使用 PM2 启动服务:

```bash
pm2 start ./bin/www --name scratchmirror
```

设置 PM2 开机自启:

```bash
pm2 startup
pm2 save
```

PM2 常用命令:

```bash
# 查看日志
pm2 logs scratchmirror

# 重启服务
pm2 restart scratchmirror

# 停止服务
pm2 stop scratchmirror

# 查看状态
pm2 status
```

## 配置 Nginx 反向代理 (可选)

在生产环境中，建议使用 Nginx 作为反向代理，处理 SSL 终止和请求分发。

### 步骤 1: 安装 Nginx

```bash
sudo apt update
sudo apt install -y nginx
```

### 步骤 2: 配置 Nginx

创建 Nginx 配置文件:

```bash
sudo nano /etc/nginx/sites-available/scratchmirror
```

添加以下配置:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置:

```bash
sudo ln -s /etc/nginx/sites-available/scratchmirror /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 步骤 3: 配置 SSL (推荐)

使用 Certbot 获取 Let's Encrypt SSL 证书:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 数据库配置 (可选)

如果您想启用数据库缓存功能，需要设置 MySQL 或 MariaDB 数据库。

### 步骤 1: 安装数据库

在 Ubuntu/Debian 上:

```bash
sudo apt update
sudo apt install -y mysql-server
```

或者安装 MariaDB:

```bash
sudo apt update
sudo apt install -y mariadb-server
```

### 步骤 2: 创建数据库和用户

```bash
sudo mysql -u root -p
```

在 MySQL 提示符下执行:

```sql
CREATE DATABASE scratchmirror;
CREATE USER 'scratchmirror'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON scratchmirror.* TO 'scratchmirror'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 步骤 3: 配置环境变量

编辑 `.env` 文件，设置数据库连接信息:

```
USE_DATABASE=true
DATABASE_URL=mysql://scratchmirror:your_password@localhost:3306/scratchmirror
```

### 步骤 4: 运行数据库迁移

```bash
npx prisma db push
```

## 监控和日志 (可选)

ScratchMirror 支持使用 OpenTelemetry 和 Axiom 进行监控和日志收集。

### 配置 Axiom

1. 注册 [Axiom](https://axiom.co/) 账户
2. 创建数据集
3. 获取 API 令牌
4. 在 `.env` 文件中设置:

```
AXIOM_API_TOKEN=your_axiom_token
AXIOM_DATASET=your_axiom_dataset
```

## 性能优化

### 内存缓存配置

可以通过环境变量调整内存缓存的行为:

```
# 缓存大小限制 (项目数)
CACHE_MAX_SIZE=1000

# 默认缓存过期时间 (秒)
CACHE_DEFAULT_TTL=3600

# 缓存清理间隔 (秒)
CACHE_CLEANUP_INTERVAL=300
```

### 限速配置

可以通过环境变量调整限速策略:

```
# 全局限速窗口 (毫秒)
RATE_LIMIT_WINDOW_MS=900000

# 全局限速请求数
RATE_LIMIT_MAX=100
```

## 故障排除

### 常见问题

1. **服务无法启动**
   - 检查 Node.js 版本是否符合要求
   - 检查环境变量配置是否正确
   - 检查端口是否被占用: `lsof -i :3000`

2. **数据库连接失败**
   - 检查数据库服务是否运行: `systemctl status mysql`
   - 检查数据库连接字符串是否正确
   - 检查数据库用户权限

3. **性能问题**
   - 增加服务器资源
   - 调整缓存配置
   - 检查数据库索引

### 查看日志

Docker 部署:
```bash
docker-compose logs -f
```

PM2 部署:
```bash
pm2 logs scratchmirror
```

直接部署:
```bash
tail -f logs/app.log
tail -f logs/security.log
```

## 更新

### Docker 部署更新

```bash
git pull
docker-compose down
docker-compose up -d --build
```

### 直接部署更新

```bash
git pull
npm install
pm2 restart scratchmirror  # 如果使用 PM2
```

## 备份

### 数据库备份

```bash
mysqldump -u scratchmirror -p scratchmirror > backup_$(date +%Y%m%d).sql
```

### 自动备份脚本

创建备份脚本 `backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/scratchmirror_$DATE.sql"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
mysqldump -u scratchmirror -p'your_password' scratchmirror > $BACKUP_FILE

# 压缩备份
gzip $BACKUP_FILE

# 删除30天前的备份
find $BACKUP_DIR -name "scratchmirror_*.sql.gz" -type f -mtime +30 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
```

设置执行权限并添加到 crontab:

```bash
chmod +x backup.sh
crontab -e
```

添加定时任务 (每天凌晨2点执行):

```
0 2 * * * /path/to/backup.sh >> /path/to/backup.log 2>&1
```

## 安全建议

1. **使用非 root 用户运行服务**
2. **启用防火墙，只开放必要端口**
3. **定期更新系统和依赖包**
4. **使用强密码和 API 密钥**
5. **配置 SSL/TLS 加密**
6. **定期备份数据**
7. **监控服务器资源和日志**

## 支持

如果您在部署过程中遇到任何问题，请通过以下方式获取支持:

- 提交 GitHub Issue: [https://github.com/Sunwuyuan/scratchmirror/issues](https://github.com/Sunwuyuan/scratchmirror/issues)
- 联系邮箱: sun@wuyuan.dev
