import * as THREE from "three";
import { PROMPT, TASK } from "../../content/copy";
import { P_LINE } from "../../content/prologue/ids";
import { P05_LAYOUT as L } from "../../content/prologue/layout";
import { P05 } from "../../content/prologue/script";
import { addSolidBox, boxMesh } from "../../engine/greybox";
import type { Aabb } from "../../engine/collision";
import type { GameScene } from "../types";
import {
  SceneVoice,
  addGate3,
  addSosBeacon,
  addWaterChannel,
  addXiaocenFigure,
  onceFlags,
  stormShell,
  tickSceneRain,
} from "./kit";

export function createEvacRun(): GameScene {
  const flags = onceFlags();
  const voice = new SceneVoice();
  let rain: THREE.Points | null = null;
  let water: ReturnType<typeof addWaterChannel> | null = null;
  let sos: ReturnType<typeof addSosBeacon> | null = null;
  let xiaocen: THREE.Group | null = null;
  let waterRise: THREE.Mesh | null = null;
  let doorBox: Aabb | null = null;
  let leverSeated = false;
  let elapsed = 0;
  let raising = false;
  let raiseT = 0;
  let failed = false;

  return {
    id: "P-S05",
    mount(ctx) {
      const lights = stormShell(ctx, true);
      rain = lights.rain;
      voice.startRumble();
      voice.setLayers(3);

      addSolidBox(ctx.root, ctx.world, 4.2, 0.4, 6.4, 0x2a3036, 0, -0.2, 9.2);
      addSolidBox(ctx.root, ctx.world, 3.4, 0.4, 18.4, 0x2a3036, L.corridorMouth.x, -0.2, -1.4);
      addSolidBox(ctx.root, ctx.world, 0.24, 2.3, 18.4, 0x1a2127, L.corridorMouth.x - 1.75, 1.05, -1.4);
      addSolidBox(ctx.root, ctx.world, 0.24, 2.3, 18.4, 0x1a2127, L.corridorMouth.x + 1.75, 1.05, -1.4);
      addSolidBox(ctx.root, ctx.world, 2.2, 0.12, 0.7, 0x6a6560, -0.2, 0.55, 5.7);
      const lifted = boxMesh(1.15, 0.12, 0.7, 0x8a8f86, -0.15, 0.72, 5.65);
      lifted.rotation.x = 0.62;
      ctx.root.add(lifted);

      const door = addSolidBox(ctx.root, ctx.world, 3.2, 2.2, 0.18, 0x3a322c, L.door.x, 1.1, L.door.z);
      doorBox = door.userData["aabb"] as Aabb | undefined ?? null;
      addSolidBox(ctx.root, ctx.world, 3.6, 0.4, 4.4, 0x2a3036, L.lift.x, -0.2, L.lift.z);
      addSolidBox(ctx.root, ctx.world, 3.6, 2.2, 0.25, 0x1a2127, L.lift.x, 1.0, L.lift.z - 2.1);

      const lever = boxMesh(0.12, 0.7, 0.12, 0xc9a36a, L.lever.x, L.lever.y, L.lever.z);
      ctx.root.add(lever);
      ctx.tether.grantPickup();
      if (!ctx.flowLens.owned) ctx.flowLens.grantPickup();
      ctx.tether.registerBody({ id: "lever", object: lever, mass: "light", shape: "lever" });
      ctx.tether.registerSocket({
        id: "lever-seat",
        shape: "lever",
        position: new THREE.Vector3(L.leverSeat.x, L.leverSeat.y, L.leverSeat.z),
        parent: ctx.root,
        onSeat: () => openDoor(ctx),
      });
      ctx.interact.add({
        id: "lever",
        prompt: "扣上拉桿",
        position: new THREE.Vector3(L.lever.x, 0, L.lever.z),
        radius: 1.6,
        enabled: true,
        onUse: () => {
          const body = ctx.tether.body("lever");
          const sock = ctx.tether.sockets.find((item) => item.id === "lever-seat");
          if (!body || !sock || leverSeated) return;
          body.object.position.copy(sock.position);
          body.seated = true;
          body.seatedIn = "lever-seat";
          sock.occupiedBy = "lever";
          openDoor(ctx);
        },
      });

      ctx.signals.add({
        id: "evac",
        kind: "emergency_pulse",
        a: new THREE.Vector3(L.corridorMouth.x, 1.25, 6.8),
        b: new THREE.Vector3(L.lift.x, 1.25, L.lift.z + 0.4),
      });

      water = addWaterChannel(ctx.root, -6, -3.2, 0);
      water.setDir(1);
      waterRise = new THREE.Mesh(
        new THREE.BoxGeometry(18, 0.4, 28),
        new THREE.MeshLambertMaterial({ color: 0x1a2c34, transparent: true, opacity: 0.35 }),
      );
      waterRise.position.set(0, -2.4, 0);
      ctx.root.add(waterRise);
      addGate3(ctx.root, -6, 10, 16).setRise(1);
      sos = addSosBeacon(ctx.root, L.xiaocen.x, L.xiaocen.y + 0.9, L.xiaocen.z);
      xiaocen = addXiaocenFigure(ctx.root, L.xiaocen.x, L.xiaocen.y, L.xiaocen.z);

      ctx.world.addHazard("old-span", "void", new THREE.Vector3(-2.2, -3, 4.6), new THREE.Vector3(1.1, -0.15, 6.2));
      ctx.world.addAnchor("mouth", L.corridorMouth.x, 0, L.corridorMouth.z);
      ctx.world.addAnchor("mid", L.lever.x, 0, L.lever.z);
      ctx.world.addAnchor("lift", L.lift.x, 0, L.lift.z);
      ctx.world.killY = -2.2;

      ctx.player.reset(L.corridorMouth.x, 0, L.corridorMouth.z + 2.2, 0);
      ctx.camera.yaw = 0;
      ctx.hud.setTask(TASK["P-S05-run"] ?? "");
      ctx.say(P_LINE.whitePulse);
      ctx.hud.setStorm(ctx.save.settings.relaxedTimer ? null : 1);
      ctx.hud.setRelaxed(ctx.save.settings.relaxedTimer);

      ctx.interact.add({
        id: "lift",
        prompt: PROMPT.holdLift,
        position: new THREE.Vector3(L.lift.x, 0, L.lift.z),
        radius: 1.7,
        holdSeconds: ctx.save.settings.holdAlternatives ? P05.liftHoldAlt : P05.liftHold,
        enabled: false,
        onUse: () => {
          if (!leverSeated) return;
          raising = true;
        },
      });
    },
    update(dt, ctx) {
      elapsed += dt;
      tickSceneRain(rain, dt);
      water?.tick(dt);
      sos?.tick(elapsed);
      const relaxed = ctx.save.settings.relaxedTimer;
      const holding = ctx.interact.focused?.id === "lift" && ctx.interact.hold01 > 0;
      if (!relaxed) ctx.hud.setStorm(Math.max(0, 1 - elapsed / P05.evacSeconds));
      const flood = Math.min(relaxed ? 0.82 : 1, elapsed / P05.evacSeconds);
      if (waterRise) waterRise.position.y = -2.4 + flood * 2.3;

      if (ctx.player.position.z < 2 && flags.take("slip")) {
        ctx.say(P_LINE.deckSlips);
      }
      if (ctx.player.position.z < L.lift.z + 2.2 && flags.take("see")) {
        ctx.say(P_LINE.holdOn);
        ctx.hud.setTask(TASK["P-S05-hold"] ?? "");
      }

      if (!relaxed && elapsed > P05.evacSeconds && !holding && !raising && !failed) {
        failed = true;
        ctx.say(P_LINE.waterRetry);
        ctx.player.pullTo(new THREE.Vector3(L.corridorMouth.x, 0, L.corridorMouth.z), "water");
        elapsed = 0;
        failed = false;
        ctx.hud.setStorm(1);
        ctx.hud.setTask(TASK["P-S05-run"] ?? "");
      }

      if (raising) {
        raiseT += dt;
        if (xiaocen) xiaocen.position.y = THREE.MathUtils.lerp(L.xiaocen.y, 0.05, Math.min(1, raiseT / 1.6));
        if (raiseT > 1.7 && flags.take("up")) {
          ctx.say(P_LINE.nowRun);
          ctx.completeAndGo();
        }
      }
    },
    unmount() {
      rain = null;
      water = null;
      sos = null;
      xiaocen = null;
      waterRise = null;
      doorBox = null;
      voice.dispose();
    },
  };

  function openDoor(ctx: Parameters<GameScene["mount"]>[0]): void {
    leverSeated = true;
    if (doorBox) ctx.world.removeBox(doorBox);
    const lift = ctx.interact.items.find((item) => item.id === "lift");
    if (lift) lift.enabled = true;
    ctx.hud.setTask(TASK["P-S05-hold"] ?? "");
  }
}
