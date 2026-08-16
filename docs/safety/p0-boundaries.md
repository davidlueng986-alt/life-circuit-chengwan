# P0 Biosafety / Ethics Boundaries — 生命迴路：澄灣

| Field | Value |
|---|---|
| Document | `docs/safety/p0-boundaries.md` |
| Role | Biosafety / ethics reviewer hard gate for P0 |
| Version | `2026-08-15-p0` |
| Locale | Player-facing: `zh-Hant`. This file is internal production text; **do not read it to the player**. |
| Script authority | `Life_Circuit_Chengwan_Full_Game_Script_v1` (2026-08-15 Game-first Rewrite) |
| Claim wording source | Legacy `20_SOURCE_AND_CLAIM_REGISTER.md` **safety / banned phrases / maturity tags only** |
| Companion | `docs/delivery/p0-contract.md`, `docs/delivery/p0-manifest.json` |
| Sign-off | **Unsigned.** Claim register §14 and this file §16 are empty. P0 greybox may proceed. Public iGEM claims of educational efficacy or field utility stay **blocked**. |

This document is a **build / QA / wiki gate**, not a player HUD. Safety limits appear in the world as sealed shells, locked docks, missing map layers, and other characters holding authority. They do **not** appear as developer-voice toasts.

---

## 0. Purpose and five hard blocks

P0 (Title, Hub, Prologue `P-S00`–`P-S06`, optional Workshop `W-S00`–`W-S05`, Chapter 1 `C1-S00`–`C1-S08`) must be playable as a third-person 3D adventure **and** must be unable to teach, imply, or let the player perform the following.

If any hard block is violated, the scene **does not ship**. Fun Gate cannot override this file.

| ID | Hard block | Player-facing consequence if someone tries | Ship rule |
|---|---|---|---|
| `HB-WET` | **Wet-lab how-to** | Tool shows a lock, inert model, or “no port.” No recipe appears. | No sequences, media, concentrations, culture conditions, transformation, cloning, open-shell wet steps, or construct recipes. |
| `HB-CONTACT` | **Player contact with unknown material** | Confirmation **rover** / 郭工 team enters. Player stays on the maintained side of the door. | No sample vials, dipsticks, open jars, gloves-in-water, or “collect a river sample” verbs. |
| `HB-RELEASE` | **Environmental release** of any living system | Route does not exist. No button, no “open the cage into the river.” | Engineered cells exist only inside sealed teaching models. Release is not a valid P0 choice. |
| `HB-DX` | **Medical / environmental diagnosis** | 郭工 / lab owns identity. Public map has **no data layer** for identity or cleanup. | Player never diagnoses a person, a symptom, a river, or a pollutant. Screening ≠ confirmation. |
| `HB-ZERO` | **Zero-risk** (and “通關 = 可部署”) | 方雅, residual risk, stop button, and unresolved items stay visible. | Ban `完全安全` / `零風險` / `100% 準確` / `批准部署`. |

Also hard, because they are how the five blocks leak:

| ID | Additional hard rule | P0 encoding |
|---|---|---|
| `HB-ROLE` | Player never **samples, diagnoses, enforces, or approves deployment**. | 系統跑手. 郭工 confirms. 何主任 / later independent roles release. Player traces, carries, repairs **external** ports, marks a zone, publishes **only obtained layers**. |
| `HB-CTRL` | **Failed positive control makes the unknown unreadable** until repaired. | `W-S04` and `C1-S03`: sun dock dark / max-wrong → `?` dock stays closed. |
| `HB-NAME` | Do not require **MerR / Pmer / dTomato** (or any project-specific part) as a password. | Transferable terms only. Named cases = optional Codex background, never a gate. |
| `HB-APT` | Aptamer / riboswitch public route is **`NOT_APPROVED`**. | Omit `APT-004` and any Hg²⁺ aptamer switch. |
| `HB-VOICE` | No developer-voice disclaimers in player UI. | Do **not** paste `science.limit.notMeasurement` or “這不是……指引.” World rules replace lectures. |

