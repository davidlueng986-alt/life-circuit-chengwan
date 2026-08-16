import { assertPlayerCopy } from "./banned";
import type { CodexTerm, SceneId, SubtitleScale } from "./ids";

/** Official task lines from docs/design/p0-ui.md. Do not lecture-paraphrase. */
export const TASK: Record<string, string> = {
  "HUB-S00": "走到中央桌",
  "P-S00": "到防洪控制室",
  "P-S01-crate": "推開工具箱",
  "P-S01-ladder": "爬上維修梯",
  "P-S02-pick": "拾起桌上的透鏡",
  "P-S02-pulse": "對牆放出脈衝",
  "P-S02-follow": "跟隨會流動的線",
  "P-S02-seat": "壓回鬆脫的接頭",
  "P-S03-pick": "抓取牆上的連接工具",
  "P-S03-snap": "把板扣進形狀座",
  "P-S04": "找出訊號斷點",
  "P-S05-run": "跑到救援平台",
  "P-S05-hold": "按住升降開關",
  "W-S00-enter": "走進細胞模型",
  "W-S00-aim": "依序對準三個放大框",
  "W-S01": "把信使複本（RNA）引到下一站",
  "W-S02": "把工作蛋白（protein）放進門鎖",
  "W-S03-smoke": "打開煙霧模擬器（輸入）",
  "W-S03-trace": "追蹤訊號怎麼走到燈",
  "W-S03-flag": "換上形狀旗（報告器）",
  "W-S04-refs": "先跑月亮（應關）和太陽（應開）",
  "W-S04-fix": "修好太陽接頭",
  "W-S04-unknown": "對照都正常後，再看問號",
  "W-S05": "看完這次循環",
  "C1-S00-pick": "選一件裝備",
  "C1-S00-go": "帶探頭去東岸",
  "C1-S01-hunt": "找出訊號方向",
  "C1-S01-back": "把紀錄帶回",
  "C1-S02": "把探頭帶回流動站",
  "C1-S03-refs": "先證明月亮暗、太陽亮（對照組）",
  "C1-S03-unknown": "對照正常後，再解讀問號",
  "C1-S04": "標出可進入的範圍",
  "C1-S04-wide": "交疊還不夠小",
  "C1-S04-ok": "範圍已可交給確認隊",
  "C1-S05-walk": "讓陳姨再走一次",
  "C1-S05-desk": "改輸出，寫下一步",
  "C1-S06-open": "開門送入無人車",
  "C1-S06-evac": "撤離",
  "C1-S07-layers": "打開發布圖層",
  "C1-S07-place": "放上一種監測模型",
  "C2-STUB": "尚未開放",
};

export const PROMPT = {
  interact: "互動",
  wallMap: "看牆上簡圖",
  pushCrate: "推開 工具箱",
  climb: "爬上 維修梯",
  pickLens: "拾起 透鏡",
  pulseWall: "對牆 放出脈衝",
  seatRelay: "壓回 接頭",
  pickTether: "取下 連接工具",
  snapPlate: "扣進 形狀座",
  grabPlate: "再抓一次",
  pickProbe: "拾起 探頭",
  battery: "帶上 備用電池",
  shell: "帶上 抗撞外殼",
  doorHarbor: "去河港",
  doorWorkshop: "試一次微觀工作坊",
  doorWorkshopResume: "回到工作坊",
  hatchC2: "停線（未開放）",
  advance: "進入",
  shapeAudio: "輸出改為形狀與短聲",
  notice: "寫上市政更新與時間",
  placeFixed: "放下 固定站模型",
  placeKits: "放下 流動套件模型",
  missingLayer: "目前沒有資料圖層",
  wallPower: "接到牆上電源",
  turn: "轉身",
  leave: "離開原位",
  killRelay: "關閉環境 relay",
  pickLever: "抓取 拉桿",
  seatLever: "扣上 拉桿",
  holdLift: "按住 升降開關",
  pullMag: "拉近 放大框",
  guideRna: "引導 RNA",
  seatProtein: "放入 門鎖",
  openSmoke: "打開 煙霧模擬器",
  swapFlag: "換上 形狀旗",
  seatJoint: "接回 太陽接頭",
  parkBeacon: "放下 中繼",
  seatLatch: "接入 記憶槽",
  openDoor: "開啟 遠端門",
  moonDock: "扣入 月亮槽",
  sunDock: "扣入 太陽槽",
  unknownDock: "扣入 問號槽",
  bind: "E",
} as const;

