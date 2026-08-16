import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CAM,
  MOTOR,
  blockedAt,
  canStepOnto,
  clampPitch,
  formatPrompt,
  integrateMove,
  interactScore,
  lookFlat,
  nearbyScore,
  nearestIndex,
  pointInAabb,
  pullCamera,
  rayAabb,
  recoverPoint,
  shouldRefreshSafe,
  wishOnYaw,
  type AabbN,
} from "./motorMath.ts";

function box(minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number): AabbN {
  return { minX, minY, minZ, maxX, maxY, maxZ };
}

const floor = box(-8, -0.4, -8, 8, 0, 8);
const pipe = box(-1.6, 0, 8.65, 1.6, 0.2, 9.35);
const crate = box(1.5, 0, 1, 2.7, 0.9, 2.2);
const wall = box(2, 0, -4, 2.4, 2, 4);

function idleOnFloor() {
  return {
    x: 0,
    y: 0,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    grounded: true,
    coyote: MOTOR.coyote,
  };
}

const params = {
  radius: MOTOR.radius,
  height: MOTOR.height,
  dt: 1 / 60,
  stepHeight: MOTOR.stepHeight,
  gravity: MOTOR.gravity,
  coyoteMax: MOTOR.coyote,
};

test("W with yaw 0 walks toward −Z", () => {
  const wish = wishOnYaw(0, -1, 0);
  assert.ok(Math.abs(wish.x) < 1e-9);
  assert.ok(wish.z < -0.99);
});

test("D with yaw 0 walks toward +X", () => {
  const wish = wishOnYaw(1, 0, 0);
  assert.ok(wish.x > 0.99);
  assert.ok(Math.abs(wish.z) < 1e-9);
});

test("lookFlat yaw 0 faces −Z", () => {
  const look = lookFlat(0);
  assert.ok(Math.abs(look.x) < 1e-9);
  assert.ok(look.z < -0.99);
});

test("lookFlat yaw π faces +Z", () => {
  const look = lookFlat(Math.PI);
  assert.ok(Math.abs(look.x) < 1e-9);
  assert.ok(look.z > 0.99);
});

test("leave pad behind spawn is not the first interact", () => {
  const look = lookFlat(0);
  const pad = interactScore(0, 4.85, look.x, look.z, -6.6, 6.6, 1.05);
  assert.equal(pad, null);
  const oldOverlap = interactScore(0, 6.2, lookFlat(Math.PI).x, lookFlat(Math.PI).z, 0, 7.2, 1.35);
  assert.ok(oldOverlap !== null);
});

test("20 cm pipe is a legal step-up", () => {
  assert.equal(canStepOnto(0, 0.2, MOTOR.stepHeight), true);
  let state = { ...idleOnFloor(), z: 8.2, vz: 4.4 };
  let maxY = 0;
  let stepped = false;
  for (let i = 0; i < 30; i += 1) {
    const next = integrateMove(state, [floor, pipe], params);
    state = next;
    maxY = Math.max(maxY, next.y);
    if (next.stepped) stepped = true;
  }
  assert.equal(stepped, true);
  assert.ok(maxY >= 0.18);
});

test("90 cm crate is not an auto step-up", () => {
  assert.equal(canStepOnto(0, 0.9, MOTOR.stepHeight), false);
  let state = { ...idleOnFloor(), x: 1.1, z: 1.6, vx: 4.4 };
  for (let i = 0; i < 30; i += 1) {
    state = integrateMove(state, [floor, crate], params);
  }
  assert.ok(state.y < 0.15);
  assert.ok(state.x < 1.55);
});

test("horizontal slide along a wall keeps the free axis", () => {
  let state = { ...idleOnFloor(), x: 1.5, z: 0, vx: 4.5, vz: -4.5 };
  for (let i = 0; i < 20; i += 1) {
    state = integrateMove(state, [floor, wall], params);
  }
  assert.ok(state.z < -0.4);
  assert.ok(state.x < 2);
});

