import * as THREE from "three";
import { PROMPT, TASK } from "../content/copy";
import type { SceneId } from "../content/ids";
import { HARBOR, addSolidBox, applyFog, boxMesh } from "../engine/greybox";
import type { GameScene, SceneContext } from "./types";

export function createHarborToolScene(id: SceneId): GameScene {
  if (id === "C1-S01") return createHunt();
  if (id === "C1-S04") return createZone();
  return createSluice();
}

function room(ctx: SceneContext): void {
  applyFog(ctx.three, HARBOR, ctx.reducedMotion);
  ctx.root.add(new THREE.HemisphereLight(0xc9b39a, 0x101214, 0.6));
  addSolidBox(ctx.root, ctx.world, 18, 0.4, 20, HARBOR.floor, 0, -0.2, 0);
  addSolidBox(ctx.root, ctx.world, 18, 3.2, 0.35, HARBOR.wall, 0, 1.4, -10);
  addSolidBox(ctx.root, ctx.world, 18, 3.2, 0.35, HARBOR.wall, 0, 1.4, 10);
  addSolidBox(ctx.root, ctx.world, 0.35, 3.2, 20, HARBOR.wall, -9, 1.4, 0);
  addSolidBox(ctx.root, ctx.world, 0.35, 3.2, 20, HARBOR.wall, 9, 1.4, 0);
}

function createHunt(): GameScene {
  let woke = false;
  let recorded = false;
  let saidMarket = false;
  return {
    id: "C1-S01",
    mount(ctx) {
      room(ctx);
      ctx.bioRig.grantPickup(ctx.save.c1.loadout);
      ctx.bioRig.carry();
      ctx.bioRig.setHeadingTarget(new THREE.Vector3(-0.35, 0, -1));
      ctx.signals.add({
        id: "env",
        kind: "env_flow",
        a: new THREE.Vector3(2.4, 0.6, 4),
        b: new THREE.Vector3(-1.6, 0.6, -6.4),
      });
      ctx.signals.add({
        id: "city",
        kind: "city_light",
        a: new THREE.Vector3(6.4, 2.4, -7.4),
        b: new THREE.Vector3(6.4, 2.8, -7.4),
      });
      const crate = boxMesh(1.1, 0.5, 0.9, 0x6a5340, 2.6, 0.35, -1.2);
      ctx.root.add(crate);
      ctx.tether.registerBody({
        id: "float",
        object: crate,
        mass: "medium",
        shape: "crate",
        walkSize: new THREE.Vector3(1.2, 0.4, 1),
      });
      ctx.tether.registerSocket({
        id: "step",
        shape: "crate",
        position: new THREE.Vector3(0.4, 0.2, -3.4),
        parent: ctx.root,
      });
      addSolidBox(ctx.root, ctx.world, 1.2, 1.8, 0.3, 0x5a4034, 6.4, 0.9, -8.4);
      ctx.player.reset(0, 0, 6.4, Math.PI);
      ctx.camera.yaw = Math.PI;
      ctx.hud.setTask(TASK["C1-S01-hunt"] ?? "");
    },
    update(_dt, ctx) {
      if (!woke && ctx.bioRig.triangleFill > 0.2) {
        woke = true;
        ctx.say("C1-S01-D001");
      }
      if (!saidMarket && ctx.player.position.x > 4.6) {
        saidMarket = true;
        ctx.say("C1-S01-D002");
      }
      if (!recorded && ctx.bioRig.triangleFill > 0.72 && ctx.player.position.z < -4.4) {
        recorded = true;
        ctx.hud.setTask(TASK["C1-S01-back"] ?? "");
        ctx.say("C1-S01-D004");
        ctx.interact.add({
          id: "back",
          prompt: PROMPT.advance,
          position: new THREE.Vector3(0, 0, 7.2),
          radius: 1.8,
          enabled: true,
          onUse: () => ctx.completeAndGo(),
        });
      }
    },
    unmount() {
      woke = false;
      recorded = false;
      saidMarket = false;
    },
  };
}

