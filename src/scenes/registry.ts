import type { SceneId } from "../content/ids";
import { createChapter1Scene } from "./chapter1";
import { createHubScene } from "./hub";
import { createPrologueScene } from "./prologue";
import { createSpineScene } from "./spine";
import { createWorkshopScene } from "./workshop";
import type { GameScene } from "./types";

export function createScene(id: SceneId): GameScene {
  switch (id) {
    case "BOOT-S00":
    case "HUB-S00":
      return createHubScene("HUB-S00");
    case "P-S00":
    case "P-S01":
    case "P-S02":
    case "P-S03":
    case "P-S04":
    case "P-S05":
    case "P-S06":
      return createPrologueScene(id);
    case "W-S00":
    case "W-S01":
    case "W-S02":
    case "W-S03":
    case "W-S04":
    case "W-S05":
      return createWorkshopScene(id);
    case "C1-S00":
    case "C1-S01":
    case "C1-S02":
    case "C1-S03":
    case "C1-S04":
    case "C1-S05":
    case "C1-S06":
    case "C1-S07":
    case "C1-S08":
      return createChapter1Scene(id);
    case "C2-STUB":
      return createHubScene("C2-STUB");
    default:
      return createSpineScene(id);
  }
}