test("falling lands on the floor and grounds", () => {
  let state = { x: 0, y: 1.4, z: 0, vx: 0, vy: 0, vz: 0, grounded: false, coyote: 0 };
  for (let i = 0; i < 50; i += 1) {
    state = integrateMove(state, [floor], params);
  }
  assert.equal(state.grounded, true);
  assert.ok(Math.abs(state.y) < 0.05);
  assert.equal(state.vy, 0);
});

test("safety rope eases 1.2s and ends on the anchor", () => {
  assert.equal(MOTOR.recoverSeconds, 1.2);
  const from = { x: 4, y: -3, z: 2 };
  const to = { x: 0, y: 0, z: 0 };
  const a = recoverPoint(from, to, 0, MOTOR.recoverArc, false);
  const b = recoverPoint(from, to, 1, MOTOR.recoverArc, false);
  const mid = recoverPoint(from, to, 0.5, MOTOR.recoverArc, false);
  assert.equal(a.x, 4);
  assert.equal(b.x, 0);
  assert.equal(b.y, 0);
  assert.ok(mid.y > -1.2);
});

test("nearest anchor is the closest pad, not the first", () => {
  const i = nearestIndex(10, 30, [
    { x: 0, z: 0 },
    { x: 1.4, z: 20 },
    { x: 1.4, z: 32 },
  ]);
  assert.equal(i, 2);
});

test("safe pad only refreshes after a short grounded hold", () => {
  assert.equal(shouldRefreshSafe(true, 0.05, false, false), false);
  assert.equal(shouldRefreshSafe(true, 0.2, false, false), true);
  assert.equal(shouldRefreshSafe(true, 1, true, false), false);
  assert.equal(shouldRefreshSafe(true, 1, false, true), false);
});

test("interact prefers the object in front", () => {
  const look = lookFlat(0);
  const front = interactScore(0, 0, look.x, look.z, 0, -1.2, 1.8);
  const back = interactScore(0, 0, look.x, look.z, 0, 1.2, 1.8);
  assert.ok(front !== null);
  assert.equal(back, null);
});

test("side-on toolbox is still in range", () => {
  const look = lookFlat(Math.PI);
  const side = interactScore(2.2, 1.35, look.x, look.z, 3.22, 1.35, 1.65);
  assert.ok(side !== null);
  const listed = nearbyScore(2.2, 1.35, 3.22, 1.35, 1.65);
  assert.ok(listed !== null);
});

test("prompt keeps verb+object and shows the bind glyph", () => {
  assert.equal(formatPrompt("推開 工具箱", "E"), "E　推開 工具箱");
  assert.equal(formatPrompt("啟動 升降", "E", { hold: true }), "按住 E　啟動 升降");
  assert.equal(formatPrompt("去河港", "E", { index: 1, total: 2 }), "E　去河港 1/2");
});

test("camera ray stops before a wall and never goes inside the head", () => {
  const wallBox = box(-1, 0, -6, 1, 3, -5.6);
  const t = rayAabb(0, 1.3, 0, 0, 0, -1, wallBox, 8);
  assert.ok(t !== null && t > 5 && t < 6.1);
  const pulled = pullCamera({ x: 0, y: 1.3, z: 0 }, { x: 0, y: 1.3, z: -8 }, [wallBox]);
  assert.ok(pulled.z > -6);
  assert.ok(Math.hypot(pulled.x, pulled.y - 1.3, pulled.z) >= CAM.minDist - 1e-4);
});

test("void water volume is a point test, not a fail screen", () => {
  const water = box(-20, -8, -20, 20, -0.6, 60);
  assert.equal(pointInAabb(0, -3, 12, water), true);
  assert.equal(pointInAabb(0, 0.2, 0, water), false);
});

test("blockedAt sees the pipe but not empty air", () => {
  assert.equal(blockedAt(0, 0.05, 9, MOTOR.radius, MOTOR.height, [pipe]), true);
  assert.equal(blockedAt(0, 0, 0, MOTOR.radius, MOTOR.height, [pipe]), false);
});

test("pitch stays in the authored follow range", () => {
  assert.ok(clampPitch(-4) >= CAM.pitchMin);
  assert.ok(clampPitch(4) <= CAM.pitchMax);
});
