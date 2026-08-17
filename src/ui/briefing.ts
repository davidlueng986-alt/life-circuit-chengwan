export type BriefNode = "gate" | "station" | "harbor" | "you";

const BEATS = 3;

export class Briefing {
  private readonly root: HTMLElement | null;
  private readonly line: HTMLElement | null;
  private readonly skip: HTMLButtonElement | null;
  private readonly next: HTMLButtonElement | null;
  private readonly dots: HTMLElement | null;
  private beat = 0;
  private timer = 0;
  private resolve: (() => void) | null = null;
  private reduced = false;

  constructor() {
    this.root = document.querySelector("#briefing");
    this.line = document.querySelector("#briefing-line");
    this.skip = document.querySelector("#briefing-skip");
    this.next = document.querySelector("#briefing-next");
    this.dots = document.querySelector("#briefing-dots");
    this.skip?.addEventListener("click", () => this.finish());
    this.next?.addEventListener("click", () => this.advance());
    this.root?.addEventListener("click", (event) => {
      const t = event.target;
      if (t instanceof HTMLElement && (t.id === "briefing-skip" || t.id === "briefing-next")) return;
      if (this.root && !this.root.hidden) this.advance();
    });
  }

  get open(): boolean {
    return !!this.root && !this.root.hidden;
  }

  play(reducedMotion: boolean): Promise<void> {
    this.reduced = reducedMotion;
    this.beat = 0;
    this.show();
    this.applyBeat();
    return new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  stamp(node: BriefNode, reducedMotion: boolean): void {
    if (!this.root) return;
    this.reduced = reducedMotion;
    this.root.hidden = false;
    this.root.dataset["stamp"] = "1";
    this.root.dataset["beat"] = "2";
    this.root.dataset["here"] = node;
    if (this.line) this.line.textContent = node === "harbor" ? "你在東岸河港。" : node === "station" ? "你在研究站。" : "你在三號閘現場。";
    if (this.next) this.next.hidden = true;
    if (this.skip) this.skip.hidden = true;
    window.setTimeout(() => this.hideStamp(), reducedMotion ? 400 : 2200);
  }

  private hideStamp(): void {
    if (!this.root) return;
    this.root.hidden = true;
    delete this.root.dataset["stamp"];
    delete this.root.dataset["here"];
    if (this.next) this.next.hidden = false;
    if (this.skip) this.skip.hidden = false;
  }

  private show(): void {
    if (!this.root) return;
    this.root.hidden = false;
    this.root.dataset["stamp"] = "0";
    if (this.next) this.next.hidden = false;
    if (this.skip) this.skip.hidden = false;
  }

  private applyBeat(): void {
    if (!this.root) return;
    this.root.dataset["beat"] = String(this.beat);
    const lines = [
      "今晚暴雨。澄灣三號防洪閘停了。",
      "小岑被困在閘下平台。方雅在無線電指揮，林博士盯著系統。你是新任系統跑手。",
      "沿橙燈進控制室，修好閘，在水漲前把小岑拉上來。",
    ];
    if (this.line) this.line.textContent = lines[this.beat] ?? lines[0] ?? "";
    if (this.next) this.next.textContent = this.beat >= BEATS - 1 ? "進入現場" : "下一頁";
    if (this.dots) {
      this.dots.replaceChildren();
      for (let i = 0; i < BEATS; i += 1) {
        const dot = document.createElement("i");
        if (i === this.beat) dot.dataset["on"] = "1";
        this.dots.append(dot);
      }
    }
    if (this.reduced) return;
    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => this.advance(), this.beat >= BEATS - 1 ? 8000 : 6500);
  }

  private advance(): void {
    if (!this.open || this.root?.dataset["stamp"] === "1") return;
    if (this.beat >= BEATS - 1) {
      this.finish();
      return;
    }
    this.beat += 1;
    this.applyBeat();
  }

  private finish(): void {
    window.clearTimeout(this.timer);
    if (this.root) this.root.hidden = true;
    const done = this.resolve;
    this.resolve = null;
    done?.();
  }
}
