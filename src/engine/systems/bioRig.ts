import * as THREE from "three";
import type { AccessibilityOutput, Loadout } from "../../content/ids";
import type { SaveState } from "../../content/saveTypes";
import type { ToolVoice } from "../audio";
import type { CameraRig } from "../cameraRig";
import type { PlayerMotor } from "../player";

export type RigSlot = "sense" | "regulate" | "output";
export type OutputBand = "low" | "mid" | "high" | "fluctuating" | "saturated";

export class BioRig {
  owned = false;
  loadout: Loadout | null = null;
  saturated = false;
  powered = true;
  selfTestBlink = false;
  accessibility: AccessibilityOutput = "color_only";
  latchKept = false;
  latchSeated = false;
  carried = false;
  headingTarget: THREE.Vector3 | null = null;
  triangleFill = 0;
  outputBand: OutputBand = "low";
  gateOpen = false;
  senseBand: OutputBand = "low";
  reporterShape: "triangle" | "flag" | "lamp" = "triangle";
  lastChirp = 0;
  time = 0;
  wallPowerUntil = 0;
  testsTried = { turn: false, leave: false, relay: false };

  private voice: ToolVoice | null = null;
  private group: THREE.Group | null = null;
  private sense: THREE.Mesh | null = null;
  private gate: THREE.Mesh | null = null;
  private output: THREE.Mesh | null = null;
  private flag: THREE.Mesh | null = null;
  private selfIcon: THREE.Mesh | null = null;
  private shell: THREE.Mesh | null = null;
  private stand: THREE.Vector3 | null = null;
  private readonly facing = new THREE.Vector3(0, 0, -1);
  private readonly tmp = new THREE.Vector3();
  private lastFillBucket = -1;

  bindAudio(voice: ToolVoice): void {
    this.voice = voice;
  }

