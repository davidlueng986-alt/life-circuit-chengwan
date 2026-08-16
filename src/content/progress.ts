import type { CodexTerm, MonitoringModel, SceneId } from "./ids";
import { isWorkshopResume } from "./ids";
import type { RunRecord, SaveState } from "./saveTypes";

export function addCodexTerm(save: SaveState, term: CodexTerm): boolean {
  if (save.player.codex.terms.includes(term)) return false;
  save.player.codex.terms.push(term);
  return true;
}

export function markChipSeen(save: SaveState, term: CodexTerm): void {
  if (!save.player.codex.seenChips.includes(term)) save.player.codex.seenChips.push(term);
}

/** Leave a workshop scene. Never writes workshop.complete. */
export function leaveWorkshop(save: SaveState, scene: SceneId): void {
  if (!isWorkshopResume(scene)) return;
  save.workshop.resumeScene = scene;
}

export function workshopEntry(save: SaveState): SceneId {
  const resume = save.workshop.resumeScene;
  return resume && isWorkshopResume(resume) ? resume : "W-S00";
}

/** Harbor door: resume unfinished C1 from flags. Never requires workshop.complete. */
export function nextC1Scene(save: SaveState): SceneId {
  if (!save.c1.loadout && !save.player.tool.sealedProbe) return "C1-S00";
  if (!save.player.tool.sealedProbe) return "C1-S00";
  if (!save.c1.firstTraceRecovered) return "C1-S01";
  if (!save.c1.invalidRunExperienced) return "C1-S02";
  if (!save.c1.controlsRestored) return "C1-S03";
  if (!save.c1.sourceZoneMarked) return "C1-S04";
  if (
    save.c1.accessibilityOutput !== "shape_audio" ||
    save.c1.notificationRule !== "municipal_update_with_timestamp"
  ) {
    return "C1-S05";
  }
  if (!save.player.tool.modules.includes("latch") && !save.c1.publicMapPublished) return "C1-S06";
  if (!save.c1.publicMapPublished) return "C1-S07";
  if (!save.c1.complete) return "C1-S08";
  return "C1-S00";
}

export function pushRun(save: SaveState, record: RunRecord): void {
  save.evidence.runHistory.push({ ...record, retained: true });
  if (record.kind === "saturated" || (record.kind === "sun" && !record.readable)) {
    save.evidence.failedRunRetained = true;
  }
}

export function applyMonitoring(save: SaveState, model: MonitoringModel): void {
  save.c1.monitoringModel = model;
  save.world.harbor.monitoringModel = model;
}

export function playerLocale(save: SaveState): "zh-Hant" {
  void save;
  return "zh-Hant";
}
