import * as THREE from "three";
import type { ToolVoice } from "../audio";
import type { PulseHit, SignalGraph } from "./signalGraph";

const CHARGE_SECONDS = 1.2;
const SHORT_RANGE = 8;
const LONG_RANGE = 16;
const REVEAL = 2;
const DEAD_LIFE = 1;
const SHORT_COST = 0.12;
const LONG_COST = 0.28;
const SHORT_RECOVER = 0.4;
const LONG_RECOVER = 1.6;
const PARTICLE_COUNT = 220;

export interface FlowLensTick {
  dt: number;
  hold: boolean;
  release: boolean;
  press: boolean;
  origin: THREE.Vector3;
  graph: SignalGraph;
  battery: number;
  drainScale: number;
  scanRange: number;
  tapMode: boolean;
  readable: boolean;
  reducedMotion: boolean;
}

export class FlowLens {
  owned = false;
  charging = false;
  charge01 = 0;
  recoverUntil = 0;
  freePulsesRemaining = 0;
  lastHits: PulseHit[] = [];
  lastPulseAt = 0;
  time = 0;
  visible = false;
  showHudRing = false;
  failedPulse = false;
  lastRange = SHORT_RANGE;
  justPulsed = false;
  justFailed = false;
  waveAge = 99;
  deniedHint = false;

  private tapHeld = false;
  private voice: ToolVoice | null = null;
  private group: THREE.Group | null = null;
  private preview: THREE.Mesh | null = null;
  private wave: THREE.Mesh | null = null;
  private points: THREE.Points | null = null;
  private waveRange = SHORT_RANGE;
  private readonly tmp = new THREE.Vector3();

  bindAudio(voice: ToolVoice): void {
    this.voice = voice;
  }

