import * as THREE from "three";
import {
  MOTOR,
  blockedAt,
  cameraHitDist,
  integrateMove,
  nearestIndex,
  pointInAabb,
  type AabbN,
} from "./motorMath";

export interface Aabb {
  min: THREE.Vector3;
  max: THREE.Vector3;
}

export interface TriggerVolume {
  id: string;
  min: THREE.Vector3;
  max: THREE.Vector3;
  entered: boolean;
}

export type HazardKind = "void" | "water";

export interface HazardVolume {
  id: string;
  kind: HazardKind;
  min: THREE.Vector3;
  max: THREE.Vector3;
}

export interface RopeAnchor {
  id: string;
  position: THREE.Vector3;
}

export interface LadderVolume {
  id: string;
  min: THREE.Vector3;
  max: THREE.Vector3;
}

export class WorldColliders {
  solids: Aabb[] = [];
  triggers: TriggerVolume[] = [];
  hazards: HazardVolume[] = [];
  anchors: RopeAnchor[] = [];
  ladders: LadderVolume[] = [];
  killY = MOTOR.killY;

  reset(): void {
    this.solids = [];
    this.triggers = [];
    this.hazards = [];
    this.anchors = [];
    this.ladders = [];
    this.killY = MOTOR.killY;
  }

  addBox(min: THREE.Vector3, max: THREE.Vector3): Aabb {
    const box = { min, max };
    this.solids.push(box);
    return box;
  }

  removeBox(box: Aabb): void {
    this.solids = this.solids.filter((item) => item !== box);
  }

  addTrigger(id: string, min: THREE.Vector3, max: THREE.Vector3): TriggerVolume {
    const trigger = { id, min, max, entered: false };
    this.triggers.push(trigger);
    return trigger;
  }

  addHazard(id: string, kind: HazardKind, min: THREE.Vector3, max: THREE.Vector3): HazardVolume {
    const hazard = { id, kind, min, max };
    this.hazards.push(hazard);
    return hazard;
  }

  addAnchor(id: string, x: number, y: number, z: number): RopeAnchor {
    const anchor = { id, position: new THREE.Vector3(x, y, z) };
    this.anchors.push(anchor);
    return anchor;
  }

  addLadder(id: string, min: THREE.Vector3, max: THREE.Vector3): LadderVolume {
    const ladder = { id, min, max };
    this.ladders.push(ladder);
    return ladder;
  }

  inside(point: THREE.Vector3, box: Aabb, pad = 0): boolean {
    return pointInAabb(point.x, point.y, point.z, toN(box), pad);
  }

  move(
    position: THREE.Vector3,
    velocity: THREE.Vector3,
    radius: number,
    height: number,
    dt: number,
    stepUp: number = MOTOR.stepHeight,
    grounded = true,
    coyote = 0,
  ): { grounded: boolean; stepped: boolean; coyote: number } {
    const solids = this.solids.map(toN);
    const next = integrateMove(
      {
        x: position.x,
        y: position.y,
        z: position.z,
        vx: velocity.x,
        vy: velocity.y,
        vz: velocity.z,
        grounded,
        coyote,
      },
      solids,
      {
        radius,
        height,
        dt,
        stepHeight: stepUp,
        gravity: MOTOR.gravity,
        coyoteMax: MOTOR.coyote,
      },
    );
    position.set(next.x, next.y, next.z);
    velocity.set(next.vx, next.vy, next.vz);
    return { grounded: next.grounded, stepped: next.stepped, coyote: next.coyote };
  }

  sampleTriggers(position: THREE.Vector3): string[] {
    const hits: string[] = [];
    for (const trigger of this.triggers) {
      const now = this.inside(position, trigger, 0.2);
      if (now && !trigger.entered) hits.push(trigger.id);
      trigger.entered = now;
    }
    return hits;
  }

  hazardAt(position: THREE.Vector3): HazardKind | null {
    for (const hazard of this.hazards) {
      if (pointInAabb(position.x, position.y + 0.2, position.z, toN(hazard), 0)) return hazard.kind;
    }
    return null;
  }

  ladderAt(position: THREE.Vector3, height = MOTOR.height): LadderVolume | null {
    const mid = position.clone();
    mid.y += height * 0.45;
    for (const ladder of this.ladders) {
      if (pointInAabb(mid.x, mid.y, mid.z, toN(ladder), 0.12)) return ladder;
    }
    return null;
  }

  nearestAnchor(from: THREE.Vector3): THREE.Vector3 | null {
    if (this.anchors.length === 0) return null;
    const i = nearestIndex(
      from.x,
      from.z,
      this.anchors.map((a) => ({ x: a.position.x, z: a.position.z })),
    );
    return this.anchors[i]?.position ?? null;
  }

  occupied(position: THREE.Vector3, radius: number, height: number): boolean {
    return blockedAt(position.x, position.y, position.z, radius, height, this.solids.map(toN));
  }

  raycast(origin: THREE.Vector3, toward: THREE.Vector3): number {
    const dx = toward.x - origin.x;
    const dy = toward.y - origin.y;
    const dz = toward.z - origin.z;
    const maxDist = Math.hypot(dx, dy, dz);
    return cameraHitDist(origin.x, origin.y, origin.z, dx, dy, dz, this.solids.map(toN), maxDist);
  }
}

export function syncAabb(box: Aabb, x: number, y: number, z: number, w: number, h: number, d: number): void {
  box.min.set(x - w / 2, y - h / 2, z - d / 2);
  box.max.set(x + w / 2, y + h / 2, z + d / 2);
}

function toN(box: { min: THREE.Vector3; max: THREE.Vector3 }): AabbN {
  return {
    minX: box.min.x,
    minY: box.min.y,
    minZ: box.min.z,
    maxX: box.max.x,
    maxY: box.max.y,
    maxZ: box.max.z,
  };
}
