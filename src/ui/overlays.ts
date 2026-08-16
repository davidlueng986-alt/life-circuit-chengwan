import { CODEX_LINE, CODEX_TITLE, SUBTITLE_LABEL, UI } from "../content/copy";
import { DEBUG_JUMPS, isDebugMode } from "../content/debug";
import type { CodexTerm, SceneId, SubtitleScale } from "../content/ids";
import { snapSubtitleScale } from "../content/ids";
import type { SettingsState } from "../content/saveTypes";

export interface OverlayHooks {
  onNew: () => void;
  onContinue: () => void;
  onResume: () => void;
  onTitle: () => void;
  onHub: () => void;
  onLeaveWorkshop: () => void;
  onSettingsChange: (patch: Partial<SettingsState>) => void;
}

export interface PauseOptions {
  workshopLeave: boolean;
  returnHub: boolean;
  showCodex: boolean;
}

export class Overlays {
  readonly title = mustEl("#title-screen");
  readonly pause = mustDlg("#pause");
  readonly settings = mustDlg("#settings");
  readonly webgl = mustDlg("#webgl-fail");
  readonly confirm = mustDlg("#confirm-new");
  readonly codex = mustDlg("#codex");
  readonly btnContinue = mustBtn("#btn-continue");
  readonly btnHub = mustBtn("#pause-hub");
  readonly btnLeave = mustBtn("#pause-leave-workshop");
  readonly btnCodex = mustBtn("#pause-codex");
  readonly titleName = mustEl("#title-name");
  readonly corrupt = mustEl("#title-corrupt");
  private pendingNew = false;

  bind(hooks: OverlayHooks): void {
    mustBtn("#btn-new").addEventListener("click", () => {
      if (this.btnContinue.disabled) {
        hooks.onNew();
        return;
      }
      this.pendingNew = true;
      if (!this.confirm.open) this.confirm.showModal();
    });
    this.btnContinue.addEventListener("click", () => hooks.onContinue());
    mustBtn("#btn-settings").addEventListener("click", () => this.openSettings());
    mustBtn("#pause-resume").addEventListener("click", () => hooks.onResume());
    mustBtn("#pause-settings").addEventListener("click", () => this.openSettings());
    mustBtn("#pause-title-btn").addEventListener("click", () => hooks.onTitle());
    this.btnHub.addEventListener("click", () => hooks.onHub());
    this.btnLeave.addEventListener("click", () => hooks.onLeaveWorkshop());
    this.btnCodex.addEventListener("click", () => this.openCodex());
    mustBtn("#settings-close").addEventListener("click", () => this.settings.close());
    mustBtn("#webgl-settings").addEventListener("click", () => this.openSettings());
    mustBtn("#webgl-retry").addEventListener("click", () => window.location.reload());
    mustBtn("#codex-close").addEventListener("click", () => this.codex.close());
    mustBtn("#confirm-yes").addEventListener("click", () => {
      this.confirm.close();
      if (this.pendingNew) hooks.onNew();
      this.pendingNew = false;
    });
    mustBtn("#confirm-no").addEventListener("click", () => {
      this.confirm.close();
      this.pendingNew = false;
    });

    bindCheck("#set-relaxed", (on) => hooks.onSettingsChange({ relaxedTimer: on }));
    bindCheck("#set-motion", (on) => hooks.onSettingsChange({ reducedMotion: on }));
    bindCheck("#set-hold", (on) => hooks.onSettingsChange({ holdAlternatives: on }));
    bindCheck("#set-vibrate", (on) => hooks.onSettingsChange({ vibration: on }));
    bindCheck("#set-contrast", (on) => hooks.onSettingsChange({ highContrast: on }));
    bindCheck("#set-list", (on) => hooks.onSettingsChange({ interactionList: on }));
    mustInput("#set-sub").addEventListener("input", (event) => {
      const scale = snapSubtitleScale(Number((event.target as HTMLInputElement).value));
      hooks.onSettingsChange({ subtitleScale: scale });
    });
    mustInput("#set-fov").addEventListener("input", (event) => {
      hooks.onSettingsChange({ fov: Number((event.target as HTMLInputElement).value) });
    });
    mustInput("#set-ui").addEventListener("input", (event) => {
      hooks.onSettingsChange({ textScale: Number((event.target as HTMLInputElement).value) });
    });
  }

