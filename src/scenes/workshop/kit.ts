import * as THREE from "three";

const TEAL = 0x7ec8c3;
const AMBER = 0xc9861a;
const STEEL = 0x4a5a5c;
const BONE = 0xc9d4d2;
const RUST = 0xb85c38;

export function lambert(color: number, emissive = 0x000000, intensity = 0): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    emissive,
    emissiveIntensity: intensity,
    roughness: 0.62,
    metalness: 0.12,
  });
}

export function basic(color: number, opacity = 1): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: opacity < 1,
    opacity,
    depthWrite: opacity >= 1,
  });
}

export function cellMembrane(radius: number, opacity = 0.18): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 36, 24),
    new THREE.MeshPhysicalMaterial({
      color: 0x4aa89c,
      roughness: 0.28,
      metalness: 0.05,
      transmission: 0.28,
      transparent: true,
      opacity: Math.max(0.34, opacity + 0.18),
      thickness: 0.55,
      emissive: 0x1a4844,
      emissiveIntensity: 0.4,
      side: THREE.DoubleSide,
    }),
  );
  mesh.name = "cell-membrane";
  return mesh;
}

export function doubleRail(length: number): THREE.Group {
  const group = new THREE.Group();
  group.name = "dna-rail";
  const turns = length / 1.35;
  const steps = Math.max(28, Math.round(length * 9));
  for (let i = 0; i < steps; i += 1) {
    const t = i / steps;
    const a = t * Math.PI * 2 * turns;
    const x = (t - 0.5) * length;
    const r = 0.24;
    const beadA = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), lambert(TEAL, 0x3a8884, 0.7));
    const beadB = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), lambert(AMBER, 0xc9861a, 0.7));
    beadA.position.set(x, Math.sin(a) * r, Math.cos(a) * r);
    beadB.position.set(x, Math.sin(a + Math.PI) * r, Math.cos(a + Math.PI) * r);
    group.add(beadA, beadB);
    if (i % 3 === 0) {
      const rung = new THREE.Mesh(new THREE.BoxGeometry(0.035, r * 2, 0.035), lambert(BONE));
      rung.position.set(x, 0, 0);
      rung.lookAt(new THREE.Vector3(x, Math.sin(a) * r, Math.cos(a) * r));
      group.add(rung);
    }
  }
  return group;
}

export function railPost(x: number, y: number, z: number): THREE.Mesh {
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.3, 6), lambert(STEEL));
  post.position.set(x, y, z);
  return post;
}

export function geneMarks(length: number): THREE.Group {
  const group = new THREE.Group();
  group.name = "gene-marks";
  const shapes: THREE.BufferGeometry[] = [
    new THREE.ConeGeometry(0.08, 0.16, 4),
    new THREE.BoxGeometry(0.1, 0.14, 0.08),
    new THREE.OctahedronGeometry(0.08, 0),
  ];
  const count = 5;
  for (let i = 0; i < count; i += 1) {
    const geo = shapes[i % shapes.length] ?? shapes[0]!;
    const mark = new THREE.Mesh(geo, lambert(AMBER, 0x6a3a08, 0.45));
    mark.position.set(-length / 2 + (i + 0.5) * (length / count), 0.22, 0);
    group.add(mark);
  }
  return group;
}

export function magnifierFrame(): THREE.Group {
  const group = new THREE.Group();
  group.name = "magnifier";
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.035, 8, 20), lambert(0xc9a36a, 0x6a4a10, 0.35));
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.36, 0.06), lambert(0x6a5340));
  handle.position.set(0, -0.48, 0);
  const glass = new THREE.Mesh(
    new THREE.CircleGeometry(0.28, 16),
    new THREE.MeshLambertMaterial({ color: 0x8ec8c4, transparent: true, opacity: 0.22, depthWrite: false }),
  );
  group.add(ring, handle, glass);
  return group;
}

export function aimFrame(kind: "cell" | "dna" | "gene"): THREE.Group {
  const group = new THREE.Group();
  group.name = `aim-${kind}`;
  const w = kind === "cell" ? 1.15 : kind === "dna" ? 1.45 : 0.72;
  const h = kind === "cell" ? 1.15 : 0.62;
  const rail = lambert(0x8aa8b0, TEAL, 0.15);
  group.add(new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, 0.05), rail));
  const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, 0.05), rail);
  top.position.y = h;
  group.add(top);
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.05, h, 0.05), rail);
  left.position.set(-w / 2, h / 2, 0);
  const right = left.clone();
  right.position.x = w / 2;
  group.add(left, right);
  if (kind === "cell") {
    const icon = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 12, 8),
      new THREE.MeshLambertMaterial({ color: 0x3d6a68, transparent: true, opacity: 0.35 }),
    );
    icon.position.y = h / 2;
    group.add(icon);
  } else if (kind === "dna") {
    const icon = doubleRail(0.9);
    icon.scale.setScalar(0.45);
    icon.position.y = h / 2;
    group.add(icon);
  } else {
    const icon = geneMarks(0.5);
    icon.position.y = h / 2;
    group.add(icon);
  }
  return group;
}

