import * as THREE from "three";
import { createRunnerAvatar } from "./avatar";

export type NpcKind = "xiaocen" | "chen" | "lin" | "fang" | "generic";

const TINT: Record<NpcKind, { shell: number; strap: number }> = {
  xiaocen: { shell: 0x3a2a22, strap: 0xef6a1a },
  chen: { shell: 0x6a4a32, strap: 0xb85c38 },
  lin: { shell: 0x3a5054, strap: 0x8fd4cf },
  fang: { shell: 0x2e3940, strap: 0x7ec8c3 },
  generic: { shell: 0x3a444c, strap: 0xe0a03a },
};

/** Same skeleton as the player runner; swap colours only. */
export function createNpc(kind: NpcKind, sit = false): THREE.Group {
  const root = createRunnerAvatar();
  root.name = `npc-${kind}`;
  const tint = TINT[kind];
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const mat = child.material;
    if (!(mat instanceof THREE.MeshStandardMaterial)) return;
    if (child.name.startsWith("leg") || child.name === "hip") return;
    if (child.name.startsWith("arm")) return;
    if (mat.emissive.getHex() > 0 && mat.color.getHex() === 0xe0a03a) {
      mat.color.setHex(tint.strap);
      mat.emissive.setHex(tint.strap);
      return;
    }
    if (child.geometry instanceof THREE.CapsuleGeometry) mat.color.setHex(tint.shell);
  });
  if (sit) {
    root.rotation.x = 0.28;
    root.position.y = -0.15;
  }
  return root;
}
