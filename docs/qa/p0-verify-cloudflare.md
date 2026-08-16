# P0 Cloudflare / deploy verification (adversarial, fail-closed)

| Field | Value |
|---|---|
| Document | `docs/qa/p0-verify-cloudflare.md` |
| Date | 2026-08-15 |
| Role | Adversarial Cloudflare / deploy verifier |
| Repo | `C:/Users/daive/life-circuit-chengwan` |
| Locale | zh-Hant (player). This report is English ops QA. |
| `LIVE_DEPLOY_REQUESTED` | **false** |
| Local origin | http://127.0.0.1:8787 |
| Wrangler | `4.123.0` (`package-lock.json` + `node_modules/wrangler`) |
| Node | `v24.14.1` (satisfies Wrangler 4.123 `engines.node >= 22`) |
| Current bundle | `dist/assets/index-vBdllirQ.js` + `index-DxyTvIel.css` |

This document verifies **hosting only**. It does **not** pass Fun Gate / Learning Gate. Gameplay defects stay in [`p0-browser-findings.md`](./p0-browser-findings.md).

---

## Verdict

**HOSTING: PASS (local wrangler path only).**  
**LIVE DEPLOY: NOT RUN — FAIL-CLOSED BLOCK.**

Both live-deploy gates are required. `npx wrangler whoami` succeeded (OAuth session present; account identifiers redacted). `LIVE_DEPLOY_REQUESTED` is **false**. whoami success is **not** sufficient. `wrangler deploy` (without `--dry-run`), `npm run cf:deploy`, and `wrangler deploy --temporary` were **not** executed.

No invented Wrangler keys. No `wrangler.jsonc` edit was required: current keys match official Workers static-assets / Wrangler configuration docs fetched 2026-08-15.

---

## Gate table (fail closed)

| Gate | Required | Result | Evidence |
|---|---|---|---|
| Config is `wrangler.jsonc` (not toml) | Yes | **PASS** | `C:/Users/daive/life-circuit-chengwan/wrangler.jsonc`. No `wrangler.toml`. |
| `name` = `life-circuit-chengwan` | Yes | **PASS** | `wrangler.jsonc` |
| `workers_dev` = true | Yes | **PASS** | Explicit `true` |
| `compatibility_date` = `2026-08-15` | Yes | **PASS** | Also ≥ `2025-04-01` (navigation prefers asset serving) |
| `assets.directory` = `./dist` | Yes | **PASS** | Vite `outDir: "dist"` |
| `not_found_handling` = `single-page-application` | Yes | **PASS** | Config + live `/hub` and `/c1` → `200` + `index.html` |
| SPA fallback documented + proven | Yes | **PASS** | Same `ETag` `"189e8260e8cfbee73f0cc53705317fa1"` on `/` and `/hub` |
| No required backend / accounts | Yes | **PASS** | Worker has no game API. Save is `localStorage` only (`life-circuit-chengwan.save.v1`) |
| No secrets in repo / config | Yes | **PASS** | No `.env`, `.dev.vars`, `vars`, `secrets`, `account_id` |
| No KV / D1 / R2 / Queues / Analytics Engine | Yes | **PASS** | Dry-run binding list: `env.ASSETS` only |
| `/health` exists, no game state | Yes | **PASS** | Live `200` `{"ok":true,"service":"life-circuit-chengwan","gameState":false}` `Cache-Control: no-store` |
| Cache: hashed `/assets/*` immutable; `index.html` no-cache | Yes | **PASS** | Live headers below |
| CSP allows WebGL / wasm / blob; no third-party analytics hosts | Yes | **PASS** | `'self'` + `wasm-unsafe-eval` + `blob:` workers. `connect-src 'self'` |
| COOP / COEP | Off unless proven | **PASS (off)** | Absent on `/`. Intentionally omitted in `src/worker.ts` |
| No Web Analytics / workshop-PII beacons | Yes | **PASS** | `observability.enabled: false`, `send_metrics: false`. No Zaraz / CF Insights snippet in `index.html` |
| Local path is **wrangler dev**, not vite preview | Yes | **PASS** | Documented in `README.md`, `AGENTS.md`, `docs/ops/cloudflare.md`. Live origin is wrangler on `:8787` |
| `vite preview` is not a substitute | Yes | **PASS** | Scripts keep `preview` separate from `cf:dev` |
| Docs fetched before trusting flags | Yes | **PASS** | URLs below |
| Live deploy only if whoami **and** requested | Yes | **BLOCKED** | Requested = false. Stopped after dry-run |
| `wrangler deploy --dry-run` | Allowed | **PASS** | Exit 0. `--dry-run: exiting now.` |

