# AGENTS.md

Personal bookmark/navigator site, multi-user and login-required. Frontend lives in `client/` (Vue 3 + Vite + ant-design-vue 4); backend is Cloudflare Pages Functions (`client/functions/`) with a D1 database. Bookmark/message data is **no longer** in `client/src/Data/source.js` — that file only feeds the seed script now. Data is stored in D1, all scoped by `user_id`: `users`, `bookmarks`, `messages` (from `0001_init.sql`), plus `worklogs` and `collections` (from `0003_features.sql`).

## Commands

Run everything from `client/` (no root package.json):

- Dev server (frontend only, proxies `/api` to `http://127.0.0.1:8788`): `npm run dev`
- Production build: `npm run build` (output in `client/dist/`)
- Lint (+ autofix): `npm run lint` (covers both `src` and `functions`)
- Auth unit tests (Node test runner, `node --test`): `npm run test`
- Apply D1 migrations locally: `npm run db:migrate`
- Regenerate seed SQL from source.js + apply locally: `SEED_PASSWORD=<pw> npm run db:seed` (gitignored output; creates/refreshes account `blake`). Note: `npm run db:seed -- --password <pw>` does **not** work — npm appends `--password` to the trailing `wrangler d1 execute`, so export `SEED_PASSWORD` instead.
- Full-stack local server (functions + D1 + built assets): `npx wrangler pages dev` after `npm run build`

Auth unit tests in `client/test/` cover `lib/auth.js` (PBKDF2 hashing, JWT sign/verify, cookie flags, cookie parsing). There is otherwise no test suite.

## Deploy: Cloudflare Pages

The old scp workflow (`.github/workflows/main.yml`) was deleted; `client/dist/` is gitignored and must **not** be committed. Pushing to the connected branch triggers Pages to run `npm run build` itself (project root `client`, output dir `dist`).

Env vars/secrets on the Pages project:

- `JWT_SECRET` — required, long random string
- `ALLOW_REGISTER` — `1` enables `/api/auth/register`, absent = registration closed
- `TURNSTILE_SECRET_KEY` — optional Turnstile check for register
- D1 binding name: `DB` (database `navigator-db`; remote migrations: `npx wrangler d1 migrations apply navigator-db --remote`)

Local dev secrets live in `client/.dev.vars` (gitignored).

## Auth model

Sessions are HMAC HS256 JWTs in an HttpOnly `session` cookie (7-day TTL), verified by `client/functions/_middleware.js` for every `/api/*` path except `/api/auth/login|register|config`. Password hashing is PBKDF2-SHA256, 100k iterations, per-user salt — implemented once in `client/functions/lib/auth.js` (pure WebCrypto so Node ≥20 can import it; the seed script reuses it). Router guard in `route.js` + reactive store in `src/store/index.js` drive the frontend: every non-public route awaits `initAuth()` and bounces to `#/login`. `/api/auth/config` exposes whether registration is open (`ALLOW_REGISTER`); the login page shows a `/register` link only when it is.

## Toolchain

Vite-based: requires Node ≥ 20; `build` takes ~1 min. This machine's npm uses an allow-scripts policy that blocks postinstall scripts on fresh installs — run `npm approve-scripts esbuild` (and `workerd`, needed by wrangler) after installing or builds/dev fail. Lockfiles are gitignored.

## Ant Design / routing conventions

- ant-design-vue 4 is pure ESM. Components used must be explicitly imported and globally registered in `client/src/main.js` (`app.component(Layout.name, ...)` pattern) or they silently log "Unknown custom element". Icons come from `@ant-design/icons-vue`, imported locally per component.
- Routing is **hash mode**: routes `/login` and `/register` (bare layout, `meta.public`), `/`, `/collect`, `/worklog`, `/message` (all require the session). `App.vue` decides bare-vs-sidebar layout from `route.meta.public`. Data flows through `src/store/index.js` — components never import `Data/source.js` at runtime.
- Imports of `.vue` files need the explicit `.vue` extension (webpack-style extensionless imports don't resolve).
