# P0 Learning & Human Practices Map — 生命迴路：澄灣

| Field | Value |
|---|---|
| Document | `docs/education/p0-learning.md` |
| Role | Education + Human Practices lead spec for the 2026-08-15 game-first P0 |
| Version | `2026-08-15-p0` |
| Locale | Player-facing `zh-Hant`. This file is a production spec, **not** player UI. |
| Script authority | `Life_Circuit_Chengwan_Full_Game_Script_v1` (Game-first Rewrite, 2026-08-15) |
| Companions | `docs/delivery/p0-contract.md` §8, `docs/delivery/p0-manifest.json` `learningGate` |
| Scope | Title + Hub, Prologue `P-S00`–`P-S06`, optional Workshop `W-S00`–`W-S05`, Chapter 1 `C1-S00`–`C1-S08` |
| Out of scope | Chapters 2–Final as playable learning. Card / quiz Critical Path. Named-part passwords. |

This file tells writers, level designers, and QA **when a concept is lived, when it is named, and how transfer is proven in the world**. It does not implement the game. It must not be pasted into HUD, subtitles, or Codex as a lecture.

Education is a **通關能力**, not a chapter-end test. If the player has not made the matching judgement, the system must actually fail to work — not show a red X, not deduct a knowledge score, not scold.

---

## 0. Authority and conflict notes

When documents conflict, follow this order:

1. Named team Science / Safety / Privacy / Child-safeguarding / Education sign-off *(none present as of 2026-08-15)*.
2. New full script `Life_Circuit_Chengwan_Full_Game_Script_v1`.
3. Legacy `20_SOURCE_AND_CLAIM_REGISTER.md` **safety and claim wording only**.
4. Legacy GDD / TDD / PRE notes **only if they do not conflict** with (2).

Retired for this file:

- Legacy PRE as a 12–16 minute “biology class” with worked-example cards.
- Evidence / Claim / Consequence **cards** as the Critical Path.
- `preComplete` / `preSkipped` save keys.
- Requiring `MerR` / `Pmer` / `dTomato` as a password.
- Aptamer public route (`APT-004` is `NOT_APPROVED`).
- Claim-register §9 launch disclaimers in player HUD (`science.limit.notMeasurement` and siblings). Encode the same limits as **world rules**.
- Legacy `ROLE-001` wording “玩家是生物設計／安全調查者”. New script wins: the player is a **系統跑手**. They trace, carry, assemble, and publish only what they have. They never sample, diagnose, enforce, clean, or approve deployment.
- Any “完成練習不代表…… / 本章涉及…… / 這不是……指引 / 這是教學故事” developer voice.

P0 maturity: **story prototype + teaching simulation**. Do not imply the team construct works, that the river was confirmed contaminated, or that this game is a field instrument.

---

## 1. How to read a scene row

Every P0 scene maps to three columns. Designers may not invert the order.

| Column | Meaning | Must not become |
|---|---|---|
| **First experience** | The visible problem and the 3D verb the player performs **before** any formal term. Speakable in 30 seconds as 救人 / 開門 / 關閥 / 帶回 / 逃離 / 找出方向. | A glossary, a quiz stem, a card sort. |
| **Later name** | Who names it, after which action, and whether Codex may unlock. First mention gets one closable in-world line. Skippers hear living short phrases, not a lock. | A password. A developer toast. An NPC reciting a rubric. |
| **Transfer check** | A later situation, world lock, or playtest utterance that proves the method moved. QA flags are behavioural and **never** player badges. | A multiple-choice recap. “太棒了！你理解了……” |

Script order (appendix A), mandatory:

1. Visible, operable problem.
2. Old skill fails or information is not enough.
3. The new idea is a **better verb**, not extra reading.
4. The player uses it in a different situation.
5. The world and characters remember.
6. Codex, if anything, names last.

---

## 2. Three hard rules (P0 cannot ship if any fail)

These are Education + HP acceptance, not flavour.

### 2.1 Workshop skip must not block Chapter 1

`W-S00`–`W-S05` is a walkable 3D model, **never a qualification gate**.

| Rule | Persist / dialogue | Fail signal |
|---|---|---|
| After `P-S06`, Hub shows two physical entries of equal dignity: **去河港** (`C1-S00`) and **試一次微觀工作坊** (`W-S00`). | `workshop.available = true`. No third “you should study first” door. | Harbor door greyed, locked, or labelled 未完成基礎. |
| Skip shows **no warning**, no “不建議”, no “缺少資格”. | `workshop.complete` stays `false`. Do **not** write `preSkipped`. | Modal, toast, or Codex shame mark. |
| Leave on any safe platform; resume that scene. | `workshop.resumeScene = W-S00`…`W-S05`. | Forced restart of the whole workshop. |
| C1 is fully legal with workshop incomplete. | Only language forks: `C1-S00-D003` vs `C1-S00-D003A`; `C1-S03` docks start as icons unless workshop complete. | Any C1 interactable, dock, or map layer that requires `workshop.complete`. |
| Workshop remains returnable from Hub **before and after** C1. | Completing later still unlocks Codex and may retrofit living phrases in future Hub lines. It must not rewrite C1 history. | One-shot “you missed class”. |
| cell / DNA / gene / RNA / protein are **not** required for C1 legality. | Skippers never need to say those words to mark a search zone or publish the map. | C1 quiz or password on workshop terms. |

