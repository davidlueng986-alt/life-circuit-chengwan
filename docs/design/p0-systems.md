# P0 Systems Design — Flow Lens, Tether, Bio-Rig, docks, triangulation

| Field | Value |
|---|---|
| Document | `docs/design/p0-systems.md` |
| Role | Systems designer spec for the three tools + controls docks + triangulation |
| Version | `2026-08-15-p0` |
| Locale | Player-facing `zh-Hant`. This file is a production spec, **not** player UI. |
| Script authority | `Life_Circuit_Chengwan_Full_Game_Script_v1` (2026-08-15 Game-first Rewrite) |
| Companions | `docs/delivery/p0-contract.md` §4–5, `docs/delivery/p0-manifest.json`, `docs/education/p0-learning.md`, `docs/safety/p0-boundaries.md`, `docs/claims/p0-claims.md` |
| Scope | Title + Hub, Prologue `P-S00`–`P-S06`, optional Workshop `W-S00`–`W-S05`, Chapter 1 `C1-S00`–`C1-S08` |
| Out of scope | Playable Chapters 2–Final. Card / quiz Critical Path. Sequences, culture conditions, concentrations, wet-lab how-to. |

This file tells programmers and greybox designers **how the three tools actually behave**, which persist flags they write, and how a pulse that can *lie* is still a fair verb. It does not implement the runtime.

---

## 0. Authority and two hard systems rules

When documents conflict:

1. Named team Science / Safety sign-off *(none present as of 2026-08-15)*.
2. New full script `Life_Circuit_Chengwan_Full_Game_Script_v1`.
3. Legacy `20_SOURCE_AND_CLAIM_REGISTER.md` **safety / claim wording only**.
4. Legacy GDD / TDD **only if they do not conflict** with (2). Retired: Next.js card stack, “no dynamic physics,” MerR/Pmer/dTomato passwords, HUD disclaimers.

### 0.1 Flow Lens can lie

A pulse is a **brief, local, distortable rendering** of hidden flow. Brightness is not truth. Residual charge, reflections, city lights, occlusion, background, a broken device, and a failed control can all make the overlay look important while it is not a usable bearing.

Script teaching beat (`P-S02`, transferred in `C1-S01` and `C1-S06`):

> 找會流動的那條，不要找最亮的。壞線也會反光。

The brightest dead line **must** be implementable. If every highlighted path is the answer, the lens is a wallhack and the Fun Gate fails.

### 0.2 Controls decide readability

Moon (should stay low) and sun (should go high) answer **whether this run can be read**, not what is in the river.

| Condition | Overlay / dock may *show* | Player may *use as evidence or unknown* |
|---|---|---|
| Device unread (`c1.controlsRestored === false`, or workshop sun joint broken) | Dead shine, saturation, self-test flicker, the break itself | **No.** Unknown dock stays shut. No bearing claim. |
| Device readable (moon low **and** sun high) | Live flow, residual, occlusion, background still exist | Live, moving flow may be used. Residual still lies. |
| Saturated probe (`C1-S02`) | Max fill on every facing; env emergency lines still pulse | Probe bearing unusable. Mission flips to **bring the whole probe home**. |

Failed positive control **blocks the unknown**. That is a world lock, not a lecture (`W-S04`, `C1-S03`; claim `P0-RULE-002`).

All meters, fills, cones, and overlap areas are `TEACHING_SIMULATION`. Relative states only: low / mid / high / fluctuating, triangle fill, pulse density. No real units, LOD, or analyte identity.

---

## 1. Persist flags (from the script, aligned to save v1)

Save: browser `localStorage` key `life-circuit-chengwan.save.v1`. Schema version `1`. Do not auto-migrate legacy `preComplete` / `preSkipped`. No PII.

Script “共用狀態” (bible) plus scene-end writes. Implementation names match `docs/delivery/p0-contract.md` §4.

### 1.1 Tools

| Persist path | Type | Script / scene write | P0 default |
|---|---|---|---|
| `player.tool.flowLens` | bool | `true` after pickup in `P-S02` | `false` |
| `player.tool.tether` | bool | `true` after pickup in `P-S03` | `false` |
| `player.tool.sealedProbe` | bool | `true` after pickup in `C1-S00` | `false` |
| `player.tool.scanRange` | number | Bible growth field. P0 uses default pulse; do **not** ship a later-chapter relay upgrade | greybox default |
| `player.tool.tetherStrength` | number | Bible growth field. P0 default mass class table | greybox default |
| `player.tool.modules` | `string[]` | May push `"latch"` after the player **uses** the memory slot in `C1-S06`. Never sequences | `[]` |
| `player.tool.battery` | `0–1` | Session charge; persist last known. First prologue pulse is free and does not drain | `1` |
| `c1.loadout` | `"battery" \| "crash_shell" \| null` | One pick at `C1-S00`. Both routes completable. No wrong answer | `null` |

