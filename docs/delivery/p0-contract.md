# P0 Delivery Contract — 生命迴路：澄灣

| Field | Value |
|---|---|
| Document | `docs/delivery/p0-contract.md` |
| Companion | `docs/delivery/p0-manifest.json` |
| Version | `2026-08-15-p0` |
| Role | Technical Producer contract for greybox + playable P0 |
| Locale | `zh-Hant` (player-facing). English is not a P0 Critical Path requirement unless later signed. |
| Script authority | `Life_Circuit_Chengwan_Full_Game_Script_v1` (2026-08-15 Game-first Rewrite) |
| Local test URL | `http://127.0.0.1:8787` |
| Live deploy | **Not requested.** Stop after local `wrangler dev` / dry-run. |

This contract defines what P0 *is* and *is not*. It does not implement the game.

---

## 0. Authority order

When documents conflict, follow this order:

1. Named team Science / Safety / Privacy / Child-safeguarding sign-off (none present as of 2026-08-15).
2. New full script `Life_Circuit_Chengwan_Full_Game_Script_v1` (game-first; 3D verbs; no card/quiz Critical Path).
3. Legacy `20_SOURCE_AND_CLAIM_REGISTER.md` **safety / claim wording only** (maturity tags, banned phrases, player is not an authority).
4. Legacy GDD / TDD / asset notes **only if they do not conflict** with (2). Stack notes that assume Next.js, PRE card lessons, MerR/Pmer/dTomato as a password, or developer-voice disclaimers in HUD are **retired for P0**.

The new script has **no Cloudflare deploy appendix**. Hosting rules in §9 come from this contract plus current Workers docs (fetched 2026-08-15):

- https://developers.cloudflare.com/workers/static-assets/
- https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/
- https://developers.cloudflare.com/workers/wrangler/configuration/
- https://developers.cloudflare.com/workers/static-assets/headers/

Do not invent wrangler flags. Do not restore the legacy card quiz Critical Path.

---

## 1. In scope (P0 must ship)

Playable third-person 3D adventure slice. Semantic DOM HUD. TypeScript strict + Vite + Three.js. No backend, no accounts, no analytics. `localStorage` save only.

| Slice | Scene IDs | Player promise |
|---|---|---|
| Boot / Title | `BOOT-S00` | Cold start: New / Continue / Settings. No lore wall. First play enters `P-S00` immediately. |
| Hub | `HUB-S00` | Controllable research-station floor after prologue. Two physical doors: 河港 (`C1-S00`) and 微觀工作坊 (`W-S00`). Visible later-chapter doors are honest stubs. |
| Prologue 黑水線 | `P-S00` … `P-S06` | See destination, move, scan, tether, rescue 小岑, title card, return to Hub. |
| Optional Workshop 微觀工作坊 | `W-S00` … `W-S05` | Skippable 3D cell model. **Never a qualification gate.** Leave mid-scene; resume that scene. |
| Chapter 1 紅色警報 | `C1-S00` … `C1-S08` | Signal hunt, failed tool, controls, Chen walk, rain finale, public map, monitoring choice. |

Also in scope:

- Three tools as specified in the script (Flow Lens, Tether, Sealed Bio-Rig / sealed probe).
- Accessibility: relaxed timer, reduced motion, keyboard + mouse, large subtitles, color **and** shape/sound.
- World-rule science: sealed equipment, failed positive control blocks unknown, screening ≠ confirmation ≠ cleanup, two valid monitoring models, Chen’s walk changes output + notification.
- Cloudflare Workers static-assets SPA config (`wrangler.jsonc`) and optional header/`/health` worker. Local proof is `npx wrangler dev --port 8787` after `vite build`.
- Honest Chapter 2 stub only if a door is visible (`C2-STUB` / Hub 停線 hatch).

Target durations from script (greybox may be shorter; do not pad with reading):

| Block | Script time |
|---|---|
| Prologue | 8–10 min |
| Workshop (optional) | 12–15 min |
| Chapter 1 | 35–50 min (scene table sums ~44 min) |
| Title + Hub navigation | ~1–3 min |
| P0 with workshop | ~55–75 min |
| P0 without workshop | ~45–60 min |

---

## 2. Out of scope (P0 must not build)

Do **not** implement chapters 2–final as playable levels. If a door is visible, it is a stub: world signage, one line of dialogue, no fake loading into a playable factory.

Explicit exclusions:

