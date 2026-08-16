import { BAND_ZH, COMM, UI } from "../content/copy";
import type { AccessibilityOutput, NotificationRule } from "../content/ids";
import type { RunRecord, SaveState } from "../content/saveTypes";

export interface ChenDraft {
  output: AccessibilityOutput;
  action: boolean;
  notice: NotificationRule;
}

export interface WorkbenchHooks {
  onChenChange: (draft: ChenDraft) => void;
  onChenWalk: () => void;
  onOpenLayer: (id: string) => void;
  onMissingLayer: () => void;
  onPlaceModel: (model: "fixed_station" | "portable_kits") => void;
}

export class Workbench {
  private readonly root: HTMLElement;
  private readonly title: HTMLElement;
  private readonly body: HTMLElement;
  private hooks: WorkbenchHooks | null = null;
  private chen: ChenDraft = {
    output: "color_only",
    action: false,
    notice: "none",
  };

  constructor() {
    this.root = must("#workbench");
    this.title = must("#workbench-title");
    this.body = must("#workbench-body");
  }

  bind(hooks: WorkbenchHooks): void {
    this.hooks = hooks;
  }

  close(): void {
    this.root.hidden = true;
    this.body.replaceChildren();
  }

  openDocks(save: SaveState, sunFixed: boolean, unknownOpen: boolean, clockLabel: string): void {
    this.root.hidden = false;
    this.title.textContent = "封閉測試槽";
    this.body.replaceChildren();
    const formal = save.workshop.complete;
    this.body.append(
      dockRow(formal ? `${COMM.moon} · ${COMM.negCtrl}` : COMM.moon, COMM.low, "moon"),
      dockRow(formal ? `${COMM.sun} · ${COMM.posCtrl}` : COMM.sun, sunFixed ? COMM.high : COMM.low, "sun"),
      dockRow(COMM.runClock, clockLabel, "clock"),
      dockRow(
        formal ? `${COMM.unknownDock} · ${COMM.unknownFormal}` : COMM.unknownDock,
        unknownOpen ? COMM.midWave : "—",
        "unknown",
      ),
    );
    const fail = save.evidence.runHistory.find((run) => run.kind === "saturated" || (run.kind === "sun" && !run.readable));
    if (fail) this.body.append(historyRow(fail));
    const mark = document.createElement("p");
    mark.className = "sim-mark";
    mark.textContent = UI.simMark;
    this.body.append(mark);
  }

  openChen(save: SaveState): void {
    this.chen = {
      output: save.c1.accessibilityOutput ?? "color_only",
      action: save.c1.notificationRule === "municipal_update_with_timestamp",
      notice: save.c1.notificationRule ?? "none",
    };
    this.root.hidden = false;
    this.title.textContent = "警報工作桌";
    this.renderChen();
  }

  openMap(save: SaveState): void {
    this.root.hidden = false;
    this.title.textContent = "河港公開地圖";
    this.body.replaceChildren();
    const intro = document.createElement("p");
    intro.className = "map-intro";
    intro.textContent = "左邊是河港簡圖。點圖層，桌上的模型和下方的真實河港會一起亮。沒有資料的層不會假裝安全。";
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 200 140");
    svg.classList.add("harbor-map");
    svg.id = "harbor-map-svg";
    svg.innerHTML = `
      <rect class="zone" x="108" y="28" width="72" height="52" rx="8"/>
      <rect class="river" x="86" y="8" width="16" height="124" rx="6"/>
      <rect class="market" x="18" y="70" width="42" height="34" rx="4"/>
      <rect class="pump" x="52" y="18" width="28" height="28" rx="4"/>
      <path class="route" d="M38 88 L70 70 L94 70 L140 52"/>
      <circle class="wait" cx="168" cy="112" r="8"/>
    `;
    const refuse = document.createElement("p");
    refuse.className = "map-refuse";
    refuse.id = "map-refuse";
    refuse.hidden = true;
    const layers = document.createElement("div");
    layers.className = "wb-layers";
    layers.append(
      layerBtn(COMM.layerFail, !!save.c1.invalidRunExperienced, "fail"),
      layerBtn(COMM.layerControls, !!save.c1.controlsRestored, "controls"),
      layerBtn(COMM.layerZone, !!save.c1.sourceZoneMarked, "zone"),
      layerBtn(COMM.layerRoute, save.player.tool.modules.includes("latch") || save.c1.sourceZoneMarked, "route"),
      layerBtn(COMM.layerWait, true, "wait"),
      layerBtn(COMM.fakeSafe, false, "fake-safe"),
      layerBtn(COMM.fakeClean, false, "fake-clean"),
    );
    layers.addEventListener("click", (event) => {
      const btn = event.target;
      if (!(btn instanceof HTMLButtonElement)) return;
      const id = btn.dataset["layer"];
      if (!id) return;
      if (id.startsWith("fake")) {
        refuse.hidden = false;
        refuse.textContent = "目前沒有資料圖層。河不會因此變綠。";
        this.hooks?.onMissingLayer();
        return;
      }
      refuse.hidden = true;
      svg.dataset[id] = "1";
      this.hooks?.onOpenLayer(id);
    });
    const models = document.createElement("div");
    models.className = "wb-models";
    const fixed = document.createElement("button");
    fixed.type = "button";
    fixed.className = "btn-continue";
    fixed.textContent = `放下 ${COMM.fixed}`;
    fixed.addEventListener("click", () => this.hooks?.onPlaceModel("fixed_station"));
    const kits = document.createElement("button");
    kits.type = "button";
    kits.className = "btn-play";
    kits.textContent = `放下 ${COMM.kits}`;
    kits.addEventListener("click", () => this.hooks?.onPlaceModel("portable_kits"));
    models.append(fixed, kits);
    this.body.append(intro, svg, refuse, layers, models);
  }

