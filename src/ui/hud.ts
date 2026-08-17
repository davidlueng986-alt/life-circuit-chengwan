import { chipsForLine } from "../content/beats";
import { channelAria, getLine, lineDurationMs, type Line } from "../content/dialogue";
import { CODEX_LINE, CODEX_TITLE, RECAP, SCAN, TASK, UI } from "../content/copy";
import type { CodexTerm } from "../content/ids";
import { addCodexTerm, markChipSeen } from "../content/progress";
import type { SaveState } from "../content/saveTypes";
import type { FocusMeta } from "../engine/interact";
import type { RecoverKind } from "../engine/player";
import { drawMinimap, type NavMark } from "./nav";

const SKIP_AFTER_MS = 400;
const CHIP_MS = 4000;
const TASK_FADE_MS = 10000;

export class Hud {
  private readonly root: HTMLElement;
  private readonly task: HTMLElement;
  private readonly prompt: HTMLElement;
  private readonly promptBind: HTMLElement;
  private readonly promptVerb: HTMLElement;
  private readonly promptStack: HTMLElement;
  private readonly promptHold: HTMLElement;
  private readonly recover: HTMLElement;
  private readonly dialogue: HTMLElement;
  private readonly speaker: HTMLElement;
  private readonly speakerName: HTMLElement;
  private readonly radioGlyph: HTMLElement;
  private readonly line: HTMLElement;
  private readonly chip: HTMLElement;
  private readonly battery: HTMLElement;
  private readonly tools: HTMLElement;
  private readonly titleCard: HTMLElement;
  private readonly live: HTMLElement;
  private readonly recap: HTMLElement;
  private readonly recapList: HTMLElement;
  private readonly storm: HTMLElement;
  private readonly interactList: HTMLElement;
  private readonly minimap: HTMLCanvasElement | null;
  private readonly objectiveChip: HTMLElement | null;
  private readonly speakerChip: HTMLElement | null;
  private readonly relaxedBadge: HTMLElement | null;
  private readonly dialogueNext: HTMLButtonElement | null;
  private readonly scanVeil: HTMLElement | null;
  private readonly scanTitle: HTMLElement | null;
  private readonly scanSub: HTMLElement | null;
  private readonly face: HTMLImageElement | null;
  private readonly gloss: HTMLElement | null;
  private readonly dots: HTMLElement | null;
  private queue: Line[] = [];
  private current: Line | null = null;
  private shownAt = 0;
  private lineUntil = 0;
  private chipUntil = 0;
  private taskSetAt = 0;
  private save: SaveState | null = null;
  private persist: (() => void) | null = null;

  constructor() {
    this.root = must("#hud");
    this.task = must("#task-line");
    this.prompt = must("#interact-prompt");
    this.promptBind = must("#interact-bind");
    this.promptVerb = must("#interact-verb");
    this.promptStack = must("#interact-stack");
    this.promptHold = must("#interact-hold");
    this.recover = must("#recover-veil");
    this.dialogue = must("#dialogue");
    this.speaker = must(".dialogue-speaker");
    this.speakerName = must(".speaker-name");
    this.radioGlyph = must(".radio-glyph");
    this.line = must(".dialogue-line");
    this.chip = must("#dialogue-chip");
    this.battery = must("#lens-battery");
    this.tools = must("#tool-cluster");
    this.titleCard = must("#title-card");
    this.live = must("#hud-live");
    this.recap = must("#recap");
    this.recapList = must("#recap-list");
    this.storm = must("#storm-clock");
    this.interactList = must("#interact-list");
    this.minimap = document.querySelector("#minimap-draw");
    this.objectiveChip = document.querySelector("#objective-chip");
    this.speakerChip = document.querySelector("#speaker-chip");
    this.relaxedBadge = document.querySelector("#relaxed-badge");
    const next = document.querySelector("#dialogue-next");
    this.dialogueNext = next instanceof HTMLButtonElement ? next : null;
    this.scanVeil = document.querySelector("#scan-veil");
    this.scanTitle = document.querySelector("#scan-title");
    this.scanSub = document.querySelector("#scan-sub");
    const face = document.querySelector("#dialogue-face");
    this.face = face instanceof HTMLImageElement ? face : null;
    this.gloss = document.querySelector("#dialogue-gloss");
    this.dots = document.querySelector("#dialogue-dots");
    this.chip.addEventListener("click", (event) => {
      event.stopPropagation();
      this.hideChip();
    });
    this.speaker.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
    if (this.dialogueNext) {
      this.dialogueNext.addEventListener("click", (event) => {
        event.stopPropagation();
        this.advance(performance.now());
      });
    }
  }