- `C2` 停線, `C3` 壞掉的開關, `C4` 數據迷霧, `C5` 封閉區, `C6` 斷鏈, `C7` 門內的人, Final 共同設計.
- Card / quiz / A-B-C-D Critical Path. Evidence / Claim / Consequence **cards**. Red-X fail screens. Knowledge scores, good/evil meters, persuasion meters.
- Sequences, culture conditions, concentrations, wet-lab how-to, construct recipes.
- Requiring the player to memorize `MerR` / `Pmer` / `dTomato` (or any project-specific part name) as a password. Named cases are optional Codex / application background only.
- Aptamer / riboswitch public route (`APT-004` is `NOT_APPROVED` in the claim register).
- Player sampling, diagnosing, enforcing, cleaning, or approving deployment.
- Environmental release of any living system. Zero-risk claims. “100% 準確” UI after repair.
- Developer-voice HUD: 「完成練習不代表……」「本章涉及……」「這不是……指引」「這是教學故事」.
- Chat, accounts, remote telemetry, Web Analytics, workshop PII (names, schools, health, photos, voice, location).
- KV / D1 / R2 / Queues / secrets / custom domains for P0.
- Live `wrangler deploy` to a public `workers.dev` or custom host unless `LIVE_DEPLOY_REQUESTED === true` **and** `wrangler whoami` succeeds.
- Copying assets, UI, VO, or level layouts from PEAK, R.E.P.O., Outer Wilds, Pacific Drive, Portal, or any cited game. Structure only.
- Restoring legacy Next.js / PRE lecture stack as the runtime.

---

## 3. Scene table

Times are script targets, not padded reading time. “30s goal” is the first visible verb the player can speak in their own words.

### 3.1 Boot + Hub

| ID | Name | Time | First verb / 30s goal | Unlock | Persist |
|---|---|---|---|---|---|
| `BOOT-S00` | 標題／冷啟動 | ≤30s to control | 開始 / 繼續 / 設定. First play: black rain → `P-S00`. No world bible. | Always | `meta.hasSave`, settings |
| `HUB-S00` | 研究站大廳 | 1–2 min | Walk the floor. Two physical entries on the central table. | After `P-S06` | `hub.unlocked`, door flags |

Hub rules:

- After `P-S06`, title card **生命迴路：澄灣**, then controllable Hub.
- Central table: **去河港** (starts `C1-S00`) and **試一次微觀工作坊** (starts or resumes workshop).
- Skipping workshop shows **no warning** and does **not** mark the player unqualified.
- Workshop remains returnable from Hub before any later chapter (and after C1).
- `C1` complete: Hub far-view updates to the chosen `monitoringModel`. First failed run stays on the station wall.
- Visible `C2` hatch: honest stub. 何主任 radio line from `C1-S08` may play; door does not load a factory.

### 3.2 Prologue 黑水線

Chapter promise: like 小岑, learn move + two tools, finish a stressful but readable rescue. **No biology terms during the crisis.**

| ID | Name | Time | First learn / 30s goal | Tools | Fail / recover | Unlock |
|---|---|---|---|---|---|---|
| `P-S00` | 暴雨入站 | 1 min | Move. See high flood gate + 小岑 orange SOS. HUD: **到防洪控制室**. | Move | Fall → safety line, 1.2s, no death screen. Indoor door allowed; 方雅 redirects. | Cold start |
| `P-S01` | 電梯死機 | 1 min | Interact, push light crate, climb low ladder. No timer. | Interact | — | Reach dead lift |
| `P-S02` | 借來的透鏡 | 2 min | Flow Lens pulse. Follow **moving** glow, not brightest dead line. | Flow Lens | Bright-but-dead line fades in 1s. First pulse free; then battery ring, no definition text. | Pick up lens |
| `P-S03` | 斷掉的橋 | 2 min | Tether: pull, rotate, snap plates into **shape** sockets. | Tether | Plate drop → cable return. Fall → rope to bridge start. Assist: auto-align near correct pose. | Door unlocked, bridge out |
| `P-S04` | 閘門下方 | 2 min | Combine scan + tether. Three relays: wrong path / jammed / loose. | Lens + Tether | World audio stacks per fix. Last snap raises the gate. No “正確”. | Cross bridge |
| `P-S05` | 回頭跑 | 1–2 min | Evac. Standard 70s; relaxed = no hard fail. Follow white pulse. | Lens + Tether (missing lever) | Water first → mist wipe, 方雅 lock, restart at corridor; completed tethers stay. | Gate moves, platform slips |
| `P-S06` | 天亮之前 | 1 min | Sit-down beat. Title. Choose Hub doors. | — | — | Rescue complete |

Prologue persist: `prologueComplete`, `tool.flowLens`, `tool.tether`, `relationships.xiaocen.rescued`, `workshop.available`.

### 3.3 Optional Workshop 微觀工作坊

Not an exam. Walkable 3D model. **Do first, name after.** Leave on any safe platform; resume that scene. Completing workshop does **not** gate C1; it only changes whether 林博士 uses formal terms or living short phrases (`C1-S00-D003` vs `C1-S00-D003A`).

