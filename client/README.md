# navigator

个人书签导航站，多用户、需登录。前端 **Vue 3 + Vite + ant-design-vue 4**，后端 **Cloudflare Pages Functions + D1 数据库**，无独立服务器。整个代码库为 **TypeScript 严格模式**（`src/` 与 `functions/` 均为 `.ts`/`.vue`）。

## 目录结构

```
client/
├── src/                        # 前端源码（Vue 3 + hash 路由）
│   ├── components/             # Login / Register / Source / Search / Collect / Worklog / Message / ChangePasswordModal / Favicon / HelloWorld
│   ├── router/route.ts         # 路由守卫，非公开路由 await initAuth() 后跳 #/login
│   ├── store/index.ts          # 登录态 + 书签/留言/日志/收藏数据流（运行时唯二数据来源）
│   ├── types/index.ts          # 领域类型
│   ├── utils/                  # api / categories / bookmarkHtml / format / background
│   ├── Data/source.js          # 书签种子数据（仅喂 seed 脚本，运行时不引用）
│   └── main.ts                 # ant-design-vue 组件全局注册（纯 ESM 需显式 import）
├── functions/                  # Cloudflare Pages Functions（即后端）
│   ├── _middleware.ts          # 校验所有 /api/* 的会话 cookie，放行 login|register|config
│   ├── lib/auth.ts             # PBKDF2 哈希 / JWT 签发校验 / cookie（纯 WebCrypto，Node ≥24 可直 import）
│   ├── lib/bookmarks.ts        # 书签校验（分类/URL/名称长度）
│   ├── lib/rateLimit.ts        # 登录/注册频率限制（auth_attempts）
│   └── api/
│       ├── auth/{login,register,logout,me,password,config}.ts
│       ├── bookmarks/{index,[id],import}.ts
│       ├── collections/{index,[id]}.ts
│       ├── worklogs/{index,[id]}.ts
│       └── messages/index.ts
├── test/                       # Node 原生 type-stripping 单测（node --test）
│   ├── auth.test.ts            # PBKDF2 / JWT / cookie 解析
│   └── bookmarkHtml.test.ts    # Netscape 书签 HTML 解析器
├── migrations/
│   ├── 0001_init.sql           # users / bookmarks / messages
│   ├── 0003_features.sql       # worklogs / collections
│   ├── 0004_security.sql       # auth_attempts（登录/注册频率限制）
│   └── 0002_seed.sql           # 由 seed 脚本生成，已 gitignore
├── scripts/import-source.mjs   # source.js → 0002_seed.sql
├── wrangler.toml               # D1 binding: DB → navigator-db
└── .dev.vars                   # 本地环境变量（gitignore），如 JWT_SECRET=xxx
```

## 环境要求

- **Node ≥ 20**：运行 Vite 6 / 构建工具链（纯 ESM），密码哈希依赖 WebCrypto。
- **Node ≥ 24**：`npm run test` 需要——单测靠原生 type stripping 直接跑 `.ts`（导入 `.ts` 必须带显式扩展名，且只能用 erasable TS 语法，不能用 enum/namespace）。
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

npm run db:migrate                          # 本地 D1 建表（0001/0003/0004）
SEED_PASSWORD=<你的密码> npm run db:seed      # 导入书签并创建账号 blake
npm run build                               # wrangler 需要一次 dist 构建产物
npx wrangler pages dev                      # 完整服务：Functions + D1 + 静态资源
```

打开 http://localhost:8788 ，用 `blake` / 你设置的密码登录即可。

> ⚠️ `npm run db:seed -- --password <pw>` **不生效**：npm 会把 `--password` 追加到结尾的 `wrangler d1 execute` 命令上，而不是传给 `node` 脚本。请改用 `SEED_PASSWORD=<pw> npm run db:seed`。

### 前端热更新开发

改前端时开两个终端，走 Vite 的 HMR：

```bash
npx wrangler pages dev   # 终端 A：API 在 127.0.0.1:8788（首次需先 npm run build 让 dist 存在）
npm run dev              # 终端 B：前端在 5173，/api 自动代理到 8788
```

## 命令一览

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | Vite 开发服务器（默认 5173），`/api` 代理到 `http://127.0.0.1:8788` |
| `npm run build` | 生产构建，输出 `client/dist/` |
| `npm run preview` | 本地预览 `dist` 产物 |
| `npm run lint` | ESLint 检查并自动修复（`src` + `functions`） |
| `npm run typecheck` | `vue-tsc --noEmit`（前端）+ `tsc -p functions --noEmit`（后端），均 strict |
| `npm run test` | Auth + 书签解析器单测（`node --test`，需 Node ≥24） |
| `npm run db:migrate` | 应用本地 D1 迁移（`navigator-db`） |
| `npm run db:seed` | 从 `src/Data/source.js` 生成 `0002_seed.sql` 并应用到本地（需 `SEED_PASSWORD`） |
| `npx wrangler pages dev` | 完整本地服务（Functions + D1 + dist 构建产物） |

