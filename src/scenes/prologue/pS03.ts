import * as THREE from "three";
import { PROMPT, TASK } from "../../content/copy";
import { P_LINE } from "../../content/prologue/ids";
import { P03_LAYOUT as L } from "../../content/prologue/layout";
import { heroPlate, heroSeat, tetherHolster } from "../../engine/props";
import { addVoxelFloor, addVoxelVolume } from "../../engine/voxels";
import { makeWorldLabel } from "../../engine/worldHints";
import type { GameScene, SceneContext } from "../types";
import {
  SceneVoice,
  addAmberSpine,
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
  let plateA: THREE.Group | null = null;
  let holster: THREE.Group | null = null;
  let ready = false;
  let liftT = 0;
  let elapsed = 0;
  let falls = 0;
  let idleTool = 0;

  return {
    id: "P-S03",
    mount(ctx) {
      const lights = stormShell(ctx, true);
      rain = lights.rain;
      voice.startRumble();

      addVoxelFloor(ctx.root, ctx.world, 10, 6, 0x2a3036, 0, 3.5);
      addVoxelFloor(ctx.root, ctx.world, 10, 6, 0x2a3036, 0, -3.5);
      addVoxelVolume(ctx.root, ctx.world, 0.35, 1.15, 1.1, 0x1a2127, -1.7, 0.48, 0.55);
      addVoxelVolume(ctx.root, ctx.world, 0.35, 1.15, 1.1, 0x1a2127, 1.7, 0.48, 0.55);
      addAmberSpine(ctx, -2.2, 1.4, 4.6);

      holster = tetherHolster();
      holster.position.set(L.holster.x, L.holster.y, L.holster.z);
      holster.rotation.y = Math.PI / 2;
      ctx.root.add(holster);
      const toolTag = makeWorldLabel("連接工具", "E 取下 · 再用 F 抓板");
      toolTag.position.set(L.holster.x, 1.85, L.holster.z);
      toolTag.name = "tool-tag";
      ctx.root.add(toolTag);

      plateA = heroPlate("chevron");
      plateA.position.set(L.plateA.x, L.plateA.y, L.plateA.z);
      const plateB = heroPlate("notch");
      plateB.position.set(L.plateB.x, L.plateB.y, L.plateB.z);
      ctx.root.add(plateA, plateB);
      const plateATag = makeWorldLabel("輕板", "三角銷 · 按住 F");
      plateATag.position.set(0, 0.45, 0);
      plateA.add(plateATag);
      const plateBTag = makeWorldLabel("重板", "缺角 · 風會推");
      plateBTag.position.set(0, 0.5, 0);
      plateB.add(plateBTag);

      const seatA = heroSeat("chevron");
      seatA.position.set(L.seatA.x, L.seatA.y, L.seatA.z);
      const seatB = heroSeat("notch");
      seatB.position.set(L.seatB.x, L.seatB.y, L.seatB.z);
      ctx.root.add(seatA, seatB);
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
        onUse: () => takeTool(ctx, plateB),
      });
    },
    update(dt, ctx) {
      elapsed += dt;
      tickSceneRain(rain, dt);
      water?.tick(dt);
      sos?.tick(elapsed);

      if (!ctx.tether.owned) {
        idleTool += dt;
        if (holster) holster.rotation.z = Math.sin(elapsed * 3.2) * 0.08;
        if (idleTool > 8 && flags.take("nudge-tool")) {
          ctx.hud.announce("牆上那把發光的鉤就是連接工具。走近按 E。");
        }
      }

      const hits = ctx.world.sampleTriggers(ctx.player.position);
      if (hits.includes("gap")) {
        falls += 1;
        ctx.player.pullTo(new THREE.Vector3(0, 0, 3.7), "void");
        if (falls >= 2 && !ready) ctx.hud.announce("兩塊都扣好才過得去。");
      }

      for (const id of ["plate-a", "plate-b"] as const) {
        const body = ctx.tether.body(id);
        const item = ctx.interact.items.find((entry) => entry.id === id);
        if (body && item) {
          item.position.copy(body.object.position).setY(0);
          item.enabled = !body.seated && !body.held;
        }
      }

      const aOn = !!ctx.tether.seatedIn("seat-a");
      const bOn = !!ctx.tether.seatedIn("seat-b");
      if (ctx.tether.heldId === "plate-a") ctx.tether.tintGhost("seat-b", false);
      if (ctx.tether.heldId === "plate-b") ctx.tether.tintGhost("seat-a", false);

      if (aOn && bOn && !ready) {
        ready = true;
        ctx.world.triggers = ctx.world.triggers.filter((item) => item.id !== "gap");
        ctx.hud.setTask("走過短橋");
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
        if (plateA) {
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
      holster = null;
      voice.dispose();
    },
  };

  function takeTool(ctx: SceneContext, plateB: THREE.Group): void {
    if (!flags.take("tether") || !plateA) return;
    ctx.tether.grantPickup();
    ctx.save.player.tool.tether = true;
    ctx.persist();
    if (holster) holster.visible = false;
    const tag = ctx.root.getObjectByName("tool-tag");
    if (tag) tag.visible = false;
    const holsterItem = ctx.interact.items.find((item) => item.id === "holster");
    if (holsterItem) holsterItem.enabled = false;
    ctx.hud.setTask(TASK["P-S03-snap"] ?? "");
    ctx.say(P_LINE.rotateSlow);
    armPlates(ctx, plateA, plateB);
    ctx.interact.add({
      id: "plate-a",
      prompt: "按住 F 抓輕板",
      position: new THREE.Vector3(L.plateA.x, 0, L.plateA.z),
      radius: 1.8,
      enabled: true,
      onUse: () => {
        ctx.tether.grabById("plate-a");
      },
    });
    ctx.interact.add({
      id: "plate-b",
      prompt: "按住 F 抓重板",
      position: new THREE.Vector3(L.plateB.x, 0, L.plateB.z),
      radius: 1.8,
      enabled: true,
      onUse: () => {
        ctx.tether.grabById("plate-b");
      },
    });
  }
}

function armPlates(ctx: SceneContext, plateA: THREE.Object3D, plateB: THREE.Object3D): void {
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
