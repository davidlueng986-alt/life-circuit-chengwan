import { assertPlayerCopy } from "./banned";
import { SPEAKER } from "./copy";

export type Channel = "body" | "radio" | "distant";

export interface Line {
  id: string;
  speaker: string;
  channel: Channel;
  text: string;
  official: boolean;
}

function line(id: string, speaker: string, text: string, channel: Channel = "body", official = true): Line {
  return { id, speaker, text, channel, official };
}

/** Official script IDs from Life_Circuit_Chengwan_Full_Game_Script_v1. Recovery extras are official=false. */
export const LINES = {
  "P-S00-D001": line("P-S00-D001", SPEAKER.xiaocen, "聽得到嗎？三號閘卡死了，我在下層平台。水已經過第一條線。", "radio"),
  "P-S00-D002": line("P-S00-D002", SPEAKER.fang, "控制室在你上方。不要跳進水道；走黃色維修線。", "radio"),
  "P-S00-D003": line("P-S00-D003", SPEAKER.xiaocen, "如果你正在欣賞風景，這場雨真的很值得。"),
  "P-S00-R001": line("P-S00-R001", SPEAKER.fang, "那邊是室內。控制室在橙燈上面。", "radio", false),

  "P-S01-D001": line("P-S01-D001", SPEAKER.fang, "電梯沒電。右邊那條梯還通。"),
  "P-S01-D002": line("P-S01-D002", SPEAKER.xiaocen, "我投票支持任何不需要我游泳的方案。"),

  "P-S02-D001": line("P-S02-D001", SPEAKER.lin, "桌上的透鏡可以叫醒維修標記。按住，對著牆，放開。", "radio"),
  "P-S02-D002": line("P-S02-D002", SPEAKER.xiaocen, "找會流動的那條，不要找最亮的。壞線也會反光。"),
  "P-S02-D003": line("P-S02-D003", SPEAKER.lin, "對，就是那條。沿著它走。"),

  "P-S03-D001": line("P-S03-D001", SPEAKER.fang, "抓牆上的連接工具。把板拉過來，扣進兩個藍色座。"),
  "P-S03-D002": line("P-S03-D002", SPEAKER.xiaocen, "慢慢轉。掉下去它會回收，但我會笑。"),

  "P-S04-D001": line("P-S04-D001", SPEAKER.fang, "電在，命令沒有到。找斷點。"),
  "P-S04-D002": line("P-S04-D002", SPEAKER.xiaocen, "第二條水線到了。你只需要讓閘門聽見一次。"),
  "P-S04-D003": line("P-S04-D003", SPEAKER.lin, "訊號走到那裡就停。先清開，再接。"),
  "P-S04-D004": line("P-S04-D004", SPEAKER.xiaocen, "收到！閘在動——等等，平台也在動。"),

  "P-S05-D001": line("P-S05-D001", SPEAKER.fang, "新路開了。跟白色脈衝走。"),
  "P-S05-D002": line("P-S05-D002", SPEAKER.xiaocen, "這個平台突然很有下沉的理想。"),
  "P-S05-D003": line("P-S05-D003", SPEAKER.xiaocen, "看見你了。別放手。"),
  "P-S05-D004": line("P-S05-D004", SPEAKER.xiaocen, "好，現在可以跑。"),
  "P-S05-R001": line("P-S05-R001", SPEAKER.xiaocen, "閘替我擋了一次。再來。", "radio", false),

  "P-S06-D001": line("P-S06-D001", SPEAKER.xiaocen, "你剛才沒有等人告訴你哪條線是答案。你看它怎樣流，然後修了它。"),
  "P-S06-D002": line("P-S06-D002", SPEAKER.lin, "城裡還有很多看不見的流路。訊號、物料、資料——甚至一個決定最後落在誰身上。"),
  "P-S06-D003": line("P-S06-D003", SPEAKER.fang, "今晚先休息。明早河港有一個紅色訊號，沒有人知道它代表甚麼。"),
  "P-S06-D004": line("P-S06-D004", SPEAKER.xiaocen, "聽起來很像我們的新工作。"),

  "W-S00-D001": line("W-S00-D001", SPEAKER.lin, "你現在站在一個放大的細胞模型裡。那條長軌是 DNA，細胞把很多資訊保存在上面。"),
  "W-S00-D002": line("W-S00-D002", SPEAKER.xiaocen, "所以 gene 不是另一條東西？"),
  "W-S00-D003": line("W-S00-D003", SPEAKER.lin, "對。gene 是 DNA 上的一段。先記住位置關係，名稱之後才有用。"),

  "W-S01-D001": line("W-S01-D001", SPEAKER.lin, "看清楚：DNA 留在原位。機器沿它讀取，做出一份新的 RNA。"),
  "W-S01-D002": line("W-S01-D002", SPEAKER.xiaocen, "不是 DNA 變成 RNA，是多了一份可以帶走的副本。"),
  "W-S01-D003": line("W-S01-D003", SPEAKER.lin, "正是。這一步叫 transcription。"),

  "W-S02-D001": line("W-S02-D001", SPEAKER.lin, "這個環按 RNA 的資訊製作一條 protein。這一步叫 translation。"),
  "W-S02-D002": line("W-S02-D002", SPEAKER.xiaocen, "DNA 保存，RNA 帶消息，protein 去做事。這比三張名字容易記。"),
  "W-S02-D003": line("W-S02-D003", SPEAKER.lin, "這只是基本模型，但已足夠讓我們開始設計輸入和輸出。"),

  "W-S03-D001": line("W-S03-D001", SPEAKER.lin, "煙霧是 input。感應部分改變 regulator，promoter 決定下游資訊何時被使用。"),
  "W-S03-D002": line("W-S03-D002", SPEAKER.xiaocen, "最後那面旗是 reporter——它報告前面的系統發生了甚麼。"),
  "W-S03-D003": line("W-S03-D003", SPEAKER.lin, "對。Reporter 讓狀態可被看見，但它不會自動告訴你輸入的所有細節。"),

  "W-S04-D001": line("W-S04-D001", SPEAKER.xiaocen, "問號是暗的。但本來應該會亮的那條也沒亮。"),
  "W-S04-D002": line("W-S04-D002", SPEAKER.lin, "所以我們現在不能相信問號。先證明設備有能力給出兩種已知結果。"),
  "W-S04-D003": line(
    "W-S04-D003",
    SPEAKER.lin,
    "月亮通道是 negative control；太陽通道是 positive control。它們不是裝飾，是這次運行能否解讀的條件。",
  ),
  "W-S04-D004": line(
    "W-S04-D004",
    SPEAKER.xiaocen,
    "不是「問號暗，所以答案是沒有」；而是「設備連應該亮的東西都看不到」。",
  ),

  "W-S05-D001": line(
    "W-S05-D001",
    SPEAKER.lin,
    "你先定義問題，再設計、建構、測試，從失敗中修正。當我們用工程方式設計生物系統，便是在做 synthetic biology。",
  ),
  "W-S05-D002": line("W-S05-D002", SPEAKER.xiaocen, "所以名字不是通關密碼。真正有用的是知道改一個條件，哪一段會跟著改。"),
  "W-S05-D003": line("W-S05-D003", SPEAKER.lin, "河港那個紅色訊號，正好需要這種思考。"),

  "C1-S00-D001": line(
    "C1-S00-D001",
    SPEAKER.xiaocen,
    "好消息：閘沒有再卡。壞消息：河港有個紅色警報，亮一下、停一下，沒人知道它在追甚麼。",
  ),
  "C1-S00-D002": line(
    "C1-S00-D002",
    SPEAKER.guo,
    "我們會做確認。你們先找出訊號集中在哪一段，別讓人員在淹水區亂走。",
    "radio",
  ),
  "C1-S00-D003": line(
    "C1-S00-D003",
    SPEAKER.lin,
    "這是封閉探頭。裡面的感測部分接到 regulator，再由 promoter 控制 reporter 輸出。",
  ),
  "C1-S00-D003A": line(
    "C1-S00-D003A",
    SPEAKER.lin,
    "這是封閉探頭。前端感到目標，中央決定是否放行訊號，尾端把結果顯示出來。",
  ),
  "C1-S00-D004": line(
    "C1-S00-D004",
    SPEAKER.fang,
    "它只替我們縮小搜索範圍。你負責帶回完整裝置和路線紀錄；郭工負責確認。",
  ),
  "C1-S00-D005": line("C1-S00-D005", SPEAKER.xiaocen, "電池讓我們多掃幾次；外殼讓我少心痛幾次。你選。"),

  "C1-S01-D001": line("C1-S01-D001", SPEAKER.xiaocen, "探頭醒了。轉慢一點；三角形跳得越密，方向越接近。"),
  "C1-S01-D002": line(
    "C1-S01-D002",
    SPEAKER.zhe,
    "市場有人說昨晚聞到金屬味，也有人只聞到柴油。我先把兩種說法都記下。",
    "distant",
  ),
  "C1-S01-D003": line(
    "C1-S01-D003",
    SPEAKER.chen,
    "別把死魚照片當成答案。這條河每次暴雨都有垃圾沖下來，來源可能不止一個。",
  ),
  "C1-S01-D004": line("C1-S01-D004", SPEAKER.xiaocen, "訊號在泵房前變強，但它仍然只是一條線。把完整記錄帶回去。"),

  "C1-S02-D001": line("C1-S02-D001", SPEAKER.xiaocen, "等等。左邊滿、右邊也滿。這不是方向。"),
  "C1-S02-D002": line("C1-S02-D002", SPEAKER.lin, "先停。若工具在任何地方都給同一答案，我們不能用它帶隊。"),
  "C1-S02-D003": line("C1-S02-D003", SPEAKER.fang, "流動站在高地。帶回完整探頭，不要在現場拆。"),
  "C1-S02-D004": line("C1-S02-D004", SPEAKER.xiaocen, "好，第一次遠征的成果是：我們知道自己現在不知道。跑吧，潮水回來了。"),

  "C1-S03-D001": line(
    "C1-S03-D001",
    SPEAKER.lin,
    "先別碰問號。月亮應該暗，太陽應該亮；只有它們都正常，未知結果才有意思。",
  ),
  "C1-S03-D002": line("C1-S03-D002", SPEAKER.xiaocen, "昨晚我們測門鎖，今天先測測量它的東西。很公平。"),
  "C1-S03-D003": line(
    "C1-S03-D003",
    SPEAKER.lin,
    "這兩個已知狀態就是 controls。它們回答的不是河裡有甚麼，而是這次運行能不能被解讀。",
  ),
  "C1-S03-D004": line("C1-S03-D004", SPEAKER.fang, "把第一次失效留在紀錄裡。刪掉它，不會令第二次更可靠。"),
  "C1-S03-D005": line("C1-S03-D005", SPEAKER.xiaocen, "現在它會說「低」、會說「高」，也會承認中間。第二次進去。"),

  "C1-S04-D001": line("C1-S04-D001", SPEAKER.guo, "我不需要一個紅點。我需要一個人員能安全進入的範圍。"),
  "C1-S04-D002": line("C1-S04-D002", SPEAKER.xiaocen, "第一個 relay 在唱。移動幾步，看兩條線在哪裡交。"),
  "C1-S04-D003": line("C1-S04-D003", SPEAKER.chen, "舊燈具倉後面有一條雨水閘，地圖上沒標。去年維修過一次。", "radio"),
  "C1-S04-D004": line("C1-S04-D004", SPEAKER.xiaocen, "這就是我們缺的路。不是居民替我們選答案，是她知道地圖漏了甚麼。"),
  "C1-S04-D005": line("C1-S04-D005", SPEAKER.guo, "搜索區收到。先不要進閘後；等確認隊接手。"),

  "C1-S05-D001": line("C1-S05-D001", SPEAKER.chen, "你們的裝置在桌上看得很清楚。現在把它放到我們真的會站的位置。"),
  "C1-S05-D002": line("C1-S05-D002", SPEAKER.chen, "棚下只剩一團暗紅。若我要靠它行動，就不能只照顧一雙眼睛。"),
  "C1-S05-D003": line("C1-S05-D003", SPEAKER.zhe, "「紅色警報」很適合標題，但居民下一步要做甚麼？等誰更新？"),
  "C1-S05-D004": line("C1-S05-D004", SPEAKER.xiaocen, "換 reporter 不會改變感測邏輯，但可以改變人怎樣收到 output。"),
  "C1-S05-D005": line(
    "C1-S05-D005",
    SPEAKER.chen,
    "現在我看得見形狀、聽得到短聲，也知道去哪裡查更新。這才是一個可用的警報。",
  ),

  "C1-S06-D001": line("C1-S06-D001", SPEAKER.guo, "你們開門，我們送車。裡面由確認隊處理。"),
  "C1-S06-D002": line("C1-S06-D002", SPEAKER.xiaocen, "左邊很亮，但不動。右邊弱一點，還在流。跟右邊。"),
  "C1-S06-D003": line(
    "C1-S06-D003",
    SPEAKER.lin,
    "每次斷電都把門鎖清零。我把「已完成步驟」模組送進你的工具。接到記憶槽。",
  ),
  "C1-S06-D004": line("C1-S06-D004", SPEAKER.xiaocen, "它記住了！再接最後一條。"),
  "C1-S06-D005": line("C1-S06-D005", SPEAKER.guo, "車已進入。搜索區和你們的路線吻合；正式結果稍後由實驗室發布。"),
  "C1-S06-D006": line("C1-S06-D006", SPEAKER.fang, "水位到黃線。工作完成，撤。"),

  "C1-S07-D001": line(
    "C1-S07-D001",
    SPEAKER.zhe,
    "我會報道工具幫忙縮小搜索區，也會把第一次失效和確認尚未完成放在同一頁。",
  ),
  "C1-S07-D002": line("C1-S07-D002", SPEAKER.guo, "確認隊已封鎖舊閘後的來源區。物質身分和影響範圍由正式分析更新。"),
  "C1-S07-D003": line("C1-S07-D003", SPEAKER.chen, "公告上有時間、有下一步，也看得到誰能暫停設備。這次我願意讓試行繼續。"),
  "C1-S07-D004": line("C1-S07-D004", SPEAKER.lin, "Reporter 給我們可見 output；它沒有替所有未知作答。"),

  "C1-S08-D001": line("C1-S08-D001", SPEAKER.xiaocen, "我們第一次出去想找一個紅點，最後帶回來的是一套會承認失效的方法。"),
  "C1-S08-D002": line("C1-S08-D002", SPEAKER.fang, "很好。因為下一個電話，是一條不肯停下來的生產線。"),
  "C1-S08-D003": line("C1-S08-D003", SPEAKER.he, "更正：它已經停了。我需要你們找出為甚麼必須停。", "radio"),

  "C2-STUB-R001": line("C2-STUB-R001", SPEAKER.fang, "這扇維修艙還沒接通。先處理眼前的河港。", "body", false),
} as const satisfies Record<string, Line>;

export type LineId = keyof typeof LINES;

for (const entry of Object.values(LINES)) {
  assertPlayerCopy(entry.text, entry.id);
}

export function getLine(id: string): Line | null {
  if (Object.prototype.hasOwnProperty.call(LINES, id)) {
    return LINES[id as LineId];
  }
  return null;
}

export function lineDurationMs(text: string): number {
  return Math.min(14000, Math.max(4800, text.length * 260));
}

export function channelAria(entry: Line): string {
  if (entry.channel === "radio") return `${entry.speaker} 無線電`;
  if (entry.channel === "distant") return `${entry.speaker} 遠處`;
  return entry.speaker;
}
