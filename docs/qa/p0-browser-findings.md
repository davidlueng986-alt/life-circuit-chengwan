# P0 live playtest — browser findings

| Field | Value |
|---|---|
| Date | 2026-08-15 |
| Build | wrangler static SPA @ http://127.0.0.1:8787 (`docs/qa/server-url.txt`) |
| Bundle | `dist/assets/index-CMSfCCzy.js` + `index-DxyTvIel.css` |
| Locale | zh-Hant |
| Script | `Life_Circuit_Chengwan_Full_Game_Script_v1` P0 only |
| Method | browser-use MCP (`new_tab` first, `?debug=1` scene jumps + DOM clicks) plus a **temp** headed Playwright pass against system Chrome for WASD and console |
| Not a ship skin | `?debug=1` 除錯 panel is visible in all shots below |

## Method limits (what this pass could not click)

browser-use **did** open the live origin. It does **not** expose `send_keys` / `evaluate` / console CDP. `retry_with_browser_use_agent` failed with OpenAI `403 unsupported_country_region_territory`. Chrome remote debugging on `127.0.0.1:9222` and `:9223` refused connections. `npx browser-use --doctor` was started; it hung in npm deprecation/install and was killed at ~90s — no doctor report was produced.

Therefore:

| Verb | Status |
|---|---|
| Title / Settings / 開始 / 繼續 / debug jumps / C1-S07 map buttons | Clicked in browser-use |
| WASD walk | Confirmed only in Playwright (P-S00). **Not** available inside browser-use |
| Hold Q pulse, hold F tether, E world interact, mouse-look / pointer lock | Not completed as a human would. Playwright sent W/Q/F/E but could not finish snap/seat puzzles |
| P-S04 combination, P-S05 evac, W-S00 scale handle, C1-S01 hunt, C1-S05 Chen walk desk | Seen at spawn only |
| P-S06 title card after the four lines | Not waited out (jumped away during D002) |

Console: Playwright recorded **zero** `pageerror` and **zero** `console.error` on title + P-S00 boot. browser-use cannot dump the console.

---

## Verdict

The P0 greybox **boots** as a third-person 3D adventure with semantic DOM HUD. Card/quiz Critical Path was **not** observed. Several scenes fail the script’s 30-second visible-goal bar because the camera faces empty floor or a near-black room. Workshop spawn offers **離開工作坊** before the cell verb.

---

## S0 — ship blocker

None observed for boot.

| ID | Finding | Evidence | Could not prove |
|---|---|---|---|
| — | `/` 200, `#title-screen`, `#world` WebGL, `/health` `{"ok":true,"gameState":false}` | curl + live title | — |

A **browser-use tab** became unresponsive after the first `P-S02` jump (CDP screenshot timed out at 60s). Reloading `/?debug=1` recovered. Treat as tool/session flake unless it reproduces in a human Chrome.

---

## S1 — Critical Path / 30s goal / first verb

### S1-01 P-S02 is a black room; the lens is not a visible object

**Scene:** `P-S02` 借來的透鏡  
**Task (correct):** 「拾起桌上的透鏡」  
**Play:** Continue / debug jump lands the avatar in near-total black. Sky stars only. Desk, circular button, and wall pipes are not readable.  
**Why it fails:** Script P-S02 is “桌上的透鏡 / 按住，對著牆，放開”. The 90s spatial verb cannot start if the table is invisible. A point light exists in `src/scenes/prologue/pS02.ts` (`0xc9a36a`, intensity 1.15, distance 10) but spawn/camera does not show it.  
**Expected:** Player sees a handheld with one round button without reading a lecture.

### S1-02 HUB spawn faces empty floor; 河港 / 工作坊 doors are off-camera

**Scene:** `HUB-S00`  
**Task (correct):** 「走到中央桌」  
**Play:** After debug-prime (tools owned), player stands on a brown slab against a black void. Battery ring is on. No table, no terracotta harbor door, no teal workshop door.  
**Code:** `src/scenes/hub.ts` places the table at origin and doors at `x = ±1.55`, player at `(0, 0, 4.5)` with `yaw = Math.PI`. If yaw π looks **away** from −Z, the first frame is the back wall.  
**Why it fails:** After P-S06 the player must see two equal-dignity physical entries. They are not in the first look.

