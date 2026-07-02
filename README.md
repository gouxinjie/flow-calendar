# Lime Calendar | 青柠日历

一个以月历为核心的轻量生活记录工具。重点不是规划未来，而是回看已经发生过的生活。

## 核心功能

- **月历浏览** — 默认按月展示，日期格显示公历、农历/节气、记录摘要，支持查看历史月份
- **快速记录** — 10 秒内完成一条当天记录，支持标题、标签、时间、备注
- **记录管理** — 新增、编辑、删除记录，支持记录到过去日期，同一天可记录多条
- **标签管理** — 自定义标签（名称、颜色、图标、排序），提升月历可读性和搜索效率
- **历史搜索** — 按关键词、标签、日期范围筛选，默认按日期倒序展示
- **月度回顾** — 统计当月记录总数、记录天数、高频标签 Top N、最近记录摘要
- **登录同步** — 手机号登录，数据以服务端为主，本地 IndexedDB 仅做缓存

## 技术栈

- **Next.js 16** (App Router)
- **React 19** / **TypeScript**
- **Prisma** + **SQLite**（可平滑迁移至 PostgreSQL）
- **Zustand** / **dayjs** / **lunar-typescript**
- **Tailwind CSS 4** + **SCSS**
- **Phosphor Icons** / **Radix UI**

## 界面预览

<div align="center">
  <img src="imgs/1-登录.png" width="250" alt="登录" />
  <img src="imgs/2-日历页面.png" width="250" alt="日历页面" />
  <img src="imgs/3-选择月份.png" width="250" alt="选择月份" />
</div>

<div align="center">
  <img src="imgs/4-记录.png" width="250" alt="记录" />
  <img src="imgs/5-编辑记录.png" width="250" alt="编辑记录" />
  <img src="imgs/6-回顾.png" width="250" alt="回顾" />
</div>

<div align="center">
  <img src="imgs/7-筛选与回顾.png" width="250" alt="筛选与回顾" />
  <img src="imgs/8-我的.png" width="250" alt="我的" />
</div>

<br/>

<div align="center">
  1. 登录 &nbsp;&nbsp; 2. 日历页面 &nbsp;&nbsp; 3. 选择月份 &nbsp;&nbsp; 4. 记录 &nbsp;&nbsp; 5. 编辑记录 &nbsp;&nbsp; 6. 回顾 &nbsp;&nbsp; 7. 筛选与回顾 &nbsp;&nbsp; 8. 我的
</div>

## 快速开始

```bash
# 安装依赖
npm install

# 初始化数据库
npm run db:push
npm run db:seed

# 开发模式启动（端口 3400）
npm run dev

# 生产模式启动（夸克/Chrome 均可，无 HMR 干扰）
npm run start
```

启动后访问 `http://localhost:3400`。

### 环境变量

复制 `.env.example` 为 `.env` 并配置：

```bash
cp .env.example .env
```

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DATABASE_URL` | 数据库连接字符串 | `file:./dev.db` |

> 生产环境部署时，`DATABASE_URL` 应指向生产数据库路径，例如 `file:/var/www/flow-calendar/data/prod.db`。

### 为什么提供生产模式启动？

夸克浏览器对 WebSocket（HMR）连接不稳定，Next.js 开发模式的 HMR 客户端会不断断连重连导致页面刷新循环。在夸克中调试时请使用 `npm run start` 以生产模式运行。详情见 [docs/debug-quark-hmr-refresh-loop.md](docs/debug-quark-hmr-refresh-loop.md)。

## 数据库说明

本项目使用 **Prisma + SQLite** 作为数据库方案，具有以下特点：

### 数据库配置

1. **开发环境**：使用 SQLite，无需额外安装数据库服务
   - 数据库文件位置：`prisma/dev.db`
   - 连接字符串：在 `.env` 文件中配置 `DATABASE_URL="file:./dev.db"`

2. **生产环境**：可平滑迁移至 PostgreSQL
   - 修改 `.env` 中的 `DATABASE_URL` 即可切换
   - Prisma schema 已设计为兼容两种数据库

### 数据库初始化

```bash
# 同步 Prisma schema 到数据库（创建表结构）
npm run db:push

