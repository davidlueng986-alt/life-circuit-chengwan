import * as THREE from "three";
import { createRunnerAvatar, createSafetyLine, setAvatarLod, setLineEnds } from "./avatar";
import type { WorldColliders } from "./collision";
import type { Input } from "./input";
import {
  MOTOR,
  approachVec,
  recoverPoint,
  shouldRefreshSafe,
  wishOnYaw,
} from "./motorMath";

export type RecoverKind = "void" | "water";
export type PoseAction = "none" | "pick" | "push";

export class PlayerMotor {
  readonly position = new THREE.Vector3(0, 0, 0);
  readonly velocity = new THREE.Vector3();
  readonly lastSafe = new THREE.Vector3();
  readonly root = new THREE.Group();
  readonly avatar = createRunnerAvatar();
  readonly rope = createSafetyLine();
  yaw = 0;
  grounded = true;
  climbing = false;
  radius = MOTOR.radius;
  height = MOTOR.height;
  walkSpeed: number = MOTOR.walkSpeed;
  recovering = false;
  recoverKind: RecoverKind = "void";
  recoverT = 0;
  justRecovered = false;
  pose: PoseAction = "none";
  private poseT = 0;
  private recoverFrom = new THREE.Vector3();
  private recoverTo = new THREE.Vector3();
  private recoverStun = 0;
  private coyote: number = MOTOR.coyote;
  private stableGround = 0;
  private bob = 0;
  private reduced = false;

  constructor() {
    this.root.name = "player-root";
    this.root.add(this.avatar);
    this.root.add(this.rope);
  }

  reset(x: number, y: number, z: number, yaw = 0): void {
    this.position.set(x, y, z);
    this.lastSafe.copy(this.position);
    this.velocity.set(0, 0, 0);
    this.yaw = yaw;
    this.recovering = false;
    this.climbing = false;
    this.recoverT = 0;
    this.recoverStun = 0;
    this.coyote = MOTOR.coyote;
    this.stableGround = MOTOR.safeHold;
    this.justRecovered = false;
    this.grounded = true;
    this.walkSpeed = MOTOR.walkSpeed;
    this.pose = "none";
    this.poseT = 0;
    this.rope.visible = false;
    this.syncPose(0);
  }

  playAction(kind: Exclude<PoseAction, "none">): void {
    this.pose = kind;
    this.poseT = kind === "push" ? 0.58 : 0.42;
  }

  pullTo(anchor: THREE.Vector3, kind: RecoverKind = "void"): void {
    if (this.recovering) return;
    this.recovering = true;
    this.recoverKind = kind;
    this.recoverT = 0;
    this.recoverFrom.copy(this.position);
    this.recoverTo.copy(anchor);
    this.velocity.set(0, 0, 0);
    this.climbing = false;
    this.rope.visible = true;
  }

  update(dt: number, input: Input, lookYaw: number, world: WorldColliders, extras: { reducedMotion?: boolean; camDist?: number } = {}): void {
    this.reduced = extras.reducedMotion === true;
    if (extras.camDist !== undefined) setAvatarLod(this.avatar, extras.camDist > 9.5);
    this.justRecovered = false;
    this.yaw = lookYaw;

    if (this.recovering) {
      this.tickRecover(dt);
      this.syncPose(dt);
      return;
    }

    if (this.recoverStun > 0) {
      this.recoverStun = Math.max(0, this.recoverStun - dt);
    }

    const hazard = world.hazardAt(this.position);
    if (this.position.y < world.killY || hazard) {
      const pad = world.nearestAnchor(this.position) ?? this.lastSafe;
      this.pullTo(pad, hazard === "water" ? "water" : "void");
      this.syncPose(dt);
      return;
    }

    const ladder = world.ladderAt(this.position, this.height);
    const axis = input.axis();
    if (ladder && this.recoverStun <= 0) {
      this.tickClimb(dt, axis.z, ladder.min, ladder.max, lookYaw);
      this.syncPose(dt);
      return;
    }
    this.climbing = false;

    const wish = wishOnYaw(axis.x, axis.z, lookYaw);
    const stunned = this.recoverStun > 0;
    const speed = this.walkSpeed * (input.sprinting() ? MOTOR.sprintMul : 1);
    const targetX = stunned ? 0 : wish.x * speed;
    const targetZ = stunned ? 0 : wish.z * speed;
    if (!stunned && input.jumping() && (this.grounded || this.coyote > 0)) {
      this.velocity.y = MOTOR.jumpSpeed;
      this.grounded = false;
      this.coyote = 0;
    }
    const next = approachVec(this.velocity.x, this.velocity.z, targetX, targetZ, MOTOR.accel, MOTOR.decel, dt);
    this.velocity.x = next.x;
    this.velocity.z = next.z;

    const result = world.move(
      this.position,
      this.velocity,
      this.radius,
      this.height,
      dt,
      MOTOR.stepHeight,
      this.grounded,
      this.coyote,
    );
    this.grounded = result.grounded;
    this.coyote = result.coyote;
    this.stableGround = this.grounded ? this.stableGround + dt : 0;
    if (shouldRefreshSafe(this.grounded, this.stableGround, false, false)) {
      this.lastSafe.copy(this.position);
    }

    this.syncPose(dt);
  }

