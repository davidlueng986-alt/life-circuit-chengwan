import * as THREE from "three";
import { lookFlat } from "./motorMath";

export type GuideMode = "path" | "explore" | "timer" | "off";

export interface NavFootprint {
  x0: number;
  z0: number;
  x1: number;
  z1: number;
}

export interface GuideTick {
  showArrow: boolean;
  bearing: string;
  dist: number;
  chip: string;
  hideGo: boolean;
}

function unlit(color: number, opacity = 1): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: opacity < 1,
    opacity,
    depthWrite: false,
    depthTest: false,
    fog: false,
    toneMapped: false,
  });
}

/** Diegetic path + HUD bearing. Explore mode never paints a single finish line. */
export class Guide {
  mode: GuideMode = "off";
  readonly goal = new THREE.Vector3();
  hasGoal = false;
  walls: NavFootprint[] = [];
  idle = 0;
  private readonly ribbon = new THREE.Group();
  private readonly marks: THREE.Mesh[] = [];

  constructor() {
    this.ribbon.name = "guide-ribbon";
    for (let i = 0; i < 7; i += 1) {
      const mark = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.28, 3), unlit(0xffc14a, 0.72));
      mark.rotation.x = Math.PI / 2;
      this.marks.push(mark);
      this.ribbon.add(mark);
    }
    this.ribbon.visible = false;
  }

  attach(parent: THREE.Object3D): void {
    if (!this.ribbon.parent) parent.add(this.ribbon);
  }

  reset(): void {
    this.mode = "off";
    this.hasGoal = false;
    this.walls = [];
    this.idle = 0;
    this.ribbon.visible = false;
  }

  set(mode: GuideMode, goal?: THREE.Vector3 | null, walls?: NavFootprint[]): void {
    this.mode = mode;
    if (goal) {
      this.goal.copy(goal);
      this.hasGoal = true;
    } else {
      this.hasGoal = false;
    }
    if (walls) this.walls = walls;
  }

  setGoal(goal: THREE.Vector3 | null): void {
    if (goal) {
      this.goal.copy(goal);
      this.hasGoal = true;
    } else {
      this.hasGoal = false;
    }
  }

  tick(dt: number, player: THREE.Vector3, yaw: number, moving: boolean): GuideTick {
    const hideGo = this.mode === "explore" || this.mode === "off";
    if (this.mode === "off" || this.mode === "explore" || !this.hasGoal) {
      this.ribbon.visible = false;
      this.idle = 0;
      return { showArrow: false, bearing: "", dist: 0, chip: "", hideGo };
    }

    const dx = this.goal.x - player.x;
    const dz = this.goal.z - player.z;
    const dist = Math.hypot(dx, dz);
    const look = lookFlat(yaw);
    const to = dist > 0.001 ? { x: dx / dist, z: dz / dist } : { x: 0, z: 1 };
    const dot = look.x * to.x + look.z * to.z;
    const cross = look.x * to.z - look.z * to.x;
    const facingWrong = dot < 0.25;
    if (moving) this.idle = 0;
    else this.idle += dt;

    const lost = this.idle > 4 && facingWrong && dist > 3;
    this.ribbon.visible = dist > 2.4;
    if (this.ribbon.visible) {
      for (let i = 0; i < this.marks.length; i += 1) {
        const mark = this.marks[i];
        if (!mark) continue;
        const t = (i + 1) / (this.marks.length + 1);
        const step = Math.min(dist, 7.2) * t;
        mark.position.set(player.x + to.x * step, 0.08, player.z + to.z * step);
        mark.rotation.z = Math.atan2(to.x, to.z);
        mark.visible = step < dist - 0.8;
      }
    }

    const bearing = dist < 2.2 ? "已到" : facingWrong ? (cross > 0 ? "目標在左" : "目標在右") : "目標在前";
    const chip = `${bearing} · ${Math.round(dist)}m`;
    return {
      showArrow: lost && dist > 6,
      bearing,
      dist,
      chip,
      hideGo,
    };
  }
}
