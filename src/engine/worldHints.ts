import * as THREE from "three";
import type { Interactable } from "./interact";
import { cachedLabelMap } from "./materials";

function canvasLabel(title: string, sub = ""): THREE.Sprite {
  const key = `${title}\n${sub}`;
  const map = cachedLabelMap(key, () => {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = sub ? 200 : 136;
  const g = canvas.getContext("2d");
  if (g) {
    g.clearRect(0, 0, canvas.width, canvas.height);
    g.fillStyle = "rgba(6, 14, 20, 0.94)";
    roundRect(g, 10, 10, canvas.width - 20, canvas.height - 20, 22);
    g.fill();
    g.strokeStyle = "rgba(255, 220, 110, 1)";
    g.lineWidth = 10;
    g.stroke();
    g.fillStyle = "#fff6d8";
    g.font = "bold 58px 'Noto Sans TC', 'Microsoft JhengHei', sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(title, canvas.width / 2, sub ? 74 : canvas.height / 2);
    if (sub) {
      g.fillStyle = "#9fe8e0";
      g.font = "34px 'Noto Sans TC', 'Microsoft JhengHei', sans-serif";
      g.fillText(sub, canvas.width / 2, 140);
    }
  }
    const built = new THREE.CanvasTexture(canvas);
    built.colorSpace = THREE.SRGBColorSpace;
    return built;
  });
  const aspect = (map.image instanceof HTMLCanvasElement ? map.image.height : 136) / (map.image instanceof HTMLCanvasElement ? map.image.width : 640);
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      fog: false,
      toneMapped: false,
      sizeAttenuation: true,
    }),
  );
  sprite.scale.set(2.7, 2.7 * aspect, 1);
  sprite.center.set(0.5, 0);
  sprite.renderOrder = 40;
  sprite.userData["aspect"] = aspect;
  return sprite;
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

export function makeWorldLabel(title: string, sub = ""): THREE.Sprite {
  const sprite = canvasLabel(title, sub);
  sprite.name = "world-label";
  return sprite;
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
    side: THREE.DoubleSide,
  });
}

interface HintPool {
  group: THREE.Group;
  ring: THREE.Mesh;
  disc: THREE.Mesh;
  pin: THREE.Mesh;
  label: THREE.Sprite;
  lastTitle: string;
}

export class WorldHints {
  readonly root = new THREE.Group();
  private readonly pool: HintPool[] = [];
  private readonly speaker = new THREE.Group();
  private readonly objective = new THREE.Group();
  private readonly arrow = new THREE.Mesh(
    new THREE.ConeGeometry(0.18, 0.46, 3),
    unlit(0xffc14a, 0.95),
  );
  private speakerLabel: THREE.Sprite | null = null;
  private scanning = false;

