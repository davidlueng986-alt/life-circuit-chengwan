import { getLine, type LineId } from "./dialogue";
import type { CodexTerm, SceneId } from "./ids";
import type { SaveState } from "./saveTypes";

/** First official naming after the matching action. Latch in C1-S06 has no formal chip. */
export const LINE_CHIPS: Partial<Record<LineId, CodexTerm[]>> = {
  "W-S00-D001": ["cell"],
  "W-S00-D003": ["dnaGene"],
  "W-S01-D003": ["transcription"],
  "W-S02-D001": ["translation"],
  "W-S03-D001": ["input", "regulator", "promoter"],
  "W-S03-D002": ["reporter"],
  "W-S03-D003": ["output"],
  "W-S04-D003": ["controls"],
  "W-S04-D004": ["validRun"],
  "C1-S00-D003": ["input", "regulator", "promoter", "reporter"],
  "C1-S03-D003": ["controls"],
  "C1-S03-D005": ["validRun"],
  "C1-S05-D004": ["output"],
  "C1-S07-D004": ["reporter", "screening"],
};

/** Formal terms only after workshop.complete. Else lived language. */
export function c1ProbeLine(save: SaveState): LineId {
  return save.workshop.complete ? "C1-S00-D003" : "C1-S00-D003A";
}

export function openingLineIds(id: SceneId, save: SaveState): LineId[] {
  void save;
  switch (id) {
    case "P-S00":
      return ["P-S00-D001"];
    case "P-S01":
      return ["P-S01-D001"];
    case "P-S03":
      return ["P-S03-D001"];
    case "P-S04":
      return ["P-S04-D001"];
    case "P-S05":
      return ["P-S05-D001"];
    case "P-S06":
      return ["P-S06-D001", "P-S06-D002", "P-S06-D003", "P-S06-D004"];
    case "W-S00":
      return ["W-S00-D001"];
    case "W-S01":
      return ["W-S01-D001"];
    case "W-S02":
      return ["W-S02-D001"];
    case "W-S03":
      return ["W-S03-D001"];
    case "W-S04":
      return ["W-S04-D001"];
    case "W-S05":
      return ["W-S05-D001", "W-S05-D002", "W-S05-D003"];
    case "C1-S00":
      return [];
    case "C1-S01":
      return ["C1-S01-D001"];
    case "C1-S03":
      return ["C1-S03-D001"];
    case "C1-S04":
      return ["C1-S04-D001"];
    case "C1-S05":
      return ["C1-S05-D001"];
    case "C1-S06":
      return ["C1-S06-D001"];
    case "C1-S07":
      return ["C1-S07-D001"];
    case "C1-S08":
      return ["C1-S08-D001", "C1-S08-D002", "C1-S08-D003"];
    default:
      return [];
  }
}

export function chipsForLine(id: string, save: SaveState): CodexTerm[] {
  if (!Object.prototype.hasOwnProperty.call(LINE_CHIPS, id)) return [];
  const terms = LINE_CHIPS[id as LineId] ?? [];
  if (id === "C1-S00-D003" && !save.workshop.complete) return [];
  if (!save.workshop.complete && (id === "C1-S00-D003A" || id.startsWith("C1-S00"))) {
    return terms.filter((term) => term === "controls" || term === "validRun" || term === "screening" || term === "output");
  }
  return [...terms];
}

export function sitDownScene(id: SceneId): boolean {
  return id === "P-S06" || id === "W-S05" || id === "C1-S08";
}

export function knownLine(id: string): boolean {
  return getLine(id) !== null;
}