  private renderChen(): void {
    this.body.replaceChildren();
    this.body.append(
      toggleRow(COMM.display, this.chen.output === "shape_audio" ? COMM.shapeAudio : COMM.colorOnly, () => {
        this.chen.output = this.chen.output === "shape_audio" ? "color_only" : "shape_audio";
        this.emitChen();
        this.renderChen();
      }),
      toggleRow(COMM.nextStep, this.chen.action ? COMM.actionLeave : COMM.actionNone, () => {
        this.chen.action = !this.chen.action;
        this.emitChen();
        this.renderChen();
      }),
      toggleRow(COMM.updateOwner, this.chen.notice === "municipal_update_with_timestamp" ? COMM.municipal : COMM.updateNone, () => {
        this.chen.notice = this.chen.notice === "municipal_update_with_timestamp" ? "none" : "municipal_update_with_timestamp";
        this.emitChen();
        this.renderChen();
      }),
    );
    const preview = document.createElement("dl");
    preview.className = "comm-preview";
    preview.append(
      slot(COMM.seen, this.chen.output === "shape_audio" ? COMM.shapeAudio : "暗紅"),
      slot(COMM.unknown, "來源身分仍待確認隊"),
      slot(COMM.who, this.chen.notice === "municipal_update_with_timestamp" ? "市政更新板" : "未指定"),
      slot(COMM.when, this.chen.notice === "municipal_update_with_timestamp" ? "時間可見" : "—"),
    );
    const walk = document.createElement("button");
    walk.type = "button";
    walk.textContent = "讓陳姨再走一次";
    walk.addEventListener("click", () => this.hooks?.onChenWalk());
    this.body.append(preview, walk);
  }

  private emitChen(): void {
    this.hooks?.onChenChange({ ...this.chen });
  }
}

function dockRow(label: string, value: string, kind: string): HTMLElement {
  const row = document.createElement("div");
  row.className = "dock-row";
  row.dataset["kind"] = kind;
  const name = document.createElement("span");
  name.textContent = label;
  const val = document.createElement("strong");
  val.textContent = value;
  row.append(name, val);
  return row;
}

function historyRow(run: RunRecord): HTMLElement {
  const row = document.createElement("div");
  row.className = "dock-row retained";
  const name = document.createElement("span");
  name.textContent = COMM.firstFail;
  const val = document.createElement("strong");
  val.textContent = BAND_ZH[run.outputBand] ?? run.outputBand;
  row.append(name, val);
  return row;
}

function toggleRow(label: string, value: string, onClick: () => void): HTMLElement {
  const row = document.createElement("button");
  row.type = "button";
  row.className = "set-row";
  const name = document.createElement("span");
  name.textContent = label;
  const val = document.createElement("strong");
  val.textContent = value;
  row.append(name, val);
  row.addEventListener("click", onClick);
  return row;
}

function slot(dt: string, dd: string): DocumentFragment {
  const frag = document.createDocumentFragment();
  const t = document.createElement("dt");
  t.textContent = dt;
  const d = document.createElement("dd");
  d.textContent = dd;
  frag.append(t, d);
  return frag;
}

function layerBtn(label: string, open: boolean, id: string): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.dataset["layer"] = id;
  btn.textContent = open || id.startsWith("fake") ? label : `${label}（未取得）`;
  btn.className = id.startsWith("fake") ? "layer-fake" : open ? "layer-on" : "layer-off";
  if (!open && !id.startsWith("fake")) btn.disabled = true;
  return btn;
}

function must(sel: string): HTMLElement {
  const node = document.querySelector(sel);
  if (!(node instanceof HTMLElement)) throw new Error(`missing ${sel}`);
  return node;
}