| ID | Name | Time | Concept (named after action) | Player action | Gate |
|---|---|---|---|---|---|
| `W-S00` | 放大一萬倍 | 2 min | cell, DNA, gene | Scale into cell. Lens on boundary / track / short marked stretch. Tether the **magnifier**, not DNA. Exit: aim three frames in order → animated **cell ⊃ DNA ⊃ gene**. | Aim-order, not quiz |
| `W-S01` | 保留下來的軌道 | 2 min | DNA → RNA (transcription) | Start reader. RNA copy peels off. Tether RNA to next station. Grabbing DNA shows a lock icon. Wrong station: RNA glow keeps pointing the right way. | Spatial guide, no red X |
| `W-S02` | 會折起來的產物 | 2 min | RNA → protein (translation) | Watch chain fold. Protein fits a lock and turns it. RNA does not fit. | Shape, not label |
| `W-S03` | 閘門與報告燈 | 3 min | input, regulator, promoter, reporter, output | Run dark (no smoke). Open smoke. Trace sensor → regulator → promoter → reporter. Swap reporter lamp for a **shape flag**; logic unchanged. | Behavior then names |
| `W-S04` | 先測設備 | 3 min | negative / positive control, valid run | Moon / sun / ? docks. First run: sun dark (broken). `?` cannot open exit. Fix joint. Re-run: moon dark, sun bright, `?` may speak. **Failed positive control keeps unknown unreadable.** | Device validity |
| `W-S05` | 你剛才做的循環 | 1–2 min | synthetic biology / DBTL as recap, not password | Replay: ask → build → run → break → fix → retest. | Optional leave |

Workshop persist: `workshop.complete`, `workshop.resumeScene`, `codex.cell`, `codex.dnaGene`, `codex.transcription`, `codex.translation`, `codex.promoter`, `codex.reporter`, `codex.controls`.

### 3.4 Chapter 1 紅色警報

Chapter promise: within 30s the player knows **find the direction of the repeating alarm so the confirmation team has a safe route**. Enjoy signal hunting and rain evac **before** controls are named. End state the player can say: reporter is output; control proves a run is readable; a screening signal is not identity and not cleanup.

| ID | Name | Time | 30s / main verb | Evidence → claim → consequence | Persist |
|---|---|---|---|---|---|
| `C1-S00` | 河港還在睡 | 3 min | Take sealed probe. Pick **battery or crash shell** (no wrong loadout). Goal: east-shore first trace. No sample vials, no A/B/C/D. | Loadout is a claim about risk. | `c1.loadout` |
| `C1-S01` | 第一條紅線 | 6 min | Pulse + rotate body. Reporter fills a **triangle**, not red/green only. Tether float crates; cage the probe over a cable. Distant warehouse blink is city light, not the answer. | First trace carried back. Fish / smell / oil = observation, not pollution proof. | `c1.firstTraceRecovered` |
| `C1-S02` | 全部都紅 | 5 min | Tool saturates every facing. Player **must try** turn / leave / kill env relay. Then self-test blinks. Mission becomes **bring the whole probe home**. Tide evac: battery = short lift; shell = shorter carry. | Invalid run experienced and kept. | `c1.invalidRunExperienced` |
| `C1-S03` | 先證明它看得見 | 6 min | Moon / sun / ? docks on the mobile lab. Sun still max = device not restored. External ports only: reset regulator relay, replace wet reporter joint. Moon low + sun high **before** `?` opens. | Failed control blocks unknown. First fail stays in `evidence.runHistory`. UI never shows 100% accurate. | `c1.controlsRestored` |
| `C1-S04` | 第二次進入 | 7 min | Free geometry: up to two relay beacons + handheld probe. Overlap small enough → “worth confirming” zone. Wide/fast vs far/tight both valid. 陳姨 radio opens an unmapped rain gate. | Placement is the claim. Map shows different confirm time, not a score. | `c1.sourceZoneMarked` |
| `C1-S05` | 陳姨的路 | 5 min | Playable usability test, not a cutscene. Color-only fails in shade; cart blocks low display; “紅” with no next step causes guessing. Player must set **shape + short sound** and a **municipal update + timestamp** action. | Chen’s walk **must** change output **and** notification. Missing any of: visible output / action / update owner → visible confusion, fix on the spot. | `c1.accessibilityOutput=shape_audio`, `c1.notificationRule=municipal_update_with_timestamp` |
| `C1-S06` | 閘門背後 | 6 min | Open a remote door; send confirmation **rover**. Player never touches the unknown. Follow flowing pulse, not bright-still residue. Latch module keeps unlock steps across brownouts (function first, no formal name). | Rover in; player evacs. Formal ID waits on the lab. | latch tutorial used |
| `C1-S07` | 說到證據為止 | 4 min | 3D public map layers from **run history only**. Fake layers 「全河安全」「已完成清理」 show **目前沒有資料圖層** — no scold. Place one physical model: **fixed station** or **portable kits**. | Public claim ≤ evidence. Two valid monitoring models. | `c1.publicMapPublished`, `c1.monitoringModel`, `c1.unresolved += confirmation_result, long_term_monitoring` |
| `C1-S08` | 城市回聲 | 2 min | World montage of chosen model. Chen’s stop button + public board exist on **both**. Wall keeps the first fail as “the event that changed the design.” Recap is three player-caused facts, not a grade. Radio: 何主任 / 停線. | Harbor skyline persists on Hub. | `c1.complete`, Hub skyline, `C2-STUB` visible |

