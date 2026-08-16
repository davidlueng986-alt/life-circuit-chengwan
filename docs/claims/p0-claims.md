# P0 科學宣稱登記 — 生命迴路：澄灣

| Field | Value |
|---|---|
| Document | `docs/claims/p0-claims.md` |
| Machine companion | `content/claims/p0.json` |
| Version | `2026-08-15-p0` |
| Role | Synthetic Biology PI wording for Title / Hub / Prologue / optional Workshop / Chapter 1 |
| Locale | `zh-Hant`（玩家可見）。英文僅供內部對照，不是 P0 已簽核 locale |
| Script authority | `Life_Circuit_Chengwan_Full_Game_Script_v1`（2026-08-15 Game-first Rewrite） |
| Legacy reference | `20_SOURCE_AND_CLAIM_REGISTER.md` **safety / claim wording / maturity tags only** |
| Named team sign-off | **None present as of 2026-08-15** |

本文件是 P0 可寫進遊戲的科學句子邊界。它不實作關卡，不恢復卡牌測驗，不把開發者免責聲明貼進 HUD。

---

## 0. Authority and what this document is allowed to do

When documents conflict:

1. Named team Science / Safety / Privacy / Child-safeguarding sign-off（2026-08-15：**absent**）.
2. New full script `Life_Circuit_Chengwan_Full_Game_Script_v1`.
3. Legacy claim register：**maturity tags, banned phrases, player is not an authority, screening ≠ confirmation ≠ cleanup, no zero-risk**.
4. Legacy GDD / TDD only if they do not restore PRE lecture, MerR/Pmer/dTomato as a password, or developer-voice HUD.

This PI pass **approves-with-limits** the exact player / Codex / public-map wording needed to ship the P0 greybox.

This PI pass **does not**:

- sign a public iGEM educational-efficacy claim;
- sign a field-utility, calibration, LOD, or “validated sensor” claim;
- approve any team experimental number;
- restore the mercury / MerR / Pmer / dTomato Critical Path;
- approve the aptamer public route (`APT-004` remains `NOT_APPROVED`);
- invent assay numbers, concentrations, host names, sequences, or response-time specs.

P0 in-world devices and meters are **story prototypes presented as teaching simulations**. They are not the team construct, not a licensed instrument, and not a river diagnosis.

---

## 1. Maturity tags

Keep the legacy taxonomy. Do not invent a sixth public meaning for the same sentence.

| Tag | 中文顯示（內部／Codex 標籤用） | Definition | P0 public use |
|---|---|---|---|
| `MECHANISM` | 文獻機制 | 可遷移的一般機制或入門生物學；仍須寫 context | 可，限核准 wording；不可推論本探頭已實測 |
| `TEAM_PROPOSAL` | 團隊設計提案（尚待驗證） | 團隊想測試的設計，不代表已工作 | **P0 玩家主線不出現** |
| `TEAM_DATA` | 團隊實驗資料 | 有方法、版本、原始資料、分析與限制 | **P0 無簽核資料；禁止** |
| `STORY_PROTOTYPE` | 故事原型（虛構） | 為敘事而設的封閉裝置、河港警報、確認隊流程 | 可，必須當世界物件，不可當真實儀器型錄 |
| `TEACHING_SIMULATION` | 教學模擬 | 玩法用的相對狀態、幾何交疊、月亮／太陽 dock | 可；所有讀數永久屬此層 |
| `UNVERIFIED` | 未驗證 | 資料或 context 不足 | 不可作肯定宣稱 |
| `NOT_APPROVED` | 未核准公開 | 科學、Safety 或來源不足 | 不可進公開 build／海報／wiki |

**Layer rule:** mechanism literature ≠ team proposal ≠ team experiment ≠ story fiction ≠ teaching simulation.

A single UI string may have:

- `maturity` = the *kind of knowledge* (e.g. DNA stays in place = `MECHANISM`);
- `presentation` = *how it appears in the game* (workshop model / probe meter = `TEACHING_SIMULATION` or `STORY_PROTOTYPE`).

Never print `TEAM_DATA` on a simulated triangle fill.

### Claim status

| Status | Meaning in this file |
|---|---|
| `Approved` | Design / safety rule. Use as written. |
| `Approved with limits` | Use **only** the registered wording and limits. Default for P0 science sentences. |
| `Needs source` | Do not write as fact. |
| `NOT_APPROVED` | Do not ship. |
| `Retired-P0-mainline` | Legacy mercury / named-part sentences. Not a gate, not a HUD label. |

Public iGEM wiki / poster / video still needs **named** Science + Safety sign-off. Until then, field-utility and “this game teaches X to all novices” remain blocked even if a row below is `Approved with limits` for in-game greybox copy.

---

## 2. Science boundaries that P0 must implement as world rules

Do not lecture these as “本章不代表……”. Encode them so the player *cannot* do the forbidden act.