  bindSave(save: SaveState, persist?: () => void): void {
    this.save = save;
    this.persist = persist ?? this.persist;
  }

  show(): void {
    this.root.hidden = false;
  }

  hide(): void {
    this.root.hidden = true;
    this.clearDialogue();
    this.setRecap(false);
    this.setStorm(null);
    this.setTitleCard(false);
    this.setRecover(null);
    this.setPrompt(null);
    this.setScan({ on: false, owned: false, charging: false, charge01: 0 });
    this.setTalking(false);
  }

  setTask(text: string): void {
    this.task.textContent = text;
    this.task.style.opacity = text ? "1" : "0";
    this.taskSetAt = performance.now();
    if (text) this.announce(text);
  }

  setPrompt(text: string | null, meta: FocusMeta | null = null): void {
    if (!text && !meta) {
      this.prompt.hidden = true;
      this.promptVerb.textContent = "";
      return;
    }
    this.prompt.hidden = false;
    if (meta) {
      this.promptBind.hidden = false;
      this.promptBind.textContent = meta.bind;
      this.promptVerb.textContent = meta.prompt;
      this.promptStack.hidden = meta.total <= 1;
      this.promptStack.textContent = meta.total > 1 ? `${meta.index}/${meta.total}` : "";
      this.promptHold.hidden = !meta.hold;
      this.promptHold.style.setProperty("--hold", String(meta.hold01));
      return;
    }
    this.promptBind.hidden = true;
    this.promptStack.hidden = true;
    this.promptHold.hidden = true;
    this.promptVerb.textContent = text ?? "";
  }

  setRecover(kind: RecoverKind | null, t01 = 0): void {
    if (!kind) {
      this.recover.hidden = true;
      this.recover.removeAttribute("data-kind");
      this.recover.style.opacity = "0";
      return;
    }
    this.recover.hidden = false;
    this.recover.dataset["kind"] = kind;
    const wave = kind === "water" ? Math.sin(Math.min(1, t01) * Math.PI) : Math.min(1, t01 * 1.35) * (1 - t01);
    this.recover.style.opacity = String(Math.min(0.7, 0.18 + wave * 0.55));
  }

  setInteractList(items: string[] | null): void {
    if (!items || items.length === 0) {
      this.interactList.hidden = true;
      this.interactList.replaceChildren();
      return;
    }
    this.interactList.hidden = false;
    this.interactList.replaceChildren();
    for (const item of items) {
      const li = document.createElement("li");
      li.textContent = item;
      this.interactList.append(li);
    }
  }

  setBattery(owned: boolean, value01: number): void {
    this.setLens({
      owned,
      showRing: owned,
      battery: value01,
      charging: false,
      charge01: 0,
      recover: false,
      emptyFail: false,
    });
  }

  setRelaxed(on: boolean): void {
    if (this.relaxedBadge) this.relaxedBadge.hidden = !on;
  }

  setTalking(on: boolean): void {
    this.root.classList.toggle("talking", on);
  }

  setScan(opts: { on: boolean; owned: boolean; charging: boolean; charge01: number }): void {
    if (!this.scanVeil) return;
    this.scanVeil.hidden = !opts.on;
    this.scanVeil.style.setProperty("--scan", String(opts.charge01));
    if (this.scanTitle) {
      this.scanTitle.textContent = !opts.owned ? SCAN.titleOff : opts.charging ? SCAN.charging : SCAN.titleOn;
    }
    if (this.scanSub) this.scanSub.textContent = opts.owned ? SCAN.hold : SCAN.noLens;
  }

  setNav(opts: {
    yaw: number;
    marks: NavMark[];
    objective: string;
    speaker: string | null;
    radio: boolean;
    walls?: import("./nav").NavWall[];
    bearing?: string;
  }): void {
    if (this.minimap) drawMinimap(this.minimap, opts.marks, opts.yaw, opts.walls ?? []);
    const compass = document.querySelector("#compass");
    if (compass instanceof HTMLElement) {
      compass.style.setProperty("--yaw", `${(-opts.yaw * 180) / Math.PI}deg`);
    }
    if (this.objectiveChip) {
      const head = opts.bearing ? `${opts.bearing} · ` : "";
      this.objectiveChip.textContent = opts.objective ? `${head}${opts.objective}` : opts.bearing || "";
    }
    if (this.speakerChip) {
      this.speakerChip.hidden = !opts.speaker;
      this.speakerChip.textContent = opts.speaker
        ? opts.radio
          ? `正在說話：${opts.speaker}（無線電 · 看橙燈／人物光柱）`
          : `正在說話：${opts.speaker}（場景裡的光柱）`
        : "";
    }
  }

