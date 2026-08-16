/** Pure locomotion / collision helpers. No Three, no DOM. */

export interface Vec2 {
  x: number;
  z: number;
}

export interface Vec3n {
  x: number;
  y: number;
  z: number;
}

export interface AabbN {
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
}

export interface MoveState {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  grounded: boolean;
  coyote: number;
}

export interface MoveParams {
  radius: number;
  height: number;
  dt: number;
  stepHeight: number;
  gravity: number;
  coyoteMax: number;
}

export interface MoveResult extends MoveState {
  stepped: boolean;
}

export const MOTOR = {
  walkSpeed: 4.317,
  sprintMul: 1.3,
  accel: 18,
  decel: 24,
  gravity: 32,
  jumpSpeed: 8.2,
  stepHeight: 0.51,
  radius: 0.36,
  height: 1.72,
  recoverSeconds: 1.2,
  recoverArc: 0.62,
  killY: -2.2,
  safeHold: 0.18,
  climbSpeed: 2.15,
  coyote: 0.1,
  recoverStun: 0.14,
  skin: 0.05,
} as const;

export const CAM = {
  dist: 4.05,
  height: 1.48,
  side: 0.42,
  lookHeight: 1.32,
  ladderDist: 2.55,
  ladderHeight: 1.62,
  minDist: 1.12,
  skin: 0.18,
  lerp: 0.09,
  pitchMin: -0.72,
  pitchMax: 0.86,
} as const;

