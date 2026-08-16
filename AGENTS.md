# AGENTS.md — 生命迴路：澄灣

Production rules for every agent that edits this repository.

## Authority order

1. Named team Science / Safety / Privacy / Child-safeguarding sign-off if present.
2. New full script `Life_Circuit_Chengwan_Full_Game_Script_v1` (game-first, 2026-08-15).
3. Legacy `20_SOURCE_AND_CLAIM_REGISTER` **safety / claim wording only**.
4. Legacy GDD / TDD stack notes **only if they do not conflict** with (2).

Do not restore the card/quiz Critical Path, Next.js lecture shell, `preComplete` / `preSkipped`, or HUD developer disclaimers.

P0 contract: `docs/delivery/p0-contract.md`  
Machine manifest: `docs/delivery/p0-manifest.json`

## P0 scope

Implement only:

- Title + Hub (`BOOT-S00`, `HUB-S00`)
- Prologue 黑水線 `P-S00`–`P-S06`
- Optional Workshop 微觀工作坊 `W-S00`–`W-S05` (skippable, **never** a qualification gate)
- Chapter 1 紅色警報 `C1-S00`–`C1-S08`

Do **not** implement chapters 2–final as playable levels. Visible later doors are honest stubs (`C2-STUB`).

## Hard rules

A. Game-first: 30s visible goal, 90s spatial verb. No card/quiz Critical Path. No red-X fail screens.

B. Tools: Flow Lens (pulse, direction, occlusion, battery), Tether (weight/rotate/snap), Sealed Bio-Rig (sense/regulate/output). No sequences, culture conditions, or wet-lab how-to.

C. Terms appear **after** the player operates the phenomenon. No developer-voice disclaimers in player UI.

D. Evidence is seen/measured/carried. Claim is a placement/action. Consequence changes the world. Revision keeps the first failure.

E. All readouts are `teaching_simulation`. Screening ≠ confirmation ≠ cleanup. No environmental release. No zero-risk claims.

F. Reporter output always has shape/sound/animation, not color alone. Failed control blocks strong unknown claims.

G. Residents are stakeholders. Chen's walk must change output **and** notification. Two valid monitoring models.

H. Use tools. Never invent repo state from memory.

I. Idempotent edits. Preserve existing architecture. After work: files changed, commands run, remaining gaps with paths.

J. Privacy: no names/schools/health/photos. No chat. No remote telemetry.

K. Accessibility: relaxed timer, reduced motion, keyboard + mouse, large subtitles, color+shape.

L. Do not copy assets, UI, VO, or level layouts from PEAK, R.E.P.O., Outer Wilds, Pacific Drive, Portal, or any cited game. Borrow structure only.

## Stack

- TypeScript strict, Vite, Three.js, semantic DOM HUD (not canvas text)
- No backend, no accounts, no analytics, `localStorage` save only (`life-circuit-chengwan.save.v1`)
- Cloudflare Workers static assets SPA: `wrangler.jsonc`, `compatibility_date` `2026-08-15`
- `assets.directory = ./dist`, `not_found_handling = single-page-application`, `assets.binding = ASSETS`
- Worker `src/worker.ts`: security headers + `env.ASSETS.fetch`; `/health` JSON; no game state
- Local deploy-parity: `npm run cf:dev` → http://127.0.0.1:8787
- npm lock only (no yarn/pnpm lockfiles)
- `vite.config.ts` must keep `base: './'`

## Cloudflare

- Config file is `wrangler.jsonc`, name `life-circuit-chengwan`, `workers_dev` true
- Do not invent wrangler flags. Fetch current Workers static-assets docs if changing hosting.
- Cache hashed `/assets/*`; `no-cache` on `index.html` via `public/_headers`
- `run_worker_first` stays `["/health","/health/*"]` unless header tests require global Worker-first
- No KV / D1 / R2 / secrets / accounts for P0
- No Web Analytics or workshop PII beacons
- COOP/COEP stay off unless a WebGL smoke proves they do not break Three.js
- Live `wrangler deploy` only if `LIVE_DEPLOY_REQUESTED` is true **and** `wrangler whoami` succeeds

## Player-facing copy

Banned fragments include: `100%準確`, `完全安全`, `零風險`, `證實污染`, `可現場部署`, `批准部署`, `MerR` / `Pmer` / `dTomato` as passwords, aptamer public route, and developer lines such as 「完成練習不代表……」「本章涉及……」「這不是……指引」.

Workshop skip shows **no warning** and does not mark the player unqualified.

## Locale

Player UI: `zh-Hant` only for the P0 Critical Path.