### 1.2 Progress

| Persist path | Type | When |
|---|---|---|
| `prologueComplete` | bool | `P-S06` |
| `hub.unlocked` | bool | After `P-S06` |
| `workshop.available` | bool | After `P-S06` |
| `workshop.complete` | bool | `W-S05`. Skip leaves **false**. Never a C1 gate |
| `workshop.resumeScene` | `W-S00`…`W-S05` \| `null` | Last safe-platform leave |
| `c1.firstTraceRecovered` | bool | `C1-S01` first stable record carried back |
| `c1.invalidRunExperienced` | bool | `C1-S02` after the three failed spatial tests + self-test |
| `c1.controlsRestored` | bool | `C1-S03` after moon **low** and sun **high** |
| `c1.sourceZoneMarked` | bool | `C1-S04` overlap accepted by 郭工 |
| `c1.accessibilityOutput` | `"color_only" \| "shape_audio"` | Chen walk **must** end `shape_audio` |
| `c1.notificationRule` | `"none" \| "municipal_update_with_timestamp"` | Chen walk **must** end `municipal_update_with_timestamp` |
| `c1.monitoringModel` | `"fixed_station" \| "portable_kits" \| null` | `C1-S07` physical placement |
| `c1.publicMapPublished` | bool | `C1-S07` |
| `c1.complete` | bool | `C1-S08` |
| `c1.unresolved` | `string[]` | After C1 **must** include `confirmation_result`, `long_term_monitoring` |

### 1.3 Codex, evidence, world, relationships

| Persist path | Rules |
|---|---|
| `player.codex.terms[]` | Unlock **after** the matching verb. Closable one-liner. Never a gate. P0: `cell`, `dnaGene`, `transcription`, `translation`, `input`, `regulator`, `promoter`, `reporter`, `output`, `controls`, `validRun`, optional `screening` after `C1-S07` |
| `evidence.runHistory[]` | Every probe / dock run. **First C1 invalid run cannot be deleted.** |
| `evidence.unresolved[]` | Unknowns tied to a next action. Mirrors `c1.unresolved` after C1 |
| `world.harbor.monitoringModel` | Mirrors `c1.monitoringModel`. Changes Hub + harbor far-view |
| `world.factory.supplyModel` and later `world.*` | **Schema stubs only.** Do not simulate C2–Final |
| `relationships.characterMemory` | Sparse facts (`xiaocen.rescued`, Chen accepted trial after usable alarm). **No affinity number** |

Script aliases at scene ends (`tool.flowLens`, `relationship.xiaocen.rescued`, `codex.cell`) map to the dotted paths above. Implement one schema.

### 1.4 QA-only (never HUD, never badges)

| Flag | Set when |
|---|---|
| `evidence.controlRunBeforeClaim` | Valid moon+sun **before** `?` or any public layer that depends on the second run |
| `evidence.failedRunRetained` | `C1-S02` run still in `runHistory` at `C1-S08` |
| `evidence.userFeedbackChangedPrototype` | Second Chen walk uses `shape_audio` **and** municipal timestamp notice |
| `evidence.claimMatchesObservedRange` | Public map layers ⊆ obtained valid runs; missing-layer refuse fired |

---

## 2. Runtime session state (not all persisted)

Keep these on the player / scene controller. Checkpoint them only if a mid-scene resume needs them (`workshop.resumeScene`, evac retries).

| Runtime field | Purpose |
|---|---|
| `lens.charging` | Hold started |
| `lens.charge01` | 0–1 hold amount → range, drain, recover |
| `lens.recoverUntil` | Cannot pulse while recovering |
| `lens.lastPulse` | Hits currently fading (2 s reveal) |
| `lens.freePulsesRemaining` | `1` at `P-S02` pickup; then 0 |
| `tether.heldId` | Current body or `null` |
| `tether.pose` | Distance, yaw/pitch, roll |
| `tether.assistAlign` | From `settings.holdAlternatives` / assist mode |
| `probe.powered` | Offline after shock until wall power (battery loadout) |
| `probe.saturated` | `C1-S02` after the scripted flip |
| `probe.selfTestBlink` | After the third failed test |
| `probe.reporterChannels` | fill, shape, audio (see §5) |
| `docks.moon` / `docks.sun` / `docks.unknown` | Occupancy + last output band |
| `docks.unknownOpen` | Hard-gated by readability |
| `tri.beacons[0..1]` | World pose + bearing cone |
| `tri.handheldCone` | Moves with the probe |
| `tri.overlap` | Area + quality + accepted |
| `latch.stepsKept` | Unlock steps that survive brownout (`C1-S06`) |
| `c1.testsTried` | `{ turned, leftSpot, killedEnvRelay }` — all three required before mission flip |

