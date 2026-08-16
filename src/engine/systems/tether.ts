import * as THREE from "three";
import type { ToolVoice } from "../audio";
import type { CameraRig } from "../cameraRig";
import type { Aabb, WorldColliders } from "../collision";
import type { Input } from "../input";
import type { PlayerMotor } from "../player";

export type MassClass = "light" | "medium" | "heavy" | "locked" | "fragile";

export type ShapeKey =
  | "chevron"
  | "notch"
  | "circle"
  | "flag"
  | "protein"
  | "rna"
  | "magnifier"
  | "relay"
  | "lever"
  | "port-reg"
  | "port-out"
  | "latch"
  | "beacon"
  | "smoke"
  | "crate"
  | "dna"
  | "joint";

export interface TetherBody {
  id: string;
  mass: MassClass;
  shape: ShapeKey;
  object: THREE.Object3D;
  held: boolean;
  seated: boolean;
  seatedIn: string | null;
  home: THREE.Vector3;
  homeQuat: THREE.Quaternion;
  cuttable: boolean;
  pressurised: boolean;
  recoverOnDrop: boolean;
  walkSize: THREE.Vector3 | null;
  walkBox: Aabb | null;
  velocity: THREE.Vector3;
  roll: number;
  recovering: boolean;
  recoverT: number;
  shocked: boolean;
}

export interface TetherSocket {
  id: string;
  shape: ShapeKey;
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  radius: number;
  occupiedBy: string | null;
  ghost: THREE.Object3D;
  onSeat?: (bodyId: string) => void;
  onUnseat?: (bodyId: string) => void;
}

export interface TetherTick {
  dt: number;
  input: Input;
  player: PlayerMotor;
  camera: CameraRig;
  world: WorldColliders;
  strength: number;
  tapMode: boolean;
  reducedMotion: boolean;
}

const MASS_FORCE: Record<Exclude<MassClass, "locked">, number> = {
  light: 22,
  medium: 11,
  heavy: 5.2,
  fragile: 10,
};

const MASS_DAMP: Record<Exclude<MassClass, "locked">, number> = {
  light: 0.8,
  medium: 0.88,
  heavy: 0.93,
  fragile: 0.86,
};

const MASS_SPIN: Record<Exclude<MassClass, "locked">, number> = {
  light: 7.5,
  medium: 3.8,
  heavy: 1.5,
  fragile: 3.4,
};

export class TetherTool {
  owned = false;
  heldId: string | null = null;
  assistAlign = false;
  bodies: TetherBody[] = [];
  sockets: TetherSocket[] = [];
  focusId: string | null = null;
  lockHint = false;
  strain = false;
  consumedInteract = false;
  lastRecovered = false;
  lastShockId: string | null = null;
  holdDistance = 2.2;

  private voice: ToolVoice | null = null;
  private group: THREE.Group | null = null;
  private beam: THREE.Mesh | null = null;
  private hook: THREE.Mesh | null = null;
  private lockMark: THREE.Mesh | null = null;
  private world: WorldColliders | null = null;
  private readonly look = new THREE.Vector3();
  private readonly hand = new THREE.Vector3();
  private readonly target = new THREE.Vector3();
  private readonly tmp = new THREE.Vector3();
  private time = 0;

  bindAudio(voice: ToolVoice): void {
    this.voice = voice;
  }