### S1-03 W-S00 first prompt is 離開工作坊, not the cell

**Scene:** `W-S00` 放大一萬倍  
**Task (correct):** 「走進細胞模型」  
**Play:** Spawn stands on a cyan torus. Yellow scale handle hangs ahead. Interact prompt + interact-list: **E 離開工作坊**.  
**Code:** `spawnWorkshopPlayer(ctx, 0, 6.2, π)` vs `placeSafePad` at `radius - 1.6`. For `mountRoundRoom(ctx, 8.8)` the pad is at `z = 7.2`, radius `1.35` → distance `1.0` → **inside leave**.  
**Why it fails:** Workshop is skippable, but if the player *enters*, the first verb must be pull/enter the model, not leave. Accidental E returns to Hub.

### S1-04 C1-S00 loadout is not visible from spawn

**Scene:** `C1-S00` 河港還在睡  
**Task (correct):** 「選一件裝備」  
**Play:** Dark wall + a blank grey rectangle (alarm map). Battery, crash shell, and sealed probe are not in frame. No interact prompt.  
**Why it fails:** Script C1-S00 is take-the-probe + pick battery **or** shell as a loadout claim. A new player cannot name the goal from the picture.

### S1-05 C1-S03 camera is too far to play the docks

**Scene:** `C1-S03` 先證明它看得見  
**Task (correct):** 「先證明月亮暗、太陽亮」  
**Play:** Avatar is a speck on a distant platform with four cubes. Workbench DOM is readable (see S2/passes). Tether prompt 「F 抓取 F」.  
**Why it fails:** The education gate is **physical** external-port repair + moon/sun docks. If the player cannot see what to grab, the scene becomes a 2D panel.

---

## S2 — Major UX, claim, or readability

### S2-01 `loadScene` does not clear in-flight dialogue

`Hud.clearDialogue()` runs only from `hide()` (title). `Game.loadScene` does not call it. `queueLines` replaces the queue only if the **new** scene queues lines.

**Play:** Jump `C2-STUB` → `C1-S05`. DOM still had `C1-S08-D003` 何主任 「更正：它已經停了…」 with `hidden` **off**. Jump `C1-S03` → `C1-S07` left `C1-S03-D001` in the dialogue node.  
**Risk:** Radio from the factory stub talks over 陳姨’s market.

### S2-02 Short CJK lines expire in ~2.5s

`lineDurationMs` = `clamp(len * 220, 2500, 12000)`. `P-S01-D001` 「電梯沒電。右邊那條梯還通。」 is gone before a screenshot. Playwright caught `P-S00-D001` only because that line is long.  
**Risk:** First radio after fade-in is easy to miss.

### S2-03 P-S00 destination is a grey “sign”, not a flood gate

After 開始, task 「到防洪控制室」 is correct. Yellow maintenance strip is visible. The high `addGate3` 16×10 box + five blades reads as a floating document. Orange SOS shaft/bulb **does** appear after walking (Playwright `02-ps00-walk.png`).  
**30s test:** “I must reach the orange lamp / high gate” is only half-true at spawn.

### S2-04 P-S01 / indoor scenes underexposed

`P-S01` 「推開工具箱」: crate and lift silhouettes only. Toolbox is a dim yellow block. Climb path is not obvious. Not as black as P-S02, still below “see the verb”.

### S2-05 P-S03 spoken “藍色座” vs triangle sockets

World: two plates, **triangle** insets (shape, good).  
Line `P-S03-D001` 方雅: 「扣進兩個藍色座。」 (script-accurate, color-first). Hard rule F / script player flow: sockets marked by **shape**.  
HUD task is better: 「抓取牆上的連接工具」.

### S2-06 English / leftover tokens in player HUD

| Surface | Text | Note |
|---|---|---|
| C1-S03 workbench | `第一次失效` **saturated** | English run kind |
| C1-S03 clock | `本次運行 0s` | Latin unit |
| C1-S07 layer | **controls** 已修復 | English term before/without living phrase |
| C1-S08 recap | 「你修復 **controls**…」「**reporter** 增加形狀」 | Recap should be player-caused facts, not glossary |

