import * as THREE from "three";
import { PROMPT, TASK } from "../content/copy";
import { STORM, addSolidBox, applyFog, placeSolid } from "../engine/greybox";
import type { GameScene } from "./types";

export function createLiftScene(): GameScene {
  let cratePushed = false;
  let climbed = false;
  const cratePos = new THREE.Vector3(2.1, 0.45, 1.4);

  return {
    id: "P-S01",
    mount(ctx) {
      applyFog(ctx.three, STORM, ctx.reducedMotion);
      ctx.root.add(new THREE.HemisphereLight(0xc8d8e6, 0x2a343c, 1.05));
      const key = new THREE.PointLight(0xffe2b0, 3.2, 12);
      key.position.set(-1.2, 2.2, -1.4);
      ctx.root.add(key);
      const fill = new THREE.PointLight(0x9ec0d2, 2.2, 12);
      fill.position.set(3.2, 2.4, 2.2);
      ctx.root.add(fill);

      addSolidBox(ctx.root, ctx.world, 10, 0.4, 10, STORM.floor, 0, -0.2, 0);
      addSolidBox(ctx.root, ctx.world, 10, 3.2, 0.4, STORM.wall, 0, 1.4, -5);
      addSolidBox(ctx.root, ctx.world, 10, 3.2, 0.4, STORM.wall, 0, 1.4, 5);
      addSolidBox(ctx.root, ctx.world, 0.4, 3.2, 10, STORM.wall, -5, 1.4, 0);
      addSolidBox(ctx.root, ctx.world, 0.4, 3.2, 10, STORM.wall, 5, 1.4, 0);
      addSolidBox(ctx.root, ctx.world, 1.8, 2.4, 1.8, 0x1b1f24, -2.4, 1.1, -2.2);
      addSolidBox(ctx.root, ctx.world, 2.2, 0.28, 1.6, 0x2a3038, 3.4, 2.55, 2.4);

      const crate = addSolidBox(ctx.root, ctx.world, 1.2, 0.9, 1.2, 0x6a5340, cratePos.x, cratePos.y, cratePos.z);
      crate.name = "crate";

      const ladder = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 2.6, 0.12),
        new THREE.MeshLambertMaterial({ color: 0x8a7a62 }),
      );
      ladder.position.set(3.4, 1.3, 1.4);
      ctx.root.add(ladder);

      ctx.world.addAnchor("floor", 0, 0, -2.4);
      ctx.world.killY = -2.2;

      ctx.player.reset(0, 0, -2.4, 0);
      ctx.camera.yaw = 0.15;
      ctx.camera.pitch = -0.08;
      ctx.hud.setTask(TASK["P-S01-crate"] ?? "");
      ctx.say("P-S01-D001");

      ctx.interact.add({
        id: "crate",
        prompt: PROMPT.pushCrate,
        position: cratePos.clone(),
        radius: 1.6,
        enabled: true,
        onUse: () => {
          if (cratePushed) return;
          cratePushed = true;
          placeSolid(crate, 3.8, cratePos.y, cratePos.z);
          cratePos.copy(crate.position);
          ctx.hud.setTask(TASK["P-S01-ladder"] ?? "");
          ctx.say("P-S01-D002");
          ctx.world.addLadder(
            "maint",
            new THREE.Vector3(3.05, 0, 1.05),
            new THREE.Vector3(3.75, 2.85, 1.85),
          );
          ctx.world.addTrigger(
            "booth",
            new THREE.Vector3(2.6, 2.2, 1.8),
            new THREE.Vector3(4.4, 3.4, 3.2),
          );
          ctx.interact.add({
            id: "ladder",
            prompt: PROMPT.climb,
            position: new THREE.Vector3(3.4, 0, 1.4),
            radius: 1.4,
            enabled: true,
            onUse: () => {
              ctx.player.position.set(3.4, 0.15, 1.4);
            },
          });
        },
      });
    },
    update(_dt, ctx) {
      if (climbed || !cratePushed) return;
      const hits = ctx.world.sampleTriggers(ctx.player.position);
      if (hits.includes("booth") || (ctx.player.position.y > 2.35 && ctx.player.position.z > 1.9)) {
        climbed = true;
        ctx.completeAndGo();
      }
    },
    unmount() {
      cratePushed = false;
      climbed = false;
    },
  };
}
