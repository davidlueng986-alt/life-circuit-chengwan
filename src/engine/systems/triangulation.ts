import * as THREE from "three";
import type { LieClass } from "../../content/ids";

export interface BearingCone {
  origin: THREE.Vector3;
  dir: THREE.Vector3;
  halfAngle: number;
  length: number;
  valid: boolean;
  weak: boolean;
}

export interface OverlapResult {
  area: number;
  quality: number;
  center: THREE.Vector3;
  accepted: boolean;
  confirmSeconds: number;
  sampleCount: number;
}

const BASE_ANGLE = 0.46;
const LENGTH = 18;

export class Triangulation {
  beacons: BearingCone[] = [];
  handheld: BearingCone | null = null;

  reset(): void {
    this.beacons = [];
    this.handheld = null;
  }

  makeCone(
    origin: THREE.Vector3,
    dir: THREE.Vector3,
    opts: {
      occluded?: boolean;
      lowBattery?: boolean;
      residual?: boolean;
      lie?: LieClass;
      readable?: boolean;
      saturated?: boolean;
    },
  ): BearingCone {
    const heading = dir.clone().setY(0);
    if (heading.lengthSq() < 1e-5) heading.set(0, 0, -1);
    else heading.normalize();

    const live = opts.lie === "live" || opts.lie === undefined;
    const readable = opts.readable !== false && !opts.saturated && live && opts.lie !== "dead_shine" && opts.lie !== "city_light";
    let half = BASE_ANGLE;
    if (opts.occluded) half += 0.28;
    if (opts.lowBattery) half += 0.1;
    if (opts.residual || opts.lie === "dead_shine" || opts.lie === "city_light") half += 0.34;
    if (opts.saturated || !readable) half = 1.2;

    return {
      origin: origin.clone(),
      dir: heading,
      halfAngle: half,
      length: LENGTH,
      valid: readable && !opts.saturated,
      weak: !readable || !!opts.occluded || !!opts.residual,
    };
  }

  setBeacon(index: number, cone: BearingCone): void {
    this.beacons[index] = cone;
  }

  overlap(): OverlapResult {
    const cones = [...this.beacons, this.handheld].filter((item): item is BearingCone => !!item && item.valid);
    const empty: OverlapResult = {
      area: 999,
      quality: 0,
      center: new THREE.Vector3(),
      accepted: false,
      confirmSeconds: 120,
      sampleCount: 0,
    };
    if (cones.length < 2) return empty;

    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    for (const cone of cones) {
      minX = Math.min(minX, cone.origin.x - cone.length);
      maxX = Math.max(maxX, cone.origin.x + cone.length);
      minZ = Math.min(minZ, cone.origin.z - cone.length);
      maxZ = Math.max(maxZ, cone.origin.z + cone.length);
    }

    const step = 1.4;
    let hits = 0;
    let sx = 0;
    let sz = 0;
    for (let x = minX; x <= maxX; x += step) {
      for (let z = minZ; z <= maxZ; z += step) {
        if (cones.every((cone) => insideCone(cone, x, z))) {
          hits += 1;
          sx += x;
          sz += z;
        }
      }
    }
    const area = hits * step * step;
    if (hits === 0) return empty;
    const center = new THREE.Vector3(sx / hits, 0.1, sz / hits);
    const avgAngle = cones.reduce((sum, cone) => sum + cone.halfAngle, 0) / cones.length;
    const quality = Math.max(0, 1 - avgAngle / 1.1) * (cones.length >= 3 ? 1 : 0.78);
    const tight = area < 28 && quality > 0.32 && cones.length >= 3;
    const wide = area < 90 && quality > 0.12 && cones.length >= 3;
    const accepted = tight || wide;
    return {
      area,
      quality,
      center,
      accepted,
      confirmSeconds: tight ? 40 : 90,
      sampleCount: hits,
    };
  }
}

function insideCone(cone: BearingCone, x: number, z: number): boolean {
  const dx = x - cone.origin.x;
  const dz = z - cone.origin.z;
  const dist = Math.hypot(dx, dz);
  if (dist < 0.4) return true;
  if (dist > cone.length) return false;
  const nx = dx / dist;
  const nz = dz / dist;
  const dot = nx * cone.dir.x + nz * cone.dir.z;
  return Math.acos(Math.min(1, Math.max(-1, dot))) <= cone.halfAngle;
}