---

## Official docs fetched (2026-08-15)

Do not invent keys. These pages were fetched during this pass:

| Page | Used for |
|---|---|
| https://developers.cloudflare.com/workers/static-assets/ | `assets.directory`, `not_found_handling`, binding, billing of Worker vs assets |
| https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/ | SPA `200` + `/index.html`; `run_worker_first` array (Wrangler ≥ 4.20.0) |
| https://developers.cloudflare.com/workers/static-assets/binding/ | `ASSETS` / `env.ASSETS.fetch`; `run_worker_first` glob / `!` exceptions |
| https://developers.cloudflare.com/workers/static-assets/headers/ | `_headers` in asset directory; default `public, max-age=0, must-revalidate` + `ETag`; `! Header` detach; `_headers` not served as a public file |
| https://developers.cloudflare.com/workers/wrangler/configuration/ | `wrangler.jsonc` recommended; `name`, `main`, `compatibility_date`, `workers_dev`, `tsconfig`, `assets.*`, `observability`, `send_metrics`; no cache flag |
| https://developers.cloudflare.com/workers/wrangler/commands/workers/ | `wrangler dev --port`; `wrangler deploy --dry-run`; `--temporary` **forbidden** for this game |

Documented SPA pair (from the SPA page):

```jsonc
{
  "assets": {
    "directory": "./dist/",
    "not_found_handling": "single-page-application"
  }
}
```

Repo matches that pair, plus documented optional `main`, `binding`, and `run_worker_first: ["/health","/health/*"]`. `html_handling` is omitted (documented default `auto-trailing-slash`).

---

## Config audit — `wrangler.jsonc`

Path: `C:/Users/daive/life-circuit-chengwan/wrangler.jsonc`

| Key | Value | Schema / docs | Notes |
|---|---|---|---|
| `$schema` | `./node_modules/wrangler/config-schema.json` | Documented | Local lockfile schema |
| `name` | `life-circuit-chengwan` | `[a-z0-9-]`, ≤63 for workers.dev | Pass |
| `compatibility_date` | `2026-08-15` | Required `yyyy-mm-dd` | Pass |
| `workers_dev` | `true` | Optional; default true | Explicit |
| `send_metrics` | `false` | Documented top-level | Project usage telemetry off |
| `main` | `src/worker.ts` | Required when a Worker script exists | Optional for assets-only; needed for `/health` |
| `tsconfig` | `tsconfig.worker.json` | Documented | Worker-only types |
| `assets.directory` | `./dist` | Documented | Not `./public` |
| `assets.not_found_handling` | `single-page-application` | Enum | Pass |
| `assets.binding` | `ASSETS` | Documented | Matches `Env.ASSETS` |
| `assets.run_worker_first` | `["/health","/health/*"]` | Array of `/` or `!/` globs; Wrangler ≥ 4.20.0 | Asset-first elsewhere so `public/_headers` apply |
| `observability.enabled` | `false` | Documented; default true on new Workers | Workers Logs off. **Not** Web Analytics |

**Forbidden keys (absent):** `kv_namespaces`, `d1_databases`, `r2_buckets`, `queues`, `secrets`, `secrets_store_secrets`, `analytics_engine_datasets`, `ai`, `account_id`, `routes` / `route` / zone, `vars`, Pages-only keys, invented `cache` Wrangler flags, Web Analytics / Zaraz.

No second config file. `.gitignore` excludes `.wrangler/`, `.dev.vars`, `.env`, `.env.*`, `dist/`.