---

## 1. Authority order

When this file, the script, the legacy pack, or a draft line conflict:

1. Named team Science / Safety / Privacy / Child-safeguarding **sign-off** (none present as of 2026-08-15).
2. New full script `Life_Circuit_Chengwan_Full_Game_Script_v1` (game-first; 3D verbs; no card/quiz Critical Path).
3. Legacy `20_SOURCE_AND_CLAIM_REGISTER.md` **safety wording, maturity tags, banned phrases, “player is not an authority.”**
4. Legacy GDD / TDD notes **only if they do not conflict** with (2).

**Retired for P0 (do not restore):**

- Card / quiz / Evidence–Claim–Consequence **cards** as Critical Path.
- Player title 「生物設計／安全調查者」and 「提出採樣候選」as the player verb (legacy `ROLE-001` / GDD). New role is **系統跑手**.
- HUD launch disclaimers (`science.limit.notMeasurement` and kin) read aloud or stuck on the chapter frame.
- MerR / Pmer / dTomato as required vocabulary.
- Aptamer public route.
- Next.js / PRE lecture stack as runtime.
- Any “kill switch / sealed box = zero risk” ending.

---

## 2. Five maturity layers — do not mix

Legacy register §1 remains in force as a **reviewer** taxonomy. P0 content is only the last two layers unless a later signed Science note says otherwise.

| Tag | Meaning | P0 allowed? | May never be presented as |
|---|---|---|---|
| `MECHANISM` | Literature mechanism (context-limited) | Optional Codex **background** only. Not a gate. | Team construct works; river was measured this way. |
| `TEAM_PROPOSAL` | Team wants to test a design | **Out of P0 player Critical Path.** Do not narrate the 2026 construct as the harbor tool. | 「團隊已建立可工作的感測器」 |
| `TEAM_DATA` | Signed methods + data | **None.** Register has no approved package. | Any performance number, LOD, selectivity, “field-ready.” |
| `STORY_PROTOTYPE` | Fictional / simplified story device | **Yes.** Harbor sealed probe, docks, beacons, public map. | Regulatory approval, real Chengwan contamination, real cleanup. |
| `TEACHING_SIMULATION` | Synthetic play-state | **Yes.** All meters, fills, “low / mid / high,” triangle reporters. | Lab result, official analysis, calibrated concentration. |

**One sentence rule:** mechanism literature ≠ team proposal ≠ team experiment ≠ story fiction ≠ teaching simulation.

P0 maturity of the playable slice: **`STORY_PROTOTYPE` + `TEACHING_SIMULATION`.**

If a still readout could be cropped and mistaken for lab data, mark **that readout only** with `教學模擬` (relative state, no real units). Do **not** stamp a chapter-long “這是教學故事” lecture on the HUD.

---

## 3. Player role, other people’s authority

Script character bible: the player **never** replaces a professional unit to approve, diagnose, or enforce.

| Actor | May do in P0 | Must not do |
|---|---|---|
| **Player（系統跑手）** | Move, scan, tether, carry the **sealed** probe, repair **external** service ports, place beacons, change reporter **shape/sound/notice**, publish layers that exist in `evidence.runHistory`, pick one monitoring **model**. | Sample, open the shell, touch the unknown, diagnose people or pollutant identity, enforce a cordon, clean the river, approve deployment, declare 全河安全 / 已完成清理. |
| **小岑** | Field partner. Describes what is in front of the player. | Recite textbook definitions; blame the player for a failed tool. |
| **林博士** | Names terms **after** the player operates the phenomenon. Admits excitement and error. | “相信科學” over a stakeholder question; claim the probe identified the substance. |
| **方雅** | Sealed equipment, stop conditions, residual risk, “who can halt this.” | Declare any single control **零風險**. |
| **陳姨** | Stakeholder. Her walk **must** change output **and** notification. Knows a map gap. | Written as ignorant or anti-science. |
| **阿哲** | Public communication pressure; can correct a headline. | Pure panic villain. |
| **郭工（確認隊）** | Confirmation, safe entry range, rover into the unknown, formal identity later from the lab. | Hand identity or cleanup to the player. |
| **何主任** | C1 radio stub only. Quality / independent release lives in later chapters. | P0 must not let the player press a release button. |