  attach(root: THREE.Group): void {
    this.detach();
    const group = new THREE.Group();
    group.name = "flow-lens-fx";

    const preview = new THREE.Mesh(
      new THREE.SphereGeometry(1, 18, 12),
      new THREE.MeshBasicMaterial({
        color: 0xc9861a,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        fog: false,
        toneMapped: false,
        wireframe: true,
      }),
    );
    preview.visible = false;
    group.add(preview);

    const wave = new THREE.Mesh(
      new THREE.SphereGeometry(1, 20, 14),
      new THREE.MeshBasicMaterial({
        color: 0x7ec8c3,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        fog: false,
        toneMapped: false,
        side: THREE.BackSide,
      }),
    );
    wave.visible = false;
    group.add(wave);

    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const points = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        size: 0.09,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
      }),
    );
    points.frustumCulled = false;
    group.add(points);

    root.add(group);
    this.group = group;
    this.preview = preview;
    this.wave = wave;
    this.points = points;
  }

  detach(): void {
    if (this.group?.parent) this.group.parent.remove(this.group);
    this.disposeObject(this.preview);
    this.disposeObject(this.wave);
    this.disposeObject(this.points);
    this.group = null;
    this.preview = null;
    this.wave = null;
    this.points = null;
  }

  reset(owned: boolean): void {
    this.owned = owned;
    this.charging = false;
    this.charge01 = 0;
    this.recoverUntil = 0;
    this.freePulsesRemaining = 0;
    this.lastHits = [];
    this.visible = owned;
    this.showHudRing = owned;
    this.failedPulse = false;
    this.justPulsed = false;
    this.justFailed = false;
    this.tapHeld = false;
    this.waveAge = 99;
    this.deniedHint = false;
  }

  grantPickup(): void {
    this.owned = true;
    this.visible = true;
    this.freePulsesRemaining = 1;
    this.showHudRing = true;
    this.charge01 = 0;
    this.charging = false;
  }

  recovering(now = this.time): boolean {
    return now < this.recoverUntil;
  }

  rangeAt(charge01: number, scanRange: number): number {
    const floor = this.freePulsesRemaining > 0 ? LONG_RANGE : SHORT_RANGE;
    return (floor + (LONG_RANGE - floor) * charge01) * Math.max(0.4, scanRange);
  }

  update(tick: FlowLensTick): number {
    this.time += tick.dt;
    this.justPulsed = false;
    this.justFailed = false;
    this.deniedHint = false;
    if (this.time > this.lastPulseAt + 0.4) this.failedPulse = false;
    if (!this.owned) {
      this.deniedHint = tick.press || tick.hold;
      this.charging = tick.hold;
      this.charge01 = tick.hold ? 0.4 : 0;
      if (tick.hold) this.waveAge = 0;
      else this.waveAge += tick.dt;
      this.syncVisuals(tick.origin, tick.reducedMotion);
      return tick.battery;
    }

    let battery = tick.battery;
    const recovering = this.recovering();

    if (tick.tapMode) {
      battery = this.tickTap(tick, battery, recovering);
    } else {
      battery = this.tickHold(tick, battery, recovering);
    }

    this.lastHits = this.lastHits.filter((hit) => {
      const age = this.time - this.lastPulseAt;
      if (hit.lie === "dead_shine") return age < DEAD_LIFE;
      return age < REVEAL;
    });

    this.waveAge += tick.dt;
    this.syncVisuals(tick.origin, tick.reducedMotion);
    return battery;
  }

  private tickHold(tick: FlowLensTick, battery: number, recovering: boolean): number {
    if (tick.hold && !recovering) {
      this.charging = true;
      this.charge01 = Math.min(1, this.charge01 + tick.dt / CHARGE_SECONDS);
    }
    if (tick.release && this.charging) {
      battery = this.fire(tick, battery);
      this.charging = false;
      this.charge01 = 0;
    }
    if (!tick.hold) {
      this.charging = false;
      if (!tick.release) this.charge01 = 0;
    }
    return battery;
  }

  private tickTap(tick: FlowLensTick, battery: number, recovering: boolean): number {
    if (tick.press && !recovering) {
      if (this.tapHeld || this.charging) {
        battery = this.fire(tick, battery);
        this.charging = false;
        this.tapHeld = false;
        this.charge01 = 0;
        return battery;
      }
      this.charging = true;
      this.tapHeld = true;
      this.charge01 = 0.18;
    }
    if (this.charging && tick.hold) {
      this.charge01 = Math.min(1, this.charge01 + tick.dt / CHARGE_SECONDS);
    }
    if (tick.release && this.charging && !this.tapHeld) {
      battery = this.fire(tick, battery);
      this.charging = false;
      this.charge01 = 0;
    }
    if (!tick.hold && !this.charging) this.tapHeld = false;
    return battery;
  }

  private fire(tick: FlowLensTick, battery: number): number {
    const range = this.rangeAt(this.charge01, tick.scanRange);
    this.lastRange = range;
    const free = this.freePulsesRemaining > 0;
    const cost = free ? 0 : (SHORT_COST + (LONG_COST - SHORT_COST) * this.charge01) * tick.drainScale;
    if (!free && battery < cost) {
      this.failedPulse = true;
      this.justFailed = true;
      this.lastHits = [];
      this.voice?.empty();
      return battery;
    }
    if (free) this.freePulsesRemaining -= 1;
    else battery = Math.max(0, battery - cost);
    this.lastHits = tick.graph.pulse(tick.origin, range, tick.readable);
    this.lastPulseAt = this.time;
    this.recoverUntil = free ? this.time : this.time + (this.charge01 > 0.8 ? LONG_RECOVER : SHORT_RECOVER);
    this.showHudRing = true;
    this.justPulsed = true;
    this.waveAge = 0;
    this.waveRange = range;
    this.voice?.pulse();
    return battery;
  }

  private syncVisuals(origin: THREE.Vector3, reduced: boolean): void {
    if (!this.preview || !this.wave || !this.points) return;
    this.preview.position.copy(origin);
    if (this.charging) {
      const range = this.owned ? this.rangeAt(this.charge01, 1) : 4.2;
      this.preview.visible = true;
      this.preview.scale.setScalar(range);
      const mat = this.preview.material;
      if (mat instanceof THREE.MeshBasicMaterial) {
        mat.color.setHex(this.owned ? 0xc9861a : 0x8fd4cf);
        mat.opacity = 0.28 + this.charge01 * 0.28;
        mat.fog = false;
        mat.toneMapped = false;
      }
    } else {
      this.preview.visible = false;
    }

    if (this.waveAge < 0.7) {
      this.wave.visible = true;
      this.wave.position.copy(origin);
      const grow = reduced ? 0.7 : this.waveAge / 0.7;
      this.wave.scale.setScalar(Math.max(0.25, (this.owned ? this.waveRange : 4.2) * grow));
      const mat = this.wave.material;
      if (mat instanceof THREE.MeshBasicMaterial) {
        mat.opacity = 0.42 * (1 - grow);
        mat.fog = false;
        mat.toneMapped = false;
      }
    } else {
      this.wave.visible = false;
    }

    this.writeParticles();
  }

  private writeParticles(): void {
    if (!this.points) return;
    const pos = this.points.geometry.getAttribute("position");
    const col = this.points.geometry.getAttribute("color");
    if (!(pos instanceof THREE.BufferAttribute) || !(col instanceof THREE.BufferAttribute)) return;
    const p = pos.array;
    const c = col.array;
    let write = 0;
    const per = Math.max(1, Math.floor(PARTICLE_COUNT / Math.max(1, this.lastHits.length)));
    for (const hit of this.lastHits) {
      const age = this.time - this.lastPulseAt;
      const life = hit.lie === "dead_shine" ? DEAD_LIFE : REVEAL;
      const fade = Math.max(0, 1 - age / life);
      const rgb = tint(hit.lie);
      const count = Math.min(per, PARTICLE_COUNT - write);
      for (let i = 0; i < count; i += 1) {
        let u = i / Math.max(1, count);
        if (hit.moving) u = (u + this.time * (hit.kind === "emergency_pulse" ? 0.9 : 0.45)) % 1;
        this.tmp.copy(hit.from).lerp(hit.to, u);
        const idx = write * 3;
        p[idx] = this.tmp.x;
        p[idx + 1] = this.tmp.y;
        p[idx + 2] = this.tmp.z;
        const glow = hit.brightness * fade;
        c[idx] = rgb[0] * glow;
        c[idx + 1] = rgb[1] * glow;
        c[idx + 2] = rgb[2] * glow;
        write += 1;
      }
    }
    for (let i = write; i < PARTICLE_COUNT; i += 1) {
      const idx = i * 3;
      p[idx] = 0;
      p[idx + 1] = -40;
      p[idx + 2] = 0;
      c[idx] = 0;
      c[idx + 1] = 0;
      c[idx + 2] = 0;
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
    this.points.visible = this.lastHits.length > 0;
  }

  private disposeObject(object: THREE.Object3D | null): void {
    if (!object) return;
    if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
      object.geometry.dispose();
      const material = object.material;
      if (Array.isArray(material)) {
        for (const item of material) item.dispose();
      } else {
        material.dispose();
      }
    }
  }
}

function tint(lie: PulseHit["lie"]): [number, number, number] {
  switch (lie) {
    case "live":
      return [0.49, 0.86, 0.82];
    case "dead_shine":
      return [1, 0.72, 0.22];
    case "occluded":
      return [0.55, 0.62, 0.7];
    case "city_light":
      return [0.95, 0.28, 0.2];
    case "saturated":
      return [0.95, 0.2, 0.18];
    case "unreadable":
      return [0.75, 0.75, 0.78];
    default:
      return [0.45, 0.5, 0.55];
  }
}
