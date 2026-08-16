import type { SceneId } from "../../content/ids";
import type { GameScene } from "../types";
import { createFoldScene } from "./fold";
import { createGateScene } from "./gate";
import { createRecapScene } from "./recap";
import { createRefsScene } from "./refs";
import { createScaleScene } from "./scale";
import { createTrackScene } from "./track";

export function createWorkshopScene(id: SceneId): GameScene {
  switch (id) {
    case "W-S00":
      return createScaleScene();
    case "W-S01":
      return createTrackScene();
    case "W-S02":
      return createFoldScene();
    case "W-S03":
      return createGateScene();
    case "W-S04":
      return createRefsScene();
    default:
      return createRecapScene();
  }
}

export function createWorkshopToolScene(id: SceneId): GameScene {
  return createWorkshopScene(id);
}
