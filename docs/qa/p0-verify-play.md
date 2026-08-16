# P0 playability verify — fail closed

| Field | Value |
|---|---|
| Date | 2026-08-15 |
| Role | Adversarial playability verifier |
| Script | `Life_Circuit_Chengwan_Full_Game_Script_v1` P0 only |
| Repo | `C:/Users/daive/life-circuit-chengwan` |
| Locale | zh-Hant |
| Origin | http://127.0.0.1:8787 (`docs/qa/server-url.txt`) |
| Method | Static fail-closed audit of every P0 `completeAndGo` / save flag / tool gate. Live `GET /` + `/health`. Prior headed notes in `docs/qa/p0-browser-findings.md` treated as **stale on lighting/yaw** (source has since changed). |
| This pass did **not** | Re-run WASD / hold-Q / hold-F as a human. Those verbs are proven in source, not re-clicked. |

---

## Verdict

| Question | Result | Fail-closed meaning |
|---|---|---|
| Critical Path cannot be cleared by clicking every option | **PASS** | No A/B/C/D, no card slots, no red-X. Hard scenes require world state. Exhaustive DOM clicks do not grant `c1.complete`. |
| Tools exist | **PASS** | Flow Lens, Tether, Sealed Bio-Rig are live classes, granted on pickup, and required on named gates. |
| Workshop skip is legal | **PASS** | Harbor never reads `workshop.complete`. Leave writes resume only. No warning, no unqualified mark. |
| Fun Gate F1 live (30s visible goal, headed) | **UNVERIFIED** | Not re-played this session. Do not ship a “students saw the gate” claim from this file. |
| Script-faithful physical challenges on every C1 beat | **FAIL** | `C1-S01` crate/cage and `C1-S07` five layers are optional. `C1-S04` accepts two cones, not three. |

**Ship rule:** the three requested confirmations hold in source. Do **not** treat this file as a Fun Gate vertical-slice pass. `?debug=1` can skip any scene; that is QA-only and is not the player Critical Path.

---

## 1. Attack: click every option

Definition used (script + contract F5): a player who only presses `E` / workbench buttons / every listed interact, without aiming, pulsing, seating by shape, turning, or repairing, must **not** finish the Critical Path.

`completeAndGo` (`src/engine/game.ts`) only advances the active scene after that scene arms it. `SCENE_DEFS.applyComplete` then writes flags. There is no global “next” button on the player HUD.

### 1.1 Scenes that refuse exhaustive click

