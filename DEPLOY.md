# 阿里云部署指南（Docker）

本项目支持一键 Docker 部署到阿里云 Linux 服务器。

## 前置条件

- 阿里云 Linux 服务器（CentOS 7+ 或 Ubuntu 20.04+）
- 服务器已安装 Docker 和 Docker Compose
- 服务器安全组已开放端口：5000（后端）、3000（前端）或 80（Nginx）

## 快速部署（3 步）

### 1. 连接服务器并克隆仓库

```bash
ssh -i your-key.pem root@your-server-ip

# 在服务器上克隆仓库
git clone https://github.com/Jiaye801/gugong_cloud.git
cd gugong_cloud
```

### 2. 修改前端 API 地址

编辑 `docker-compose.yml`，找到 `frontend` 服务的 `build.args`，将 `VITE_API_BASE_URL` 改为你的服务器 IP 或域名：

```yaml
args:
  VITE_BASE_PATH: /
  VITE_API_BASE_URL: http://your-server-ip:5000
  # 或如果有域名：
  # VITE_API_BASE_URL: https://api.your-domain.com
```

### 3. 启动容器

```bash
docker-compose up -d
```

等待 1-2 分钟，容器启动完成。

## 访问应用

### 前端地址
- `http://your-server-ip:3000`

### 后端 API
- `http://your-server-ip:5000/api/bootstrap`

## 生产环境配置（推荐）

### 使用 Nginx 反向代理

如果你想用域名或需要 HTTPS，建议在宿主机上安装 Nginx 反向代理：

1. **安装 Nginx**（CentOS）：
```bash
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

2. **创建 Nginx 配置** `/etc/nginx/conf.d/gugong.conf`：
```nginx
upstream gugong_backend {
    server 127.0.0.1:5000;
}

upstream gugong_frontend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    # 前端
    location / {
        proxy_pass http://gugong_frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 后端 API
    location /api/ {
        proxy_pass http://gugong_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }
}
```

3. **重启 Nginx**：
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 开启 HTTPS（使用 Let's Encrypt）

```bash
sudo yum install -y certbot python-certbot-nginx
sudo certbot certonly --standalone -d your-domain.com
```

## 常用命令

```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 停止容器
docker-compose down

# 重启容器
docker-compose restart

# 重新构建并启动
docker-compose up -d --build
```

## 数据持久化

后端上传的文件存在 `./backend/app/uploads` 目录，会自动挂载到容器中保存。

## 环境变量配置

如果需要自定义后端配置，修改 `docker-compose.yml` 中 `backend` 服务的 `environment` 部分。

## 常见问题

**Q: 前端无法访问后端 API**
- 检查 `VITE_API_BASE_URL` 是否填的是正确的服务器 IP 或域名
- 确认阿里云安全组已开放 5000 端口

**Q: 容器启动失败**
- 查看日志：`docker-compose logs backend`
- 确保服务器有足够磁盘空间和内存

**Q: 如何更新代码**
```bash
git pull origin main
docker-compose up -d --build
```

## 支持

如有问题，请检查仓库 Issue 或联系项目维护者。