  setLens(opts: {
    owned: boolean;
    showRing: boolean;
    battery: number;
    charging: boolean;
    charge01: number;
    recover: boolean;
    emptyFail: boolean;
  }): void {
    this.tools.hidden = false;
    this.battery.hidden = !opts.owned && !opts.showRing;
    const fill = opts.charging ? Math.max(opts.battery * 0.15, opts.charge01) : opts.battery;
    const pct = Math.round(fill * 100);
    this.battery.style.setProperty("--battery", String(fill));
    this.battery.setAttribute("aria-valuenow", String(pct));
    this.battery.dataset["state"] = opts.emptyFail ? "empty" : opts.recover ? "recover" : opts.charging ? "charge" : "idle";
  }

  setRig(owned: boolean, fill: number, flag: boolean, blink: boolean): void {
    const node = document.querySelector("#rig-output");
    if (!(node instanceof HTMLElement)) return;
    node.hidden = !owned;
    node.style.setProperty("--rig-fill", String(fill));
    node.dataset["flag"] = flag ? "on" : "off";
    node.dataset["blink"] = blink ? "on" : "off";
    node.setAttribute("aria-hidden", owned ? "false" : "true");
    node.setAttribute("aria-label", `探頭方向 ${Math.round(fill * 100)}`);
  }

  setStorm(remain01: number | null): void {
    if (remain01 === null) {
      this.storm.hidden = true;
      return;
    }
    this.storm.hidden = false;
    this.storm.style.setProperty("--storm", String(Math.max(0, Math.min(1, remain01))));
    this.storm.setAttribute("aria-valuenow", String(Math.round(remain01 * 100)));
  }

  say(entry: Line, _now?: number): void {
    void _now;
    this.queue = [entry];
    this.present(entry);
  }

  sayId(id: string): void {
    const entry = getLine(id);
    if (entry) this.say(entry);
  }

  queueLines(ids: string[]): void {
    const next = ids.map((id) => getLine(id)).filter((entry): entry is Line => entry !== null);
    if (next.length === 0) return;
    this.queue = next.slice(1);
    const first = next[0];
    if (first) this.present(first);
  }

  enqueue(id: string): void {
    const entry = getLine(id);
    if (!entry) return;
    if (!this.current) {
      this.present(entry);
      return;
    }
    this.queue.push(entry);
  }

  get showing(): boolean {
    return !this.dialogue.hidden;
  }

  get queueIdle(): boolean {
    return !this.current && this.queue.length === 0;
  }

  get currentLineId(): string | null {
    return this.current?.id ?? null;
  }

  /** Returns true if the press was used to advance or hold a line. */
  consumeInteract(pressed: boolean, held: boolean, now: number): boolean {
    if (!this.current) return false;
    if (held && !pressed && now - this.shownAt >= SKIP_AFTER_MS) {
      this.lineUntil = Math.max(this.lineUntil, now + 250);
      return false;
    }
    if (pressed && now - this.shownAt >= SKIP_AFTER_MS) {
      this.advance(now);
      return true;
    }
    return false;
  }

  closeChipWithEsc(): boolean {
    if (this.chip.hidden) return false;
    this.hideChip();
    return true;
  }

  tick(now: number): void {
    if (this.current && now > this.lineUntil && this.dialogueNext) {
      this.dialogueNext.dataset["ready"] = "1";
    }
    if (!this.chip.hidden && now > this.chipUntil) this.hideChip();
    if (this.task.textContent && now - this.taskSetAt > TASK_FADE_MS) {
      this.task.style.opacity = "0.8";
    }
  }

  setTitleCard(on: boolean): void {
    this.titleCard.hidden = !on;
    this.titleCard.textContent = on ? UI.title : "";
  }

  setRecap(on: boolean): void {
    this.recap.hidden = !on;
    if (!on) return;
    this.recapList.replaceChildren();
    for (const fact of RECAP) {
      const li = document.createElement("li");
      li.textContent = fact;
      this.recapList.append(li);
    }
  }

  announce(text: string): void {
    this.live.textContent = text;
  }

  applyChrome(save: SaveState): void {
    this.save = save;
    const root = document.documentElement;
    root.style.setProperty("--subtitle-scale", String(save.settings.subtitleScale));
    root.style.setProperty("--ui-scale", String(save.settings.textScale));
    root.dataset["reducedMotion"] = save.settings.reducedMotion ? "true" : "false";
    root.dataset["highContrast"] = save.settings.highContrast ? "true" : "false";
  }

