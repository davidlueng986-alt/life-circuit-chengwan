import * as THREE from "three";
import { surf } from "./greybox";

function px(color: number): THREE.MeshStandardMaterial {
  return surf(color, { roughness: 0.92, metalness: 0.02, flat: true });
}

function box(w: number, h: number, d: number, color: number, x: number, y: number, z: number, name?: string): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), px(color));
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (name) mesh.name = name;
  return mesh;
}

function limb(
  w: number,
  h: number,
  d: number,
  color: number,
  x: number,
  pivotY: number,
  z: number,
  name: string,
): THREE.Group {
  const group = new THREE.Group();
  group.name = name;
  group.position.set(x, pivotY, z);
  const mesh = box(w, h, d, color, 0, -h * 0.5, 0);
  group.add(mesh);
  return group;
}

/** Minecraft-style 6-part figure. Units ≈ Steve (1.8m). Limbs pivot at shoulder / hip. */
export function createRunnerAvatar(): THREE.Group {
  const root = new THREE.Group();
  root.name = "runner";

  const near = new THREE.Group();
  near.name = "lod-near";
  const far = new THREE.Group();
  far.name = "lod-far";
  far.visible = false;

  const skin = 0xc2a07a;
  const shirt = 0x3d5c58;
  const pants = 0x2a3338;
  const strap = 0xe0a03a;

  near.add(box(0.5, 0.5, 0.5, skin, 0, 1.55, 0, "head"));
  const visor = box(0.52, 0.12, 0.12, 0x7ec8c3, 0, 1.58, 0.22, "visor");
  visor.material = surf(0x7ec8c3, { roughness: 0.3, metalness: 0.2, emissive: 0x3a8884, emissiveIntensity: 0.45, flat: true });
  near.add(visor);
  near.add(box(0.5, 0.75, 0.28, shirt, 0, 1.025, 0, "torso"));
  near.add(box(0.52, 0.08, 0.32, strap, 0, 1.18, 0.02, "strap"));
  near.add(box(0.28, 0.32, 0.12, 0x161c20, 0, 1.1, -0.2, "pack"));
  const packGlow = box(0.16, 0.04, 0.03, 0x8fd4cf, 0, 1.2, -0.26, "pack-glow");
  packGlow.material = surf(0x8fd4cf, { emissive: 0x8fd4cf, emissiveIntensity: 0.9, flat: true });
  near.add(packGlow);

  near.add(limb(0.25, 0.75, 0.25, shirt, -0.375, 1.4, 0, "armL"));
  near.add(limb(0.25, 0.75, 0.25, shirt, 0.375, 1.4, 0, "armR"));
  near.add(limb(0.25, 0.75, 0.25, pants, -0.125, 0.75, 0, "legL"));
  near.add(limb(0.25, 0.75, 0.25, pants, 0.125, 0.75, 0, "legR"));

  const blob = new THREE.Mesh(
    new THREE.CircleGeometry(0.42, 12),
    new THREE.MeshBasicMaterial({ color: 0x050708, transparent: true, opacity: 0.4, depthWrite: false }),
  );
  blob.rotation.x = -Math.PI / 2;
  blob.position.y = 0.01;
  blob.name = "blob-shadow";
  near.add(blob);

  far.add(box(0.5, 1.5, 0.35, shirt, 0, 0.9, 0));
  far.add(box(0.5, 0.5, 0.5, skin, 0, 1.55, 0));

  root.add(near, far);
  return root;
}

export function setAvatarLod(root: THREE.Group, farOn: boolean): void {
  const near = root.getObjectByName("lod-near");
  const far = root.getObjectByName("lod-far");
  if (near) near.visible = !farOn;
  if (far) far.visible = farOn;
}

export function createSafetyLine(): THREE.Line {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0, 0, 1, 0], 3));
  const line = new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({ color: 0xe0a03a, transparent: true, opacity: 0.95 }),
  );
  line.name = "safety-line";
  line.visible = false;
  line.frustumCulled = false;
  return line;
}

export function setLineEnds(line: THREE.Line, ax: number, ay: number, az: number, bx: number, by: number, bz: number): void {
  const attr = line.geometry.getAttribute("position");
  if (!(attr instanceof THREE.BufferAttribute)) return;
  attr.setXYZ(0, ax, ay, az);
  attr.setXYZ(1, bx, by, bz);
  attr.needsUpdate = true;
  line.geometry.computeBoundingSphere();
}