---

## Worker audit — `src/worker.ts`

The Worker is **not** a game backend.

| Check | Result |
|---|---|
| Reads / writes save | **No.** No `localStorage`, no KV, no request body persist |
| Collects PII | **No.** Health JSON is a constant |
| Required for play | **No.** Client is a static SPA. Worker is headers + `/health` |
| `/health` and `/health/*` | Worker-first. `200` JSON, `no-store` |
| Other paths that reach the script | `env.ASSETS.fetch(request)` then security headers |
| COOP / COEP | Omitted (commented: unverified against Three.js / blob workers) |
| CSP | `'self'` + `wasm-unsafe-eval` + `blob:` workers/child + `data:`/`blob:` images. No third-party hosts |

Health payload (live, this pass):

```json
{"ok":true,"service":"life-circuit-chengwan","gameState":false}
```

No save key, no scene id, no player fields.

`run_worker_first` is **not** global `true`. That is correct: `_headers` apply only to **asset** responses. HTML / hashed files stay asset-first. `/health` sets headers in the Worker (documented caveat).

Client `src/` has **no** `fetch(` / `sendBeacon` / analytics. The only `fetch` in `src/` is the Worker handler and `env.ASSETS.fetch`. Save is `src/engine/save.ts` → `localStorage` key `life-circuit-chengwan.save.v1` with `PII_KEY_PATTERN` strip.

---

## Cache / headers — `public/_headers` → `dist/_headers`

Mechanism is documented `_headers`, not a Wrangler cache flag. Vite copies `public/` into `dist/`.

| Pattern | Intended | Live on http://127.0.0.1:8787 (this pass) |
|---|---|---|
| `/*` (incl. SPA `/hub`, `/c1`) | `Cache-Control: no-cache` + CSP / nosniff / referrer / frame / permissions | **Confirmed** on `/`, `/hub`, `/c1` |
| `/index.html` | `no-cache` | **Confirmed** |
| `/assets/*` hashed JS/CSS | detach then `public, max-age=31556952, immutable` | **Confirmed** on `index-vBdllirQ.js` and `index-DxyTvIel.css` |
| `/health` | Worker `no-store` | **Confirmed** |
| `/_headers` | Must **not** be served as the raw file | **Confirmed:** `200` `text/html` SPA shell, not the `_headers` text |
| COOP / COEP | Off | **Confirmed absent** |

Hashed JS live: `200` `text/javascript; charset=utf-8` `Cache-Control: public, max-age=31556952, immutable` (length 691716).

---

## Live origin (deploy-parity)

Already running `wrangler dev` on **http://127.0.0.1:8787** (not `vite` `:5173`, not `vite preview` `:4173`).

| Request | Status | Type | Cache | Notes |
|---|---|---|---|---|
| `GET /` | 200 | `text/html; charset=utf-8` | `no-cache` | Title `生命迴路：澄灣`, `#world`, `#title-screen`, `#btn-new`. Script `./assets/index-vBdllirQ.js` |
| `GET /index.html` | 200 | HTML | `no-cache` | |
| `GET /hub` | 200 | HTML (SPA) | `no-cache` | Same ETag as `/` |
| `GET /c1` | 200 | HTML (SPA) | `no-cache` | Same ETag |
| `GET /health` | 200 | JSON | `no-store` | `gameState: false` |
| `GET /health/extra` | 200 | JSON | `no-store` | `run_worker_first` `/health/*` works |
| `GET /assets/index-vBdllirQ.js` | 200 | JS | immutable 31556952 | |
| `GET /assets/index-DxyTvIel.css` | 200 | CSS | immutable 31556952 | |
| `GET /favicon.svg` | 200 | `image/svg+xml` | `no-cache` | Matches `/*` |
| `GET /_headers` | 200 | HTML SPA | `no-cache` | Raw header file not leaked |
| `GET /assets/nope-does-not-exist.js` | 200 | HTML SPA | | Documented SPA miss. Residual: a stale hash would execute HTML as JS |

