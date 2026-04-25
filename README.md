# Job Radar

桌面优先的前端职位发现工作台。当前版本已经包含多来源聚合、同步管理、运行时来源配置和可选的 PostgreSQL 持久化。

## 当前能力

- `/discover`：职位发现、组合筛选、详情侧栏、收藏与状态管理
- `/my-jobs`：我的职位视图，按收藏 / 待看 / 已投 / 忽略聚合
- `/admin`：来源配置、同步管理、最近同步记录、来源级错误信息
- 本地持久化：职位状态与备注保存在浏览器 `localStorage`
- 多来源聚合：支持 `manual import + Greenhouse + Lever`
- 真实源优先：配置真实站点后优先抓取公开职位板
- 运行时来源配置：可通过 `/admin` 保存到 `.job-radar-source-feeds.json`
- 同步历史：记录最近 10 次同步结果及来源级状态
- 可选数据库持久化：配置 `DATABASE_URL` 后把同步快照写入 PostgreSQL
- API repository：前端通过 `/api/jobs`、`/api/jobs/:id`、`/api/sources` 访问聚合结果

## 技术栈

- Next.js App Router
- TypeScript
- Prisma + PostgreSQL（可选）
- Tailwind CSS
- TanStack Query
- Zustand
- Zod
- Vitest + Testing Library
- Playwright

## 开发

```bash
pnpm install
pnpm prisma:generate
pnpm dev
```

## 页面与接口

主要页面：

- `/discover`
- `/my-jobs`
- `/admin`

主要接口：

- `GET /api/jobs`
- `GET /api/jobs/:id`
- `GET /api/sources`
- `GET /api/admin/sync`
- `POST /api/admin/sync`
- `GET /api/admin/source-feeds`
- `PUT /api/admin/source-feeds`
- `POST /api/admin/source-feeds/validate`

## PostgreSQL 持久化

默认情况下，项目在未配置数据库时仍会使用内存缓存。  
如果配置了 `DATABASE_URL`，同步结果会持久化到 PostgreSQL。

初始化数据库：

```bash
cp .env.example .env.local
pnpm prisma:generate
pnpm prisma:push
```

说明：

- 未配置 `DATABASE_URL`：使用内存模式
- 已配置 `DATABASE_URL`：同步结果会写入 PostgreSQL
- Prisma 7 使用 `prisma.config.ts` 读取连接配置

## 真实来源配置

默认情况下，项目会优先读运行时配置文件 `.job-radar-source-feeds.json`。  
如果没有这个文件，则回退到 `.env.local` / 环境变量。

推荐的 `.env.local` 示例：

```bash
JOB_RADAR_ENABLE_MANUAL_IMPORT=false
JOB_RADAR_GREENHOUSE_BOARDS=vercel:Vercel,stripe:Stripe
JOB_RADAR_LEVER_SITES=plaid:Plaid
```

说明：

- `Greenhouse` 配置格式：`board_token[:展示名]`
- `Lever` 配置格式：`site[:展示名]`
- 多个来源用英文逗号分隔
- `JOB_RADAR_ENABLE_MANUAL_IMPORT=false` 时会关闭本地 manual fixture 源
- 如果没有配置真实来源，Greenhouse / Lever 会回退到 fixture
- 也可以直接在 `/admin` 页面里保存来源配置，保存后会写入 `.job-radar-source-feeds.json`

运行时配置优先级：

1. `.job-radar-source-feeds.json`
2. `.env.local`
3. 代码内 fixture fallback

## /admin 使用说明

`/admin` 页面支持：

- 查看当前运行模式：`memory` 或 `database`
- 查看启用来源、原始抓取数、聚合职位数、上次同步时间
- 查看最近 10 次同步结果
- 查看来源级状态：`成功 / 部分回退 / 失败`
- 查看来源级错误信息
- 编辑 `manual import / Greenhouse / Lever` 来源配置
- 校验来源配置是否可访问
- 保存配置并立即同步

保存配置后：

- 会写入 `.job-radar-source-feeds.json`
- 下一次同步优先使用该文件配置
- “保存并同步”会先校验，再保存，再触发同步

## 同步行为

同步时的行为：

- `manual import`：本地 fixture
- `Greenhouse / Lever`：
  - 配置真实站点且请求成功：使用真实数据
  - 配置真实站点但请求失败：记录错误，并按当前逻辑回退到 fixture
  - 未配置真实站点：在 env 模式下可回退到 fixture

同步结果会记录：

- 总体状态：`success / partial / failed`
- 每个来源的原始抓取数
- 是否使用了 fixture fallback
- 错误信息

开发时可以手动触发同步：

```bash
curl -X POST http://localhost:3000/api/admin/sync
```

## 测试

```bash
pnpm test
pnpm test:e2e
```

当前至少覆盖了：

- query params 解析与构造
- 职位筛选与排序
- 多来源聚合
- 来源配置优先级
- 来源校验
- 同步管理状态
