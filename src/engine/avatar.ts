import * as THREE from "three";
import { surf } from "./greybox";

/** Station runner — original silhouette, higher mesh density. */
export function createRunnerAvatar(): THREE.Group {
  const root = new THREE.Group();
  root.name = "runner";

  const shell = surf(0x3a4e58, { roughness: 0.58, metalness: 0.22, emissive: 0x1a3038, emissiveIntensity: 0.18 });
  const strap = surf(0xe0a03a, { roughness: 0.48, metalness: 0.22, emissive: 0xc9861a, emissiveIntensity: 0.28 });
  const dark = surf(0x161c20, { roughness: 0.7 });
  const skin = surf(0x6a5644, { roughness: 0.72 });

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.64, 10, 16), shell);
  torso.position.y = 1.05;
  torso.castShadow = true;
  root.add(torso);

  const harness = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.07, 0.3), strap);
  harness.position.set(0, 1.18, 0.04);
  root.add(harness);

  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.34, 0.14), dark);
  pack.position.set(0, 1.12, -0.24);
  pack.castShadow = true;
  root.add(pack);
  const packGlow = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.04, 0.02),
    surf(0x7ec8c3, { emissive: 0x7ec8c3, emissiveIntensity: 0.85, roughness: 0.4 }),
  );
  packGlow.position.set(0, 1.22, -0.31);
  root.add(packGlow);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.155, 16, 14), skin);
  head.position.y = 1.58;
  head.castShadow = true;
  root.add(head);

  const hood = new THREE.Mesh(new THREE.SphereGeometry(0.185, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), shell);
  hood.position.set(0, 1.63, -0.02);
  hood.rotation.x = 0.15;
  root.add(hood);

  const visor = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.05, 0.08),
    surf(0x7ec8c3, { roughness: 0.25, metalness: 0.4, emissive: 0x3a8884, emissiveIntensity: 0.35, opacity: 0.85 }),
  );
  visor.position.set(0, 1.58, 0.12);
  root.add(visor);

  const hip = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.16, 0.22), dark);
  hip.position.y = 0.68;
  root.add(hip);

  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.32, 6, 10), shell);
    arm.position.set(side * 0.3, 1.12, 0);
    arm.rotation.z = side * 0.18;
    arm.castShadow = true;
    arm.name = side < 0 ? "armL" : "armR";
    root.add(arm);

    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.4, 6, 10), dark);
    leg.position.set(side * 0.12, 0.34, 0);
    leg.castShadow = true;
    leg.name = side < 0 ? "legL" : "legR";
    root.add(leg);
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.09, 0.22), dark);
    boot.position.set(side * 0.12, 0.05, 0.04);
    root.add(boot);
  }

  const blob = new THREE.Mesh(
    new THREE.CircleGeometry(0.38, 24),
    new THREE.MeshBasicMaterial({ color: 0x050708, transparent: true, opacity: 0.42, depthWrite: false }),
  );
  blob.rotation.x = -Math.PI / 2;
  blob.position.y = 0.02;
  blob.name = "blob-shadow";
  root.add(blob);

  return root;
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