| ID | World rule | Scene / system |
|---|---|---|
| `P0-RULE-001` | 生命模組／探頭保持封閉。只有外部維修接口。無序列、培養條件、濃度、濕實驗步驟。 | Sealed Bio-Rig; `C1-S00`–`S03` |
| `P0-RULE-002` | 太陽／positive 參考失效時，問號／unknown **不可讀、不可當證據**。修好並再跑月亮低＋太陽高之後才開放。 | `W-S04`, `C1-S03` |
| `P0-RULE-003` | 第一次失效 run 寫入 `evidence.runHistory` 且不可刪。研究站牆保留該事件。 | `C1-S02`/`S03`/`S08` |
| `P0-RULE-004` | 公開地圖只能打開已取得且有效的圖層。「全河安全」「已完成清理」顯示「目前沒有資料圖層」。 | `C1-S07` |
| `P0-RULE-005` | 玩家不採樣、不開殼接觸未知物、不發布正式身分、不執法、不批准部署。確認隊無人車進入閘後；實驗室稍後發布正式結果。 | `C1-S00`, `C1-S06`, `C1-S07` |
| `P0-RULE-006` | Reporter 輸出必須有形狀、聲音或填充動畫；禁止只有顏色。陳姨試走通過條件含 shape+sound **且** 市政更新＋時間戳。 | `C1-S01`, `C1-S05` |
| `P0-RULE-007` | 讀數只用相對狀態：低／中／高／波動、三角形填充、脈衝疏密。不寫真實單位、LOD、濃度、校準曲線。 | All meters |
| `P0-RULE-008` | 修復後 UI **永不**顯示「100% 準確」。只顯示兩個 control 狀態與本次運行時間（會話時鐘，不是 T90）。 | `C1-S03` |
| `P0-RULE-009` | 兩種監測模型都是完整通關，改變河港與 Hub 遠景；不是聖／惡分數。 | `C1-S07`/`S08` |
| `P0-RULE-010` | 工作坊可略過，不顯示資格警告，不鎖第一章。只改變林博士用語（正式詞 vs 生活短句）。 | Hub, `C1-S00-D003` / `D003A` |
| `P0-RULE-011` | 主線不出現 MerR、Pmer、dTomato、Hg²⁺、aptamer 作為通關或探頭身分。 | All P0 player surfaces |
| `P0-RULE-012` | 無環境釋放任何活體系統。無「零風險／完全安全」。 | All P0 |

---

## 3. Numeric policy — no invented assay numbers

P0 **has no approved measurement numbers**.

| Allowed (game feel / session metadata) | Forbidden (do not invent or import) |
|---|---|
| 相對：低、中、高、波動 | nM、µM、µg/L、ppb、ppm、CFU、RFU 校準 |
| 三角形逐步填滿、脈衝變密 | LOD、LOQ、dynamic range 數字 |
| 交疊區幾何「夠小」 | 「準確到 X 公尺」的感測規格 |
| 月亮暗／太陽亮／問號中等波動 | ON/OFF ratio、fold-change |
| 本次運行時鐘、70 秒撤離、1.2 秒安全繩 | T90、響應時間、螢光成熟分鐘數當科學規格 |
| 「放大一萬倍」作為房間演出 | 宣稱該倍率等於真實顯微術 |
| 確認時間因寬／窄搜索區而不同（敘事） | 把該時間寫成實驗室 TAT 或方法學數據 |

If any later public string contains a number **plus a scientific unit**, it needs a Claim ID and a real source. P0 has neither. Gameplay clocks must not be relabeled as sensor specs.

Legacy performance adjectives also stay banned: `highly sensitive`、`rapid`、`accurate`、`selective`、`real-world ready`、`field-ready`.

---

## 4. Transferable terms P0 may name — after the player operates them

Mainline may teach only these words (script list). P0 *operates* a subset. Later words may exist as Codex stubs, not as Chapter 2–7 gameplay.

| Term | First operate | First name | P0 one-line meaning (Codex, after unlock) | Not this |
|---|---|---|---|---|
| cell | `W-S00` scale into model | `W-S00` | 細胞是有邊界的生命單位；這個房間是放大模型。 | 不是整座城市；不是「所有生命只有一種細胞」 |
| DNA | `W-S00`/`W-S01` track stays | `W-S00` | DNA 是細胞用來保存資訊的長軌；它留在原位。 | 不是被拆走變成 RNA 的材料 |
| gene | `W-S00` short marked stretch | `W-S00` | gene 是 DNA 上可被細胞使用的一段，不是另一條東西。 | 不是整個細胞；不要求背某個基因名 |
| RNA | `W-S01` peel a copy | `W-S01` | RNA 是依 DNA 讀出來、可以帶走的副本。 | 不是 DNA 物質變成 RNA |
| protein | `W-S02` fold and fit lock | `W-S02` | protein 依 RNA 的資訊做成，並折成能做事的形狀。 | 不是成品藥；不是「細胞本身」 |
| transcription | `W-S01` | after copy exists | 沿 DNA 讀取並做出 RNA 的步驟。 | 不是密碼；不教聚合酶品牌 |
| translation | `W-S02` | after fold exists | 依 RNA 資訊製作 protein 的步驟。 | 不教密碼表記憶 |
| input / sensor | Prologue pulse; smoke; probe aim | after the feel | 裝置感到的外界條件；感測把它轉成內部訊號。 | 不是答案高亮 |
| regulator | `W-S03` / `C1-S03` relay | after gate changes | 依感測結果，改變下游能不能通過。 | 不是永遠等於 repressor；不是 MerR 密碼 |
| promoter | `W-S03` gate | after gate opens | 決定下游資訊何時被使用的閘門。 | 不是任意可互換零件；不背 Pmer |
| reporter / output | lamp / flag / triangle | after it reports | 把系統狀態變成可看見、聽見或改變形狀的輸出。 | 不自動等於輸入的全部細節或濃度 |
| control | `W-S04`, `C1-S03` | after failed sun | 已知暗與已知亮，用來判斷**這次運行**能不能解讀。 | 不是河裡有甚麼 |
| valid run | same | after both refs work | 已知低與已知高都反應正確時，未知結果才有意思。 | 不是 100% 準確 |
| screening | `C1-S00`–`S04` | `C1-S07` player can say it | 縮小搜索範圍的訊號。 | 不是身分，不是清理完成 |
| stakeholder | `C1-S05` Chen walk | after design changes | 會被設計影響、也能改變設計的人。 | 不是「反科學群眾」 |
| containment | sealed kit, no release | light / world rule | 生命模組保持封閉；失效時仍應有下一層擋住。 | 不是零風險；不是完整 BSL 課 |
| biosafety | sealed + no release | Codex stub only in P0 | 降低危害途徑，不是保證安全。 | 不操作 C5 完整路徑 |
| biosecurity | — | **not operated in P0** | — | 勿在 P0 主線展開 dual-use 細節 |
| replicate | fluctuating unknown dock | **not a P0 gate** | 一次結果可以波動；單次不是穩定規律。 | 不發明 n=3 統計 |
| pilot | Chen「試行繼續」 | light only | 在有停止權與更新責任下，讓監測試行繼續。 | 不是批准部署活體或終章 pilot |