If a designer wants “players should do the workshop”, put it in teacher notes. Never in the Critical Path.

### 2.2 Chen’s walk must change the design

`C1-S05` is a five-minute **playable usability test**, not a cutscene and not a persuasion meter.

The walk **fails to complete** until both persist fields are written:

| Persist | Required value | What the player actually changes |
|---|---|---|
| `c1.accessibilityOutput` | `shape_audio` | Reporter is no longer colour-only. Output has a **shape** and a **short sound** (fill animation allowed). |
| `c1.notificationRule` | `municipal_update_with_timestamp` | Public text names a next action, who updates, and when. |

Three public-message settings generate the result. There are no Honesty cards.

| Setting | If missing | Visible confusion (examples; write original lines, do not copy cited games) |
|---|---|---|
| Visible output | Colour-only in the stall shade | 陳姨: 棚下只剩一團暗紅. Market NPCs squint / guess. |
| Action instruction | Only the word 紅 | NPCs argue whether to leave or stop using water. 阿哲 asks what the next step is. |
| Update owner + time | Shape and sound exist, no municipal board | 陳姨 refuses to call it usable until the update time is visible. |

QA must set `evidence.userFeedbackChangedPrototype = true` only after the **second** walk succeeds with the revised prototype. Talking, then leaving the bench prototype unchanged, is a Learning Gate fail (script Fun Gate F7).

陳姨 is a **stakeholder**, not an anti-science obstacle and not a quiz. In `C1-S04` her local knowledge opens an unmapped rain gate — that is also HP, and it is spatial, not a dialogue score.

### 2.3 Public map cannot open cleanup or safe-river layers

`C1-S07` publishes only what `evidence.runHistory` actually contains. Claim ≤ evidence.

| Attempted layer | Player-facing result | Must not happen |
|---|---|---|
| 全河安全 | **目前沒有資料圖層**. No scold, no lecture. | Opening a green “safe river” overlay. Copy that says 完全安全 / 零風險. |
| 已完成清理 | **目前沒有資料圖層**. Same quiet refuse. | Cleanup animation, “pollution solved” stamp, player-as-cleanup-crew. |
| Any identity / concentration / confirmed-contaminant layer | Absent. 郭工 line: 物質身分和影響範圍由正式分析更新. | Player “confirms pollution”. Real units, LOD, Hg numbers. |
| Obtained, valid layers | First invalid run; controls restored; overlap zone; confirmation-team route; waiting lab result. | Deleting the first fail to make a prettier map. |

Screening ≠ confirmation ≠ cleanup. After C1, `c1.unresolved` **must** include `confirmation_result` and `long_term_monitoring`. Ending the chapter without those unknowns is a Learning Gate fail.

Two monitoring models are both valid. Placing the physical model **is** the claim.

| Model | Persist | World consequence | Not a score |
|---|---|---|---|
| 固定站 | `fixed_station` | Attended kiosk near the market; far zones stay on patrol. Single-point failure is visible. | “More scientific.” |
| 流動套件 | `portable_kits` | Numbered kits, return racks, training marks on several piers. Charge / version / training burden is visible. | “More caring.” |

Both routes keep 陳姨’s stop button and a public update board. Hub far-view after `C1-S08` must show the chosen `world.harbor.monitoringModel`.

---

## 3. Terms P0 actually operates

Mainline transferable words from the script. P0 **operates** a subset. Later words may exist as Codex stubs only.

