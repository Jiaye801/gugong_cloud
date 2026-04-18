# 产品架构说明

## 架构概览

项目采用前后端分离：

- `frontend`
  - React 单页应用
  - Zustand 统一管理地图、路线、任务、个人状态
  - `react-zoom-pan-pinch` 负责地图缩放拖拽
  - Framer Motion 负责浮层、抽屉、卡片动效
- `backend`
  - Flask 提供 REST API
  - SQLite 保存演示数据
  - 本地文件系统保存用户上传

## 核心页面

- `/`
  - 沉浸式地图
  - POI 浮层
  - 路线抽屉
- `/poi/:slug`
  - 点位详情
  - 感悟发布
  - 图片上传
- `/routes`
  - 路线列表
  - 地图视图 / 线路示意图
- `/quests`
  - 主线任务
  - 步骤完成
- `/topics`
  - 专题列表
- `/topics/:slug`
  - 专题详情长卷
- `/profile`
  - 个人中心
- `/admin`
  - 表格 + 抽屉后台

## 状态流

前端通过 `/api/bootstrap` 拉取首屏所需全部数据：

- categories
- pois
- routes
- quests
- topics
- reflections
- uploads
- profile

交互后再通过以下接口增量更新：

- `/api/collections/toggle`
- `/api/routes/:id/advance`
- `/api/quests/:questId/steps/:stepId/complete`
- `/api/uploads`
- `/api/reflections`

## 后端模型

- `User`
- `PoiCategory`
- `Poi`
- `Route`
- `RouteStop`
- `Quest`
- `QuestStep`
- `Badge`
- `UserBadge`
- `UserRouteProgress`
- `UserQuestProgress`
- `UserQuestStepProgress`
- `UserPoiVisit`
- `UserUpload`
- `Reflection`
- `Collection`
- `TopicArticle`
- `AdminUser`

## 视觉实现说明

- 以深青金夜色为底色
- 地图热点使用徽章式 marker，而不是普通圆点
- 采用玻璃感深色浮层与金色描边统一组件语言
- 通过 SVG 路径和呼吸光效强化导览感