Terms appear **after** the matching verb. Workshop skip keeps living phrases (`C1-S00-D003A`) until the player later operates the idea.

---

## 5. Surfaces and voice

| Surface | Allowed | Forbidden |
|---|---|---|
| HUD / task | 動詞＋物件：「把探頭帶回流動站」 | 「完成練習不代表……」「本章涉及……」「這是教學故事」 |
| Dialogue | 眼前風險、需求、證據、下一步；術語在動作後 | NPC 背定義、評分規準、安全守則 |
| Codex | 解鎖後一句話，可關閉 | 考試、分數、未操作就鎖關 |
| Meters | 低／中／高、形狀填充 | 真實單位；無標示卻像實驗圖 |
| Public map | 已取得圖層；已知／未知／誰確認／何時更新 | 「全河安全」「已完成清理」「證實污染」 |
| Still readout that could be screenshot as “lab data” | 該讀數上標 **教學模擬**（只標讀數，不當章節講課） | 啟動畫面法律免責朗讀 |
| Wiki / poster / trailer | 待具名簽核；此時不可宣稱實測或教學成效 | 把遊戲截圖當團隊數據 |

角色語氣以腳本為準。下列科學句是腳本已寫、本 PI **核准其科學含義** 的句子；實作時不要擅自加成績數字。

---

## 6. Claim register

Wording in **可使用 wording** is the only approved player-facing science sentence for that ID. Paraphrases that raise certainty, add numbers, or name a real analyte are out of scope.

### 6.1 Layers and presentation

| Claim ID | Maturity | Status | 可使用 wording | 必須限制 | 禁止 wording |
|---|---|---|---|---|---|
| `P0-LAYER-001` | — | Approved | 「文獻機制、團隊提案、團隊實驗、故事裝置、教學模擬不是同一件事。」 | 內部／教師資料。不要讓角色朗讀分層講義 | 把探頭讀數稱為「團隊實驗結果」 |
| `P0-LAYER-002` | `STORY_PROTOTYPE` + `TEACHING_SIMULATION` | Approved with limits | 「澄灣的封閉探頭與河港讀數是故事裡的教學裝置。」 | 只在內部、截圖保護或讀數水印；**不要**在 HUD 講課 | 「本裝置已獲監管批准」「現場即時確認污染」 |
| `P0-LAYER-003` | `TEAM_DATA` | `NOT_APPROVED` | 無 | P0 沒有簽核數據包 | 任何「團隊已測得……」＋數字或性能形容詞 |

### 6.2 Workshop — cell, DNA, gene, RNA, protein

These are introductory **MECHANISM** statements shown inside a **TEACHING_SIMULATION** room. Sources: new script `W-S00`–`W-S02`; legacy `BIO-FOUND-001`–`003`; `BIO-CENTRAL-DOGMA-MISCONCEPTION`（箭頭是資訊關係，不是物質變成另一物）。

