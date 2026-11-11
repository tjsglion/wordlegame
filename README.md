# LetterLoop

> H5 word games platform

## 🚀 Tech Stack

- Next.js 16+
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Drizzle ORM
- Turso
- Cloudflare Workers

## 🛠️ Quick Start

```bash
npm install
cp .env.example .env.local

# 启动本地数据库（turso dev，基于 local.db 提供 http://127.0.0.1:8080），保持运行
npm run db:dev

# 另开终端：生成并应用迁移
npm run db:generate && npm run db:migrate

npm run dev
```

Open http://localhost:3000

## 📁 Structure

```
letterloop/
├── src/
│   ├── app/
│   ├── components/
│   │   ├── ui/
│   │   ├── features/
│   │   └── layout/
│   └── lib/
│       ├── db.ts
│       ├── drizzle/
│       └── utils.ts
└── public/
```

## 📝 Scripts

- `npm run dev` - Development server
- `npm run typecheck` - 重建 Next 路由类型后跑 `tsc --noEmit`
- `npm run check` - typecheck + lint
- `npm run db:*` - Database commands

- `npm run deploy` - Deploy to Cloudflare

## 🔧 Troubleshooting

### 删除/移动路由后报 `Cannot find module '../../src/app/.../page.js'`

Next 会为每个页面和路由在 `.next/types/validator.ts` 里生成一条 `import()` 引用。删除或移动路由后，这份生成文件不会自动同步，`tsc` 便去引用一个已不存在的模块——这不是源码错误。

不要手动删 `.next/types`：路由类型（`PageProps<"/[locale]">` 等）也来自同一目录，删掉会引入新报错。用 Next 自带的类型生成命令重建即可：

```bash
npm run typecheck   # 等价于 next typegen && tsc --noEmit
```

### `next build` 报 `Initiated Worker with invalid NODE_OPTIONS`

Turbopack 的 worker 进程会继承 `NODE_OPTIONS`，但只接受白名单内的 flag。若环境注入了 `--use-system-ca`（部分沙箱与 CI 镜像会这么做），构建直接失败：

```bash
node -e "console.log(process.env.NODE_OPTIONS)"   # 确认是否非空
env -u NODE_OPTIONS npm run build                 # 剥掉后重跑
```

### `next build` 在清空 `.next` 时中断

构建开始时 Turbopack 会批量删除输出目录。若所在环境对批量删除有阈值限制（安全策略要求确认等），会被拦下。改用独立输出目录避开删除——`next.config.ts` 已支持该变量：

```bash
NEXT_DIST_DIR=.next-build npm run build
```

---

MIT © 2026
