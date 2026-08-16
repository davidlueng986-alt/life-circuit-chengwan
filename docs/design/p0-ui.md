# P0 HUD / UX Spec — 生命迴路：澄灣

| Field | Value |
|---|---|
| Document | `docs/design/p0-ui.md` |
| Role | UX / HUD designer spec for the 2026-08-15 game-first P0 |
| Version | `2026-08-15-p0` |
| Locale | Player-facing `zh-Hant`. This file is a production spec. Strings in **「」** are shippable copy unless marked internal. |
| Script authority | `Life_Circuit_Chengwan_Full_Game_Script_v1` (Game-first Rewrite, 2026-08-15) |
| Companions | `docs/delivery/p0-contract.md`, `docs/education/p0-learning.md`, `docs/claims/p0-claims.md`, `docs/safety/p0-boundaries.md` |
| Scope | Title + Hub, Prologue `P-S00`–`P-S06`, optional Workshop `W-S00`–`W-S05`, Chapter 1 `C1-S00`–`C1-S08` |
| Out of scope | Chapters 2–Final playable UI. Card / quiz chrome. Score, rank, persuasion, affinity. Canvas-drawn text. |

This file tells implementation **what is on screen, when, in which DOM node, and in whose voice**. It does not implement the game. It must not be pasted into the player HUD as a lecture.

The world carries meaning. The HUD only names the **next verb**. If a player can finish a scene by reading the HUD instead of looking at the gate, the orange lamp, the flowing pulse, or Chen’s walk, the HUD has failed.

---

## 0. Four chrome laws (P0 cannot ship if any fail)

These are UX acceptance, not flavour. They implement script appendix E and the player-copy rules.

| # | Law | Ship rule | Fail signal |
|---|---|---|---|
| U1 | **Task line = verb + object** | One line. Visible goal a new player can speak in 30s: 救人 / 開門 / 關閥 / 把物件帶回 / 逃離 / 找出方向. | 「了解訊號與控制的關係」。Lore. A paragraph. A glossary stem. |
| U2 | **Dialogue ≤ ~12s** | One script ID at a time. Soft cap **48** CJK, hard cap **64** or the recorded VO length, whichever is shorter. No stacked lecture cards. | Two IDs fused. A definition dump. A pause-the-world slideshow in `P-S00`–`P-S05`. |
| U3 | **Codex is optional** | Unlock **after** the matching action. One closable line. Never a door, never a grade, never required reading. | Locked harbor until the player opens Codex. Exam recap. Unlocked terms before the verb. |
| U4 | **No score, no persuasion meter** | Growth is tools, Hub furniture, NPC memory, harbor geometry, and `evidence.runHistory`. | Stars, %, 知識值, 好感, 誠實／不誠實 bar, saint/villain needle, “scientific accuracy” points. |

Also hard, because they are how the four laws leak:

| ID | Rule | P0 encoding |
|---|---|---|
| `U-DOM` | All readable UI is **semantic DOM**, never canvas text. | `#world` is WebGL only. Task, subtitles, prompts, meters-as-status, pause, settings, Codex, workbenches, public-map chrome are HTML. |
| `U-VOICE` | No developer-voice in player UI. | Ban 「完成練習不代表……」「本章涉及……」「這不是……指引」「這是教學故事」. |
| `U-FAIL` | No red-X fail screens. | Rope, mist wipe, cable return, locked `?`, 「目前沒有資料圖層」. Progress that was real stays. |
| `U-COPY` | Terms appear **after** the player operates the phenomenon. | Living phrases if workshop skipped. Codex last. |
| `U-SHAPE` | No colour-only Critical Path. | Reporter = fill / shape / short sound. Battery = ring, not a red/green lamp. |
| `U-SIM` | Readouts are `TEACHING_SIMULATION`. | Relative 低／中／高／波動. No LOD, µg/L, 100% 準確. Mark **教學模擬** on a still readout that could be cropped as lab data — that readout only. |
| `U-CITE` | Borrow structure, not chrome. | Do not copy PEAK / R.E.P.O. / Outer Wilds / Pacific Drive / Portal (or any cited game) layouts, waypoints-as-answers, VO cadence, or HUD skins. |

---

## 1. Authority and conflicts

When this file, the script, or another P0 doc conflict:

1. Named team Science / Safety / Privacy / Child-safeguarding / Education sign-off *(none present as of 2026-08-15)*.
2. New full script `Life_Circuit_Chengwan_Full_Game_Script_v1`.
3. Legacy `20_SOURCE_AND_CLAIM_REGISTER.md` **safety and claim wording only**.
4. This HUD spec for **layout, timing, focus, and chrome behaviour**.
5. Legacy GDD / TDD UI notes **only if they do not conflict** with (2) or with `p0-contract.md`.

**Retired for this file:**

- Card slots, PRE lecture frames, Evidence / Claim / Consequence **cards**.
- Permanent chapter watermark 「教學故事」 or `science.limit.notMeasurement`.
- Knowledge score, overclaim score, persuasion / honesty meters, affinity numbers.
- React/Next lecture shell as a required runtime. P0 HUD is **semantic DOM** over Three.js. A later small view library is allowed if landmarks, focus, and live regions stay native.
- Full 2D quest clone. WebGL fail → DOM 「無法啟動 3D」 + Settings, not a silent canvas.
- Copying a cited game’s subtitle bar, ship-log, car garage tablet, or portal-chamber helper captions.

Player-facing science sentences must stay inside `docs/claims/p0-claims.md`. This file may **place** those sentences. It may not raise certainty, add units, or invent analyte names.

---

## 2. How the HUD is allowed to speak