# 填充种子数据（含演示账号）
npm run db:seed

# 生成 Prisma Client（通常在 db:push 后自动执行）
npm run db:generate
```

### 数据库管理

```bash
# 使用 Prisma Studio 可视化查看和编辑数据
npx prisma studio

# 重置数据库（谨慎使用，会删除所有数据）
npx prisma db push --force-reset
```

### 数据模型

核心数据表包括：

- **users** - 用户账号
- **calendars** - 日历
- **event_tags** - 活动标签
- **schedule_events** - 日程事件
- **repeat_rules** - 重复规则
- **daily_checkins** - 每日打卡
- **template_plans** - 模板计划

详细字段定义见 [prisma/schema.prisma](prisma/schema.prisma)。

## 部署指南

项目支持通过 **GitHub Actions** 自动部署到阿里云 ECS，架构为：`Nginx → PM2 → Next.js Standalone (SQLite)`。

### 部署架构

```
本地开发机 → git push main → GitHub Actions 构建打包 → rsync 同步到 ECS → PM2 热重载
```

### ECS 环境要求

```bash
# Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs

# PM2 进程守护
npm install -g pm2

# Nginx 反向代理
yum install -y nginx
systemctl enable nginx && systemctl start nginx

# 创建部署目录
mkdir -p /var/www/flow-calendar/{app,data,logs}
```

### 自动部署

推送代码到 `main` 分支即可触发自动部署：

1. GitHub Actions 自动构建 Next.js 生产产物（standalone 模式）
2. 通过 rsync 同步到 ECS 的 `/var/www/flow-calendar/app` 目录
3. PM2 热重载服务（零停机）

### 手动部署

```bash
# 构建生产产物
npm run build

# 同步到 ECS（需要配置 SSH 密钥）
rsync -avz --delete --exclude='data/' --exclude='.env' .next/standalone/ user@ecs:/var/www/flow-calendar/app/

# ECS 上重启服务
pm2 reload ecosystem.config.js
```

> 完整部署文档见 [docs/部署文档与问题排查.md](docs/部署文档与问题排查.md)。

## 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | Next.js 开发模式（HMR 热更新，端口 3400） |
| `npm run start` | 构建并启动生产服务器（端口 3400，夸克可用） |
| `npm run build` | 仅构建生产产物 |
| `npm run lint` | ESLint 检查 |
| `npm run db:push` | 同步 Prisma schema 到 SQLite |
| `npm run db:seed` | 填充种子数据（含演示账号） |
| `npm run db:generate` | 生成 Prisma Client |

## 演示账号

| 手机号 | 用户名 | 说明 |
|--------|--------|------|
| `13113183859` | 小柠 | 种子数据默认账号 |

## 项目结构

```
src/
├── app/          # Next.js App Router 页面与 API
│   ├── (main)/   # 底部导航主路由组（日历/回顾/我的）
│   ├── login/    # 登录页
│   ├── account/  # 账号与安全
│   ├── tags/     # 标签管理
│   └── api/      # Route Handlers
├── components/
│   ├── commons/  # 公共组件
│   └── business/ # 业务组件
├── features/     # 业务逻辑（按域拆分）
├── stores/       # Zustand 状态管理
├── services/     # 客户端请求封装
├── server/       # 服务端业务逻辑、鉴权
├── lib/          # 工具函数、日期、常量
├── types/        # TypeScript 类型定义
└── styles/       # 全局样式、SCSS 资源
prisma/
├── schema.prisma # 数据模型定义
└── seed.ts       # 种子数据脚本
```

## 视觉方向

清透 · 克制 · 呼吸感 · 轻运动 · 留白 · 不焦虑

主色 `#5EBF3F` — 页面背景 `#E3F5DA` — 卡片 `#FFFFFF`

## 开发规范

详见 [AGENTS.md](AGENTS.md) 与 [Web移动端-PRD.md](Web移动端-PRD.md)。