`C1-S00` dialogue fork: workshop complete → 林博士 uses sensor / regulator / promoter / reporter (`C1-S00-D003`). Else living short phrases (`C1-S00-D003A`).

---

## 4. Flags and save contract

Save location: **browser `localStorage` only**. Suggested key: `life-circuit-chengwan.save.v1`. Do **not** auto-migrate legacy card-game schema v2 (`preComplete` / `preSkipped`). Those names are retired.

Schema version in JSON: `1`.

### 4.1 Meta / settings

| Field | Type | Notes |
|---|---|---|
| `schemaVersion` | `1` | Bump only with a written migration. |
| `savedAt` | ISO string | Local clock; not uploaded. |
| `locale` | `"zh-Hant"` | P0 default and only required locale. |
| `settings.relaxedTimer` | bool | No story change. `P-S05` loses hard 70s fail. |
| `settings.reducedMotion` | bool | Less camera punch; keep spatial readability. |
| `settings.subtitleScale` | number | Large subtitles available. |
| `settings.fov` | number | |
| `settings.vibration` | bool | Off available. |
| `settings.holdAlternatives` | bool | Hold / mash / precise-aim alternatives. |

### 4.2 Tools

| Field | Type | P0 writes |
|---|---|---|
| `player.tool.flowLens` | bool | True after `P-S02`. |
| `player.tool.tether` | bool | True after `P-S03`. |
| `player.tool.sealedProbe` | bool | True after `C1-S00`. |
| `player.tool.scanRange` | number | May upgrade later; P0 default pulse. |
| `player.tool.tetherStrength` | number | P0 default. |
| `player.tool.modules` | string[] | P0 may add `latch` after `C1-S06`. Never sequences. |
| `player.tool.battery` | 0–1 | Lens charge. First prologue pulse free. |
| `c1.loadout` | `"battery" \| "crash_shell" \| null` | One pick; both routes completable. |

### 4.3 Progress flags

| Field | Type | When |
|---|---|---|
| `prologueComplete` | bool | `P-S06` |
| `hub.unlocked` | bool | After `P-S06` |
| `workshop.available` | bool | After `P-S06` |
| `workshop.complete` | bool | `W-S05`. Skip leaves this **false**. |
| `workshop.resumeScene` | `W-S00`…`W-S05` \| null | Last safe leave. |
| `c1.firstTraceRecovered` | bool | `C1-S01` |
| `c1.invalidRunExperienced` | bool | `C1-S02` |
| `c1.controlsRestored` | bool | `C1-S03` after moon+sun valid |
| `c1.sourceZoneMarked` | bool | `C1-S04` overlap accepted |
| `c1.accessibilityOutput` | `"color_only" \| "shape_audio"` | Chen walk forces `shape_audio` to pass |
| `c1.notificationRule` | `"none" \| "municipal_update_with_timestamp"` | Chen walk |
| `c1.monitoringModel` | `"fixed_station" \| "portable_kits" \| null` | `C1-S07` placement |
| `c1.publicMapPublished` | bool | `C1-S07` |
| `c1.complete` | bool | `C1-S08` |
| `c1.unresolved` | string[] | Must include `confirmation_result`, `long_term_monitoring` after C1 |

### 4.4 Codex (optional, never a gate)

Unlock **after** the matching action. One-line glossary, closable, in-world. Not a score.

`cell`, `dnaGene`, `transcription`, `translation`, `promoter`, `regulator`, `reporter`, `input`, `output`, `controls`, `validRun`.

### 4.5 Evidence / relationships / world

| Field | Rules |
|---|---|
| `evidence.runHistory[]` | Every probe run. **Failed first C1 run is retained.** Deleting it is not allowed. |
| `evidence.unresolved[]` | Unknowns tied to a next action, not a disclaimer. |
| `relationships.characterMemory` | Sparse facts: `xiaocen.rescued`, Chen accepted trial after usable alarm, etc. **No affinity number.** |
| `world.harbor.monitoringModel` | Mirrors `c1.monitoringModel`. Must change Hub + harbor far-view. |
| Later `world.*` models | Schema stubs only. Do not simulate C2–Final. |

