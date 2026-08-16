import type { SceneId } from "../ids";

export const PROLOGUE_SCENE_IDS = [
  "P-S00",
  "P-S01",
  "P-S02",
  "P-S03",
  "P-S04",
  "P-S05",
  "P-S06",
] as const;

export type PrologueSceneId = (typeof PROLOGUE_SCENE_IDS)[number];

/** Official script IDs only. Recovery extras live in dialogue.ts as official=false. */
export const P_LINE = {
  control: "P-S00-D001",
  wrongLook: "P-S00-D002",
  linger: "P-S00-D003",
  indoor: "P-S00-R001",
  deadLift: "P-S01-D001",
  noSwim: "P-S01-D002",
  pickLens: "P-S02-D001",
  followFlow: "P-S02-D002",
  livePath: "P-S02-D003",
  pickTether: "P-S03-D001",
  rotateSlow: "P-S03-D002",
  findBreak: "P-S04-D001",
  oneHear: "P-S04-D002",
  jamStop: "P-S04-D003",
  gateMoves: "P-S04-D004",
  whitePulse: "P-S05-D001",
  deckSlips: "P-S05-D002",
  holdOn: "P-S05-D003",
  nowRun: "P-S05-D004",
  waterRetry: "P-S05-R001",
  sawFlow: "P-S06-D001",
  moreFlows: "P-S06-D002",
  redSignal: "P-S06-D003",
  newJob: "P-S06-D004",
} as const;

export function isPrologueScene(id: string): id is PrologueSceneId {
  return (PROLOGUE_SCENE_IDS as readonly string[]).includes(id);
}

export function asPrologueScene(id: SceneId): PrologueSceneId | null {
  return isPrologueScene(id) ? id : null;
}
