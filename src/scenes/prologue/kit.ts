import * as THREE from "three";
import { P00 } from "../../content/prologue/script";
import {
  STORM,
  addPlayLights,
  addSolidBox,
  applyFog,
  boxMesh,
  configureKeyShadow,
  lamp,
  makeRain,
  playPoint,
  surf,
  tickRain,
  waterSheet,
} from "../../engine/greybox";
import { addVoxelFloor } from "../../engine/voxels";
import { makeWorldLabel } from "../../engine/worldHints";
import { citySkyline } from "../../engine/props";
import { createNpc } from "../../engine/npc";
import type { SceneContext } from "../types";

export function lambertOf(mesh: THREE.Mesh): THREE.MeshStandardMaterial | THREE.MeshLambertMaterial | null {
  const mat = mesh.material;
  if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshLambertMaterial) return mat;
  return null;
}

export function onceFlags(): { take(key: string): boolean } {
  const seen = new Set<string>();
  return {
    take(key: string): boolean {
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    },
  };
}

export function stormShell(ctx: SceneContext, outdoor: boolean): {
  hemi: THREE.HemisphereLight;
  key: THREE.DirectionalLight;
  rain: THREE.Points | null;
  setFill: (t01: number) => void;
} {
  applyFog(ctx.three, STORM, ctx.reducedMotion);
  if (ctx.three.fog instanceof THREE.FogExp2) {
    ctx.three.fog.density = ctx.reducedMotion ? 0.0032 : outdoor ? 0.0042 : 0.0065;
  }
  const hemi = new THREE.HemisphereLight(0xc8d8e4, 0x2a343c, outdoor ? 0.62 : 0.48);
  const key = new THREE.DirectionalLight(0xd8e4ee, outdoor ? 0.95 : 0.72);
  key.position.set(-10, 22, 8);
  configureKeyShadow(key, outdoor ? 32 : 16);
  ctx.root.add(hemi, key);
  addPlayLights(ctx.root, outdoor ? "storm" : "indoor");
  if (outdoor) ctx.root.add(citySkyline(-24));
  if (!outdoor) {
    const fill = playPoint(0xffd8a0, 1.6, 12, 1.1);
    fill.position.set(0, 2.2, 1.2);
    ctx.root.add(fill);
  }
  const rain = outdoor && !ctx.reducedMotion ? makeRain(false) : null;
  if (rain) ctx.root.add(rain);
  return {
    hemi,
    key,
    rain,
    setFill(t01: number) {
      const t = THREE.MathUtils.clamp(t01, 0, 1);
      hemi.intensity = (outdoor ? 0.62 : 0.48) * Math.max(0.7, t);
      key.intensity = (outdoor ? 0.95 : 0.72) * Math.max(0.75, t);
    },
  };
}

export function addAmberSpine(
  ctx: SceneContext,
  x: number,
  z0: number,
  z1: number,
): THREE.Mesh[] {
  const posts: THREE.Mesh[] = [];
  const lo = Math.min(z0, z1);
  const hi = Math.max(z0, z1);
  const strip = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.03, hi - lo),
    new THREE.MeshBasicMaterial({
      color: 0xffc14a,
      fog: false,
      toneMapped: false,
    }),
  );
  strip.position.set(x, 0.03, (lo + hi) * 0.5);
  ctx.root.add(strip);
  for (let z = lo + 0.8; z <= hi; z += 3.3) {
    ctx.root.add(lamp(STORM.accent, x, 1.55, z));
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.07, 1.35, 6),
      new THREE.MeshLambertMaterial({ color: 0x3a2a12, emissive: STORM.accent, emissiveIntensity: 0.32 }),
    );
    post.position.set(x, 0.68, z);
    ctx.root.add(post);
    posts.push(post);
    ctx.world.addAnchor(`amber-${z.toFixed(0)}`, x, 0, z);
  }
  return posts;
}

