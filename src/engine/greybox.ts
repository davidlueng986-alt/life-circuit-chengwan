import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { syncAabb, type WorldColliders } from "./collision";

export interface Palette {
  floor: number;
  wall: number;
  accent: number;
  emissive: number;
  fog: number;
}

export type LitMat = THREE.MeshStandardMaterial | THREE.MeshLambertMaterial;

export const STORM: Palette = {
  floor: 0x3a444c,
  wall: 0x2e3840,
  accent: 0xe0a03a,
  emissive: 0xff7a28,
  fog: 0x1c2428,
};

export const HUB: Palette = {
  floor: 0x5c5348,
  wall: 0x433c34,
  accent: 0xe2c49a,
  emissive: 0xe0a03a,
  fog: 0x2a241c,
};

export const WORKSHOP: Palette = {
  floor: 0x3a5054,
  wall: 0x2a3e42,
  accent: 0x8fd4cf,
  emissive: 0x8fd4cf,
  fog: 0x1c2c2e,
};

export const HARBOR: Palette = {
  floor: 0x4e463e,
  wall: 0x53483e,
  accent: 0xd46a3e,
  emissive: 0xff7a28,
  fog: 0x2a2420,
};

export function isLitMat(mat: unknown): mat is LitMat {
  return mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshLambertMaterial;
}

let boxNoise: THREE.CanvasTexture | null = null;

function boxNoiseMap(): THREE.CanvasTexture {
  if (boxNoise) return boxNoise;
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const g = canvas.getContext("2d");
  if (g) {
    g.fillStyle = "#9aa3a8";
    g.fillRect(0, 0, 64, 64);
    for (let i = 0; i < 240; i += 1) {
      g.fillStyle = `rgba(255,255,255,${0.04 + Math.random() * 0.1})`;
      g.fillRect(Math.random() * 64, Math.random() * 64, 1 + Math.random() * 2, 1 + Math.random() * 2);
    }
    g.strokeStyle = "rgba(20,24,28,0.18)";
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(0, 32);
    g.lineTo(64, 32);
    g.moveTo(32, 0);
    g.lineTo(32, 64);
    g.stroke();
  }
  boxNoise = new THREE.CanvasTexture(canvas);
  boxNoise.wrapS = THREE.RepeatWrapping;
  boxNoise.wrapT = THREE.RepeatWrapping;
  boxNoise.colorSpace = THREE.SRGBColorSpace;
  return boxNoise;
}

function luma(color: number): number {
  const r = ((color >> 16) & 255) / 255;
  const g = ((color >> 8) & 255) / 255;
  const b = (color & 255) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Three r155+ point lights are candela. Greybox strengths are still 0–8 “old units”. */
export function playPoint(color: number, strength = 1, distance = 16, decay = 1.05): THREE.PointLight {
  return new THREE.PointLight(color, Math.max(16, strength * 34), distance, decay);
}

export function surf(
  color: number,
  opts: {
    roughness?: number;
    metalness?: number;
    emissive?: number;
    emissiveIntensity?: number;
    opacity?: number;
    flat?: boolean;
    textured?: boolean;
  } = {},
): THREE.MeshStandardMaterial {
  const opacity = opts.opacity ?? 1;
  const dark = luma(color) < 0.2;
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.78,
    metalness: opts.metalness ?? 0.06,
    emissive: opts.emissive ?? (dark ? color : 0x000000),
    emissiveIntensity: opts.emissiveIntensity ?? (dark ? 0.28 : 0),
    transparent: opacity < 1,
    opacity,
    depthWrite: opacity >= 1,
    flatShading: opts.flat ?? false,
  });
  if (opts.textured) {
    const map = boxNoiseMap().clone();
    map.needsUpdate = true;
    mat.map = map;
  }
  return mat;
}

export function paintEmissive(object: THREE.Object3D, intensity: number, color?: number): void {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    if (!isLitMat(child.material)) return;
    child.material.emissiveIntensity = intensity;
    if (color !== undefined) child.material.emissive.setHex(color);
  });
}

export function configureKeyShadow(light: THREE.DirectionalLight, span = 28): void {
  light.castShadow = true;
  light.shadow.mapSize.set(1024, 1024);
  light.shadow.bias = -0.00035;
  light.shadow.normalBias = 0.035;
  light.shadow.camera.near = 1.5;
  light.shadow.camera.far = 80;
  light.shadow.camera.left = -span;
  light.shadow.camera.right = span;
  light.shadow.camera.top = span;
  light.shadow.camera.bottom = -span;
}

