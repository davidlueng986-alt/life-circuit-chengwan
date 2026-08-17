import * as THREE from "three";
import { C1_LAYOUT, C1_OVERSTAY, C1_SATURATE_DELAY } from "../../../content/chapter1/layout";
import { keepSaturatedRun } from "../../../content/chapter1/state";
import { PROMPT, TASK } from "../../content/copy";
import { addSolidBox, tickRain } from "../../engine/greybox";
import type { GameScene, SceneContext } from "../types";
import { lightHarbor, mountEastShore, mountWater, xyz } from "./kit";

export function createC1S02(): GameScene {
  let clock = 0;
  let saturated = false;
  let evac = false;
  let flipped = false;
  let forced = false;
  let rain: THREE.Points | null = null;
  const origin = new THREE.Vector3();
  let startYaw = 0;
  const tried = { turn: false, leave: false, relay: false };

  return {
    id: "C1-S02",
    mount(ctx) {
      rain = lightHarbor(ctx, "storm");
      mountEastShore(ctx, { floodPier: false });
      mountWater(ctx);
      ctx.world.addAnchor("slot", C1_LAYOUT.spawnS02[0], 0, C1_LAYOUT.spawnS02[2]);
      ctx.world.addAnchor("van", C1_LAYOUT.vanMouth[0], C1_LAYOUT.vanMouth[1], C1_LAYOUT.vanMouth[2]);

      ctx.bioRig.grantPickup(ctx.save.c1.loadout);
      ctx.bioRig.carry();
      ctx.bioRig.setHeadingTarget(new THREE.Vector3(0.1, 0, 1));
      ctx.signals.add({
        id: "still-line",
        kind: "probe_bearing",
        a: new THREE.Vector3(0.4, 0.8, 36),
        b: new THREE.Vector3(0.8, 0.8, 44),
      });
      ctx.signals.add({
        id: "env-relay",
        kind: "device_link",
        a: xyz(C1_LAYOUT.envRelay),
        b: new THREE.Vector3(0.4, 1.1, 38.4),
      });
      addSolidBox(ctx.root, ctx.world, 0.4, 1.2, 0.4, 0x8aa0b8, C1_LAYOUT.envRelay[0], C1_LAYOUT.envRelay[1], C1_LAYOUT.envRelay[2]);
      addSolidBox(ctx.root, ctx.world, 1.4, 2.2, 1.4, 0x5a6570, C1_LAYOUT.lift[0], 1.1, C1_LAYOUT.lift[2]);
      addSolidBox(ctx.root, ctx.world, 4.4, 0.28, 0.7, 0x6a7068, C1_LAYOUT.beam[0], C1_LAYOUT.beam[1], C1_LAYOUT.beam[2]);

      ctx.player.reset(C1_LAYOUT.spawnS02[0], C1_LAYOUT.spawnS02[1], C1_LAYOUT.spawnS02[2], Math.PI);
      ctx.camera.yaw = Math.PI;
      ctx.hud.setTask(TASK["C1-S01-hunt"] ?? "");
      origin.copy(ctx.player.position);
      startYaw = ctx.camera.yaw;
      if (ctx.save.c1.loadout === "crash_shell") ctx.player.walkSpeed = 3.15;

      ctx.interact.add({
        id: "kill-relay",
        prompt: PROMPT.killRelay,
        position: xyz(C1_LAYOUT.envRelay),
        radius: 1.6,
        enabled: true,
        onUse: () => {
          if (!saturated || tried.relay) return;
          tried.relay = true;
          ctx.bioRig.testsTried.relay = true;
          ctx.signals.setEnabled("env-relay", false);
          ctx.hud.announce("燈關了。探頭還是滿。");
          maybeFlip(ctx);
        },
      });
    },
    update(dt, ctx) {
      clock += dt;
      if (rain) tickRain(rain, dt);

      if (!saturated && clock >= C1_SATURATE_DELAY) {
        saturated = true;
        ctx.bioRig.saturated = true;
        ctx.signals.saturated = true;
        ctx.bioRig.setHeadingTarget(null);
        origin.copy(ctx.player.position);
        startYaw = ctx.camera.yaw;
        ctx.hud.setTask("全紅了。試轉身、走開、關那根燈");
        const wash = new THREE.Mesh(
          new THREE.SphereGeometry(1.1, 12, 10),
          new THREE.MeshBasicMaterial({ color: 0xc44a3a, transparent: true, opacity: 0.45, depthWrite: false }),
        );
        wash.name = "sat-wash";
        wash.position.copy(ctx.player.position).setY(1.2);
        ctx.root.add(wash);
      }
      const wash = ctx.root.getObjectByName("sat-wash");
      if (wash) wash.position.copy(ctx.player.position).setY(1.2);

      if (saturated && !flipped) {
        const yawDelta = Math.abs(wrap(ctx.camera.yaw - startYaw));
        if (!tried.turn && yawDelta > 2.2 && ctx.player.position.distanceTo(origin) < 2.2) {
          tried.turn = true;
          ctx.bioRig.testsTried.turn = true;
          ctx.say("C1-S02-D001");
          ctx.hud.announce("轉了。還是滿。");
        }
        if (!tried.leave && ctx.player.position.distanceTo(origin) > 4.2) {
          tried.leave = true;
          ctx.bioRig.testsTried.leave = true;
          ctx.say("C1-S02-D002");
          ctx.hud.announce("走開了。還是滿。");
        }
        maybeFlip(ctx);
        if (!flipped && clock > C1_SATURATE_DELAY + 12) {
          const missing = [
            !tried.turn ? "轉身" : "",
            !tried.leave ? "走開" : "",
            !tried.relay ? "關那根燈" : "",
          ].filter(Boolean);
          if (missing.length) ctx.hud.setTask(`還是滿。再試：${missing.join("、")}`);
        }
      }

      if (evac && !forced) {
        const limit = ctx.save.settings.relaxedTimer ? 999 : C1_OVERSTAY;
        if (clock > C1_SATURATE_DELAY + limit) {
          forced = true;
          ctx.suggestRelaxed();
          ctx.completeAndGo();
        }
      }
    },
    unmount() {
      rain = null;
      saturated = false;
      evac = false;
      flipped = false;
      forced = false;
      tried.turn = false;
      tried.leave = false;
      tried.relay = false;
    },
  };

  function maybeFlip(ctx: SceneContext): void {
    if (flipped || !tried.turn || !tried.leave || !tried.relay) return;
    flipped = true;
    evac = true;
    ctx.bioRig.selfTestBlink = true;
    ctx.queueLines(["C1-S02-D003", "C1-S02-D004"]);
    ctx.hud.setTask(TASK["C1-S02"] ?? "");
    keepSaturatedRun(ctx.save);
    ctx.persist();
    mountEastShoreEvac(ctx);
    armExits(ctx);
  }
}