| Surface | Job | Voice | Must not |
|---|---|---|---|
| **Task line** | Name the next **verb + object** | Field-runner. Imperative. No subject. | Teach a noun. Recite a rubric. List three goals. |
| **Interaction prompt** | Name the **current** verb + highlighted object | Same as task, shorter | A control diagram. “Press E to learn about DNA.” |
| **Dialogue / subtitles** | Want, danger, conflict, evidence, next step | In-character. Radio vs body. | Definitions, scoring criteria, safety SOP, developer aside |
| **World objects** | Evidence, claim, consequence | Shape, motion, sound, furniture | A floating encyclopedia |
| **Tool chrome** | Battery, charge, grab validity | Rings, ticks, pose ghosts | Textbook tooltips on first pickup |
| **Workbench / public map** | Settings that **are** the claim | Icons first; terms after the matching flag | Honesty cards. Fake layers that open as truth |
| **Codex** | Optional one-line name **after** the verb | Closable glossary | Gate, quiz, unread badge score |
| **Recap** | Three player-caused facts | Neutral inventory of world change | Grade, stars, “你理解了 control” |
| **Settings** | Access tools | Plain instrument names | “Easier science” / “beginner biology” |

Characters speak. The HUD does not praise. No 「太棒了！你理解了……」 after a snap.

---

## 3. Stack, tree, and layers

### 3.1 Runtime

| Piece | Rule |
|---|---|
| World | Three.js canvas `#world`. No `fillText`, no CSS-3D text that is the only readable copy. |
| HUD | Semantic HTML in `#hud`, sibling of the canvas, pointer-events none except on real controls. |
| Overlays | `<dialog>` for Pause, Settings, Codex, WebGL-fail. One modal at a time. |
| Workbenches | DOM panels **anchored to a world table** (`C1-S00` loadout, `C1-S03` docks, `C1-S05` reporter desk, `C1-S07` map). They are not a second video-game. |
| Save | `localStorage` key `life-circuit-chengwan.save.v1`. No accounts, chat, analytics, PII fields. |
| Locale | `zh-Hant` only for P0 Critical Path. |

### 3.2 Suggested tree

```html
<div id="app">
  <canvas id="world" aria-label="澄灣三維場景"></canvas>

  <div id="hud">
    <h1 id="task-line" class="hud-task" aria-live="polite"></h1>
    <div id="tool-cluster" hidden>
      <div id="lens-battery" role="meter" aria-valuemin="0" aria-valuemax="100"
           aria-valuenow="100" aria-label="透鏡電量"></div>
    </div>
    <p id="interact-prompt" hidden></p>
    <aside id="dialogue" aria-live="polite" aria-atomic="true" hidden>
      <p class="dialogue-speaker"></p>
      <p class="dialogue-line"></p>
    </aside>
    <p id="hud-live" class="visually-hidden" aria-live="polite"></p>
  </div>

  <dialog id="pause" aria-labelledby="pause-title"></dialog>
  <dialog id="settings" aria-labelledby="settings-title"></dialog>
  <dialog id="codex" aria-labelledby="codex-title"></dialog>
  <dialog id="webgl-fail" aria-labelledby="webgl-fail-title"></dialog>
</div>
```

Do **not** duplicate the 3D world as a hidden DOM walkthrough. Mirror only: current task, current interactable, open workbench, and (if `settings.interactionList`) a short list of **in-range** verbs.

### 3.3 Layer order (back → front)

| Z | Layer | Pointer | Notes |
|---|---|---|---|
| 0 | `#world` | Gameplay | Destination, SOS lamp, pulses, furniture. |
| 1 | `#hud` persistent | None | Task + battery + prompt. Keep the **center third** of the frame empty. |
| 2 | `#dialogue` | None (advance is the gameplay interact) | Bottom band. Large type. |
| 3 | World-anchored workbench | Yes | Only while the player is at that table. |
| 4 | `<dialog>` | Yes, trapped | Pause / Settings / Codex / fail-to-boot. |
| 5 | `#hud-live` | None | Screen-reader / polite status. |

QA debug HUD is a sixth layer, **dev builds only**, never in the public greybox skin.

### 3.4 Layout tokens (original; do not skin a cited game)

| Token | P0 value |
|---|---|
| Safe inset | `max(24px, env(safe-area))` |
| Task | Lower **left**, max 22em, 1 line, 1.15 line-height |
| Prompt | Lower **center**, 1 line, fades if unused 4s |
| Dialogue | Lower third, max 36em, speaker above line |
| Battery ring | Lower **right**, 40–48px, no caption on first pickup |
| Type | Self-hosted or documented CJK system stack. No essential word in a PNG. |
| Focus | 3px solid, offset 2px, never colour-only |
| Motion | 200ms fade on task change. Reduced-motion: opacity only, keep pulse **direction** in world |

Primary play target: **1024×600 and up**. Below that, or WebGL fail: do not silently letterbox a broken canvas. Show `webgl-fail` or a “需要更大視窗” DOM, plus Settings.

200% page zoom must not clip the task line or the dialogue speaker. Workbenches become a full-height sheet.

---

## 4. Task line

### 4.1 Grammar

```
task := verb + object
verb := 到 | 推開 | 爬上 | 拾起 | 對準 | 跟隨 | 壓回 | 抓取 | 扣進 | 找出 |
        跑到 | 按住 | 走進 | 打開 | 換上 | 修好 | 帶回 | 標出 | 讓…再走 |
        開門送入 | 撤離 | 放上
```

Rules:

- One line. Prefer **≤ 12** CJK. Hard cap **18**.
- No clause after a comma. No “以便理解…”.
- Update on **mission flip**, not on every hint.
- Always mounted when the player has control. Empty string only on Title, sit-down `P-S06`, and montage `C1-S08`.
- `aria-live="polite"` on change. Do not shout every proximity hint.
- After 10s the line may drop to 80% opacity. It never disappears while the goal is live.
- **No compass, no sticky world-space objective marker that is the answer.** Destination is a visible object (gate, orange lamp, white pulse, table). Structure borrowed from “see the peak”; chrome is ours.

### 4.2 Scene strings

Use these IDs. Do not paraphrase into a lesson.

| ID | When | Task line | Must not become |
|---|---|---|---|
| `BOOT-S00` | Menu | *(empty)* | 「開始你的合成生物學旅程」 |
| `HUB-S00` | After `P-S06` | `走到中央桌` | 「選擇學習模組」 |
| `P-S00` | Control granted | `到防洪控制室` | Character bios. Content warning crawl. |
| `P-S01` | At dead lift | `推開工具箱` | — |
| `P-S01` | Crate clear | `爬上維修梯` | — |
| `P-S02` | Tool on table | `拾起桌上的透鏡` | 「這是 Flow Lens，用於……」 |
| `P-S02` | Lens in hand | `對牆放出脈衝` | Battery definition |
| `P-S02` | After first pulse | `跟隨會流動的線` | 「找出正確答案」 |
| `P-S02` | At loose relay | `壓回鬆脫的接頭` | 「正確！」 |
| `P-S03` | Bridge out | `抓取牆上的連接工具` | Physics lecture |
| `P-S03` | Tether held | `把板扣進形狀座` | 「扣進藍色座」 as the only cue (script sockets are **shape**) |
| `P-S04` | In control room | `找出訊號斷點` | 「組合 input 與 output」 |
| `P-S05` | Evac starts | `跑到救援平台` | Quiz timer chrome that looks like a test |
| `P-S05` | At lift | `按住升降開關` | — |
| `P-S06` | Sit-down | *(empty)* | Score recap |
| `W-S00` | Enter | `走進細胞模型` | 「背出 cell 的定義」 |
| `W-S00` | Exit frames | `依序對準三個放大框` | A/B/C/D |
| `W-S01` | RNA exists | `把 RNA 引到下一站` | 「完成 transcription 測驗」 |
| `W-S02` | Fold done | `把 protein 放進門鎖` | Label-matching |
| `W-S03` | First beat | `打開煙霧模擬器` | — |
| `W-S03` | Smoke on | `追蹤訊號` | — |
| `W-S03` | After trace | `換上形狀旗` | Colour-only lamp as the pass |
| `W-S04` | Docks up | `先跑月亮和太陽` | 「先選 negative control」 before icons are lived |
| `W-S04` | Sun failed | `修好太陽接頭` | Open-shell recipe |
| `W-S04` | Refs valid | `再解讀問號` | — |
| `W-S05` | Replay | *(empty or)* `看完這次循環` | DBTL password |
| `C1-S00` | At table | `選一件裝備` | Moral test copy |
| `C1-S00` | Loadout set | `帶探頭去東岸` | 採樣瓶 / A-B-C-D |
| `C1-S01` | In harbor | `找出訊號方向` | 「確認污染源」 |
| `C1-S01` | Record ready | `把紀錄帶回` | — |
| `C1-S02` | Saturated | *(keep hunt until 3 tests)* then `把探頭帶回流動站` | 「繼續量河水」 |
| `C1-S03` | Docks | `先證明月亮暗、太陽亮` | 「100% 準確」 |
| `C1-S04` | Second entry | `標出可進入的範圍` | 「找出紅點」 |
| `C1-S05` | Walk starts | `讓陳姨再走一次` | Honesty cards |
| `C1-S05` | Bench open | `改輸出，寫下一步` | — |
| `C1-S06` | At sluice | `開門送入無人車` | 「進閘採樣」 |
| `C1-S06` | Rover in | `撤離` | — |
| `C1-S07` | Map | `打開發布圖層` | 「宣布全河安全」 |
| `C1-S07` | Layers done | `放上一種監測模型` | Saint vs villain labels |
| `C1-S08` | Montage | *(empty)* | Grade |
| `C2-STUB` | Hatch | `尚未開放` | Fake load into a factory |

Workshop leave does **not** change these strings into 「先完成基礎再去河港」.

### 4.3 Mission flip (must be HUD-visible)

| Flip | Old line | New line | World that sells it |
|---|---|---|---|
| `C1-S02` after turn + leave + kill-relay | `找出訊號方向` | `把探頭帶回流動站` | Self-test icon blinks on the **probe**, not a red-X toast |
| `P-S05` gate up | `找出訊號斷點` | `跑到救援平台` | Platform slips, white pulse in the new corridor |
| `C1-S03` moon+sun valid | `先證明月亮暗、太陽亮` | `再解讀問號` | `?` dock unlatches |
| `C1-S06` rover through | `開門送入無人車` | `撤離` | Water at the yellow line |

Do not flip `C1-S02` until the three spatial tests have actually been tried. The HUD must not leak the answer by switching early.

---

## 5. Dialogue and subtitles

### 5.1 Timing

Script: a single spoken line in action is **about 12 seconds**. HUD contract:

| Rule | Value |
|---|---|
| Queue | One `Line ID` visible. Next ID waits. |
| Soft length | 48 CJK recommended for new write |
| Hard length | 64 CJK **or** VO duration, whichever ends first |
| No-VO fallback | `clamp(2500ms, 220ms × chars, 12000ms)` |
| Skip | Gameplay interact after 400ms. Hold to keep the card. |
| Gameplay | `P-S00`–`P-S05`, harbor hunts, evacs: **do not steal the camera or freeze locomotion** |
| Sit-down | `P-S06`, `W-S05`, `C1-S08` may hold a longer listen; still one ID at a time |
| Triggered hints | `P-S00-D002` (wrong way 3s), `P-S00-D003` (idle 12s) are **radio**, not pop quizzes |

Do not concatenate `C1-S00-D003` and `D004` onto one card. Do not add a HUD footnote under a character line.

If a **script** line is slightly longer than 48 CJK, **the script wins**. Do not rewrite it in this HUD pass. Do not “help” by appending a definition.

### 5.2 Chrome

| Element | Spec |
|---|---|
| Speaker | Short name: `小岑` `方雅` `林博士` `陳姨` `阿哲` `郭工` `何主任` |
| Channel | Radio = small antenna glyph **plus** the word `無線電` in `aria-label`. In-person = no glyph. |
| Type | Scales with `settings.subtitleScale` (`1` / `1.25` / `1.5` / `2`). Default large enough for a classroom projector: treat `1` as already “readable at 2 m”. |
| Contrast | Text on a translucent plate. Plate never covers the **destination third** of the frame. |
| Colour | Speaker colour is decoration. Shape (radio glyph / none) + name string carry identity. |
| Reduced motion | Instant appear/disappear. No punch-in. |

Banned under the line: source citations, claim IDs, `TEACHING_SIMULATION` lectures, “press F to pay respects” jokes, praise spam.

### 5.3 First-term popover (not Codex, not a lecture)

Script: the **first** time a term is named after the matching action, attach **one closable sentence**.

| Behaviour | Spec |
|---|---|
| Who writes it | Only the approved one-liner in `docs/claims/p0-claims.md` §7 |
| Where | A chip above the subtitle, speaker still owns the VO |
| Close | Click / Esc / 4s idle. Never blocks a door. |
| Skip | If `workshop.complete === false`, C1 uses living phrases and **does not** force `promoter` chips |
| Latch | `C1-S06` latch is shown as a **slot that holds a step**. No formal name chip in P0 |

This chip is optional reading. It is not the Codex panel and not a quiz.

---

## 6. Interaction prompts and camera

### 6.1 Prompt grammar

Same law as the task line: **verb + object**.

Examples: `推開 工具箱` · `拾起 透鏡` · `抓取 維修板` · `扣入 月亮槽` · `放下 探頭`.

Show bind glyphs for keyboard **and** mouse (`F` / `滑鼠左鍵`) from the current map. `settings.holdAlternatives === true` replaces hold-to-charge / hold-to-lift with tap-to-toggle.

Multiple overlaps: one current target. `Q` / `E` or wheel cycles. Prompt shows `1/2`. Critical Path must remain completable from the keyboard.

### 6.2 Holds, aims, assists

| Action | Default | Alternative (`holdAlternatives`) | Assist |
|---|---|---|---|
| Flow Lens charge | Hold, release pulse | Tap start / tap release | First `P-S02` pulse free |
| Lift switch `P-S05` | Hold until 小岑 rises | Toggle on, stay in trigger volume | Relaxed timer: no hard fail |
| Tether rotate | Mouse move + key | Q/E 15° steps | Near-correct pose auto-snap if assist on |
| Precise aim (workshop frames) | Look-at | Cycle frames from the interaction list | Cone is generous |

Do not require mash. Do not require pixel-perfect aim on a classroom trackpad.

### 6.3 Camera

Third-person, over-shoulder. `P-S01` ladder: ease-in, **control stays**. `P-S05` water: stay behind the player; no drown cam.

`settings.reducedMotion`: cut camera punch, shake, and FOV kicks. **Keep** pulse travel and triangle fill — those are information.

`settings.fov` is a slider. `settings.vibration` off is available.

Fall recovery (`P-S00`, `P-S03`, `P-S05`): 1.2s safety line. No “YOU DIED”, no red full-screen X, no checkpoint lecture.

---

## 7. Tool chrome

Tools teach by use. HUD is status, not a manual.

### 7.1 Flow Lens

| State | Visible | Hidden |
|---|---|---|
| On table `P-S02` | World object, one round button | Nameplate essay |
| First pulse | Charge in the **world** (button depress, short ring grow) | Battery ring |
| After first pulse | Lower-right **ring**. Fill = charge. Gap = recovery | The words 「電量」「battery」「掃描範圍 12 m」 |
| Hold longer | Ring thins as range grows; recovery tick lengthens | A numeric metre |
| Occlusion / dead shine | World: live line **moves**; dead-bright **fades in 1s** | A green “correct path” stamp |
| Distortion | Broken device / background / wet joint warps the pulse | “Hg = …” |

`role="meter"` `aria-label="透鏡電量"` may exist for AT after the first pulse. Visible caption stays off.

Lens is **not** an answer highlighter and not a permanent wallhack.

### 7.2 Tether

| Cue | Form |
|---|---|
| Valid grab | Reticle becomes a hook **shape** (not only a colour change) |
| Too heavy | Strain ticks + slower rotate. No red X |
| Drop | Cable returns the plate / beacon. Prompt: `再抓一次` |
| Shape socket | Ghost of the **socket silhouette** in world, not a colour wash |
| DNA grab `W-S01` | Lock **icon** on the tether end. No damage number |
| Fragile probe | Hit flash + brief offline. Shell loadout skips this. Battery loadout: `接到牆上電源` |

No 2D card-drag substitute on the Critical Path.

### 7.3 Sealed Bio-Rig / sealed probe