Legacy `ROLE-001` (“玩家是生物設計／安全調查者”) is **superseded** for P0 by the new script. Keep `ROLE-002` intent: formal confirmation, enforcement, cleanup, and public identity belong to named authorities.

---

## 4. Science the mainline may teach

### 4.1 Transferable terms only

Mainline may teach, and only these as **curriculum nouns**:

`cell`, `DNA`, `gene`, `RNA`, `protein`, `promoter`, `regulator`, `reporter`, `input` / `output`, `control`, `replicate`, `containment`, `biosafety`, `biosecurity`, `stakeholder`, `pilot`.

Do **not** require memorizing `MerR`, `Pmer`, `dTomato`, spacer lengths, hosts, plasmids, RBS, or any 2026 part name. Named cases are application background in optional Codex, never a lock, never a quiz password.

### 4.2 What P0 actually operates vs what it must not pretend to teach

| Term | P0 player verb | If the player skips it | First name | Honest P0 status |
|---|---|---|---|---|
| cell / DNA / gene / RNA / protein | Walk workshop; DNA stays locked; RNA is a copy; protein fits a shape lock | Mix storage / message / work | `W-S00`–`W-S02` | **Optional.** Skip is legal. C1 uses living phrases (`C1-S00-D003A`). |
| input / sensor | Aim sealed probe; follow **moving** pulse, not brightest dead shine | Chase brightness | Prologue + `C1-S01` | Operated. |
| promoter / regulator | Workshop gates; C1 external relay reset | Output stuck on | Workshop; living phrases in C1 if skipped | Operated as **behavior**, named only after. |
| reporter / output | Triangle fill + shape / sound. Chen walk **forces** shape + short sound. | Color-only fails in shade | After the player sees the fill / flag | Operated. Color alone is a **fail** state. |
| control / valid run | Moon dark + sun bright **before** `?` | Unknown stays sealed | `W-S04`, `C1-S03` | **Hard gate.** |
| screening vs confirmation vs cleanup | Mark a zone; 郭工 / lab owns identity; missing layers | Player “confirms pollution” or “finished cleanup” | `C1-S07` | Operated. |
| stakeholder / public communication | Chen walk; known / unknown / owner / time on the map | Pretty bench, unusable street | `C1-S05`–`S07` | Operated. |
| replicate | — | — | C4 | **Not operated in P0.** Codex stub only. |
| containment / biosafety (layered source–pathway–receptor) | — | — | C5 | **Not operated in P0.** Sealed shell is a world rule, not a C5 course. |
| biosecurity / least privilege | — | — | C7 | **Not operated in P0.** Do not mix with biosafety. |
| quality / release | — | — | C2 | **Not operated.** Visible C2 door is an honest stub. |
| pilot / no-pilot | — | — | Final | **Not operated.** Do not call C1 monitoring choice a deployment approval. |

P0 Learning Gate (must all be true):

1. Unknown remains locked while the positive control is failed (`W-S04`, `C1-S03`).
2. Player cannot publish 「全河安全」 or 「已完成清理」.
3. Chen’s pass requires shape + sound **and** a next-step notice with owner + timestamp.
4. Both monitoring models complete the chapter and leave different harbor / Hub geometry.
5. First invalid run remains in `evidence.runHistory` and on the station wall.
6. Workshop skip still allows a full C1.
7. No mainline password of MerR / Pmer / dTomato.
8. Player never samples, diagnoses, enforces, or approves deployment.

iGEM appendix H items that need C2–Final (`replicate` operated twice, biosafety vs biosecurity as play, pilot / no-pilot) stay **unchecked**. Do not advertise them as P0 learning outcomes.

---

## 5. How each hard block is encoded as world rules

### 5.1 Wet-lab how-to (`HB-WET`)

