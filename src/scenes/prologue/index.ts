import type { SceneId } from "../../content/ids";
import type { GameScene } from "../types";
import { createBeforeDawn } from "./pS06";
import { createActuatorGallery } from "./pS04";
import { createBorrowedLens } from "./pS02";
import { createCutSpan } from "./pS03";
import { createDeadLift } from "./pS01";
import { createEvacRun } from "./pS05";
import { createStormArrival } from "./pS00";

export function createPrologueScene(id: SceneId): GameScene {
  switch (id) {
    case "P-S00":
      return createStormArrival();
    case "P-S01":
      return createDeadLift();
    case "P-S02":
      return createBorrowedLens();
    case "P-S03":
      return createCutSpan();
    case "P-S04":
      return createActuatorGallery();
    case "P-S05":
      return createEvacRun();
    case "P-S06":
      return createBeforeDawn();
    default:
      return createStormArrival();
  }
}

export { createActuatorGallery, createBeforeDawn, createBorrowedLens, createCutSpan, createDeadLift, createEvacRun, createStormArrival };