| Term | First lived | First named (after action) | P0 transfer | Required to finish C1? |
|---|---|---|---|---|
| *(move, see destination)* | `P-S00` | Never a science term | Whole game | Yes |
| signal / flow ≠ brightness | `P-S02` | Everyday 訊號 in `P-S04`; not yet input | `C1-S01`, `C1-S06` (flowing pulse vs bright-still residue) | Yes, as a verb |
| input / sensor | Probe aim `C1-S01`; smoke `W-S03` if played | `W-S03`; or living “前端感到目標” in `C1-S00-D003A` | Harbor hunt | Verb yes; word no |
| promoter / regulator | Smoke gate `W-S03`; relay reset `C1-S03` | `W-S03`; `C1-S03-D003` after docks work | Failed sun dock | Verb yes |
| reporter / output | Triangle fill `C1-S01`; flag swap `W-S03`; Chen `C1-S05` | After those actions | Chen walk **forces** shape+sound | Yes, as a world rule |
| negative / positive control, valid run | `W-S04` and/or `C1-S03` | After the **second** run, never before | Unknown dock stays shut | Yes in `C1-S03` |
| cell, DNA, gene | `W-S00` | `W-S00-D001`–`D003` after scale-in | Workshop exit frames only | **No** |
| RNA / transcription | `W-S01` | After the copy exists | Shape vs DNA lock | **No** |
| protein / translation | `W-S02` | After the lock turns | Protein fits, RNA does not | **No** |
| synthetic biology / DBTL | `W-S05` replay | Recap, not a password | Optional Codex | **No** |
| screening vs confirmation | Zone mark `C1-S04`; rover `C1-S06` | Spoken as 搜索區 / 確認 in `C1-S04`–`S07` | Missing public layers | Yes |
| stakeholder / HP | Chen radio `C1-S04`; walk `C1-S05` | Never as a textbook word in HUD | Output + notice + stop button | Yes |
| public communication | Chen notice + `C1-S07` map | Known / unknown / who / when on the board | Cannot publish safe-river | Yes |
| latch (function only) | Brownout memory `C1-S06` | **No formal name in P0** | Unlock steps persist | Function yes |
| replicate / variation | — | Codex stub only | C4, not P0 | No |
| containment / biosafety / biosecurity / pilot | Sealed shell as world rule | Not operated as those names | C5 / C7 / Final | No |

Banned as mainline passwords: `MerR`, `Pmer`, `dTomato`, any project sequence, media recipe, concentration, or wet-lab how-to.

---

## 4. Claim and safety wording (education copy only)

Use the claim register for **boundaries**. Do not restore its PRE pedagogy. All player-visible numeric or chart-like readouts are `TEACHING_SIMULATION`. HUD uses relative states (low / mid / high, triangle fill). If a still image could be mistaken for lab data, mark **教學模擬** on **that readout only** — never as a chapter lecture.

### 4.1 Candidate wordings Education may allow after the matching action

These are internal approved *candidates*. They still need named Science / Education sign-off before any public iGEM efficacy claim. They are **not** HUD strings.

| Claim ID | After which action | Candidate wording (zh-Hant) | Must not say |
|---|---|---|---|
| `BIO-FOUND-001` | `W-S00` scale-in | 你現在站在一個放大的細胞模型裡。 | All life is one cell type. |
| `BIO-FOUND-002` | `W-S00` short marked stretch | 那條長軌是 DNA；gene 是 DNA 上的一段。 | Gene is a separate object beside DNA. |
| `BIO-FOUND-003` | `W-S01` + `W-S02` | DNA 留在原位；機器做出一份可帶走的 RNA；protein 去做事。箭頭是資訊關係，不是物質變成下一物。 | DNA 變成 RNA；RNA 變成 protein. |
| `HG-MECH-008` (concept only, no MerR) | `W-S04`, `C1-S03` | 月亮／太陽回答的是這次運行能不能被解讀，不是河裡有甚麼。 | 有一個紅光就已確認污染. |
| `SIM-002` | Any meter | 訊號低／中／高，相對教學狀態. | Real units, LOD, 準確濃度. |
| `SIM-004` | `C1-S00`, `C1-S06`, `C1-S07` | 玩家帶回裝置和路線；確認與身分由郭工／實驗室處理. | 玩家已證實河流受污染. |
| `SAFE-001` | Never as a slogan | Safety lowers risk; it does not promise zero. | 完全安全／零風險. |
| `COMM-001` | `C1-S05`, `C1-S07` | Public board shows 目前看見 / 仍不知道 / 誰在確認 / 何時更新. | Slogan with no limit or next step. |
| `COMM-002` | Chen + 阿哲 + 郭工 | Stakeholders can reasonably need different evidence. | Residents as ignorant or anti-science. |

### 4.2 Banned player-facing fragments (Education lint)

`100%` · `完全安全` · `零風險` · `必定` · `證實污染` · `即時檢測` · `準確濃度` · `高度靈敏` · `可現場部署` · `批准部署` · `works` / `validated` / `proven` as performance claims · `全河安全` as an obtained layer · `已完成清理` as an obtained layer.

### 4.3 World-rule encoding (do not HUD-lecture)

| Limit | How the world teaches it |
|---|---|
| Screening ≠ confirmation | 郭工 owns identity. Rover enters; player does not. |
| Screening ≠ cleanup | Missing layers. No player cleanup verb. |
| Failed positive control | Sun dock max / dark blocks `?`. |
| Sealed equipment | External service ports only. No open-shell wet steps. No environmental release. |
| Player is not an authority | 方雅: 你負責帶回完整裝置和路線紀錄；郭工負責確認. |
| First failure is evidence | 方雅 forbids deleting the invalid run. Wall in `C1-S08`. |
| No zero risk | Both monitoring models keep a stop button. Residual unknown stays on the map. |

---

