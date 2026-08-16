import type { Loadout, MonitoringModel, OutputBand, RunKind, SceneId } from "../../src/content/ids";
import { applyMonitoring, pushRun } from "../../src/content/progress";
import type { RunRecord, SaveState } from "../../src/content/saveTypes";
import { C1_UNRESOLVED } from "./ids";

export function c1Run(
  scene: SceneId,
  kind: RunKind,
  outputBand: OutputBand,
  readable: boolean,
  loadout: Loadout | null,
  tag = "",
): RunRecord {
  const suffix = tag ? `-${tag}` : "";
  return {
    id: `${scene}-${kind}${suffix}-${Date.now()}`,
    scene,
    at: new Date().toISOString(),
    kind,
    outputBand,
    readable,
    loadout,
    retained: true,
  };
}

export function keepSaturatedRun(save: SaveState): void {
  pushRun(save, c1Run("C1-S02", "saturated", "saturated", false, save.c1.loadout, "kept"));
  save.evidence.failedRunRetained = true;
}

export function keepFieldTrace(save: SaveState, tight: boolean, confirmSeconds: number): void {
  pushRun(
    save,
    c1Run("C1-S04", "field_trace", tight ? "high" : "mid", true, save.c1.loadout, tight ? `tight-${confirmSeconds}` : `wide-${confirmSeconds}`),
  );
}

export function chooseMonitoring(save: SaveState, model: MonitoringModel): void {
  applyMonitoring(save, model);
}

export function zoneConfirmSeconds(save: SaveState): number {
  const hit = [...save.evidence.runHistory].reverse().find((run) => run.scene === "C1-S04" && run.kind === "field_trace");
  if (!hit) return 90;
  if (hit.id.includes("tight")) return 40;
  return 90;
}

export function hasFailedRun(save: SaveState): boolean {
  return (
    save.evidence.failedRunRetained ||
    save.c1.invalidRunExperienced ||
    save.evidence.runHistory.some((run) => run.kind === "saturated" || (run.kind === "sun" && !run.readable))
  );
}

export function stampUnresolved(save: SaveState): void {
  for (const key of C1_UNRESOLVED) {
    if (!save.c1.unresolved.includes(key)) save.c1.unresolved.push(key);
    if (!save.evidence.unresolved.includes(key)) save.evidence.unresolved.push(key);
  }
}
