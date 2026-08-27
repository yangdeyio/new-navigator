# AGENTS.md

Personal bookmark/navigator site. The whole app lives in `client/` (Vue 3 + Vite + ant-design-vue 4). No backend server — all content is static data in `client/src/Data/source.js`.

## Commands

Run everything from `client/` (no root package.json):

- Dev server: `npm run dev`
- Production build: `npm run build` (output in `client/dist/`)
- Local preview of build: `npm run preview`
- Lint (+ autofix): `npm run lint`

There is no test suite. The `yarn run test` line in `client/README.md` is stale vue-cli boilerplate; no `test` script exists.

## Deploy: commit dist/

`.github/workflows/main.yml` has **no build step**. On push to `master` it runs `npm install` (Node 20) and scp's the **committed** `client/dist/` to the target server. Your changes are not deployed until you run `npm run build` locally and commit the updated `client/dist/` files.

## Toolchain

Vite-based (replaced vue-cli/node-sass in 2026): requires Node ≥ 20; `build` takes ~1 min. This machine's npm uses an allow-scripts policy that blocks esbuild's postinstall on fresh installs — run `npm approve-scripts esbuild` once after installing or builds fail. Both lockfiles are gitignored.

## Ant Design / routing conventions

- ant-design-vue 4 is pure ESM (no babel plugin needed; Vite tree-shakes it). Components used must be explicitly imported and globally registered in `client/src/main.js` (`app.component(Layout.name, ...)` pattern) or they silently log "Unknown custom element". Icons come from `@ant-design/icons-vue`, imported locally per component.
- Routing is **hash mode** (`createWebHashHistory`) so any static host works without SPA rewrites; routes `/`, `/collect`, `/worklog`, `/message` render via `<router-view>` inside the sider-menu layout in `App.vue`.
- Imports of `.vue` files need the explicit `.vue` extension (webpack-style extensionless imports don't resolve).
