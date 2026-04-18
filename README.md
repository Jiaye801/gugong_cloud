# 云游故宫

一个可运行、可展示的沉浸式数字导览 Web 项目，包含：

- 原创建筑总图地图导览
- 路线系统与 SVG 路径演示
- 主线任务与解锁机制
- 用户图片上传与游览感悟
- 个人中心与成就墙
- 后台管理
- Flask + SQLite 本地后端

## 技术结构

- 前端：React + TypeScript + Vite + Tailwind CSS + Framer Motion + Zustand + react-zoom-pan-pinch
- 后端：Flask + Flask-SQLAlchemy + SQLite
- 数据：本地 SQLite
- 上传：本地文件存储到 `backend/app/uploads`

## 目录

```text
backend/   Flask API、SQLite、测试、初始化脚本
frontend/  React 前端、地图场景、页面与状态管理
docs/      架构说明与真实数据替换说明
```

## 快速启动

### 1. 启动后端

```bash
cd backend
python -m pip install -r requirements.txt
python run.py init-db
python run.py
```

后端默认地址：

- `http://127.0.0.1:5000`

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端默认地址：

- `http://127.0.0.1:5173`

## 测试账号

- 管理员：
  - 账号：`admin`
  - 密码：`admin123`
- 游客：
  - 可直接在登录/注册页注册新账号

## 已实现模块

- 首页地图：
  - 拖拽、缩放、双击放大
  - POI 分类切换
  - 热点显示/隐藏
  - 角色视角切换
  - 路线抽屉
- POI 详情：
  - 封面、标签、推荐停留时间
  - 感悟发布
  - 本地图片上传
- 路线系统：
  - 6 条路线
  - 地图路径展示
  - 线路示意视图
  - 下一站、跳过、完成打卡
- 任务系统：
  - 3 条主线任务
  - 12 个任务步骤
  - 完成步骤与奖励同步
- 个人中心：
  - 徽章、收藏、上传、感悟
- 后台管理：
  - 表格查看
  - 上传与感悟审核
  - POI/路线/任务/专题 JSON 抽屉表单 CRUD

## 数据说明

初始化数据库时会自动注入首批内容：

- 39 个 POI
- 6 条路线
- 3 条主线任务
- 12 个任务步骤
- 8 条游览感悟
- 3 篇专题内容

## 测试与验证

已完成以下验证：

```bash
cd backend
python -m pytest

cd frontend
npm run build
```

## 资源替换

当前图像使用前端动态生成的原创 SVG 占位资源，接入真实项目时可替换为：

1. 真实总图：放入 `frontend/public/assets/map/`
2. 真实点位图：放入 `frontend/public/assets/poi/`
3. 真实专题图：放入 `frontend/public/assets/topics/`
4. 修改后端种子数据中的 `cover_image` / `gallery` 路径

详细说明见：

- [产品架构说明](C:\Users\29679\Desktop\云游故宫\docs\product-architecture.md)
- [真实数据替换说明](C:\Users\29679\Desktop\云游故宫\docs\replace-real-data.md)
- [宝塔部署说明](C:\Users\29679\Desktop\云游故宫\docs\baota-deploy.md)

## 注意事项

- Flask 测试会生成临时上传内容，正式演示时上传文件会落到 `backend/app/uploads`
- 当前版本不包含短信登录、对象存储、音频流媒体与 GIS
- 前端生产构建存在单包体积提醒，但不影响本地演示运行

## Git 托管并公开前端（GitHub Pages）

仓库已包含自动部署工作流：`.github/workflows/deploy-frontend-pages.yml`。

### 1. 推送代码到 GitHub

```bash
git add .
git commit -m "chore: add github pages deployment"
git push origin main
```

### 2. 开启 Pages

在 GitHub 仓库页面：

1. 进入 `Settings -> Pages`
2. `Build and deployment` 选择 `GitHub Actions`

### 3. 配置前端请求的后端地址（可选但强烈建议）

如果你有可公网访问的后端 API，在仓库中设置：

1. 进入 `Settings -> Secrets and variables -> Actions`
2. 在 `Variables` 新建 `VITE_API_BASE_URL`
3. 值示例：`https://your-api.example.com`

若不配置该变量，前端会使用默认值 `http://127.0.0.1:5000`，外部访客将无法正常调用 API。

### 4. 访问地址

部署成功后，前端地址通常为：

`https://<你的GitHub用户名>.github.io/<仓库名>/`

每次向 `main` 分支推送，都会自动重新发布前端。