| Scene | Attack | Why it dies |
|---|---|---|
| `P-S02` | Mash 壓回接頭 | `seat()` returns unless `flowLens.owned` **and** `pulsedAt >= 0` **and** (`x>1.45 && z<-2.2` **or** last pulse hit a live lie). Door stay closed. |
| `P-S03` | Mash plates / seats | Holster must grant Tether first. Sockets are `chevron` vs `notch`. `TetherTool.canSnap` rejects shape mismatch. Gap trigger yanks the player back. |
| `P-S04` | Click anything | No advance interact. Gate rises only after three **seated** relays + debris cleared from the jam socket. |
| `P-S05` | Mash 升降開關 | Lift interact starts `enabled: false`. Hold does nothing until Tether seats `lever` into `lever-seat`. |
| `W-S00` | Look at frames in any order | `aimed > nextAim` resets the sequence. Must be cell ⊃ DNA ⊃ gene. |
| `W-S01` | Click stations | RNA body does not exist until the reader finishes. Wrong socket is `circle`, RNA is `rna`. |
| `W-S02` | Seat RNA in the lock | Lock socket is `protein`. RNA does not snap. Finish only on protein seat. |
| `W-S03` | Click pad + grab flag | Finish needs `darkRun && smokeOn && traced && flagged`. Smoke unseats if dark run has not happened. |
| `W-S04` | Click 問號 / mash 運行 | First run forces sun low and `portsOk=false`. Unknown returns until `validRun && docks.unknownOpen`. Second run refused until the joint is seated. |
| `C1-S00` | Mash 進入 at airlock | `onUse` returns unless `picked && loadout`. Probe `onUse` returns unless a loadout exists. |
| `C1-S01` | Click 倉庫 / 魚 / 市場 | Warehouse only announces 城市燈. Advance interact is added only after `triangleFill > 0.72` at the pump with a powered, readable probe. |
| `C1-S02` | Click 關 relay / wait | `maybeFlip` requires **turn + leave + relay**. Relay `onUse` no-ops until saturation. Van interact is not registered until flip. |
| `C1-S03` | Click 月亮 / 太陽 / 問號 in any order | Unknown announces and returns unless `unknownOpen && moonDone && sunValid`. `sunValid` is set only on a sun click **after** `portsOk`. Ports are shape-locked `port-reg` / `port-out`. |
| `C1-S04` | Click 進入 | Hand-off interact is created only after `triangulation.overlap().accepted && parked >= 1`. |
| `C1-S05` | Mash 再走一次 with defaults | `startSecond` requires `shape_audio` **and** `municipal_update_with_timestamp`. First walk always opens the desk; it never completes the scene. |
| `C1-S06` | Mash 開門 / 撤離 | Door returns unless grate parked **and** rover relay seated **and** latch seated. Evac returns unless `roverIn`. Brownout unseats the relay until latch. Pressurised pipe is locked. |
| `C1-S07` | Click 全河安全 / 已完成清理 / every real layer | Fake layers call `missingLayer()` → 目前沒有資料圖層. Layers never call `completeAndGo`. |

### 1.2 Scenes that *do* complete on a single interact — not quizzes

These are not “pick the right card.” Both options are valid, or the beat is a sit-down.

| Scene | What a click does | Why F5 still holds |
|---|---|---|
| `C1-S00` loadout | Battery or shell, last write wins | No wrong answer. Probe + airlock still required. |
| `C1-S05` toggles | Turning **all three** ON is the pass state | Missing any one fails the second walk. This is a required configuration, not elimination. |
| `C1-S07` models | 固定站 **or** 流動套件 immediately `completeAndGo` | Two valid ethics paths (F9). Clicking both keeps the last. Not a hidden single answer. |
| `C1-S08` / `P-S06` / `W-S05` | Leave / title hold / hub door | Recap / sit-down. `W-S05` door waits until the six-step replay has spoken. |

### 1.3 What is **not** the player Critical Path

- `?debug=1` → `primeSaveForScene` → jump. Explicitly does **not** write `workshop.complete`.
- Leftover `src/scenes/spine.ts`, `harborTools.ts`, `prologueTools.ts` still contain “press E to advance” rooms. **Registry does not mount them** for any P0 id (`src/scenes/registry.ts`). Default `createSpineScene` is unreachable while `SCENE_IDS` stays covered. Treat as dead-code risk, not a live click-all.

### 1.4 No card / quiz / score surface

Player HUD (`index.html`) is semantic DOM: task, battery meter, triangle, storm clock, interact prompt, workbench, recap, title card. No option grid. `src` has no quiz/card Critical Path. `preComplete` / `preSkipped` saves are rejected as corrupt (`src/engine/save.ts`).

---

## 2. Tools exist

Wired on every frame in `Game` (`src/engine/game.ts`): `FlowLens`, `TetherTool`, `BioRig`, plus `SignalGraph`, `DockSystem`, `Triangulation`.