Three **world** slots: 感測 / 調控 / 輸出 as shapes. Names appear after the matching action (or living phrases if workshop skipped).

| Readout | Legal | Illegal |
|---|---|---|
| Harbor reporter | Triangle **fill** + density of pulses + optional short tick | Red / green only |
| Dock moon | Low / dark + moon **glyph** | 「negative control」 before the docks are run, unless `workshop.complete` |
| Dock sun | High / bright + sun **glyph** | 「100% 準確」 after repair |
| Dock `?` | Mid + **fluctuation**; closed while sun is wrong | Open while positive control failed |
| Post-repair `C1-S03` | Two control states + **session clock** | LOD, T90, validated, 已校準 |
| Still frame that looks like a lab plot | Tiny `教學模擬` on **that** graphic | Chapter-long watermark |

Self-test (`C1-S02`): an icon **on the probe** blinks. Mission flips to bring the whole unit home. No blame toast.

External ports only. No open-shell UI, no sequence editor, no media recipe.

---

## 8. Codex (optional)

Codex is a **field notebook**, not a course.

| Rule | Spec |
|---|---|
| Open | Pause → `詞彙` if at least one term is unlocked. Optional hotkey. Never auto-forced |
| Empty | If zero terms: the button is **absent**, not grey with 「未合格」 |
| Entry | Approved one-liner from `p0-claims.md` §7. One paragraph max |
| Unlock | After the matching persist flag (`codex.cell`, `codex.controls`, …) |
| Skip workshop | C1 remains legal. Formal chips wait until `C1-S03` actually names controls |
| Close | Esc. Returns to the world, not to a quiz |
| Search / exam | None |
| Named parts | No `MerR` / `Pmer` / `dTomato` / aptamer route as entries in P0 |

P0 unlock table (after action only):

| Flag | Show title | Body (do not rewrite) |
|---|---|---|
| `codex.cell` | 細胞 | 細胞是有邊界的生命單位；你剛走進的是放大模型。 |
| `codex.dnaGene` | DNA／gene | DNA 是保存資訊的長軌。gene 是其上可被使用的一段，不是另一條東西。 |
| `codex.transcription` | transcription | 細胞沿 DNA 讀取，做出一份可帶走的 RNA；DNA 留在原位。這步叫 transcription。 |
| `codex.translation` | translation | 細胞按 RNA 的資訊製作 protein，並折成能做事的形狀。這步叫 translation。 |
| `codex.input` | input | Input 是裝置感到的條件；感測把它變成內部訊號。 |
| `codex.regulator` | regulator | Regulator 依感測結果，改變下游能不能通過。 |
| `codex.promoter` | promoter | Promoter 是決定下游資訊何時被使用的閘門。 |
| `codex.reporter` | reporter | Reporter 把系統狀態變成可見、可聽或可摸的 output；它不自動說出輸入的全部細節。 |
| `codex.output` | output | Output 是系統對外顯示的結果；換顯示方式不必等於換了感測邏輯。 |
| `codex.controls` | control | Negative control 應保持低輸出；positive control 應給出高輸出。它們判斷這次運行能不能讀。 |
| `codex.validRun` | 可解讀的運行 | 已知暗與已知亮都正確時，未知結果才有意思。Positive 失效時，未知不可讀。 |
| `codex.screening` | 篩查 | 篩查用來縮小搜索範圍。身分、影響範圍與清理要另走確認與權責流程。 |

`replicate`, biosafety/biosecurity courses, and pilot/no-pilot are **not** P0 Codex exams. Stubs stay out of the openable list.

QA flags (`evidence.controlRunBeforeClaim`, …) **never** appear as Codex stamps or badges.

---

## 9. Title, Pause, Settings, Hub

### 9.1 `BOOT-S00`

First play: **no lore wall**. Black rain, metal, cut radio → `P-S00`. Title card **生命迴路：澄灣** waits until `P-S06`.

Returning play (`meta.hasSave`):

| Control | Label | Notes |
|---|---|---|
| Continue | `繼續` | Load `life-circuit-chengwan.save.v1` |
| New | `重新開始` | Confirm: `會覆蓋本機進度。確定？` — not a lecture |
| Settings | `設定` | §9.3 |
| — | — | No login, no school field, no photo, no “enter your name” |

WebGL fail dialog:

- Title: `無法啟動 3D`
- Body: `這個瀏覽器沒有可用的立體畫面。可改用其他瀏覽器，或檢查硬體加速。`
- Actions: `設定` / `重試`
- Do **not** ship a full 2D quest clone in P0.

### 9.2 Pause

| Item | When | Label |
|---|---|---|
| Resume | Always | `繼續` |
| Settings | Always | `設定` |
| Codex | ≥1 term unlocked | `詞彙` |
| Leave workshop | On a workshop **safe platform** | `離開工作坊` — writes `workshop.resumeScene`, **no** qualification warning |
| Return to Hub | After `hub.unlocked`, not during `P-S00`–`P-S05` crisis | `回到研究站` |
| — | — | No restart-as-punishment. No “you will lose your grade” |

Pause ducks audio (see legacy TDD bus if useful). Focus to the heading, trap, restore to the trigger.

### 9.3 Settings (access tools, not lessons)

Persist with the contract fields. Labels are instrument names.

| Persist | Label | Effect |
|---|---|---|
| `settings.relaxedTimer` | `寬鬆時間` | `P-S05` loses the hard 70s fail. **Same story.** Do not subtitle this as 「簡易科學」 |
| `settings.reducedMotion` | `減少動態` | Less camera punch. Pulses and fills stay readable |
| `settings.subtitleScale` | `字幕大小` | `標準` / `大` / `更大` / `最大` |
| `settings.fov` | `視野` | Slider |
| `settings.vibration` | `震動` | Off available |
| `settings.holdAlternatives` | `點按代替長按` | Holds and fine aim |