`settings.relaxedTimer`, `settings.reducedMotion`, `settings.holdAlternatives` are persist settings; they change **how** verbs resolve, not story outcomes.

---

## 3. Flow Lens — 流路透鏡

Unlock: pick up in the dark control room (`P-S02`). Persist `player.tool.flowLens = true`.

### 3.1 Player verb

Script: hold scan to charge, **release** a short-range pulse. Longer hold = more range, more battery, longer recover. First prologue pulse is free; afterwards a **ring** with no definition text.

| Input (default greybox) | Action |
|---|---|
| Hold scan (`Q` or RMB) | Charge. Ring fills. Range preview is a faint sphere, **not** a path highlighter |
| Release | Pulse. Hits paint for ~2 s then fade |
| Tap (min charge) | Short range, cheap, short recover |
| Full hold (~1.2 s) | Long range, expensive, long recover |
| `settings.holdAlternatives` | Tap-to-pulse at default short range, **or** a charged pulse via a second tap. Critical Path remains completable |

Do not use a permanent toggle “X-ray mode.” Do not keep overlays after fade unless a **relay beacon** is parked (`C1-S04`) — beacons are devices, not a lens cheat.

### 3.2 What a pulse is allowed to show

Briefly: signal **direction**, pipe **flow**, hotspots, device links, data paths, material versions. In P0 the live kinds are:

| `SignalKind` | First used | Motion channel | May be bright while dead? |
|---|---|---|---|
| `power_live` | `P-S02` live lock line | Yes — advection toward lock | No (if it is live, it moves) |
| `power_residual` | `P-S02` brightest dead line | **No** | **Yes — this is the lie** |
| `emergency_pulse` | `P-S05` white pulse | Yes — discrete hops along route | Residual emergency paint can sit still |
| `env_flow` | `C1-S01` water / air | Yes — along current | Surface glare can sit still |
| `probe_bearing` | `C1-S01` | Density / heading, not a waypoint | Saturated fill is a lie about “everywhere” |
| `device_link` | `P-S04`, `C1-S03` self-inspect | Yes along connected graph | Broken joint: bright stub that stops |
| `self_test` | `C1-S02` | Blink icon inside shell | Not a direction |
| `city_light` | `C1-S01` warehouse | **No** | **Yes** — urban red, not the answer |
| `leftover_residue` | `C1-S06` left pipe | **No** | **Yes** — “左邊很亮，但不動” |
| `workshop_trace` | `W-S00`–`W-S04` | Along model graph | Broken sun joint: dark sun *and* a visible cut |

Each world source is authored as a small graph edge or field, **not** as “the correct answer tag.”

### 3.3 Distortion model (the lie is data, not flavour)

```
displayedBrightness  ⊥  truth
displayedMotion      ≈  usability of a bearing
occlusion            ⊆  what the pulse can even see
deviceReadable       =  whether probe_bearing / unknown may be claimed
```

| `LieClass` | How it looks | How the player learns it is a lie | May enter a claim / cone? |
|---|---|---|---|
| `live` | Glow **moves** along a direction | Follow it; world object at the end responds | Yes, if also readable when it is a probe bearing |
| `dead_shine` | Bright, then **dies in ~1 s**; no advection | `P-S02` animation. 小岑: 壞線也會反光 | **No** |
| `occluded` | Pulse stops or thins at the first solid | Second beacon near+blocked vs far+clear | Cone **widens**; do not draw a fake line through the wall |
| `background` | Soft field, no unique heading | Market / rain glare | No unique bearing |
| `saturated` | Max on every facing | Player **must** try turn / leave / kill env relay | Probe bearing **unusable** |
| `unreadable` | Self-test / broken refs; unknown dock shut | Controls not restored | No unknown, no second-entry claim |
| `city_light` | Distant blink, no flow | Does not change triangle density with facing | No |

