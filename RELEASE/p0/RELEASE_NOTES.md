# 生命迴路：澄灣 — P0 發行說明

版本：工作流 `life-circuit-chengwan` 完成本（2026-08-15）  
狀態：**CONDITIONAL**（本機可開、可 dry-run；非正式 RC）  
語言：玩家介面繁體中文

## 範圍

已接通標題、研究站 Hub、序章《黑水線》P-S00–P-S06、可選微觀工作坊 W-S00–W-S05、第一章《紅色警報》C1-S00–C1-S08。第二章只保留「尚未開放」stub。

玩法依 2026-08-15 game-first 腳本：第三人稱、流路透鏡、連接工具、封閉生命模組。主線沒有卡牌／選擇題通關。

## 託管

| 項目 | 狀態 |
|---|---|
| `wrangler deploy --dry-run` | 通過 |
| 本機 `wrangler dev :8787` | 通過（`/`、`/health`、SPA `/hub`） |
| 正式 `wrangler deploy` | **未執行**（本輪 `deploy: false`） |
| 後端／帳號／遙測 | 無。存檔只在 `localStorage` |

本機：

```bash
cd C:\Users\daive\life-circuit-chengwan
npm install
npm run build
npx wrangler dev --port 8787
```

上線（需已 `wrangler login`）：

```bash
npm run cf:deploy
```

Windows 上長時間 `wrangler dev` 熱重載可能讓 workerd 崩潰；正式試玩請先 `npm run build` 再開 wrangler，少改檔。

## 科學與安全

讀數皆為教學模擬。篩查 ≠ 確認 ≠ 清理。工程細胞不進河。玩家不採樣、不診斷、不執法。工作坊可略過，系統不會把它標成已完成。

## 已知限制

- 視覺仍是灰盒；部分場景第一眼目標曾被 QA 判定不清（打光／鏡頭；後續源碼已修一部分，未再做完整真人重測）。
- Fun Gate（30 秒說出眼前目標）**尚未**用 5 名未讀文件的受測者通過。
- 三角定位與部分第一章節拍與腳本幾何不完全一致（見 `docs/qa/p0-verify-play.md`）。
- `docs/qa/p0-verify-science.md` 未產出（驗證槽失敗）。
- 工作流報告列 2 個失敗槽；`RELEASE/` 原為 Deploy 代理應寫而未寫，本檔為完跑後補齊。

## 裝置

目標：桌面 Chrome／Edge。鍵盤滑鼠。學校機 30 FPS 與完整平板／手機路徑尚未實測。