export const SPEAKER = {
  xiaocen: "小岑",
  fang: "方雅",
  lin: "林博士",
  chen: "陳姨",
  zhe: "阿哲",
  guo: "郭工",
  he: "何主任",
} as const;

export const UI = {
  title: "生命迴路：澄灣",
  kicker: "澄灣研究站",
  start: "開始",
  cont: "繼續",
  settings: "設定",
  pause: "暫停",
  resume: "繼續",
  backTitle: "回到標題",
  backHub: "回到研究站",
  leaveWorkshop: "離開工作坊",
  codex: "詞彙",
  close: "關閉",
  webgl: "無法啟動 3D",
  webglBody: "這個瀏覽器沒有可用的立體畫面。可改用其他瀏覽器，或檢查硬體加速。",
  retry: "重試",
  confirmNewTitle: "重新開始",
  confirmNew: "會覆蓋本機進度。確定？",
  confirmYes: "確定",
  confirmNo: "返回",
  corrupt: "本機進度讀不到。可重新開始。",
  relaxed: "寬鬆時間",
  reducedMotion: "減少動態",
  holdAlt: "點按代替長按",
  vibration: "震動",
  subtitle: "字幕大小",
  fov: "視野",
  textScale: "介面文字",
  highContrast: "高對比",
  interactionList: "列出可互動物件",
  audioOn: "開啟聲音",
  nextChapter: "下一章：停線",
  wallEvent: "令設計改變的事件",
  simMark: "教學模擬",
} as const;

export const SCAN = {
  titleOn: "掃描中",
  titleOff: "先看地上光環",
  hold: "按住 Q 對準，放開後放出脈衝。",
  noLens: "還沒有透鏡。地上光環＋名稱＝可互動。",
  charging: "充電中 · 放開 Q 放出脈衝",
} as const;

export const SUBTITLE_LABEL: Record<SubtitleScale, string> = {
  1: "標準",
  1.25: "大",
  1.5: "更大",
  2: "最大",
};

/** Approved one-liners from docs/claims/p0-claims.md §7. Do not rewrite. */
export const CODEX_TITLE: Record<CodexTerm, string> = {
  cell: "細胞 cell",
  dnaGene: "DNA／基因 gene",
  transcription: "轉錄 transcription",
  translation: "轉譯 translation",
  input: "輸入 input",
  regulator: "調控器 regulator",
  promoter: "啟動子／閘門 promoter",
  reporter: "報告器 reporter",
  output: "輸出 output",
  controls: "對照組 control",
  validRun: "可解讀的運行",
  screening: "篩查",
};

export const CODEX_LINE: Record<CodexTerm, string> = {
  cell: "細胞是有邊界的生命單位；你剛走進的是放大模型。",
  dnaGene: "DNA 是保存資訊的長軌。gene 是其上可被使用的一段，不是另一條東西。",
  transcription: "細胞沿 DNA 讀取，做出一份可帶走的 RNA；DNA 留在原位。這步叫 transcription。",
  translation: "細胞按 RNA 的資訊製作 protein，並折成能做事的形狀。這步叫 translation。",
  input: "Input 是裝置感到的條件；感測把它變成內部訊號。",
  regulator: "Regulator 依感測結果，改變下游能不能通過。",
  promoter: "Promoter 是決定下游資訊何時被使用的閘門。",
  reporter: "Reporter 把系統狀態變成可見、可聽或可摸的 output；它不自動說出輸入的全部細節。",
  output: "Output 是系統對外顯示的結果；換顯示方式不必等於換了感測邏輯。",
  controls: "Negative control 應保持低輸出；positive control 應給出高輸出。它們判斷這次運行能不能讀。",
  validRun: "已知暗與已知亮都正確時，未知結果才有意思。Positive 失效時，未知不可讀。",
  screening: "篩查用來縮小搜索範圍。身分、影響範圍與清理要另走確認與權責流程。",
};

