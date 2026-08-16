# Cloudflare Workers ops — 生命迴路：澄灣

Local-first hosting for the P0 SPA. Game progress stays in the browser (`localStorage` key `life-circuit-chengwan.save.v1`). The Worker never reads or writes save data, never collects workshop PII, and has no KV / D1 / R2 / secrets.

Docs fetched 2026-08-15 before this file and `wrangler.jsonc` were written:

- https://developers.cloudflare.com/workers/static-assets/
- https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/
- https://developers.cloudflare.com/workers/static-assets/binding/
- https://developers.cloudflare.com/workers/static-assets/headers/
- https://developers.cloudflare.com/workers/wrangler/configuration/
- https://developers.cloudflare.com/workers/wrangler/commands/workers/
- https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/

Do not invent Wrangler keys. Do not treat `vite preview` as deploy-parity.

## Stack

| Item | Value |
|---|---|
| Config | `wrangler.jsonc` (not toml) |
| Worker name | `life-circuit-chengwan` |
| `workers_dev` | `true` |
| `compatibility_date` | `2026-08-15` (also enables navigation-prefers-asset-serving, ≥ 2025-04-01) |
| Entry | `src/worker.ts` |
| Worker tsconfig | `tsconfig.worker.json` (`wrangler.jsonc` `tsconfig`) |
| Assets | Vite `dist/` after `npm run build` |
| SPA fallback | `assets.not_found_handling = "single-page-application"` |
| Binding | `ASSETS` → `env.ASSETS.fetch(request)` |
| Worker-first routes | `["/health", "/health/*"]` only (Wrangler ≥ 4.20.0) |
| Client base | `vite.config.ts` `base: "./"` (works on `*.workers.dev` and custom domains) |
| Local URL | http://127.0.0.1:8787 |
| Live deploy this request | **Blocked.** `LIVE_DEPLOY_REQUESTED` is false. |

`html_handling` is omitted. The documented default is `auto-trailing-slash`.

## Prerequisites

```bash
npm install
```

Pinned toolchain: Node ≥ 20, local Wrangler (`npx wrangler`, currently `^4.28.1` in `package.json`). Do not rely on a global Wrangler.

## Local (deploy-parity)

Vite is for fast iteration only.

```bash
npm run dev          # Vite, http://localhost:5173 — not Cloudflare
npm run preview      # Vite preview — extra check, not a substitute
```

Deploy-parity **must** go through Wrangler after a Vite production build:

```bash
npm run build
npx wrangler dev --port 8787
```

Or the combined script:

```bash
npm run cf:dev
```

Then open http://127.0.0.1:8787

Smoke on that origin:

1. `/` — title screen, WebGL canvas, no CSP / COOP / COEP console errors that block Three.js.
2. A client route that is not a real file (for example `/hub`) — `200` + `index.html` (SPA fallback).
3. `/assets/*` hashed JS/CSS — `Cache-Control: public, max-age=31556952, immutable`.
4. `/` and `/index.html` — `Cache-Control: no-cache`.
5. `/health` — JSON `{ "ok": true, "service": "life-circuit-chengwan", "gameState": false }`, `Cache-Control: no-store`. No save payload.

`wrangler dev` uses the local `workerd` runtime (`TZ=UTC`), the same `assets` binding, and the same `not_found_handling` as production.

## Dry-run (no upload)

```bash
npm run build
npx wrangler deploy --dry-run
```

Or:

```bash
npm run cf:dry
```

`--dry-run` compiles the Worker and validates config **without** creating a version or a deployment. Latest captured output: [`dry-run.txt`](./dry-run.txt).

Optional, documented, still not a live publish:

```bash
npx wrangler deploy --dry-run --outdir .wrangler/dry-run
```

## Live deploy (gated)

Live publish is allowed **only** when both are true:

1. The task / conversation sets `LIVE_DEPLOY_REQUESTED` to `true`.
2. `npx wrangler whoami` succeeds (OAuth, `CLOUDFLARE_API_TOKEN`, or global API key).

This request: `LIVE_DEPLOY_REQUESTED` is **false**. Stop after dry-run even if `whoami` works.

If both gates pass later:

```bash
npm run build
npx wrangler whoami
npx wrangler deploy
```

Or `npm run cf:deploy` after `whoami`.

Expected public URL shape after a real deploy: `https://life-circuit-chengwan.<subdomain>.workers.dev`.

Do **not** use `wrangler deploy --temporary` for this game (temporary preview accounts / claim URLs). Do not add custom domains, routes, or zone IDs for P0.

## Rollback (only after a live version exists)

Documented commands: https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/

