import * as THREE from "three";
import { P_LINE } from "../../content/prologue/ids";
import { P06_LAYOUT as L } from "../../content/prologue/layout";
import { P06 } from "../../content/prologue/script";
import { HUB, addSolidBox } from "../../engine/greybox";
import type { GameScene } from "../types";
import {
  SceneVoice,
  addGate3,
  addWaterChannel,
  addXiaocenFigure,
  onceFlags,
} from "./kit";

export function createBeforeDawn(): GameScene {
  const flags = onceFlags();
  const voice = new SceneVoice();
  let water: ReturnType<typeof addWaterChannel> | null = null;
  let gate: ReturnType<typeof addGate3> | null = null;
  let titled = false;
  let done = false;
  let hold = 0;

  return {
    id: "P-S06",
    mount(ctx) {
      ctx.three.background = new THREE.Color(HUB.fog);
      ctx.three.fog = new THREE.FogExp2(HUB.fog, ctx.reducedMotion ? 0.004 : 0.006);
      ctx.root.add(new THREE.HemisphereLight(0xffecd0, 0x2a2218, 1.15));
      ctx.root.add(new THREE.AmbientLight(0xf0d8b0, 0.5));
      const sun = new THREE.DirectionalLight(0xffe2b8, 1.15);
      sun.position.set(8, 12, 4);
      ctx.root.add(sun);

      addSolidBox(ctx.root, ctx.world, 11, 0.4, 8.4, HUB.floor, 0, -0.2, 0);
      addSolidBox(ctx.root, ctx.world, 11, 3.4, 0.18, 0x88a0b0, 0, 1.6, -3.95);
      addSolidBox(ctx.root, ctx.world, 0.4, 3.4, 8.4, HUB.wall, -5.5, 1.6, 0);
      addSolidBox(ctx.root, ctx.world, 0.4, 3.4, 8.4, HUB.wall, 5.5, 1.6, 0);
      addSolidBox(ctx.root, ctx.world, 1.45, 0.48, 0.62, 0x4a4034, -1.25, 0.24, 0.55);
      addSolidBox(ctx.root, ctx.world, 1.45, 0.48, 0.62, 0x4a4034, 1.25, 0.24, 0.55);

      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(6.4, 2.4, 0.06),
        new THREE.MeshLambertMaterial({ color: 0x88a8b8, transparent: true, opacity: 0.28 }),
      );
      glass.position.set(0, 1.7, -3.88);
      ctx.root.add(glass);

      gate = addGate3(ctx.root, 0, 7.2, -16);
      gate.setRise(1);
      water = addWaterChannel(ctx.root, 0, -2.6, -16);
      water.setDir(1);
      addXiaocenFigure(ctx.root, 1.25, 0.48, 0.55, true);

      ctx.player.reset(L.spawn.x, L.spawn.y, L.spawn.z, L.spawn.yaw);
      ctx.camera.yaw = L.spawn.yaw;
      ctx.camera.pitch = -0.06;
      ctx.hud.setTask("");
      ctx.queueLines([P_LINE.sawFlow, P_LINE.moreFlows, P_LINE.redSignal, P_LINE.newJob]);
      voice.startPad();
    },
    update(dt, ctx) {
      water?.tick(dt);
      if (!ctx.reducedMotion) gate?.spin(dt);
      if (done) return;
      if (!ctx.hud.queueIdle) return;
      if (!titled) {
        titled = true;
        hold = 0;
        ctx.hud.setTitleCard(true);
        return;
      }
      hold += dt;
      if (hold > P06.titleHold && flags.take("hub")) {
        done = true;
        ctx.hud.setTitleCard(false);
        ctx.save.player.tool.flowLens = true;
        ctx.save.player.tool.tether = true;
        ctx.persist();
        ctx.completeAndGo();
      }
    },
    unmount() {
      water = null;
      gate = null;
      voice.dispose();
    },
  };
}