**Blocked in every P0 surface** (dialogue, HUD, Codex, tooltips, Hub posters, C2 stub signage, still images):

- Nucleic-acid **sequences**, primer lists, part IDs used as recipes.
- Culture media, temperatures, times, OD, induction, antibiotic concentrations.
- Transformation, electroporation, conjugation, transfection, cloning, miniprep, gel, PCR as **steps the player can follow**.
- Open the Bio-Rig / probe shell and “add sample / change the cells.”
- Mercury / metal **handling**, chelation recipes, “how to treat contaminated water.”
- Any construct assembly that would let a motivated student rebuild a real sensor in a garage.

**Allowed (abstract, non-executable):**

- Visible slots: 感測 / 調控 / 輸出 as **shapes and behaviors**.
- DNA as a **fixed track** the player cannot pull off the rack (`W-S01` lock icon).
- RNA as a **copy that can be carried** to the next station.
- Protein as a **folded shape that fits a lock**; RNA does not fit.
- Smoke as a generic **input** in a sealed model room — not a named hazardous recipe.
- External service ports: reset a relay, swap a **sealed** wet reporter joint. No open wet bench.

Workshop is a **walkable model**, not a lab class. Completing it is not a wet-lab qualification and must never be framed as one.

### 5.2 Player contact with unknown material (`HB-CONTACT`)

| Scene | Allowed | Forbidden |
|---|---|---|
| `C1-S00` | Pick sealed probe. Pick **battery or crash shell**. | Sample vials, swabs, “候選採樣點 A/B/C/D.” |
| `C1-S01` | Carry sealed probe; cage it over a cable; observe fish / smell / oil as **observations**. | Dip the probe’s guts in the river; bag a fish as proof; “collect 100 mL.” |
| `C1-S03` | Dock into closed moon / sun / `?` ports. External reset only. | Open the shell. Pour harbor water into a well. |
| `C1-S06` | Open a remote door; send the **rover**. Player evacuates. | Player walks into the confirmation zone and touches residue. |
| Anywhere | Tether moves **equipment and debris**. | Tether a sludge sample into the inventory as “evidence of mercury.” |

Fish, metal smell, diesel, oil film, city-red warehouse blink: **observation**, never auto-promoted to pollution identity.

### 5.3 Environmental release (`HB-RELEASE`)

- No living system leaves a sealed teaching volume into the harbor, air, or soil.
- No player choice “放行工程細胞 / 把模組倒進河裡 / 開環監測菌.”
- Hub and harbor decorations may show **closed** cases, docks, and recovery racks. They may not show an open cage at the waterline as a success state.
- C5 will later **physically block** a release route. P0 must not preview release as a clever option on a poster or stub door.
- Screening devices in story are **sealed probes**, not broadcast organisms.

### 5.4 Medical / environmental diagnosis (`HB-DX`)

| Claim the player might want | P0 truth | World encoding |
|---|---|---|
| “The river is contaminated with X.” | **Unreadable** as a player conclusion. Identity waits on the lab. | `c1.unresolved` includes `confirmation_result`. |
| “The red alarm means mercury / pathogen / toxin.” | Screening signal ≠ identity. New script does **not** make a named analyte the password. | Reporter is output. 林博士: it does not answer every unknown. |
| “That resident is sick / poisoned.” | **No medical plot.** No symptom checklist. No treatment advice. | If health worry appears in ambient chatter, NPC points to **municipal** channels. Player has no diagnose verb. |
| “We finished cleanup.” | Cleanup is **not** a P0 action and not a data layer. | 「已完成清理」→ `目前沒有資料圖層`. |
| “The whole river is safe.” | Safety of a river is not a player button. | 「全河安全」→ `目前沒有資料圖層`. |

Legacy `HG-MECH-009` intent remains: a single reporter result does not replace formal sampling, analysis, regulation, or public decision. **Do not** print that as a HUD disclaimer. Encode it as 郭工’s line + missing layers + locked `?` dock.