**Implementation rule:** never set `isSolution = true` on a mesh. Classify `LieClass` from **motion, occlusion, device state, and kind**. Designers place a bright residual next to a dim live line on purpose.

### 3.4 Occlusion

- A pulse is a short-lived sphere (or cone from the lens) that **does not see through** authored occluders: concrete, closed doors, earth, pump-house mass.
- Glass / grate: attenuate, do not invent a new heading.
- `C1-S04` near-and-blocked beacon: cone half-angle **increases**; overlap stays large unless the player moves or uses the far pad.
- Reduced motion may soften camera punch; it **must not** hide advection. Flow is the readable channel.

### 3.5 Battery (feel targets, not sensor specs)

Greybox numbers — tune in playtest. Never relabel as T90 or calibration.

| Event | Battery | Recover |
|---|---|---|
| `P-S02` first pulse | Free (`lens.freePulsesRemaining`) | None |
| Short pulse | −0.12 | ~0.4 s |
| Full-charge pulse | −0.28 | ~1.6 s |
| Empty | Pulse fails: ring clacks, no overlay, no red X | Must wait |
| `c1.loadout === "battery"` | Drain × 0.6 (小岑: 多掃幾次) | Same |
| `c1.loadout === "crash_shell"` | Default drain | Same |
| Wall power (`C1-S01` shock, battery loadout) | Probe reboot 10 s; lens battery unchanged | — |

HUD: a **shape ring**, not a percent string, not “電量定義.” Empty is felt (no pulse), not scored.

### 3.6 DOM HUD (semantic, not canvas text)

Allowed:

- Task verb: 到防洪控制室 / 把探頭帶回流動站 / 為確認隊標出可進入的範圍.
- Battery ring (`progress` or `meter`, `aria-valuenow` 0–100, no unit science).
- After `C1-S03` repair: two control **states** (moon low / sun high) + session run clock. **Never** `100% 準確`.
- Public map: 目前看見 / 仍不知道 / 誰在確認 / 何時更新.

Forbidden in HUD: “正確路徑,” developer disclaimers, analyte names, real units, `science.limit.*`.

If a still meter could be screenshot as lab data, mark **that readout only** `教學模擬`.

### 3.7 Scene contracts — Lens

| Scene | Must do | Must not |
|---|---|---|
| `P-S02` | Three pipes. One live-to-lock. Brightest is `dead_shine` and fades in 1 s. Live still moves | Auto-lock the correct pipe. Definition toast |
| `P-S04` | Show where command **stops** (wrong path / jam / loose) | Stamp 正確 on a relay |
| `P-S05` | White **flowing** emergency line on the new corridor | Permanent breadcrumbs |
| `W-S00` | Boundary, DNA track, short marked stretch | Let Tether move DNA via a lens “select” |
| `W-S03` | Trace sensor → regulator → promoter → reporter | Name terms before both runs |
| `W-S04` | Reveal the **cut** on the sun channel | Open `?` because the player scanned |
| `C1-S01` | Env flow + triangle density with **body rotation**. Warehouse is `city_light` | Treat fish / smell / oil as proof |
| `C1-S02` | After three tests, self-test icon. Evac: emergency lighting routes still live | Keep a trustworthy probe heading |
| `C1-S03` | Self-inspect through **transparent shell**: stuck regulator relay + wet reporter joint | Open the shell |
| `C1-S04` | Beacons hold a cone; handheld cone moves | Three fixed sample wells |
| `C1-S06` | Flowing weak pulse vs bright-still residue | Bright = answer |

### 3.8 Feel table (greybox)

| Parameter | Start value |
|---|---|
| Default range | 8 m |
| Full-charge range | 16 m (`player.tool.scanRange` scales later; P0 = 1.0) |
| Reveal duration | 2.0 s |
| Dead-shine lifetime | 1.0 s |
| Charge to full | 1.2 s |

---

## 4. Tether — 連接工具

Unlock: wall rack outside the broken bridge (`P-S03`). Persist `player.tool.tether = true`.

### 4.1 Player verb

Physics ray: grab, pull, push, rotate, insert, cut, snap, park. Weight, inertia, collision, **shape** sockets. Critical Path is never a 2D card drag.

| Input (default greybox) | Action |
|---|---|
| Hold tether (`E` hold or LMB on focus) | Attach if in range and tag allows |
| Move / look | Reel in/out; yaw the held body |
| Extra rotate (Q/E or mouse while modifier) | Roll to match **shape** key |
| Release | Drop. Safety cable may return tagged props |
| Cut (only `cuttable`) | Separate a joint. **Never** on `pressurised` |
| `settings.holdAlternatives` | Toggle grab + button reel; assist snap when near correct pose |

