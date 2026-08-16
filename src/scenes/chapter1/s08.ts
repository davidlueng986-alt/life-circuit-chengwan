import * as THREE from "three";
import { C1_LAYOUT } from "../../../content/chapter1/layout";
import { hasFailedRun } from "../../../content/chapter1/state";
import { openingLineIds } from "../../content/beats";
import { PROMPT, UI } from "../../content/copy";
import { addSolidBox } from "../../engine/greybox";
import type { GameScene } from "../types";
import { furnitureForModel, lightHarbor, mountEastShore, xyz } from "./kit";

export function createC1S08(): GameScene {
  let titled = false;
  let clock = 0;

  return {
    id: "C1-S08",
    mount(ctx) {
      lightHarbor(ctx, "fog");
      mountEastShore(ctx, {});
      furnitureForModel(ctx, ctx.save.c1.monitoringModel ?? ctx.save.world.harbor.monitoringModel);
      ctx.world.addAnchor("echo", 0, 0, 4.2);

      if (hasFailedRun(ctx.save)) {
        const wall = addSolidBox(ctx.root, ctx.world, 2.2, 1.4, 0.12, 0x3a322c, C1_LAYOUT.failWall[0], C1_LAYOUT.failWall[1], C1_LAYOUT.failWall[2]);
        wall.name = "fail-event";
      }
      addSolidBox(ctx.root, ctx.world, 1.4, 0.2, 0.4, 0x2a2620, 0, 0.2, -6.4);

      ctx.player.reset(C1_LAYOUT.spawnS08[0], 0, C1_LAYOUT.spawnS08[2], Math.PI);
      ctx.camera.yaw = Math.PI;
      ctx.hud.setTask("");
      ctx.hud.setRecap(true);
      ctx.queueLines(openingLineIds("C1-S08", ctx.save));

      ctx.interact.add({
        id: "plaque",
        prompt: UI.wallEvent,
        position: xyz(C1_LAYOUT.failWall),
        radius: 1.8,
        enabled: true,
        onUse: () => ctx.hud.announce(UI.wallEvent),
      });
      ctx.interact.add({
        id: "leave",
        prompt: PROMPT.advance,
        position: new THREE.Vector3(0, 0, 6.4),
        radius: 1.8,
        enabled: true,
        onUse: () => ctx.completeAndGo(),
      });
    },
    update(dt, ctx) {
      if (!ctx.hud.queueIdle) return;
      clock += dt;
      if (!titled && clock > 0.4) {
        titled = true;
        ctx.hud.announce(UI.nextChapter);
      }
    },
    unmount() {
      titled = false;
    },
  };
}