Do not restore a public-health “alternative water / seek care” lecture unless a signed Safety + Education note asks for it **and** it is spoken by a municipal NPC as a **next action**, not a developer toast. P0 script has no diagnosis beat; do not invent one.

### 5.5 Zero-risk and deployment (`HB-ZERO`, `SAFE-001`, `SAFE-002`)

Allowed reviewer / later-signed wording (not a HUD stamp):

- 「Safety 措施降低風險，但不能保證零風險。」
- 「是否部署需更多安全、效能、治理與 stakeholder evidence。」

Forbidden player-facing fragments (lint):

`100%` as performance, `完全安全`, `零風險`, `零外洩`, `必定`, `證實污染`, `即時檢測`, `準確濃度`, `高度靈敏`, `高度選擇性`, `可現場部署`, `現場即時確認`, `批准部署`, `診斷` as a player verb, `沒有任何表達` as mechanism, `works` / `validated` / `proven` as performance claims.

After `C1-S03` repair, UI shows **two control states + run time**. It never shows `100% 準確`.

C1 monitoring placement is **not** deployment approval. It is a next-stage **observation model** (fixed station vs portable kits). Both remain under stop authority (陳姨 stop button + public board on **both** routes).

“不進行 / 尚未確認” is a complete, non-failing state. Invalid run **forces retreat**. Chapter 1 **must** leave `confirmation_result` and `long_term_monitoring` unresolved.

---

## 6. Scene-by-scene safety notes (P0 only)

### 6.1 Title / Hub

- Cold start: New / Continue / Settings. No lore wall, no safety lecture crawl.
- After `P-S06`, two physical doors: 河港, 微觀工作坊.
- Skipping the workshop: **no warning**, no “you are unqualified,” no biosafety exam framing.
- Visible later-chapter doors: **honest stubs**. A C2 hatch may play 何主任’s radio line. It must not load a factory, a quality-release button, or a wet process.
- Privacy: save is `localStorage` only. No names, schools, health, photos, voice, or geolocation in the JSON.

### 6.2 Prologue 黑水線 (`P-S00`–`P-S06`)

- **No biology terms during the crisis.** Goal is rescue and flood-gate signal, not a cell lecture.
- Environmental danger uses a **safety line**, not injury-as-entertainment, not a death screen.
- Flow Lens teaches **bright ≠ direction**. It is not a chemical identifier.
- Do not re-skin rainwater as “biohazard sludge the player wades through.”

### 6.3 Optional Workshop (`W-S00`–`W-S05`)

- Not a qualification gate. Leave on any safe platform; resume that scene.
- DNA cannot be removed (containment of **information as model**, not a cloning demo).
- Arrows are **information flow**. Do not let copy or VO say DNA *turns into* RNA or protein (`BIO-FOUND-003` intent).
- Smoke input is a sealed room effect, not a protocol for generating an analyte.
- `W-S04`: first run **intentionally** breaks the sun dock. `?` cannot open the exit until moon dark + sun bright. Failed positive control **blocks** the unknown.
- `W-S05` may name synthetic biology / DBTL as a recap of what the player **already did**. It is not a password and not a license to experiment.

### 6.4 Chapter 1 紅色警報 (`C1-S00`–`C1-S08`)

