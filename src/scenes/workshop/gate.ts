import * as THREE from "three";
import { PROMPT, TASK } from "../../content/copy";
import type { GameScene } from "../types";
import {
  promoterGate,
  regulatorYoke,
  reporterLamp,
  sensorBlock,
  setEmissive,
  shapeFlag,
  smokePlume,
} from "./kit";
import { makeWorldLabel } from "../../engine/worldHints";
import { ensureWorkshopTools, finishWhenIdle, mountHall, spawnWorkshopPlayer, tickPad } from "./room";

export function createGateScene(): GameScene {
  let time = 0;
  let darkRun = false;
  let smokeOn = false;
  let delay = 0;
  let lit = false;
  let traced = false;
  let flagged = false;
  let saidIn = false;
  let saidFlag = false;
  let darkDwell = 0;
  const finish = { armed: false, wait: 0 };
  let pad: THREE.Group | null = null;
  let smoke: THREE.Group | null = null;
  let yoke: THREE.Group | null = null;
  let gate: THREE.Group | null = null;
  let lamp: THREE.Group | null = null;
  let flag: THREE.Group | null = null;
  let leaf: THREE.Object3D | null = null;
  let arm: THREE.Object3D | null = null;
  let cloth: THREE.Object3D | null = null;

  return {
    id: "W-S03",
    mount(ctx) {
      pad = mountHall(ctx, 20, 11).pad;
      ensureWorkshopTools(ctx);
      spawnWorkshopPlayer(ctx, 0, 7.4, 0);
      ctx.hud.setTask(TASK["W-S03-smoke"] ?? "");
      ctx.bioRig.reporterShape = "lamp";
      ctx.bioRig.gateOpen = false;

      const sensor = sensorBlock();
      sensor.position.set(-2.4, 0.7, -2.2);
      yoke = regulatorYoke();
      yoke.position.set(-0.5, 0.75, -2.2);
      gate = promoterGate();
      gate.position.set(1.3, 0.8, -2.2);
      lamp = reporterLamp();
      lamp.position.set(3.6, 0.55, -2.2);
      ctx.root.add(sensor, yoke, gate, lamp);
      const t1 = makeWorldLabel("感應器", "感到煙霧");
      t1.position.set(-2.4, 1.85, -2.2);
      const t2 = makeWorldLabel("閘門", "決定過不過");
      t2.position.set(1.3, 2.05, -2.2);
      const t3 = makeWorldLabel("報告燈", "讓人看見結果");
      t3.position.set(3.6, 1.85, -2.2);
      ctx.root.add(t1, t2, t3);
      leaf = gate.getObjectByName("gate-leaf") ?? null;
      arm = yoke.getObjectByName("yoke-arm") ?? null;

      const machine = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.9, 0.7),
        new THREE.MeshLambertMaterial({ color: 0x4a5558 }),
      );
      machine.position.set(-4.2, 0.45, -0.2);
      ctx.root.add(machine);
      smoke = smokePlume();
      smoke.position.set(-4.2, 0.9, -0.2);
      ctx.root.add(smoke);

      const handle = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.42, 0.16),
        new THREE.MeshLambertMaterial({ color: 0x8aa0b8, emissive: 0x3a5058, emissiveIntensity: 0.25 }),
      );
      handle.position.set(-4.2, 0.7, 1.4);
      ctx.root.add(handle);
      ctx.tether.registerBody({ id: "smoke", object: handle, mass: "light", shape: "smoke" });
      ctx.tether.registerSocket({
        id: "smoke-on",
        shape: "smoke",
        position: new THREE.Vector3(-4.2, 0.85, -0.2),
        parent: ctx.root,
        onSeat: () => openSmoke(ctx),
        onUnseat: () => closeSmoke(ctx),
      });

      flag = shapeFlag();
      flag.position.set(4.4, 0.55, 1.8);
      ctx.root.add(flag);
      ctx.tether.registerBody({ id: "flag", object: flag, mass: "light", shape: "flag" });
      ctx.tether.registerSocket({
        id: "reporter",
        shape: "flag",
        position: new THREE.Vector3(3.85, 1.15, -2.2),
        parent: ctx.root,
        onSeat: () => seatFlag(ctx),
      });
      cloth = flag.getObjectByName("flag-cloth") ?? null;

      ctx.signals.add({
        id: "sense-reg",
        kind: "workshop_trace",
        a: new THREE.Vector3(-2.4, 1.1, -2.2),
        b: new THREE.Vector3(-0.5, 1.1, -2.2),
        enabled: false,
      });
      ctx.signals.add({
        id: "reg-gate",
        kind: "workshop_trace",
        a: new THREE.Vector3(-0.5, 1.1, -2.2),
        b: new THREE.Vector3(1.4, 1.1, -2.2),
        enabled: false,
      });
      ctx.signals.add({
        id: "gate-rep",
        kind: "workshop_trace",
        a: new THREE.Vector3(1.4, 1.1, -2.2),
        b: new THREE.Vector3(3.6, 1.15, -2.2),
        enabled: false,
      });

      const padMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.55, 0.08, 16),
        new THREE.MeshLambertMaterial({ color: 0x2a3436, emissive: 0x7ec8c3, emissiveIntensity: 0.2 }),
      );
      padMesh.position.set(0, 0.05, 4.2);
      ctx.root.add(padMesh);
      ctx.interact.add({
        id: "dark-run",
        prompt: PROMPT.interact,
        position: new THREE.Vector3(0, 0, 4.2),
        radius: 1.5,
        enabled: true,
        onUse: () => observeDark(ctx),
      });
    },
    update(dt, ctx) {
      time += dt;
      if (pad) tickPad(pad, time, ctx.reducedMotion);
      if (!darkRun && ctx.player.position.z > 3.2 && ctx.camera.lookDir().z < -0.55) {
        darkDwell += dt;
        if (darkDwell > (ctx.save.settings.holdAlternatives ? 0.15 : 0.7)) observeDark(ctx);
      } else {
        darkDwell = 0;
      }
      if (smokeOn && !traced && ctx.player.position.x > 2.8 && ctx.player.position.z < -1.4) {
        markTraced(ctx);
      }
      if (smokeOn && smoke) {
        smoke.visible = true;
        smoke.rotation.y = ctx.reducedMotion ? 0 : time * 0.4;
        smoke.position.y = 0.9 + (ctx.reducedMotion ? 0 : Math.sin(time * 1.6) * 0.05);
      }
      if (smokeOn) {
        delay += dt;
        if (delay >= (ctx.reducedMotion ? 0.05 : 0.5)) lit = true;
      } else {
        delay = 0;
        lit = false;
      }
      const open = smokeOn && darkRun;
      ctx.bioRig.gateOpen = open;
      if (leaf) leaf.rotation.y = open ? -1.15 : 0;
      if (arm) arm.rotation.z = open ? -0.45 : 0;
      if (lamp) setEmissive(lamp, lit ? 0.85 : 0.08, lit ? 0xef6a1a : 0x2a1008);
      if (flagged && cloth) {
        cloth.rotation.y = ctx.reducedMotion ? 0.2 : Math.sin(time * 5) * 0.35;
        setEmissive(cloth, lit ? 0.9 : 0.12, 0x3a8884);
      }

      if (smokeOn && !traced) {
        const hits = ctx.flowLens.lastHits;
        const saw = hits.some((hit) => hit.id === "sense-reg" || hit.id === "reg-gate" || hit.id === "gate-rep");
        if (saw) markTraced(ctx);
      }
      if (flagged && lit && !saidFlag) {
        saidFlag = true;
        ctx.queueLines(saidIn ? ["W-S03-D002", "W-S03-D003"] : ["W-S03-D001", "W-S03-D002", "W-S03-D003"]);
      }
      if (darkRun && smokeOn && traced && flagged && !finish.armed) finish.armed = true;
      finishWhenIdle(finish, dt, ctx);
    },
    unmount() {
      time = 0;
      darkRun = false;
      smokeOn = false;
      delay = 0;
      lit = false;
      traced = false;
      flagged = false;
      saidIn = false;
      saidFlag = false;
      darkDwell = 0;
      finish.armed = false;
      finish.wait = 0;
      pad = null;
      smoke = null;
      yoke = null;
      gate = null;
      lamp = null;
      flag = null;
      leaf = null;
      arm = null;
      cloth = null;
    },
  };

  function observeDark(ctx: import("../types").SceneContext): void {
    if (darkRun) return;
    darkRun = true;
    lit = false;
    ctx.bioRig.gateOpen = false;
    ctx.hud.setTask(TASK["W-S03-smoke"] ?? "");
    if (ctx.tether.seatedIn("smoke-on")) openSmoke(ctx);
  }

  function markTraced(ctx: import("../types").SceneContext): void {
    if (traced) return;
    traced = true;
    ctx.hud.setTask(TASK["W-S03-flag"] ?? "");
    if (!saidIn) {
      saidIn = true;
      ctx.say("W-S03-D001");
    }
  }

  function openSmoke(ctx: import("../types").SceneContext): void {
    if (!darkRun) {
      ctx.hud.setTask(TASK["W-S03-smoke"] ?? "");
      return;
    }
    smokeOn = true;
    ctx.signals.setEnabled("sense-reg", true);
    ctx.signals.setEnabled("reg-gate", true);
    ctx.signals.setEnabled("gate-rep", true);
    ctx.hud.setTask(TASK["W-S03-trace"] ?? "");
  }

  function closeSmoke(ctx: import("../types").SceneContext): void {
    smokeOn = false;
    lit = false;
    if (smoke) smoke.visible = false;
    ctx.signals.setEnabled("sense-reg", false);
    ctx.signals.setEnabled("reg-gate", false);
    ctx.signals.setEnabled("gate-rep", false);
    ctx.bioRig.gateOpen = false;
  }

  function seatFlag(ctx: import("../types").SceneContext): void {
    flagged = true;
    ctx.bioRig.swapReporter("flag");
    if (lamp) lamp.visible = false;
    if (darkRun && smokeOn && traced) finish.armed = true;
    else ctx.hud.setTask(traced ? TASK["W-S03-flag"] ?? "" : TASK["W-S03-trace"] ?? "");
  }
}