  private tickRecover(dt: number): void {
    this.recoverT += dt / MOTOR.recoverSeconds;
    const t = Math.min(1, this.recoverT);
    const p = recoverPoint(this.recoverFrom, this.recoverTo, t, MOTOR.recoverArc, this.reduced);
    this.position.set(p.x, p.y, p.z);
    setLineEnds(
      this.rope,
      this.recoverTo.x,
      this.recoverTo.y + 1.35,
      this.recoverTo.z,
      this.position.x,
      this.position.y + 1.2,
      this.position.z,
    );
    if (t >= 1) {
      this.recovering = false;
      this.position.copy(this.recoverTo);
      this.lastSafe.copy(this.recoverTo);
      this.velocity.set(0, 0, 0);
      this.grounded = true;
      this.stableGround = MOTOR.safeHold;
      this.recoverStun = MOTOR.recoverStun;
      this.justRecovered = true;
      this.rope.visible = false;
    }
  }

  private tickClimb(
    dt: number,
    axisZ: number,
    min: THREE.Vector3,
    max: THREE.Vector3,
    lookYaw: number,
  ): void {
    this.climbing = true;
    this.grounded = false;
    this.velocity.set(0, 0, 0);
    const cx = (min.x + max.x) * 0.5;
    const cz = (min.z + max.z) * 0.5;
    this.position.x += (cx - this.position.x) * Math.min(1, dt * 8);
    this.position.z += (cz - this.position.z) * Math.min(1, dt * 8);
    const climb = -axisZ;
    this.position.y += climb * MOTOR.climbSpeed * dt;
    const top = max.y - 0.15;
    const bottom = min.y;
    if (this.position.y > top) {
      this.position.y = top;
      this.climbing = false;
      this.grounded = true;
      const look = { x: -Math.sin(lookYaw), z: -Math.cos(lookYaw) };
      this.position.x += look.x * 0.35;
      this.position.z += look.z * 0.35;
    } else if (this.position.y < bottom && climb < 0) {
      this.position.y = bottom;
      this.climbing = false;
    }
  }

  private syncPose(dt: number): void {
    this.root.position.copy(this.position);
    this.avatar.rotation.y = this.yaw;
    const speed = Math.hypot(this.velocity.x, this.velocity.z);
    if (this.grounded && speed > 0.35 && !this.reduced && !this.recovering) {
      this.bob += dt * (2.4 + speed * 1.15);
    } else {
      this.bob *= 1 - Math.min(1, dt * 7);
    }
    const phase = this.bob;
    const amp = this.reduced ? 0 : Math.min(0.72, speed * 0.16);
    const bob = this.reduced ? 0 : Math.abs(Math.sin(phase)) * Math.min(0.05, speed * 0.012);
    this.avatar.position.y = bob;
    this.avatar.rotation.z = this.reduced ? 0 : THREE.MathUtils.clamp(-this.velocity.x * 0.018, -0.09, 0.09);
    const swing = Math.sin(phase) * amp;
    const legL = this.avatar.getObjectByName("legL");
    const legR = this.avatar.getObjectByName("legR");
    const armL = this.avatar.getObjectByName("armL");
    const armR = this.avatar.getObjectByName("armR");
    if (this.poseT > 0) this.poseT = Math.max(0, this.poseT - dt);
    if (this.poseT <= 0) this.pose = "none";
    const pick = this.pose === "pick" ? 1 - this.poseT / 0.42 : 0;
    const push = this.pose === "push" ? 1 - this.poseT / 0.58 : 0;
    if (legL) legL.rotation.x = swing + push * 0.18;
    if (legR) legR.rotation.x = -swing + push * 0.12;
    if (armL) armL.rotation.x = -swing * 0.7 - pick * 1.1 - push * 0.85;
    if (armR) armR.rotation.x = swing * 0.7 - pick * 0.35 - push * 0.95;
    if (armL && pick > 0) armL.rotation.z = -0.35;
    if (armR && push > 0) armR.rotation.z = 0.12;
    this.avatar.visible = true;
  }
}