QA-only behavioral bits (not player badges, not HUD):

`evidence.controlRunBeforeClaim`, `evidence.failedRunRetained`, `evidence.userFeedbackChangedPrototype`, `evidence.claimMatchesObservedRange`.

Privacy: save JSON must not contain player name, school, health, photo, voice, or geolocation.

---

## 5. Tools (implementation contract)

| Tool | Player verb | Must have | Must not |
|---|---|---|---|
| **Flow Lens** | Hold to charge, release pulse. Longer hold = more range, more battery, longer recover. | Direction, occlusion, battery, distortion (dead shine, background, broken device). | Answer highlighter. Permanent wallhack. Text definition on first pickup. |
| **Tether** | Physics ray: pull, push, rotate, insert, cut, snap, park. | Weight, inertia, collision, snap-by-**shape**, fragile probe. | 2D card drag as the Critical Path. |
| **Sealed Bio-Rig / sealed probe** | Sense / regulate / output slots as visible world parts. | Reporter always has **shape and/or sound and/or fill animation**, never color alone. External service ports only. | Sequences, media recipes, concentrations, open-shell wet steps, environmental release. |

P0 teaching order: **operate phenomenon → then name**. Formal words live in character lines after the action, or in optional Codex.

---

## 6. Science / claim / safety (legacy conflict notes)

Skim of legacy `README_START_HERE.md` + `20_SOURCE_AND_CLAIM_REGISTER.md`. **Use claim register for boundaries. Do not restore its pedagogy or UI lecture.**

| Topic | Legacy pack | New script / this P0 | Resolution |
|---|---|---|---|
| Critical Path | PRE lecture + cards; Ch1 still Evidence/Claim cards | 3D verbs only | **New script wins.** No card quizzes. |
| PRE / Workshop | 12–16 min “biology class”, skippable | 12–15 min walkable cell; skippable, not a gate | Keep skip. Change form to 3D. |
| Terms | Teach MerR / Pmer / dTomato in Ch1 | Transferable terms only | **Do not require named parts.** Optional Codex background only. |
| Aptamer route | `APT-004` not approved | Not in script P0 | **Omit.** |
| Player role | “設計／安全調查者” | 系統跑手. Never sample / diagnose / enforce / approve | World permissions: 郭工 confirms; player traces and carries. |
| Disclaimers | Fixed HUD strings e.g. `science.limit.notMeasurement` | No developer-voice in player UI | **Do not paste launch disclaimers.** Encode limits as world rules: sealed kit, no-data layers, 郭工/lab owns identity, failed sun dock blocks `?`. |
| Simulation | Permanent “教學模擬” watermark on charts | All readouts are `teaching_simulation` | P0 HUD uses relative states (low / mid / high, triangle fill). No real units, LOD, or Hg numbers. If any still image could be mistaken for lab data, mark **教學模擬** on that readout only — not as a chapter lecture. |
| Controls | Named cards | Failed positive control makes unknown unreadable until repaired | **Hard gate** in `W-S04` and `C1-S03`. |
| Screening | Claim register: screening ≠ confirmation ≠ cleanup | `C1-S07` refuses 「全河安全」「已完成清理」 | Implement as missing layers + 郭工 line. |
| Zero risk | `SAFE-001` bans 零風險 / 完全安全 | Same | Banned in player text and public map. |
| Maturity mix | Mechanism ≠ team proposal ≠ team data ≠ story ≠ sim | Same | P0 is **story prototype + teaching simulation**. Do not imply team construct works or river was “confirmed contaminated.” |
| Stack | Next.js, schema v2 `preComplete` | Vite + Three + DOM HUD, save v1 | **New stack.** New save key. |
| Science sign-off | Tables still unsigned | Still unsigned | P0 may greybox. Public iGEM claim of educational efficacy or field utility remains **blocked** until named sign-off. |

Banned player-facing fragments (lint later): `100%` / `完全安全` / `零風險` / `必定` / `證實污染` / `即時檢測` / `準確濃度` / `高度靈敏` / `可現場部署` / `批准部署` / `works` / `validated` / `proven` as performance claims.

Mainline transferable terms only: cell, DNA, gene, RNA, protein, promoter, regulator, reporter, input/output, control, replicate, containment, biosafety, biosecurity, stakeholder, pilot. P0 actually *operates* a subset (through C1). Later terms may appear in Codex stubs, not as Ch2–7 gameplay.

---

## 7. Fun Gate (chapter cannot ship on learning alone)

