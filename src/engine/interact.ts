import * as THREE from "three";
import { formatPrompt, interactScore, lookFlat, nearbyScore } from "./motorMath";
import type { PlayerMotor } from "./player";

export interface Interactable {
  id: string;
  prompt: string;
  position: THREE.Vector3;
  radius: number;
  enabled: boolean;
  onUse: () => void;
  holdSeconds?: number;
  bind?: string;
}

export interface FocusMeta {
  prompt: string;
  bind: string;
  hold: boolean;
  hold01: number;
  index: number;
  total: number;
}

export class InteractSystem {
  items: Interactable[] = [];
  focused: Interactable | null = null;
  candidates: Interactable[] = [];
  nearby: Interactable[] = [];
  hold01 = 0;
  private cycle = 0;
  private holdT = 0;
  private usedHold = false;

  reset(): void {
    this.items = [];
    this.focused = null;
    this.candidates = [];
    this.nearby = [];
    this.cycle = 0;
    this.holdT = 0;
    this.hold01 = 0;
    this.usedHold = false;
  }

  add(item: Interactable): void {
    this.items.push(item);
  }

  update(player: PlayerMotor, lookYaw: number, cycleDelta = 0): Interactable | null {
    const look = lookFlat(lookYaw);
    const ranked: Array<{ item: Interactable; score: number }> = [];
    const near: Array<{ item: Interactable; dist: number }> = [];
    for (const item of this.items) {
      if (!item.enabled) continue;
      const nearScore = nearbyScore(player.position.x, player.position.z, item.position.x, item.position.z, item.radius);
      if (nearScore !== null) {
        near.push({
          item,
          dist: Math.hypot(item.position.x - player.position.x, item.position.z - player.position.z),
        });
      }
      const score = interactScore(
        player.position.x,
        player.position.z,
        look.x,
        look.z,
        item.position.x,
        item.position.z,
        item.radius,
      );
      if (score === null) continue;
      ranked.push({ item, score });
    }
    near.sort((a, b) => a.dist - b.dist);
    this.nearby = near.map((entry) => entry.item);
    ranked.sort((a, b) => b.score - a.score);
    this.candidates = ranked.length > 0 ? ranked.map((entry) => entry.item) : this.nearby.slice(0, 4);

    if (this.candidates.length === 0) {
      this.focused = null;
      this.cycle = 0;
      this.holdT = 0;
      this.hold01 = 0;
      return null;
    }

    if (cycleDelta !== 0) {
      this.cycle = (this.cycle + cycleDelta) % this.candidates.length;
      if (this.cycle < 0) this.cycle += this.candidates.length;
      this.holdT = 0;
      this.usedHold = false;
    }
    if (this.cycle >= this.candidates.length) this.cycle = 0;
    const next = this.candidates[this.cycle] ?? this.candidates[0] ?? null;
    if (next !== this.focused) {
      this.holdT = 0;
      this.usedHold = false;
    }
    this.focused = next;
    return this.focused;
  }

  pollUse(dt: number, pressed: boolean, held: boolean): Interactable | null {
    const item = this.focused;
    if (!item) return null;
    const need = item.holdSeconds ?? 0;
    if (need > 0) {
      if (held) {
        this.holdT += dt;
        this.hold01 = Math.min(1, this.holdT / need);
        if (this.holdT >= need && !this.usedHold) {
          this.usedHold = true;
          return item;
        }
      } else {
        this.holdT = 0;
        this.hold01 = 0;
        this.usedHold = false;
      }
      return null;
    }
    this.hold01 = 0;
    return pressed ? item : null;
  }

  promptText(): string | null {
    const item = this.focused;
    if (!item) return null;
    return formatPrompt(item.prompt, item.bind ?? "E", {
      hold: (item.holdSeconds ?? 0) > 0,
      index: this.cycle + 1,
      total: this.candidates.length,
    });
  }

  promptMeta(): FocusMeta | null {
    const item = this.focused;
    if (!item) return null;
    return {
      prompt: item.prompt,
      bind: item.bind ?? "E",
      hold: (item.holdSeconds ?? 0) > 0,
      hold01: this.hold01,
      index: this.cycle + 1,
      total: this.candidates.length,
    };
  }
}