`vite.config.ts` `base: "./"` keeps hashed URLs relative (workers.dev + later custom host).

---

## Dry-run (no upload)

Command (repo cwd):

```bash
npx wrangler deploy --dry-run
```

Also documented as `npm run cf:dry` (`vite build && wrangler deploy --dry-run`). This pass used the **already-built** `dist/` (same hash as the live 8787 origin) so the dry-run matches what was probed.

Result:

- Exit **0**
- Wrangler **4.123.0**
- `Read 7 files from the assets directory ...\dist`
- `Total Upload: 2.08 KiB / gzip: 0.92 KiB` (Worker script)
- Binding: `env.ASSETS` → Assets
- `--dry-run: exiting now.`

Refreshed log: [`docs/ops/dry-run.txt`](../ops/dry-run.txt).

Previous copy of that log listed hashed file `index-CMSfCCzy.js`. **Current** `dist/` and live 8787 serve `index-vBdllirQ.js`. Treat older `docs/qa/server-url.txt` / `p0-browser-findings.md` hashes as historical.

---

## whoami + live deploy

```text
npx wrangler whoami
→ OAuth session present. Account identifiers redacted in this report.
Token includes workers write (and many unused platform scopes).
```

| Gate | Value |
|---|---|
| `wrangler whoami` | Succeeded |
| `LIVE_DEPLOY_REQUESTED` | **false** |
| Live `wrangler deploy` | **Not run** |
| `npm run cf:deploy` | **Not run** |
| `wrangler deploy --temporary` | **Not run** (docs: preview/claim accounts — forbidden for this game) |

**Blocker (honest):** live publish was not requested. Authentication alone must not publish a student-facing iGEM build.

Expected later URL shape **if** both gates pass: `https://life-circuit-chengwan.<subdomain>.workers.dev`. No custom domain / zone in-repo.

---

## Package scripts (local path)

From `package.json`:

| Script | Command | Role |
|---|---|---|
| `dev` | `vite` | Fast iterate only (`:5173`) |
| `build` | `vite build` | Produces `dist/` |
| `preview` | `vite preview` | Extra. **Not** Cloudflare parity |
| `cf:dev` | `vite build && wrangler dev --port 8787` | **Required** local parity |
| `cf:dry` | `vite build && wrangler deploy --dry-run` | Compile + validate, no version |
| `cf:deploy` | `vite build && wrangler deploy` | Live. Dual-gated |

Documented operator path:

```bash
npm run build
npx wrangler dev --port 8787
```

Then open http://127.0.0.1:8787

---

## Secrets / privacy / analytics (fail closed)

| Check | Result |
|---|---|
| `.env` / `.env.local` / `.dev.vars` in repo | **Absent** |
| `account_id` in `wrangler.jsonc` | **Absent** |
| Secrets bindings | **Absent** |
| Game state on server | **Absent** |
| Remote telemetry in client | **Absent** |
| Cloudflare Web Analytics / Zaraz | **Absent** |
| `observability.enabled` | `false` |
| `send_metrics` | `false` |
| `.wrangler/` | Gitignored local miniflare cache + tmp bundles. Not a remote store |
| Health body | Constant JSON only |

CLI still printed a generic Wrangler usage-telemetry notice during dry-run. That is the Wrangler CLI, not a game beacon. Project `send_metrics` is false. Residual only.

---

## Residuals (not P0 hosting fails; close before any live ship)