| Tool | Pickup | Verbs present in code | Required on CP |
|---|---|---|---|
| Flow Lens | `P-S02` holster → `grantPickup()`, first pulse free (`freePulsesRemaining = 1`) | Hold-charge, release pulse, range vs battery, recover, dead_shine 1s, occlusion via `SignalGraph`, live vs residual | `P-S02` seat; used in `P-S04`/`P-S05`/`C1-S06` traces |
| Tether | `P-S03` holster | Grab / reel / rotate / mass / inertia / wind on heavy / shape snap / drop recover / lock icon on DNA & pressurised pipe | `P-S03` plates, `P-S04` relays, `P-S05` lever, `W-S00` scale, `W-S04` joint, `C1-S03` ports, `C1-S04` beacons, `C1-S06` grate + latch |
| Sealed Bio-Rig | `C1-S00` after loadout | Visible sense / regulate / triangle output; flag swap; saturate; shock vs crash shell; wall power; `fieldReadable` blocks C1 after invalid run until controls restored | `C1-S01` fill gate, `C1-S02` saturation, `C1-S03` docks, Chen reporter |

Reporter is never colour-only in the HUD cluster: `#rig-triangle` plus scale/emissive fill; Chen pass requires shape + chirp. Dock readouts are low / high / mid-wave, marked 教學模擬.

---

## 3. Workshop skip is legal

Script: skip shows no warning; `workshop.complete` stays false; C1 remains legal; language forks only.

| Check | Evidence | Result |
|---|---|---|
| Harbor does not read `workshop.complete` | `nextC1Scene` (`src/content/progress.ts`) keys only on C1 flags / probe / latch | Pass |
| No C1 scene file mentions `workshop.complete` | Grep under `src/scenes/chapter1` is empty | Pass |
| Leave never completes workshop | `leaveWorkshop` sets `resumeScene` only. Pad + pause 離開工作坊 call `loadScene("HUB-S00")` | Pass |
| Complete only at `W-S05` | `SCENE_DEFS["W-S05"].applyComplete` | Pass |
| No shame copy | Pause label is 離開工作坊. Hub skip is just 去河港. Banned list includes 你已合格. No 缺少資格 / 不建議 | Pass |
| Language fork only | `c1ProbeLine` → `C1-S00-D003` vs `D003A`. Workbench dock rows add negative/positive **labels** only if complete. Docks function the same | Pass |
| Resume | `workshopEntry` returns last `W-S0x` or `W-S00` | Pass |
| Crisis lock | `isCrisisScene` blocks 回到研究站 during `P-S00`–`P-S05`. Workshop is not a crisis scene | Pass |
| Debug does not fake a diploma | `primeSaveForScene` comment + body: never writes `workshop.complete` | Pass |

`W-S00` spawn is `(0, 4.85, yaw 0)`; safe pad is at `(-(8.8−2.2), 8.8−2.2)` ≈ `(-6.6, 6.6)`, radius `1.05`. First prompt is no longer inside 離開工作坊 (fixes prior `p0-browser-findings` S1-03 in **source**).

---

## 4. Scene gates (P0 only)

### 4.1 Title + Hub

| ID | 30s goal in HUD | Gate | Notes |
|---|---|---|---|
| `BOOT-S00` | 開始 / 繼續 / 設定 | Cold 開始 → `P-S00`. Title name hidden until `prologueComplete` | No lore wall |
| `HUB-S00` | 走到中央桌 | Physical 河港 / 工作坊. `C2` hatch is radio + 尚未開放 | Spawn now `(0, 5.15, yaw 0)` facing the table (prior empty-floor look is fixed in source) |
| `C2-STUB` | 尚未開放 | Same hub scene; no factory | Honest stub |

### 4.2 Prologue 黑水線

| ID | Cannot click-all | Spatial / tool verb | Recovery |
|---|---|---|---|
| `P-S00` | Indoor door only slides; lift **trigger** completes | Walk yellow spine to dead lift | Indoor redirect line; water hazard → rope |
| `P-S01` | Crate interact does not complete | Must shove, then enter booth / climb volume | No timer |
| `P-S02` | See §1.1 | Pulse, follow moving lie, seat relay, walk out `z < -5.7` | Dead shine fades 1s |
| `P-S03` | Shape sockets | Two plates, walk `z < farLip` | Gap pull-back; plate recover |
| `P-S04` | Three seats + debris | Lens + Tether combined | Audio layers per fix; no 「正確」 |
| `P-S05` | Lever then hold lift | 70s storm bar unless 寬鬆時間 | Water fail: rope to mouth, lever stays seated |
| `P-S06` | Sit-down | Lines then title card then Hub | Writes both tools true |

