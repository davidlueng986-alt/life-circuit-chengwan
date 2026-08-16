import * as THREE from "three";
import { boxMesh, playPoint, surf } from "./greybox";
import { makeWorldLabel } from "./worldHints";

function paintSign(title: string, sub: string, w = 512, h = 256): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext("2d");
  if (g) {
    g.fillStyle = "#1a1610";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#ffc14a";
    g.lineWidth = 16;
    g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = "#fff6d8";
    g.font = `bold ${Math.round(w * 0.11)}px 'Noto Sans TC','Microsoft JhengHei',sans-serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(title, w / 2, h * 0.42);
    g.fillStyle = "#9fe8e0";
    g.font = `${Math.round(w * 0.06)}px 'Noto Sans TC','Microsoft JhengHei',sans-serif`;
    g.fillText(sub, w / 2, h * 0.72);
  }
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  return map;
}

export function paintedCrate(x: number, y: number, z: number): THREE.Group {
  const group = new THREE.Group();
  group.name = "toolbox";
  group.position.set(x, y, z);
  const body = boxMesh(1.2, 0.88, 1.2, 0xb07a38, 0, 0, 0);
  const mat = body.material;
  if (mat instanceof THREE.MeshStandardMaterial) {
    mat.emissive = new THREE.Color(0xc9861a);
    mat.emissiveIntensity = 0.55;
  }
  const plate = new THREE.Mesh(
    new THREE.PlaneGeometry(0.95, 0.48),
    new THREE.MeshBasicMaterial({ map: paintSign("工具箱", "E 推開它"), toneMapped: false, fog: false }),
  );
  plate.position.set(0, 0.12, 0.62);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.035, 6, 12, Math.PI), surf(0xffe2a0, { metalness: 0.45, roughness: 0.35 }));
  handle.position.set(0, 0.48, 0);
  handle.rotation.x = Math.PI;
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(0.88, 0.08, 8, 28),
    new THREE.MeshBasicMaterial({ color: 0xffc14a, transparent: true, opacity: 0.9, depthWrite: false, fog: false, toneMapped: false }),
  );
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = -0.42;
  group.add(body, plate, handle, halo);
  return group;
}

export function glowingCell(radius = 2.2): THREE.Group {
  const group = new THREE.Group();
  group.name = "cell-model";
  const skin = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 36, 24),
    new THREE.MeshPhysicalMaterial({
      color: 0x4aa89c,
      roughness: 0.28,
      metalness: 0.04,
      transmission: 0.35,
      transparent: true,
      opacity: 0.42,
      thickness: 0.6,
      emissive: 0x163832,
      emissiveIntensity: 0.35,
    }),
  );
  const nucleus = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 0.32, 20, 16),
    surf(0xe0a03a, { emissive: 0xc9861a, emissiveIntensity: 0.9, roughness: 0.4 }),
  );
  nucleus.position.set(0.15, 0.1, 0);
  group.add(skin, nucleus);
  for (const [ox, oy, oz, r] of [
    [-0.7, 0.45, 0.5, 0.18],
    [0.85, -0.35, 0.4, 0.14],
    [-0.2, -0.7, -0.55, 0.16],
    [0.45, 0.65, -0.4, 0.12],
  ] as const) {
    const blob = new THREE.Mesh(
      new THREE.SphereGeometry(r * radius, 12, 10),
      surf(0x8fd4cf, { emissive: 0x3a8884, emissiveIntensity: 0.55, roughness: 0.5 }),
    );
    blob.position.set(ox * radius * 0.45, oy * radius * 0.45, oz * radius * 0.45);
    group.add(blob);
  }
  const tag = makeWorldLabel("細胞", "有邊界的生命單位");
  tag.position.y = radius + 0.55;
  group.add(tag);
  const lamp = playPoint(0x8fd4cf, 3.4, 10, 1);
  lamp.position.set(0, 0.2, 0);
  group.add(lamp);
  return group;
}

export function dnaHelix(length = 6.4): THREE.Group {
  const group = new THREE.Group();
  group.name = "dna-helix";
  const turns = length / 1.35;
  const steps = Math.max(28, Math.round(length * 9));
  for (let i = 0; i < steps; i += 1) {
    const t = i / steps;
    const a = t * Math.PI * 2 * turns;
    const x = (t - 0.5) * length;
    const r = 0.26;
    const beadA = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), surf(0x8fd4cf, { emissive: 0x3a8884, emissiveIntensity: 0.7 }));
    const beadB = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), surf(0xe0a03a, { emissive: 0xc9861a, emissiveIntensity: 0.7 }));
    beadA.position.set(x, Math.sin(a) * r, Math.cos(a) * r);
    beadB.position.set(x, Math.sin(a + Math.PI) * r, Math.cos(a + Math.PI) * r);
    group.add(beadA, beadB);
    if (i % 3 === 0) {
      const rung = new THREE.Mesh(new THREE.BoxGeometry(0.035, r * 2, 0.035), surf(0xd8e4e2, { roughness: 0.4 }));
      rung.position.set(x, 0, 0);
      rung.lookAt(x, Math.sin(a) * r, Math.cos(a) * r);
      group.add(rung);
    }
  }
  const tag = makeWorldLabel("DNA 長軌", "gene 是上面一小段");
  tag.position.set(0, 0.85, 0);
  group.add(tag);
  return group;
}

export function moonSunPair(): { moon: THREE.Group; sun: THREE.Group } {
  const moon = new THREE.Group();
  moon.name = "moon-control";
  const moonBall = new THREE.Mesh(new THREE.SphereGeometry(0.38, 18, 14), surf(0xc8d4dc, { roughness: 0.55, emissive: 0x6a7884, emissiveIntensity: 0.25 }));
  moon.add(moonBall, makeWorldLabel("月亮", "應關／該暗"));
  moon.children[1]!.position.y = 0.85;

  const sun = new THREE.Group();
  sun.name = "sun-control";
  const sunBall = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 18, 14),
    surf(0xffc14a, { emissive: 0xff7a28, emissiveIntensity: 1.1, roughness: 0.35 }),
  );
  const rays = new THREE.Mesh(
    new THREE.TorusGeometry(0.58, 0.03, 8, 20),
    new THREE.MeshBasicMaterial({ color: 0xffe2a0, fog: false, toneMapped: false }),
  );
  sun.add(sunBall, rays, makeWorldLabel("太陽", "應開／該亮"));
  sun.children[2]!.position.y = 0.95;
  return { moon, sun };
}

export function citySkyline(z = -22): THREE.Group {
  const group = new THREE.Group();
  group.name = "city-skyline";
  for (let i = -10; i <= 10; i += 1) {
    const h = 2.2 + Math.abs(Math.sin(i * 1.37)) * 7.4;
    const w = 1.2 + (i % 3) * 0.25;
    const tower = boxMesh(w, h, 1.15, 0x243038, i * 2.05, h * 0.5, z);
    const win = new THREE.Mesh(
      new THREE.PlaneGeometry(w * 0.72, h * 0.62),
      new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xffc14a : 0x8fd4cf, transparent: true, opacity: 0.18, fog: false }),
    );
    win.position.set(i * 2.05, h * 0.52, z + 0.6);
    group.add(tower, win);
  }
  return group;
}

export function educationPlaque(title: string, body: string): THREE.Mesh {
  const map = paintSign(title, body, 640, 280);
  return new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 1.05),
    new THREE.MeshBasicMaterial({ map, fog: false, toneMapped: false }),
  );
}