### 4.2 Mass / state classes (Vertical Slice 0: four states)

Script Fun Gate: Tether has at least **weight, rotate, collision, fragile**.

| `MassClass` | Examples | Feel |
|---|---|---|
| `light` | `P-S01` toolbox (interact push, not yet tether), RNA copy, missing lever, smoke handle | Snappy |
| `medium` | First bridge plate, float crate, beacon, sealed probe in cage | Noticeable inertia |
| `heavy` | Second plate (wind tugs), grate, rover relay | Slow rotate; wind / slope matter |
| `locked` | DNA track, pressurised line, sealed inner guts | Show **lock icon**. No move. Not a fail screen |
| `fragile` | Sealed probe (no crash shell), beacon on crane | Shock → probe offline or drop; recoverable |

`player.tool.tetherStrength` is a multiplier on reel force (P0 = 1.0). Do not hide mass behind an upgrade so every object feels the same.

### 4.3 Snap is shape, not colour

Sockets expose a **silhouette / notch**, not a colour legend. Snap when:

1. Shape key matches,
2. Angle within ~18° (assist ~35°),
3. Distance within socket radius,
4. Path not blocked.

Wrong pose: slide off, click, no “Wrong.” Assist mode (`P-S03` 輔助模式) auto-aligns **near** the correct pose only.

DNA (`W-S01`): lock icon. Magnifier frame (`W-S00`) is the only legal tether target for that beat.

### 4.4 Hazards and recovery (no Game Over)

| Event | Recovery |
|---|---|
| Player fall | Safety line, 1.2 s, nearest anchor. No death screen |
| Plate / beacon drop | Cable returns to rack / last pad, or player reels it |
| Probe shock | Crash shell: stays up. Battery: wall power 10 s |
| Pressurised line yanked (`C1-S06`) | Safety valve, grate blows back, retry with cause visible |
| Water catches player | Mist wipe / cable to last platform. **Completed tethers and latch steps stay** |

### 4.5 Scene contracts — Tether

| Scene | Verb |
|---|---|
| `P-S03` | Two plates → two **shape** seats. Second heavier + wind. Rear plate lifts after cross but stays locked |
| `P-S04` | Clear jam; reseat wrong-path and loose relays |
| `P-S05` | Seat missing lever; hold lift is interact, not a new tool |
| `W-S00` | Pull **magnifier**, never DNA |
| `W-S01` | Guide RNA; DNA = lock |
| `W-S02` | Protein fits lock and turns it; RNA does not |
| `W-S03` | Open smoke simulator |
| `W-S04` | Reseat sun-channel joint |
| `C1-S01` | Float crates as steps; cage probe over a cable the player cannot climb with hands |
| `C1-S04` | Recover dropped beacon; park on standable high ground only |
| `C1-S06` | Move grate; do not break pressurised pipe; seat rover relay + latch module |

Cut is unused as a Critical Path in P0 except as “separate a wrong relay.” Do not add a free-form saw.

---

## 5. Sealed Bio-Rig / sealed probe — 封閉生命模組

Unlock: Hub desk `C1-S00`. Persist `player.tool.sealedProbe = true`. Workshop uses a **room-scale** sealed model of the same three slots; it does not grant a field probe and does not gate C1.

### 5.1 Visible slots (operate first, name later)

| Slot | Behaviour the player sees | Named after (if workshop played) | C1 living phrase if skipped |
|---|---|---|---|
| 感測 `sense` | Faces a direction; changes internal state | input / sensor | 前端感到目標 |
| 調控 `regulate` | Gate opens or sticks | regulator / promoter | 中央決定是否放行訊號 |
| 輸出 `output` | Fill + **shape** + **sound** | reporter / output | 尾端把結果顯示出來 |

Never show sequences, media, concentrations, open-shell wet steps, or environmental release. Service is **external ports only** (`C1-S03`).

### 5.2 Reporter is never colour alone

| Channel | P0 use |
|---|---|
| Fill / animation | Triangle fills by **heading agreement**, not by a red/green enum (`C1-S01`) |
| Shape | Flag swap in `W-S03`; required after Chen (`shape_audio`) |
| Short sound | Required after Chen. Distinct from city noise |
| Colour | Allowed only **with** another channel. Colour-only **fails** `C1-S05` |

Triangle density = **direction closeness**, not concentration (`P0-MEAS-006`). Saturated = same max fill on every facing = **no direction**.

