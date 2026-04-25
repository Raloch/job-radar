# Job Radar

桌面优先的前端职位发现工作台。当前版本包含：

- `/discover`：职位发现、组合筛选、详情侧栏、收藏与状态管理
- `/my-jobs`：我的职位视图，按收藏 / 待看 / 已投 / 忽略聚合
- 本地持久化：职位状态与备注保存在浏览器 `localStorage`
- 多来源聚合：支持 `手动导入 + Greenhouse + Lever` 的统一聚合链路
- API repository：前端通过 `/api/jobs`、`/api/jobs/:id`、`/api/sources` 访问聚合结果

## 技术栈

- Next.js App Router
- TypeScript
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

## PostgreSQL 持久化

默认情况下，项目在未配置数据库时仍会使用内存缓存。  
如果配置了 `DATABASE_URL`，同步结果会持久化到 PostgreSQL。

初始化数据库：

```bash
cp .env.example .env.local
pnpm prisma:generate
pnpm prisma:push
```

## 真实来源配置

默认情况下，`Greenhouse` 和 `Lever` 会回退到本地 fixture 数据。  
如果要接真实公开职位板，可以在 `.env.local` 中配置：

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
- 未配置时仍使用 fixture，保证本地可运行
- 配置了 `DATABASE_URL` 后，聚合同步结果会写入 PostgreSQL
- 也可以直接在 `/admin` 页面里保存来源配置，保存后会写入 `.job-radar-source-feeds.json`

同步接口：

```bash
curl -X POST http://localhost:3000/api/admin/sync
```

## 测试

```bash
pnpm test
pnpm test:e2e
```
