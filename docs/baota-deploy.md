# 宝塔部署说明

本文档适用于当前项目的低成本线上部署方式：

- 前端：Vite 打包后的静态文件
- 后端：Flask + Gunicorn
- 反向代理：Nginx
- 数据：SQLite
- 上传：本地目录持久化

## 一、推荐目录

```text
/www/wwwroot/yungugong/
  backend/
  frontend/
  www/
```

说明：

- `backend/` 放 Flask 项目
- `frontend/` 放前端源码
- `www/` 放前端构建产物

## 二、服务器环境

建议在宝塔安装：

- `Nginx`
- `Python 项目管理器`
- `Node.js 18+`

也可以通过终端手动安装：

```bash
python3 -V
node -v
npm -v
```

## 三、上传代码

将整个项目上传到：

```text
/www/wwwroot/yungugong/
```

## 四、部署后端

### 1. 创建虚拟环境并安装依赖

```bash
cd /www/wwwroot/yungugong/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. 配置环境变量

复制：

```bash
cp .env.example .env
```

按实际目录修改：

```env
SECRET_KEY=请替换为强随机字符串
DATABASE_URL=sqlite:////www/wwwroot/yungugong/backend/instance/immersive_guide.db
UPLOAD_FOLDER=/www/wwwroot/yungugong/backend/app/uploads
SEED_ON_BOOT=false
MAX_CONTENT_LENGTH=8388608
```

### 3. 初始化数据库

首次上线执行：

```bash
cd /www/wwwroot/yungugong/backend
source .venv/bin/activate
python run.py init-db
```

## 五、部署前端

### 1. 配置接口地址

编辑：

`/www/wwwroot/yungugong/frontend/.env.production`

内容示例：

```env
VITE_API_BASE_URL=https://你的域名
```

### 2. 构建前端

```bash
cd /www/wwwroot/yungugong/frontend
npm install
npm run build
```

### 3. 发布静态文件

```bash
mkdir -p /www/wwwroot/yungugong/www
cp -r dist/* /www/wwwroot/yungugong/www/
```

## 六、Gunicorn 启动命令

在宝塔 Python 项目或 Supervisor 中使用：

```bash
cd /www/wwwroot/yungugong/backend && \
source .venv/bin/activate && \
export $(grep -v '^#' .env | xargs) && \
gunicorn -w 2 -b 127.0.0.1:5000 wsgi:app
```

## 七、Nginx 站点配置示例

将站点根目录设置为：

```text
/www/wwwroot/yungugong/www
```

Nginx 配置核心可参考：

```nginx
server {
    listen 80;
    server_name 你的域名;

    root /www/wwwroot/yungugong/www;
    index index.html;

    client_max_body_size 20m;

    location /uploads/ {
        proxy_pass http://127.0.0.1:5000/uploads/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 八、HTTPS

在宝塔站点里直接申请 Let's Encrypt 证书即可。

前端生产环境中的：

```env
VITE_API_BASE_URL=https://你的域名
```

必须与最终域名一致。

## 九、上线后的更新流程

每次更新代码后执行：

```bash
cd /www/wwwroot/yungugong/frontend
npm install
npm run build
cp -r dist/* /www/wwwroot/yungugong/www/

cd /www/wwwroot/yungugong/backend
source .venv/bin/activate
pip install -r requirements.txt
```

然后在宝塔重启 Python 项目或 Gunicorn 进程。

## 十、注意事项

- SQLite 与上传目录都在服务器本地磁盘，可低成本上线
- 不要把站点部署在临时目录
- 若后续访问量增加，建议把 SQLite 升级为 MySQL 或 PostgreSQL
- 若后续图片较多，建议把上传目录迁移到对象存储