Recommended extra persists (add to save if implemented; they do not change science):

| Persist | Label | Effect |
|---|---|---|
| `settings.textScale` | `介面文字` | Task + menus scale independently of subtitles if needed |
| `settings.highContrast` | `高對比` | Plates go opaque; world brightness stays playable |
| `settings.interactionList` | `列出可互動物件` | DOM list of in-range verbs |

No setting rewrites a valid run, deletes `runHistory`, or opens the unknown dock early.

Privacy: Settings never asks for name, school, health, or location.

### 9.4 `HUB-S00`

Walkable floor. **World labels** on physical entries, equal dignity:

| Door | Label | HUD on approach |
|---|---|---|
| Harbor | `去河港` | Prompt: `進入河港` |
| Workshop | `試一次微觀工作坊` | Prompt: `進入工作坊` or `回到工作坊` if `workshop.resumeScene` set |
| C2 hatch if visible | `停線（未開放）` | Honest stub. 何主任 radio from `C1-S08` may play. **No** factory load |

Skip workshop: **no modal**, no 「不建議」, no 「缺少資格」. `workshop.complete` stays `false`.

After C1: far-view matches `world.harbor.monitoringModel`. Station wall keeps the first failed run as furniture, not as a trophy score.

---

## 10. Scene chrome notes (P0 only)

### 10.1 Prologue 黑水線

Chapter HUD promise: destination visible without reading. **Zero biology terms** before the `P-S06` title card.

| Scene | Chrome on | Chrome off |
|---|---|---|
| `P-S00` | Task `到防洪控制室`. 小岑 orange SOS every 3s in **world**. | Bios, world bible, content-tip card |
| `P-S01` | Interact + climb prompts | Timer, enemy radar |
| `P-S02` | Free first pulse. Then battery **ring** | Definition tooltip |
| `P-S03` | Shape ghosts, wind tug in world | Colour-only sockets |
| `P-S04` | Task `找出訊號斷點`. Audio layers per fix | 「正確」 toast |
| `P-S05` | Standard: a **world water line** + optional quiet clock. Relaxed: **no** countdown | Death screen. Reset of completed tethers |
| `P-S06` | Title card `生命迴路：澄灣`. Then Hub | End-of-level stars |

`P-S05` clock, if shown, is a **storm clock**, not a test score. Place it near the battery ring. Shape: emptying arc, not a red X at 0. On fail: mist wipe, 方雅 lock, restart at corridor, line returns to `跑到救援平台`.

### 10.2 Workshop 微觀工作坊

Optional. Leave control on every safe platform.

| Scene | Special chrome |
|---|---|
| `W-S00` | Scale handle is a **world** lever. Exit = aim three frames in order. No multiple-choice. |
| `W-S01` | DNA lock icon on illegal grab. Wrong station: RNA glow keeps pointing. No red X. |
| `W-S02` | Shape lock. RNA physically does not fit. |
| `W-S03` | First run dark (no smoke). Flag swap must change **shape**, not only hue. |
| `W-S04` | Icons first (moon / sun / `?`). Small words negative / positive only if `workshop` is already teaching them **after** the second run. `?` stays shut while sun is wrong. |
| `W-S05` | Desk replay. Codex may unlock. Name is not a password. |

### 10.3 Chapter 1 紅色警報

30s goal the player can say: 找出警報方向，讓確認隊有路可走.

#### Loadout (`C1-S00`)

Two **physical** objects on the table. Pick one. Not a shop. Not a moral meter.

| Object | Prompt | HUD after pick |
|---|---|---|
| Spare battery | `帶上備用電池` | Later: extra pulses; evac lift exists |
| Crash shell | `帶上抗撞外殼` | Later: probe survives shock; shorter carry |

Both complete the chapter. Do not stamp 「較佳選擇」.

林博士 line forks on `workshop.complete` (`D003` vs `D003A`). HUD does not display the fork.

#### Hunt (`C1-S01`)

Triangle fill lives on the **probe**. Rotate the body; density is the verb. Distant warehouse blink is city light — do not attach a quest marker to it.

Fish / smell / oil: if any note is written, it is an **observation** chip in the world log, never 「污染證據」.

#### Saturation (`C1-S02`)

Do not pop 「invalid run = definition」. Keep the hunt task until the three tries. Then flip. Evac uses loadout route (lift vs carry) without scoring it.

#### Controls (`C1-S03`)

Workbench DOM at the van:

| Row | After valid pair |
|---|---|
| 月亮 | `低` + moon glyph |
| 太陽 | `高` + sun glyph |
| 本次運行 | session clock |
| 問號 | unlocked; `中、波動` |

Never `100%` / `已校準` / `validated`. First fail remains a **row that cannot be deleted**.

#### Beacons (`C1-S04`)

Overlap is **world geometry**. HUD may say `交疊還不夠小` or `範圍已可交給確認隊`. Confirm-time difference is a **map annotation**, not +10 science points. Wide/fast and far/tight both dismiss the task.

#### Chen walk (`C1-S05`)

Playable usability test. Bench has **three settings that generate the public message**. No honesty dialogue cards.

| Setting | Player-facing label | Pass value | If missing (world, not a scold toast) |
|---|---|---|---|
| Visible output | `顯示方式` | Shape + short sound (`shape_audio`) | 棚下只剩一團暗紅 |
| Action | `下一步` | Concrete: 離開封鎖區，查看市政更新 | NPCs guess whether to leave or stop using water |
| Update | `誰更新、何時` | Municipal board + **timestamp** | 陳姨 will not call it usable |

