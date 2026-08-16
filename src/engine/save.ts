import {
  isCodexTerm,
  isSceneId,
  isWorkshopResume,
  PII_KEY_PATTERN,
  SAVE_KEY,
  SCHEMA_VERSION,
  snapSubtitleScale,
  type CodexTerm,
} from "../content/ids";
import { emptySave, type LoadResult, type SaveState, type SettingsState } from "../content/saveTypes";
import type { RunRecord } from "../content/saveTypes";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stripPii(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripPii);
  if (!isRecord(value)) return value;
  const next: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    if (PII_KEY_PATTERN.test(key)) continue;
    next[key] = stripPii(child);
  }
  return next;
}

export function loadSave(): LoadResult {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return { save: emptySave(), status: "empty" };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return { save: emptySave(), status: "corrupt" };
    if ("preComplete" in parsed || "preSkipped" in parsed) {
      return { save: emptySave(), status: "corrupt" };
    }
    const cleaned = stripPii(parsed);
    if (!isRecord(cleaned)) return { save: emptySave(), status: "corrupt" };
    const merged = mergeSave(emptySave(), cleaned);
    if (merged.meta.currentScene !== "BOOT-S00") merged.meta.hasSave = true;
    if (parsed["schemaVersion"] !== SCHEMA_VERSION) {
      if (merged.meta.hasSave) return { save: merged, status: "ok" };
      return { save: emptySave(), status: "corrupt" };
    }
    return { save: merged, status: "ok" };
  } catch {
    return { save: emptySave(), status: "corrupt" };
  }
}

export function writeSave(save: SaveState): void {
  save.savedAt = new Date().toISOString();
  save.schemaVersion = 1;
  save.locale = save.locale === "both" ? "both" : "zh-Hant";
  if (save.meta.currentScene !== "BOOT-S00") save.meta.hasSave = true;
  const payload = stripPii(save);
  localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
}

export function applySettings(save: SaveState, next: Partial<SettingsState>): void {
  save.settings = { ...save.settings, ...next };
  save.settings.subtitleScale = snapSubtitleScale(save.settings.subtitleScale);
  save.settings.fov = Math.min(90, Math.max(50, save.settings.fov));
  save.settings.textScale = Math.min(2, Math.max(1, save.settings.textScale));
}