export function addGate3(
  root: THREE.Object3D,
  x: number,
  y: number,
  z: number,
): { group: THREE.Group; setRise: (t01: number) => void; spin: (dt: number) => void } {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  for (let i = -7; i <= 7; i += 2) {
    const pillar = new THREE.Mesh(
      new THREE.BoxGeometry(1.85, 10, 1.15),
      surf(i % 4 === 1 ? 0x3a444c : 0x2c343c, { roughness: 0.88, metalness: 0.08, flat: true }),
    );
    pillar.position.set(i, 0, 0);
    group.add(pillar);
  }
  const lintel = new THREE.Mesh(
    new THREE.BoxGeometry(16.4, 1.2, 1.4),
    surf(0x243038, { roughness: 0.86, metalness: 0.1, flat: true }),
  );
  lintel.position.y = 5.4;
  group.add(lintel);
  const booth = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 2.2, 2.4),
    surf(0x2c343c, { roughness: 0.86, metalness: 0.08, flat: true }),
  );
  booth.position.set(5.4, 4.2, -1.2);
  const boothWin = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.7, 0.08),
    new THREE.MeshBasicMaterial({ color: 0xff7a28 }),
  );
  boothWin.position.set(5.4, 4.35, -2.38);
  group.add(booth, boothWin);
  const blades: THREE.Mesh[] = [];
  for (let i = 0; i < 5; i += 1) {
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(14.4, 0.55, 0.32),
      surf(0x6a7380, { roughness: 0.55, metalness: 0.28, flat: true }),
    );
    blade.position.set(0, -2.4 + i * 0.85, -0.7);
    group.add(blade);
    blades.push(blade);
  }
  const rim = playPoint(0x7a93a6, 2.4, 40, 1.15);
  rim.position.set(0, 5.4, -4);
  group.add(rim);
  root.add(group);
  const restY = group.position.y;
  return {
    group,
    setRise(t01: number) {
      group.position.y = restY + THREE.MathUtils.clamp(t01, 0, 1) * 7.2;
    },
    spin(dt: number) {
      for (const blade of blades) blade.rotation.z += dt * 0.55;
    },
  };
}

export function addSosBeacon(
  root: THREE.Object3D,
  x: number,
  y: number,
  z: number,
): { light: THREE.PointLight; bulb: THREE.Mesh; shaft: THREE.Mesh; tick: (elapsed: number) => void } {
  const group = new THREE.Group();
  group.name = "sos-beacon";
  group.position.set(x, y, z);
  const light = playPoint(STORM.emissive, 2.8, 42, 1.15);
  light.position.set(0, 6.4, 0);
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.62, 14, 12),
    new THREE.MeshBasicMaterial({ color: STORM.emissive }),
  );
  bulb.position.set(0, 6.4, 0);
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.28, 14, 8),
    new THREE.MeshBasicMaterial({ color: STORM.emissive, transparent: true, opacity: 0.42 }),
  );
  shaft.position.set(0, 4.2, 0);
  const halo = new THREE.Mesh(
    new THREE.CircleGeometry(1.4, 20),
    new THREE.MeshBasicMaterial({ color: STORM.emissive, transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false }),
  );
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = 0.08;
  group.add(light, bulb, shaft, halo);
  root.add(group);
  return {
    light,
    bulb,
    shaft,
    tick(elapsed: number) {
      const on = elapsed % P00.sosPeriod < P00.sosOn;
      light.intensity = on ? 820 : 140;
      const mat = shaft.material;
      if (mat instanceof THREE.MeshBasicMaterial) mat.opacity = on ? 0.62 : 0.22;
      bulb.scale.setScalar(on ? 1.28 : 0.88);
    },
  };
}

export function addXiaocenFigure(root: THREE.Object3D, x: number, y: number, z: number, sit = false): THREE.Group {
  const group = new THREE.Group();
  group.name = "xiaocen";
  group.position.set(x, y, z);
  const body = createNpc("xiaocen", sit);
  body.scale.setScalar(0.92);
  group.add(body);
  const name = makeWorldLabel("小岑", sit ? "剛被拉上來" : "橙燈在這裡");
  name.position.y = sit ? 1.55 : 2.05;
  group.add(name);
  root.add(group);
  return group;
}