### 5.3 Loadout is a risk claim, not a moral test

| `c1.loadout` | Field effect | Evac `C1-S02` |
|---|---|---|
| `battery` | More pulses (lens drain × 0.6). Probe shock → 10 s wall power | Short lift available |
| `crash_shell` | Probe survives shock | Shorter physical carry, no lift |

Both finish. Times stay similar. Do not score.

### 5.4 Internal runtime (not a recipe)

```
sense.inputBand      →  regulate.gateOpen
regulate.gateOpen    →  reporter.outputBand   (with a short delay)
servicePorts.ok      →  refs can be valid
saturated            →  outputBand = max  (gate stuck / wet joint)
selfTest             →  lens LieClass.self_test
```

`C1-S03` authored faults: regulator relay **jammed**, reporter joint **wet / continuously high**. Reset / replace from **outside**. Sun stays max until both ports are seated.

Latch (`C1-S06`): a module the player seats in a **memory slot**. Formal name is **not** spoken. Behaviour: `latch.stepsKept` survives brownout. Persist `"latch"` on `player.tool.modules` after first successful use.

### 5.5 Scene contracts — Rig

| Scene | Rule |
|---|---|
| `C1-S00` | Sealed. No vials. Dialogue fork `C1-S00-D003` vs `D003A` on `workshop.complete` only |
| `C1-S01` | Body rotation changes triangle density. Carry + cage. Observations ≠ proof |
| `C1-S02` | Must **try** turn, leave, kill env relay (`c1.testsTried`). Then self-test. Flip mission to whole-probe return. No blame |
| `C1-S03` | See §6 |
| `C1-S05` | Playable usability. Pass requires `c1.accessibilityOutput = shape_audio` **and** `c1.notificationRule = municipal_update_with_timestamp` |
| `C1-S06` | Player opens door; **rover** enters. Player never touches the unknown |

---

## 6. Controls docks — 月亮 / 太陽 / 問號

Same grammar in `W-S04` (room channels) and `C1-S03` (mobile-lab sealed docks). Icons **before** terms. Workshop-complete players may see small labels `negative control` / `positive control` / `unknown`; skippers see icons only. Function is identical.

### 6.1 Expected bands

| Dock | Icon | Expected if device readable | Failed-device authored beat |
|---|---|---|---|
| Moon | 月 | **Low** / dark | Stays low (still “works” as negative) |
| Sun | 日 | **High** / bright + shape | `W-S04`: dark (cut joint). `C1-S03`: **max** (stuck high) |
| Unknown | `?` | Mid, **fluctuating** | Closed until moon low **and** sun high |

```
unknownOpen =
  moon.output == low
  AND sun.output == high
  AND shell.sealed
  AND servicePorts.ok
  AND !probe.saturated
```

If `unknownOpen` is false, the `?` collider / hatch **does not accept** the probe. Scanning it does not peek a result.

### 6.2 Readability is the product, not a quiz

| Player action | World result |
|---|---|
| Run while sun is failed | Moon dark, sun wrong, `?` dark or shut. Exit / second entry **blocked** |
| Fix joint / external ports | Re-run. Moon low, sun high |
| Then `?` | Mid + fluctuation. **Not** identity. Not 100% |
| Try to delete first fail | 方雅 blocks. `runHistory` keeps `C1-S02` |

林博士 names controls **after** the pair works (`C1-S03-D003`, `W-S04-D003`).

Post-repair UI: two control states + **session** run clock. No `已校準`, `validated`, `100%`.

### 6.3 Run history record (append-only)

Each dock / field run pushes an object. Suggested shape (implementation, not player UI):

```
{
  id, scene, at,
  kind: "field_trace" | "saturated" | "moon" | "sun" | "unknown" | "workshop_channel",
  outputBand: "low" | "mid" | "high" | "fluctuating" | "saturated",
  readable: boolean,
  loadout: "battery" | "crash_shell" | null,
  retained: true
}
```

`C1-S07` map layers are **projections of this array**. Fake layers 全河安全 / 已完成清理 → `目前沒有資料圖層`.

Set `c1.controlsRestored = true` and `evidence.controlRunBeforeClaim = true` only after a valid moon+sun pair.

---

## 7. Triangulation — 交疊區, not three sample wells

Scene: `C1-S04`. Requires `c1.controlsRestored`. Tide has rewritten the market road.

### 7.1 Pieces

