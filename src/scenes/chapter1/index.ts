import { isC1SceneId, type C1SceneId } from "../../../content/chapter1/ids";
import type { SceneId } from "../../content/ids";
import type { GameScene } from "../types";
import { createC1S00 } from "./s00";
import { createC1S01 } from "./s01";
import { createC1S02 } from "./s02";
import { createC1S03 } from "./s03";
import { createC1S04 } from "./s04";
import { createC1S05 } from "./s05";
import { createC1S06 } from "./s06";
import { createC1S07 } from "./s07";
import { createC1S08 } from "./s08";

export function createChapter1Scene(id: SceneId): GameScene {
  const scene = isC1SceneId(id) ? id : "C1-S00";
  return factory(scene);
}

function factory(id: C1SceneId): GameScene {
  switch (id) {
    case "C1-S00":
      return createC1S00();
    case "C1-S01":
      return createC1S01();
    case "C1-S02":
      return createC1S02();
    case "C1-S03":
      return createC1S03();
    case "C1-S04":
      return createC1S04();
    case "C1-S05":
      return createC1S05();
    case "C1-S06":
      return createC1S06();
    case "C1-S07":
      return createC1S07();
    case "C1-S08":
      return createC1S08();
  }
}