function mountEastShoreEvac(ctx: SceneContext): void {
  ctx.world.addHazard("pier-tide", "water", new THREE.Vector3(5, -1, 7), new THREE.Vector3(16, 0.55, 16));
  ctx.signals.add({
    id: "evac-lamps",
    kind: "emergency_pulse",
    a: new THREE.Vector3(0.4, 1.4, 38),
    b: new THREE.Vector3(-11.2, 2.2, 39.2),
  });
}

function armExits(ctx: SceneContext): void {
  const battery = ctx.save.c1.loadout === "battery";
  if (battery) {
    ctx.interact.add({
      id: "short-lift",
      prompt: PROMPT.holdLift,
      position: xyz(C1_LAYOUT.lift),
      radius: 1.6,
      holdSeconds: ctx.save.settings.holdAlternatives ? 0 : 1.2,
      enabled: true,
      onUse: () => {
        ctx.player.reset(C1_LAYOUT.vanMouth[0], C1_LAYOUT.vanMouth[1], C1_LAYOUT.vanMouth[2], Math.PI * 0.5);
      },
    });
  }
  ctx.interact.add({
    id: "van",
    prompt: PROMPT.advance,
    position: xyz(C1_LAYOUT.vanMouth),
    radius: 2.1,
    enabled: true,
    onUse: () => ctx.completeAndGo(),
  });
  if (!battery) {
    ctx.world.addAnchor("beam", C1_LAYOUT.beam[0], 1.1, C1_LAYOUT.beam[2]);
    addSolidBox(ctx.root, ctx.world, 7.2, 0.28, 0.8, 0x6a7068, 1.2, 1.15, 36.6);
  }
}

function wrap(value: number): number {
  let next = value;
  while (next > Math.PI) next -= Math.PI * 2;
  while (next < -Math.PI) next += Math.PI * 2;
  return next;
}