| Piece | Count | Role |
|---|---|---|
| Relay beacon | 0–2 | Parked on **standable high ground**. Holds a cone |
| Handheld probe | 1 | Third **moving** reading. Player body + facing |
| Overlap | 1 | Intersection of valid cones. “值得確認的區域,” not a red identity dot |

No fixed three wells. No A/B/C/D. 郭工: 我不需要一個紅點。我需要一個人員能安全進入的範圍。

### 7.2 Cone construction (teaching simulation)

```
halfAngle = baseAngle
          + occlusionPenalty      // near blocked pad
          + lowBatteryPenalty
          + residualMisusePenalty // if player aims at dead_shine / city_light
          + saturateInfinity      // if somehow unread: no cone

validCone = deviceReadable
         && !probe.saturated
         && lieClass of the used bearing is live
         && player (or beacon) has line of sight
```

Dead shine and city lights **must not** tighten a cone. If the player parks a beacon facing the warehouse blink, the cone stays wide or is marked weak (shape: dashed, not a score).

Overlap **area** + **quality** decide accept:

| Result | Player-facing | Persist |
|---|---|---|
| Area too large or quality weak | Zone drawn but 郭工 will not take it. No scold | `c1.sourceZoneMarked` stays false |
| Area small enough | 「搜索區收到。先不要進閘後」 | `true` |
| Wide / fast (near + blocked or early accept) | Longer **confirm time** on the later map | Same flag |
| Far / tight (dangerous route, clearer LOS) | Shorter confirm time | Same flag |

Both strategies complete. **Not a score.** Map later shows different confirm time only.

### 7.3 Spatial beats

- Beacon 1: crane bridge. Drop → Tether recover.
- Beacon 2: **near + occluded** or **far + exposed**.
- 陳姨 radio: unmapped rain gate. This is **geometry**, not a quiz answer and not a third mandatory beacon.
- Handheld must remain carryable; losing the probe (shock) uses loadout recovery, does not delete placed beacons.

### 7.4 What triangulation is not

- Not confirmation of identity.
- Not cleanup.
- Not a player-entered unknown (`C1-S06` rover / 郭工).
- Not available while controls are failed.
- Not “three correct GPS pins.”

Rover path in `C1-S06` must match the accepted overlap, not a designer-hidden unique cell.

---

## 8. How the five systems compose

Evidence is seen / measured / carried. Claim is a **placement or action**. Consequence changes the world. Revision keeps the first failure.

| Beat | Lens | Tether | Rig | Docks | Tri |
|---|---|---|---|---|---|
| `P-S02` | Lie vs live | — | — | — | — |
| `P-S03` | — | Shape snap | — | — | — |
| `P-S04` | Find break | Reseat | — | — | — |
| `P-S05` | Flowing evac line | Lever | — | — | — |
| `W-S03` | Trace I→G→O | Smoke | Room-scale slots | — | — |
| `W-S04` | See sun cut | Fix joint | Model output | **Readability gate** | — |
| `C1-S01` | Env flow | Crates / cage | Triangle hunt | — | — |
| `C1-S02` | Self-test; evac lights | Carry home | Saturated | — | — |
| `C1-S03` | Shell inspect | External ports | Slots + faults | **Moon/sun then ?** | Unlock second entry |
| `C1-S04` | Live cones only | Beacons | Handheld third | Must already be readable | **Overlap claim** |
| `C1-S05` | — | Place demo unit | **Shape+sound** | — | — |
| `C1-S06` | Flow vs residue | Grate / rover / latch | Sealed; no contact | — | Zone already marked |
| `C1-S07` | — | Place monitoring **model** | Reporter limits spoken | History layers | Zone layer from history |

Hub after `P-S06`: two equal doors (河港 / 工作坊). Workshop skip does not change tool verbs, only language and whether dock **labels** appear.

---

## 9. Input, camera, accessibility

| Setting | Systems effect |
|---|---|
| Keyboard + mouse | All Critical Path verbs bound. No exclusive hold+precision combo without an alternative |
| `settings.holdAlternatives` | Pulse tap; tether toggle; assist snap |
| `settings.relaxedTimer` | `P-S05` loses hard 70 s fail. Same rescue, same evidence |
| `settings.reducedMotion` | Less camera punch. **Keep** advection, triangle fill, shape |
| Large subtitles | Task + one-line Codex scale. No essential text in world textures |
| Colour + shape + sound | Reporter rule. Colour-only is a **failed** Chen walk, not a skin |
| Safety line | Falls and water are recoverable. No HP Game Over |

