# P0 驗收對照

| 腳本承諾 | 證據 | 判定 |
|---|---|---|
| 序章可玩、先救人再講術語 | `src/scenes/prologue/`、`docs/qa/p0-verify-play.md` | 源碼通過；真人全程未重測 |
| 工作坊可選、離開不完成 | `leaveWorkshop` 只寫 resume；Harbor 不讀 `workshop.complete` | 通過 |
| 第一章非四點採樣 | `C1-S01` 依訊號密度推進 | 源碼通過 |
| 失效後先修 control | `C1-S02`→`C1-S03` docks；failed run 保留 | 源碼通過 |
| 陳姨試走改 output | `C1-S05` 需 shape_audio + 更新責任 | 源碼通過 |
| 公開地圖無「已清理」層 | `C1-S07` 假圖層顯示沒有資料 | 源碼通過 |
| 點遍選項不能通關 | 驗證報告 §1 | 通過 |
| Cloudflare SPA 本機 | `docs/qa/p0-verify-cloudflare.md`、`docs/ops/dry-run.txt` | 本機通過；未 live deploy |
| 科學宣稱檔 | `docs/claims/p0-claims.md`、`docs/safety/p0-boundaries.md` | 有文件；對抗科學驗證檔缺失 |