| Claim ID | Maturity | Status | 可使用 wording | 必須限制 | 禁止 wording | Scenes |
|---|---|---|---|---|---|---|
| `P0-BIO-001` | MECHANISM | Approved with limits | 「你現在站在一個放大的細胞模型裡。」／Codex：細胞是有邊界的生命單位；這個房間是放大模型。 | 入門尺度；模型 ≠ 某一真實物種的完整解剖；「一萬倍」是演出 | 「這就是真實細胞的精確剖面」；要求記住某種宿主 | `W-S00` |
| `P0-BIO-002` | MECHANISM | Approved with limits | 「那條長軌是 DNA，細胞把很多資訊保存在上面。」／「DNA 留在原位。」 | DNA 是保存資訊的分子；不要說成整座細胞 | 「DNA 被拆走去做 RNA」；任意序列字串 | `W-S00`, `W-S01` |
| `P0-BIO-003` | MECHANISM | Approved with limits | 「gene 是 DNA 上的一段。先記住位置關係，名稱之後才有用。」 | 產物可以是 RNA 或 protein；本模型接著做 protein | 「gene 是另一條獨立的東西」；把某個專名當密碼 | `W-S00` |
| `P0-BIO-004` | MECHANISM | Approved with limits | 「不是 DNA 變成 RNA，是多了一份可以帶走的副本。」之後才命名 transcription。 | 箭頭＝資訊流。原 DNA 保留 | 「DNA 變成 RNA」；教可執行的轉錄配方 | `W-S01` |
| `P0-BIO-005` | MECHANISM | Approved with limits | 「這個環按 RNA 的資訊製作一條 protein。」之後才命名 translation。 | 基本模型；真實調控更複雜 | 「RNA 物質直接變成 protein」；密碼表背誦通關 | `W-S02` |
| `P0-BIO-006` | MECHANISM | Approved with limits | 「DNA 保存，RNA 帶消息，protein 去做事。」 | 口訣是關係，不是完整組學 | 「一個細胞只有這三樣」；「protein 就是藥」 | `W-S02` |
| `P0-BIO-007` | MECHANISM | Approved with limits | 「這只是基本模型，但已足夠讓我們開始設計輸入和輸出。」 | 承認簡化 | 「你已學會全部分子生物學」 | `W-S02` |
| `P0-BIO-008` | TEACHING_SIMULATION | Approved | 出口以鏡頭對準 cell ⊃ DNA ⊃ gene 的包含關係開門；不是三選一考卷。 | 空間關係，不是分數 | 卡牌排序當 Critical Path | `W-S00` |

Legacy `BIO-FOUND-001` 的「細菌是一個細胞、人體由許多細胞組成」**可留在可選 Codex 擴寫**，但新工作坊沒有操作該對比，故 **不是 P0 過關句**。

### 6.3 Input, gate, reporter

Teaching abstraction: sensor changes a regulator state; a promoter-like gate decides whether downstream information is used; a reporter makes state observable. This is **not** a specific topology and **not** MerR/Pmer.

| Claim ID | Maturity | Status | 可使用 wording | 必須限制 | 禁止 wording | Scenes |
|---|---|---|---|---|---|---|
| `P0-SYS-001` | MECHANISM | Approved with limits | 「煙霧是 input。」／生活句：「前端感到目標。」 | 先操作再命名。Input 不是答案 | 「感應器已辨認污染物身分」 | `W-S03`, `C1-S00` |
| `P0-SYS-002` | MECHANISM | Approved with limits | 「感應部分改變 regulator，promoter 決定下游資訊何時被使用。」／生活句：「中央決定是否放行訊號。」 | 入門抽象；regulator 不永遠等於 repressor | 「只要把某蛋白放在 promoter 前就會啟動」；MerR／Pmer 當通關 | `W-S03`, `C1-S00` |
| `P0-SYS-003` | MECHANISM | Approved with limits | 「最後那面旗是 reporter——它報告前面的系統發生了甚麼。」／「Reporter 讓狀態可被看見，但它不會自動告訴你輸入的所有細節。」 | 需要表達與可見輸出；可有短暫延遲 | 「一亮就等於濃度數字」；「reporter 已確認河裡是甚麼」 | `W-S03`, `C1-S07` |
| `P0-SYS-004` | TEACHING_SIMULATION | Approved | Reporter 必須同時有形狀、聲音或填充動畫；禁止只有紅／綠。 | 可及性與科學同一規則 | 色盲不可讀的單色狀態當唯一證據 | `W-S03`, `C1-S01`, `C1-S05` |
| `P0-SYS-005` | STORY_PROTOTYPE | Approved with limits | 「換 reporter 不會改變感測邏輯，但可以改變人怎樣收到 output。」 | 輸出通道 ≠ 分析結論 | 「換燈就等於換了一種檢測方法並已驗證」 | `C1-S05` |
| `P0-SYS-006` | TEACHING_SIMULATION | Approved | 「找會流動的那條，不要找最亮的。壞線也會反光。」亮度 ≠ 方向。 | 序章與閘後殘留訊號同一規則 | 把最亮城市燈當來源答案 | `P-S02`, `C1-S01`, `C1-S06` |
| `P0-SYS-007` | STORY_PROTOTYPE | Approved with limits | 工作坊完成：「這是封閉探頭。裡面的感測部分接到 regulator，再由 promoter 控制 reporter 輸出。」未完成：用 `C1-S00-D003A` 生活句。 | 故事裝置的功能槽；不是團隊 construct 圖 | 「此探頭即團隊 MerR–Pmer–dTomato 系統且已工作」 | `C1-S00` |
| `P0-SYS-008` | TEACHING_SIMULATION | Approved | 訊號可被遮擋、背景、裝置故障或錯誤參考扭曲；透鏡不是答案高亮器。 | 與工具契約一致 | 「掃一下就得到正確來源」 | Flow Lens all P0 |

### 6.4 Controls and valid runs

