import { chapterOf, type CodexTerm, type SceneId } from "./ids";
import { addCodexTerm } from "./progress";
import type { SaveState } from "./saveTypes";

export interface SceneDef {
  id: SceneId;
  chapter: ReturnType<typeof chapterOf>;
  name: string;
  next: SceneId | null;
  skippable: boolean;
  playable: boolean;
  applyComplete: (save: SaveState) => void;
}

function unlockHub(save: SaveState): void {
  save.prologueComplete = true;
  save.hub.unlocked = true;
  save.workshop.available = true;
  save.relationships.characterMemory.xiaocen = { rescued: true };
}

export const SCENE_DEFS: Record<SceneId, SceneDef> = {
  "BOOT-S00": {
    id: "BOOT-S00",
    chapter: "title",
    name: "標題／冷啟動",
    next: "P-S00",
    skippable: false,
    playable: true,
    applyComplete: () => undefined,
  },
  "HUB-S00": {
    id: "HUB-S00",
    chapter: "hub",
    name: "研究站大廳",
    next: null,
    skippable: false,
    playable: true,
    applyComplete: () => undefined,
  },
  "P-S00": {
    id: "P-S00",
    chapter: "prologue",
    name: "暴雨入站",
    next: "P-S01",
    skippable: false,
    playable: true,
    applyComplete: () => undefined,
  },
  "P-S01": {
    id: "P-S01",
    chapter: "prologue",
    name: "電梯死機",
    next: "P-S02",
    skippable: false,
    playable: true,
    applyComplete: () => undefined,
  },
  "P-S02": {
    id: "P-S02",
    chapter: "prologue",
    name: "借來的透鏡",
    next: "P-S03",
    skippable: false,
    playable: true,
    applyComplete: (save) => {
      save.player.tool.flowLens = true;
    },
  },
  "P-S03": {
    id: "P-S03",
    chapter: "prologue",
    name: "斷掉的橋",
    next: "P-S04",
    skippable: false,
    playable: true,
    applyComplete: (save) => {
      save.player.tool.tether = true;
    },
  },
  "P-S04": {
    id: "P-S04",
    chapter: "prologue",
    name: "閘門下方",
    next: "P-S05",
    skippable: false,
    playable: true,
    applyComplete: () => undefined,
  },
  "P-S05": {
    id: "P-S05",
    chapter: "prologue",
    name: "回頭跑",
    next: "P-S06",
    skippable: false,
    playable: true,
    applyComplete: () => undefined,
  },
  "P-S06": {
    id: "P-S06",
    chapter: "prologue",
    name: "天亮之前",
    next: "HUB-S00",
    skippable: false,
    playable: true,
    applyComplete: unlockHub,
  },
  "W-S00": {
    id: "W-S00",
    chapter: "workshop",
    name: "放大一萬倍",
    next: "W-S01",
    skippable: true,
    playable: true,
    applyComplete: (save) => {
      addCodexTerm(save, "cell");
      addCodexTerm(save, "dnaGene");
    },
  },
  "W-S01": {
    id: "W-S01",
    chapter: "workshop",
    name: "保留下來的軌道",
    next: "W-S02",
    skippable: true,
    playable: true,
    applyComplete: (save) => {
      addCodexTerm(save, "transcription");
    },
  },
  "W-S02": {
    id: "W-S02",
    chapter: "workshop",
    name: "會折起來的產物",
    next: "W-S03",
    skippable: true,
    playable: true,
    applyComplete: (save) => {
      addCodexTerm(save, "translation");
    },
  },
  "W-S03": {
    id: "W-S03",
    chapter: "workshop",
    name: "閘門與報告燈",
    next: "W-S04",
    skippable: true,
    playable: true,
    applyComplete: (save) => {
      addCodexTerm(save, "input");
      addCodexTerm(save, "regulator");
      addCodexTerm(save, "promoter");
      addCodexTerm(save, "reporter");
      addCodexTerm(save, "output");
    },
  },
  "W-S04": {
    id: "W-S04",
    chapter: "workshop",
    name: "先測設備",
    next: "W-S05",
    skippable: true,
    playable: true,
    applyComplete: (save) => {
      addCodexTerm(save, "controls");
      addCodexTerm(save, "validRun");
    },
  },
  "W-S05": {
    id: "W-S05",
    chapter: "workshop",
    name: "你剛才做的循環",
    next: "HUB-S00",
    skippable: true,
    playable: true,
    applyComplete: (save) => {
      save.workshop.complete = true;
      save.workshop.resumeScene = null;
    },
  },
  "C1-S00": {
    id: "C1-S00",
    chapter: "c1",
    name: "河港還在睡",
    next: "C1-S01",
    skippable: false,
    playable: true,
    applyComplete: (save) => {
      save.player.tool.sealedProbe = true;
    },
  },
  "C1-S01": {
    id: "C1-S01",
    chapter: "c1",
    name: "第一條紅線",
    next: "C1-S02",
    skippable: false,
    playable: true,
    applyComplete: (save) => {
      save.c1.firstTraceRecovered = true;
    },
  },
  "C1-S02": {
    id: "C1-S02",
    chapter: "c1",
    name: "全部都紅",
    next: "C1-S03",
    skippable: false,
    playable: true,
    applyComplete: (save) => {
      save.c1.invalidRunExperienced = true;
      save.evidence.failedRunRetained = true;
    },
  },
  "C1-S03": {
    id: "C1-S03",
    chapter: "c1",
    name: "先證明它看得見",
    next: "C1-S04",
    skippable: false,
    playable: true,
    applyComplete: (save) => {
      save.c1.controlsRestored = true;
      save.evidence.controlRunBeforeClaim = true;
      addCodexTerm(save, "controls");
      addCodexTerm(save, "validRun");
    },
  },
  "C1-S04": {
    id: "C1-S04",
    chapter: "c1",
    name: "第二次進入",
    next: "C1-S05",
    skippable: false,
    playable: true,
    applyComplete: (save) => {
      save.c1.sourceZoneMarked = true;
    },
  },
  "C1-S05": {
    id: "C1-S05",
    chapter: "c1",
    name: "陳姨的路",
    next: "C1-S06",
    skippable: false,
    playable: true,
    applyComplete: (save) => {
      save.c1.accessibilityOutput = "shape_audio";
      save.c1.notificationRule = "municipal_update_with_timestamp";
      save.evidence.userFeedbackChangedPrototype = true;
      save.relationships.characterMemory.chen = { acceptedTrial: true };
      addCodexTerm(save, "output");
    },
  },
  "C1-S06": {
    id: "C1-S06",
    chapter: "c1",
    name: "閘門背後",
    next: "C1-S07",
    skippable: false,
    playable: true,
    applyComplete: (save) => {
      if (!save.player.tool.modules.includes("latch")) {
        save.player.tool.modules.push("latch");
      }
    },
  },
  "C1-S07": {
    id: "C1-S07",
    chapter: "c1",
    name: "說到證據為止",
    next: "C1-S08",
    skippable: false,
    playable: true,
    applyComplete: (save) => {
      save.c1.publicMapPublished = true;
      save.world.harbor.monitoringModel = save.c1.monitoringModel;
      pushUnique(save.c1.unresolved, "confirmation_result");
      pushUnique(save.c1.unresolved, "long_term_monitoring");
      save.evidence.unresolved = [...save.c1.unresolved];
      save.evidence.claimMatchesObservedRange = true;
      addCodexTerm(save, "screening");
    },
  },
  "C1-S08": {
    id: "C1-S08",
    chapter: "c1",
    name: "城市回聲",
    next: "HUB-S00",
    skippable: false,
    playable: true,
    applyComplete: (save) => {
      save.c1.complete = true;
    },
  },
  "C2-STUB": {
    id: "C2-STUB",
    chapter: "c2",
    name: "停線（未開放）",
    next: "HUB-S00",
    skippable: true,
    playable: false,
    applyComplete: () => undefined,
  },
};

function pushUnique(list: string[], value: string): void {
  if (!list.includes(value)) list.push(value);
}

export function unlockTerms(save: SaveState, terms: CodexTerm[]): void {
  for (const term of terms) addCodexTerm(save, term);
}

export function isWorkshop(id: SceneId): boolean {
  return chapterOf(id) === "workshop";
}
