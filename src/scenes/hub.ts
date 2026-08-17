import * as THREE from "three";
import { PROMPT, TASK } from "../content/copy";
import type { SceneId } from "../content/ids";
import { nextC1Scene, workshopEntry } from "../content/progress";
import { HUB, addPlayLights, addSolidBox, applyFog, configureKeyShadow, lamp, playPoint } from "../engine/greybox";
import { heroProbe } from "../engine/props";
import { BlockStamp, floorBox, wallBox } from "../engine/blocks";
import { dressInterior, stampCabinet, stampCrateStack } from "../engine/dress";
import { dressHorizon } from "./horizon";
import type { GameScene } from "./types";

export function createHubScene(id: SceneId = "HUB-S00"): GameScene {
  return {
    id,
    mount(ctx) {
      applyFog(ctx.three, HUB, ctx.reducedMotion);
      if (ctx.three.fog instanceof THREE.FogExp2) {
        ctx.three.fog.density = ctx.reducedMotion ? 0.004 : 0.006;
      }
      ctx.root.add(new THREE.HemisphereLight(0xfff0dc, 0x2a2218, 1.28));
      const sun = new THREE.DirectionalLight(0xffe6c4, 1.9);
      sun.position.set(8, 14, 5);
      configureKeyShadow(sun, 18);
      ctx.root.add(sun);
      ctx.root.add(lamp(HUB.accent, 0, 3.2, 0));
      addPlayLights(ctx.root, "hub");
      const harborLamp = playPoint(0xff8a52, 4.2, 10, 1);
      harborLamp.position.set(-3.15, 2.15, 1.7);
      const workshopLamp = playPoint(0x6ad4cc, 4.2, 10, 1);
      workshopLamp.position.set(3.15, 2.15, 1.7);
      ctx.root.add(harborLamp, workshopLamp);

      const map = new BlockStamp();
      map.room(-11, -8, 11, 8, -1, 4, "stone", "wood");
      map.fill(-2, 0, -1, 2, 0, 1, "wood");
      map.fill(-4, 1, 1, -3, 3, 1, "lamp");
      map.fill(3, 1, 1, 4, 3, 1, "cyan");
      for (let x = -3; x <= 3; x += 1) {
        for (let y = 1; y <= 3; y += 1) map.erase(x, y, 8);
      }
      map.fill(-3, 1, 8, 3, 3, 8, "glass");
      dressInterior(map, { x0: -11, z0: -8, x1: 11, z1: 8, y0: -1, h: 4 });
      stampCrateStack(map, -9, -6, 2);
      stampCrateStack(map, 8, -6, 3);
      stampCabinet(map, -10, 2);
      stampCabinet(map, -9, 2);
      map.commit(ctx.root);
      dressHorizon(ctx.root, { weather: "hub", shift: { z: 18 } });
      floorBox(ctx.world, -11, -8, 11, 8, 0);
      wallBox(ctx.world, -11, 0, -8, 11, 4, -8);
      wallBox(ctx.world, -11, 0, 8, 11, 4, 8);
      wallBox(ctx.world, -11, 0, -8, -11, 4, 8);
      wallBox(ctx.world, 11, 0, -8, 11, 4, 8);
      floorBox(ctx.world, -2, -1, 2, 1, 1);

      const partA = addSolidBox(ctx.root, ctx.world, 0.22, 0.12, 0.22, 0x6a7068, -0.55, 0.82, 0.25);
      const partB = addSolidBox(ctx.root, ctx.world, 0.18, 0.18, 0.18, 0x8aa0b8, 0.05, 0.86, -0.2);
      const proto = heroProbe();
      proto.position.set(0.85, 0.95, 0.15);
      proto.visible = false;
      proto.name = "hub-proto";
      ctx.root.add(proto);
      let protoState: "raw" | "built" | "broken" = "raw";
      ctx.interact.add({
        id: "proto",
        prompt: "組裝原型探頭",
        position: new THREE.Vector3(0.85, 0, 0.15),
        radius: 1.5,
        enabled: true,
        onUse: () => {
          if (protoState === "raw") {
            protoState = "built";
            partA.visible = false;
            partB.visible = false;
            proto.visible = true;
            const item = ctx.interact.items.find((entry) => entry.id === "proto");
            if (item) item.prompt = "故意弄壞它（看第一次失效）";
            ctx.say("C1-S00-D001");
            return;
          }
          if (protoState === "built") {
            protoState = "broken";
            proto.rotation.z = 0.85;
            proto.rotation.x = 0.35;
            ctx.save.c1.invalidRunExperienced = true;
            ctx.persist();
            const item = ctx.interact.items.find((entry) => entry.id === "proto");
            if (item) item.prompt = "已留下第一次失效，去河港";
            ctx.hud.setTask("去河港：帶這次失效紀錄出門");
            ctx.guide.setGoal(new THREE.Vector3(-3.15, 0, 1.35));
          }
        },
      });
      mountDoor(ctx, -3.15, 1.35, 0xb85c38, "harbor-door");
      mountDoor(ctx, 3.15, 1.35, 0x3d6a68, "workshop-door");


      const hatch = addSolidBox(ctx.root, ctx.world, 1.8, 2.3, 0.18, 0x2a2620, 0, 1.25, -7.72);
      hatch.name = "c2-hatch";
      if (ctx.save.c1.complete) {
        const plaque = addSolidBox(ctx.root, ctx.world, 1.1, 0.28, 0.06, 0xc9861a, 0, 2.55, -7.62);
        plaque.name = "c2-plaque";
      }

      const sky = ctx.save.world.harbor.monitoringModel ?? ctx.save.c1.monitoringModel;
      if (sky === "fixed_station") {
        addSolidBox(ctx.root, ctx.world, 1.4, 1.8, 1.4, 0x8a8f86, 8, 0.9, 5.4);
        addSolidBox(ctx.root, ctx.world, 0.9, 1.1, 0.9, 0x6a7068, 8.8, 0.55, 6.6);
      } else if (sky === "portable_kits") {
        addSolidBox(ctx.root, ctx.world, 0.5, 0.8, 0.5, 0x7a6a4a, 7.4, 0.4, 5.2);
        addSolidBox(ctx.root, ctx.world, 0.5, 0.8, 0.5, 0x7a6a4a, 8.2, 0.4, 5.6);
        addSolidBox(ctx.root, ctx.world, 0.5, 0.8, 0.5, 0x7a6a4a, 8.9, 0.4, 5.1);
        addSolidBox(ctx.root, ctx.world, 1.8, 0.28, 0.55, 0x5a4a34, 8.2, 0.18, 6.4);
      }
      if (sky) {
        addSolidBox(ctx.root, ctx.world, 0.4, 1.1, 0.4, 0xb85c38, 7.4, 0.55, 4.4);
        addSolidBox(ctx.root, ctx.world, 1.4, 1.2, 0.1, 0x2a3640, 9.2, 1.1, 4.2);
      }

      if (ctx.save.evidence.failedRunRetained || ctx.save.c1.invalidRunExperienced) {
        const wall = addSolidBox(ctx.root, ctx.world, 1.8, 1.1, 0.08, 0x3a322c, -6.4, 1.4, -7.7);
        wall.name = "fail-wall";
      }

      ctx.player.reset(0, 0, 5.15, 0);
      ctx.camera.yaw = 0;
      ctx.camera.pitch = -0.12;
      ctx.hud.setTask(TASK["HUB-S00"] ?? "");
      ctx.guide.set("path", new THREE.Vector3(0.85, 0, 0.15), [{ x0: -11, z0: -8, x1: 11, z1: 8 }]);

      ctx.interact.add({
        id: "harbor",
        prompt: PROMPT.doorHarbor,
        position: new THREE.Vector3(-3.15, 0, 1.35),
        radius: 1.8,
        enabled: true,
        onUse: () => ctx.loadScene(nextC1Scene(ctx.save)),
      });
      const resume = ctx.save.workshop.resumeScene;
      ctx.interact.add({
        id: "workshop",
        prompt: resume || ctx.save.workshop.complete ? PROMPT.doorWorkshopResume : PROMPT.doorWorkshop,
        position: new THREE.Vector3(3.15, 0, 1.35),
        radius: 1.8,
        enabled: true,
        onUse: () => ctx.loadScene(workshopEntry(ctx.save)),
      });
      ctx.interact.add({
        id: "c2",
        prompt: PROMPT.hatchC2,
        position: new THREE.Vector3(0, 0, -7.2),
        radius: 1.8,
        enabled: true,
        onUse: () => {
          ctx.hud.setTask(TASK["C2-STUB"] ?? "");
          ctx.say(ctx.save.c1.complete ? "C1-S08-D003" : "C2-STUB-R001");
        },
      });

      if (id === "C2-STUB") {
        ctx.hud.setTask(TASK["C2-STUB"] ?? "");
        ctx.say(ctx.save.c1.complete ? "C1-S08-D003" : "C2-STUB-R001");
      }
    },
    update(_dt, _ctx) {
      return;
    },
    unmount() {
      return;
    },
  };
}

function mountDoor(ctx: Parameters<GameScene["mount"]>[0], x: number, z: number, tint: number, name: string): void {
  addSolidBox(ctx.root, ctx.world, 1.15, 2.15, 0.22, 0x2a2620, x, 1.45, z);
  addSolidBox(ctx.root, ctx.world, 0.16, 2.15, 0.28, 0x3a322c, x - 0.52, 1.45, z);
  addSolidBox(ctx.root, ctx.world, 0.16, 2.15, 0.28, 0x3a322c, x + 0.52, 1.45, z);
  addSolidBox(ctx.root, ctx.world, 1.15, 0.16, 0.28, 0x3a322c, x, 2.55, z);
  const slab = addSolidBox(ctx.root, ctx.world, 0.78, 1.65, 0.08, tint, x, 1.4, z + 0.08);
  slab.name = name;
  const mat = slab.material;
  if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshLambertMaterial) {
    mat.emissive = new THREE.Color(tint);
    mat.emissiveIntensity = 0.42;
  }
}