function mergeSave(base: SaveState, raw: Record<string, unknown>): SaveState {
  const meta = isRecord(raw["meta"]) ? raw["meta"] : {};
  const settings = isRecord(raw["settings"]) ? raw["settings"] : {};
  const player = isRecord(raw["player"]) ? raw["player"] : {};
  const tool = isRecord(player["tool"]) ? player["tool"] : {};
  const codex = isRecord(player["codex"]) ? player["codex"] : {};
  const c1 = isRecord(raw["c1"]) ? raw["c1"] : {};
  const workshop = isRecord(raw["workshop"]) ? raw["workshop"] : {};
  const hub = isRecord(raw["hub"]) ? raw["hub"] : {};
  const world = isRecord(raw["world"]) ? raw["world"] : {};
  const harbor = isRecord(world["harbor"]) ? world["harbor"] : {};
  const relationships = isRecord(raw["relationships"]) ? raw["relationships"] : {};
  const memory = isRecord(relationships["characterMemory"]) ? relationships["characterMemory"] : {};
  const xiaocen = isRecord(memory["xiaocen"]) ? memory["xiaocen"] : {};
  const chen = isRecord(memory["chen"]) ? memory["chen"] : {};
  const evidence = isRecord(raw["evidence"]) ? raw["evidence"] : {};
  const current = typeof meta["currentScene"] === "string" && isSceneId(meta["currentScene"])
    ? meta["currentScene"]
    : base.meta.currentScene;
  const resume = typeof workshop["resumeScene"] === "string" && isWorkshopResume(workshop["resumeScene"])
    ? workshop["resumeScene"]
    : null;
  const monitoring =
    c1["monitoringModel"] === "fixed_station" || c1["monitoringModel"] === "portable_kits"
      ? c1["monitoringModel"]
      : null;
  const harborModel =
    harbor["monitoringModel"] === "fixed_station" || harbor["monitoringModel"] === "portable_kits"
      ? harbor["monitoringModel"]
      : monitoring;

  return {
    ...base,
    savedAt: typeof raw["savedAt"] === "string" ? raw["savedAt"] : base.savedAt,
    locale: raw["locale"] === "both" ? "both" : "zh-Hant",
    meta: {
      hasSave: meta["hasSave"] === true,
      currentScene: current,
    },
    settings: {
      relaxedTimer: settings["relaxedTimer"] !== false,
      reducedMotion: settings["reducedMotion"] === true,
      subtitleScale: snapSubtitleScale(num(settings["subtitleScale"], base.settings.subtitleScale)),
      fov: num(settings["fov"], base.settings.fov),
      vibration: settings["vibration"] !== false,
      holdAlternatives: settings["holdAlternatives"] !== false,
      textScale: num(settings["textScale"], 1),
      highContrast: settings["highContrast"] === true,
      interactionList: settings["interactionList"] !== false,
    },
    player: {
      tool: {
        flowLens: tool["flowLens"] === true,
        tether: tool["tether"] === true,
        sealedProbe: tool["sealedProbe"] === true,
        scanRange: num(tool["scanRange"], 1),
        tetherStrength: num(tool["tetherStrength"], 1),
        modules: stringList(tool["modules"]),
        battery: clamp01(num(tool["battery"], 1)),
      },
      codex: {
        terms: termList(codex["terms"]),
        seenChips: termList(codex["seenChips"]),
      },
    },
    c1: {
      loadout: c1["loadout"] === "battery" || c1["loadout"] === "crash_shell" ? c1["loadout"] : null,
      firstTraceRecovered: c1["firstTraceRecovered"] === true,
      invalidRunExperienced: c1["invalidRunExperienced"] === true,
      controlsRestored: c1["controlsRestored"] === true,
      sourceZoneMarked: c1["sourceZoneMarked"] === true,
      accessibilityOutput:
        c1["accessibilityOutput"] === "color_only" || c1["accessibilityOutput"] === "shape_audio"
          ? c1["accessibilityOutput"]
          : null,
      notificationRule:
        c1["notificationRule"] === "none" || c1["notificationRule"] === "municipal_update_with_timestamp"
          ? c1["notificationRule"]
          : null,
      monitoringModel: monitoring,
      publicMapPublished: c1["publicMapPublished"] === true,
      complete: c1["complete"] === true,
      unresolved: stringList(c1["unresolved"]),
    },
    prologueComplete: raw["prologueComplete"] === true,
    hub: { unlocked: hub["unlocked"] === true },
    workshop: {
      available: workshop["available"] === true,
      complete: workshop["complete"] === true,
      resumeScene: resume,
    },
    world: {
      ...base.world,
      harbor: { monitoringModel: harborModel },
    },
    relationships: {
      characterMemory: {
        xiaocen: xiaocen["rescued"] === true ? { rescued: true } : undefined,
        chen: chen["acceptedTrial"] === true ? { acceptedTrial: true } : undefined,
      },
    },
    evidence: {
      runHistory: parseRuns(evidence["runHistory"]),
      unresolved: stringList(evidence["unresolved"]),
      controlRunBeforeClaim: evidence["controlRunBeforeClaim"] === true,
      failedRunRetained: evidence["failedRunRetained"] === true,
      userFeedbackChangedPrototype: evidence["userFeedbackChangedPrototype"] === true,
      claimMatchesObservedRange: evidence["claimMatchesObservedRange"] === true,
    },
  };
}

function parseRuns(value: unknown): RunRecord[] {
  if (!Array.isArray(value)) return [];
  const out: RunRecord[] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    if (typeof item["id"] !== "string" || typeof item["at"] !== "string") continue;
    if (typeof item["scene"] !== "string" || !isSceneId(item["scene"])) continue;
    const kind = item["kind"];
    const band = item["outputBand"];
    if (typeof kind !== "string" || typeof band !== "string") continue;
    out.push({
      id: item["id"],
      scene: item["scene"],
      at: item["at"],
      kind: kind as RunRecord["kind"],
      outputBand: band as RunRecord["outputBand"],
      readable: item["readable"] === true,
      loadout: item["loadout"] === "battery" || item["loadout"] === "crash_shell" ? item["loadout"] : null,
      retained: true,
    });
  }
  return out;
}

function termList(value: unknown): CodexTerm[] {
  if (!Array.isArray(value)) return [];
  const out: CodexTerm[] = [];
  for (const item of value) {
    if (typeof item === "string" && isCodexTerm(item) && !out.includes(item)) out.push(item);
  }
  return out;
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function num(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}