export function rnaStrand(length: number): THREE.Group {
  const group = new THREE.Group();
  group.name = "rna";
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, length, 8), lambert(AMBER, 0x6a3a08, 0.4));
  body.rotation.z = Math.PI / 2;
  group.add(body);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.16, 5), lambert(0xe7b060, AMBER, 0.7));
  tip.rotation.z = -Math.PI / 2;
  tip.position.x = length / 2 + 0.08;
  tip.name = "rna-tip";
  group.add(tip);
  return group;
}

export function proteinKey(): THREE.Group {
  const group = new THREE.Group();
  group.name = "protein";
  const hubs: Array<[number, number, number, number]> = [
    [0, 0, 0, 0.16],
    [0.18, 0.08, 0.04, 0.12],
    [-0.14, 0.1, -0.06, 0.11],
    [0.06, -0.12, 0.08, 0.1],
    [-0.08, -0.04, -0.12, 0.09],
  ];
  for (const [x, y, z, r] of hubs) {
    group.add(new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), lambert(RUST, 0x4a1808, 0.35)));
    group.children[group.children.length - 1]!.position.set(x, y, z);
  }
  const peg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.22), lambert(0xd2a080));
  peg.position.set(0.22, 0, 0.02);
  group.add(peg);
  return group;
}

export function shapeLock(): THREE.Group {
  const group = new THREE.Group();
  group.name = "shape-lock";
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.28, 16), lambert(0x5a6570, 0x1a2024, 0.2));
  barrel.rotation.x = Math.PI / 2;
  const cavity = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.18), lambert(0x1a1c1e));
  cavity.position.set(0.18, 0, 0.08);
  group.add(barrel, cavity);
  return group;
}

export function assemblyRing(radius: number): THREE.Group {
  const group = new THREE.Group();
  group.name = "fold-ring";
  const torus = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.08, 8, 36), lambert(0x4a6a68, TEAL, 0.2));
  torus.rotation.x = Math.PI / 2;
  group.add(torus);
  return group;
}

export function bead(color = 0xc9a36a): THREE.Mesh {
  return new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), lambert(color, color, 0.25));
}

export function smokePlume(): THREE.Group {
  const group = new THREE.Group();
  group.name = "smoke";
  group.visible = false;
  for (let i = 0; i < 10; i += 1) {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(0.16 + (i % 3) * 0.05, 8, 6),
      new THREE.MeshLambertMaterial({ color: 0xb8c4c2, transparent: true, opacity: 0.22, depthWrite: false }),
    );
    puff.position.set((i % 3) * 0.18 - 0.18, 0.2 + i * 0.12, (i % 2) * 0.1);
    group.add(puff);
  }
  return group;
}

export function sensorBlock(): THREE.Group {
  const group = new THREE.Group();
  group.name = "sensor";
  group.add(new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.55), lambert(0x3d5c58, 0x1b3a36, 0.35)));
  const grill = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.08), lambert(0x8aa8b0));
  grill.position.set(0, 0.15, 0.28);
  group.add(grill);
  return group;
}

export function regulatorYoke(): THREE.Group {
  const group = new THREE.Group();
  group.name = "regulator";
  group.add(new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.1, 0.7), lambert(0x6a5340, 0x2a2014, 0.25)));
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 0.1), lambert(0x8a6a40));
  arm.position.set(0.2, 0.25, 0);
  arm.name = "yoke-arm";
  group.add(arm);
  return group;
}

export function promoterGate(): THREE.Group {
  const group = new THREE.Group();
  group.name = "promoter-gate";
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.6, 0.16), lambert(STEEL));
  const leaf = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.4, 0.08), lambert(0x5a706c, TEAL, 0.12));
  leaf.position.set(0.55, 0.1, 0);
  leaf.name = "gate-leaf";
  group.add(post, leaf);
  return group;
}

export function reporterLamp(): THREE.Group {
  const group = new THREE.Group();
  group.name = "reporter-lamp";
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.7, 8), lambert(STEEL));
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), lambert(0x6a4030, 0xef6a1a, 0.08));
  bulb.position.y = 0.48;
  bulb.name = "lamp-bulb";
  const fill = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.18, 3), lambert(AMBER, 0xef6a1a, 0.2));
  fill.position.set(0, 0.48, 0.18);
  fill.rotation.x = Math.PI;
  fill.name = "lamp-fill";
  group.add(stem, bulb, fill);
  return group;
}