## 5. Scene maps

Times are script targets. “30s goal” is the first verb a new player can say in their own words.

### 5.1 Title + Hub

| ID | Name | First experience | Later name | Transfer check |
|---|---|---|---|---|
| `BOOT-S00` | 標題／冷啟動 | Cold start: 開始 / 繼續 / 設定. First play is black rain → `P-S00`. No lore wall, no biology card, no “本遊戲是教學故事”. | Game title **生命迴路：澄灣** waits until `P-S06`. Settings names (寬鬆時間, 減少動態, 大字幕) are tools, not lessons. | Player reaches `P-S00` without a lecture. Settings persist. No account, no analytics, no PII prompt. |
| `HUB-S00` | 研究站大廳 | Walk a real floor. Central table has two physical entries of equal status. Later-chapter hatch, if visible, is an honest stub. | No science naming. Optional in-world labels: 去河港, 試一次微觀工作坊, 停線（未開放）. | **Workshop skip does not lock 河港.** After C1, far-view matches `monitoringModel`. First failed run can be seen on the station wall. Stub hatch does not load a factory. |

Hub is where HP choices become furniture. If the harbor skyline and the wall of first failure do not change after C1, the chapter taught a slogan, not a consequence.

### 5.2 Prologue 黑水線

Chapter promise: like 小岑, learn move + two tools, finish a stressful readable rescue. **No biology terms during the crisis.** Formal input / signal / output wait until the rain stops.

| ID | Name | First experience | Later name | Transfer check |
|---|---|---|---|---|
| `P-S00` | 暴雨入站 | See the high flood gate and 小岑’s orange SOS every 3s. HUD: **到防洪控制室**. Walk the yellow line. Step-up a 20 cm pipe. Glass shows water + lamp. | None. 小岑 / 方雅 speak desire and route only. | Untutored player states the goal in 30s. Fall → 1.2s safety line, no death screen. Indoor door is allowed; 方雅 redirects; wall map lights a short route. Bright destination, not a paragraph. |
| `P-S01` | 電梯死機 | Push the light crate. Climb the low ladder. Camera eases in without stealing control. Find a handheld with one round button in the dark. | Tool is not defined. No “this is Flow Lens” textbook line on the table. | Interact + climb work without a timer or quiz. Player can later pick up the lens in `P-S02` without a menu lecture. |
| `P-S02` | 借來的透鏡 | Hold, aim at the wall, release. Three pipes. Follow the **moving** glow, not the brightest dead shine. First pulse is free; then a battery ring with **no definition text**. Press the loose relay home. | After the first useful pulse, characters call it 透鏡 and talk about 流動 / 反光. Do not say input / reporter yet. | Dead-bright line fades in 1s; live line still moves toward the lock. Player self-corrects. Transfer: `C1-S01` direction hunt and `C1-S06` “左邊很亮，但不動”. Occlusion and battery already exist as verbs. |
| `P-S03` | 斷掉的橋 | Tether: pull, push, rotate, snap plates into **shape** sockets. Second plate is heavier; wind tugs. | 方雅 names the **action** (抓牆上的連接工具), not a physics lecture. | Wrong pose will not snap. Drop → cable return. Fall → rope to bridge start. Assist mode auto-aligns near the correct pose. Transfer: every later carry (probe cage, beacons, rover relay). |
| `P-S04` | 閘門下方 | Combine lens + tether. Three relays: wrong path, jammed, loose. Scan for where the command **stops**, clear, then reconnect. | Everyday 訊號 / 命令. Still no promoter, sensor, or control. | Each fix adds a layer of machine sound. Last snap raises the gate and **changes water direction**. No “正確”. Transfer: `C1-S03` external-port repair uses the same “find the break, then seat it”. |
| `P-S05` | 回頭跑 | Evac. Standard 70s; relaxed timer = no hard fail, same story. Follow the white pulse. Tether a missing lever. Hold the lift until 小岑 rises. | None. Pulse is a route, not a definition of reporter. | Water-first → mist wipe, restart at corridor, **completed tethers stay**. Player can name what broke before any hint. Transfer: `C1-S02` tide evac (battery lift vs shell carry). |
| `P-S06` | 天亮之前 | Sit-down beat. Gate working outside. Title card. Two Hub doors. | 小岑 names the **method**, not a glossary: 你看它怎樣流，然後修了它. 林博士 opens the story frame: 訊號、物料、資料、一個決定落在誰身上. 方雅 points at tomorrow’s red signal. | Player can choose 河港 immediately. Skip workshop with no warning. Persist: `prologueComplete`, both tools, `xiaocen.rescued`, `workshop.available`. |

Prologue Learning Gate: destination visible without reading; bright ≠ direction taught by animation; safety rope not Game Over; **zero biology terms before the title card**.

### 5.3 Optional Workshop 微觀工作坊

