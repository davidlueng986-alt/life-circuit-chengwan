import * as THREE from "three";
import { SCENE_DEFS, isWorkshop } from "../content/catalog";
import { isDebugMode, primeSaveForScene } from "../content/debug";
import { isCrisisScene } from "../content/ids";
import type { SceneId } from "../content/ids";
import { leaveWorkshop } from "../content/progress";
import { getLine } from "../content/dialogue";
import { emptySave, type SaveState, type SettingsState } from "../content/saveTypes";
import { createScene } from "../scenes/registry";
import type { GameScene, SceneContext } from "../scenes/types";
import { Hud } from "../ui/hud";
import { Overlays } from "../ui/overlays";
import { Workbench } from "../ui/workbench";
import { RainBed, ToolVoice } from "./audio";
import { CameraRig } from "./cameraRig";
import { WorldColliders } from "./collision";
import { clearGroup } from "./greybox";
import { Input } from "./input";
import { InteractSystem, type Interactable } from "./interact";
import type { NavMark } from "../ui/nav";
import { PlayerMotor } from "./player";
import { applySettings, loadSave, writeSave } from "./save";
import { BioRig } from "./systems/bioRig";
import { DockSystem } from "./systems/docks";
import { FlowLens } from "./systems/flowLens";
import { SignalGraph } from "./systems/signalGraph";
import { TetherTool } from "./systems/tether";
import { Triangulation } from "./systems/triangulation";
import { detectQuality, type QualityTier } from "./materials";
import { bindTouchPad } from "./pad";
import { WorldHints } from "./worldHints";

