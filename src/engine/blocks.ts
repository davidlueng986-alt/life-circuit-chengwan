import * as THREE from "three";
import type { WorldColliders } from "./collision";

export type BlockKind = "stone" | "iron" | "wood" | "lamp" | "cyan" | "glass" | "water";

const SIZE = 1;
const dummy = new THREE.Object3D();
const atlases = new Map<BlockKind, THREE.CanvasTexture>();

function paintKind(kind: BlockKind, g: CanvasRenderingContext2D, s: number): void {
  if (kind === "stone") {
    g.fillStyle = "#4a5560";
    g.fillRect(0, 0, s, s);
    g.fillStyle = "#3a444c";
    for (let y = 0; y < s; y += 8) g.fillRect(0, y, s, 1);
    for (let i = 0; i < 18; i += 1) {
      g.fillStyle = i % 2 ? "#5a656e" : "#2e383e";
      g.fillRect((i * 7) % s, (i * 11) % s, 3, 2);
    }
    return;
  }
  if (kind === "iron") {
    g.fillStyle = "#6a7380";
    g.fillRect(0, 0, s, s);
    g.fillStyle = "#3a424a";
    g.fillRect(0, 0, s, 2);
    g.fillRect(0, s - 2, s, 2);
    g.fillStyle = "#8a93a0";
    g.fillRect(2, 6, s - 4, 2);
    return;
  }
  if (kind === "wood") {
    g.fillStyle = "#8a6238";
    g.fillRect(0, 0, s, s);
    g.fillStyle = "#5a3a18";
    for (let x = 0; x < s; x += 4) g.fillRect(x, 0, 1, s);
    g.strokeStyle = "#3a2410";
    g.strokeRect(1, 1, s - 2, s - 2);
    return;
  }
  if (kind === "lamp") {
    g.fillStyle = "#c9861a";
    g.fillRect(0, 0, s, s);
    g.fillStyle = "#ffe2a0";
    g.fillRect(3, 3, s - 6, s - 6);
    g.fillStyle = "#fff6d0";
    g.fillRect(6, 6, s - 12, s - 12);
    return;
  }
  if (kind === "cyan") {
    g.fillStyle = "#2a5858";
    g.fillRect(0, 0, s, s);
    g.fillStyle = "#8fd4cf";
    g.fillRect(4, 4, s - 8, s - 8);
    return;
  }
  if (kind === "glass") {
    g.fillStyle = "rgba(120,160,180,0.35)";
    g.fillRect(0, 0, s, s);
    g.strokeStyle = "rgba(200,230,240,0.55)";
    g.strokeRect(1, 1, s - 2, s - 2);
    return;
  }
  g.fillStyle = "#163848";
  g.fillRect(0, 0, s, s);
  g.fillStyle = "#2a6a78";
  for (let y = 4; y < s; y += 6) g.fillRect(0, y, s, 2);
}

function atlasOf(kind: BlockKind): THREE.CanvasTexture {
  const hit = atlases.get(kind);
  if (hit) return hit;
  const canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 16;
  const g = canvas.getContext("2d");
  if (g) {
    g.imageSmoothingEnabled = false;
    paintKind(kind, g, 16);
  }
  const map = new THREE.CanvasTexture(canvas);
  map.magFilter = THREE.NearestFilter;
  map.minFilter = THREE.NearestFilter;
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  atlases.set(kind, map);
  return map;
}

function matOf(kind: BlockKind): THREE.MeshLambertMaterial {
  const map = atlasOf(kind);
  const emissive = kind === "lamp" ? 0xc9861a : kind === "cyan" ? 0x3a8884 : 0x000000;
  return new THREE.MeshLambertMaterial({
    map,
    transparent: kind === "glass" || kind === "water",
    opacity: kind === "glass" ? 0.42 : kind === "water" ? 0.72 : 1,
    depthWrite: kind !== "glass",
    emissive,
    emissiveIntensity: kind === "lamp" ? 0.55 : kind === "cyan" ? 0.2 : 0,
    flatShading: true,
  });
}

export class BlockStamp {
  private readonly cells = new Map<string, BlockKind>();

  set(x: number, y: number, z: number, kind: BlockKind): this {
    this.cells.set(`${x},${y},${z}`, kind);
    return this;
  }

  erase(x: number, y: number, z: number): this {
    this.cells.delete(`${x},${y},${z}`);
    return this;
  }

  fill(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, kind: BlockKind): this {
    const xa = Math.min(x0, x1);
    const xb = Math.max(x0, x1);
    const ya = Math.min(y0, y1);
    const yb = Math.max(y0, y1);
    const za = Math.min(z0, z1);
    const zb = Math.max(z0, z1);
    for (let x = xa; x <= xb; x += 1) {
      for (let y = ya; y <= yb; y += 1) {
        for (let z = za; z <= zb; z += 1) this.set(x, y, z, kind);
      }
    }
    return this;
  }

  /** Hollow box: floor, ceiling optional, four walls. */
  room(x0: number, z0: number, x1: number, z1: number, y0: number, h: number, wall: BlockKind, floor: BlockKind): this {
    this.fill(x0, y0, z0, x1, y0, z1, floor);
    this.fill(x0, y0 + 1, z0, x1, y0 + h, z0, wall);
    this.fill(x0, y0 + 1, z1, x1, y0 + h, z1, wall);
    this.fill(x0, y0 + 1, z0, x0, y0 + h, z1, wall);
    this.fill(x1, y0 + 1, z0, x1, y0 + h, z1, wall);
    return this;
  }

  /** Visual only. Add a few large AABBs with `floorBox` / `wallBox` for collision. */
  commit(root: THREE.Group): void {
    const buckets = new Map<BlockKind, THREE.Vector3[]>();
    for (const [key, kind] of this.cells) {
      const [xs, ys, zs] = key.split(",");
      const list = buckets.get(kind) ?? [];
      list.push(new THREE.Vector3(Number(xs), Number(ys), Number(zs)));
      buckets.set(kind, list);
    }
    const geo = new THREE.BoxGeometry(SIZE * 0.98, SIZE * 0.98, SIZE * 0.98);
    for (const [kind, list] of buckets) {
      const mesh = new THREE.InstancedMesh(geo, matOf(kind), list.length);
      mesh.name = `blocks-${kind}`;
      mesh.receiveShadow = kind !== "water" && kind !== "glass";
      mesh.castShadow = false;
      list.forEach((cell, i) => {
        dummy.position.set(cell.x + 0.5, cell.y + 0.5, cell.z + 0.5);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      root.add(mesh);
    }
  }
}

/** Merge is expensive per-cell. Scenes should also add a few large AABBs for walkable floors. */
export function floorBox(
  world: WorldColliders,
  x0: number,
  z0: number,
  x1: number,
  z1: number,
  y = 1,
): void {
  world.addBox(new THREE.Vector3(x0, y - 0.05, z0), new THREE.Vector3(x1 + 1, y, z1 + 1));
}

export function wallBox(
  world: WorldColliders,
  x0: number,
  y0: number,
  z0: number,
  x1: number,
  y1: number,
  z1: number,
): void {
  world.addBox(new THREE.Vector3(x0, y0, z0), new THREE.Vector3(x1 + 1, y1 + 1, z1 + 1));
}
