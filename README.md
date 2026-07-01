# Lime Calendar | 青柠日历

一个通过月历记录"我做过什么"的轻量生活记录工具。

## 技术栈

- **Next.js 16** (App Router)
- **React 19** / **TypeScript**
- **Prisma** / **SQLite**
- **Zustand** / **dayjs**
- **Tailwind CSS** / **SCSS**

## 快速开始

```bash
# 安装依赖
npm install

# 初始化数据库
npm run db:push
npm run db:seed

# 启动（生产模式，夸克/Chrome 通用）
npm run dev
```

启动后访问 `http://localhost:3400`。

### 为什么是生产模式？

夸克浏览器对 WebSocket（HMR）连接不稳定，Next.js 开发模式的 HMR 客户端会不断断连重连导致页面刷新循环。详情见 [docs/debug-quark-hmr-refresh-loop.md](docs/debug-quark-hmr-refresh-loop.md)。

## 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 构建并启动生产服务器（端口 3400） |
| `npm run build` | 仅构建 |
| `npm run start` | 仅启动生产服务器 |
| `npm run lint` | ESLint 检查 |
| `npm run db:push` | 同步 Prisma schema 到 SQLite |
| `npm run db:seed` | 填充种子数据 |
| `npm run db:generate` | 生成 Prisma Client |

## 项目结构

```
src/
├── app/          # Next.js App Router 页面与 API
├── components/   # 公共/业务组件
├── features/     # 业务逻辑（按域拆分）
├── stores/       # Zustand 状态管理
├── services/     # 客户端请求封装
├── server/       # 服务端业务逻辑
├── lib/          # 工具函数、常量
├── types/        # TypeScript 类型定义
└── styles/       # 全局样式、SCSS 资源
prisma/
└── schema.prisma # 数据模型定义
```

## 视觉方向

清透 · 克制 · 呼吸感 · 轻运动 · 留白 · 不焦虑

## 开发规范

详见 [AGENTS.md](AGENTS.md)。