No `100%準確` / `完全安全` / `零風險` / `證實污染` / developer disclaimer was seen in the live HUD.

### S2-07 Fake map layers refuse correctly, but the refuse is easy to miss

Clicked **全河安全** on `C1-S07` 河港公開地圖.  
DOM: `#interact-prompt` → 「目前沒有資料圖層」; `#hud-live` same. **No** green overlay.  
The prompt sits in the lower center on a dark plate and did not pop as a world change. L2 *logic* passes; presentation is weak.

### S2-08 C1-S03 tether prompt doubles the bind

Visible: `F` kbd + 「抓取」 + another `F`. Looks like bind leaked into the verb string.

### S2-09 P-S06 title card not seen in this pass

`pS06.ts` shows `#title-card` only after `hud.queueIdle`. We jumped during `P-S06-D002`. **Unverified**, not a confirmed miss.

---

## S3 — Polish / a11y / QA-only

| ID | Finding |
|---|---|
| S3-01 | `#hud-live` can stay on the previous scene’s task (P-S06 still announced 「抓取牆上的連接工具」) |
| S3-02 | `?debug=1` panel covers left third; `#world` intercepts Playwright clicks on those buttons unless `force: true` |
| S3-03 | Harbor/hub/C1 lighting is a brown void; greybox is legal, but fog + yaw π repeats the “empty first frame” |
| S3-04 | C1-S05 spawn shows 陳姨 capsule + stall/desk blocks; workbench stays closed until the player walks to the desk (by design) — walk not completed |
| S3-05 | Battery ring is a shape (pass) but first appears on Hub/C1 even when the scene is not about the lens |
| S3-06 | Interact-list can show 離開工作坊 in HTML immediately after a jump off W-S00 (one frame / leftover candidates). Visual P-S03 shot did not show it. Recheck after S1-03 |

---

## Passes (observed)

### Boot / stack

- Title kicker 「澄灣研究站」. Game name `#title-name` **hidden** until prologue complete (script: title waits for P-S06).
- 開始 enabled; 繼續 disabled on cold profile, enabled after a save.
- Settings: 寬鬆時間 / 減少動態 / 點按代替長按 / 震動 / 高對比 / 列出可互動物件 / 字幕 / 介面文字 / 視野. No “easier science”.
- `#world` WebGL (`gl: ok`). `#webgl-fail` never opened.
- HUD is semantic DOM (`#task-line`, `#dialogue`, `#workbench`), not canvas text.
- `/health` 200 `no-store` `gameState:false`. `/` and `/hub` 200 same ETag, `Cache-Control: no-cache`, CSP `script-src 'self' 'wasm-unsafe-eval'`, no COOP/COEP.
- No accounts, chat, analytics beacons, or PII fields in the title/settings tree.

### Game-first / no quiz

- No card slots, A/B/C/D, red-X, score, or 知識值 anywhere clicked.
- `src` only mentions `preComplete` as a **rejected** save shape.
- Tasks are verb+object: 到防洪控制室 / 推開工具箱 / 拾起桌上的透鏡 / 抓取牆上的連接工具 / 走進細胞模型 / 選一件裝備 / 先證明月亮暗、太陽亮 / 打開發布圖層 / 讓陳姨再走一次 / 尚未開放.

### Prologue (partial play)

- Playwright `01-ps00.png`: third-person runner, yellow line, `P-S00-D001` 小岑 radio 「聽得到嗎？三號閘卡死了，我在下層平台。水已經過第一條線。」
- Playwright then **moved** the avatar (`02-ps00-walk.png`); orange SOS bead became visible. WASD works when keys actually reach the page.
- `P-S03`: triangle sockets + 方雅 line match script ID `P-S03-D001`.
- `P-S06`: crates, 小岑 figure, window, `P-S06-D001` then `P-S06-D002` 林博士 「城裡還有很多看不見的流路…」 — terms after the storm, not as a glossary dump.

### Workshop

- Optional: Hub harbor was **not** locked. C1 opened with workshop incomplete (living labels 月亮/太陽/問號, not negative/positive control).
- W-S00 shows a hanging scale handle + wireframe cell — the right *objects*, wrong first prompt (S1-03).

### Chapter 1