### 4.3 Workshop (optional)

| ID | Gate | Click-all? |
|---|---|---|
| `W-S00` | Scale handle seat → mag on gene → aim order | No |
| `W-S01` | Reader → peel RNA → `rna` socket | No |
| `W-S02` | Fold then protein in lock | No |
| `W-S03` | Dark observe, smoke seat, trace (lens **or** walk to lamp), flag | No. Trace can skip the lens by walking to `x>2.8, z<-1.4` — spatial, not a quiz |
| `W-S04` | Failed sun, joint, valid re-run, then unknown | No. Failed positive blocks unknown |
| `W-S05` | Replay then 進入 | Sit-down. Sets `workshop.complete` |

### 4.4 Chapter 1 紅色警報

| ID | Gate | Click-all? | Script fidelity gap |
|---|---|---|---|
| `C1-S00` | One loadout + probe + airlock | No | — |
| `C1-S01` | Face +Z (`heading [0.12,0,1]`) until `triangleFill>0.72` at pump | No | **Crate and cage are optional.** `wallGap` at `z=23` is walk-aroundable via market deck (`x < -3.6`) and `deckFlank`. Flow Lens not required to arm the exit |
| `C1-S02` | After ~58s saturate: turn `yawΔ>2.2` in place, walk `>4.2`, kill env relay | No | Matches “must try three things” |
| `C1-S03` | Moon low, external ports seated, sun high, then unknown | No | Unknown dock is a click, but it is **blocked** until the physical repair. Camera now `dist=2.55` at the van (prior “too far” finding likely stale) |
| `C1-S04` | ≥1 valid beacon + handheld overlap (`wide` area&lt;52 or `tight` area&lt;22) | No | Script asked for **three** bearings. Code accepts **two** cones. Wide and tight both persist |
| `C1-S05` | Place demo, fail first walk if colour-only, desk sets shape+sound **and** municipal timestamp, second walk | No | Workbench is DOM, not a 3D bench. Still not a quiz |
| `C1-S06` | Grate park, relay, latch across brownout, rover in, evac | No | Player never touches the unknown lock |
| `C1-S07` | Place one monitoring model | Not a quiz | **Layers are optional.** Task says 打開發布圖層; `place()` does not count them. Fake layers correctly refuse |
| `C1-S08` | Recap + 進入 | Sit-down | First fail wall if `hasFailedRun`. Both models get stop button + board |

`nextC1Scene` will not skip a missing flag: loadout/probe → trace → invalid run → controls → zone → Chen pair → latch → map → complete.

---

## 5. Fun / Learning (fail closed)

| ID | Standard | This pass |
|---|---|---|
| F1 | 30s visible goal | **Unverified live.** Source tasks are verb+object. Headed proof is still `docs/qa/p0-browser-findings.md` plus later lighting/yaw edits |
| F2 | 90s spatial verb | **Pass** on prologue tools and C1-S02/S03/S04/S06. **Soft fail** `C1-S01` (walk + face is enough) |
| F3 | Skill ceiling | **Partial.** Tether mass/angle and pulse charge exist. `C1-S01` cage route is skippable |
| F4 | Readable failure | **Pass** in source: rope, dead shine, saturated self-test, unknown announce, brownout slam. No red-X overlay |
| F5 | No exhaustive click | **Pass** — §1 |
| F6 | Knowledge unlocks ability | **Pass** `C1-S03` → second entry. Workshop skip still teaches the loop in C1-S02/S03 |
| F7 | NPC changes design | **Pass** if Chen desk is used: output + notice both required |
| F8 | Claim ≤ evidence | **Pass** on fake layers. **Soft fail** on F8 spirit: public map can be published without opening obtained layers |
| F9 | Two defensible paths | **Pass** battery/shell, wide/tight, fixed/portable |
| F10 | Stop / delay can succeed | **Pass** invalid run forces retreat; unresolved confirmation + long-term monitoring stamped |

