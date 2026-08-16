import * as THREE from "three";
import { surf } from "./greybox";

function limb(radius: number, length: number, color: number, name: string): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 8, 12), surf(color, { roughness: 0.62, metalness: 0.12 }));
  mesh.name = name;
  mesh.castShadow = true;
  return mesh;
}

/** ~4k-tri runner. Far LOD is a 3-part stand-in. */
export function createRunnerAvatar(): THREE.Group {
  const root = new THREE.Group();
  root.name = "runner";

  const near = new THREE.Group();
  near.name = "lod-near";
  const far = new THREE.Group();
  far.name = "lod-far";
  far.visible = false;

  const shell = 0x3a4e58;
  const dark = 0x161c20;
  const skin = 0x6a5644;

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.23, 0.58, 10, 16), surf(shell, { roughness: 0.58, metalness: 0.2, kind: "plastic" }));
  torso.position.y = 1.08;
  torso.castShadow = true;
  near.add(torso);

  const harness = new THREE.Mesh(
    new THREE.BoxGeometry(0.52, 0.07, 0.32),
    surf(0xe0a03a, { roughness: 0.45, metalness: 0.28, emissive: 0xc9861a, emissiveIntensity: 0.32 }),
  );
  harness.position.set(0, 1.2, 0.04);
  near.add(harness);

  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.36, 0.16), surf(dark, { roughness: 0.7, kind: "metal" }));
  pack.position.set(0, 1.12, -0.25);
  pack.castShadow = true;
  near.add(pack);
  const packGlow = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.04, 0.02),
    surf(0x7ec8c3, { emissive: 0x7ec8c3, emissiveIntensity: 0.9, roughness: 0.35 }),
  );
  packGlow.position.set(0, 1.22, -0.33);
  near.add(packGlow);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 18, 16), surf(skin, { roughness: 0.72 }));
  head.position.y = 1.6;
  head.castShadow = true;
  near.add(head);
  const hood = new THREE.Mesh(
    new THREE.SphereGeometry(0.19, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
    surf(shell, { roughness: 0.6, kind: "plastic" }),
  );
  hood.position.set(0, 1.65, -0.02);
  hood.rotation.x = 0.15;
  near.add(hood);
  const visor = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.055, 0.09),
    surf(0x7ec8c3, { roughness: 0.22, metalness: 0.45, emissive: 0x3a8884, emissiveIntensity: 0.4, opacity: 0.88 }),
  );
  visor.position.set(0, 1.6, 0.13);
  near.add(visor);

  const hip = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.16, 0.24), surf(dark, { roughness: 0.7 }));
  hip.position.y = 0.7;
  hip.name = "hip";
  near.add(hip);

  const armL = limb(0.055, 0.34, shell, "armL");
  armL.position.set(-0.31, 1.14, 0);
  armL.rotation.z = -0.16;
  const armR = limb(0.055, 0.34, shell, "armR");
  armR.position.set(0.31, 1.14, 0);
  armR.rotation.z = 0.16;
  const legL = limb(0.075, 0.42, dark, "legL");
  legL.position.set(-0.12, 0.34, 0);
  const legR = limb(0.075, 0.42, dark, "legR");
  legR.position.set(0.12, 0.34, 0);
  near.add(armL, armR, legL, legR);

  for (const side of [-1, 1]) {
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.09, 0.24), surf(dark, { roughness: 0.55, metalness: 0.15 }));
    boot.position.set(side * 0.12, 0.05, 0.04);
    near.add(boot);
  }

  const blob = new THREE.Mesh(
    new THREE.CircleGeometry(0.4, 20),
    new THREE.MeshBasicMaterial({ color: 0x050708, transparent: true, opacity: 0.42, depthWrite: false }),
  );
  blob.rotation.x = -Math.PI / 2;
  blob.position.y = 0.02;
  blob.name = "blob-shadow";
  near.add(blob);

  const farBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 1.15, 4, 8), surf(shell, { roughness: 0.65 }));
  farBody.position.y = 0.95;
  const farHead = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), surf(skin, { roughness: 0.7 }));
  farHead.position.y = 1.62;
  far.add(farBody, farHead);

  root.add(near, far);
  return root;
}

export function setAvatarLod(root: THREE.Group, far: boolean): void {
  const near = root.getObjectByName("lod-near");
  const lod = root.getObjectByName("lod-far");
  if (near) near.visible = !far;
  if (lod) lod.visible = far;
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