Not an exam. Do first, name after. Leave / resume by scene. Completing it only changes whether 林博士 uses formal terms or living short phrases.

DNA→RNA→protein arrows are **information**, not matter converting. If the player grabs DNA, the tether shows a lock icon. That is `BIO-FOUND-003` taught as a physical rule.

| ID | Name | First experience | Later name | Transfer check |
|---|---|---|---|---|
| `W-S00` | 放大一萬倍 | Pull the scale handle. Stand inside a translucent cell. Lens the boundary, the long track, one short marked stretch. Tether the **magnifier**, never the DNA. Aim three frames in order so the door plays cell ⊃ DNA ⊃ gene. | 林博士: 細胞模型；長軌是 DNA；gene 是 DNA 上的一段. 小岑: 所以 gene 不是另一條東西？ Codex `cell`, `dnaGene` after the door animation. | Exit is aim-order, not A/B/C/D. Player can say “gene is a stretch on the track inside the cell” in their own words. **Not required for C1.** |
| `W-S01` | 保留下來的軌道 | Start the reader. A single-track RNA peels off. Tether RNA to the next station. Grabbing DNA = lock icon. Wrong station: RNA glow keeps pointing the right way. | After the copy exists: **transcription**. Codex `transcription`. | Player can say “DNA stays; a take-away copy was made.” No red X. Transfer inside workshop: `W-S02` will reject RNA in the protein lock. |
| `W-S02` | 會折起來的產物 | Watch a bead chain fold. Seat the folded protein in a lock; the lock turns. RNA has the wrong shape. | After the lock turns: **translation**, **protein**. 小岑 may recap 保存 / 帶消息 / 去做事. Codex `translation`. | Shape, not a label, opens the door. Transfer: later Bio-Rig slots are sense / regulate / **output that does work**, not a pile of names. Still not required for C1. |
| `W-S03` | 閘門與報告燈 | Run once with no smoke: gate shut, lamp dark. Open the smoke. Trace sensor → regulator → promoter → reporter. Swap the red lamp for a **shape flag**; logic unchanged. | After both runs: **input, regulator, promoter, reporter, output**. Codex `promoter`, `reporter`. | Player can change output form without breaking sensing. Transfer: Chen walk **requires** that insight as a verb. Skippers meet the same rule in `C1-S05` without these words. |
| `W-S04` | 先測設備 | Moon / sun / ? icons first. First run: sun dark because a joint is broken; `?` stays dark and **cannot** open the exit. Fix the joint. Re-run: moon dark, sun bright, `?` may speak. | After the valid pair: **negative control, positive control, valid run**. Workshop-complete players may see those small labels on C1 docks; skippers still see icons first. | Failed positive control keeps unknown unreadable. This **reappears as a hard gate** in `C1-S03` whether or not the workshop was played. |
| `W-S05` | 你剛才做的循環 | Room shrinks. Desk replays: ask → build → run → break → fix → retest. | 林博士 may say **synthetic biology** as a name for the loop just run. 小岑: 名字不是通關密碼. Codex optional. `workshop.complete = true`. | Completing is **not** a C1 key. Transfer is `C1-S02`→`S03` (invalid run, then repair references). If the player never comes here, C1 still teaches that loop by forcing it. |

Workshop Fun Gate: skip is silent and dignified; shape locks and flow, not card sort.

### 5.4 Chapter 1 紅色警報

Chapter promise (30s): find the direction of the repeating alarm so 郭工’s confirmation team has a safe route. Enjoy the hunt and the rain evac **before** controls are named. End-state the player can say: reporter is output; control proves a run is readable; a screening signal is not identity and not cleanup.

