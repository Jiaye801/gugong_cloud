# 如何替换为真实景区 / 博物馆数据

## 1. 替换地图总图

当前地图底图由前端 `resolveMediaUrl("generated://map/imperial-map")` 动态生成。

接入真实项目时建议：

1. 将总图文件放到 `frontend/public/assets/map/real-map.jpg`
2. 在 `src/components/MapScene.tsx` 中把地图地址改为：

```ts
resolveMediaUrl('/assets/map/real-map.jpg')
```

## 2. 替换 POI 图片

后端种子数据在：

- `backend/app/demo_data.py`

把 `cover_image` 和 `gallery` 中的 `generated://...` 改成真实文件路径，例如：

```py
"cover_image": "/assets/poi/hall-01.jpg"
```

然后把资源放入：

- `frontend/public/assets/poi/`

## 3. 替换专题图

修改：

- `backend/app/demo_data.py` 中 `topic_seed()`

把专题 `cover_image` 和 `gallery` 指向真实图片。

## 4. 替换点位坐标

POI 使用归一化坐标：

- `x_ratio`
- `y_ratio`

范围是 `0 ~ 1`，和底图尺寸无关。

替换步骤：

1. 确认总图中每个点位的像素坐标
2. 计算：
   - `x_ratio = x / mapWidth`
   - `y_ratio = y / mapHeight`
3. 回填到 `demo_data.py`

## 5. 替换路线

路线地图描边使用 SVG path：

- `svg_path`

如果要替换为真实路线：

1. 在设计工具中绘制路径
2. 导出 SVG path `d` 属性
3. 覆盖到 `route_seed()` 中的 `svg_path`

## 6. 替换任务逻辑

任务配置位于：

- `quest_seed()`
- `quest_steps_seed()`

可把步骤目标改成真实点位 slug，并重新设定：

- 阅读类步骤
- 打卡类步骤
- 上传类步骤
- 感悟类步骤

## 7. 接入真实内容审核

当前审核为演示逻辑，实际项目建议增加：

- 登录鉴权
- 管理员权限控制
- 内容审核人字段
- 审核时间字段
- 审核日志

## 8. 接入真实部署

建议部署方式：

1. 前端静态站点部署到 Nginx / Vercel / Netlify
2. Flask 部署到 Gunicorn / Waitress / Docker
3. SQLite 演示阶段可保留，正式环境建议切换 PostgreSQL
