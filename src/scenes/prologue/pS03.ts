import * as THREE from "three";
import { PROMPT, TASK } from "../../content/copy";
import { P_LINE } from "../../content/prologue/ids";
import { P03_LAYOUT as L } from "../../content/prologue/layout";
import { addSolidBox, boxMesh } from "../../engine/greybox";
import { makeWorldLabel } from "../../engine/worldHints";
import type { GameScene, SceneContext } from "../types";
import {
  SceneVoice,
  addAmberSpine,
  addShapeMark,
  addSosBeacon,
  addWaterChannel,
  onceFlags,
  stormShell,
  tickSceneRain,
} from "./kit";

export function createCutSpan(): GameScene {
  const flags = onceFlags();
  const voice = new SceneVoice();
  let rain: THREE.Points | null = null;
  let water: ReturnType<typeof addWaterChannel> | null = null;
  let sos: ReturnType<typeof addSosBeacon> | null = null;
  let plateA: THREE.Mesh | null = null;
  let ready = false;
  let liftT = 0;
  let elapsed = 0;

  return {
    id: "P-S03",
    mount(ctx) {
      const lights = stormShell(ctx, true);
      rain = lights.rain;
      voice.startRumble();

      addSolidBox(ctx.root, ctx.world, 10, 0.4, 6, 0x2a3036, 0, -0.2, 3.5);
      addSolidBox(ctx.root, ctx.world, 10, 0.4, 6, 0x2a3036, 0, -0.2, -3.5);
      addSolidBox(ctx.root, ctx.world, 0.35, 1.15, 1.1, 0x1a2127, -1.7, 0.48, 0.55);
      addSolidBox(ctx.root, ctx.world, 0.35, 1.15, 1.1, 0x1a2127, 1.7, 0.48, 0.55);
      addAmberSpine(ctx, -2.2, 1.4, 4.6);

      addSolidBox(ctx.root, ctx.world, 0.18, 1.15, 0.55, 0x3a444c, L.holster.x + 0.18, 1.15, L.holster.z);
      const holster = boxMesh(0.22, 0.72, 0.22, 0x8fd4cf, L.holster.x, L.holster.y, L.holster.z);
      const holsterMat = holster.material;
      if (holsterMat instanceof THREE.MeshStandardMaterial || holsterMat instanceof THREE.MeshLambertMaterial) {
        holsterMat.emissive = new THREE.Color(0x3a8884);
        holsterMat.emissiveIntensity = 0.85;
      }
      const grip = boxMesh(0.08, 0.28, 0.08, 0xe0a03a, L.holster.x - 0.16, L.holster.y + 0.12, L.holster.z);
      ctx.root.add(holster, grip);
      const toolTag = makeWorldLabel("連接工具", "先按 E 取下，再用 F 抓板");
      toolTag.position.set(L.holster.x, 1.85, L.holster.z);
      ctx.root.add(toolTag);
      plateA = boxMesh(1.15, 0.11, 0.7, 0x8a8f86, L.plateA.x, L.plateA.y, L.plateA.z);
      const plateB = boxMesh(1.15, 0.16, 0.7, 0x6a6560, L.plateB.x, L.plateB.y, L.plateB.z);
      const pegA = new THREE.Mesh(
        new THREE.ConeGeometry(0.12, 0.18, 3),
        new THREE.MeshLambertMaterial({ color: 0xb8c4c8 }),
      );
      pegA.position.set(0, 0.14, 0);
      plateA.add(pegA);
      const pegB = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.08, 0.14),
        new THREE.MeshLambertMaterial({ color: 0xb8c4c8 }),
      );
      pegB.position.set(0, 0.14, 0);
      plateB.add(pegB);
      ctx.root.add(plateA, plateB);
      addShapeMark(ctx.root, "chevron", L.seatA.x, 0, L.seatA.z);
      addShapeMark(ctx.root, "notch", L.seatB.x, 0, L.seatB.z);
      const seatATag = makeWorldLabel("三角座", "對準板的尖角");
      seatATag.position.set(L.seatA.x, 0.85, L.seatA.z);
      const seatBTag = makeWorldLabel("缺角座", "這塊板比較重，風會推");
      seatBTag.position.set(L.seatB.x, 0.85, L.seatB.z);
      ctx.root.add(seatATag, seatBTag);

      water = addWaterChannel(ctx.root, 0, -3.1, 0);
      sos = addSosBeacon(ctx.root, -6.4, -1.8, -8);
      ctx.world.addTrigger("gap", new THREE.Vector3(-2.3, -1.5, -0.5), new THREE.Vector3(2.3, -0.18, 0.5));
      ctx.world.addHazard("span-void", "void", new THREE.Vector3(-2.4, -4, -0.5), new THREE.Vector3(2.4, -0.4, 0.5));
      ctx.world.addAnchor("near", 0, 0, 3.6);
      ctx.world.addAnchor("far", 0, 0, -3.4);
      ctx.world.killY = -2.2;

      const faceTool = Math.atan2(-(L.holster.x - L.spawn.x), -(L.holster.z - L.spawn.z));
      ctx.player.reset(L.spawn.x, L.spawn.y, L.spawn.z, faceTool);
      ctx.camera.yaw = faceTool;
      ctx.hud.setTask(TASK["P-S03-pick"] ?? "");
      ctx.say(P_LINE.pickTether);
      ctx.tether.assistAlign = true;

      ctx.interact.add({
        id: "holster",
        prompt: PROMPT.pickTether,
        position: new THREE.Vector3(L.holster.x, 0, L.holster.z),
        radius: 3.4,
        enabled: true,
        onUse: () => {
          if (!flags.take("tether")) return;
          ctx.tether.grantPickup();
          ctx.save.player.tool.tether = true;
          ctx.persist();
          holster.visible = false;
          grip.visible = false;
          ctx.hud.setTask(TASK["P-S03-snap"] ?? "");
          ctx.say(P_LINE.rotateSlow);
          armPlates(ctx, plateA!, plateB);
        },
      });
    },
    update(dt, ctx) {
      elapsed += dt;
      tickSceneRain(rain, dt);
      water?.tick(dt);
      sos?.tick(elapsed);
      const hits = ctx.world.sampleTriggers(ctx.player.position);
      if (hits.includes("gap")) ctx.player.pullTo(new THREE.Vector3(0, 0, 3.7), "void");
      if (ctx.tether.seatedIn("seat-a") && ctx.tether.seatedIn("seat-b") && !ready) {
        ready = true;
        ctx.world.triggers = ctx.world.triggers.filter((item) => item.id !== "gap");
        ctx.interact.add({
          id: "cross-span",
          prompt: "走過短橋",
          position: new THREE.Vector3(0, 0, -2.2),
          radius: 1.8,
          enabled: true,
          onUse: () => ctx.completeAndGo(),
        });
      }
      if (ready && ctx.player.position.z < L.farLip.z + 0.45) {
        liftT += dt;
        const body = ctx.tether.body("plate-a");
        if (body && plateA) {
          plateA.rotation.x = Math.min(0.55, liftT * 0.4);
          plateA.position.y = L.seatA.y + Math.min(0.22, liftT * 0.16);
        }
        if (liftT > 1.1) ctx.completeAndGo();
      }
    },
    unmount() {
      rain = null;
      water = null;
      sos = null;
      plateA = null;
      voice.dispose();
    },
  };
}

function armPlates(ctx: SceneContext, plateA: THREE.Mesh, plateB: THREE.Mesh): void {
  ctx.tether.registerBody({
    id: "plate-a",
    object: plateA,
    mass: "medium",
    shape: "chevron",
    walkSize: new THREE.Vector3(1.35, 0.28, 1.35),
  });
  ctx.tether.registerBody({
    id: "plate-b",
    object: plateB,
    mass: "heavy",
    shape: "notch",
    walkSize: new THREE.Vector3(1.35, 0.28, 1.35),
  });
  ctx.tether.registerSocket({
    id: "seat-a",
    shape: "chevron",
    position: new THREE.Vector3(L.seatA.x, L.seatA.y, L.seatA.z),
    parent: ctx.root,
  });
  ctx.tether.registerSocket({
    id: "seat-b",
    shape: "notch",
    position: new THREE.Vector3(L.seatB.x, L.seatB.y, L.seatB.z),
    parent: ctx.root,
  });
}