Second walk must use the revised prototype. Task stays `讓陳姨再走一次` until both persist fields write.

Public message preview on the bench **must** show four slots (script E / `P0-COMM-001`):

`目前看見` · `仍不知道` · `誰在確認` · `何時更新`

#### Finale (`C1-S06`)

Latch is a **memory slot** that stays lit across brownouts. No formal name. Player never gets a “enter the unknown” prompt.

#### Public map (`C1-S07`)

Large 3D harbor map. Layers **are** `evidence.runHistory`.

| Layer | Opens if | Character line (one, then hush) |
|---|---|---|
| First invalid run | `c1.invalidRunExperienced` | 方雅 / 阿哲 keep the fail on the same page |
| Controls restored | `c1.controlsRestored` | 林博士: output ≠ every unknown |
| Overlap zone | `c1.sourceZoneMarked` | 郭工: range, not a red dot |
| Confirmation route | rover in | 郭工: identity waits on the lab |
| Waiting lab result | always after finale | Unresolved, not a failure |

Attempt `全河安全` or `已完成清理`:

- Interface: `目前沒有資料圖層`
- No scold, no red X, no lecture
- Do not open a green river

Monitoring claim = **place a physical model** on the map:

| Model | World consequence | HUD must not say |
|---|---|---|
| `固定站` | Attended kiosk; far zones on patrol | 「比較科學」 |
| `流動套件` | Numbered kits, racks, training marks | 「比較有愛心」 |

Both keep 陳姨’s stop control and a public board.

#### Recap (`C1-S08`)

Not a grade. Three facts the player caused:

1. `你修復 controls 後才重新解讀未知訊號。`
2. `陳姨的試走令 reporter 增加形狀、聲音和更新責任。`
3. `你選擇的監測模式已改變河港設施。`

First fail stays on the station wall as `令設計改變的事件`. C2 radio hook is story, not a score unlock.

---

## 11. Failure, empty, and refuse states

Every refuse is **readable and reversible**. None are a red X.

| Event | Player sees | HUD line |
|---|---|---|
| Fall | Safety line, 1.2s | Task unchanged |
| Plate / beacon drop | Cable return | `再抓一次` |
| Bright-dead pipe | Line dies in 1s | Task stays `跟隨會流動的線` |
| Water-first `P-S05` | Mist wipe, corridor restart, tethers kept | `跑到救援平台` |
| Probe shock (battery) | Offline, wall outlet glows | `接到牆上電源` |
| Saturated probe | Same fill every facing, then self-test | Flip after 3 tries |
| Failed sun dock | `?` physically shut | `先證明月亮暗、太陽亮` |
| Fake map layer | Quiet empty | `目前沒有資料圖層` |
| C2 hatch | Signage | `尚未開放` |
| Missing Chen setting | Visible street confusion | Stay on `改輸出，寫下一步` |
| WebGL fail | DOM dialog | `無法啟動 3D` |
| Corrupt save | Recover / start new. No upload | `本機進度讀不到。可重新開始。` |

Do not blame the player for a failed tool. Do not play a buzzer sting as “wrong answer”.

---

## 12. Accessibility (learning access)

| Setting / rule | HUD implication |
|---|---|
| Relaxed timer | Hide countdown pressure. Story identical. Not a “biology easy mode” badge |
| Reduced motion | No camera punch; **do not hide flow** |
| Colour + shape + sound | Already the reporter rule. Colour-only **fails** Chen’s walk |
| Keyboard + mouse | Entire Critical Path. Interaction list optional |
| Large subtitles | Dialogue **and** first-term chips scale |
| Hold / mash / aim alternatives | See §6.2 |
| Workshop skip | Silent, dignified. Access, not a certificate |
| Screen readers | Task, prompt, dialogue, meters, dialogs. Honest limit: full 3D spatial nav is **not** claimed |
| Focus | Visible. One modal. Restore on close |
| Contrast | High-contrast setting thickens plates; glyphs stay |

Colour-vision: moon / sun / `?` / triangle / flag must remain distinct in greyscale.

---

## 13. Privacy, input, and what never appears

| Never on a P0 surface | Why |
|---|---|
| Name, school, health, photo, voice, GPS fields | Privacy. Save JSON must not contain them |
| Chat, accounts, leaderboards | Out of scope |
| Analytics beacons, Web Analytics | Contract |
| Knowledge %, stars, ranks | U4 |
| 好感 / 說服 / 誠實 meters | Stakeholders are not a score |
| Sample vials, diagnose button, 批准部署 | Role + safety |
| `100%` 準確, `完全安全`, `零風險`, `證實污染`, `即時檢測`, `準確濃度`, `可現場部署` | Claim lint |
| `MerR` `Pmer` `dTomato` `Hg²⁺` as HUD labels | Not a password |
| Developer disclaimers | World rules instead |
| Cited-game UI chrome | Structure only |

Key binds (defaults; remapping is P1 unless cheap):

| Action | Keyboard | Mouse |
|---|---|---|
| Move | WASD | — |
| Look | — | Move |
| Interact / advance line | `F` | Left |
| Lens charge | `R` hold | Right hold |
| Tether | `Q` | — |
| Cycle targets | `Z` / `X` | Wheel |
| Pause | `Esc` | — |
| Codex (if unlocked) | `Tab` | Pause menu |

Show glyphs in prompts. Do not teach them in a five-page manual.

---

## 14. Audio that the HUD depends on