export function clearGroup(group: THREE.Group): void {
  const keep: THREE.Object3D[] = [];
  group.traverse((child) => keep.push(child));
  for (const child of keep) {
    if (child === group) continue;
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      for (const material of materials) material.dispose();
    }
  }
  group.clear();
}

function radiusFor(w: number, h: number, d: number): number {
  return Math.min(0.07, Math.min(w, h, d) * 0.18);
}

export function boxMesh(
  w: number,
  h: number,
  d: number,
  color: number,
  x: number,
  y: number,
  z: number,
): THREE.Mesh {
  const r = radiusFor(w, h, d);
  const geo =
    Math.min(w, h, d) > 0.12
      ? new RoundedBoxGeometry(w, h, d, 2, r)
      : new THREE.BoxGeometry(w, h, d);
  const metal = Math.min(w, h, d) < 0.35 ? 0.35 : 0.05;
  const mat = surf(color, { roughness: metal > 0.2 ? 0.42 : 0.8, metalness: metal, textured: true });
  if (mat.map) mat.map.repeat.set(Math.max(1, w * 0.45), Math.max(1, d * 0.45));
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function addSolidBox(
  group: THREE.Group,
  world: WorldColliders,
  w: number,
  h: number,
  d: number,
  color: number,
  x: number,
  y: number,
  z: number,
): THREE.Mesh {
  const mesh = boxMesh(w, h, d, color, x, y, z);
  group.add(mesh);
  const aabb = world.addBox(
    new THREE.Vector3(x - w / 2, y - h / 2, z - d / 2),
    new THREE.Vector3(x + w / 2, y + h / 2, z + d / 2),
  );
  mesh.userData["aabb"] = aabb;
  mesh.userData["size"] = { w, h, d };
  return mesh;
}

export function placeSolid(mesh: THREE.Mesh, x: number, y: number, z: number): void {
  mesh.position.set(x, y, z);
  const size = mesh.userData["size"] as { w: number; h: number; d: number } | undefined;
  const aabb = mesh.userData["aabb"] as { min: THREE.Vector3; max: THREE.Vector3 } | undefined;
  if (!size || !aabb) return;
  syncAabb(aabb, x, y, z, size.w, size.h, size.d);
}

export function waterSheet(w: number, d: number, x: number, y: number, z: number): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, d, 28, 28),
    new THREE.MeshPhysicalMaterial({
      color: 0x1a3844,
      roughness: 0.18,
      metalness: 0.04,
      transmission: 0.12,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, y, z);
  mesh.name = "water";
  mesh.receiveShadow = true;
  return mesh;
}

export function tickWater(mesh: THREE.Mesh, time: number): void {
  const attr = mesh.geometry.getAttribute("position");
  if (!(attr instanceof THREE.BufferAttribute)) return;
  for (let i = 0; i < attr.count; i += 1) {
    const x = attr.getX(i);
    const z = attr.getY(i);
    attr.setZ(i, Math.sin(x * 0.35 + time * 1.6) * 0.07 + Math.cos(z * 0.28 + time * 1.1) * 0.05);
  }
  attr.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

export function lamp(color: number, x: number, y: number, z: number): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  const light = playPoint(color, 3.6, 16, 1.05);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 0.12, 10), surf(0x2a241c, { roughness: 0.55, textured: false }));
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 12, 10),
    surf(color, { roughness: 0.35, emissive: color, emissiveIntensity: 1.6, textured: false }),
  );
  bulb.position.y = -0.08;
  shade.position.y = 0.02;
  group.add(light, shade, bulb);
  return group;
}

export function addSky(scene: THREE.Scene, zenith: number, horizon: number): THREE.Mesh {
  const geo = new THREE.SphereGeometry(90, 24, 16);
  const colors = new Float32Array(geo.attributes.position!.count * 3);
  const cTop = new THREE.Color(zenith);
  const cBot = new THREE.Color(horizon);
  const pos = geo.attributes.position!;
  const tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i += 1) {
    const y = pos.getY(i);
    tmp.copy(cBot).lerp(cTop, THREE.MathUtils.clamp((y + 20) / 70, 0, 1));
    colors[i * 3] = tmp.r;
    colors[i * 3 + 1] = tmp.g;
    colors[i * 3 + 2] = tmp.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, depthWrite: false, fog: false }),
  );
  mesh.name = "sky-dome";
  scene.add(mesh);
  return mesh;
}