export function addWaterChannel(root: THREE.Object3D, x: number, y: number, z: number): {
  sheet: THREE.Mesh;
  chevrons: THREE.Mesh[];
  setDir: (sign: number) => void;
  tick: (dt: number) => void;
} {
  const sheet = waterSheet(90, 90, x, y, z);
  root.add(sheet);
  const chevrons: THREE.Mesh[] = [];
  const dir = { sign: -1 };
  for (let i = 0; i < 8; i += 1) {
    const mark = new THREE.Mesh(
      new THREE.ConeGeometry(0.45, 1.1, 3),
      new THREE.MeshBasicMaterial({ color: 0x6a8a94, transparent: true, opacity: 0.35 }),
    );
    mark.rotation.x = Math.PI / 2;
    mark.position.set(x - 6 + i * 2.2, y + 0.04, z + 4);
    root.add(mark);
    chevrons.push(mark);
  }
  return {
    sheet,
    chevrons,
    setDir(sign: number) {
      dir.sign = sign < 0 ? -1 : 1;
      for (const mark of chevrons) mark.rotation.z = dir.sign < 0 ? 0 : Math.PI;
    },
    tick(dt: number) {
      for (const mark of chevrons) {
        mark.position.x += dir.sign * dt * 1.1;
        if (mark.position.x > x + 12) mark.position.x = x - 12;
        if (mark.position.x < x - 12) mark.position.x = x + 12;
      }
    },
  };
}

export function addPipe(
  root: THREE.Object3D,
  x: number,
  y: number,
  z: number,
  length: number,
  radius: number,
  color: number,
  along: "x" | "z" = "x",
): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, length, 8),
    new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: 0.04 }),
  );
  if (along === "x") {
    mesh.rotation.z = Math.PI / 2;
    mesh.position.set(x + length / 2, y, z);
  } else {
    mesh.rotation.x = Math.PI / 2;
    mesh.position.set(x, y, z + length / 2);
  }
  root.add(mesh);
  return mesh;
}

export function pulsePipe(mesh: THREE.Mesh, kind: "dead" | "live" | "dummy", age: number): void {
  const mat = lambertOf(mesh);
  if (!mat) return;
  if (kind === "dead") {
    const t = Math.max(0, 1 - age);
    mat.emissiveIntensity = 0.08 + t * 1.35;
    mat.color.setHex(t > 0.15 ? 0xd4a23a : 0x5a4a28);
    return;
  }
  if (kind === "live") {
    const wave = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(age * 9));
    mat.emissiveIntensity = age < 2 ? wave : 0.06;
    mat.color.setHex(0x4a8a84);
    return;
  }
  mat.emissiveIntensity = age < 2 ? 0.12 : 0.03;
}

export function addRelayMesh(root: THREE.Object3D, x: number, y: number, z: number, tint: number): THREE.Mesh {
  const body = boxMesh(0.42, 0.42, 0.42, tint, x, y, z);
  const nub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.07, 0.2, 8),
    new THREE.MeshLambertMaterial({ color: 0xc9a36a }),
  );
  nub.rotation.z = Math.PI / 2;
  nub.position.set(0.28, 0, 0);
  body.add(nub);
  root.add(body);
  return body;
}

export function addShapeMark(root: THREE.Object3D, shape: "chevron" | "notch", x: number, y: number, z: number): THREE.Mesh {
  if (shape === "chevron") {
    const mark = new THREE.Mesh(
      new THREE.ConeGeometry(0.2, 0.34, 3),
      new THREE.MeshLambertMaterial({ color: 0x8aa8b0, emissive: 0x3a5058, emissiveIntensity: 0.4 }),
    );
    mark.rotation.x = Math.PI;
    mark.position.set(x, y + 0.12, z);
    root.add(mark);
    return mark;
  }
  const mark = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.1, 0.2),
    new THREE.MeshLambertMaterial({ color: 0x8aa8b0, emissive: 0x3a5058, emissiveIntensity: 0.4 }),
  );
  mark.position.set(x, y + 0.06, z);
  root.add(mark);
  return mark;
}