| ID | Name | First experience | Later name | Transfer check |
|---|---|---|---|---|
| `C1-S00` | 河港還在睡 | Take the sealed probe. Pick **battery or crash shell** — both legal. Wall map: intermittent harbor lamps, no matching public stations. Goal: east-shore first trace. No vials, no A/B/C/D. | Workshop complete → `C1-S00-D003` (sensor / regulator / promoter / reporter). Else → `C1-S00-D003A` (前端感到目標，中央決定是否放行，尾端把結果顯示出來). 方雅 names the **permission split**, not a disclaimer. | Loadout is a claim about risk, not a moral test. Both routes finish C1. `player.tool.sealedProbe = true`. Player can restate: we shrink the search; 郭工 confirms. |
| `C1-S01` | 第一條紅線 | Pulse + rotate the body. Reporter fills a **triangle**, never red/green only. Tether float crates; cage the probe over a cable. Distant warehouse blink is city light. Fish, smell, oil are written as observations. | 小岑 talks triangle density and direction. Do not stamp 污染證據 on environmental flavour. Formal reporter if workshop already named it; otherwise the triangle **is** the name. | `c1.firstTraceRecovered`. Player followed flow, not the brightest landmark. Probe shock: shell stays up; battery needs wall power. Transfer: later they will not treat one red flash as identity. |
| `C1-S02` | 全部都紅 | Tool saturates every facing. Player **must try** turn, leave the spot, kill the env relay. Only then does self-test blink and the mission flip to **bring the whole probe home**. Tide evac uses the loadout route. | Lived as “any direction gives the same answer.” Do not pop “invalid run = definition”. 林博士: 不能用它帶隊. | Flip is blocked until the three tests. `c1.invalidRunExperienced`. First fail is appended to `evidence.runHistory` and **cannot be deleted**. Transfer: `C1-S03` and the public map both still show that fail. Overstay → 郭工 remote lock; probe kept; no blame. |
| `C1-S03` | 先證明它看得見 | Mobile lab, three sealed docks. Moon should stay low. Sun still max = device not restored. External ports only: reset regulator relay, replace wet reporter joint. Moon low + sun high **before** `?` opens. `?` then gives a mid, fluctuating output. | After the pair works: **controls**. 林博士: 它們回答的不是河裡有甚麼，而是這次運行能不能被解讀. Workshop skippers get this name **here**, after the docks, not as homework. | Unknown dock stays closed while positive control is failed. UI never shows 100% 準確. `c1.controlsRestored`. QA: `evidence.controlRunBeforeClaim`. Transfer: second harbor entry is now possible (F6). |
| `C1-S04` | 第二次進入 | Tide changed the roads. Place up to two relay beacons + handheld probe. Overlap small enough → “worth confirming” zone. Wide/fast vs far/tight both valid. 陳姨 radio opens an **unmapped** rain gate. | 郭工: 我不需要一個紅點。我需要一個人員能安全進入的範圍. This is screening, spoken as 搜索區. Formal “screening ≠ confirmation” is completed in `C1-S07`. | `c1.sourceZoneMarked`. Map shows different confirm **time**, not a score. Stakeholder knowledge changes **geometry**, not a quiz answer. Transfer: rover path in `C1-S06` must match the marked zone. |
| `C1-S05` | 陳姨的路 | Playable walk: stall shade kills colour-only; cart blocks a low display; “紅” with no next step starts guessing. Workbench: add shape + short sound; write a concrete action; show municipal update + timestamp. Walk again. | 小岑: 換 reporter 不會改變感測邏輯，但可以改變人怎樣收到 output. 陳姨 names usability in lived words, not “Human Practices”. | **Hard gate:** `shape_audio` **and** `municipal_update_with_timestamp`. Missing visible output / action / owner → on-the-spot confusion, fix in place. QA: `evidence.userFeedbackChangedPrototype`. Transfer: `C1-S07` board and `C1-S08` stop button inherit this rule. |
| `C1-S06` | 閘門背後 | Open a remote door; send the confirmation **rover**. Player never touches the unknown. Follow flowing pulse, not bright-still residue. Latch module keeps unlock steps across brownouts — function first, no formal name. Evac on the new cable. | 郭工: 正式結果稍後由實驗室發布. Latch is “已完成步驟” as a tool behaviour only. | Rover in; player out. Wrong pressurised line → safety valve, grate blows back, retry with cause visible. Water catch-up keeps latch progress. Transfer: public map cannot claim identity. |
| `C1-S07` | 說到證據為止 | Drive a large 3D harbor map whose layers **are** run history. Five obtained layers, each with one character line. Fake 全河安全 / 已完成清理 → **目前沒有資料圖層**. Place one physical model: fixed station **or** portable kits. | 林博士: Reporter 給我們可見 output；它沒有替所有未知作答. 阿哲 will report the tool **and** the first fail **and** unfinished confirmation on the same page. | Cannot publish safe-river or cleanup. Both models complete the chapter and write `world.harbor.monitoringModel`. `c1.unresolved += confirmation_result, long_term_monitoring`. QA: `evidence.claimMatchesObservedRange`. |
| `C1-S08` | 城市回聲 | Montage of the chosen model. Chen stop button + public board exist on **both**. Station wall keeps the first fail as “the event that changed the design.” Recap is three player-caused facts, not a grade. Radio: 何主任 / 停線. | Recap names only what the player did: controls before unknown; Chen changed reporter + notice; monitoring changed the harbor. No “你理解了 control”. | Player can say the chapter promise in their own words. Hub skyline persists. C2 hatch, if visible, is an honest stub. Unresolved remains. |

`C1-S00` dialogue fork is the **only** structural effect of `workshop.complete` on Chapter 1 language. Docks in `C1-S03` may show small control labels if workshop is complete; they must still function identically for skippers.

---

## 6. Evidence → Claim → Consequence (no cards)

Old names stay. The Critical Path is spatial.