export function applyFog(scene: THREE.Scene, palette: Palette, reduced: boolean): void {
  scene.background = new THREE.Color(palette.fog);
  scene.fog = new THREE.FogExp2(palette.fog, reduced ? 0.004 : 0.0068);
  const old = scene.getObjectByName("sky-dome");
  if (old) {
    scene.remove(old);
    if (old instanceof THREE.Mesh) {
      old.geometry.dispose();
      if (old.material instanceof THREE.Material) old.material.dispose();
    }
  }
  addSky(scene, palette.fog, new THREE.Color(palette.fog).lerp(new THREE.Color(palette.accent), 0.12).getHex());
}

export function makeRain(reduced: boolean): THREE.Points | null {
  if (reduced) return null;
  const count = 900;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 52;
    positions[i * 3 + 1] = Math.random() * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 70;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0xb8c8d4,
    size: 0.09,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.62,
  });
  const points = new THREE.Points(geometry, material);
  points.name = "rain";
  return points;
}

export function tickRain(points: THREE.Points, dt: number): void {
  const attr = points.geometry.getAttribute("position");
  if (!(attr instanceof THREE.BufferAttribute)) return;
  const array = attr.array;
  for (let i = 0; i < array.length; i += 3) {
    const x = array[i];
    const y = array[i + 1];
    const z = array[i + 2];
    if (x === undefined || y === undefined || z === undefined) continue;
    let nextY = y - dt * 14;
    let nextX = x + dt * 2.1;
    let nextZ = z + dt * 0.5;
    if (nextY < 0) {
      nextY = 17 + Math.random() * 2;
      nextX = (Math.random() - 0.5) * 52;
      nextZ = (Math.random() - 0.5) * 70;
    }
    array[i] = nextX;
    array[i + 1] = nextY;
    array[i + 2] = nextZ;
  }
  attr.needsUpdate = true;
}

export function markerPole(color: number, x: number, y: number, z: number): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.name = "hint-marker";
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 1.4, 8), surf(0x2a241c, { roughness: 0.5, textured: false }));
  stem.position.y = 0.7;
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 12, 10),
    new THREE.MeshBasicMaterial({ color }),
  );
  head.position.y = 1.45;
  group.add(stem, head);
  return group;
}

/** Extra fill so night / indoor greybox is never a black room. */
export function addPlayLights(root: THREE.Group, mood: "storm" | "indoor" | "hub" | "workshop" | "harbor"): void {
  if (mood === "storm") {
    root.add(new THREE.AmbientLight(0x6a8090, 0.42));
    const fill = new THREE.DirectionalLight(0xb8c8d4, 0.48);
    fill.position.set(8, 16, -10);
    root.add(fill);
    return;
  }
  if (mood === "indoor") {
    root.add(new THREE.AmbientLight(0x8aa0b0, 0.55));
    const wash = playPoint(0xffe2b8, 1.8, 14, 1.05);
    wash.position.set(0, 2.4, 0.4);
    const bounce = playPoint(0x7a98a8, 1.1, 12, 1.1);
    bounce.position.set(2.6, 2.2, -2.1);
    root.add(wash, bounce);
    return;
  }
  if (mood === "hub") {
    root.add(new THREE.AmbientLight(0xe8d8c4, 0.95));
    const fill = playPoint(0xffe6c8, 3.2, 16, 1);
    fill.position.set(0, 2.8, 2.2);
    root.add(fill);
    return;
  }
  if (mood === "workshop") {
    root.add(new THREE.AmbientLight(0xb8ece8, 1.02));
    for (const [x, z] of [
      [-3.4, -3.2],
      [3.4, -3.2],
      [-3.4, 3.2],
      [3.4, 3.2],
    ] as const) {
      const lampLight = playPoint(0xb8fff6, 2.4, 12, 1.05);
      lampLight.position.set(x, 2.6, z);
      root.add(lampLight);
    }
    return;
  }
  root.add(new THREE.AmbientLight(0xd8c8b4, 0.92));
  const key = playPoint(0xffd8b0, 3.4, 22, 1);
  key.position.set(2, 3.4, 8);
  const market = playPoint(0xffb080, 2.8, 16, 1.05);
  market.position.set(-12, 3.2, 13);
  const pump = playPoint(0xc8e0d8, 2.6, 16, 1.05);
  pump.position.set(1, 3.6, 32);
  root.add(key, market, pump);
}