Learning Gate from contract §8:

| Must | Result |
|---|---|
| Failed positive blocks unknown (`W-S04`, `C1-S03`) | **Pass** |
| Cannot publish 全河安全 / 已完成清理 | **Pass** |
| Chen requires shape+sound **and** notice | **Pass** |
| Two monitoring models change furniture | **Pass** (`furnitureForModel` + Hub skyline) |
| First invalid run retained | **Pass** (`keepSaturatedRun`, wall on Hub/C1-S08) |
| Workshop skip not a gate | **Pass** |
| No MerR / Pmer / dTomato password | **Pass** (banned lint) |
| Player not an authority | **Pass** (郭工 / lab own identity; rover not player) |

---

## 6. Live origin (this pass)

```
GET http://127.0.0.1:8787/health  200
{"ok":true,"service":"life-circuit-chengwan","gameState":false}

GET http://127.0.0.1:8787/  200  title=生命迴路：澄灣
```

No headed replay. Do not cite this file for “I saw the orange SOS in 30 seconds.”

---

## 7. Remaining gaps

| Severity | Gap | Path |
|---|---|---|
| S1 (script) | `C1-S01` crate / cage / cable pull not required; west walk-around | `src/scenes/chapter1/s01.ts`, `kit.ts` `mountEastShore` |
| S1 (script) | `C1-S07` completes on first model click; five layers never gated | `src/scenes/chapter1/s07.ts` `place()` |
| S2 (script) | `C1-S04` overlap accepts 2 valid cones, not 3 | `src/engine/systems/triangulation.ts` `cones.length < 2` |
| S2 (edu) | `W-S03` “trace” can complete by walking to the lamp, no pulse | `src/scenes/workshop/gate.ts` `x > 2.8 && z < -1.4` |
| S2 (copy) | `P-S03-D001` still says 藍色座; sockets are shapes | dialogue vs `pS03.ts` |
| S2 (copy) | Workbench history value is English `outputBand` (`saturated`) | `src/ui/workbench.ts` `historyRow` |
| S2 (dead) | Click-advance leftovers still compile | `src/scenes/spine.ts`, `harborTools.ts`, `prologueTools.ts` |
| S3 | Live F1/F2 headed pass not repeated after yaw/light edits | Needs Chrome, not this file |
| S3 | `C1-S05` / `C1-S07` primary verbs are DOM workbench, not only world placement | `src/ui/workbench.ts` |

Prior S1 lighting findings (black `P-S02`, Hub facing void, W-S00 leave overlap, C1-S00 loadout off-camera) look **addressed in current source**. They stay **unverified in a browser** until a new headed pass.

---

## 8. Commands run

```
Invoke-WebRequest http://127.0.0.1:8787/health
Invoke-WebRequest http://127.0.0.1:8787/
```

No game source was edited. No `wrangler deploy`.

---

## 9. Files read (authority + runtime)

- Script: `C:/Users/daive/Downloads/Life_Circuit_Chengwan_Full_Game_Script_v1.txt` (P0 slice)
- Contract / manifest: `docs/delivery/p0-contract.md`, `docs/delivery/p0-manifest.json`
- Prior live notes: `docs/qa/p0-browser-findings.md`
- Progress / catalog / debug / copy / beats / save
- All P0 scenes under `src/scenes/prologue/`, `workshop/`, `chapter1/`, `hub.ts`
- Tools: `src/engine/systems/{flowLens,tether,bioRig,docks,triangulation,signalGraph}.ts`
- `src/engine/game.ts`, `src/ui/workbench.ts`, `src/ui/overlays.ts`, `index.html`

---

## 10. Files changed

- `docs/qa/p0-verify-play.md` (this file)