| Beat | Evidence (seen / measured / carried) | Claim (placement or action) | Consequence (world) | Revision |
|---|---|---|---|---|
| Prologue rescue | Moving glow, seated relays, rising gate | Follow flow, not shine; reconnect here | Gate up; 小岑 saved; tools owned | Safety line; tethers persist |
| Workshop controls | Moon dark / sun dark while joint is broken | Do not read `?` yet | Exit sealed | Fix joint, re-run |
| First harbor trace | Triangle density, carried record | This direction is worth a second look | `firstTraceRecovered` | Observations ≠ proof |
| Saturated probe | Three failed spatial tests | This run is unreadable | Retreat; fail kept | Repair at the lab, do not delete |
| Controls restored | Moon low, sun high | Unknown may now be looked at | `?` opens; second entry legal | First fail stays in history |
| Zone mark | Beacon geometry + probe | Wide or tight search box | Confirm-team time changes | Either box is valid |
| Chen walk | Shade, height, missing next step | Shape+sound + municipal notice | Prototype and public rule change | Fix on the spot |
| Finale | Flowing pulse, rover through the door | Player opens; 郭工 confirms | Identity still pending | Latch keeps progress |
| Public map | Only valid obtained layers | Fixed station **or** portable kits | Harbor + Hub furniture | Unresolved stays listed |

---

## 7. Human Practices in P0 (residents are stakeholders)

| Moment | Stakeholder action | Design that must change | Must not write |
|---|---|---|---|
| `C1-S01` 陳姨 at the fish | Refuses dead-fish photos as an answer; rain always brings mixed debris | Flavour clues stay observations | “Residents don’t understand science.” |
| `C1-S01` 阿哲 | Records both metal smell and diesel | Two stories kept | Panic-monger villain |
| `C1-S04` 陳姨 radio | Opens a rain gate the official map omitted | A new walkable route | “NPC selected the correct sample point.” |
| `C1-S05` 陳姨 walk | Uses the alarm as a resident would | Reporter **and** notification | Affinity meter; talk-then-identical-prototype |
| `C1-S07` 陳姨 | Allows the trial to continue **after** usable alarm, time, next step, and a stop owner | Trial continues with a stop button | “She was converted to trusting science.” |
| `C1-S07` 郭工 | Owns identity and range | Player cannot stamp 證實污染 | Player-as-regulator |
| `C1-S07` 阿哲 | Same page: help + first fail + unfinished confirm | Public map includes the fail layer | Deleted failure, heroic press release |
| `C1-S08` both models | Stop button + public board exist on both | Choice changes coverage geometry, not who may stop | Saint station vs villain kits |

No names, schools, health records, photos, voice clips of real people, or geolocation in save, UI, or education research notes. Playtests record answers **outside** the game. No in-game chat.

---

## 8. Accessibility is a learning access rule

| Setting | Learning implication |
|---|---|
| Relaxed timer | `P-S05` loses the hard 70s fail. Story and evidence identical. Do not treat relaxed as “easier science”. |
| Reduced motion | Keep spatial readability (pulse direction, triangle fill). Do not hide flow. |
| Colour + shape + sound | Already the C1 reporter rule. Colour-only is a **failed** Chen walk, not an optional skin. |
| Keyboard + mouse; hold / mash / aim alternatives | Critical Path must remain completable. |
| Large subtitles | One-line Codex / term popovers must scale with subtitles. |
| Workshop skip | Access, not a gifted certificate and not a penalty. |

---

## 9. Learning Gate — P0 pass / fail

Copy-aligned with `p0-contract.md` §8 and script appendix F/H. Fun-only does not ship; learning-only does not ship.

| # | Must pass | Scene lock | Honest fail |
|---|---|---|---|
| L1 | Unknown locked while positive control failed | `W-S04`, `C1-S03` | `?` clickable on a broken sun |
| L2 | Cannot publish 全河安全 or 已完成清理 | `C1-S07` | Green safe-river / cleanup overlay |
| L3 | Chen walk changes output **and** notification | `C1-S05` | Cutscene compliment, same prototype |
| L4 | Two monitoring models change harbor + Hub | `C1-S07`–`S08`, `HUB-S00` | Text-only recap |
| L5 | First invalid run retained on history **and** wall | `C1-S02`, `S07`, `S08` | Delete / overwrite fail |
| L6 | Workshop skip still allows full C1; living language, not a lock | `HUB-S00`, `C1-S00-D003A` | Harbor locked or “unqualified” |
| L7 | No MerR / Pmer / dTomato password | All P0 | Named-part gate |
| L8 | Player never samples, diagnoses, enforces, or approves deploy | All P0 | Vials, confirm-pollution button, cleanup verb |
| L9 | Reporter never colour-alone | `C1-S01`, `C1-S05` | Red/green-only Critical Path |
| L10 | Unresolved confirmation + long-term monitoring remain | `C1-S08` | “River solved” ending |

### 9.1 iGEM appendix H — what P0 may honestly tick

