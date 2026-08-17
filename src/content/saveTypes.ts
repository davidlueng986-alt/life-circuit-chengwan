import type {
  AccessibilityOutput,
  CodexTerm,
  Loadout,
  MonitoringModel,
  NotificationRule,
  OutputBand,
  RunKind,
  SceneId,
  SubtitleScale,
} from "./ids";

export type LocaleCode = "zh-Hant" | "both";

export interface SettingsState {
  relaxedTimer: boolean;
  reducedMotion: boolean;
  subtitleScale: SubtitleScale;
  fov: number;
  vibration: boolean;
  holdAlternatives: boolean;
  textScale: number;
  highContrast: boolean;
  interactionList: boolean;
}

export interface RunRecord {
  id: string;
  scene: SceneId;
  at: string;
  kind: RunKind;
  outputBand: OutputBand;
  readable: boolean;
  loadout: Loadout | null;
  retained: true;
}

export interface CharacterMemory {
  xiaocen?: { rescued?: boolean };
  chen?: { acceptedTrial?: boolean };
}

export interface SaveState {
  schemaVersion: 1;
  savedAt: string;
  locale: LocaleCode;
  meta: {
    hasSave: boolean;
    currentScene: SceneId;
  };
  settings: SettingsState;
  player: {
    tool: {
      flowLens: boolean;
      tether: boolean;
      sealedProbe: boolean;
      scanRange: number;
      tetherStrength: number;
      modules: string[];
      battery: number;
    };
    codex: { terms: CodexTerm[]; seenChips: CodexTerm[] };
  };
  c1: {
    loadout: Loadout | null;
    firstTraceRecovered: boolean;
    invalidRunExperienced: boolean;
    controlsRestored: boolean;
    sourceZoneMarked: boolean;
    accessibilityOutput: AccessibilityOutput | null;
    notificationRule: NotificationRule | null;
    monitoringModel: MonitoringModel | null;
    publicMapPublished: boolean;
    complete: boolean;
    unresolved: string[];
  };
  prologueComplete: boolean;
  hub: { unlocked: boolean };
  workshop: {
    available: boolean;
    complete: boolean;
    resumeScene: SceneId | null;
  };
  world: {
    harbor: { monitoringModel: MonitoringModel | null };
    factory: { supplyModel: null };
    switch: { repairModel: null };
    data: { selectedPerformance: null };
    recycling: { containmentModel: null };
    supply: { transitionModel: null };
    platform: { accessModel: null };
  };
  relationships: { characterMemory: CharacterMemory };
  evidence: {
    runHistory: RunRecord[];
    unresolved: string[];
    controlRunBeforeClaim: boolean;
    failedRunRetained: boolean;
    userFeedbackChangedPrototype: boolean;
    claimMatchesObservedRange: boolean;
  };
}

export const DEFAULT_SETTINGS: SettingsState = {
  relaxedTimer: false,
  reducedMotion: false,
  subtitleScale: 1,
  fov: 62,
  vibration: true,
  holdAlternatives: true,
  textScale: 1,
  highContrast: false,
  interactionList: true,
};

export function emptySave(now = new Date().toISOString()): SaveState {
  return {
    schemaVersion: 1,
    savedAt: now,
    locale: "zh-Hant",
    meta: { hasSave: false, currentScene: "BOOT-S00" },
    settings: { ...DEFAULT_SETTINGS },
    player: {
      tool: {
        flowLens: false,
        tether: false,
        sealedProbe: false,
        scanRange: 1,
        tetherStrength: 1,
        modules: [],
        battery: 1,
      },
      codex: { terms: [], seenChips: [] },
    },
    c1: {
      loadout: null,
      firstTraceRecovered: false,
      invalidRunExperienced: false,
      controlsRestored: false,
      sourceZoneMarked: false,
      accessibilityOutput: null,
      notificationRule: null,
      monitoringModel: null,
      publicMapPublished: false,
      complete: false,
      unresolved: [],
    },
    prologueComplete: false,
    hub: { unlocked: false },
    workshop: { available: false, complete: false, resumeScene: null },
    world: {
      harbor: { monitoringModel: null },
      factory: { supplyModel: null },
      switch: { repairModel: null },
      data: { selectedPerformance: null },
      recycling: { containmentModel: null },
      supply: { transitionModel: null },
      platform: { accessModel: null },
    },
    relationships: { characterMemory: {} },
    evidence: {
      runHistory: [],
      unresolved: [],
      controlRunBeforeClaim: false,
      failedRunRetained: false,
      userFeedbackChangedPrototype: false,
      claimMatchesObservedRange: false,
    },
  };
}

export type LoadStatus = "ok" | "empty" | "corrupt";

export interface LoadResult {
  save: SaveState;
  status: LoadStatus;
}
