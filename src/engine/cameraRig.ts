import * as THREE from "three";
import type { WorldColliders } from "./collision";
import { CAM, clampPitch, lookFlat, orbitOffset, pullCamera } from "./motorMath";
import type { PlayerMotor } from "./player";

export class CameraRig {
  yaw = 0.18;
  pitch = -0.18;
  fov = 62;
  dist: number = CAM.dist;
  private snap = false;
  private readonly desired = new THREE.Vector3();
  private readonly look = new THREE.Vector3();
  private readonly scratch = new THREE.Vector3();

  /** Default orbit. Call before `mount` so a scene can override pitch/dist. */
  resetFraming(): void {
    this.dist = CAM.dist;
    this.pitch = -0.18;
    this.snap = false;
  }

  /** First frame after a scene load lands on the spawn look, not the previous room. */
  snapNext(): void {
    this.snap = true;
  }

  applyMouse(dx: number, dy: number, reduced: boolean): void {
    const sense = reduced ? 0.00115 : 0.00205;
    this.yaw -= dx * sense;
    this.pitch = clampPitch(this.pitch - dy * sense);
  }

  update(camera: THREE.PerspectiveCamera, player: PlayerMotor, reduced: boolean, world?: WorldColliders): void {
    camera.fov = this.fov;
    camera.updateProjectionMatrix();

    const ladder = player.climbing;
    const dist = ladder ? CAM.ladderDist : this.dist;
    const height = ladder ? CAM.ladderHeight : CAM.height;
    const offset = orbitOffset(this.yaw, this.pitch, dist, height, CAM.side);
    this.look.set(player.position.x, player.position.y + CAM.lookHeight, player.position.z);
    this.desired.set(this.look.x + offset.x, this.look.y + offset.y, this.look.z + offset.z);

    if (world) {
      const pulled = pullCamera(this.look, this.desired, world.solids.map((box) => ({
        minX: box.min.x,
        minY: box.min.y,
        minZ: box.min.z,
        maxX: box.max.x,
        maxY: box.max.y,
        maxZ: box.max.z,
      })));
      this.desired.set(pulled.x, pulled.y, pulled.z);
    }

    const lerp = this.snap || reduced ? 1 : player.recovering ? 0.28 : ladder ? 0.12 : CAM.lerp;
    this.snap = false;
    camera.position.lerp(this.desired, lerp);
    this.scratch.copy(this.look);
    camera.lookAt(this.scratch);
  }

  lookDir(): THREE.Vector3 {
    const flat = lookFlat(this.yaw);
    return new THREE.Vector3(flat.x, 0, flat.z);
  }

  lookDir3(out = new THREE.Vector3()): THREE.Vector3 {
    return out.set(
      -Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      -Math.cos(this.yaw) * Math.cos(this.pitch),
    );
  }
}
