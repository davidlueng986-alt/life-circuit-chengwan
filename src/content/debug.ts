import { SCENE_DEFS } from "./catalog";
import { SCENE_IDS, type OutputBand, type RunKind, type SceneId } from "./ids";
import { pushRun } from "./progress";
import type { SaveState } from "./saveTypes";

/** `?debug=1` only. Never a default player bypass. */
export function isDebugMode(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("debug") === "1";
}

export const DEBUG_JUMPS: { id: SceneId; label: string }[] = SCENE_IDS.map((id) => ({
  id,
  label: `${id} ${SCENE_DEFS[id].name}`,
}));

const C1_SEQ: SceneId[] = [
  "C1-S00",
  "C1-S01",
  "C1-S02",
  "C1-S03",
  "C1-S04",
  "C1-S05",
  "C1-S06",
  "C1-S07",
  "C1-S08",
];

/** Grant the minimum flags so a debug jump is playable. Never writes `workshop.complete`. */
export function primeSaveForScene(save: SaveState, id: SceneId): void {
  save.meta.hasSave = true;
  save.meta.currentScene = id === "BOOT-S00" ? "BOOT-S00" : id;

  if (id === "BOOT-S00") return;

  if (id.startsWith("P-")) {
    if (id === "P-S03" || id === "P-S04" || id === "P-S05" || id === "P-S06") {
      save.player.tool.flowLens = true;
    }
    if (id === "P-S04" || id === "P-S05" || id === "P-S06") {
      save.player.tool.tether = true;
    }
    return;
  }

  save.prologueComplete = true;
  save.hub.unlocked = true;
  save.workshop.available = true;
  save.player.tool.flowLens = true;
  save.player.tool.tether = true;
  save.relationships.characterMemory.xiaocen = { rescued: true };

  if (id === "HUB-S00" || id.startsWith("W-")) return;

  primeC1Through(save, id === "C2-STUB" ? "C1-S08" : id);
  if (id === "C2-STUB") save.c1.complete = true;
}

function primeC1Through(save: SaveState, id: SceneId): void {
  const idx = C1_SEQ.indexOf(id);
  if (idx < 0) return;

  if (idx >= 1) {
    if (!save.c1.loadout) save.c1.loadout = "battery";
    save.player.tool.sealedProbe = true;
  }
  if (idx >= 2) {
    save.c1.firstTraceRecovered = true;
    keepRun(save, "C1-S01", "field_trace", "mid", true);
  }
  if (idx >= 3) {
    save.c1.invalidRunExperienced = true;
    save.evidence.failedRunRetained = true;
    keepRun(save, "C1-S02", "saturated", "saturated", false);
  }
  if (idx >= 4) {
    save.c1.controlsRestored = true;
    save.evidence.controlRunBeforeClaim = true;
    keepRun(save, "C1-S03", "moon", "low", true);
    keepRun(save, "C1-S03", "sun", "high", true);
    keepRun(save, "C1-S03", "unknown", "fluctuating", true);
  }
  if (idx >= 5) save.c1.sourceZoneMarked = true;
  if (idx >= 6) {
    save.c1.accessibilityOutput = "shape_audio";
    save.c1.notificationRule = "municipal_update_with_timestamp";
    save.evidence.userFeedbackChangedPrototype = true;
    save.relationships.characterMemory.chen = { acceptedTrial: true };
  }
  if (idx >= 7 && !save.player.tool.modules.includes("latch")) {
    save.player.tool.modules.push("latch");
  }
  if (idx >= 8) {
    save.c1.publicMapPublished = true;
    if (!save.c1.unresolved.includes("confirmation_result")) {
      save.c1.unresolved.push("confirmation_result", "long_term_monitoring");
    }
    save.evidence.unresolved = [...save.c1.unresolved];
    save.evidence.claimMatchesObservedRange = true;
  }
}

function keepRun(save: SaveState, scene: SceneId, kind: RunKind, outputBand: OutputBand, readable: boolean): void {
  if (save.evidence.runHistory.some((run) => run.scene === scene && run.kind === kind)) return;
  pushRun(save, {
    id: `${scene}-${kind}-kept`,
    scene,
    at: new Date().toISOString(),
    kind,
    outputBand,
    readable,
    loadout: save.c1.loadout,
    retained: true,
  });
}