**Can tick after a passing playtest of this slice:** 30s goals for these chapters; at least one 3D-only puzzle per chapter; no click-all Critical Path; transferable words only; reporter not colour-only; C1 keeps an unknown; an NPC changes a playable parameter; a choice changes later space (harbor + Hub); failed run retained; public comms show known / unknown / owner / time; no wet-lab SOP.

**Must stay unchecked in P0:** `replicate` operated twice; biosafety vs biosecurity as distinct play; pilot / no-pilot complete endings; any public claim of educational efficacy or field utility (claim register §14 unsigned).

---

## 10. Playtest protocol (Education / HP)

Ask only open questions. No options. Record outside the game. n = 5 iGEM students who never saw the docs is the script vertical-slice floor; add zero-background players before any public efficacy sentence.

| After | Ask | Pass cue (player’s own words, not ours) |
|---|---|---|
| `P-S00` 30s | 你剛才想完成甚麼？ | 救人 / 到上面的閘 / 控制室. Not “learn biology”. |
| `P-S02` | 哪條線是有用的？你怎麼知道？ | Moving / flowing, not brightest. |
| `C1-S01` | 你現在相信甚麼？依據？還不知道甚麼？ | A direction worth carrying back; not “the river is polluted”. |
| `C1-S02` | 哪一次失敗令你改變做法？ | Tool answers the same everywhere → stop using it to lead people. Need not say *control*. |
| `C1-S03` | 為甚麼不能先看問號？ | Sun/moon (should-bright / should-dark) were not trustworthy. |
| `C1-S05` | 哪一個角色真正改變了你的設計？怎樣改？ | 陳姨; shape/sound and a next step / who updates. |
| `C1-S07` | 篩查訊號和確認來源有甚麼不同？ | We marked a zone / opened a door; lab / 郭工 still owns identity; not cleaned. |
| Any | 拿掉科學名詞你還能解釋系統嗎？ | Input–gate–output, or sense–decide–show, in lived words. |
| Any | 換成另一個生命科技情境你會先查甚麼？ | Whether the tool can still say high and low; who is affected; what stays unknown. |

Vertical-slice floors (script G): ≥4/5 prologue goal in 30s; ≥4/5 first trace without click-all or designer coaching; ≥3/5 volunteer “check the tool” after saturation; ≥4/5 separate screening from identity / cleanup; **0/5** describe the loop as 選卡 / 猜答案 / 一直按互動; ≥1 spontaneous talk about route, risk, evidence, or a character need per 10 minutes.

---

## 11. QA behavioural flags (never player-facing)

| Flag | Set when | Education meaning |
|---|---|---|
| `evidence.controlRunBeforeClaim` | Valid moon+sun before `?` or before any public layer that depends on the second run | Control is a verb |
| `evidence.failedRunRetained` | `C1-S02` run still in `evidence.runHistory` at `C1-S08` | Revision keeps first failure |
| `evidence.userFeedbackChangedPrototype` | Chen second walk uses shape+sound **and** municipal timestamp notice | HP changed the design |
| `evidence.claimMatchesObservedRange` | Public map layers ⊆ obtained valid runs; missing-layer refuse fired if 全河安全 / 已完成清理 requested | Claim ≤ evidence |

Do not surface these as badges, grades, or Codex stamps.

---

## 12. Writer / UI checklist (player-facing)

- Task line = verb + object. Example pattern: 把探頭帶回流動站, 為確認隊標出可進入的範圍.
- Name a term only after the phenomenon has been operated in **this** save, or use the living short phrase.
- Characters speak want, danger, conflict, evidence, next step. Definitions live in optional one-line Codex.
- Public UI always splits 目前看見 / 仍不知道 / 誰在確認 / 何時更新.
- No developer-voice disclaimer toast.
- No praise spam (“太棒了！你理解了 control”).
- Residents are specific and competent. Researchers can be wrong early.
- Do not end a dispute with 科學證明安全.

---

## 13. Remaining gaps (honest)

| Gap | Path / owner |
|---|---|
| No named Education / HP / Science sign-off | Legacy claim register §14 still empty. Public efficacy or field-utility claims stay **blocked**. |
| Runtime not implemented | This file is a map. Scene locks must still be built in the Three.js / DOM HUD slice. |
| Zero-background playtest not yet run | Script G floors are targets. Do not write “we proved learning” on wiki or poster. |
| English locale | Not a P0 Critical Path. If added later, it is a full locale, including these living phrases — not stickers. |
| `replicate`, layered containment, biosecurity, pilot/no-pilot | Later chapters. Do not fake them as P0 Codex exams. |
| Team construct performance | Still `TEAM_PROPOSAL` / unsigned. Do not let C1 flavour drift into MerR working-in-the-harbor. |

---

## 14. What this delivery contains

| File | Purpose |
|---|---|
| `docs/education/p0-learning.md` | This file: per-scene first experience / later name / transfer check; workshop-skip contract; Chen design-change contract; public-map refuse; HP and claim limits. |

No player-facing UI was added in this pass.