From script appendix F. **Every P0 chapter must pass Fun Gate.** Learning-only content stays on the shelf.

| # | Standard | P0 measurement | Fail signal |
|---|---|---|---|
| F1 | **30s visible goal** | Untutored player can say: 救人 / 開門 / 關閥 / 帶回 / 逃離 / 找出訊號方向 | “我為甚麼在這裡？” |
| F2 | **90s spatial verb** | A move with direction, weight, route, or space result | First interaction is a wall of text or a quiz |
| F3 | **Skill ceiling** | Better route, angle, load, or pulse timing helps | Every interact is a single click |
| F4 | **Readable failure** | Player can name what broke before a hint | Red X, Wrong, retry overlay |
| F5 | **No exhaustive click** | Outcomes from world state, not option elimination | Click-all always wins |
| F6 | **New knowledge = new ability** | After controls, the unknown dock / second entry is possible | Nouns only in Codex / recap |
| F7 | **NPC changes the design** | Chen walk changes reporter + notification | Talk then identical prototype |
| F8 | **Claim ≤ evidence** | Public map only shows obtained, valid runs | Slogan overwrites unknown |
| F9 | **≥2 defensible ethics paths** | Battery vs shell; wide vs tight zone; fixed vs portable | Saint vs villain |
| F10 | **Stop / delay can succeed** | Invalid run forces retreat; C1 ends with unresolved confirmation | Forced “approve / confirm pollution” to see ending |

Prologue-specific Fun Gate:

- Destination (gate + orange SOS) visible without reading.
- Safety rope, not Game Over.
- Bright ≠ direction taught by animation.

Workshop-specific Fun Gate:

- Optional. Skip is silent and dignified.
- Shape locks and flow, not card sort.

Chapter 1-specific Fun Gate:

- 30s: find where the alarm is pointing so 郭工’s team can walk safely.
- 90s: rotate with a live triangle + pulse, not a worksheet.
- Probe has weight and break states.
- Saturated reporter is a **physical** diagnosis, not a quiz.

Vertical-slice minimum (script G; 5 iGEM students who never saw the docs):

- ≥4/5 state the prologue goal in 30s.
- ≥4/5 finish first signal trace without click-all or designer coaching.
- ≥3/5, after saturation, volunteer “check the tool before trusting it” (need not say *control*).
- ≥4/5 separate screening signal from identity / cleanup.
- 0/5 describe the loop as 選卡 / 猜答案 / 一直按互動.
- ≥1 spontaneous talk about route, risk, evidence, or a character need per 10 minutes.

Open playtest questions (no options): 你剛才想完成甚麼？最有趣／最無聊的動作？哪次失敗改了做法？你現在相信甚麼、依據、還不知道甚麼？誰改了你的設計？拿掉科學名詞你還能解釋系統嗎？換成另一個生命科技情境你會先查甚麼？

---

## 8. Learning Gate (fun-only is not this game)

Education is a **通關能力**, not a post-level quiz. Order: visible problem → old skill fails → new method is a better verb → transfer → world remembers → Codex names.

| Term | Player does | If skipped, world fails | First name | P0 transfer |
|---|---|---|---|---|
| cell / DNA / gene / RNA / protein | Walk workshop flow; reconnect missing node | Mix storage, message, and work; cannot repair | Workshop | Not required for C1 legality |
| input / sensor | Aim sealed probe; track direction | Chase brightest output | Prologue + C1 | C1 hunt |
| promoter / regulator | Open / close signal gate | Output stuck on or off | Workshop; living phrases in C1 if skipped | C1-S03 repair |
| reporter / output | Light + **shape / sound / fill** | User cannot tell states | Prologue output / C1 / Chen | Chen walk |
| control / valid run | Restore refs; run dark + bright | A “reaction” is unreadable | `W-S04`, `C1-S03` | Second harbor entry |
| public communication | Known / unknown / who confirms / when updates | Over-promise or vague panic | `C1-S05`–`S07` | Public map |
| stakeholder / HP | Follow Chen’s actual walk; change the device | Pretty bench, unusable street | `C1-S05` | Output + notice |
| screening vs confirmation | Mark a zone; 郭工 / lab owns identity | Player “confirms pollution” | `C1-S07` | Missing layers |
| unresolved / pilot caution | Leave confirmation + long-term monitoring open | Chapter claims the river is solved | `C1-S08` | Wall of first fail |

P0 Learning Gate pass:

1. Unknown remains locked while positive control is failed (`W-S04`, `C1-S03`).
2. Player cannot publish 「全河安全」 or 「已完成清理」.
3. Chen’s pass requires shape+sound **and** a next-step notice with owner + time.
4. Both monitoring models complete the chapter and leave different harbor geometry.
5. First invalid run remains in history and on the station wall.
6. Workshop skip still allows a full C1; language is living, not a lock.
7. No mainline password of MerR / Pmer / dTomato.
8. Player never samples, diagnoses, enforces, or approves deployment.