export class Game {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly three = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(62, 1, 0.08, 180);
  private readonly root = new THREE.Group();
  private readonly world = new WorldColliders();
  private readonly player = new PlayerMotor();
  private readonly cam = new CameraRig();
  private readonly input: Input;
  private readonly interact = new InteractSystem();
  private readonly hud = new Hud();
  private readonly overlays = new Overlays();
  private readonly workbench = new Workbench();
  private readonly rain = new RainBed();
  private readonly voice = new ToolVoice();
  private readonly signals = new SignalGraph();
  private readonly flowLens = new FlowLens();
  private readonly tether = new TetherTool();
  private readonly bioRig = new BioRig();
  private readonly docks = new DockSystem();
  private readonly triangulation = new Triangulation();
  private save: SaveState;
  private active: GameScene | null = null;
  private playing = false;
  private paused = false;
  private now = 0;
  private last = performance.now();
  private readonly hints = new WorldHints();
  private helpUntil = 0;
  private readonly quality: QualityTier = detectQuality();

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.quality === "low" ? 1 : 1.5));
    this.renderer.shadowMap.enabled = this.quality !== "low";
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.shadowMap.enabled = this.quality !== "low";
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.three.add(this.root);
    this.three.add(this.player.root);
    this.player.root.visible = false;
    this.input = new Input(canvas);
    bindTouchPad(this.input);
    this.flowLens.bindAudio(this.voice);
    this.tether.bindAudio(this.voice);
    this.bioRig.bindAudio(this.voice);
    const loaded = loadSave();
    this.save = loaded.save;
    this.overlays.bind({
      onNew: () => this.newGame(),
      onContinue: () => this.continueGame(),
      onResume: () => this.setPaused(false),
      onTitle: () => this.toTitle(),
      onHub: () => this.returnHub(),
      onLeaveWorkshop: () => this.leaveWorkshopToHub(),
      onSettingsChange: (patch) => this.patchSettings(patch),
    });
    this.overlays.mountDebug((id) => this.debugJump(id));
    if (this.save.meta.currentScene !== "BOOT-S00") this.save.meta.hasSave = true;
    this.overlays.setHasSave(this.save.meta.hasSave, resumeLabel(this.save.meta.currentScene));
    this.overlays.setCorrupt(loaded.status === "corrupt");
    this.overlays.syncSettings(this.save.settings);
    this.overlays.fillCodex(this.save.player.codex.terms);
    this.hud.applyChrome(this.save);
    this.three.add(this.hints.root);
    window.addEventListener("keydown", this.onKey);
    window.addEventListener("resize", this.resize);
    this.resize();
  }

  start(): void {
    this.overlays.showTitle(true, this.save.prologueComplete);
    this.hud.hide();
    this.last = performance.now();
    requestAnimationFrame(this.frame);
  }

  /** Debug-only. Requires `?debug=1`. Does not mark workshop complete. */
  private debugJump(id: SceneId): void {
    if (!isDebugMode()) return;
    if (id === "BOOT-S00") {
      this.toTitle();
      return;
    }
    if (!this.save.meta.hasSave) {
      const settings = { ...this.save.settings };
      this.save = emptySave();
      this.save.settings = settings;
    }
    this.save.meta.hasSave = true;
    primeSaveForScene(this.save, id);
    this.persist();
    this.rain.start();
    this.voice.ensure();
    this.enter(id);
  }

  private newGame(): void {
    const settings = { ...this.save.settings };
    this.save = emptySave();
    this.save.settings = settings;
    this.save.meta.hasSave = true;
    this.save.meta.currentScene = "P-S00";
    this.persist();
    this.rain.start();
    this.voice.ensure();
    this.helpUntil = Number.POSITIVE_INFINITY;
    this.enter("P-S00");
  }

  private continueGame(): void {
    const loaded = loadSave();
    this.save = loaded.save;
    if (loaded.status === "corrupt") {
      this.overlays.setCorrupt(true);
      return;
    }
    if (!this.save.meta.hasSave) return;
    this.rain.start();
    this.voice.ensure();
    this.helpUntil = performance.now() + 28000;
    const target = this.save.meta.currentScene === "BOOT-S00" ? "P-S00" : this.save.meta.currentScene;
    this.enter(target);
  }

  private enter(id: SceneId): void {
    this.overlays.showTitle(false, this.save.prologueComplete);
    this.overlays.closePause();
    this.hud.show();
    this.hud.setTitleCard(false);
    this.hud.bindSave(this.save, () => this.persist());
    this.playing = true;
    this.paused = false;
    this.player.root.visible = true;
    this.input.holdAlternatives = this.save.settings.holdAlternatives;
    this.loadScene(id);
  }

  private loadScene(id: SceneId): void {
    if (this.active) this.active.unmount();
    this.workbench.close();
    this.hud.setRecap(false);
    this.hud.setStorm(null);
    clearGroup(this.root);
    this.world.reset();
    this.interact.reset();
    this.hints.reset();
    this.signals.reset();
    this.triangulation.reset();
    this.flowLens.detach();
    this.tether.detach();
    this.bioRig.detach();
    this.flowLens.reset(this.save.player.tool.flowLens);
    this.tether.reset(this.save.player.tool.tether, this.save.settings.holdAlternatives);
    this.bioRig.reset(this.save.player.tool.sealedProbe, this.save.c1.loadout);
    this.docks.reset(true);
    this.docks.saturated = this.bioRig.saturated;
    this.flowLens.attach(this.root);
    this.tether.attach(this.root);
    this.bioRig.attach(this.root);
    if (this.save.player.tool.sealedProbe) this.bioRig.carry();
    this.save.meta.currentScene = id;
    this.save.meta.hasSave = true;
    if (isWorkshop(id)) leaveWorkshop(this.save, id);
    this.persist();
    this.hud.clearDialogue();
    this.hud.setPrompt(null);
    this.hud.setInteractList(null);
    this.cam.resetFraming();
    const scene = createScene(id === "BOOT-S00" ? "HUB-S00" : id);
    this.active = scene;
    scene.mount(this.context());
    this.cam.snapNext();
    this.hud.bindSave(this.save, () => this.persist());
    this.hud.setBattery(this.flowLens.owned, this.save.player.tool.battery);
    this.hud.applyChrome(this.save);
    this.overlays.fillCodex(this.save.player.codex.terms);
  }

  private completeAndGo(): void {
    const id = this.active?.id;
    if (!id) return;
    const def = SCENE_DEFS[id];
    def.applyComplete(this.save);
    const next = def.next ?? "HUB-S00";
    this.loadScene(next);
  }

  private leaveWorkshopToHub(): void {
    if (this.active && isWorkshop(this.active.id)) {
      leaveWorkshop(this.save, this.active.id);
    }
    this.setPaused(false);
    this.loadScene("HUB-S00");
  }

  private returnHub(): void {
    const id = this.active?.id;
    if (id && isCrisisScene(id)) return;
    if (id && isWorkshop(id)) leaveWorkshop(this.save, id);
    this.setPaused(false);
    this.loadScene("HUB-S00");
  }

  private toTitle(): void {
    this.setPaused(false);
    this.playing = false;
    if (this.active) this.active.unmount();
    this.active = null;
    this.workbench.close();
    clearGroup(this.root);
    this.player.root.visible = false;
    this.hud.hide();
    this.hud.setRecover(null);
    this.input.releaseLook();
    this.persist();
    this.overlays.showTitle(true, this.save.prologueComplete);
    this.overlays.setHasSave(this.save.meta.hasSave, resumeLabel(this.save.meta.currentScene));
  }

  private setPaused(on: boolean): void {
    this.paused = on;
    if (on) {
      this.persist();
      this.input.clearHeld();
      this.input.releaseLook();
      const id = this.active?.id;
      this.overlays.fillCodex(this.save.player.codex.terms);
      this.overlays.openPause({
        workshopLeave: !!id && isWorkshop(id),
        returnHub: !!id && this.save.hub.unlocked && !isCrisisScene(id) && !isWorkshop(id),
        showCodex: true,
      });
    } else {
      this.overlays.closePause();
    }
  }

  private patchSettings(patch: Partial<SettingsState>): void {
    applySettings(this.save, patch);
    this.overlays.syncSettings(this.save.settings);
    this.hud.applyChrome(this.save);
    this.cam.fov = this.save.settings.fov;
    this.input.holdAlternatives = this.save.settings.holdAlternatives;
    this.persist();
  }

  private suggestRelaxed(): void {
    if (this.save.settings.relaxedTimer) return;
    this.hud.announce("失敗了。可在設定打開寬鬆時間，不倒數。");
    this.overlays.openSettings();
  }

  private persist(): void {
    if (this.save.meta.currentScene !== "BOOT-S00") this.save.meta.hasSave = true;
    writeSave(this.save);
    this.overlays.setHasSave(this.save.meta.hasSave, resumeLabel(this.save.meta.currentScene));
  }

  private context(): SceneContext {
    return {
      three: this.three,
      root: this.root,
      world: this.world,
      player: this.player,
      camera: this.cam,
      input: this.input,
      interact: this.interact,
      hud: this.hud,
      workbench: this.workbench,
      save: this.save,
      persist: () => this.persist(),
      completeAndGo: () => this.completeAndGo(),
      loadScene: (id) => this.loadScene(id),
      say: (id) => this.hud.sayId(id),
      queueLines: (ids) => this.hud.queueLines(ids),
      signals: this.signals,
      flowLens: this.flowLens,
      tether: this.tether,
      bioRig: this.bioRig,
      docks: this.docks,
      triangulation: this.triangulation,
      reducedMotion: this.save.settings.reducedMotion,
      now: this.now,
      suggestRelaxed: () => this.suggestRelaxed(),
    };
  }

  private frame = (stamp: number): void => {
    const dt = Math.min(0.05, (stamp - this.last) / 1000);
    this.last = stamp;
    this.now += dt;
    if (this.playing && !this.paused && this.active) {
      this.input.holdAlternatives = this.save.settings.holdAlternatives;
      this.cam.applyMouse(
        this.input.mouseDX + this.input.lookPadX * 16,
        this.input.mouseDY + this.input.lookPadY * 12,
        this.save.settings.reducedMotion,
      );
      this.input.tickBuffer(dt);
      this.player.update(dt, this.input, this.cam.yaw, this.world, {
        reducedMotion: this.save.settings.reducedMotion,
        camDist: this.camera.position.distanceTo(this.player.position),
      });
      this.cam.fov = this.save.settings.fov;
      this.cam.update(this.camera, this.player, this.save.settings.reducedMotion, this.world);
      if (this.player.recovering) {
        this.hud.setRecover(this.player.recoverKind, this.player.recoverT);
      } else {
        this.hud.setRecover(null);
      }
      if (this.player.justRecovered) {
        this.hud.announce("安全繩拉回");
        if (this.save.settings.vibration && "vibrate" in navigator) navigator.vibrate(36);
      }
      const drain = this.save.c1.loadout === "battery" ? 0.6 : 1;
      this.signals.saturated = this.bioRig.saturated;
      this.docks.saturated = this.bioRig.saturated;
      const origin = this.player.position.clone().add(new THREE.Vector3(0, 1.4, 0));
      this.save.player.tool.battery = this.flowLens.update({
        dt,
        hold: this.input.lensHeld,
        release: this.input.lensReleased,
        press: this.input.lensPressed,
        origin,
        graph: this.signals,
        battery: this.save.player.tool.battery,
        drainScale: drain,
        scanRange: this.save.player.tool.scanRange,
        tapMode: this.save.settings.holdAlternatives,
        readable: this.bioRig.fieldReadable(this.save),
        reducedMotion: this.save.settings.reducedMotion,
      });
      if (this.flowLens.deniedHint && this.input.lensPressed) {
        this.hud.announce("還沒有透鏡。先找桌上那隻只有圓鈕的。");
      }
      this.tether.update({
        dt,
        input: this.input,
        player: this.player,
        camera: this.cam,
        world: this.world,
        strength: this.save.player.tool.tetherStrength,
        tapMode: this.save.settings.holdAlternatives,
        reducedMotion: this.save.settings.reducedMotion,
      });
      if (this.tether.lastShockId && this.save.c1.loadout !== "crash_shell") {
        this.bioRig.shock();
      }
      this.bioRig.update(dt, this.player, this.cam, this.save);
      this.hud.setLens({
        owned: this.flowLens.owned,
        showRing: this.flowLens.owned,
        battery: this.save.player.tool.battery,
        charging: this.flowLens.charging,
        charge01: this.flowLens.charge01,
        recover: this.flowLens.recovering(),
        emptyFail: this.flowLens.failedPulse,
      });
      this.hud.setRig(this.bioRig.owned, this.bioRig.triangleFill, this.bioRig.reporterShape === "flag", this.bioRig.selfTestBlink);
      this.hud.setRelaxed(this.save.settings.relaxedTimer);
      const cycle = (this.input.cyclePressed ? 1 : 0) + this.input.wheel;
      this.interact.update(this.player, this.cam.yaw, cycle);
      const goal = pickGoal(this.interact.items, this.interact.focused);
      const speaker = locateSpeaker(this.root, this.hud.currentLineId);
      this.hints.setSpeaker(speaker.pos, speaker.name, speaker.radio);
      const scanning = this.input.lensHeld || this.flowLens.charging || this.flowLens.waveAge < 0.55;
      this.hints.setScan(scanning);
      this.hints.sync(this.interact.items, this.interact.focused, this.now, {
        player: this.player.position,
        objective: goal?.position ?? speaker.pos,
      });
      this.hud.setScan({
        on: scanning,
        owned: this.flowLens.owned,
        charging: this.flowLens.charging,
        charge01: this.flowLens.charge01,
      });
      this.hud.setTalking(this.hud.showing);
      const help = document.querySelector("#help-card");
      const taught = Number.isFinite(this.helpUntil) && performance.now() > this.helpUntil;
      const hudRoot = document.querySelector("#hud");
      if (hudRoot instanceof HTMLElement) hudRoot.dataset["taught"] = taught ? "1" : "0";
      if (help instanceof HTMLElement) {
        const moving = Math.hypot(this.player.velocity.x, this.player.velocity.z) > 0.45;
        if (moving && !Number.isFinite(this.helpUntil)) this.helpUntil = performance.now() + 12000;
        help.dataset["fade"] = taught ? "1" : "0";
        const scene = this.save.meta.currentScene;
        help.hidden = taught || !(
          scene === "P-S00" ||
          scene === "P-S01" ||
          scene === "P-S02"
        );
      }
      const fBtn = document.querySelector("[data-act='f']");
      if (fBtn instanceof HTMLElement) {
        const scene = this.save.meta.currentScene;
        const hideF = scene === "P-S00" || scene === "P-S01" || scene === "P-S02" || scene === "P-S03";
        fBtn.hidden = !this.tether.owned || hideF;
      }
      const nowMs = performance.now();
      const worldWants = !!this.interact.focused?.enabled;
      const cross = document.querySelector("#crosshair");
      if (cross instanceof HTMLElement) {
        cross.dataset["hot"] = worldWants || this.tether.focusId || this.tether.heldId ? "1" : "0";
      }
      const ate = worldWants
        ? false
        : this.hud.consumeInteract(this.input.interactPressed, this.input.interactHeld, nowMs);
      const tetherLine = this.tether.prompt();
      const worldPrompt = this.interact.promptText();
      const worldMeta = this.interact.promptMeta();
      if (this.tether.heldId && tetherLine) {
        this.hud.setPrompt(tetherLine, {
          prompt: tetherLine,
          bind: "E",
          hold: false,
          hold01: 0,
          index: 1,
          total: 1,
        });
      } else if (worldPrompt && worldMeta) {
        this.hud.setPrompt(worldPrompt, worldMeta);
      } else if (tetherLine) {
        this.hud.setPrompt(tetherLine, {
          prompt: tetherLine,
          bind: "F",
          hold: false,
          hold01: 0,
          index: 1,
          total: 1,
        });
      } else {
        this.hud.setPrompt(null);
      }
      const listed = this.save.settings.interactionList
        ? (this.interact.nearby.length ? this.interact.nearby : this.interact.candidates)
            .slice(0, 4)
            .map((item) => `E ${item.prompt}`)
        : [];
      if (this.save.settings.interactionList && tetherLine && !listed.includes(`E ${tetherLine}`) && !listed.includes(tetherLine)) {
        listed.unshift(tetherLine);
      }
      this.hud.setInteractList(listed.length ? listed : null);
      this.hud.setNav({
        yaw: this.cam.yaw,
        marks: navMarks(this.player.position, this.interact.items, goal, speaker.pos),
        objective: document.querySelector("#task-line")?.textContent || goal?.prompt || worldPrompt || "看橙燈與發光環",
        speaker: speaker.name || null,
        radio: speaker.radio,
      });
      if (!ate && !this.tether.heldId) {
        const used = this.interact.pollUse(dt, this.input.interactPressed, this.input.interactHeld);
        if (used) {
          this.input.consumeInteract();
          const verb = used.prompt;
          if (/推開/.test(verb)) this.player.playAction("push");
          else if (/拾起|取下|帶上|抓取/.test(verb)) this.player.playAction("pick");
          used.onUse();
        }
      }
      this.active.update(dt, this.context());
      this.hud.tick(nowMs);
      this.input.beginFrame();
    }
    this.renderer.render(this.three, this.camera);
    requestAnimationFrame(this.frame);
  };

  private onKey = (event: KeyboardEvent): void => {
    if (event.code === "KeyC" && this.playing && !this.overlays.anyModal()) {
      this.overlays.toggleCodex(this.save.player.codex.terms);
      return;
    }
    if (event.code !== "Escape") return;
    if (this.hud.closeChipWithEsc()) return;
    if (!this.playing) return;
    if (this.overlays.anyModal() && !this.paused) return;
    this.setPaused(!this.paused);
  };

  private resize = (): void => {
    const w = window.innerWidth;
    const h = Math.max(1, window.innerHeight);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  };
}