### 种子数据说明

- 数据只来自 `src/Data/source.js`；组件运行时**不会** import 它。
- 生成的 `0002_seed.sql` 已 gitignore。脚本会删除同名用户及其书签后重建，重复执行安全（相当于"重置为种子状态"）。
- 密码哈希由 `functions/lib/auth.ts` 提供（PBKDF2-SHA256、10 万次迭代、每用户 salt），与线上逻辑完全一致。

## 页面与认证

- hash 路由：`#/login`、`#/register`（公开）；`#/`（导航首页）、`#/collect`、`#/worklog`、`#/message`（均需登录）；其余路由重定向到 `/`。非公开路由由 `router/route.ts` 守卫等 `initAuth()`，未登录跳 `#/login` 并保留 `?redirect=`。
- 会话：HttpOnly cookie `session`（HS256 JWT，7 天有效）。`functions/_middleware.ts` 对所有 `/api/*` 校验，仅放行 `/api/auth/login|register|config`。
- 登录/注册有频率限制：`auth_attempts` 表，固定 15 分钟窗口，每 key（`login:<用户名>` / `register:<用户名>`）5 次失败，在 PBKDF2 **之前**检查（避免 CPU 烧穿 DoS）；窗口耗尽返回 429 + `Retry-After`，成功后重设计数。
- ant-design-vue 4 为纯 ESM：用到的组件必须在 `src/main.ts` 显式 import 并全局注册，否则控制台只报 "Unknown custom element"。`.vue` 文件互相导入需带 `.vue` 扩展名。

## API

所有接口均要求会话（登录/注册/config 除外），且按 `user_id` 隔离数据。

### auth
| 方法与路径 | 说明 |
| --- | --- |
| `POST /api/auth/login` | 登录，种下 `session` cookie |
| `POST /api/auth/register` | 注册（需 `ALLOW_REGISTER=1`，可选 Turnstile 校验，受频率限制） |
| `POST /api/auth/logout` | 登出，清除 cookie |
| `GET /api/auth/me` | 当前用户信息 |
| `GET /api/auth/config` | `{ allowRegister }`，页面据此决定是否显示注册入口 |
| `POST /api/auth/password` | 改密（`currentPassword` + `newPassword` ≥ 8 位） |

### bookmarks
| 方法与路径 | 说明 |
| --- | --- |
| `GET /api/bookmarks` | 全部书签，按分类动态分组返回 |
| `POST /api/bookmarks` | 新增书签（`href` 须 http(s) 且 ≤2048，`category` ≤64 字，`value` ≤120 字） |
| `PUT /api/bookmarks/:id` | 更新书签 |
| `DELETE /api/bookmarks/:id` | 删除书签 |
| `POST /api/bookmarks/import` | 批量导入（`{ bookmarks: [...] }`，单次 ≤2000 条，分类动态） |

### collections
| 方法与路径 | 说明 |
| --- | --- |
| `GET /api/collections` | 本用户的收藏，按 `is_read` 排序 |
| `POST /api/collections` | 新增收藏（`href` 须 http(s)，`title` ≤120 字，`note` ≤500 字） |
| `PUT /api/collections/:id` | 更新 title/note，可切换 `is_read` |
| `DELETE /api/collections/:id` | 删除收藏 |

### worklogs
| 方法与路径 | 说明 |
| --- | --- |
| `GET /api/worklogs` | 本用户的工作日志，按 `is_done` 排序 |
| `POST /api/worklogs` | 新增日志（`content` ≤500 字） |
| `PUT /api/worklogs/:id` | 更新内容，可切换 `is_done` |
| `DELETE /api/worklogs/:id` | 删除日志 |

### messages
| 方法与路径 | 说明 |
| --- | --- |
| `GET /api/messages` | 最近 200 条留言（含用户名，全局共享） |
| `POST /api/messages` | 发留言（`content` ≤1000 字） |

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
- 远程建表/迁移在每次有新 schema 变更时执行（含新增的 `0003_features.sql`、`0004_security.sql`）：

```bash
npx wrangler d1 migrations apply navigator-db --remote
```