  attach(root: THREE.Group): void {
    this.detach();
    const group = new THREE.Group();
    group.name = "tether-fx";
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.018, 1, 6),
      new THREE.MeshBasicMaterial({ color: 0x7ec8c3, transparent: true, opacity: 0.7 }),
    );
    beam.visible = false;
    const hook = new THREE.Mesh(
      new THREE.TorusGeometry(0.07, 0.018, 6, 10, Math.PI),
      new THREE.MeshBasicMaterial({ color: 0xe7e2d4 }),
    );
    hook.visible = false;
    const lockMark = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.1, 0.03),
      new THREE.MeshBasicMaterial({ color: 0xc9a36a }),
    );
    lockMark.visible = false;
    group.add(beam, hook, lockMark);
    root.add(group);
    this.group = group;
    this.beam = beam;
    this.hook = hook;
    this.lockMark = lockMark;
  }

  detach(): void {
    if (this.group?.parent) this.group.parent.remove(this.group);
    this.disposeMesh(this.beam);
    this.disposeMesh(this.hook);
    this.disposeMesh(this.lockMark);
    this.group = null;
    this.beam = null;
    this.hook = null;
    this.lockMark = null;
  }

  reset(owned: boolean, assist: boolean): void {
    this.owned = owned;
    this.heldId = null;
    this.assistAlign = assist;
    this.bodies = [];
    this.sockets = [];
    this.focusId = null;
    this.lockHint = false;
    this.strain = false;
    this.consumedInteract = false;
    this.lastRecovered = false;
    this.lastShockId = null;
    this.holdDistance = 2.2;
    this.world = null;
    this.time = 0;
  }

  grantPickup(): void {
    this.owned = true;
  }

  registerBody(spec: {
    id: string;
    object: THREE.Object3D;
    mass: MassClass;
    shape: ShapeKey;
    home?: THREE.Vector3;
    cuttable?: boolean;
    pressurised?: boolean;
    recoverOnDrop?: boolean;
    walkSize?: THREE.Vector3;
  }): TetherBody {
    const home = spec.home?.clone() ?? spec.object.position.clone();
    const body: TetherBody = {
      id: spec.id,
      mass: spec.mass,
      shape: spec.shape,
      object: spec.object,
      held: false,
      seated: false,
      seatedIn: null,
      home,
      homeQuat: spec.object.quaternion.clone(),
      cuttable: spec.cuttable === true,
      pressurised: spec.pressurised === true,
      recoverOnDrop: spec.recoverOnDrop !== false,
      walkSize: spec.walkSize ?? null,
      walkBox: null,
      velocity: new THREE.Vector3(),
      roll: 0,
      recovering: false,
      recoverT: 0,
      shocked: false,
    };
    this.bodies.push(body);
    return body;
  }

  registerSocket(spec: {
    id: string;
    shape: ShapeKey;
    position: THREE.Vector3;
    quaternion?: THREE.Quaternion;
    radius?: number;
    parent?: THREE.Object3D;
    onSeat?: (bodyId: string) => void;
    onUnseat?: (bodyId: string) => void;
  }): TetherSocket {
    const ghost = makeSocketGhost(spec.shape);
    ghost.position.copy(spec.position);
    if (spec.quaternion) ghost.quaternion.copy(spec.quaternion);
    spec.parent?.add(ghost);
    const socket: TetherSocket = {
      id: spec.id,
      shape: spec.shape,
      position: spec.position.clone(),
      quaternion: spec.quaternion?.clone() ?? new THREE.Quaternion(),
      radius: spec.radius ?? 0.55,
      occupiedBy: null,
      ghost,
      onSeat: spec.onSeat,
      onUnseat: spec.onUnseat,
    };
    this.sockets.push(socket);
    return socket;
  }

  body(id: string): TetherBody | undefined {
    return this.bodies.find((item) => item.id === id);
  }

  seatedIn(socketId: string): TetherBody | undefined {
    return this.bodies.find((item) => item.seatedIn === socketId);
  }

  prompt(): string | null {
    if (!this.owned) return null;
    if (this.lockHint) return "固定鎖";
    if (this.heldId) {
      const near = this.bestSocket(this.body(this.heldId));
      if (near && this.canSnap(this.body(this.heldId), near).ok) return "扣入 形狀座";
      return this.lastRecovered ? "再抓一次" : "放開";
    }
    if (this.focusId) {
      const body = this.body(this.focusId);
      if (body?.mass === "locked" || body?.pressurised) return "固定鎖";
      return "抓取";
    }
    return null;
  }

  update(tick: TetherTick): void {
    this.time += tick.dt;
    this.consumedInteract = false;
    this.lastRecovered = false;
    this.lastShockId = null;
    this.lockHint = false;
    this.strain = false;
    this.world = tick.world;
    if (!this.owned) {
      this.syncFx(tick);
      return;
    }

    tick.camera.lookDir3(this.look);
    this.hand.copy(tick.player.position).add(new THREE.Vector3(0, 1.25, 0));
    this.updateFocus();
    this.handleGrab(tick);
    this.integrateHeld(tick);
    this.trySeat(tick);
    this.recoverLoose(tick);
    this.syncFx(tick);
  }

  drop(): void {
    const body = this.heldId ? this.body(this.heldId) : undefined;
    if (body) {
      body.held = false;
      if (body.recoverOnDrop) this.beginRecover(body);
    }
    this.heldId = null;
  }

  private updateFocus(): void {
    this.focusId = null;
    if (this.heldId) return;
    let best: TetherBody | null = null;
    let bestScore = Infinity;
    for (const body of this.bodies) {
      if (body.recovering) continue;
      const pos = body.object.getWorldPosition(this.tmp);
      const to = pos.clone().sub(this.hand);
      const dist = to.length();
      if (dist > 6.2) continue;
      const along = to.dot(this.look);
      if (along < 0.25) continue;
      const radial = to.clone().addScaledVector(this.look, -along).length();
      if (radial > 0.85 && dist > 1.6) continue;
      const score = dist + radial * 1.6;
      if (score < bestScore) {
        best = body;
        bestScore = score;
      }
    }
    this.focusId = best?.id ?? null;
    if (best && (best.mass === "locked" || best.pressurised)) this.lockHint = true;
  }

  private handleGrab(tick: TetherTick): void {
    const press = tick.input.tetherPressed;
    const held = tick.input.tetherHeld;
    const release = tick.input.tetherReleased;

    if (tick.tapMode) {
      if (!press) return;
      if (this.heldId) {
        this.drop();
        this.consumedInteract = true;
        return;
      }
      this.tryGrab();
      return;
    }

    if (this.heldId) {
      if (release) {
        this.drop();
        this.consumedInteract = true;
      }
      return;
    }

    if ((press || held) && this.focusId) {
      this.tryGrab();
    }
  }

  private tryGrab(): void {
    const body = this.focusId ? this.body(this.focusId) : undefined;
    if (!body) return;
    this.consumedInteract = true;
    if (body.mass === "locked" || body.pressurised) {
      this.lockHint = true;
      this.voice?.lock();
      return;
    }
    if (body.seated && body.seatedIn) {
      const socket = this.sockets.find((item) => item.id === body.seatedIn);
      if (socket) {
        socket.occupiedBy = null;
        socket.onUnseat?.(body.id);
        this.clearWalk(body);
      }
      body.seated = false;
      body.seatedIn = null;
    }
    this.heldId = body.id;
    body.held = true;
    body.recovering = false;
    this.holdDistance = Math.min(3.6, Math.max(1.1, this.hand.distanceTo(body.object.position)));
  }

  private integrateHeld(tick: TetherTick): void {
    const body = this.heldId ? this.body(this.heldId) : undefined;
    if (!body || body.mass === "locked") return;

    let reel = -tick.input.wheel * 0.28;
    if (tick.input.keys.has("KeyZ")) reel -= tick.dt * 2.2;
    if (tick.input.keys.has("KeyX")) reel += tick.dt * 2.2;
    this.holdDistance = Math.min(4.4, Math.max(0.85, this.holdDistance + reel));

    const force = MASS_FORCE[body.mass] * Math.max(0.55, tick.strength);
    const damp = MASS_DAMP[body.mass];
    const spin = MASS_SPIN[body.mass];
    this.strain = body.mass === "heavy";

    this.target.copy(this.hand).addScaledVector(this.look, this.holdDistance);
    this.target.y = Math.max(0.2, this.target.y);
    const delta = this.tmp.copy(this.target).sub(body.object.position);
    body.velocity.addScaledVector(delta, force * tick.dt);
    if (body.mass === "heavy") {
      body.velocity.x += Math.sin(this.time * 1.5) * 1.6 * tick.dt;
    }
    body.velocity.multiplyScalar(Math.pow(damp, tick.dt * 60));
    body.object.position.addScaledVector(body.velocity, tick.dt);
    this.separate(body, tick.world);

    const yaw = tick.camera.yaw;
    const pitch = tick.camera.pitch * 0.35;
    let roll = 0;
    if (tick.input.keys.has("KeyR")) roll += 1;
    if (tick.input.keys.has("KeyT") || tick.input.keys.has("KeyG")) roll -= 1;
    if (tick.tapMode && roll !== 0) {
      body.roll += roll * ((15 * Math.PI) / 180) * tick.dt * 8;
    } else {
      body.roll += roll * spin * tick.dt;
    }
    body.object.rotation.set(pitch, yaw, body.roll);

    if (body.mass === "fragile" && body.velocity.length() > 7.2) {
      body.shocked = true;
      this.lastShockId = body.id;
      this.beginRecover(body);
      this.heldId = null;
      body.held = false;
    }
  }

  private trySeat(tick: TetherTick): void {
    const body = this.heldId ? this.body(this.heldId) : undefined;
    if (!body) return;
    const socket = this.bestSocket(body);
    if (!socket) return;
    const fit = this.canSnap(body, socket);
    socket.ghost.visible = true;
    if (!fit.ok) return;
    const confirm = tick.input.interactPressed || fit.auto;
    if (!confirm) return;
    this.seat(body, socket, tick.world);
  }

  private bestSocket(body: TetherBody | undefined): TetherSocket | null {
    if (!body) return null;
    let best: TetherSocket | null = null;
    let bestDist = Infinity;
    for (const socket of this.sockets) {
      if (socket.occupiedBy && socket.occupiedBy !== body.id) continue;
      const dist = body.object.position.distanceTo(socket.position);
      if (dist < socket.radius * 1.6 && dist < bestDist) {
        best = socket;
        bestDist = dist;
      }
    }
    return best;
  }

  private canSnap(body: TetherBody | undefined, socket: TetherSocket): { ok: boolean; auto: boolean } {
    if (!body) return { ok: false, auto: false };
    if (body.shape !== socket.shape) return { ok: false, auto: false };
    const dist = body.object.position.distanceTo(socket.position);
    if (dist > socket.radius) return { ok: false, auto: false };
    const sockEuler = new THREE.Euler().setFromQuaternion(socket.quaternion);
    const rollDelta = wrapAngle(body.object.rotation.z - sockEuler.z);
    const yawDelta = wrapAngle(body.object.rotation.y - sockEuler.y);
    const yawMatters = socket.quaternion.w < 0.999 && Math.abs(socket.quaternion.x) + Math.abs(socket.quaternion.y) + Math.abs(socket.quaternion.z) > 0.02;
    const angle = Math.abs(rollDelta) + (yawMatters ? Math.abs(yawDelta) * 0.35 : 0);
    const limit = this.assistAlign ? (35 * Math.PI) / 180 : (18 * Math.PI) / 180;
    if (angle > limit) return { ok: false, auto: false };
    const auto = this.assistAlign && angle < (15 * Math.PI) / 180 && dist < socket.radius * 0.55;
    return { ok: true, auto };
  }

  private seat(body: TetherBody, socket: TetherSocket, world: WorldColliders): void {
    body.object.position.copy(socket.position);
    body.object.quaternion.copy(socket.quaternion);
    body.velocity.set(0, 0, 0);
    body.held = false;
    body.seated = true;
    body.seatedIn = socket.id;
    socket.occupiedBy = body.id;
    this.heldId = null;
    this.voice?.snap();
    this.addWalk(body, world);
    socket.onSeat?.(body.id);
  }

  private recoverLoose(tick: TetherTick): void {
    for (const body of this.bodies) {
      if (body.held || body.seated) continue;
      if (body.object.position.y < -1.2 && body.recoverOnDrop) this.beginRecover(body);
      if (!body.recovering) continue;
      body.recoverT += tick.dt / 0.85;
      const t = Math.min(1, body.recoverT);
      body.object.position.lerpVectors(body.object.position, body.home, 0.2 + t * 0.35);
      if (t >= 1) {
        body.object.position.copy(body.home);
        body.object.quaternion.copy(body.homeQuat);
        body.recovering = false;
        body.velocity.set(0, 0, 0);
        this.lastRecovered = true;
      }
    }
  }

  private beginRecover(body: TetherBody): void {
    body.recovering = true;
    body.recoverT = 0;
    body.velocity.set(0, 0, 0);
  }

  private addWalk(body: TetherBody, world: WorldColliders): void {
    if (!body.walkSize) return;
    this.clearWalk(body);
    const p = body.object.position;
    const s = body.walkSize;
    body.walkBox = world.addBox(
      new THREE.Vector3(p.x - s.x / 2, p.y - s.y / 2, p.z - s.z / 2),
      new THREE.Vector3(p.x + s.x / 2, p.y + s.y / 2, p.z + s.z / 2),
    );
  }

  private clearWalk(body: TetherBody): void {
    if (body.walkBox && this.world) {
      this.world.removeBox(body.walkBox);
      body.walkBox = null;
    }
  }

  private separate(body: TetherBody, world: WorldColliders): void {
    const pos = body.object.position;
    for (const box of world.solids) {
      if (pos.x < box.min.x - 0.2 || pos.x > box.max.x + 0.2) continue;
      if (pos.z < box.min.z - 0.2 || pos.z > box.max.z + 0.2) continue;
      if (pos.y < box.min.y - 0.2 || pos.y > box.max.y + 0.8) continue;
      const cx = (box.min.x + box.max.x) * 0.5;
      const cz = (box.min.z + box.max.z) * 0.5;
      const dx = pos.x - cx;
      const dz = pos.z - cz;
      if (Math.abs(dx) > Math.abs(dz)) pos.x += Math.sign(dx || 1) * 0.08;
      else pos.z += Math.sign(dz || 1) * 0.08;
      body.velocity.multiplyScalar(0.4);
    }
  }

  private syncFx(tick: TetherTick): void {
    if (!this.beam || !this.hook || !this.lockMark) return;
    const body = this.heldId ? this.body(this.heldId) : this.focusId ? this.body(this.focusId) : undefined;
    if (!body) {
      this.beam.visible = false;
      this.hook.visible = false;
      this.lockMark.visible = false;
      return;
    }
    const dest = body.object.getWorldPosition(this.tmp);
    const mid = this.hand.clone().add(dest).multiplyScalar(0.5);
    const span = Math.max(0.05, this.hand.distanceTo(dest));
    this.beam.visible = this.owned && (!!this.heldId || !!this.focusId);
    this.beam.position.copy(mid);
    this.beam.scale.set(1, span, 1);
    this.beam.lookAt(dest);
    this.beam.rotateX(Math.PI / 2);
    this.hook.visible = !!this.heldId && !this.lockHint;
    this.hook.position.copy(dest);
    this.lockMark.visible = this.lockHint;
    this.lockMark.position.copy(dest).add(new THREE.Vector3(0, 0.25, 0));
    const opacity = this.strain ? 0.4 : 0.7;
    const mat = this.beam.material;
    if (mat instanceof THREE.MeshBasicMaterial) mat.opacity = tick.reducedMotion ? 0.55 : opacity;
  }

  private disposeMesh(mesh: THREE.Mesh | null): void {
    if (!mesh) return;
    mesh.geometry.dispose();
    const material = mesh.material;
    if (Array.isArray(material)) {
      for (const item of material) item.dispose();
    } else {
      material.dispose();
    }
  }
}

function wrapAngle(value: number): number {
  let next = value;
  while (next > Math.PI) next -= Math.PI * 2;
  while (next < -Math.PI) next += Math.PI * 2;
  return next;
}

function makeSocketGhost(shape: ShapeKey): THREE.Object3D {
  const color = 0x8aa8b0;
  if (shape === "chevron") {
    const mark = new THREE.Mesh(
      new THREE.ConeGeometry(0.16, 0.28, 3),
      new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.7 }),
    );
    mark.rotation.x = Math.PI;
    return mark;
  }
  if (shape === "notch") {
    return new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.1, 0.18),
      new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.7 }),
    );
  }
  return new THREE.Mesh(
    new THREE.TorusGeometry(0.16, 0.02, 6, 12),
    new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.55 }),
  );
}
