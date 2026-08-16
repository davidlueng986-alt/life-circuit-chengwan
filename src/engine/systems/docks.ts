import type { OutputBand } from "../../content/ids";
import type { RunRecord } from "../../content/saveTypes";
import type { SceneId } from "../../content/ids";
import type { Loadout } from "../../content/ids";

export interface DockState {
  output: OutputBand;
  occupied: boolean;
}

export class DockSystem {
  moon: DockState = { output: "low", occupied: false };
  sun: DockState = { output: "low", occupied: false };
  unknown: DockState = { output: "low", occupied: false };
  portsOk = false;
  sealed = true;
  saturated = false;

  reset(sunBroken: boolean): void {
    this.moon = { output: "low", occupied: false };
    this.sun = { output: sunBroken ? "low" : "high", occupied: false };
    this.unknown = { output: "low", occupied: false };
    this.portsOk = !sunBroken;
    this.sealed = true;
    this.saturated = false;
  }

  get unknownOpen(): boolean {
    return (
      this.moon.output === "low" &&
      this.sun.output === "high" &&
      this.sealed &&
      this.portsOk &&
      !this.saturated
    );
  }

  repairSun(): void {
    this.portsOk = true;
    this.sun.output = "high";
  }

  record(scene: SceneId, kind: RunRecord["kind"], loadout: Loadout | null): RunRecord {
    const output = kind === "moon" ? this.moon.output : kind === "sun" ? this.sun.output : this.unknown.output;
    return {
      id: `${scene}-${kind}-${Date.now()}`,
      scene,
      at: new Date().toISOString(),
      kind,
      outputBand: output,
      readable: this.unknownOpen || kind !== "unknown",
      loadout,
      retained: true,
    };
  }
}
