# Job Radar

桌面优先的前端职位发现工作台。当前版本基于本地 mock 数据，包含：

- `/discover`：职位发现、组合筛选、详情侧栏、收藏与状态管理
- `/my-jobs`：我的职位视图，按收藏 / 待看 / 已投 / 忽略聚合
- 本地持久化：职位状态与备注保存在浏览器 `localStorage`
- Mock repository：数据层以异步仓储封装，后续可替换为真实 API

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
pnpm dev
```

## 测试

```bash
pnpm test
pnpm test:e2e
```