General experimental logic (`HG-MECH-008` 的可遷移部分），**不**綁定汞或特定 control 名稱表。

| Claim ID | Maturity | Status | 可使用 wording | 必須限制 | 禁止 wording | Scenes |
|---|---|---|---|---|---|---|
| `P0-CTRL-001` | MECHANISM | Approved with limits | 「月亮通道是 negative control；太陽通道是 positive control。它們不是裝飾，是這次運行能否解讀的條件。」未上工作坊者先只顯示圖示。 | 遊戲圖示先於術語。OFF＝低輸出／低於這次參考，不是絕對零表達 | 「完全沒有轉錄」；把月亮／太陽當河水答案 | `W-S04`, `C1-S03` |
| `P0-CTRL-002` | MECHANISM | Approved | 「不是『問號暗，所以答案是沒有』；而是『設備連應該亮的東西都看不到』。」 | 硬閘：failed positive → unknown unreadable | 「全暗＝河裡沒有東西」 | `W-S04`, `C1-S03` |
| `P0-CTRL-003` | MECHANISM | Approved | 「先別碰問號。月亮應該暗，太陽應該亮；只有它們都正常，未知結果才有意思。」 | 先修設備，再解讀未知 | 問號與失效太陽同時當證據 | `C1-S03` |
| `P0-CTRL-004` | MECHANISM | Approved | 「這兩個已知狀態就是 controls。它們回答的不是河裡有甚麼，而是這次運行能不能被解讀。」 | 一次 run 的可讀性，不是環境結論 | 「controls 已證明污染／已證明安全」 | `C1-S03` |
| `P0-CTRL-005` | MECHANISM | Approved | 「若工具在任何地方都給同一答案，我們不能用它帶隊。」 | 飽和輸出＝失效，不是全域高濃度圖 | 「整條河都是最高濃度」 | `C1-S02` |
| `P0-CTRL-006` | TEACHING_SIMULATION | Approved | 「把第一次失效留在紀錄裡。刪掉它，不會令第二次更可靠。」 | `evidence.runHistory` 不可刪 | 自動清失敗只留漂亮結果 | `C1-S03`, `C1-S08` |
| `P0-CTRL-007` | TEACHING_SIMULATION | Approved | 修復後只顯示兩個 control 狀態與本次運行時間。 | 運行時間＝會話時鐘 | 「100% 準確」「已校準」「validated」 | `C1-S03` |

### 6.5 Screening, uncertainty, public claim scope

| Claim ID | Maturity | Status | 可使用 wording | 必須限制 | 禁止 wording | Scenes |
|---|---|---|---|---|---|---|
| `P0-MEAS-001` | MECHANISM | Approved | 「它只替我們縮小搜索範圍。你負責帶回完整裝置和路線紀錄；郭工負責確認。」 | 篩查 ≠ 確認 ≠ 清理 ≠ 身分 | 「玩家已證實河流受污染」；採樣瓶／A-B-C-D | `C1-S00` |
| `P0-MEAS-002` | MECHANISM | Approved | 「我不需要一個紅點。我需要一個人員能安全進入的範圍。」 | 交疊區＝值得確認的範圍 | 單一紅點＝物質身分 | `C1-S04` |
| `P0-MEAS-003` | MECHANISM | Approved | 「別把死魚照片當成答案。這條河每次暴雨都有垃圾沖下來，來源可能不止一個。」 | 魚、氣味、油膜＝觀察，不是污染證明 | 「死魚＝已確認毒物種類」 | `C1-S01` |
| `P0-MEAS-004` | STORY_PROTOTYPE | Approved with limits | 市場傳聞「金屬味／柴油味」可並記；兩者都不是身分。 | 傳聞不是分析 | 把「金屬味」寫成汞／Hg²⁺ 已確認 | `C1-S01` |
| `P0-MEAS-005` | MECHANISM | Approved | 「確認隊已封鎖舊閘後的來源區。物質身分和影響範圍由正式分析更新。」 | 章末 `unresolved` 必含 `confirmation_result` | 「身分已由探頭確定」 | `C1-S07` |
| `P0-MEAS-006` | TEACHING_SIMULATION | Approved | 相對狀態可用「低／中／高／波動」。三角形密度表示方向接近，不是濃度。 | 無真實單位 | 任意單位當真實校準；「準確濃度」 | All C1 meters |
| `P0-MEAS-007` | TEACHING_SIMULATION | Approved with limits | 問號 dock 可呈中等、帶波動的輸出。 | 波動教不確定性；不是 replicate 研究 | 「n=3 已達統計顯著」；強迫二元有／無 | `C1-S03` |
| `P0-MEAS-008` | MECHANISM | Approved | 篩查訊號 ≠ 污染物身分 ≠ 清理完成。公開地圖拒絕「全河安全」「已完成清理」。 | 以缺圖層呈現，不訓斥 | 通關標語覆蓋未知 | `C1-S07` |
| `P0-MEAS-009` | TEACHING_SIMULATION | Approved | 寬而快或遠而窄的交疊都合法；只改變確認隊時間，不變分數。 | 兩路皆通關 | 「較窄＝科學上更正確所以加分」 | `C1-S04` |

### 6.6 Player role and authority

Maps legacy `ROLE-001` / `ROLE-002` onto the new script’s 系統跑手.

| Claim ID | Maturity | Status | 可使用 wording | 必須限制 | 禁止 wording |
|---|---|---|---|---|---|
| `P0-ROLE-001` | STORY_PROTOTYPE | Approved | 玩家是澄灣研究站的系統跑手：追蹤、搬運、接駁、撤離、把完整裝置與路線帶回。 | 不是監管、醫師、執法、診斷官員 | 「你已批准部署／已診斷污染／已下令清理」 |
| `P0-ROLE-002` | STORY_PROTOTYPE | Approved | 「你們開門，我們送車。裡面由確認隊處理。」玩家不接觸未知物。 | 無人車＋實驗室發布正式結果 | 玩家進閘後採樣或開殼 |
| `P0-ROLE-003` | — | Approved | 玩家永不採樣、診斷、執法或批准部署。 | 硬規則 | 採樣瓶、診斷報告按鈕、部署批准鈕 |

### 6.7 Safety, sealed kit, residual risk

Maps `SAFE-001` / `SAFE-002`. P0 只操作「封閉＋不釋放＋主張受限」，不是第五章完整 biosafety 關。

| Claim ID | Maturity | Status | 可使用 wording | 必須限制 | 禁止 wording |
|---|---|---|---|---|---|
| `P0-SAFE-001` | MECHANISM | Approved | 安全措施降低風險，不能保證零風險。 | 世界用封閉殼、權限、停止鈕呈現；勿 HUD 講課 | 「完全安全」「零風險」「科學證明安全」 |
| `P0-SAFE-002` | STORY_PROTOTYPE | Approved | 封閉探頭只在受控設備與外部接口維修；不開殼、不釋放活體。 | 無濕實驗 how-to | 培養基、濃度、序列、環境釋放玩法 |
| `P0-SAFE-003` | STORY_PROTOTYPE | Approved | 通關 ≠ 可部署。C1 結束仍保留確認結果與長期監測未知。 | `c1.unresolved` | 「遊戲通關即表示可現場部署」 |
| `P0-SAFE-004` | STORY_PROTOTYPE | Approved with limits | 兩種監測模型都有陳姨可及的停止按鈕與公開更新板。 | 停止權是試行條件，不是否決科學的嘲諷 | 藏起停止權；寫成居民無理取鬧 |
| `P0-SAFE-005` | — | Approved | P0 不展開 biosecurity／dual-use 操作細節；高後果能力資料不出現。 | C7 不在範圍 | 可執行 misuse、病原、毒素、危險序列 |

### 6.8 Public communication and Human Practices

Maps `COMM-001` / `COMM-002` / `SIM-005`. Chen’s walk is playable, not a cutscene.

| Claim ID | Maturity | Status | 可使用 wording | 必須限制 | 禁止 wording | Scenes |
|---|---|---|---|---|---|---|
| `P0-COMM-001` | TEACHING_SIMULATION | Approved | 公開介面分開：目前看見、仍不知道、誰在確認、何時更新。 | 少一項，陳姨試走就出現具體混亂 | 只有標題「紅色警報」、無下一步 | `C1-S05`, `C1-S07` |
| `P0-COMM-002` | STORY_PROTOTYPE | Approved | 「我會報道工具幫忙縮小搜索區，也會把第一次失效和確認尚未完成放在同一頁。」 | 記者不是恐慌反派 | 刪失效、只留成功 | `C1-S07` |
| `P0-COMM-003` | TEACHING_SIMULATION | Approved | 嘗試打開不存在的圖層時，介面只說「目前沒有資料圖層」。 | 不訓斥、不扣分 | 「錯誤！你不該這樣主張」紅叉 | `C1-S07` |
| `P0-COMM-004` | — | Approved | 禁止開發者腔進玩家 UI。限制用世界規則呈現。 | 見 §5、§8 | 「完成這個練習不代表……」「這不是指引」 |
| `P0-HP-001` | STORY_PROTOTYPE | Approved | 居民是 stakeholder。陳姨指出地圖漏了雨水閘，是地方知識，不是代玩家選答案。 | 兩個監測模型都合理 | 把居民寫成無知或反科學 |
| `P0-HP-002` | STORY_PROTOTYPE | Approved | 陳姨試走**必須**改 reporter（形狀＋短聲）**且**改通知（離開封鎖區、查看市政更新、更新時間可見）。 | 缺一項不能當通過 | 對話後原型不變 |
| `P0-HP-003` | STORY_PROTOTYPE | Approved with limits | 「公告上有時間、有下一步，也看得到誰能暫停設備。這次我願意讓試行繼續。」 | 這是監測警報試行，不是批准環境釋放或終章 pilot | 「居民已批准部署活體檢測器」 |
| `P0-HP-004` | STORY_PROTOTYPE | Approved | 固定站：較重、連續供電、品質較一致；覆蓋少，單點故障影響大。 | 不是唯一正解 | 「固定站 100% 可靠」 |
| `P0-HP-005` | STORY_PROTOTYPE | Approved | 流動套件：覆蓋多、可移動；需要充電、回收、版本與訓練。 | 不是唯一正解 | 「流動套件已是現場確認工具」 |

### 6.9 Synthetic biology name (after the loop)

| Claim ID | Maturity | Status | 可使用 wording | 必須限制 | 禁止 wording | Scenes |
|---|---|---|---|---|---|---|
| `P0-BIO-009` | MECHANISM | Approved with limits | 「你先定義問題，再設計、建構、測試，從失敗中修正。當我們用工程方式設計生物系統，便是在做 synthetic biology。」 | 先做完循環再命名。名字不是通關密碼 | 「背出 DBTL 四字就能過關」；宣稱團隊已完成真實 DBTL 驗證 | `W-S05` |
| `P0-BIO-010` | MECHANISM | Approved | 「真正有用的是知道改一個條件，哪一段會跟著改。」 | 可遷移思維 | 專案元件名當密碼 | `W-S05` |

### 6.10 Monitoring models and remaining unknowns

| Claim ID | Maturity | Status | 可使用 wording | 必須限制 | 禁止 wording |
|---|---|---|---|---|---|
| `P0-MON-001` | STORY_PROTOTYPE | Approved | 固定站與流動套件都是完整結局；遠景設施必須不同。 | 兩者都保留停止鈕與更新板 | 隱藏其中一路當失敗 |
| `P0-MON-002` | STORY_PROTOTYPE | Approved | 章末未知至少包括：確認結果、長期監測。 | 未知要連到下一步，不是免責聲明 | 「河港問題已完全解決」 |
| `P0-MON-003` | STORY_PROTOTYPE | Approved with limits | 「我們第一次出去想找一個紅點，最後帶回來的是一套會承認失效的方法。」 | 方法 ≠ 已驗證現場儀器 | 「我們已有可部署的確認方法」 |

### 6.11 Named cases, team proposal, aptamer — not P0 mainline

| Claim ID | Maturity | Status | Ruling |
|---|---|---|---|
| `P0-NAMED-001` | — | Approved | 主線與過關**不**要求 MerR、Pmer、dTomato 或任何專案專名。 |
| `P0-NAMED-002` | — | Approved | P0 **不**把河港紅色訊號鑑定為汞／Hg²⁺。傳聞「金屬味」保持為未證實觀察。 |
| `P0-NAMED-003` | TEAM_PROPOSAL | Retired-P0-mainline | 舊 `HG-TEAM-001`–`003`（constitutive MerR ＋ Pmer–dTomato 兩轉錄單元）不得標成「這就是玩家手上的探頭」。 |
| `P0-NAMED-004` | MECHANISM | Retired-P0-mainline | 舊 `HG-MECH-001`–`006` 可留在團隊內部機制檔；**不進 P0 玩家 UI**。若未來可選 Codex 要寫金屬感應調控，須另簽，且不得當密碼、不得給未提供的 spacer／性能數字。 |
| `P0-NAMED-005` | TEAM_DATA | `NOT_APPROVED` | 舊 `HG-TEAM-004`/`005`：無數據包，禁止任何性能句。 |
| `P0-APT-001` | TEAM_PROPOSAL | `NOT_APPROVED` | 舊 `APT-004` 維持未核准。P0 不出現 aptamer／riboswitch 路線。 |
| `P0-BLOCK-001` | — | `NOT_APPROVED` | 禁止：「本遊戲已證明能教會所有零背景玩家」。成效需要本遊戲自己的測試與具名簽核。 |
| `P0-BLOCK-002` | — | `NOT_APPROVED` | 禁止：現場即時檢測、已驗證、可部署、準確濃度、高度靈敏／選擇性。 |
| `P0-BLOCK-003` | — | `NOT_APPROVED` | 禁止：玩家或探頭「證實污染」「批准清理」「宣布全河安全」。 |

Legacy `HG-MECH-009` 的科學含義保留為 `P0-MEAS-001`／`P0-MEAS-008`，但 **不要**把舊 HUD 句 `science.limit.notMeasurement`（「此遊戲不是實際汞檢測……」）貼進玩家畫面。汞字本身已不屬於 P0 故事。

---

## 7. Approved Codex one-liners (unlock after action)

Show only after the matching flag. Closable. Not a score.

| Unlock | zh-Hant |
|---|---|
| `codex.cell` | 細胞是有邊界的生命單位；你剛走進的是放大模型。 |
| `codex.dnaGene` | DNA 是保存資訊的長軌。gene 是其上可被使用的一段，不是另一條東西。 |
| `codex.transcription` | 細胞沿 DNA 讀取，做出一份可帶走的 RNA；DNA 留在原位。這步叫 transcription。 |
| `codex.translation` | 細胞按 RNA 的資訊製作 protein，並折成能做事的形狀。這步叫 translation。 |
| `codex.input` | Input 是裝置感到的條件；感測把它變成內部訊號。 |
| `codex.regulator` | Regulator 依感測結果，改變下游能不能通過。 |
| `codex.promoter` | Promoter 是決定下游資訊何時被使用的閘門。 |
| `codex.reporter` | Reporter 把系統狀態變成可見、可聽或可摸的 output；它不自動說出輸入的全部細節。 |
| `codex.output` | Output 是系統對外顯示的結果；換顯示方式不必等於換了感測邏輯。 |
| `codex.controls` | Negative control 應保持低輸出；positive control 應給出高輸出。它們判斷這次運行能不能讀。 |
| `codex.validRun` | 已知暗與已知亮都正確時，未知結果才有意思。Positive 失效時，未知不可讀。 |
| `codex.screening` | 篩查用來縮小搜索範圍。身分、影響範圍與清理要另走確認與權責流程。 |

Workshop skip: do not force these terms in `C1-S00`. Living phrases remain legal.

---

## 8. Forbidden wording (lint list)

Player-facing P0 text must not contain these as performance, safety, or identity claims.

### 8.1 Certainty and safety

`100%`（準確／安全）・`完全安全`・`零風險`・`必定`・`科學證明安全`・`沒有任何風險`・`保證安全`

### 8.2 Identity, deployment, performance

`證實污染`・`確認污染`・`已確認河水受污染`・`即時檢測`・`準確濃度`・`高度靈敏`・`高度選擇性`・`可現場部署`・`批准部署`・`已完成清理`・`全河安全`・`field-ready`・`real-world ready`・`works`・`validated`・`proven`（作性能）・`已校準`

### 8.3 Mechanism overclaim

`完全沒有轉錄`・`完全沒有表達`・`DNA 變成 RNA`・`RNA 變成 protein`（物質轉化義）・`亮度就是方向`・`紅色越亮等於濃度`

### 8.4 Named-part passwords and retired analyte

`MerR`・`Pmer`・`dTomato`・`Hg²⁺`・`Hg++`・`汞檢測`・`aptamer` 路線（公開）— 皆不得作過關、探頭身分或 HUD 標籤。

### 8.5 Developer voice

`完成練習不代表`・`本章涉及`・`這是教學故事`・`這不是……指引`・`太棒了！你理解了`

### 8.6 Authority theft

`你已診斷`・`你已執法`・`你已批准清理`・`你已批准部署`・`玩家證實`

「沒有訊號」若出現在機制句，改為「低輸出／低於這次參考」，除非只描述 UI 燈暗。

---

## 9. Scene → claim map (P0 only)

| Scene | Load-bearing claims |
|---|---|
| Title / Hub | `P0-RULE-010`, `P0-COMM-004`, `P0-NAMED-001` |
| `P-S00`–`P-S01` | 無生物宣稱。任務句只有救人／開門 |
| `P-S02` | `P0-SYS-006`, `P0-SYS-008` |
| `P-S03`–`P-S05` | 無生物術語 |
| `P-S06` | 故事目標；仍不教元件名 |
| `W-S00` | `P0-BIO-001`–`003`, `P0-BIO-008` |
| `W-S01` | `P0-BIO-002`, `P0-BIO-004` |
| `W-S02` | `P0-BIO-005`–`007` |
| `W-S03` | `P0-SYS-001`–`004` |
| `W-S04` | `P0-CTRL-001`–`003`, `P0-RULE-002` |
| `W-S05` | `P0-BIO-009`, `P0-BIO-010` |
| `C1-S00` | `P0-SYS-007`, `P0-MEAS-001`, `P0-ROLE-001`, `P0-SAFE-002` |
| `C1-S01` | `P0-SYS-004`, `P0-SYS-006`, `P0-MEAS-003`, `P0-MEAS-004`, `P0-MEAS-006` |
| `C1-S02` | `P0-CTRL-005`, `P0-CTRL-006` |
| `C1-S03` | `P0-CTRL-001`–`007`, `P0-MEAS-007`, `P0-RULE-002` |
| `C1-S04` | `P0-MEAS-002`, `P0-MEAS-009`, `P0-HP-001` |
| `C1-S05` | `P0-SYS-005`, `P0-COMM-001`, `P0-HP-002` |
| `C1-S06` | `P0-SYS-006`, `P0-ROLE-002`, `P0-MEAS-005` |
| `C1-S07` | `P0-MEAS-005`, `P0-MEAS-008`, `P0-COMM-001`–`003`, `P0-HP-003`–`005`, `P0-MON-001` |
| `C1-S08` | `P0-CTRL-006`, `P0-MON-002`–`003`, `P0-SAFE-003` |
| `C2-STUB` | 無新科學宣稱；誠實未開放 |

Chapters 2–final are **not** claimed here. Insulin, LacI, hydrolase, supply, dual-use, cell-free, and final pilot/no-pilot stay `Future / Needs source` per legacy §11.

---

## 10. QA behavioural evidence (not player badges)

Use save events only. Do not show as score.

| Flag | Pass meaning |
|---|---|
| `evidence.controlRunBeforeClaim` | Unknown was locked until moon+sun valid |
| `evidence.failedRunRetained` | First saturated run still in history and on the wall |
| `evidence.userFeedbackChangedPrototype` | Chen walk wrote `shape_audio` and `municipal_update_with_timestamp` |
| `evidence.claimMatchesObservedRange` | Public map has no safe-river / cleanup layer |

---

## 11. Sign-off

| Review | Name | Date | Decision |
|---|---|---|---|
| Synthetic Biology PI：P0 transferable wording + world rules | Role fill for this document | 2026-08-15 | **Approved with limits** for P0 *implementation copy* in `docs/claims/p0-claims.md` + `content/claims/p0.json` |
| Named team Science Lead | 待指派 | — | 待決定。未簽前禁止公開效能／現場效用宣稱 |
| Safety / Security | 待指派 | — | 待決定。P0 已禁止釋放、how-to、dual-use 細節 |
| Education / Human Practices | 待指派 | — | 待決定。居民／陳姨規則先按腳本實作 |
| Communications / Localization | 待指派 | — | 待決定。譯文不得升高確定性 |
| QA：banned phrases / meters / missing layers | 待指派 | — | 以 `content/claims/p0.json` lint |

---

## 12. Gaps

| Gap | Path |
|---|---|
| No named Science / Safety signature | Legacy register §14 still empty. This file is PI wording, not a public-release stamp. |
| No team data package | Do not fill `TEAM_DATA` rows. |
| Named-case Codex (MerR family as application background) | Not in P0 content. Requires a later signed page that still must not be a password. |
| Aptamer route | Remains `NOT_APPROVED`. |
| `replicate`, biosafety vs biosecurity as *played* distinction, final pilot | Out of P0. Do not fake them with a quiz. |
| English locale | Not signed. `enInternal` in JSON is implementer gloss only. |

Writers: if a sentence is not in `content/claims/p0.json` and makes a scientific or public-health claim, do not ship it.