| Scene | Safety / ethics must | Safety / ethics must not |
|---|---|---|
| `C1-S00` | Sealed probe. 方雅: player brings device + route log; **郭工 confirms**. Loadout is risk preference, not a moral test. | Sample kit. “You are the inspector.” Workshop-complete fork may use sensor / regulator / promoter / reporter; skip fork uses living phrases. |
| `C1-S01` | Triangle fill (not red/green only). Observations ≠ proof. Distant red warehouse is city light. | Named analyte as the answer. Player “confirms pollution” at the pump house. |
| `C1-S02` | Player **must try** turn / leave / kill env relay, then self-test. Mission flips to **bring the whole probe home**. No blame. | Stay and “keep measuring the river.” Field-strip the device. |
| `C1-S03` | External ports only. Sun still max = not restored. `?` closed until moon low + sun high. First fail **kept**. | Open shell. UI `100%`. Delete the failed run. |
| `C1-S04` | Placement is the claim. Wide/fast and far/tight both valid. 郭工: a **safe entry range**, not a red dot of identity. | Three fixed sample wells. Score for “tighter = more scientific.” |
| `C1-S05` | Playable usability test. Color-only **fails**. Must set shape + short sound **and** municipal update + timestamp. Chen changes the prototype. | Honesty dialogue cards. Saint/villain meter. Skip Chen and keep a color-only siren. |
| `C1-S06` | Player opens the door; **rover** enters. Latch is a function, not a dual-use lecture. Pressurized-line mistake → safety valve, not gore. | Player contacts unknown. “You confirmed the source chemical.” |
| `C1-S07` | Map layers **only** from run history. Fake layers show `目前沒有資料圖層` — no scold. Two valid models. 陳姨 and 郭工 do not pick for the player. | 「全河安全」「已完成清理」as unlockable truths. One “correct” monitoring ethics path. |
| `C1-S08` | Both models have Chen’s **stop** and a public board. Wall keeps the first fail. Recap is three player-caused facts, not a grade. | “Crisis solved.” “Sensor cleaned the river.” Zero-risk tag on the skyline. |

---

## 7. Tools

| Tool | Safety-legal use | Safety-illegal use |
|---|---|---|
| **Flow Lens** | Pulse: direction, occlusion, battery, distortion (dead shine, background, broken device). | Answer highlighter; chemical fingerprint; permanent wallhack; “Hg = 12 µg/L.” |
| **Tether** | Weight, rotate, snap-by-**shape**, carry sealed kit and debris. | 2D card-drag Critical Path; yanking open a bio-shell; fishing a sample. |
| **Sealed Bio-Rig / sealed probe** | Sense / regulate / output as visible world parts. Reporter always has **shape and/or sound and/or fill**. External service only. | Sequences, media, concentrations, open wet steps, environmental release, color-only state. |

P0 teaching order: **operate the phenomenon, then name it.**

---

## 8. Claim IDs still in force (wording only)

Use these as **reviewer IDs**. Player UI uses world events, not claim banners.

| ID | Keep | P0 adaptation |
|---|---|---|
| `SAFE-001` | Residual risk; ban 完全安全／零風險 | 方雅 never ends a beat with zero-risk. Stop button exists on both monitoring models. |
| `SAFE-002` | Passing the game ≠ may deploy | C1 choice is monitoring model, not deployment. Unresolved list stays. |
| `ROLE-001` | — | **Superseded.** Player is 系統跑手, not investigator-authority. |
| `ROLE-002` | Formal confirm / enforce / clean / public identity stay with institutions | 郭工 + lab. Rover, not player hands. |
| `COMM-001` | Public statement has use / limit / next | Encoded as visible output + action + owner/time. No Use/Limit/Next legal footer on the HUD. |
| `COMM-002` | Stakeholders may reasonably differ | Two monitoring models; Chen is not a wrong answer. |
| `SIM-001`–`SIM-004` | Teaching simulation; fictional portable device; player is not the confirmer | Relative low/mid/high; no real units. |
| `HG-MECH-008` | Controls ask whether a **run is readable** | Moon / sun before `?`. |
| `HG-MECH-009` | Reporter ≠ formal decision | Missing layers + 郭工, not a disclaimer toast. |
| `APT-004` | `NOT_APPROVED` | **Omit.** |
| `BIO-FOUND-001`–`003` | Cell / DNA-gene / information-flow (DNA remains) | Workshop only; arrows are not material conversion. |
| `HG-MECH-001`–`007`, `HG-TEAM-*` | Mechanism / team construct | **Not P0 Critical Path.** Optional later Codex under Science sign-off. Never a password. |

Legacy §9 locale keys (`science.limit.*`) stay in the **internal** register. They are **not** auto-injected HUD strings for this rewrite.

---

## 9. Dual-use, biosecurity, and later-chapter leakage

P0 must not teach a capable person how to build, grow, release, or detect a real agent in the field.

