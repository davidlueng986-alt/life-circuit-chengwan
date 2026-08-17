import * as THREE from "three";
import { PROMPT, TASK, UI } from "../../content/copy";
import { pushRun } from "../../content/progress";
import type { GameScene } from "../types";
import { consoleDesk, jointBlock, moonIcon, sealedLane, setEmissive, sunIcon, unknownIcon } from "./kit";

import { ensureWorkshopTools, finishWhenIdle, mountHall, spawnWorkshopPlayer, tickPad } from "./room";

export function createRefsScene(): GameScene {
  let time = 0;
  let ranOnce = false;
  let jointFixed = false;
  let validRun = false;
  let saidDark = false;
  let saidBlock = false;
  let saidNames = false;
  const finish = { armed: false, wait: 0 };
  let pad: THREE.Group | null = null;
  let moon: THREE.Group | null = null;
  let sun: THREE.Group | null = null;
  let unknown: THREE.Group | null = null;
  let hatch: THREE.Mesh | null = null;
  let startedAt = 0;

  return {
    id: "W-S04",
    mount(ctx) {
      pad = mountHall(ctx, 18, 12).pad;
      ensureWorkshopTools(ctx);
      spawnWorkshopPlayer(ctx, 0, 5.8, 0);
      ctx.hud.setTask(TASK["W-S04-refs"] ?? "");
      ctx.docks.reset(true);
      ctx.bioRig.owned = true;
      ctx.bioRig.placeAt(new THREE.Vector3(0, 0.85, -0.4));

      const desk = consoleDesk();
      desk.position.set(0, 0.75, 1.4);
      ctx.root.add(desk);

      const moonLane = sealedLane(2.2, 3.2);
      moonLane.position.set(-3.2, 0.08, -3.4);
      const sunLane = sealedLane(2.2, 3.2);
      sunLane.position.set(0, 0.08, -3.4);
      const unkLane = sealedLane(2.2, 3.2);
      unkLane.position.set(3.2, 0.08, -3.4);
      ctx.root.add(moonLane, sunLane, unkLane);

      moon = moonIcon();
      moon.position.set(-3.2, 1.15, -3.4);
      sun = sunIcon();
      sun.position.set(0, 1.15, -3.4);
      unknown = unknownIcon();
      unknown.position.set(3.2, 1.15, -3.4);
      ctx.root.add(moon, sun, unknown);

      hatch = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 1.5, 0.12),
        new THREE.MeshLambertMaterial({ color: 0x3a4044 }),
      );
      hatch.position.set(3.2, 0.85, -5.1);
      ctx.root.add(hatch);

      const joint = jointBlock();
      joint.position.set(1.55, 0.45, -2.15);
      ctx.root.add(joint);
      ctx.tether.registerBody({ id: "joint", object: joint, mass: "light", shape: "joint" });
      ctx.tether.registerSocket({
        id: "sun-joint",
        shape: "joint",
        position: new THREE.Vector3(0.55, 0.55, -3.05),
        parent: ctx.root,
        onSeat: () => {
          jointFixed = true;
          ctx.hud.setTask(TASK["W-S04-refs"] ?? "");
        },
      });

      ctx.signals.add({
        id: "sun-cut",
        kind: "device_link",
        a: new THREE.Vector3(0, 0.9, -3.4),
        b: new THREE.Vector3(1.2, 0.5, -2.3),
      });
      ctx.signals.add({
        id: "sun-live",
        kind: "workshop_trace",
        a: new THREE.Vector3(0, 0.9, -3.4),
        b: new THREE.Vector3(0.55, 0.55, -3.05),
        enabled: false,
      });

      ctx.interact.add({
        id: "run",
        prompt: TASK["W-S04-refs"] ?? PROMPT.interact,
        position: new THREE.Vector3(0, 0, 1.4),
        radius: 1.6,
        enabled: true,
        onUse: () => runModel(ctx),
      });
      ctx.interact.add({
        id: "unknown",
        prompt: TASK["W-S04-unknown"] ?? PROMPT.unknownDock,
        position: new THREE.Vector3(3.2, 0, -3.4),
        radius: 1.5,
        enabled: true,
        onUse: () => readUnknown(ctx),
      });
    },
    update(dt, ctx) {
      time += dt;
      if (pad) tickPad(pad, time, ctx.reducedMotion);
      paintLanes(ctx);
      if (validRun && hatch) {
        hatch.position.y = ctx.reducedMotion ? 2.4 : THREE.MathUtils.lerp(hatch.position.y, 2.4, 1 - Math.pow(0.02, dt));
      }
      if (validRun && sun) sun.rotation.z = ctx.reducedMotion ? 0 : time * 0.7;
      if (validRun && unknown) {
        unknown.position.y = 1.15 + (ctx.reducedMotion ? 0 : Math.sin(time * 3.2) * 0.06);
      }
      finishWhenIdle(finish, dt, ctx);
    },
    unmount() {
      time = 0;
      ranOnce = false;
      jointFixed = false;
      validRun = false;
      saidDark = false;
      saidBlock = false;
      saidNames = false;
      finish.armed = false;
      finish.wait = 0;
      pad = null;
      moon = null;
      sun = null;
      unknown = null;
      hatch = null;
    },
  };

  function runModel(ctx: import("../types").SceneContext): void {
    if (!ranOnce) {
      ranOnce = true;
      startedAt = performance.now();
      ctx.docks.moon.output = "low";
      ctx.docks.sun.output = "low";
      ctx.docks.unknown.output = "low";
      ctx.docks.portsOk = false;
      pushRun(ctx.save, {
        id: `W-S04-sun-${Date.now()}`,
        scene: "W-S04",
        at: new Date().toISOString(),
        kind: "workshop_channel",
        outputBand: "low",
        readable: false,
        loadout: ctx.save.c1.loadout,
        retained: true,
      });
      ctx.persist();
      if (!saidDark) {
        saidDark = true;
        ctx.say("W-S04-D001");
      }
      ctx.hud.setTask(TASK["W-S04-fix"] ?? "");
      stamp(ctx);
      return;
    }
    if (!jointFixed) {
      ctx.hud.setTask(TASK["W-S04-fix"] ?? "");
      return;
    }
    ctx.docks.repairSun();
    ctx.docks.moon.output = "low";
    ctx.docks.sun.output = "high";
    ctx.docks.unknown.output = "fluctuating";
    ctx.signals.setEnabled("sun-cut", false);
    ctx.signals.setEnabled("sun-live", true);
    validRun = true;
    pushRun(ctx.save, {
      id: `W-S04-valid-${Date.now()}`,
      scene: "W-S04",
      at: new Date().toISOString(),
      kind: "workshop_channel",
      outputBand: "high",
      readable: true,
      loadout: ctx.save.c1.loadout,
      retained: true,
    });
    ctx.persist();
    if (!saidNames) {
      saidNames = true;
      ctx.say("W-S04-D003");
    }
    ctx.hud.setTask(TASK["W-S04-unknown"] ?? "");
    stamp(ctx);
  }

  function readUnknown(ctx: import("../types").SceneContext): void {
    if (!validRun || !ctx.docks.unknownOpen) {
      if (ranOnce && !saidBlock) {
        saidBlock = true;
        ctx.say("W-S04-D002");
      }
      return;
    }
    ctx.docks.unknown.output = "fluctuating";
    pushRun(ctx.save, ctx.docks.record("W-S04", "unknown", ctx.save.c1.loadout));
    ctx.save.evidence.controlRunBeforeClaim = true;
    ctx.persist();
    ctx.say("W-S04-D004");
    finish.armed = true;
    stamp(ctx);
  }

  function stamp(ctx: import("../types").SceneContext): void {
    const sec = Math.max(0, Math.floor((performance.now() - startedAt) / 1000));
    ctx.workbench.openDocks(ctx.save, validRun, ctx.docks.unknownOpen, `${sec} 秒`);
    const mark = document.querySelector("#workbench .sim-mark");
    if (mark instanceof HTMLElement) mark.textContent = UI.simMark;
  }

  function paintLanes(ctx: import("../types").SceneContext): void {
    if (moon) setEmissive(moon, 0.08, 0x3a4858);
    if (sun) setEmissive(sun, validRun ? 0.85 : 0.08, validRun ? 0xc9a227 : 0x3a2a08);
    if (unknown) {
      const wave = validRun ? 0.35 + (ctx.reducedMotion ? 0.2 : 0.25 * Math.sin(time * 5)) : 0.08;
      setEmissive(unknown, wave, validRun ? 0x8aa0b8 : 0x2a3034);
    }
  }
}