| Bus | HUD coupling |
|---|---|
| Voice | Subtitle duration follows VO when present |
| Reporter | Short tick / two-tone for high vs low — **never** colour alone |
| Chen pass | Shape **and** a short sound on the street unit |
| Pulse | Directional whoosh in world; reduced-motion keeps a visual travel |
| Fail | No “wrong buzzer”. Mechanical clicks, water, valve hiss |
| Pause | Duck music / SFX; voice stops |

Boot is silent until the first explicit click (`audio.resume()`). If blocked, a quiet `開啟聲音` control on Title / Pause — not a legal disclaimer.

---

## 15. Copy lint (HUD + subtitles + Codex + signs)

Reuse `p0-claims.md` §8. Extra HUD-specific bans:

| Pattern | Replace with |
|---|---|
| 「學習目標：理解 control」 | Task `先證明月亮暗、太陽亮` |
| 「本章你將……」 | Nothing. Start the rain |
| 「錯誤：請選擇正確選項」 | World refuse (§11) |
| 「科學分數 +10」 | World change |
| 「陳姨好感上升」 | She walks the new alarm |
| 「你已合格，可以去河港」 | Two equal doors |
| Green check as the only pass | Gate rises / dock unlatches / Chen’s second walk succeeds |
| Waypoint diamond on the warehouse | Pulse density in the player’s hands |

Writer checklist (from Education, HUD-owned):

- Task = verb + object.
- Name a term only after this save has operated it, or use the living short phrase.
- Public UI splits 目前看見 / 仍不知道 / 誰在確認 / 何時更新.
- No praise spam.
- Residents are specific and competent.

---

## 16. Implementation notes (for the DOM / quest pass)

Suggested module boundaries. Not a mandate to invent a second framework.

| Module | Owns |
|---|---|
| `HudRoot` | Mount, layers, reduced-motion class, text scale CSS variables |
| `TaskLine` | ID → string table in §4.2; polite live |
| `DialogueView` | Queue one ID; 12s / VO clock; speaker + radio glyph |
| `PromptView` | Current verb + object + bind glyphs |
| `ToolCluster` | Battery meter after first pulse; tether hook state |
| `WorkbenchHost` | Loadout, docks, Chen bench, public map — DOM, world-anchored |
| `CodexDialog` | Optional; unlocked keys only |
| `PauseSettings` | Contract settings + recommended extras |
| `LiveRegion` | Rope, refuse, flip announcements |

Content keys: `hud.task.<scene>.<state>` e.g. `hud.task.p_s00.default`. Stable IDs, zh-Hant in locale tables. Do not put Chinese inside the key.

String table lives with other zh-Hant content when the runtime exists. Until then, **this file is the source**.

Do not implement chapters 2–Final chrome. If a later-chapter door is visible, use `尚未開放` only.

---

## 17. UX acceptance checklist (P0)

Play with the HUD **on** and once with task+dialogue **occluded** in a playtest recording. The destination and the verb must still be readable from the world.

- [ ] `#world` has no essential `fillText`.
- [ ] First play: no lore wall; `P-S00` task is `到防洪控制室`.
- [ ] Every Critical Path task is verb + object and ≤ 18 CJK.
- [ ] Dialogue shows one ID; action lines do not freeze `P-S00`–`P-S05` locomotion.
- [ ] Soft 48 / hard 64 CJK or ≤12s VO.
- [ ] Codex absent or optional; skip workshop never warns.
- [ ] No score, stars, %, 好感, 說服, 誠實 meter.
- [ ] Battery is a ring without a definition caption.
- [ ] Reporter never colour-only; Chen walk cannot pass without shape+sound **and** municipal timestamp notice.
- [ ] `C1-S03` UI never shows `100% 準確`; first fail cannot be deleted.
- [ ] `C1-S07` fake layers say `目前沒有資料圖層` without scolding.
- [ ] Both monitoring models complete; HUD does not rank them.
- [ ] `P-S05` relaxed timer: no hard-fail clock, same ending.
- [ ] Keyboard + mouse; large subtitles; reduced motion keeps pulses.
- [ ] No developer-voice toast. No red-X fail.
- [ ] No PII prompt. No analytics chrome.
- [ ] C2 hatch, if visible, is an honest stub.
- [ ] WebGL fail is a DOM sentence, not a black canvas.

Fun Gate still wins over pretty menus: if the first 90s are a settings lecture or a Codex reading, cut the chrome.

---

## 18. Remaining gaps (honest)

| Gap | Path / owner |
|---|---|
| No runtime HUD yet | Repo is spec-only. Bind this file when `src/` HUD mounts. |
| No recorded VO lengths | Use the 220ms × chars fallback until VO exists; then cap to audio. |
| Extra a11y persists | `textScale` / `highContrast` / `interactionList` are recommended; contract save lists six settings today. |
| Screen-reader 3D | Not claimed. Interaction list is the honest mitigation. |
| English locale | Not P0 Critical Path. If added, retarget every string in this file — no sticker translations. |
| Projector / 200% zoom | Tokens given; needs a real layout pass on lab PCs. |
| Cited-game accidental rhyme | Art must not drop in a ship-log, garage tablet, or chamber-caption skin “for speed”. |
| Unsigned Science / Education | Public efficacy claims stay blocked even if this HUD ships. |

---

## 19. What this delivery contains

| File | Purpose |
|---|---|
| `docs/design/p0-ui.md` | This file: four chrome laws; DOM tree; task-line table; 12s dialogue; optional Codex; tool / workbench / map / pause chrome; a11y and lint. |

No player-facing UI was added to the runtime in this pass.