  syncSettings(settings: SettingsState): void {
    mustInput("#set-relaxed").checked = settings.relaxedTimer;
    mustInput("#set-motion").checked = settings.reducedMotion;
    mustInput("#set-hold").checked = settings.holdAlternatives;
    mustInput("#set-vibrate").checked = settings.vibration;
    mustInput("#set-contrast").checked = settings.highContrast;
    mustInput("#set-list").checked = settings.interactionList;
    mustInput("#set-sub").value = String(settings.subtitleScale);
    mustInput("#set-fov").value = String(settings.fov);
    mustInput("#set-ui").value = String(settings.textScale);
    const label = mustEl("#set-sub-label");
    label.textContent = SUBTITLE_LABEL[settings.subtitleScale as SubtitleScale] ?? SUBTITLE_LABEL[1];
    const root = document.documentElement;
    root.dataset["reducedMotion"] = settings.reducedMotion ? "true" : "false";
    root.dataset["highContrast"] = settings.highContrast ? "true" : "false";
    root.style.setProperty("--ui-scale", String(settings.textScale));
    root.style.setProperty("--subtitle-scale", String(settings.subtitleScale));
  }

  setHasSave(on: boolean, resume = ""): void {
    this.btnContinue.disabled = !on;
    this.btnContinue.textContent = on && resume ? `繼續上次 · ${resume}` : "繼續上次";
  }

  setCorrupt(on: boolean): void {
    this.corrupt.hidden = !on;
    this.corrupt.textContent = on ? UI.corrupt : "";
  }

  showTitle(on: boolean, _prologueComplete = false): void {
    this.title.hidden = !on;
    this.titleName.hidden = false;
    void _prologueComplete;
  }

  openPause(opts: PauseOptions): void {
    this.btnLeave.hidden = !opts.workshopLeave;
    this.btnHub.hidden = !opts.returnHub;
    this.btnCodex.hidden = false;
    if (!this.pause.open) this.pause.showModal();
  }

  closePause(): void {
    if (this.pause.open) this.pause.close();
  }

  openSettings(): void {
    if (!this.settings.open) this.settings.showModal();
  }

  fillCodex(terms: CodexTerm[]): void {
    const list = mustEl("#codex-list");
    list.replaceChildren();
    for (const term of terms) {
      const item = document.createElement("li");
      const title = document.createElement("strong");
      title.textContent = CODEX_TITLE[term];
      const body = document.createElement("p");
      body.textContent = CODEX_LINE[term];
      item.append(title, body);
      list.append(item);
    }
    if (terms.length === 0) {
      for (const term of ["cell", "dnaGene", "controls", "reporter", "input"] as CodexTerm[]) {
        const item = document.createElement("li");
        const title = document.createElement("strong");
        title.textContent = CODEX_TITLE[term];
        const body = document.createElement("p");
        body.textContent = CODEX_LINE[term];
        item.append(title, body);
        list.append(item);
      }
    }
    this.btnCodex.hidden = false;
  }

  openCodex(): void {
    if (!this.codex.open) this.codex.showModal();
  }

  toggleCodex(terms: CodexTerm[]): void {
    this.fillCodex(terms);
    if (this.codex.open) this.codex.close();
    else this.codex.showModal();
  }

  failWebGL(): void {
    if (!this.webgl.open) this.webgl.showModal();
  }

  anyModal(): boolean {
    return this.pause.open || this.settings.open || this.webgl.open || this.codex.open || this.confirm.open;
  }

  /** Visible only when the URL has `?debug=1`. */
  mountDebug(onJump: (id: SceneId) => void): void {
    const nav = document.querySelector("#debug-select");
    if (!(nav instanceof HTMLElement)) return;
    const show = isDebugMode();
    nav.hidden = !show;
    if (!show) {
      nav.replaceChildren();
      return;
    }
    nav.replaceChildren();
    const heading = document.createElement("p");
    heading.textContent = "除錯";
    nav.append(heading);
    for (const jump of DEBUG_JUMPS) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = jump.label;
      btn.addEventListener("click", () => onJump(jump.id));
      nav.append(btn);
    }
  }
}

function bindCheck(sel: string, fn: (on: boolean) => void): void {
  mustInput(sel).addEventListener("change", (event) => {
    fn((event.target as HTMLInputElement).checked);
  });
}

function mustEl(sel: string): HTMLElement {
  const node = document.querySelector(sel);
  if (!(node instanceof HTMLElement)) throw new Error(`missing ${sel}`);
  return node;
}

function mustDlg(sel: string): HTMLDialogElement {
  const node = document.querySelector(sel);
  if (!(node instanceof HTMLDialogElement)) throw new Error(`missing ${sel}`);
  return node;
}

function mustBtn(sel: string): HTMLButtonElement {
  const node = document.querySelector(sel);
  if (!(node instanceof HTMLButtonElement)) throw new Error(`missing ${sel}`);
  return node;
}

function mustInput(sel: string): HTMLInputElement {
  const node = document.querySelector(sel);
  if (!(node instanceof HTMLInputElement)) throw new Error(`missing ${sel}`);
  return node;
}
