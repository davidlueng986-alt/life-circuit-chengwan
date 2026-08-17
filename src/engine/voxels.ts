import * as THREE from "three";
import type { WorldColliders } from "./collision";

const dummy = new THREE.Object3D();
const tint = new THREE.Color();

function shade(hex: number, seed: number): THREE.Color {
  const n = ((seed * 1103515245 + 12345) >>> 0) % 21;
  tint.setHex(hex);
  tint.offsetHSL(0, 0, (n - 10) * 0.012);
  return tint;
}

/** Minecraft-style tiled volume. One collider, many 1 m blocks. */
export function addVoxelVolume(
  root: THREE.Group,
  world: WorldColliders | null,
  w: number,
  h: number,
  d: number,
  color: number,
  x: number,
  y: number,
  z: number,
): THREE.InstancedMesh {
  const nx = Math.max(1, Math.round(w));
  const ny = Math.max(1, Math.round(h));
  const nz = Math.max(1, Math.round(d));
  const sx = w / nx;
  const sy = h / ny;
  const sz = d / nz;
  const geo = new THREE.BoxGeometry(sx * 0.985, sy * 0.985, sz * 0.985);
  const mat = new THREE.MeshLambertMaterial({ color, flatShading: true });
  const mesh = new THREE.InstancedMesh(geo, mat, nx * ny * nz);
  mesh.receiveShadow = true;
  mesh.castShadow = false;
  mesh.name = "voxel-volume";
  const x0 = x - w / 2 + sx / 2;
  const y0 = y - h / 2 + sy / 2;
  const z0 = z - d / 2 + sz / 2;
  let i = 0;
  for (let ix = 0; ix < nx; ix += 1) {
    for (let iy = 0; iy < ny; iy += 1) {
      for (let iz = 0; iz < nz; iz += 1) {
        dummy.position.set(x0 + ix * sx, y0 + iy * sy, z0 + iz * sz);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        mesh.setColorAt(i, shade(color, ix * 47 + iy * 13 + iz * 91));
        i += 1;
      }
    }
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  root.add(mesh);
  if (world) {
    world.addBox(
      new THREE.Vector3(x - w / 2, y - h / 2, z - d / 2),
      new THREE.Vector3(x + w / 2, y + h / 2, z + d / 2),
    );
  }
  return mesh;
}

export function addVoxelFloor(
  root: THREE.Group,
  world: WorldColliders,
  w: number,
  d: number,
  color: number,
  x: number,
  z: number,
  y = -0.2,
): THREE.InstancedMesh {
  return addVoxelVolume(root, world, w, 0.4, d, color, x, y, z);
}

export function addAmberBlocks(root: THREE.Group, x: number, z0: number, z1: number): THREE.Mesh[] {
  const lo = Math.min(z0, z1);
  const hi = Math.max(z0, z1);
  const blocks: THREE.Mesh[] = [];
  for (let z = lo; z <= hi; z += 1) {
    const on = ((z - lo) / 2) % 2 < 1;
    const tile = new THREE.Mesh(
      new THREE.BoxGeometry(0.92, 0.1, 0.92),
      new THREE.MeshBasicMaterial({
        color: on ? 0xffc14a : 0xc9861a,
        fog: false,
        toneMapped: false,
      }),
    );
    tile.position.set(x, 0.06, z);
    tile.name = "amber-block";
    root.add(tile);
    blocks.push(tile);
  }
  return blocks;
}

export function addGlassWater(
  root: THREE.Group,
  w: number,
  d: number,
  x: number,
  y: number,
  z: number,
): THREE.InstancedMesh {
  const nx = Math.max(2, Math.round(w));
  const nz = Math.max(2, Math.round(d));
  const geo = new THREE.BoxGeometry(0.94, 0.72, 0.94);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0x1a4a58,
    roughness: 0.12,
    metalness: 0.02,
    transmission: 0.35,
    transparent: true,
    opacity: 0.55,
    thickness: 0.4,
    depthWrite: false,
  });
  const mesh = new THREE.InstancedMesh(geo, mat, nx * nz);
  mesh.name = "glass-water";
  const x0 = x - w / 2 + 0.5;
  const z0 = z - d / 2 + 0.5;
  let i = 0;
  for (let ix = 0; ix < nx; ix += 1) {
    for (let iz = 0; iz < nz; iz += 1) {
      dummy.position.set(x0 + ix, y, z0 + iz);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      i += 1;
    }
  }
  mesh.instanceMatrix.needsUpdate = true;
  root.add(mesh);
  return mesh;
}

export function pulseAmber(blocks: readonly THREE.Mesh[], time: number, boost: boolean): void {
  for (let i = 0; i < blocks.length; i += 1) {
    const tile = blocks[i];
    if (!tile) continue;
    const mat = tile.material;
    if (!(mat instanceof THREE.MeshBasicMaterial)) continue;
    const wave = 0.55 + 0.45 * Math.sin(time * (boost ? 8 : 3.2) + i * 0.45);
    mat.color.setHex(boost ? 0xffe2a0 : 0xffc14a);
    mat.opacity = 1;
    tile.scale.setScalar(boost ? 1 + wave * 0.12 : 1);
  }
}