iGEM appendix H items that **P0 can honestly tick**: 30s goals for these chapters; at least one 3D-only puzzle per chapter; no click-all Critical Path; transferable words; reporter not color-only; C1 keeps an unknown; NPC changes a playable parameter; choice changes later (harbor + Hub); failed run retained; public comms show known / unknown / owner / time; no wet-lab SOP. Items that require C2–Final (`replicate` operated twice, biosafety vs biosecurity distinction as play, pilot/no-pilot) stay **unchecked**.

---

## 9. Cloudflare / hosting contract

Script appendix I only says: next production file splits each scene into blockout, prefabs, state machine, dialogue rows, audio cues, animation, save fields, QA. **No wrangler flags in the script.** Use official Workers static-assets docs.

### 9.1 Required `wrangler.jsonc` (do not invent keys)

Documented keys only:

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "life-circuit-chengwan",
  "compatibility_date": "2026-08-15",
  "workers_dev": true,
  "main": "src/worker.ts",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "single-page-application",
    "binding": "ASSETS",
    "run_worker_first": ["/health", "/health/*"]
  }
}
```

| Key | Why | Source |
|---|---|---|
| `wrangler.jsonc` not toml | Current Wrangler recommendation; some new features are JSON-only | Wrangler configuration |
| `name`: `life-circuit-chengwan` | `[a-z0-9-]`, ≤63 for workers.dev | Task + name rules |
| `compatibility_date`: `2026-08-15` | Pinned runtime. Also enables navigation-prefers-asset-serving (≥ 2025-04-01) | Docs + task |
| `workers_dev`: `true` | Default workers.dev route for later deploy | Docs (`workers_dev` default true; we set it explicitly) |
| `assets.directory`: `./dist` | Vite outDir. **Not** `./public` as the served root | Static assets + SPA page |
| `assets.not_found_handling`: `single-page-application` | Unmatched routes → `200` + `/index.html` | SPA page (required pair with `directory`) |
| `assets.binding`: `ASSETS` | Optional; needed if worker fetches assets | Static assets binding |
| `assets.run_worker_first`: `["/health","/health/*"]` | Only documented way to force the worker on those paths. Do not set `true` globally unless header tests require it | SPA advanced routing; Wrangler ≥ 4.20.0 |
| `main`: `src/worker.ts` | Optional worker for `/health` + security headers on **worker** responses | Task. Assets-only Worker is legal (`main` optional) but we want `/health`. |

**Do not add for P0:** `kv_namespaces`, `d1_databases`, `r2_buckets`, `queues`, `secrets`, `analytics_engine_datasets`, `ai`, custom `routes` / zone, Pages-only keys, invented `cache` wrangler flags.

**Observability:** `observability.enabled` is optional (Workers Logs). **Do not** enable Cloudflare Web Analytics or any beacon that can collect workshop PII.

**`html_handling`:** omit; default `auto-trailing-slash` is documented and enough.

### 9.2 Cache (documented `_headers`, not invented wrangler)

Workers default for static assets: `Cache-Control: public, max-age=0, must-revalidate` + `ETag`.

Override with a `_headers` file in the **static asset directory** (author in `public/_headers` so Vite copies it to `dist/_headers`). Documented pattern for fingerprinted files:

```txt
/
  Cache-Control: no-cache

/index.html
  Cache-Control: no-cache