Suggested default map (greybox; rebound in Settings): WASD move, mouse look, Space step-up already handled by motor, `E` interact / tether, `Q` or RMB lens, `F` seat / snap confirm, `Esc` pause. Third-person; camera eases on ladders **without** stealing control (`P-S01`).

---

## 10. Implementation notes (stack, not a rewrite)

- TypeScript strict, Vite, Three.js, **semantic DOM HUD**.
- No backend, no analytics. Worker must not store these flags.
- Prefer a small `SignalGraph` + `DeviceReadability` module over per-scene snowflakes.
- Author `LieClass` from data (kind, motion, occlusion, device). Designers place residuals; they do not tick “correct.”
- Probe, beacons, plates: real bodies with mass. Legacy TDD “no dynamic physics” is **retired** for Tether.
- Do not copy layouts, UI, VO, or tools from PEAK, R.E.P.O., Outer Wilds, Pacific Drive, Portal, or other cited games. Structure only (pulse, carry, hub-and-outing).
- Banned player fragments stay banned (`100%`, `完全安全`, `證實污染`, MerR/Pmer/dTomato, aptamer route). See `docs/claims/p0-claims.md` §8.

### 10.1 Suggested module split (when code exists)

| Module | Owns |
|---|---|
| `systems/flowLens` | Charge, pulse query, fade, battery, free first pulse |
| `systems/signalGraph` | Kinds, motion, occlusion, `LieClass` |
| `systems/tether` | Ray, mass, snap-by-shape, lock icon, recover |
| `systems/bioRig` | Slots, reporter channels, saturation, loadout, latch |
| `systems/docks` | Moon/sun/`?`, `unknownOpen`, runHistory append |
| `systems/triangulation` | Cones, overlap, accept, confirm-time metadata |
| `save/schema` | §1 paths only |

### 10.2 Later-chapter stubs

`player.tool.scanRange`, `player.tool.tetherStrength`, `player.tool.modules` beyond `"latch"`, and `world.factory.*` … `world.platform.*` stay in schema so C2+ can grow. P0 must not simulate factory, switch, data, recycling, supply, or access models.

---

## 11. Systems QA (P0)

Playable, not slideshow:

- [ ] `P-S02`: player who follows the brightest line is **wrong for one second**, then self-corrects. Live line still moves to the lock.
- [ ] Lens has direction, occlusion, battery, and at least one authored `dead_shine` per hunt space (`P-S02`, `C1-S01` warehouse, `C1-S06` residue).
- [ ] Tether: weight difference plate 1 vs 2; rotate; collision; fragile probe; drop recovery; shape snap (wrong colour-matched but wrong-shape socket will **not** seat if such a decoy exists).
- [ ] `W-S04` and `C1-S03`: `?` closed while positive control failed. Scan does not bypass.
- [ ] `C1-S02`: mission does not flip until turn **and** leave **and** kill env relay.
- [ ] `c1.controlsRestored` is the lock on second entry / triangulation.
- [ ] Dead shine and city light cannot shrink a confirm zone.
- [ ] Wide and tight overlaps both accept; confirm time differs; no score.
- [ ] Chen walk blocked until shape+sound **and** municipal update + timestamp.
- [ ] Reporter never colour-alone on the Critical Path after `C1-S01`.
- [ ] Failed first run still in `evidence.runHistory` and on the `C1-S08` wall.
- [ ] Workshop skip: no warning; docks icon-only; C1 legal.
- [ ] No red X, no card quiz, no developer-voice toast, no 100% UI.
- [ ] Player never samples, opens the shell into the unknown, releases a living system, or approves deployment.

---

## 12. Remaining gaps (honest)

| Gap | Path / owner |
|---|---|
| Runtime not implemented | Repo is docs-only as of this file. Modules in §10.1 are a split, not code |
| No named Science / Safety sign-off | Public efficacy / field-utility still blocked |
| Greybox feel numbers (§3.8, drain table) | Tune on school iGPUs; never promote to assay specs |
| Exact overlap-area threshold | Author in `C1-S04` blockout once the harbor mesh exists |
| Input rebinding UI | Settings exist in contract; widget not designed here |
| Chapters 2–Final tool growth (batch tracking, data-path lens, etc.) | Out of P0 |

---

## 13. What this delivery contains

| File | Purpose |
|---|---|
| `docs/design/p0-systems.md` | This file: lie-capable Flow Lens, Tether, sealed Bio-Rig, readability docks, triangulation, and the persist flags those systems write |

No player-facing UI and no runtime were added in this pass.