- C1-S03 workbench 「封閉測試槽」: moon 低, sun 低, 問號 —, **第一次失效** retained, footer **教學模擬**. Unknown is not a strong claim.
- C1-S03-D001 林博士: 「先別碰問號。月亮應該暗，太陽應該亮…」
- C1-S07 layers include first fail + wait-for-lab. **全河安全** / **已完成清理** do not publish.
- C1-S07-D001 阿哲: 「我會報道工具幫忙縮小搜索區，也會把第一次失效和確認尚未完成放在同一頁。」
- Click **固定站** advanced to `C1-S08` with three-fact recap (no grade, no stars). World gained a station-like block. Two models exist as buttons.
- C2-STUB task 「尚未開放」. With C1 complete, 何主任 radio `C1-S08-D003` — honest stub, not a fake chapter.
- Reporter chrome is a **triangle** under the battery ring, not colour-only.

---

## Scene checklist

| Scene | Opened | Walked | Verb used | Result |
|---|---|---|---|---|
| BOOT-S00 title | Yes | n/a | 開始 / 設定 / 繼續 | Pass |
| P-S00 | Yes | Yes (Playwright) | W | Goal HUD pass; gate art weak (S2-03) |
| P-S01 | Yes | No | — | Dark (S2-04) |
| P-S02 | Yes | No | — | Black (S1-01); one tab hang |
| P-S03 | Yes | No | — | Plates/sockets visible |
| P-S04 | Debug listed | No | — | Not framed |
| P-S05 | Debug listed | No | — | Not framed |
| P-S06 | Yes | n/a sit-down | — | Lines match; title card unverified |
| HUB-S00 | Yes | No | — | Empty first look (S1-02) |
| W-S00 | Yes | No | Prompt only | Leave pad overlap (S1-03) |
| W-S01–S05 | Debug listed | No | — | Not framed |
| C1-S00 | Yes | No | — | Loadout off-camera (S1-04) |
| C1-S01 / S02 / S04 / S06 | Debug listed | No | — | Not framed |
| C1-S03 | Yes | No | Workbench read | Camera too far (S1-05); docks panel pass |
| C1-S05 | Yes | No | — | Chen + stall visible; walk not played |
| C1-S07 | Yes | n/a | Fake layer + 固定站 | L2 + two models pass |
| C1-S08 | Yes (via 固定站) | n/a | Recap | Three facts, no grade |
| C2-STUB | Yes | n/a | — | Honest stub |

---

## Commands run

```
Invoke-WebRequest http://127.0.0.1:8787/health
Invoke-WebRequest http://127.0.0.1:8787/
Invoke-WebRequest http://127.0.0.1:8787/hub
npx --yes browser-use --doctor          # timed out / killed
node play.mjs                           # temp Playwright, not in this repo
```

Playwright lived only under `%TEMP%\lcc-qa-play\` (not added to the game package). Screenshots: `%TEMP%\lcc-qa-play\out\01-ps00.png`, `02-ps00-walk.png`.

Home `C:\Users\daive\package.json` already existed; an accidental `npm install` from workspace root ran there, not in `life-circuit-chengwan`. Repo `three` still present.

---

## Remaining gaps

| Gap | Path / next play |
|---|---|
| Human WASD + Q pulse on live pipes | `P-S02` after lighting fix |
| Tether weight/rotate/snap | `P-S03`, `P-S04` |
| Evac + relaxed timer | `P-S05` |
| Title card + Hub doors without debug | `P-S06` → `HUB-S00` |
| Scale handle / cell ⊃ DNA ⊃ gene | `W-S00` after pad move |
| Loadout pick battery vs shell | `C1-S00` |
| Direction hunt + triangle fill | `C1-S01` |
| Saturated self-test + keep first fail in-world | `C1-S02` |
| Unknown dock stays shut until sun works | `C1-S03` with camera in the van |
| Chen walk changes output **and** notice | `C1-S05` desk (`src/scenes/chapter1/s05.ts`) |
| Rover / latch | `C1-S06` |
| Console on P-S02+ | headed Chrome DevTools, not browser-use |

---

## Files changed

- `docs/qa/p0-browser-findings.md` (this file)

No game source was edited in this QA pass.