| Topic | P0 rule |
|---|---|
| Sequences / hosts / plasmids | Absent. |
| High-consequence capability | Absent. C7 “capability seal” is a **later** abstract door; do not preview openable contents on Hub posters. |
| Pathogens, toxins, weapon framing | Absent. No body-horror lab, no “bioweapon scare” marketing. |
| Biosafety vs biosecurity | Do not collapse into 「鎖起來」. Do **not** claim P0 taught the distinction — that play is C5 / C7. |
| C2 stub | Isolation / quality / independent release are **not** playable. No “press to release the batch.” |
| Wiki / poster / video using P0 footage | Same banned list. No “our game’s sensor found mercury in a real river.” No “students can now deploy.” |

---

## 10. Ethics and Human Practices (P0)

- Residents are **stakeholders**, not obstacles or a single attitude.
- 陳姨’s walk is playable. It **must** change reporter output **and** the notification rule. Missing visible output, next action, or update owner → visible confusion, fix on the spot.
- Two defensible monitoring models: `fixed_station` | `portable_kits`. Different coverage, power, training, single-point failure. Neither is the saint option.
- Battery vs crash shell, and wide vs tight zone, are also two-valid-path nodes. Do not score them.
- Revision keeps the **first failure** (`evidence.runHistory`, station wall). Deleting it is not a player verb.
- Evidence is seen / measured / carried. Claim is a **placement or public action**. Consequence changes the harbor / Hub. 
- Do not write researchers as automatically right or residents as anti-science (`COMM-002`).
- Do not end conflict with 「科學證明安全」.

---

## 11. Privacy, child safeguarding, accessibility

| Topic | P0 rule |
|---|---|
| Privacy | No accounts, chat, analytics, Web Analytics, or remote telemetry. Save must not contain player name, school, health, photo, voice, or GPS. |
| Human Practices sourced from real people | If later imported, need consent, de-identification, and withdrawal. P0 script characters are fictional. |
| Child safeguarding | No sexual content, no injury-as-fun, no real school / clinic data collection. Safety rope, not corpse cam. |
| Medical | No diagnosis minigame; no medicine dosing; no “treat the child.” |
| Accessibility is ethics | Relaxed timer (no story change). Reduced motion. Keyboard + mouse. Large subtitles. Reporter is **color + shape/sound**. Color-only **fails** Chen’s walk. |
| Workshop access | Skip is silent and dignified. Science literacy is not a moral exam. |

---

## 12. Player-facing copy that is legal vs illegal

**Legal (after the matching action, in character voice):**

- 小岑: 三角形跳得越密，方向越接近。
- 林博士: 月亮應該暗，太陽應該亮；只有它們都正常，未知結果才有意思。
- 林博士: controls 回答的不是河裡有甚麼，而是這次運行能不能被解讀。
- 方雅: 把第一次失效留在紀錄裡。
- 郭工: 物質身分和影響範圍由正式分析更新。
- 陳姨: 別把死魚照片當成答案。
- Public map empty layer: `目前沒有資料圖層`.

**Illegal (anywhere player-visible, including stub signs and Codex if it can be opened in P0):**

- 「完成練習不代表……」「本章涉及……」「這不是……指引」「這是教學故事」as a chapter frame.
- 「玩家已證實河流受污染」「感測器已清理河港」「工程細胞可安全釋放」.
- 「100% 準確」「完全安全」「零風險」「可現場部署」「批准部署」.
- MerR / Pmer / dTomato as the only way to open a door.
- Aptamer hairpin-blocks-transcription as a working harbor tool.
- Real units, LOD, µg/L, “highly sensitive.”
- NPC reciting this document, a rubric, or a safety SOP.

---

## 13. QA gate (P0 must all pass)

### 13.1 Automated / string lint

Fail the build (or the content checklist, until lint exists) if player-facing text matches:

`100%` (performance), `完全安全`, `零風險`, `零外洩`, `必定`, `證實污染`, `即時檢測`, `準確濃度`, `高度靈敏`, `高度選擇性`, `可現場部署`, `現場即時確認`, `批准部署`, `works`, `validated`, `proven` as performance.