export const RECAP = [
  "你修好應關／應開對照組（controls）後，才重新解讀未知訊號。",
  "陳姨的試走令報告器（reporter）加上形狀、聲音，並寫明誰更新。",
  "你選的監測方式已經改了河港現場的設施。",
] as const;

export const BAND_ZH: Record<string, string> = {
  low: "低",
  mid: "中",
  high: "高",
  fluctuating: "波動",
  saturated: "全紅飽和",
};

export const COMM = {
  seen: "目前看見",
  unknown: "仍不知道",
  who: "誰在確認",
  when: "何時更新",
  display: "顯示方式",
  nextStep: "下一步",
  updateOwner: "誰更新、何時",
  shapeAudio: "形狀與短聲",
  colorOnly: "只顯示顏色",
  actionLeave: "離開封鎖區，查看市政更新",
  actionNone: "未寫下一步",
  municipal: "市政更新板（含時間）",
  updateNone: "未指定更新",
  low: "低",
  high: "高",
  midWave: "中、波動",
  runClock: "本次運行（秒）",
  moon: "月亮",
  sun: "太陽",
  unknownDock: "問號",
  negCtrl: "應關對照（negative control）",
  posCtrl: "應開對照（positive control）",
  unknownFormal: "未知樣本",
  firstFail: "第一次失效",
  layerFail: "第一次失效（工具全紅）",
  layerControls: "對照組已修好",
  layerZone: "交疊區",
  layerRoute: "確認隊路線",
  layerWait: "等待實驗室結果",
  fakeSafe: "全河安全",
  fakeClean: "已完成清理",
  fixed: "固定站",
  kits: "流動套件",
} as const;

for (const [key, line] of Object.entries(TASK)) assertPlayerCopy(line, `TASK.${key}`);
for (const [key, line] of Object.entries(PROMPT)) assertPlayerCopy(line, `PROMPT.${key}`);
for (const [key, line] of Object.entries(SCAN)) assertPlayerCopy(line, `SCAN.${key}`);
for (const [key, line] of Object.entries(CODEX_LINE)) assertPlayerCopy(line, `CODEX.${key}`);
for (const line of RECAP) assertPlayerCopy(line, "RECAP");

export function defaultTask(id: SceneId): string {
  switch (id) {
    case "BOOT-S00":
    case "P-S06":
    case "C1-S08":
      return "";
    case "HUB-S00":
      return TASK["HUB-S00"] ?? "";
    case "P-S00":
      return TASK["P-S00"] ?? "";
    case "P-S01":
      return TASK["P-S01-crate"] ?? "";
    case "P-S02":
      return TASK["P-S02-pick"] ?? "";
    case "P-S03":
      return TASK["P-S03-pick"] ?? "";
    case "P-S04":
      return TASK["P-S04"] ?? "";
    case "P-S05":
      return TASK["P-S05-run"] ?? "";
    case "W-S00":
      return TASK["W-S00-enter"] ?? "";
    case "W-S01":
      return TASK["W-S01"] ?? "";
    case "W-S02":
      return TASK["W-S02"] ?? "";
    case "W-S03":
      return TASK["W-S03-smoke"] ?? "";
    case "W-S04":
      return TASK["W-S04-refs"] ?? "";
    case "W-S05":
      return TASK["W-S05"] ?? "";
    case "C1-S00":
      return TASK["C1-S00-pick"] ?? "";
    case "C1-S01":
      return TASK["C1-S01-hunt"] ?? "";
    case "C1-S02":
      return TASK["C1-S01-hunt"] ?? "";
    case "C1-S03":
      return TASK["C1-S03-refs"] ?? "";
    case "C1-S04":
      return TASK["C1-S04"] ?? "";
    case "C1-S05":
      return TASK["C1-S05-walk"] ?? "";
    case "C1-S06":
      return TASK["C1-S06-open"] ?? "";
    case "C1-S07":
      return TASK["C1-S07-layers"] ?? "";
    case "C2-STUB":
      return TASK["C2-STUB"] ?? "";
    default:
      return "";
  }
}

export function withBind(prompt: string): string {
  return `${prompt}　${PROMPT.bind}`;
}
