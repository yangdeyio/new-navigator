# navigator

个人书签导航站，多用户、需登录。前端 **Vue 3 + Vite + ant-design-vue 4**，后端 **Cloudflare Pages Functions + D1 数据库**，无独立服务器。

## 目录结构

```
client/
├── src/                    # 前端源码（Vue 3 + hash 路由）
│   ├── Data/source.js      # 书签种子数据（仅喂给 seed 脚本，运行时不引用）
│   └── store/index.js      # 登录态 store（initAuth / 各页面数据流）
├── functions/              # Cloudflare Pages Functions（即后端）
│   ├── _middleware.js      # 校验所有 /api/* 的会话 cookie
│   ├── lib/auth.js         # PBKDF2 哈希 / JWT 签发校验（纯 WebCrypto，Node ≥ 20 可直接 import）
│   └── api/
│       ├── auth/{login,register,logout,me}.js
│       ├── bookmarks/{index,[id]}.js
│       └── messages/index.js
├── migrations/0001_init.sql        # users / bookmarks / messages 表
├── migrations/0002_seed.sql        # 由 seed 脚本生成，已 gitignore
├── scripts/import-source.mjs       # source.js → seed SQL
├── wrangler.toml                   # D1 binding: DB → navigator-db
└── .dev.vars                       # 本地环境变量（gitignore），如 JWT_SECRET=xxx
```

## 环境要求

- Node ≥ 20（Vite 6 + 纯 ESM 工具链，密码哈希依赖 WebCrypto）。
- 本机 npm 启用了 allow-scripts 策略：全新 `npm install` 后需先放行构建脚本，否则 dev/build 会失败：

```bash
npm approve-scripts esbuild
npm approve-scripts workerd   # wrangler 需要
```

lockfile 已 gitignore。

## 快速开始（本地全栈）

```bash
cd client
npm install
npm approve-scripts esbuild && npm approve-scripts workerd

npm run db:migrate                 # 本地 D1 建表
npm run db:seed -- --password <你的密码>   # 导入书签并创建账号 blake
npm run build                      # wrangler 需要一次 dist 构建产物
npx wrangler pages dev             # 完整服务：Functions + D1 + 静态资源
```

打开 http://localhost:8788 ，用 `blake` / 你设置的密码登录即可。

### 前端热更新开发

改前端时开两个终端，走 Vite 的 HMR：

```bash
npm run build && npx wrangler pages dev   # 终端 A：API 在 127.0.0.1:8788
npm run dev                               # 终端 B：前端在 5173，/api 自动代理到 8788
```

首次启动前需要 `npm run build` 让 dist 存在；之后前端改动只走终端 B。

## 命令一览

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | Vite 开发服务器（默认 5173），`/api` 代理到 `http://127.0.0.1:8788` |
| `npm run build` | 生产构建，输出 `client/dist/` |
| `npm run lint` | ESLint 检查并自动修复 |
| `npm run db:migrate` | 应用本地 D1 迁移（`navigator-db`） |
| `npm run db:seed -- --password <pw> [--user <name>]` | 从 `src/Data/source.js` 生成 `migrations/0002_seed.sql` 并应用到本地库 |
| `npx wrangler pages dev` | 完整本地服务（Functions + D1 + dist 构建产物） |

### 种子数据说明

- 数据只来自 `src/Data/source.js`；组件运行时**不会** import 它。
- 生成的 `0002_seed.sql` 已 gitignore。脚本会删除同名用户及其书签后重建，所以重复执行是安全的（相当于"重置为种子状态"）。
- 密码哈希由 `functions/lib/auth.js` 提供（PBKDF2-SHA256、10 万次迭代、每用户 salt），与线上逻辑完全一致。
- 没有测试套件。

## 页面与认证

- hash 路由：`#/login`（公开）、`#/`（导航首页）、`#/collect`、`#/worklog`、`#/message`；其余路由经 `route.js` 守卫等待 `initAuth()`，未登录跳 `#/login`。
- 会话：HttpOnly cookie `session`（HS256 JWT，7 天有效）。`functions/_middleware.js` 对所有 `/api/*` 校验，仅放行 `/api/auth/login|register`。
- ant-design-vue 4 为纯 ESM：用到的组件必须在 `src/main.js` 显式 import 并全局注册，否则控制台只会报 "Unknown custom element"。`.vue` 文件互相导入需带 `.vue` 扩展名。

## API

所有接口均要求会话（登录/注册除外），且按用户隔离数据。

| 方法与路径 | 说明 |
| --- | --- |
| `POST /api/auth/login` | 登录，种下 session cookie |
| `POST /api/auth/register` | 注册（需 `ALLOW_REGISTER=1`，可选 Turnstile 校验） |
| `POST /api/auth/logout` | 登出，清除 cookie |
| `GET /api/auth/me` | 当前用户信息 |
| `GET /api/bookmarks` | 全部书签，按分类分组返回 |
| `POST /api/bookmarks` | 新增书签（`category` ≤ 32 字，`href` 须 http(s)，`value` 1–50 字） |
| `PUT /api/bookmarks/:id` | 更新书签 |
| `DELETE /api/bookmarks/:id` | 删除书签 |
| `GET /api/messages` | 最近 200 条留言（含用户名，全局共享） |
| `POST /api/messages` | 发留言（≤ 1000 字） |

## 环境变量

Pages 项目上配置：

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `JWT_SECRET` | ✅ | 长随机字符串，用于签名会话 JWT |
| `ALLOW_REGISTER` | — | 设为 `1` 开放注册接口，缺省关闭 |
| `TURNSTILE_SECRET_KEY` | — | 注册时的 Turnstile 人机验证 |

D1 binding 名固定为 `DB`（数据库 `navigator-db`，见 `wrangler.toml`）。本地开发把这些写进 `client/.dev.vars`（gitignored）。

## 部署（Cloudflare Pages）

- 推送到 Pages 连接的分支即自动部署。Pages 构建：根目录 `client`，输出目录 `dist`（旧的 scp workflow 已删除）。
- `client/dist/` 已 gitignore，**不要提交**，线上由 Pages 自行构建。
- 远程建表/迁移只需在有 schema 变更时执行：

```bash
npx wrangler d1 migrations apply navigator-db --remote
```