| ID | Severity | Finding | Path |
|---|---|---|---|
| CF-R1 | Live-deploy blocker | Vite `build.sourcemap: true` publishes `dist/assets/index-vBdllirQ.js.map` (~3.3 MiB) at `200` with **immutable** cache. A public workers.dev would leak client source. | `vite.config.ts`, `dist/assets/*.map` |
| CF-R2 | Low | SPA `not_found_handling` returns `200` HTML for missing `/assets/nope-does-not-exist.js`. Documented. A stale hash after a new build would fail as “HTML as script” until cache/reload. | Workers SPA routing |
| CF-R3 | Docs drift | `docs/qa/server-url.txt` and `docs/qa/p0-browser-findings.md` still cite `index-CMSfCCzy.js`. Live/current is `index-vBdllirQ.js`. | those two files |
| CF-R4 | Ops | Operator OAuth has `workers` write. `npm run cf:deploy` is a one-liner. Process gate is the only lock. | `package.json` |
| CF-R5 | Intentional | COOP/COEP remain off. Do not enable without a wrangler-dev WebGL + blob-worker smoke. | `src/worker.ts` |
| CF-R6 | Out of scope | `?debug=1` scene jump exists in the client. Not a hosting defect. | `src/content/debug.ts` |
| CF-R7 | Local only | `.wrangler/state/v3/observability/*.sqlite` exists on disk from miniflare. Gitignored. Not workshop PII by design; do not commit. | `.wrangler/` |
| CF-R8 | Tooling | `package.json` `engines.node` is `>=20`; installed Wrangler 4.123 declares `>=22`. This machine is Node 24. Tighten engines before onboarding school lab PCs. | `package.json` |

**Not residuals of this hosting pass:** unsigned Science/Safety sign-off, greybox Fun Gate failures. Those are product, not Cloudflare.

---

## What was **not** changed

- `wrangler.jsonc` — already matches fetched docs. No invented flags added.
- `src/worker.ts` — no game state to remove.
- No live deployment.
- No KV / D1 / R2 / secrets / analytics added.

---

## Files touched this pass

| File | Action |
|---|---|
| `docs/qa/p0-verify-cloudflare.md` | **Written** (this report) |
| `docs/ops/dry-run.txt` | **Refreshed** to current 4.123.0 dry-run + `index-vBdllirQ.js` |

---

## Commands run

```text
# docs fetched via web_fetch (URLs in § Official docs)
Get-ChildItem C:\Users\daive\life-circuit-chengwan -Force
npx wrangler --version          → 4.123.0
npx wrangler whoami             → OAuth present (redacted)
node -v                         → v24.14.1
node -p "require('./node_modules/wrangler/package.json').version"  → 4.123.0
npx wrangler deploy --dry-run   → exit 0, ASSETS only, exiting now
Invoke-WebRequest http://127.0.0.1:8787/           → 200 HTML no-cache
Invoke-WebRequest http://127.0.0.1:8787/index.html → 200 no-cache
Invoke-WebRequest http://127.0.0.1:8787/hub        → 200 HTML SPA, same ETag
Invoke-WebRequest http://127.0.0.1:8787/c1         → 200 HTML SPA
Invoke-WebRequest http://127.0.0.1:8787/health     → 200 JSON no-store gameState:false
Invoke-WebRequest http://127.0.0.1:8787/health/extra → 200 JSON no-store
Invoke-WebRequest http://127.0.0.1:8787/assets/index-vBdllirQ.js  → immutable
Invoke-WebRequest http://127.0.0.1:8787/assets/index-DxyTvIel.css → immutable
Invoke-WebRequest http://127.0.0.1:8787/favicon.svg
Invoke-WebRequest http://127.0.0.1:8787/_headers   → HTML SPA, not raw file
Invoke-WebRequest http://127.0.0.1:8787/assets/index-vBdllirQ.js.map → 200 immutable (residual)
# NOT RUN: wrangler deploy, npm run cf:deploy, wrangler deploy --temporary
```

---

## Remaining gaps (paths)

| Gap | Path |
|---|---|
| Live workers.dev not published (correct) | Blocker: task `LIVE_DEPLOY_REQUESTED=false` |
| Source map would ship if someone deploys this `dist/` | `vite.config.ts` `sourcemap: true`; close before live |
| Historical QA hashes | `docs/qa/server-url.txt`, `docs/qa/p0-browser-findings.md` |
| Game Fun / Learning Gate | `docs/qa/p0-browser-findings.md` — not a Cloudflare fail |
| Team Science / Safety sign-off still empty | Claim register / `docs/safety/p0-boundaries.md` |
| COOP/COEP unproven | `src/worker.ts` |

**Stop condition honored:** dry-run complete; live deploy not requested; no publish.