  applySubtitleScale(scale: number): void {
    document.documentElement.style.setProperty("--subtitle-scale", String(scale));
  }

  missingLayer(): void {
    this.announce("目前沒有資料圖層");
    this.setPrompt("目前沒有資料圖層");
  }

  private present(entry: Line): void {
    const now = performance.now();
    this.current = entry;
    this.shownAt = now;
    this.lineUntil = now + lineDurationMs(entry.text);
    this.dialogue.hidden = false;
    this.dialogue.setAttribute("aria-label", channelAria(entry));
    this.speakerName.textContent = entry.speaker;
    this.radioGlyph.hidden = entry.channel === "body";
    this.radioGlyph.dataset["channel"] = entry.channel;
    this.line.textContent = entry.text;
    this.line.dataset["lineId"] = entry.id;
    this.speaker.dataset["channel"] = entry.channel;
    this.setFace(entry.speaker);
    this.setGloss(entry.text);
    this.setDots();
    this.offerChips(entry.id, now);
    if (this.dialogueNext) {
      this.dialogueNext.hidden = false;
      this.dialogueNext.dataset["ready"] = "0";
      this.dialogueNext.textContent = "繼續 · E";
    }
  }

  private advance(now: number): void {
    const next = this.queue.shift();
    if (next) {
      this.present(next);
      return;
    }
    this.current = null;
    this.dialogue.hidden = true;
    this.line.dataset["lineId"] = "";
    if (this.dialogueNext) this.dialogueNext.hidden = true;
    if (this.face) this.face.hidden = true;
    if (this.gloss) this.gloss.hidden = true;
    void now;
  }

  private setFace(speaker: string): void {
    if (!this.face) return;
    const src = FACE_SRC[speaker];
    if (!src) {
      this.face.hidden = true;
      this.face.removeAttribute("src");
      return;
    }
    this.face.hidden = false;
    this.face.src = src;
    this.face.alt = speaker;
  }

  private setGloss(text: string): void {
    if (!this.gloss) return;
    const bits: string[] = [];
    if (/RNA/.test(text)) bits.push("RNA＝信使複本");
    if (/\bDNA\b/.test(text) || /基因/.test(text)) bits.push("DNA／gene＝遺傳長軌上的一段");
    if (/control/i.test(text) || /對照/.test(text)) bits.push("control＝對照組（應關月亮／應開太陽）");
    if (/reporter/i.test(text) || /報告器/.test(text)) bits.push("reporter＝報告器（把狀態變成可見輸出）");
    if (/\binput\b/i.test(text) || /輸入/.test(text)) bits.push("input＝輸入／裝置感到的條件");
    if (/protein/i.test(text) || /蛋白/.test(text)) bits.push("protein＝工作蛋白");
    this.gloss.hidden = bits.length === 0;
    this.gloss.textContent = bits.join(" · ");
  }

  private setDots(): void {
    if (!this.dots) return;
    const total = this.queue.length + 1;
    this.dots.replaceChildren();
    for (let i = 0; i < total; i += 1) {
      const dot = document.createElement("i");
      if (i === 0) dot.dataset["on"] = "1";
      this.dots.append(dot);
    }
  }

  clearDialogue(): void {
    this.queue = [];
    this.current = null;
    this.dialogue.hidden = true;
    this.hideChip();
  }

  private offerChips(lineId: string, now: number): void {
    if (!this.save) return;
    const terms = chipsForLine(lineId, this.save).filter((term) => !this.save!.player.codex.seenChips.includes(term));
    const first = terms[0];
    if (!first) return;
    addCodexTerm(this.save, first);
    markChipSeen(this.save, first);
    this.chip.hidden = false;
    this.chip.textContent = `${CODEX_TITLE[first]}：${CODEX_LINE[first]}`;
    this.chipUntil = now + CHIP_MS;
    for (const extra of terms.slice(1)) {
      addCodexTerm(this.save, extra);
    }
    this.persist?.();
  }

  private hideChip(): void {
    this.chip.hidden = true;
    this.chip.textContent = "";
  }
}

export function taskLine(key: string): string {
  return TASK[key] ?? "";
}

export type { CodexTerm };

const FACE_SRC: Record<string, string> = {
  小岑: "/art/xiaocen.jpg",
  方雅: "/art/fang.jpg",
  林博士: "/art/lin.jpg",
  陳姨: "/art/chen.jpg",
  阿哲: "/art/zhe.jpg",
};

function must(sel: string): HTMLElement {
  const node = document.querySelector(sel);
  if (!(node instanceof HTMLElement)) throw new Error(`missing ${sel}`);
  return node;
}