Also fail if Critical Path copy requires `MerR`, `Pmer`, `dTomato`, `aptamer`, `riboswitch` as a lock.

Review (not auto-fail) `診斷` — allowed only when an NPC says the **player cannot** diagnose, never as a player verb label.

### 13.2 Play / systems

- [ ] No sample vial, open-shell, or “collect unknown” interactable.
- [ ] `C1-S06` rover enters; player does not.
- [ ] No environmental-release interactable or success state.
- [ ] `W-S04` and `C1-S03`: `?` / unknown stays closed until positive control is valid.
- [ ] Failed first C1 run cannot be deleted; it appears on the wall in `C1-S08`.
- [ ] 「全河安全」「已完成清理」cannot become true layers.
- [ ] Chen walk blocked until shape + sound **and** municipal update + timestamp.
- [ ] Both monitoring models complete; neither is labeled 正確 / 比較安全 as a score.
- [ ] Post-repair UI has no `100% 準確`.
- [ ] All numeric / fill readouts are relative teaching-simulation states.
- [ ] Reporter never communicates state by color alone.
- [ ] Workshop skip: no warning, C1 still legal.
- [ ] C2 door (if visible) cannot release a batch or teach a protocol.
- [ ] No card quiz, no red-X knowledge fail, no developer disclaimer toast.
- [ ] Save has no PII; no analytics beacon.

### 13.3 Public iGEM / wiki / video (even if `LIVE_DEPLOY_REQUESTED` is false)

Blocked until named Science + Safety sign-off:

- “This game proves students learn X.”
- “Our construct works / is field-ready / detected pollution.”
- Any still chart without `教學模擬` if it could be read as data.
- Aptamer route; team performance numbers; real-river confirmation.

---

## 14. What this file does **not** authorize

- Implementing chapters 2–final as playable science.
- Restoring legacy mercury-candidate-point / card-control pedagogy.
- Adding a medical-advice footer “to be safer.”
- Adding a kill-switch ending “to be safer.”
- Claiming P0 taught `replicate`, layered `containment`, `biosecurity`, or `pilot` as operated skills.
- Treating an unsigned greybox as Science-approved education research.

---

## 15. Remaining gaps (honest)

| Gap | Path |
|---|---|
| No named Science / Safety / Education / HP / Comms sign-off | Legacy register §14; this file §16. |
| No approved `TEAM_DATA` | Do not invent performance. |
| Aptamer architecture still `NOT_APPROVED` | Stay omitted. |
| iGEM official Safety / Human Practices forms | Team-owned; this file does not replace them. |
| Later-chapter source audits (C2–Final) | Register §11 still `Needs source`. Do not leak those claims into P0 stubs. |
| Runtime lint not implemented | Until code exists, treat §13 as a manual gate. |

---

## 16. Sign-off (empty until named)

| Review | Name | Date | Decision | Evidence / version |
|---|---|---|---|---|
| Safety / biosafety (this file) | 待指派 | — | 待決定 | `docs/safety/p0-boundaries.md` `2026-08-15-p0` |
| Biosecurity / dual-use | 待指派 | — | 待決定 | Confirm P0 has no executable detail |
| Science Lead (maturity mix, no TEAM_DATA) | 待指派 | — | 待決定 | Script v1 + this file |
| Education / HP (authority, residents, workshop skip) | 待指派 | — | 待決定 | Chen walk + two models |
| Privacy / child safeguarding | 待指派 | — | 待決定 | Save schema; no PII |
| Communications / localization | 待指派 | — | 待決定 | Banned-phrase pass on zh-Hant |
| QA (controls lock, no release, no contact) | 待指派 | — | 待決定 | §13 checklist |
| Product (public release scope) | 待指派 | — | 待決定 | Greybox ≠ public efficacy claim |

P0 implementation may continue as **unsigned greybox**. Shipping a public build that claims scientific or educational proof requires the table above to be filled by humans, not by this document existing.