function createZone(): GameScene {
  let parked = 0;
  let accepted = false;
  const pads = [new THREE.Vector3(-3.4, 0.2, -4.2), new THREE.Vector3(4.6, 0.2, -6.2)];
  return {
    id: "C1-S04",
    mount(ctx) {
      room(ctx);
      ctx.bioRig.grantPickup(ctx.save.c1.loadout);
      ctx.bioRig.carry();
      ctx.bioRig.setHeadingTarget(new THREE.Vector3(0.2, 0, -1));
      const b1 = boxMesh(0.35, 0.7, 0.35, 0x8aa0b8, -4.6, 0.4, 2.4);
      const b2 = boxMesh(0.35, 0.7, 0.35, 0x8aa0b8, -3.6, 0.4, 2.4);
      ctx.root.add(b1, b2);
      addSolidBox(ctx.root, ctx.world, 1.6, 1.6, 0.4, 0x4a4034, 1.2, 0.8, -3.2);
      ctx.signals.addOccluder({
        id: "near-wall",
        min: new THREE.Vector3(0.2, 0, -3.6),
        max: new THREE.Vector3(2.2, 2.2, -2.8),
        kind: "solid",
      });
      ctx.tether.registerBody({ id: "beacon-0", object: b1, mass: "medium", shape: "beacon" });
      ctx.tether.registerBody({ id: "beacon-1", object: b2, mass: "fragile", shape: "beacon" });
      pads.forEach((pad, index) => {
        ctx.tether.registerSocket({
          id: `pad-${index}`,
          shape: "beacon",
          position: pad.clone().setY(0.45),
          parent: ctx.root,
          onSeat: (id) => park(ctx, index, id),
        });
      });
      ctx.player.reset(0, 0, 6, Math.PI);
      ctx.camera.yaw = Math.PI;
      ctx.hud.setTask(TASK["C1-S04"] ?? "");
      ctx.say("C1-S04-D001");
    },
    update(_dt, ctx) {
      const look = ctx.camera.lookDir();
      ctx.triangulation.handheld = ctx.triangulation.makeCone(ctx.player.position, look, {
        readable: ctx.save.c1.controlsRestored && ctx.bioRig.fieldReadable(ctx.save),
        saturated: ctx.bioRig.saturated,
        lie: "live",
      });
      if (accepted) return;
      const result = ctx.triangulation.overlap();
      if (result.accepted && parked >= 1) {
        accepted = true;
        ctx.say("C1-S04-D005");
        ctx.hud.setTask(TASK["C1-S04-ok"] ?? "");
        ctx.interact.add({
          id: "hand-off",
          prompt: PROMPT.advance,
          position: new THREE.Vector3(0, 0, 6.4),
          radius: 1.8,
          enabled: true,
          onUse: () => ctx.completeAndGo(),
        });
      }
    },
    unmount() {
      parked = 0;
      accepted = false;
    },
  };

  function park(ctx: SceneContext, index: number, _id: string): void {
    parked += 1;
    const pad = pads[index];
    if (!pad) return;
    const dir = new THREE.Vector3(0, 0, -1);
    const occluded = index === 0;
    ctx.triangulation.setBeacon(
      index,
      ctx.triangulation.makeCone(pad, dir, {
        occluded,
        readable: ctx.save.c1.controlsRestored,
        lie: "live",
      }),
    );
    if (parked === 1) ctx.say("C1-S04-D002");
    if (index === 1) ctx.say("C1-S04-D003");
  }
}

function createSluice(): GameScene {
  let latch = false;
  let door = false;
  let saidFlow = false;
  let leaving = false;
  return {
    id: "C1-S06",
    mount(ctx) {
      room(ctx);
      ctx.signals.add({
        id: "residue",
        kind: "leftover_residue",
        a: new THREE.Vector3(-3.6, 1, -2),
        b: new THREE.Vector3(-3.6, 1, -7),
      });
      ctx.signals.add({
        id: "flow",
        kind: "power_live",
        a: new THREE.Vector3(2.4, 1, -1.2),
        b: new THREE.Vector3(2.4, 1, -7.2),
      });
      const grate = boxMesh(1.6, 1.2, 0.16, 0x6a6560, 2.4, 0.7, -3.4);
      const module = boxMesh(0.28, 0.28, 0.28, 0x7ec8c3, -2.2, 0.4, 1.6);
      const pipe = boxMesh(0.3, 1.6, 0.3, 0x8a4030, -1.2, 0.9, -2.4);
      ctx.root.add(grate, module, pipe);
      ctx.tether.registerBody({ id: "grate", object: grate, mass: "heavy", shape: "crate" });
      ctx.tether.registerBody({ id: "latch", object: module, mass: "light", shape: "latch" });
      ctx.tether.registerBody({ id: "press", object: pipe, mass: "locked", shape: "joint", pressurised: true });
      ctx.tether.registerSocket({
        id: "memory",
        shape: "latch",
        position: new THREE.Vector3(0.6, 0.9, -5.4),
        parent: ctx.root,
        onSeat: () => {
          latch = true;
          ctx.bioRig.seatLatch();
          ctx.say("C1-S06-D004");
        },
      });
      ctx.player.reset(0, 0, 6.2, Math.PI);
      ctx.camera.yaw = Math.PI;
      ctx.hud.setTask(TASK["C1-S06-open"] ?? "");
      ctx.say("C1-S06-D001");
      ctx.interact.add({
        id: "door",
        prompt: PROMPT.openDoor,
        position: new THREE.Vector3(2.4, 0, -7.2),
        radius: 1.7,
        enabled: true,
        onUse: () => {
          if (!latch) {
            ctx.say("C1-S06-D003");
            return;
          }
          door = true;
          ctx.say("C1-S06-D005");
          ctx.hud.setTask(TASK["C1-S06-evac"] ?? "");
        },
      });
    },
    update(_dt, ctx) {
      if (ctx.flowLens.justPulsed && !saidFlow) {
        saidFlow = true;
        ctx.say("C1-S06-D002");
      }
      if (door && ctx.player.position.z > 5.4 && !leaving) {
        leaving = true;
        ctx.say("C1-S06-D006");
        ctx.completeAndGo();
      }
    },
    unmount() {
      latch = false;
      door = false;
      saidFlow = false;
      leaving = false;
    },
  };
}