export function addControlLamp(
  root: THREE.Object3D,
  x: number,
  y: number,
  z: number,
  kind: "circle" | "bar" | "tri",
): THREE.Mesh {
  const geom =
    kind === "circle"
      ? new THREE.CircleGeometry(0.18, 12)
      : kind === "bar"
        ? new THREE.BoxGeometry(0.42, 0.1, 0.04)
        : new THREE.ConeGeometry(0.16, 0.28, 3);
  const mesh = new THREE.Mesh(
    geom,
    new THREE.MeshBasicMaterial({ color: 0x2a3036 }),
  );
  mesh.position.set(x, y, z);
  root.add(mesh);
  return mesh;
}

export function lightLamp(mesh: THREE.Mesh, on: boolean): void {
  const mat = mesh.material;
  if (!(mat instanceof THREE.MeshBasicMaterial)) return;
  mat.color.setHex(on ? 0x7ec8c3 : 0x2a3036);
}

export class SceneVoice {
  private ctx: AudioContext | null = null;
  private rumble: OscillatorNode | null = null;
  private layers: OscillatorNode[] = [];
  private layerGain: GainNode | null = null;
  private pad: OscillatorNode | null = null;
  private padB: OscillatorNode | null = null;

  private ensure(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    this.ctx = new Ctor();
    return this.ctx;
  }

  startRumble(): void {
    const ctx = this.ensure();
    if (!ctx || this.rumble) return;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.value = 38;
    filter.type = "lowpass";
    filter.frequency.value = 90;
    gain.gain.value = 0.028;
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    this.rumble = osc;
  }

  squelch(): void {
    const ctx = this.ensure();
    if (!ctx) return;
    const noise = ctx.createBufferSource();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.35, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1800;
    const gain = ctx.createGain();
    gain.gain.value = 0.04;
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
    noise.stop(ctx.currentTime + 0.36);
  }

  setLayers(count: number): void {
    const ctx = this.ensure();
    if (!ctx) return;
    for (const osc of this.layers) osc.stop();
    this.layers = [];
    if (this.layerGain) this.layerGain.disconnect();
    const gain = ctx.createGain();
    gain.gain.value = 0.018 * count;
    gain.connect(ctx.destination);
    this.layerGain = gain;
    for (let i = 0; i < count; i += 1) {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = 70 + i * 42;
      osc.connect(gain);
      osc.start();
      this.layers.push(osc);
    }
  }

  clunk(index: number): void {
    const ctx = this.ensure();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 110 + index * 36;
    gain.gain.value = 0.04;
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.16);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.17);
  }

  startPad(): void {
    const ctx = this.ensure();
    if (!ctx || this.pad) return;
    const a = ctx.createOscillator();
    const b = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    a.type = "sine";
    b.type = "sine";
    a.frequency.value = 196;
    b.frequency.value = 246.9;
    filter.type = "lowpass";
    filter.frequency.value = 520;
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 1.6);
    a.connect(filter);
    b.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    a.start();
    b.start();
    this.pad = a;
    this.padB = b;
  }

  dispose(): void {
    try {
      this.rumble?.stop();
      this.pad?.stop();
      this.padB?.stop();
      for (const osc of this.layers) osc.stop();
      void this.ctx?.close();
    } catch {
      // already closed
    }
    this.ctx = null;
    this.rumble = null;
    this.pad = null;
    this.padB = null;
    this.layers = [];
  }
}

let rainTick = 0;
export function tickSceneRain(rain: THREE.Points | null, dt: number): void {
  rainTick += 1;
  if (rain) tickRain(rain, dt, { skip: rainTick % 2 === 0 });
}

export function addDeck(
  ctx: SceneContext,
  w: number,
  d: number,
  x: number,
  z: number,
  color = STORM.floor,
): THREE.Mesh {
  return addVoxelFloor(ctx.root, ctx.world, w, d, color, x, z);
}

export { addSolidBox, boxMesh, STORM };
