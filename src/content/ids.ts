export const SAVE_KEY = "life-circuit-chengwan.save.v1";
export const SCHEMA_VERSION = 1;
export const LOCALE = "zh-Hant" as const;

export const SCENE_IDS = [
  "BOOT-S00",
  "HUB-S00",
  "P-S00",
  "P-S01",
  "P-S02",
  "P-S03",
  "P-S04",
  "P-S05",
  "P-S06",
  "W-S00",
  "W-S01",
  "W-S02",
  "W-S03",
  "W-S04",
  "W-S05",
  "C1-S00",
  "C1-S01",
  "C1-S02",
  "C1-S03",
  "C1-S04",
  "C1-S05",
  "C1-S06",
  "C1-S07",
  "C1-S08",
  "C2-STUB",
] as const;

export type SceneId = (typeof SCENE_IDS)[number];

export type ChapterId = "title" | "hub" | "prologue" | "workshop" | "c1" | "c2";

export type Loadout = "battery" | "crash_shell";
export type AccessibilityOutput = "color_only" | "shape_audio";
export type NotificationRule = "none" | "municipal_update_with_timestamp";
export type MonitoringModel = "fixed_station" | "portable_kits";

export type CodexTerm =
  | "cell"
  | "dnaGene"
  | "transcription"
  | "translation"
  | "input"
  | "regulator"
  | "promoter"
  | "reporter"
  | "output"
  | "controls"
  | "validRun"
  | "screening";

export type RunKind =
  | "field_trace"
  | "saturated"
  | "moon"
  | "sun"
  | "unknown"
  | "workshop_channel";

export type OutputBand = "low" | "mid" | "high" | "fluctuating" | "saturated";

export type LieClass =
  | "live"
  | "dead_shine"
  | "occluded"
  | "background"
  | "saturated"
  | "unreadable"
  | "city_light";

export type SignalKind =
  | "power_live"
  | "power_residual"
  | "emergency_pulse"
  | "env_flow"
  | "probe_bearing"
  | "device_link"
  | "self_test"
  | "city_light"
  | "leftover_residue"
  | "workshop_trace";

export const PII_KEY_PATTERN =
  /(name|school|health|photo|email|voice|geo|gps|phone|student)/i;

export function isSceneId(value: string): value is SceneId {
  return (SCENE_IDS as readonly string[]).includes(value);
}

export const CODEX_TERMS: readonly CodexTerm[] = [
  "cell",
  "dnaGene",
  "transcription",
  "translation",
  "input",
  "regulator",
  "promoter",
  "reporter",
  "output",
  "controls",
  "validRun",
  "screening",
] as const;

export const SUBTITLE_SCALES = [1, 1.25, 1.5, 2] as const;
export type SubtitleScale = (typeof SUBTITLE_SCALES)[number];

export function chapterOf(id: SceneId): ChapterId {
  if (id === "BOOT-S00") return "title";
  if (id === "HUB-S00") return "hub";
  if (id.startsWith("P-")) return "prologue";
  if (id.startsWith("W-")) return "workshop";
  if (id.startsWith("C1-")) return "c1";
  return "c2";
}

export function isWorkshopScene(id: SceneId): boolean {
  return chapterOf(id) === "workshop";
}

export function isCrisisScene(id: SceneId): boolean {
  return id === "P-S00" || id === "P-S01" || id === "P-S02" || id === "P-S03" || id === "P-S04" || id === "P-S05";
}

export function isWorkshopResume(id: string): id is SceneId {
  return isSceneId(id) && isWorkshopScene(id);
}

export function isCodexTerm(value: string): value is CodexTerm {
  return (CODEX_TERMS as readonly string[]).includes(value);
}

export function snapSubtitleScale(value: number): SubtitleScale {
  let best: SubtitleScale = 1;
  let dist = Infinity;
  for (const scale of SUBTITLE_SCALES) {
    const next = Math.abs(scale - value);
    if (next < dist) {
      best = scale;
      dist = next;
    }
  }
  return best;
}