export function shapeFlag(): THREE.Group {
  const group = new THREE.Group();
  group.name = "shape-flag";
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7, 6), lambert(BONE));
  const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.28, 0.36), lambert(TEAL, 0x3a8884, 0.55));
  cloth.position.set(0.04, 0.18, 0.16);
  cloth.name = "flag-cloth";
  group.add(pole, cloth);
  return group;
}

export function moonIcon(): THREE.Group {
  const group = new THREE.Group();
  group.name = "icon-moon";
  const disc = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), lambert(0x8aa0b8, 0x3a4858, 0.12));
  const cut = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12), lambert(0x152022));
  cut.position.set(0.12, 0.04, 0.08);
  group.add(disc, cut);
  return group;
}

export function sunIcon(): THREE.Group {
  const group = new THREE.Group();
  group.name = "icon-sun";
  group.add(new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 10), lambert(0xc9a227, 0x8a6a10, 0.2)));
  for (let i = 0; i < 8; i += 1) {
    const spike = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 0.04), lambert(0xe7c86a, 0xc9a227, 0.25));
    const a = (i / 8) * Math.PI * 2;
    spike.position.set(Math.cos(a) * 0.34, Math.sin(a) * 0.34, 0);
    spike.rotation.z = a;
    group.add(spike);
  }
  return group;
}

export function unknownIcon(): THREE.Group {
  const group = new THREE.Group();
  group.name = "icon-unknown";
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.035, 8, 12, Math.PI * 1.2), lambert(0x9aa4ad, 0x3a4044, 0.15));
  hook.rotation.z = 0.4;
  hook.position.y = 0.08;
  const stem = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.06), lambert(0x9aa4ad));
  stem.position.y = -0.08;
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), lambert(0x9aa4ad));
  dot.position.y = -0.22;
  group.add(hook, stem, dot);
  return group;
}

export function sealedLane(width: number, depth: number): THREE.Mesh {
  return new THREE.Mesh(new THREE.BoxGeometry(width, 0.16, depth), lambert(0x243034, 0x101618, 0.1));
}

export function consoleDesk(): THREE.Group {
  const group = new THREE.Group();
  group.add(new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.7), lambert(0x3a403c)));
  const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.7, 0.2), lambert(STEEL));
  pillar.position.y = -0.4;
  group.add(pillar);
  return group;
}

export function jointBlock(): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), lambert(0x8a6a3a, AMBER, 0.2));
  mesh.name = "sun-joint";
  return mesh;
}

export function scaleHandle(): THREE.Group {
  const group = new THREE.Group();
  group.name = "scale-handle";
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.1, 8), lambert(0x8aa0b8));
  const grip = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.035, 6, 12), lambert(0xc9a36a, 0x6a4a10, 0.3));
  grip.position.y = -0.55;
  grip.rotation.x = Math.PI / 2;
  group.add(bar, grip);
  return group;
}

export function safePadMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = "safe-pad";
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.62, 0.04, 8, 24),
    new THREE.MeshLambertMaterial({ color: TEAL, emissive: TEAL, emissiveIntensity: 0.45 }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.04;
  const plate = new THREE.Mesh(
    new THREE.CircleGeometry(0.55, 20),
    new THREE.MeshLambertMaterial({ color: 0x1a2c2c, emissive: 0x0a1818, emissiveIntensity: 0.3 }),
  );
  plate.rotation.x = -Math.PI / 2;
  plate.position.y = 0.02;
  group.add(ring, plate);
  return group;
}

export function replayToken(kind: "ask" | "build" | "run" | "break" | "fix" | "retest"): THREE.Mesh {
  const color =
    kind === "ask"
      ? 0x9aa4ad
      : kind === "build"
        ? 0x3d6a68
        : kind === "run"
          ? TEAL
          : kind === "break"
            ? 0xb85c38
            : kind === "fix"
              ? 0xc9a36a
              : 0xc9a227;
  const geo =
    kind === "ask"
      ? new THREE.OctahedronGeometry(0.09, 0)
      : kind === "break"
        ? new THREE.TetrahedronGeometry(0.1)
        : kind === "retest"
          ? new THREE.SphereGeometry(0.09, 10, 8)
          : new THREE.BoxGeometry(0.14, 0.1, 0.14);
  const mesh = new THREE.Mesh(geo, lambert(color, color, 0.35));
  mesh.name = `replay-${kind}`;
  mesh.visible = false;
  return mesh;
}

export function setEmissive(object: THREE.Object3D, intensity: number, color?: number): void {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const mat = child.material;
    if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshLambertMaterial) {
      mat.emissiveIntensity = intensity;
      if (color !== undefined) mat.emissive.setHex(color);
    }
  });
}
