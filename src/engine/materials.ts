import * as THREE from "three";

export type SurfKind = "floor" | "wall" | "metal" | "wood" | "plastic" | "accent";

interface Atlas {
  albedo: THREE.CanvasTexture;
  rough: THREE.CanvasTexture;
  normal: THREE.CanvasTexture;
}

const cache = new Map<SurfKind, Atlas>();
const labelCache = new Map<string, THREE.CanvasTexture>();

function makeCanvas(size: number, paint: (g: CanvasRenderingContext2D, size: number) => void): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const g = canvas.getContext("2d");
  if (g) paint(g, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function paintAtlas(kind: SurfKind): Atlas {
  const albedo = makeCanvas(128, (g, s) => {
    if (kind === "floor") {
      g.fillStyle = "#4a545c";
      g.fillRect(0, 0, s, s);
      g.fillStyle = "#2a3238";
      for (let y = 0; y < s; y += 16) g.fillRect(0, y, s, 2);
      for (let x = 0; x < s; x += 16) g.fillRect(x, 0, 2, s);
      for (let i = 0; i < 80; i += 1) {
        g.fillStyle = `rgba(180,200,210,${0.04 + Math.random() * 0.08})`;
        g.fillRect(Math.random() * s, Math.random() * s, 3, 2);
      }
    } else if (kind === "wall") {
      g.fillStyle = "#3a424a";
      g.fillRect(0, 0, s, s);
      g.fillStyle = "#2c333a";
      for (let y = 0; y < s; y += 22) g.fillRect(0, y, s, 1);
      for (let i = 0; i < 40; i += 1) {
        g.fillStyle = `rgba(255,255,255,${0.03 + Math.random() * 0.05})`;
        g.fillRect(Math.random() * s, Math.random() * s, 8, 3);
      }
    } else if (kind === "metal") {
      g.fillStyle = "#6a7380";
      g.fillRect(0, 0, s, s);
      for (let y = 0; y < s; y += 3) {
        g.fillStyle = `rgba(255,255,255,${0.04 + (y % 6) * 0.01})`;
        g.fillRect(0, y, s, 1);
      }
    } else if (kind === "wood") {
      g.fillStyle = "#8a6238";
      g.fillRect(0, 0, s, s);
      for (let x = 0; x < s; x += 7) {
        g.fillStyle = `rgba(40,24,10,${0.15 + Math.random() * 0.2})`;
        g.fillRect(x, 0, 2, s);
      }
      g.strokeStyle = "rgba(30,18,8,0.45)";
      g.strokeRect(4, 4, s - 8, s - 8);
    } else if (kind === "plastic") {
      g.fillStyle = "#3a8884";
      g.fillRect(0, 0, s, s);
      g.fillStyle = "rgba(255,255,255,0.12)";
      g.beginPath();
      g.arc(40, 36, 28, 0, Math.PI * 2);
      g.fill();
    } else {
      g.fillStyle = "#e0a03a";
      g.fillRect(0, 0, s, s);
      g.fillStyle = "rgba(255,230,160,0.25)";
      g.fillRect(10, 10, s - 20, s - 20);
    }
  });
  const rough = makeCanvas(128, (g, s) => {
    const base = kind === "metal" || kind === "plastic" ? 90 : kind === "wood" ? 160 : 180;
    g.fillStyle = `rgb(${base},${base},${base})`;
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < 120; i += 1) {
      const v = base + Math.floor(Math.random() * 40 - 20);
      g.fillStyle = `rgb(${v},${v},${v})`;
      g.fillRect(Math.random() * s, Math.random() * s, 4, 3);
    }
  });
  rough.colorSpace = THREE.NoColorSpace;
  const normal = makeCanvas(128, (g, s) => {
    g.fillStyle = "#8080ff";
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < 90; i += 1) {
      const nx = 120 + Math.floor(Math.random() * 20);
      const ny = 120 + Math.floor(Math.random() * 20);
      g.fillStyle = `rgb(${nx},${ny},255)`;
      g.fillRect(Math.random() * s, Math.random() * s, 3, 3);
    }
  });
  normal.colorSpace = THREE.NoColorSpace;
  return { albedo, rough, normal };
}

export function atlas(kind: SurfKind): Atlas {
  let entry = cache.get(kind);
  if (!entry) {
    entry = paintAtlas(kind);
    cache.set(kind, entry);
  }
  return entry;
}

export function inferKind(w: number, h: number, d: number, y: number): SurfKind {
  if (h <= 0.45 && y < 0.4) return "floor";
  if (Math.min(w, d) < 0.45 && h > 1.2) return "wall";
  if (Math.min(w, h, d) < 0.35) return "metal";
  return "wall";
}

export function applyKind(mat: THREE.MeshStandardMaterial, kind: SurfKind, repeatX = 1, repeatY = 1): void {
  const maps = atlas(kind);
  const wrap = (tex: THREE.CanvasTexture) => {
    const next = tex.clone();
    next.needsUpdate = true;
    next.repeat.set(repeatX, repeatY);
    return next;
  };
  mat.map = wrap(maps.albedo);
  mat.roughnessMap = wrap(maps.rough);
  mat.normalMap = wrap(maps.normal);
  mat.normalScale.set(0.35, 0.35);
  if (kind === "metal") {
    mat.metalness = 0.42;
    mat.roughness = 0.38;
  } else if (kind === "wood") {
    mat.metalness = 0.04;
    mat.roughness = 0.72;
  } else if (kind === "plastic") {
    mat.metalness = 0.12;
    mat.roughness = 0.34;
  } else if (kind === "floor") {
    mat.metalness = 0.08;
    mat.roughness = 0.62;
  } else {
    mat.metalness = 0.05;
    mat.roughness = 0.82;
  }
}

export function cachedLabelMap(key: string, build: () => THREE.CanvasTexture): THREE.CanvasTexture {
  const hit = labelCache.get(key);
  if (hit) return hit;
  const map = build();
  labelCache.set(key, map);
  return map;
}

export type QualityTier = "high" | "low";

export function detectQuality(): QualityTier {
  const cores = navigator.hardwareConcurrency ?? 8;
  const mem = Number((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8);
  const small = Math.min(window.innerWidth, window.innerHeight) < 720;
  if (cores <= 4 || mem <= 4 || small) return "low";
  return "high";
}
