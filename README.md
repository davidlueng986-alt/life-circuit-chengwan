# 生命迴路：澄灣

iGEM 2026 教育遊戲。第三人稱 3D 冒險為先：暴風雨後，玩家以流路透鏡、連接工具與封閉生命模組，追蹤澄灣裡看不見的訊號、物料與資料流。

本倉庫目前是 **可執行 P0 骨架**（2026-08-15 Game-first rewrite）。標題、大廳、序章 `P-S00` 暴雨灰盒、`P-S01` 推箱爬梯，以及其餘 P0 場景的目的地灰盒已接通。完整謎題、動畫與音訊關卡尚未實作。

- 語言：玩家介面 `zh-Hant`
- 本地部署對等網址：<http://127.0.0.1:8787>
- 存檔：僅瀏覽器 `localStorage`（鍵 `life-circuit-chengwan.save.v1`）
- 無帳號、無後端、無分析、無遠端遙測

## 腳本

```bash
npm install
npm run dev          # Vite 快速迭代（http://localhost:5173）
npm run build        # 產出 dist/
npm run preview      # Vite 預覽（不能代替 Cloudflare 路徑）
npm run cf:dev       # vite build 後 wrangler dev --port 8787
npm run cf:dry       # 建置 + wrangler deploy --dry-run
npm run cf:deploy    # 建置 + 正式部署（需明確授權）
npm run typecheck    # TypeScript strict（客戶端 + Worker）
```

部署對等測試必須走 **`npm run cf:dev`**，然後開啟 <http://127.0.0.1:8787>。`vite preview` 只是額外檢查。

## 技術棧

| 項目 | 選擇 |
|---|---|
| 語言 | TypeScript strict |
| 打包 | Vite（`base: './'`） |
| 畫面 | Three.js 世界 + 語意 DOM HUD |
| 託管 | Cloudflare Workers 靜態資產 SPA |
| 設定 | `wrangler.jsonc`（非 toml） |
| Worker | `src/worker.ts`：`/health`、安全標頭、`env.ASSETS.fetch` |

官方文件（撰寫設定前已核對，2026-08-15）：

- https://developers.cloudflare.com/workers/static-assets/
- https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/
- https://developers.cloudflare.com/workers/static-assets/binding/
- https://developers.cloudflare.com/workers/static-assets/headers/
- https://developers.cloudflare.com/workers/wrangler/configuration/

`assets.directory` 為 `./dist`。`not_found_handling` 為 `single-page-application`。`run_worker_first` 只套在 `/health`，好讓 `public/_headers` 作用在靜態檔。雜湊後的 `/assets/*` 長快取；`index.html` 為 `no-cache`。

## 權威順序

1. 團隊科學／安全具名簽核（若存在；目前未簽）
2. `Life_Circuit_Chengwan_Full_Game_Script_v1`（game-first）
3. 舊包 `20_SOURCE_AND_CLAIM_REGISTER` 僅安全與宣稱用字
4. 舊 GDD／TDD 僅在不衝突時參考

P0 範圍：標題 + 大廳、序章 `P-S00`–`P-S06`、可選工作坊 `W-S00`–`W-S05`（可跳過、絕非資格門）、第一章 `C1-S00`–`C1-S08`。第二章起只允許誠實 stub。

## 正式部署

僅在 **同時** 滿足以下條件時才執行 `npm run cf:deploy`：

1. 對話中 `LIVE_DEPLOY_REQUESTED` 為 true
2. `npx wrangler whoami` 成功

否則停在 dry-run，並寫明阻擋原因。本骨架預設 **不** 做 live deploy。

## 目錄

```
src/main.ts          客戶端啟動
src/worker.ts        Cloudflare Worker
src/engine/          迴圈、第三人稱、存檔、三件工具 API
src/scenes/          場景登錄與灰盒
src/content/         場景表、對白、存檔型別
src/ui/              DOM HUD 與標題／暫停／設定
public/_headers      靜態資產快取與 CSP
docs/                P0 合約、關卡、系統、安全、宣稱
```

## 隱私與安全

不要把玩家姓名、學校、健康、照片或位置寫進存檔。不要加聊天、帳號或遙測。讀數皆為教學模擬。篩查 ≠ 確認 ≠ 清理。沒有環境釋放，也沒有零風險宣稱。