export function clamp(value: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function easeInOutCubic(t: number): number {
  const x = clamp(t, 0, 1);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function clampPitch(pitch: number): number {
  return clamp(pitch, CAM.pitchMin, CAM.pitchMax);
}

/** Camera-relative wish. W is axis.z = -1. Yaw 0 faces −Z. */
export function wishOnYaw(axisX: number, axisZ: number, yaw: number): Vec2 {
  const sin = Math.sin(yaw);
  const cos = Math.cos(yaw);
  return {
    x: axisX * cos + axisZ * sin,
    z: -axisX * sin + axisZ * cos,
  };
}

export function lookFlat(yaw: number): Vec2 {
  return { x: -Math.sin(yaw), z: -Math.cos(yaw) };
}

export function approachVec(cx: number, cz: number, tx: number, tz: number, accel: number, decel: number, dt: number): Vec2 {
  const dx = tx - cx;
  const dz = tz - cz;
  const have = Math.hypot(cx, cz);
  const want = Math.hypot(tx, tz);
  const reverse = have > 0.05 && want > 0.05 && cx * tx + cz * tz < 0;
  const rate = want < 1e-4 || reverse ? decel : accel;
  const maxDelta = rate * dt;
  const len = Math.hypot(dx, dz);
  if (len <= maxDelta) return { x: tx, z: tz };
  return { x: cx + (dx / len) * maxDelta, z: cz + (dz / len) * maxDelta };
}

export function pointInAabb(x: number, y: number, z: number, box: AabbN, pad = 0): boolean {
  return (
    x >= box.minX - pad &&
    x <= box.maxX + pad &&
    y >= box.minY - pad &&
    y <= box.maxY + pad &&
    z >= box.minZ - pad &&
    z <= box.maxZ + pad
  );
}

export function circleHitsAabbXz(x: number, z: number, radius: number, box: AabbN): boolean {
  const cx = clamp(x, box.minX, box.maxX);
  const cz = clamp(z, box.minZ, box.maxZ);
  const dx = x - cx;
  const dz = z - cz;
  return dx * dx + dz * dz < radius * radius;
}

export function cylinderHitsAabb(x: number, y: number, z: number, radius: number, height: number, box: AabbN): boolean {
  const y0 = y + MOTOR.skin;
  const y1 = y + height;
  if (y1 < box.minY || y0 > box.maxY) return false;
  return circleHitsAabbXz(x, z, radius, box);
}

export function blockedAt(x: number, y: number, z: number, radius: number, height: number, solids: readonly AabbN[]): boolean {
  for (const box of solids) {
    if (cylinderHitsAabb(x, y, z, radius, height, box)) return true;
  }
  return false;
}

export function pushOutXz(x: number, y: number, z: number, radius: number, height: number, solids: readonly AabbN[]): Vec2 {
  let px = x;
  let pz = z;
  for (let pass = 0; pass < 3; pass += 1) {
    for (const box of solids) {
      if (!cylinderHitsAabb(px, y, pz, radius, height, box)) continue;
      const cx = clamp(px, box.minX, box.maxX);
      const cz = clamp(pz, box.minZ, box.maxZ);
      let dx = px - cx;
      let dz = pz - cz;
      const len = Math.hypot(dx, dz);
      if (len < 1e-6) {
        const left = px - box.minX;
        const right = box.maxX - px;
        const near = pz - box.minZ;
        const far = box.maxZ - pz;
        const m = Math.min(left, right, near, far);
        if (m === left) px = box.minX - radius;
        else if (m === right) px = box.maxX + radius;
        else if (m === near) pz = box.minZ - radius;
        else pz = box.maxZ + radius;
      } else {
        const pen = radius - len + 1e-4;
        if (pen > 0) {
          px += (dx / len) * pen;
          pz += (dz / len) * pen;
        }
      }
    }
  }
  return { x: px, z: pz };
}

export function supportY(
  x: number,
  y: number,
  z: number,
  radius: number,
  solids: readonly AabbN[],
  up = 0.34,
  down = 0.7,
): number | null {
  let best: number | null = null;
  for (const box of solids) {
    if (!circleHitsAabbXz(x, z, radius, box)) continue;
    const top = box.maxY;
    if (top > y + up || top < y - down) continue;
    if (best === null || top > best) best = top;
  }
  return best;
}

export function ceilingY(x: number, y: number, z: number, radius: number, height: number, solids: readonly AabbN[]): number | null {
  let best: number | null = null;
  const head = y + height;
  for (const box of solids) {
    if (!circleHitsAabbXz(x, z, radius * 0.92, box)) continue;
    if (box.minY < head - 0.02 || box.minY > head + 0.8) continue;
    if (best === null || box.minY < best) best = box.minY;
  }
  return best;
}

export function canStepOnto(
  feetY: number,
  surfaceY: number,
  stepHeight: number,
): boolean {
  const rise = surfaceY - feetY;
  return rise > 0.02 && rise <= stepHeight + 0.02;
}

export function integrateMove(state: MoveState, solids: readonly AabbN[], params: MoveParams): MoveResult {
  const { radius, height, dt, stepHeight, gravity, coyoteMax } = params;
  let { x, y, z, vx, vy, vz, grounded, coyote } = state;
  let stepped = false;
  const canStep = grounded || coyote > 0;

  const tryAxis = (nx: number, nz: number): void => {
    if (!blockedAt(nx, y, nz, radius, height, solids)) {
      x = nx;
      z = nz;
      return;
    }
    if (canStep) {
      const raised = y + stepHeight;
      if (!blockedAt(nx, raised, nz, radius, height, solids)) {
        const surface = supportY(nx, raised, nz, radius, solids, 0.05, stepHeight + 0.08);
        if (surface !== null && canStepOnto(y, surface, stepHeight) && !blockedAt(nx, surface, nz, radius, height, solids)) {
          x = nx;
          z = nz;
          y = surface;
          vy = 0;
          grounded = true;
          coyote = coyoteMax;
          stepped = true;
          return;
        }
      }
    }
    const pushed = pushOutXz(nx, y, nz, radius, height, solids);
    if (!blockedAt(pushed.x, y, pushed.z, radius, height, solids)) {
      x = pushed.x;
      z = pushed.z;
    }
  };

  tryAxis(x + vx * dt, z);
  tryAxis(x, z + vz * dt);

  if (!stepped) vy -= gravity * dt;
  y += vy * dt;

  if (blockedAt(x, y, z, radius, height, solids)) {
    if (vy > 0) {
      const ceil = ceilingY(x, y, z, radius, height, solids);
      if (ceil !== null) y = ceil - height - 0.01;
      vy = 0;
    } else {
      const surface = supportY(x, y + 0.25, z, radius, solids, 0.3, 0.9);
      if (surface !== null) {
        y = surface;
        grounded = true;
        coyote = coyoteMax;
        vy = 0;
      } else {
        const pushed = pushOutXz(x, y, z, radius, height, solids);
        x = pushed.x;
        z = pushed.z;
        if (blockedAt(x, y, z, radius, height, solids)) {
          y = state.y;
          vy = 0;
        }
      }
    }
  } else {
    const probe = supportY(x, y, z, radius, solids, 0.08, 0.12);
    if (probe !== null && y - probe <= 0.1 && vy <= 0) {
      y = probe;
      grounded = true;
      coyote = coyoteMax;
      vy = 0;
    } else {
      grounded = false;
      coyote = Math.max(0, coyote - dt);
    }
  }

  return { x, y, z, vx, vy, vz, grounded, coyote, stepped };
}

export function recoverPoint(from: Vec3n, to: Vec3n, t01: number, arc: number, reduced: boolean): Vec3n {
  const t = clamp(t01, 0, 1);
  if (t >= 1) return { x: to.x, y: to.y, z: to.z };
  const e = reduced ? t : easeInOutCubic(t);
  const lift = reduced ? 0 : Math.sin(Math.PI * t) * arc;
  return {
    x: lerp(from.x, to.x, e),
    y: lerp(from.y, to.y, e) + lift,
    z: lerp(from.z, to.z, e),
  };
}

export function nearestIndex(x: number, z: number, points: readonly Vec2[]): number {
  if (points.length === 0) return -1;
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < points.length; i += 1) {
    const p = points[i];
    if (!p) continue;
    const d = (p.x - x) * (p.x - x) + (p.z - z) * (p.z - z);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

export function shouldRefreshSafe(grounded: boolean, stableTime: number, inHazard: boolean, recovering: boolean): boolean {
  return grounded && !inHazard && !recovering && stableTime >= MOTOR.safeHold;
}

/**
 * Higher is better. `null` is out of range or clearly behind the player.
 * Standing beside an object still counts so a side-on toolbox is usable.
 */
export function interactScore(
  px: number,
  pz: number,
  lookX: number,
  lookZ: number,
  ix: number,
  iz: number,
  radius: number,
): number | null {
  const dx = ix - px;
  const dz = iz - pz;
  const dist = Math.hypot(dx, dz);
  if (dist > radius * 1.18) return null;
  const inv = dist < 1e-4 ? 0 : 1 / dist;
  const dot = dist < 1e-4 ? 1 : dx * inv * lookX + dz * inv * lookZ;
  if (dist < 1.85 && dot > -0.55) return 2.7 - dist + Math.max(0, dot);
  if (dot < 0.02) return null;
  return (1 - dist / radius) * 2 + dot;
}

/** Distance-only score for the “列出可互動物件” list. Ignores look. */
export function nearbyScore(px: number, pz: number, ix: number, iz: number, radius: number): number | null {
  const dist = Math.hypot(ix - px, iz - pz);
  const reach = radius * 1.9;
  if (dist > reach) return null;
  return 1 - dist / reach;
}

export function formatPrompt(prompt: string, bind: string, extra?: { index?: number; total?: number; hold?: boolean }): string {
  const stack = extra?.total && extra.total > 1 ? ` ${extra.index ?? 1}/${extra.total}` : "";
  const hold = extra?.hold ? "按住 " : "";
  return `${hold}${bind}　${prompt}${stack}`;
}

export function orbitOffset(yaw: number, pitch: number, dist: number, height: number, side: number): Vec3n {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  return {
    x: sy * dist * cp + cy * side,
    y: height + sp * dist,
    z: cy * dist * cp - sy * side,
  };
}

/** Slab ray vs AABB. `dir` need not be unit. Returns distance along unit dir, or null. */
export function rayAabb(ox: number, oy: number, oz: number, dx: number, dy: number, dz: number, box: AabbN, maxDist: number): number | null {
  const len = Math.hypot(dx, dy, dz);
  if (len < 1e-8) return null;
  const invX = dx / len;
  const invY = dy / len;
  const invZ = dz / len;
  const t1x = (box.minX - ox) / (invX === 0 ? 1e-8 : invX);
  const t2x = (box.maxX - ox) / (invX === 0 ? 1e-8 : invX);
  const t1y = (box.minY - oy) / (invY === 0 ? 1e-8 : invY);
  const t2y = (box.maxY - oy) / (invY === 0 ? 1e-8 : invY);
  const t1z = (box.minZ - oz) / (invZ === 0 ? 1e-8 : invZ);
  const t2z = (box.maxZ - oz) / (invZ === 0 ? 1e-8 : invZ);
  const tmin = Math.max(Math.min(t1x, t2x), Math.min(t1y, t2y), Math.min(t1z, t2z));
  const tmax = Math.min(Math.max(t1x, t2x), Math.max(t1y, t2y), Math.max(t1z, t2z));
  if (tmax < 0 || tmin > tmax) return null;
  const t = tmin >= 0 ? tmin : tmax;
  if (t < 0 || t > maxDist) return null;
  return t;
}

export function cameraHitDist(ox: number, oy: number, oz: number, dx: number, dy: number, dz: number, solids: readonly AabbN[], maxDist: number): number {
  let best = maxDist;
  for (const box of solids) {
    const t = rayAabb(ox, oy, oz, dx, dy, dz, box, maxDist);
    if (t !== null && t < best) best = t;
  }
  return Math.max(CAM.minDist, best - CAM.skin);
}

export function pullCamera(origin: Vec3n, desired: Vec3n, solids: readonly AabbN[]): Vec3n {
  const dx = desired.x - origin.x;
  const dy = desired.y - origin.y;
  const dz = desired.z - origin.z;
  const maxDist = Math.hypot(dx, dy, dz);
  if (maxDist < 1e-5) return desired;
  const hit = cameraHitDist(origin.x, origin.y, origin.z, dx, dy, dz, solids, maxDist);
  const u = hit / maxDist;
  return {
    x: origin.x + dx * u,
    y: origin.y + dy * u,
    z: origin.z + dz * u,
  };
}
