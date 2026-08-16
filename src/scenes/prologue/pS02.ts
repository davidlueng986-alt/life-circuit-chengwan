import * as THREE from "three";
import { PROMPT, TASK } from "../../content/copy";
import { P_LINE } from "../../content/prologue/ids";
import { P02_LAYOUT as L } from "../../content/prologue/layout";
import { addSolidBox, boxMesh, playPoint } from "../../engine/greybox";
import { makeWorldLabel } from "../../engine/worldHints";
import type { GameScene } from "../types";
import {
  addPipe,
  addRelayMesh,
  lambertOf,
  onceFlags,
  pulsePipe,
  stormShell,
  tickSceneRain,
} from "./kit";

export function createBorrowedLens(): GameScene {
  const flags = onceFlags();
  let rain: THREE.Points | null = null;
  let dead: THREE.Mesh | null = null;
  let live: THREE.Mesh | null = null;
  let liveTail: THREE.Mesh | null = null;
  let dummy: THREE.Mesh | null = null;
  let lock: THREE.Mesh | null = null;
  let span: THREE.Mesh | null = null;
  let lensMesh: THREE.Mesh | null = null;
  let exitDoor: THREE.Mesh | null = null;
  let pulsedAt = -1;
  let seated = false;
  let unlocked = false;
  let elapsed = 0;
  let hinted = false;

  return {
    id: "P-S02",
    mount(ctx) {
      const lights = stormShell(ctx, false);
      rain = lights.rain;
      const deskLamp = playPoint(0xffe2b0, 1.7, 8, 1.1);
      deskLamp.position.set(L.desk.x, 1.85, L.desk.z);
      const wash = playPoint(0x6a8494, 0.9, 10, 1.15);
      wash.position.set(0, 2.4, 1.2);
      ctx.root.add(deskLamp, wash);
      ctx.camera.dist = 3.4;
      ctx.camera.pitch = -0.22;

      addSolidBox(ctx.root, ctx.world, 11.2, 0.4, 14.6, 0x1c2228, 0, -0.2, 1.6);
      addSolidBox(ctx.root, ctx.world, 8.6, 3.2, 0.35, 0x243038, -1.3, 1.4, -5.45);
      addSolidBox(ctx.root, ctx.world, 11.2, 3.2, 0.35, 0x243038, 0, 1.4, 8.7);
      addSolidBox(ctx.root, ctx.world, 0.35, 3.2, 14.6, 0x243038, -5.55, 1.4, 1.6);
      addSolidBox(ctx.root, ctx.world, 0.35, 3.2, 14.6, 0x243038, 5.55, 1.4, 1.6);
      exitDoor = addSolidBox(ctx.root, ctx.world, 2.1, 2.4, 0.35, 0x2a3038, 4.15, 1.2, -5.45);
      addSolidBox(ctx.root, ctx.world, 3.2, 0.4, 2.6, 0x2a3036, 4.1, -0.2, -6.9);
      addSolidBox(ctx.root, ctx.world, 1.9, 0.72, 0.9, 0x4a4034, L.desk.x, 0.36, L.desk.z);
      const lampStem = boxMesh(0.06, 0.55, 0.06, 0x6a5a44, L.desk.x + 0.62, 0.95, L.desk.z + 0.12);
      const lampHead = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 10, 8),
        new THREE.MeshBasicMaterial({ color: 0xf0d8a0 }),
      );
      lampHead.position.set(L.desk.x + 0.42, 1.28, L.desk.z);
      ctx.root.add(lampStem, lampHead);

      lensMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.14, 0.58),
        new THREE.MeshStandardMaterial({
          color: 0xc9861a,
          emissive: 0xffb020,
          emissiveIntensity: 1.15,
          roughness: 0.35,
          metalness: 0.28,
        }),
      );
      lensMesh.position.set(L.desk.x + 0.52, 0.88, L.desk.z + 0.18);
      const button = new THREE.Mesh(
        new THREE.CylinderGeometry(0.085, 0.085, 0.055, 14),
        new THREE.MeshBasicMaterial({ color: 0x7ec8c3 }),
      );
      button.position.set(0, 0.08, 0);
      lensMesh.add(button);
      ctx.root.add(lensMesh);
      const lensTag = makeWorldLabel("透鏡", "拾起後對牆按 Q");
      lensTag.position.set(L.desk.x + 0.52, 1.25, L.desk.z + 0.18);
      ctx.root.add(lensTag);

      dead = addPipe(ctx.root, -2.5, L.deadY, L.wallZ, 5.1, 0.11, 0xc9a24a);
      live = addPipe(ctx.root, -2.5, L.liveY, L.wallZ, 2.9, 0.08, 0x3a6a66);
      const deadTag = makeWorldLabel("最亮的線", "會反光，不是路");
      deadTag.position.set(0.2, L.deadY + 0.35, L.wallZ + 0.2);
      deadTag.visible = false;
      deadTag.name = "dead-tag";
      const liveTag = makeWorldLabel("會流動的線", "跟這條走到門鎖");
      liveTag.position.set(0.2, L.liveY + 0.35, L.wallZ + 0.2);
      liveTag.visible = false;
      liveTag.name = "live-tag";
      ctx.root.add(deadTag, liveTag);
      liveTail = addPipe(ctx.root, 0.4, L.liveY, L.wallZ, 2.2, 0.055, 0x3a6a66, "z");
      liveTail.rotation.set(0, 0, Math.PI / 2);
      liveTail.position.set(1.55, L.liveY, -4.2);
      dummy = addPipe(ctx.root, -2.5, L.dummyY, L.wallZ, 4.6, 0.05, 0x3a4044);
      addSolidBox(ctx.root, ctx.world, 1.45, 2.15, 0.22, 0x2a3036, L.panel.x, 1.15, L.panel.z);
      addRelayMesh(ctx.root, L.relay.x, L.relay.y, L.relay.z, 0x8aa0b8);
      lock = boxMesh(0.32, 0.52, 0.16, 0x4a4034, L.lock.x, L.lock.y, L.lock.z);
      ctx.root.add(lock);

      span = boxMesh(2.2, 0.12, 0.7, 0x6a6560, 4.4, 0.2, -5.9);
      ctx.root.add(span);

      ctx.signals.add({
        id: "dead",
        kind: "power_residual",
        a: new THREE.Vector3(-2.5, L.deadY, L.wallZ),
        b: new THREE.Vector3(2.6, L.deadY, L.wallZ),
      });
      ctx.signals.add({
        id: "live",
        kind: "power_live",
        a: new THREE.Vector3(-2.5, L.liveY, L.wallZ),
        b: new THREE.Vector3(0.45, L.liveY, L.wallZ),
      });
      ctx.signals.add({
        id: "live-occluded",
        kind: "power_live",
        a: new THREE.Vector3(0.45, L.liveY, L.wallZ),
        b: new THREE.Vector3(3.15, L.liveY, -3.4),
      });
      ctx.signals.add({
        id: "dummy",
        kind: "power_residual",
        a: new THREE.Vector3(-2.5, L.dummyY, L.wallZ),
        b: new THREE.Vector3(2.1, L.dummyY, L.wallZ),
      });
      ctx.signals.addOccluder({
        id: "panel",
        min: new THREE.Vector3(0.8, 0.2, -4.45),
        max: new THREE.Vector3(2.25, 2.4, -3.85),
        kind: "solid",
      });

      ctx.player.reset(0, 0, 3.15, 0.05);
      ctx.camera.yaw = 0.05;
      ctx.hud.setTask(TASK["P-S02-pick"] ?? "");

      ctx.interact.add({
        id: "lens",
        prompt: PROMPT.pickLens,
        position: new THREE.Vector3(L.desk.x, 0, L.desk.z),
        radius: 1.55,
        enabled: true,
        onUse: () => {
          if (!flags.take("lens")) return;
          ctx.flowLens.grantPickup();
          ctx.save.player.tool.flowLens = true;
          ctx.persist();
          if (lensMesh) lensMesh.visible = false;
          ctx.hud.setTask(TASK["P-S02-pulse"] ?? "");
          ctx.say(P_LINE.pickLens);
        },
      });
      ctx.interact.add({
        id: "relay",
        prompt: PROMPT.seatRelay,
        position: new THREE.Vector3(L.relay.x, 0, L.relay.z),
        radius: 1.45,
        enabled: true,
        onUse: () => seat(ctx),
      });
    },
    update(_dt, ctx) {
      elapsed += _dt;
      tickSceneRain(rain, _dt);
      if (ctx.flowLens.owned && elapsed > 10 && !hinted && pulsedAt < 0) {
        hinted = true;
        ctx.hud.setTask(TASK["P-S02-pulse"] ?? "按住 Q，對準牆，放開");
        ctx.say(P_LINE.pickLens);
      }
      if (ctx.flowLens.justPulsed) {
        pulsedAt = ctx.flowLens.time;
        if (flags.take("pulsed")) {
          ctx.hud.setTask(TASK["P-S02-follow"] ?? "");
          ctx.say(P_LINE.followFlow);
          const deadTag = ctx.root.getObjectByName("dead-tag");
          const liveTag = ctx.root.getObjectByName("live-tag");
          if (deadTag) deadTag.visible = true;
          if (liveTag) liveTag.visible = true;
        }
      }
      if (pulsedAt >= 0) {
        const age = ctx.flowLens.time - pulsedAt;
        if (dead) pulsePipe(dead, "dead", age);
        if (live) pulsePipe(live, "live", age);
        if (liveTail) pulsePipe(liveTail, "live", age);
        if (dummy) pulsePipe(dummy, "dummy", age);
      }

      const liveHit = ctx.flowLens.lastHits.find((hit) => hit.id.startsWith("live") && hit.lie === "live");
      if (liveHit) {
        const look = ctx.camera.lookDir();
        if ((look.dot(liveHit.dir) > 0.55 || ctx.player.position.x > 1.3) && flags.take("crosshair")) {
          ctx.say(P_LINE.livePath);
          ctx.hud.setTask(TASK["P-S02-seat"] ?? "");
        }
      }

      if (unlocked && (ctx.player.position.z < -5.4 && ctx.player.position.x > 2.2)) {
        ctx.completeAndGo();
      }
    },
    unmount() {
      rain = null;
      dead = null;
      live = null;
      liveTail = null;
      dummy = null;
      lock = null;
      span = null;
      lensMesh = null;
      exitDoor = null;
    },
  };

  function seat(ctx: Parameters<GameScene["mount"]>[0]): void {
    if (!ctx.flowLens.owned || seated) return;
    if (pulsedAt < 0 && elapsed < 14) return;
    const behind = ctx.player.position.x > 1.2 && ctx.player.position.z < -1.8;
    const sawLive = ctx.flowLens.lastHits.some((hit) => hit.id.startsWith("live") && hit.lie === "live");
    if (pulsedAt >= 0 && !behind && !sawLive) return;
    seated = true;
    if (lock) {
      const mat = lambertOf(lock);
      if (mat) {
        mat.color.setHex(0x7ec8c3);
        mat.emissive = new THREE.Color(0x3a8884);
        mat.emissiveIntensity = 0.75;
      }
    }
    if (span) {
      span.rotation.z = 0.55;
      span.position.set(5.1, -0.15, -6.1);
    }
    if (exitDoor) {
      const box = exitDoor.userData["aabb"] as { min: THREE.Vector3; max: THREE.Vector3 } | undefined;
      if (box) ctx.world.removeBox(box);
      exitDoor.visible = false;
    }
    unlocked = true;
    ctx.hud.setTask(TASK["P-S02-seat"] ?? "");
    ctx.interact.add({
      id: "exit-gap",
      prompt: "走過缺口",
      position: new THREE.Vector3(4.2, 0, -6.2),
      radius: 1.8,
      enabled: true,
      onUse: () => ctx.completeAndGo(),
    });
  }
}