/assets/*
  Cache-Control: public, max-age=31556952, immutable
```

Vite’s hashed JS/CSS live under `/assets/*`. `index.html` must not be long-cached.

Caveat from docs: `_headers` apply to **asset** responses only. If `run_worker_first` serves HTML from the worker, set the same Cache-Control / CSP on that `Response`.

### 9.3 Security headers

Allowed on HTML / worker `/health` and via `_headers` for assets:

| Header | P0 value | Note |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | Documented |
| `Referrer-Policy` | `strict-origin-when-cross-origin` or `no-referrer` | Documented |
| `X-Frame-Options` | `DENY` | Optional clickjacking |
| `Content-Security-Policy` | Allow `'self'`, WebGL, `blob:`, `wasm-unsafe-eval` as needed | Must be playtested |
| `COOP` / `COEP` | **Off unless proven** | Cross-origin isolation can break Three.js / CDN / blob workers. Only enable after a WebGL + wasm smoke on `wrangler dev`. |

Suggested CSP starting point (tune after first WebGL smoke; do not ship untested):

`default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self' blob:; child-src 'self' blob:; img-src 'self' data: blob:; media-src 'self' blob:; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';`

`/health` returns a tiny JSON or text `ok` with **no** save state, **no** PII.

Worker **must not** read or write game progress.

### 9.4 Local vs live

| Action | Rule |
|---|---|
| Iterate | `vite` / `vite dev` is allowed for speed. |
| Deploy-parity test | **Must** `vite build` then `npx wrangler dev --port 8787`. Vite preview is extra, not a substitute. |
| Dry-run | `npx wrangler deploy --dry-run` is allowed and preferred. |
| Live deploy | **Blocked.** `LIVE_DEPLOY_REQUESTED` is false. Even if `wrangler whoami` works, do not publish. Record the blocker. |

---

## 10. Acceptance checklist (P0)

### Play

- [ ] Third-person move, camera, step-up, interact are testable (not a slideshow).
- [ ] `P-S00` destination is visible in 30s without a lore card.
- [ ] Flow Lens: direction, occlusion, battery, false shine.
- [ ] Tether: weight, rotate, collision, shape snap, drop recovery.
- [ ] `P-S05` evac works; relaxed timer still finishes the story.
- [ ] Workshop skip from Hub: no warning, `workshop.complete === false`, C1 still legal.
- [ ] Workshop leave/resume at scene granularity.
- [ ] `C1-S02` requires the three failed tests before the mission flips.
- [ ] `C1-S03` unknown dock stays closed until moon+sun are valid.
- [ ] `C1-S05` Chen walk changes shape/sound **and** notification rule.
- [ ] `C1-S07` both monitoring models complete; harbor + Hub differ.
- [ ] Failed first run remains in history and on the wall.
- [ ] C2 door (if visible) is an honest stub.
- [ ] Keyboard + mouse; large subtitles; reduced motion; color+shape reporters.
- [ ] No red-X fail; no card quiz; no developer disclaimer toast.

### Science / privacy

- [ ] No player sampling / diagnosis / enforcement / deploy approval.
- [ ] No environmental release. No zero-risk copy.
- [ ] No MerR/Pmer/dTomato password. No aptamer route.
- [ ] All numeric / meter readouts are teaching-simulation relative states.
- [ ] Save has no PII. No analytics beacon.

### Hosting

- [ ] `wrangler.jsonc` matches §9 (jsonc, name, date, `./dist`, SPA fallback).
- [ ] `http://127.0.0.1:8787` serves the Vite build via `wrangler dev`.
- [ ] Client routes deep-link to `index.html` (SPA 200).
- [ ] Hashed `/assets/*` long-cache; `index.html` no-cache.
- [ ] `/health` does not touch save.
- [ ] No live deploy in this request.

### Fun + Learning

- [ ] Prologue, Workshop (if played), Chapter 1 each pass §7 and §8.
- [ ] Vertical-slice questions can be run; results recorded outside the game (no in-game score).

---

## 11. Remaining gaps (honest)

| Gap | Path / owner |
|---|---|
| No team Science / Safety named sign-off | Claim register §14 still empty. Public efficacy / field-utility claims stay forbidden. |
| Repo skeleton exists; most scenes are greybox first-verbs | Runtime lives in `src/`. Full puzzles for `P-S02`–`P-S05` and most C1 spaces still need blockout. |
| New script has no CF appendix | Hosting follows §9 + official Workers docs only. |
| Greybox vs art | P0 should prove verbs in greybox (`Vertical Slice 0` in script G). Art must not delay first Fun Gate. |
| English locale | Not required to finish P0 Critical Path. If added, it is a full locale, not a sticker. |
| WebGL-less 2D fallback | Legacy TDD required it. New script assumes 3D. P0: detect WebGL fail and show a DOM “無法啟動 3D” + settings, not a silent black screen. Full 2D quest clone is **not** P0 unless playtests on target lab PCs demand it. |
| COOP/COEP | Unverified against Three.js. Default off. |
| Unsigned performance on school iGPUs | Budgets in `p0-manifest.json` are targets, not measured. |
| Chapters 2–Final | Stub only. Do not implement. |

Next production split per script appendix I (not this document’s job): per-scene blockout, interaction prefabs, quest state machine, dialogue rows, audio cues, animation needs, save fields (already listed), QA cases.

---

## 12. What this delivery contains

| File | Purpose |
|---|---|
| `docs/delivery/p0-contract.md` | This file: in/out, scenes, flags, gates, CF, acceptance. |
| `docs/delivery/p0-manifest.json` | Machine-readable scenes, tools, save fields, budgets. |

Runtime skeleton: `package.json`, `src/`, `wrangler.jsonc`. Title, Hub, `P-S00`/`P-S01` greybox, and destination spine for remaining P0 IDs.
