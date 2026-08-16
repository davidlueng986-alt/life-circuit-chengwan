import * as THREE from "three";
import { HUB, addSolidBox, applyFog } from "../engine/greybox";
import type { GameScene } from "./types";

export function createDawnScene(): GameScene {
  let t = 0;
  let titled = false;
  let done = false;

  return {
    id: "P-S06",
    mount(ctx) {
      applyFog(ctx.three, HUB, ctx.reducedMotion);
      ctx.root.add(new THREE.HemisphereLight(0xffe8c4, 0x2a2218, 1.15));
      ctx.root.add(new THREE.AmbientLight(0xf0d8b0, 0.55));
      addSolidBox(ctx.root, ctx.world, 10, 0.4, 8, HUB.floor, 0, -0.2, 0);
      addSolidBox(ctx.root, ctx.world, 10, 3.4, 0.2, 0x88a0b0, 0, 1.6, -3.8);
      addSolidBox(ctx.root, ctx.world, 1.4, 0.5, 0.6, 0x4a4034, -1.2, 0.25, 0.6);
      addSolidBox(ctx.root, ctx.world, 1.4, 0.5, 0.6, 0x4a4034, 1.2, 0.25, 0.6);
      ctx.player.reset(0, 0, 2.2, Math.PI);
      ctx.camera.yaw = Math.PI;
      ctx.hud.setTask("");
      ctx.queueLines(["P-S06-D001", "P-S06-D002", "P-S06-D003", "P-S06-D004"]);
      t = 0;
      titled = false;
      done = false;
    },
    update(dt, ctx) {
      if (done) return;
      if (!ctx.hud.queueIdle) return;
      t += dt;
      if (!titled) {
        titled = true;
        t = 0;
        ctx.hud.setTitleCard(true);
        return;
      }
      if (t > 2.8) {
        done = true;
        ctx.hud.setTitleCard(false);
        ctx.completeAndGo();
      }
    },
    unmount() {
      return;
    },
  };
}
