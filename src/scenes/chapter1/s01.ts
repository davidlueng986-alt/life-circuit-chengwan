import * as THREE from "three";
import { C1_PROMPT } from "../../../content/chapter1/copy";
import { C1_LAYOUT } from "../../../content/chapter1/layout";
import { PROMPT, TASK } from "../../content/copy";
import { pushRun } from "../../content/progress";
import { c1Run } from "../../../content/chapter1/state";
import { addSolidBox, boxMesh } from "../../engine/greybox";
import type { GameScene, SceneContext } from "../types";
import { lightHarbor, mountEastShore, mountWater, near, xyz } from "./kit";

export function createC1S01(): GameScene {
  let woke = false;
  let market = false;
  let fish = false;
  let jacked = false;
  let caged = false;
  let cageSeated = false;

  return {
    id: "C1-S01",
    mount(ctx) {
      lightHarbor(ctx, "fog");
      mountEastShore(ctx, {});
      mountWater(ctx);
      ctx.world.addAnchor("promenade", 0, 0, 2.4);
      ctx.world.addAnchor("pump", 2.2, 0, 30.4);

      ctx.bioRig.grantPickup(ctx.save.c1.loadout);
      ctx.bioRig.carry();
      if (ctx.save.c1.loadout === "crash_shell") ctx.player.walkSpeed = 3.15;
      ctx.bioRig.setHeadingTarget(xyz(C1_LAYOUT.pumpJack));
      ctx.bioRig.reporterShape = "triangle";

      ctx.signals.add({
        id: "live-pulse",
        kind: "env_flow",
        a: new THREE.Vector3(2.2, 0.7, 32),
        b: new THREE.Vector3(0.4, 0.55, 4),
      });
      ctx.signals.add({
        id: "city-lure",
        kind: "city_light",
        a: new THREE.Vector3(18.6, 3.2, 20),
        b: new THREE.Vector3(18.6, 3.8, 20),
      });

      const crate = boxMesh(1.15, 0.42, 0.95, 0x6a5340, C1_LAYOUT.crateA[0], C1_LAYOUT.crateA[1], C1_LAYOUT.crateA[2]);
      ctx.root.add(crate);
      ctx.tether.registerBody({
        id: "float-crate",
        object: crate,
        mass: "medium",
        shape: "crate",
        walkSize: new THREE.Vector3(1.2, 0.4, 1),
      });
      ctx.tether.registerSocket({
        id: "pier-step",
        shape: "crate",
        position: xyz(C1_LAYOUT.crateSeat),
        parent: ctx.root,
      });
      addSolidBox(ctx.root, ctx.world, 2.2, 0.2, 0.8, 0x4a4034, 12.4, 0.1, 11.2);

      const cage = boxMesh(0.7, 0.45, 0.7, 0x8aa0b8, C1_LAYOUT.cageHome[0], C1_LAYOUT.cageHome[1], C1_LAYOUT.cageHome[2]);
      ctx.root.add(cage);
      ctx.tether.registerBody({ id: "probe-cage", object: cage, mass: "medium", shape: "crate" });
      ctx.tether.registerSocket({
        id: "cage-far",
        shape: "crate",
        position: xyz(C1_LAYOUT.cageFar),
        parent: ctx.root,
        onSeat: () => {
          cageSeated = true;
        },
      });
      wallGap(ctx);
      deckFlank(ctx);

      addSolidBox(ctx.root, ctx.world, 0.35, 1.6, 0.35, 0x6a7068, C1_LAYOUT.wallPower[0], 0.8, C1_LAYOUT.wallPower[2]);
      addSolidBox(ctx.root, ctx.world, 0.6, 1.1, 0.4, 0x3d5c58, C1_LAYOUT.pumpJack[0], 0.55, C1_LAYOUT.pumpJack[2]);

      ctx.guide.set("path", xyz(C1_LAYOUT.pumpJack), [
        { x0: -11, z0: -1, x1: 11, z1: 17 },
        { x0: -7, z0: 15, x1: 5, z1: 37 },
      ]);
      ctx.player.reset(C1_LAYOUT.spawnS01[0], C1_LAYOUT.spawnS01[1], C1_LAYOUT.spawnS01[2], Math.PI);
      ctx.camera.yaw = Math.PI;
      ctx.hud.setTask(TASK["C1-S01-hunt"] ?? "");

      ctx.interact.add({
        id: "cage-probe",
        prompt: C1_PROMPT.cageIn,
        position: xyz(C1_LAYOUT.cageHome),
        radius: 1.5,
        enabled: true,
        onUse: () => {
          if (caged) return;
          caged = true;
          ctx.bioRig.placeAt(xyz(C1_LAYOUT.cageHome));
        },
      });
      ctx.interact.add({
        id: "take-probe",
        prompt: PROMPT.pickProbe,
        position: xyz(C1_LAYOUT.cageFar),
        radius: 1.6,
        enabled: true,
        onUse: () => {
          if (!cageSeated) return;
          ctx.bioRig.carry();
        },
      });
      ctx.interact.add({
        id: "wall-power",
        prompt: PROMPT.wallPower,
        position: xyz(C1_LAYOUT.wallPower),
        radius: 1.5,
        enabled: true,
        onUse: () => ctx.bioRig.plugWall(),
      });
      ctx.interact.add({
        id: "warehouse",
        prompt: C1_PROMPT.fenceLook,
        position: xyz(C1_LAYOUT.warehouseFence),
        radius: 1.8,
        enabled: true,
        onUse: () => {
          ctx.hud.announce("城市燈。沒有記錄口。");
        },
      });
    },
    update(_dt, ctx) {
      if (ctx.player.justRecovered && ctx.save.c1.loadout !== "crash_shell") {
        ctx.bioRig.shock();
        ctx.hud.announce("探頭休克了。岸上找牆上電源。");
      } else if (ctx.player.justRecovered && ctx.save.c1.loadout === "crash_shell") {
        ctx.hud.announce("外殼撐住了，但走得比較慢。");
      }
      if (!woke && ctx.bioRig.triangleFill > 0.2 && ctx.bioRig.powered) {
        woke = true;
        ctx.say("C1-S01-D001");
      }
      if (!market && near(ctx.player.position, C1_LAYOUT.market, 4.2)) {
        market = true;
        ctx.say("C1-S01-D002");
      }
      if (!fish && near(ctx.player.position, C1_LAYOUT.fish, 3.2)) {
        fish = true;
        ctx.say("C1-S01-D003");
      }
      if (
        !jacked &&
        ctx.bioRig.powered &&
        ctx.bioRig.fieldReadable(ctx.save) &&
        ctx.bioRig.triangleFill > 0.42 &&
        near(ctx.player.position, C1_LAYOUT.pumpJack, 3.2)
      ) {
        jacked = true;
        ctx.save.c1.firstTraceRecovered = true;
        pushRun(ctx.save, c1Run("C1-S01", "field_trace", "mid", true, ctx.save.c1.loadout, "line"));
        ctx.persist();
        ctx.say("C1-S01-D004");
        ctx.hud.setTask(TASK["C1-S01-back"] ?? "");
        ctx.interact.add({
          id: "into-slot",
          prompt: PROMPT.advance,
          position: new THREE.Vector3(0.4, 0, 35.6),
          radius: 1.7,
          enabled: true,
          onUse: () => ctx.completeAndGo(),
        });
      }
    },
    unmount() {
      woke = false;
      market = false;
      fish = false;
      jacked = false;
      caged = false;
      cageSeated = false;
    },
  };
}

function deckFlank(ctx: SceneContext): void {
  addSolidBox(ctx.root, ctx.world, 6.2, 0.4, 16, 0x2c2824, 10.6, -0.2, 20);
  addSolidBox(ctx.root, ctx.world, 5.4, 0.4, 14, 0x2c2824, -10.2, -0.2, 24);
}

function wallGap(ctx: SceneContext): void {
  addSolidBox(ctx.root, ctx.world, 10.4, 2.2, 0.32, 0x3a322c, 1.6, 1.1, 23);
  const cable = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 5.2, 6),
    new THREE.MeshLambertMaterial({ color: 0x8aa0b8 }),
  );
  cable.rotation.z = Math.PI / 2;
  cable.position.set(1.6, 1.7, 23);
  ctx.root.add(cable);
}