```bash
npx wrangler deployments list
npx wrangler versions list
npx wrangler rollback                 # previous version
npx wrangler rollback <VERSION_ID>    # specific version, last 100
npx wrangler rollback <VERSION_ID> --message "revert P0 hosting"
```

`rollback` immediately creates a new deployment that serves 100% of traffic on that version (including after a split / gradual deploy). Bindings are **not** reverted; P0 has none.

Dashboard path: Workers & Pages → `life-circuit-chengwan` → Deployments → ⋯ → Rollback.

There is nothing to roll back until a live deploy exists.

## Routing and cache

Asset-first except `/health`:

- Matching file in `dist/` → asset Worker (no user-script bill).
- Browser navigation miss (`Sec-Fetch-Mode: navigate`) → rewrite to `/index.html` (`200`) because `not_found_handling` is `single-page-application`.
- `/health` and `/health/*` → `src/worker.ts` first (`run_worker_first`).
- Other misses that still reach the user Worker → `env.ASSETS.fetch(request)` (SPA rules still apply).

Cache is **not** a Wrangler flag. Author `public/_headers`; Vite copies it to `dist/_headers`. Cloudflare does not serve `_headers` as a public file.

| Pattern | Cache-Control |
|---|---|
| `/*` (including SPA fallbacks such as `/hub`) | `no-cache` + CSP / nosniff / frame / referrer / permissions |
| `/index.html` | `no-cache` (explicit) |
| `/assets/*` (Vite hashed JS/CSS) | detach then `public, max-age=31556952, immutable` |
| `/health` (Worker) | `no-store` |
| Default if `_headers` missing | `public, max-age=0, must-revalidate` + `ETag` |

`/` only matches the site root. Use documented `/*` so rewritten SPA paths keep CSP. `/assets/*` uses `! Cache-Control` so it does not inherit `no-cache` (duplicate `_headers` values are comma-joined).

`vite.config.ts` `base: "./"` keeps hashed URLs relative so the same `dist/` works on workers.dev and a later custom host.

## Security headers

`_headers` apply to **asset** responses only. `/health` (and any response the user Worker constructs) sets headers in `src/worker.ts`.

| Header | P0 |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-Frame-Options` | `DENY` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` (Worker `/health` and Worker-wrapped misses) |
| `Content-Security-Policy` | `'self'` + `wasm-unsafe-eval` + `blob:` workers + `data:`/`blob:` images. No third-party analytics hosts. |
| `Cross-Origin-Opener-Policy` / `Cross-Origin-Embedder-Policy` | **Off.** Cross-origin isolation can break Three.js / blob workers. Enable only after a `wrangler dev` WebGL + wasm smoke. |

Do not add Cloudflare Web Analytics, Zaraz, or any beacon that could collect workshop PII (names, schools, health, photos, voice, location). `observability.enabled` is `false`. `send_metrics` is `false`.

## Forbidden for P0

- `kv_namespaces`, `d1_databases`, `r2_buckets`, `queues`, `secrets`, `analytics_engine_datasets`, `ai`
- Custom `routes` / zone / account-specific IDs in-repo
- Game state on the server
- Accounts, chat, remote telemetry
- Pages-only keys or invented `cache` Wrangler flags

## Scripts

| Script | Command |
|---|---|
| `npm run build` | `vite build` → `dist/` |
| `npm run cf:dev` | `vite build && wrangler dev --port 8787` |
| `npm run cf:dry` | `vite build && wrangler deploy --dry-run` |
| `npm run cf:deploy` | `vite build && wrangler deploy` — only when both live-deploy gates pass |

## This request (2026-08-15)

| Gate | Result |
|---|---|
| Docs fetched | Yes (URLs above) |
| `wrangler.jsonc` valid | Yes — schema keys only; SPA assets + `/health` |
| `npm run build` | **exit 0** (Vite 7.3.6; hashed `dist/assets/*`) |
| `npx wrangler deploy --dry-run` | **exit 0** — Worker 2.08 KiB / gzip 0.92 KiB; binding `env.ASSETS`; `--dry-run: exiting now.` See [`dry-run.txt`](./dry-run.txt). |
| `npx wrangler dev --port 8787` | Ready on http://127.0.0.1:8787. `/health` 200 `gameState:false` `no-store`. `/` and `/hub` 200 HTML `no-cache` + CSP. `/assets/index-CMSfCCzy.js` `immutable`. URL recorded in [`../qa/server-url.txt`](../qa/server-url.txt). |
| `npx wrangler whoami` | Succeeded (OAuth session present). Not sufficient alone. |
| `LIVE_DEPLOY_REQUESTED` | **false** |
| Live `wrangler deploy` | **Not run.** Blocker: live deploy was not requested. |
