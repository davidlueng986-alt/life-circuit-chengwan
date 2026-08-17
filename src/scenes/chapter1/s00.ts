import * as THREE from "three";
import { C1_LAYOUT } from "../../../content/chapter1/layout";
import { c1ProbeLine } from "../../content/beats";
import { PROMPT, TASK } from "../../content/copy";
import type { Loadout } from "../../content/ids";
import { addSolidBox, boxMesh, playPoint } from "../../engine/greybox";
import { makeWorldLabel } from "../../engine/worldHints";
import type { GameScene } from "../types";
import { lightHarbor, lookToward, mountHubMorning, near, xyz } from "./kit";

export function createC1S00(): GameScene {
  let picked = false;
  let saidApproach = false;
  let saidMap = false;
  let saidProbe = false;
  const blinks: THREE.Mesh[] = [];

  return {
    id: "C1-S00",
    mount(ctx) {
      lightHarbor(ctx, "hub");
      mountHubMorning(ctx);
      ctx.world.addAnchor("hub", 0, 0, 4.4);

      const battery = addSolidBox(ctx.root, ctx.world, 0.7, 0.55, 0.4, 0xc9a227, C1_LAYOUT.battery[0], C1_LAYOUT.battery[1], C1_LAYOUT.battery[2]);
      const shell = addSolidBox(ctx.root, ctx.world, 0.85, 0.62, 0.62, 0x8aa0b0, C1_LAYOUT.shell[0], C1_LAYOUT.shell[1] + 0.08, C1_LAYOUT.shell[2]);
      const probe = boxMesh(0.4, 0.22, 0.58, 0x3d5c58, C1_LAYOUT.probe[0], C1_LAYOUT.probe[1], C1_LAYOUT.probe[2]);
      glow(battery, 0xc9a227, 0.55);
      glow(shell, 0x8aa0b0, 0.4);
      glow(probe, 0x3d5c58, 0.45);
      ctx.root.add(probe);
      const batTag = makeWorldLabel("備用電池", "多掃幾次");
      batTag.position.set(C1_LAYOUT.battery[0], 1.35, C1_LAYOUT.battery[2]);
      const shellTag = makeWorldLabel("抗撞外殼", "比較耐撞");
      shellTag.position.set(C1_LAYOUT.shell[0], 1.35, C1_LAYOUT.shell[2]);
      const probeTag = makeWorldLabel("封閉探頭", "先選裝備再拿");
      probeTag.position.set(C1_LAYOUT.probe[0], 1.25, C1_LAYOUT.probe[2]);
      ctx.root.add(batTag, shellTag, probeTag);
      const packLamp = playPoint(0xffe2b0, 4.2, 12, 1);
      packLamp.position.set(0, 2.2, 0.4);
      const itemLamp = playPoint(0x8fd4cf, 2.8, 10, 1.05);
      itemLamp.position.set(0, 1.8, -1.4);
      ctx.root.add(packLamp, itemLamp);

      const wall = addSolidBox(ctx.root, ctx.world, 3.6, 1.6, 0.1, 0x2a2620, C1_LAYOUT.mapWall[0], C1_LAYOUT.mapWall[1], C1_LAYOUT.mapWall[2]);
      wall.name = "alarm-map";
      for (let i = 0; i < 3; i += 1) {
        const lampHead = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xef6a1a }),
        );
        lampHead.position.set(-1.1 + i * 0.7, 1.85, -7.28);
        ctx.root.add(lampHead);
        blinks.push(lampHead);
        const station = new THREE.Mesh(
          new THREE.BoxGeometry(0.16, 0.16, 0.04),
          new THREE.MeshLambertMaterial({ color: 0x2a3034 }),
        );
        station.position.set(-1.1 + i * 0.7, 1.35, -7.28);
        ctx.root.add(station);
      }

      ctx.player.reset(0, 0, 2.15, 0);
      ctx.guide.set("path", xyz(C1_LAYOUT.battery), [{ x0: -11, z0: -8, x1: 11, z1: 8 }]);
      ctx.camera.yaw = 0;
      ctx.camera.pitch = -0.18;
      ctx.hud.setTask(TASK["C1-S00-pick"] ?? "");

      const take = (kind: Loadout): void => {
        ctx.save.c1.loadout = kind;
        ctx.bioRig.loadout = kind;
        ctx.hud.setTask("拾起桌上的封閉探頭");
        ctx.say("C1-S00-D005");
        const probeItem = ctx.interact.items.find((item) => item.id === "probe");
        if (probeItem) probeItem.enabled = true;
        ctx.persist();
      };
      ctx.interact.add({
        id: "battery",
        prompt: PROMPT.battery,
        position: xyz(C1_LAYOUT.battery),
        radius: 1.5,
        enabled: true,
        onUse: () => take("battery"),
      });
      ctx.interact.add({
        id: "shell",
        prompt: PROMPT.shell,
        position: xyz(C1_LAYOUT.shell),
        radius: 1.5,
        enabled: true,
        onUse: () => take("crash_shell"),
      });
      ctx.interact.add({
        id: "probe",
        prompt: PROMPT.pickProbe,
        position: xyz(C1_LAYOUT.probe),
        radius: 1.6,
        enabled: false,
        onUse: () => {
          if (!ctx.save.c1.loadout) {
            ctx.hud.setTask("先選電池或抗撞外殼");
            return;
          }
          picked = true;
          ctx.save.player.tool.sealedProbe = true;
          ctx.bioRig.grantPickup(ctx.save.c1.loadout);
          ctx.bioRig.carry();
          probe.visible = false;
          ctx.say("C1-S00-D004");
          const lock = ctx.interact.items.find((item) => item.id === "airlock");
          if (lock) lock.enabled = true;
          ctx.hud.setTask(TASK["C1-S00-go"] ?? "");
          ctx.persist();
        },
      });
      ctx.interact.add({
        id: "airlock",
        prompt: TASK["C1-S00-go"] ?? PROMPT.advance,
        position: xyz(C1_LAYOUT.airlock),
        radius: 1.7,
        enabled: false,
        onUse: () => {
          if (!picked || !ctx.save.c1.loadout) return;
          ctx.completeAndGo();
        },
      });
    },
    update(dt, ctx) {
      void dt;
      for (let i = 0; i < blinks.length; i += 1) {
        const mesh = blinks[i];
        if (!mesh) continue;
        const mat = mesh.material;
        if (mat instanceof THREE.MeshBasicMaterial) {
          mat.opacity = (ctx.now + i * 0.85) % 3.2 < 0.22 ? 1 : 0.15;
          mat.transparent = true;
        }
      }
      if (!saidApproach && near(ctx.player.position, C1_LAYOUT.table, 2.6)) {
        saidApproach = true;
        ctx.say("C1-S00-D001");
      }
      if (!saidMap && lookToward(ctx, C1_LAYOUT.mapWall) > 0.52 && near(ctx.player.position, C1_LAYOUT.mapWall, 7)) {
        saidMap = true;
        ctx.say("C1-S00-D002");
      }
      if (!saidProbe && near(ctx.player.position, C1_LAYOUT.probe, 2.1)) {
        saidProbe = true;
        ctx.say(c1ProbeLine(ctx.save));
      }
    },
    unmount() {
      blinks.length = 0;
      picked = false;
      saidApproach = false;
      saidMap = false;
      saidProbe = false;
    },
  };
}

function glow(mesh: THREE.Mesh, tint: number, intensity: number): void {
  const mat = mesh.material;
  if (!(mat instanceof THREE.MeshStandardMaterial) && !(mat instanceof THREE.MeshLambertMaterial)) return;
  mat.emissive = new THREE.Color(tint);
  mat.emissiveIntensity = intensity;
}
