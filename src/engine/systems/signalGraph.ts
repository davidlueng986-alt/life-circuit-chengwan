import * as THREE from "three";
import type { LieClass, SignalKind } from "../../content/ids";

export type OccluderKind = "solid" | "grate" | "glass";

export interface SignalEdge {
  id: string;
  kind: SignalKind;
  a: THREE.Vector3;
  b: THREE.Vector3;
  enabled?: boolean;
}

export interface SignalOccluder {
  id: string;
  min: THREE.Vector3;
  max: THREE.Vector3;
  kind: OccluderKind;
}

export interface PulseHit {
  id: string;
  kind: SignalKind;
  lie: LieClass;
  brightness: number;
  moving: boolean;
  usableBearing: boolean;
  point: THREE.Vector3;
  dir: THREE.Vector3;
  from: THREE.Vector3;
  to: THREE.Vector3;
}

export interface OcclusionHit {
  kind: OccluderKind;
  point: THREE.Vector3;
  t: number;
}

const MOVING_KINDS: ReadonlySet<SignalKind> = new Set([
  "power_live",
  "emergency_pulse",
  "env_flow",
  "device_link",
  "workshop_trace",
  "probe_bearing",
]);

const DEAD_BRIGHT: ReadonlySet<SignalKind> = new Set([
  "power_residual",
  "city_light",
  "leftover_residue",
]);

export class SignalGraph {
  edges: SignalEdge[] = [];
  occluders: SignalOccluder[] = [];
  saturated = false;

  reset(): void {
    this.edges = [];
    this.occluders = [];
    this.saturated = false;
  }

  add(edge: SignalEdge): void {
    this.edges.push(edge);
  }

  addOccluder(occluder: SignalOccluder): void {
    this.occluders.push(occluder);
  }

  setEnabled(id: string, enabled: boolean): void {
    const edge = this.edges.find((item) => item.id === id);
    if (edge) edge.enabled = enabled;
  }

  pulse(origin: THREE.Vector3, range: number, readable: boolean): PulseHit[] {
    const hits: PulseHit[] = [];
    for (const edge of this.edges) {
      if (edge.enabled === false) continue;
      const mid = edge.a.clone().add(edge.b).multiplyScalar(0.5);
      if (origin.distanceTo(mid) > range && origin.distanceTo(edge.a) > range && origin.distanceTo(edge.b) > range) {
        continue;
      }

      const occ = firstOcclusion(origin, mid, this.occluders);
      const movingKind = MOVING_KINDS.has(edge.kind);
      const lie = classify(edge.kind, movingKind, readable, this.saturated, occ);
      const blocked = occ !== null && occ.kind === "solid";
      const to = blocked ? occ.point.clone() : edge.b.clone();
      const from = edge.a.clone();
      const point = blocked ? occ.point.clone() : mid;
      const attenuated = occ !== null && occ.kind !== "solid";
      const brightness = DEAD_BRIGHT.has(edge.kind) ? 1 : attenuated ? 0.32 : movingKind ? 0.58 : 0.4;
      const dir = to.clone().sub(from);
      if (dir.lengthSq() < 1e-6) dir.set(0, 0, 1);
      else dir.normalize();

      hits.push({
        id: edge.id,
        kind: edge.kind,
        lie,
        brightness,
        moving: lie === "live",
        usableBearing: lie === "live" && (edge.kind !== "probe_bearing" || (readable && !this.saturated)),
        point,
        dir,
        from,
        to,
      });
    }
    return hits;
  }
}

export function classify(
  kind: SignalKind,
  movingKind: boolean,
  readable: boolean,
  saturated: boolean,
  occ: OcclusionHit | null,
): LieClass {
  if (kind === "city_light") return "city_light";
  if (kind === "power_residual" || kind === "leftover_residue") return "dead_shine";
  if (kind === "self_test") return "unreadable";
  if (kind === "probe_bearing" && saturated) return "saturated";
  if (kind === "probe_bearing" && !readable) return "unreadable";
  if (occ && occ.kind === "solid") return "occluded";
  if (movingKind) return "live";
  return "background";
}

export function firstOcclusion(
  origin: THREE.Vector3,
  dest: THREE.Vector3,
  occluders: readonly SignalOccluder[],
): OcclusionHit | null {
  let best: OcclusionHit | null = null;
  for (const box of occluders) {
    const hit = rayAabb(origin, dest, box.min, box.max);
    if (!hit) continue;
    if (!best || hit.t < best.t) best = { kind: box.kind, point: hit.point, t: hit.t };
  }
  return best;
}

function rayAabb(
  origin: THREE.Vector3,
  dest: THREE.Vector3,
  min: THREE.Vector3,
  max: THREE.Vector3,
): { t: number; point: THREE.Vector3 } | null {
  const dir = dest.clone().sub(origin);
  const len = dir.length();
  if (len < 1e-4) return null;
  dir.multiplyScalar(1 / len);
  let tmin = 0;
  let tmax = len;
  for (const axis of ["x", "y", "z"] as const) {
    const o = origin[axis];
    const d = dir[axis];
    const lo = min[axis];
    const hi = max[axis];
    if (Math.abs(d) < 1e-8) {
      if (o < lo || o > hi) return null;
      continue;
    }
    let t1 = (lo - o) / d;
    let t2 = (hi - o) / d;
    if (t1 > t2) {
      const swap = t1;
      t1 = t2;
      t2 = swap;
    }
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmax < tmin) return null;
  }
  if (tmin < 0.12 || tmin > len - 0.04) return null;
  return { t: tmin, point: origin.clone().addScaledVector(dir, tmin) };
}