function resumeLabel(id: SceneId): string {
  if (id === "BOOT-S00") return "";
  return SCENE_DEFS[id]?.name ?? "";
}

function pickGoal(items: Interactable[], focused: Interactable | null): Interactable | null {
  const ranked = items.filter((item) => item.enabled);
  const preferred = ranked.find((item) =>
    /控制室|升降|進入|拾起|取下|推開|去河港|探頭|透鏡|工具箱|維修梯|放下|開門|扣進|走過/.test(item.prompt),
  );
  return preferred ?? focused ?? ranked[0] ?? null;
}

function locateSpeaker(
  root: THREE.Object3D,
  lineId: string | null,
): { pos: THREE.Vector3 | null; name: string; radio: boolean } {
  if (!lineId) return { pos: null, name: "", radio: false };
  const entry = getLine(lineId);
  const radio = entry?.channel === "radio" || entry?.channel === "distant";
  const name = entry?.speaker ?? "";
  const sos = root.getObjectByName("sos-beacon");
  const xiaocen = root.getObjectByName("xiaocen");
  const named = radio ? sos ?? xiaocen : xiaocen ?? sos;
  if (named) {
    const pos = new THREE.Vector3();
    named.getWorldPosition(pos);
    return { pos, name: radio ? `${name}／橙燈` : name, radio };
  }
  return { pos: null, name, radio };
}

function navMarks(
  player: THREE.Vector3,
  items: Interactable[],
  goal: Interactable | null,
  talk: THREE.Vector3 | null,
): NavMark[] {
  const marks: NavMark[] = [{ x: player.x, z: player.z, kind: "self" }];
  for (const item of items) {
    if (!item.enabled) continue;
    marks.push({ x: item.position.x, z: item.position.z, kind: goal?.id === item.id ? "goal" : "item" });
  }
  if (talk) marks.push({ x: talk.x, z: talk.z, kind: "talk" });
  return marks;
}