  attach(root: THREE.Group): void {
    this.detach();
    const group = new THREE.Group();
    group.name = "bio-rig";
    group.visible = false;

    const shell = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.18, 0.5),
      new THREE.MeshLambertMaterial({ color: 0x2a3338, emissive: 0x0a1012, emissiveIntensity: 0.2 }),
    );
    shell.position.set(0, 0, 0);
    group.add(shell);

    const sense = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.12, 0.08),
      new THREE.MeshLambertMaterial({ color: 0x3d5c58, emissive: 0x1b3a36, emissiveIntensity: 0.4 }),
    );
    sense.position.set(0, 0.02, -0.22);
    group.add(sense);

    const gate = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.14, 0.12),
      new THREE.MeshLambertMaterial({ color: 0x6a5340, emissive: 0x2a2014, emissiveIntensity: 0.3 }),
    );
    gate.position.set(0, 0.02, 0);
    group.add(gate);

    const output = new THREE.Mesh(
      new THREE.ConeGeometry(0.09, 0.14, 3),
      new THREE.MeshLambertMaterial({ color: 0xc9861a, emissive: 0xef6a1a, emissiveIntensity: 0.35 }),
    );
    output.position.set(0, 0.04, 0.2);
    output.rotation.x = Math.PI;
    group.add(output);

    const flag = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.16, 0.1),
      new THREE.MeshLambertMaterial({ color: 0x7ec8c3, emissive: 0x3a8884, emissiveIntensity: 0.5 }),
    );
    flag.position.set(0.12, 0.08, 0.2);
    flag.visible = false;
    group.add(flag);

    const selfIcon = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.045, 0),
      new THREE.MeshBasicMaterial({ color: 0xef6a1a }),
    );
    selfIcon.position.set(0.14, 0.1, -0.04);
    selfIcon.visible = false;
    group.add(selfIcon);

    root.add(group);
    this.group = group;
    this.shell = shell;
    this.sense = sense;
    this.gate = gate;
    this.output = output;
    this.flag = flag;
    this.selfIcon = selfIcon;
  }

  detach(): void {
    if (this.group?.parent) this.group.parent.remove(this.group);
    this.group = null;
    this.shell = null;
    this.sense = null;
    this.gate = null;
    this.output = null;
    this.flag = null;
    this.selfIcon = null;
  }

  reset(owned: boolean, loadout: Loadout | null): void {
    this.owned = owned;
    this.loadout = loadout;
    this.saturated = false;
    this.powered = true;
    this.selfTestBlink = false;
    this.accessibility = "color_only";
    this.latchKept = false;
    this.latchSeated = false;
    this.carried = owned;
    this.headingTarget = null;
    this.triangleFill = 0;
    this.outputBand = "low";
    this.gateOpen = false;
    this.senseBand = "low";
    this.reporterShape = "triangle";
    this.lastChirp = 0;
    this.time = 0;
    this.wallPowerUntil = 0;
    this.testsTried = { turn: false, leave: false, relay: false };
    this.lastFillBucket = -1;
    this.stand = null;
    if (this.group) this.group.visible = owned;
  }

  grantPickup(loadout: Loadout | null): void {
    this.owned = true;
    this.loadout = loadout;
    this.carried = true;
    this.powered = true;
    if (this.group) this.group.visible = true;
  }

  placeAt(position: THREE.Vector3): void {
    this.stand = position.clone();
    this.carried = false;
    if (this.group) {
      this.group.visible = this.owned;
      this.group.position.copy(position);
    }
  }

  carry(): void {
    this.carried = true;
    this.stand = null;
    if (this.group) this.group.visible = this.owned;
  }

  setHeadingTarget(dir: THREE.Vector3 | null): void {
    this.headingTarget = dir ? dir.clone().setY(0).normalize() : null;
  }

  swapReporter(shape: "triangle" | "flag" | "lamp"): void {
    this.reporterShape = shape;
    if (this.flag) this.flag.visible = shape === "flag";
  }

  shock(): void {
    if (this.loadout === "crash_shell") return;
    this.powered = false;
    this.wallPowerUntil = this.time + 10;
  }

  plugWall(): void {
    this.powered = true;
    this.wallPowerUntil = 0;
  }

  seatLatch(): void {
    this.latchSeated = true;
    this.latchKept = true;
  }

  fieldReadable(save: SaveState): boolean {
    if (!this.powered) return false;
    if (this.saturated) return false;
    const id = save.meta.currentScene;
    if (id.startsWith("C1-") && save.c1.invalidRunExperienced && !save.c1.controlsRestored) {
      return false;
    }
    return true;
  }

  reporterReady(): boolean {
    return this.accessibility === "shape_audio";
  }

  update(dt: number, player: PlayerMotor, camera: CameraRig, save: SaveState): void {
    this.time += dt;
    if (!this.owned || !this.group) return;
    this.group.visible = true;

    if (!this.powered && this.wallPowerUntil > 0 && this.time >= this.wallPowerUntil) {
      this.powered = true;
    }

    camera.lookDir3(this.facing);
    this.facing.y = 0;
    if (this.facing.lengthSq() < 1e-4) this.facing.set(0, 0, -1);
    else this.facing.normalize();

    if (this.carried) {
      const side = this.tmp.set(Math.cos(camera.yaw), 0, -Math.sin(camera.yaw)).multiplyScalar(0.32);
      this.group.position.copy(player.position).add(side);
      this.group.position.y += 0.95;
      this.group.rotation.set(0, camera.yaw, 0);
    } else if (this.stand) {
      this.group.position.copy(this.stand);
    }

    this.tickSense(save);
    this.tickVisuals();
  }

  private tickSense(save: SaveState): void {
    if (!this.powered) {
      this.triangleFill = 0;
      this.outputBand = "low";
      this.gateOpen = false;
      return;
    }
    if (this.saturated) {
      this.triangleFill = 1;
      this.outputBand = "saturated";
      this.senseBand = "saturated";
      this.gateOpen = true;
      return;
    }

    if (this.headingTarget) {
      const agree = Math.max(0, this.facing.dot(this.headingTarget));
      this.triangleFill = this.fieldReadable(save) ? agree * agree : 0.15;
      this.senseBand = this.triangleFill > 0.66 ? "high" : this.triangleFill > 0.3 ? "mid" : "low";
      this.gateOpen = this.triangleFill > 0.22;
      this.outputBand = this.gateOpen ? (this.triangleFill > 0.75 ? "high" : "mid") : "low";
    } else {
      this.triangleFill = this.gateOpen ? 0.55 : 0.08;
      this.senseBand = this.gateOpen ? "mid" : "low";
      this.outputBand = this.gateOpen ? "mid" : "low";
    }

    if (this.accessibility === "shape_audio") {
      const bucket = Math.floor(this.triangleFill * 4);
      if (bucket !== this.lastFillBucket && this.time - this.lastChirp > 0.45) {
        this.voice?.chirp();
        this.lastChirp = this.time;
        this.lastFillBucket = bucket;
      }
    }
  }

  private tickVisuals(): void {
    if (this.output) {
      const fill = this.powered ? this.triangleFill : 0.05;
      this.output.scale.set(0.7 + fill * 0.6, 0.45 + fill * 1.4, 0.7 + fill * 0.6);
      const mat = this.output.material;
      if (mat instanceof THREE.MeshLambertMaterial) {
        mat.emissiveIntensity = 0.2 + fill * 0.9;
      }
    }
    if (this.gate) {
      this.gate.rotation.y = this.gateOpen ? 0.7 : 0;
    }
    if (this.sense) {
      const mat = this.sense.material;
      if (mat instanceof THREE.MeshLambertMaterial) {
        mat.emissiveIntensity = this.senseBand === "high" || this.senseBand === "saturated" ? 0.9 : 0.35;
      }
    }
    if (this.selfIcon) {
      this.selfIcon.visible = this.selfTestBlink;
      this.selfIcon.rotation.y = this.time * 3;
      const mat = this.selfIcon.material;
      if (mat instanceof THREE.MeshBasicMaterial) {
        mat.opacity = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(this.time * 8));
        mat.transparent = true;
      }
    }
    if (this.flag) this.flag.visible = this.reporterShape === "flag";
    if (this.shell) {
      const mat = this.shell.material;
      if (mat instanceof THREE.MeshLambertMaterial) {
        mat.color.setHex(this.powered ? 0x2a3338 : 0x16181a);
      }
    }
  }

  slotWorldPos(slot: RigSlot, out: THREE.Vector3): THREE.Vector3 {
    const src = slot === "sense" ? this.sense : slot === "regulate" ? this.gate : this.output;
    if (src) return src.getWorldPosition(out);
    return out.copy(this.group?.position ?? new THREE.Vector3());
  }
}