  constructor() {
    this.root.name = "world-hints";
    this.speaker.name = "speaker-hint";
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.09, 8, 24), unlit(0xffe2a0));
    halo.rotation.x = -Math.PI / 2;
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.8, 8), unlit(0xffe2a0, 0.7));
    column.position.y = 1.9;
    this.speaker.add(halo, column);
    this.speaker.visible = false;
    this.root.add(this.speaker);

    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 8.4, 8), unlit(0xff7a28, 0.58));
    beam.position.y = 4.2;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), unlit(0xff7a28));
    head.position.y = 8.4;
    this.objective.add(beam, head);
    this.objective.name = "objective-beam";
    this.objective.visible = false;
    this.root.add(this.objective);
    this.arrow.visible = false;

    this.arrow.rotation.x = Math.PI / 2;
    this.arrow.name = "objective-arrow";
    this.root.add(this.arrow);
  }

  setScan(on: boolean): void {
    this.scanning = on;
  }

  reset(): void {
    for (const item of this.pool) this.root.remove(item.group);
    this.pool.length = 0;
    this.speaker.visible = false;
    this.objective.visible = false;
    this.arrow.visible = false;
    if (this.speakerLabel) {
      this.speaker.remove(this.speakerLabel);
      this.speakerLabel = null;
    }
  }

  attach(parent: THREE.Object3D, title: string, sub = "", height = 1.55): THREE.Sprite {
    const sprite = makeWorldLabel(title, sub);
    sprite.position.y = height;
    parent.add(sprite);
    return sprite;
  }

  setSpeaker(pos: THREE.Vector3 | null, name: string, radio: boolean): void {
    if (!pos) {
      this.speaker.visible = false;
      return;
    }
    this.speaker.visible = true;
    this.speaker.position.copy(pos);
    this.speaker.position.y = Math.max(0.05, pos.y);
    if (this.speakerLabel) this.speaker.remove(this.speakerLabel);
    this.speakerLabel = makeWorldLabel(name, radio ? "無線電從這裡" : "正在說話");
    this.speakerLabel.position.y = 2.15;
    this.speaker.add(this.speakerLabel);
  }

  setObjective(pos: THREE.Vector3 | null): void {
    this.objective.visible = false;
    void pos;
  }

  sync(
    items: Interactable[],
    focused: Interactable | null,
    time: number,
    extras?: { player?: THREE.Vector3; objective?: THREE.Vector3 | null },
  ): void {
    while (this.pool.length < items.length) this.pool.push(this.makeHint());
    for (let i = 0; i < this.pool.length; i += 1) {
      const slot = this.pool[i];
      const item = items[i];
      if (!slot) continue;
      if (!item || !item.enabled) {
        slot.group.visible = false;
        continue;
      }
      const dist = extras?.player
        ? Math.hypot(extras.player.x - item.position.x, extras.player.z - item.position.z)
        : 3;
      const hot = focused?.id === item.id;
      if (!hot) {
        slot.group.visible = false;
        continue;
      }
      slot.group.visible = true;
      slot.group.position.copy(item.position);
      slot.group.position.y = 0.04;
      const pulse = 1 + Math.sin(time * 5.2) * 0.16;
      slot.group.scale.setScalar(1.12 * pulse);
      const ringMat = slot.ring.material;
      if (ringMat instanceof THREE.MeshBasicMaterial) {
        ringMat.color.setHex(hot || this.scanning ? 0x8fd4cf : 0xffc14a);
        ringMat.opacity = hot ? 1 : 0.92;
      }
      const discMat = slot.disc.material;
      if (discMat instanceof THREE.MeshBasicMaterial) discMat.opacity = hot ? 0.52 : this.scanning ? 0.4 : 0.32;
      if (slot.lastTitle !== item.prompt) {
        this.retitle(slot, item.prompt);
      }
      const width = THREE.MathUtils.clamp(1.6 + dist * 0.22, 2.1, 3.2);
      const aspect = Number(slot.label.userData["aspect"] ?? 0.3);
      slot.label.scale.set(width, width * aspect, 1);
    }

    const goal = extras?.objective ?? focused?.position ?? null;
    const player = extras?.player ?? null;
    if (goal && player) {
      this.arrow.visible = true;
      const dx = goal.x - player.x;
      const dz = goal.z - player.z;
      const len = Math.hypot(dx, dz);
      const step = Math.min(2.4, Math.max(1.1, len * 0.28));
      if (len > 6) {
        this.arrow.position.set(player.x + (dx / len) * step, 0.14, player.z + (dz / len) * step);
        this.arrow.rotation.z = Math.atan2(dx, dz);
      } else {
        this.arrow.visible = false;
      }
    } else {
      this.arrow.visible = false;
    }
    this.setObjective(goal);
  }

  private makeHint(): HintPool {
    const group = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.08, 8, 32), unlit(0xffc14a));
    ring.rotation.x = -Math.PI / 2;
    const disc = new THREE.Mesh(new THREE.CircleGeometry(0.88, 26), unlit(0xffc14a, 0.34));
    disc.rotation.x = -Math.PI / 2;
    const pin = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.42, 8), unlit(0x8fd4cf));
    pin.position.y = 1.35;
    pin.rotation.x = Math.PI;
    const label = makeWorldLabel("互動", "E 靠近");
    label.position.y = 1.62;
    group.add(ring, disc, pin, label);
    this.root.add(group);
    return { group, ring, disc, pin, label, lastTitle: "互動" };
  }

  private retitle(slot: HintPool, title: string): void {
    slot.lastTitle = title;
    slot.group.remove(slot.label);
    const next = makeWorldLabel(title, "E 互動");
    next.position.y = 1.62;
    slot.label = next;
    slot.group.add(next);
  }
}
