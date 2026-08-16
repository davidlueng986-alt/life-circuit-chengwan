import * as THREE from "three";
import { PROMPT, TASK } from "../content/copy";
import type { SceneId } from "../content/ids";
import { STORM, addSolidBox, applyFog, boxMesh } from "../engine/greybox";
import type { GameScene, SceneContext } from "./types";

function lightBooth(ctx: SceneContext): void {
  applyFog(ctx.three, STORM, ctx.reducedMotion);
  ctx.root.add(new THREE.HemisphereLight(0xc4d6e4, 0x243038, 1.05));
  const key = new THREE.PointLight(0xffe2b0, 3.1, 14);
  key.position.set(0, 2.2, 1.4);
  ctx.root.add(key);
}

export function createPrologueToolScene(id: SceneId): GameScene {
  if (id === "P-S02") return createLensLesson();
  if (id === "P-S03") return createBridgeLesson();
  if (id === "P-S04") return createGalleryLesson();
  return createEvacLesson();
}

function createLensLesson(): GameScene {
  let pulsed = false;
  let seated = false;
  let saidLive = false;

  return {
    id: "P-S02",
    mount(ctx) {
      lightBooth(ctx);
      addSolidBox(ctx.root, ctx.world, 11, 0.4, 11, STORM.floor, 0, -0.2, 0);
      addSolidBox(ctx.root, ctx.world, 11, 3.2, 0.35, STORM.wall, 0, 1.4, -5.4);
      addSolidBox(ctx.root, ctx.world, 11, 3.2, 0.35, STORM.wall, 0, 1.4, 5.4);
      addSolidBox(ctx.root, ctx.world, 0.35, 3.2, 11, STORM.wall, -5.5, 1.4, 0);
      addSolidBox(ctx.root, ctx.world, 0.35, 3.2, 11, STORM.wall, 5.5, 1.4, 0);
      addSolidBox(ctx.root, ctx.world, 1.8, 0.7, 0.8, 0x3a322c, 0, 0.35, 2.1);

      const lens = boxMesh(0.28, 0.08, 0.34, 0xc9861a, 0, 0.78, 2.1);
      ctx.root.add(lens);

      pipe(ctx, -1.6, 2.35, -5.2, 3.2, 0.07, 0x8a6a2a);
      pipe(ctx, -1.6, 1.55, -5.2, 1.4, 0.06, 0x4a5a58);
      pipe(ctx, -1.6, 0.75, -5.2, 3.2, 0.05, 0x3a4044);
      addSolidBox(ctx.root, ctx.world, 1.4, 2.2, 0.22, 0x2a3036, 1.5, 1.2, -4.15);

      ctx.signals.add({
        id: "dead",
        kind: "power_residual",
        a: new THREE.Vector3(-2.4, 2.35, -5.1),
        b: new THREE.Vector3(2.4, 2.35, -5.1),
      });
      ctx.signals.add({
        id: "live",
        kind: "power_live",
        a: new THREE.Vector3(-2.4, 1.55, -5.1),
        b: new THREE.Vector3(0.4, 1.55, -5.1),
      });
      ctx.signals.add({
        id: "live-occluded",
        kind: "power_live",
        a: new THREE.Vector3(0.4, 1.55, -5.1),
        b: new THREE.Vector3(3.1, 1.55, -3.4),
      });
      ctx.signals.add({
        id: "dummy",
        kind: "power_residual",
        a: new THREE.Vector3(-2.4, 0.75, -5.1),
        b: new THREE.Vector3(2.1, 0.75, -5.1),
      });
      ctx.signals.addOccluder({
        id: "panel",
        min: new THREE.Vector3(0.8, 0.2, -4.4),
        max: new THREE.Vector3(2.2, 2.4, -3.9),
        kind: "solid",
      });

      const lock = boxMesh(0.3, 0.5, 0.16, 0x4a4034, 3.2, 1.55, -3.5);
      lock.name = "lock";
      ctx.root.add(lock);

      ctx.player.reset(0, 0, 3.6, Math.PI);
      ctx.camera.yaw = Math.PI;
      ctx.hud.setTask(TASK["P-S02-pick"] ?? "");

      ctx.interact.add({
        id: "lens",
        prompt: PROMPT.pickLens,
        position: new THREE.Vector3(0, 0, 2.1),
        radius: 1.6,
        enabled: true,
        onUse: () => {
          ctx.flowLens.grantPickup();
          ctx.save.player.tool.flowLens = true;
          ctx.persist();
          lens.visible = false;
          ctx.hud.setTask(TASK["P-S02-pulse"] ?? "");
          ctx.say("P-S02-D001");
        },
      });
      ctx.interact.add({
        id: "relay",
        prompt: PROMPT.seatRelay,
        position: new THREE.Vector3(3.1, 0, -3.4),
        radius: 1.5,
        enabled: true,
        onUse: () => {
          if (!ctx.flowLens.owned || seated) return;
          const live = ctx.flowLens.lastHits.some((hit) => hit.id.startsWith("live") && hit.lie === "live");
          if (!live && ctx.flowLens.lastHits.length === 0) return;
          seated = true;
          lock.material = new THREE.MeshLambertMaterial({
            color: 0x7ec8c3,
            emissive: 0x3a8884,
            emissiveIntensity: 0.7,
          });
          ctx.hud.setTask(TASK["P-S02-seat"] ?? "");
          ctx.completeAndGo();
        },
      });
    },
    update(_dt, ctx) {
      if (!pulsed && ctx.flowLens.justPulsed) {
        pulsed = true;
        ctx.hud.setTask(TASK["P-S02-follow"] ?? "");
        ctx.say("P-S02-D002");
      }
      if (pulsed && !saidLive && ctx.player.position.x > 1.4 && ctx.player.position.z < -1.8) {
        saidLive = true;
        ctx.say("P-S02-D003");
        ctx.hud.setTask(TASK["P-S02-seat"] ?? "");
      }
    },
    unmount() {
      pulsed = false;
      seated = false;
      saidLive = false;
    },
  };
}

function createBridgeLesson(): GameScene {
  let ready = false;

  return {
    id: "P-S03",
    mount(ctx) {
      applyFog(ctx.three, STORM, ctx.reducedMotion);
      ctx.root.add(new THREE.HemisphereLight(0x4c6478, 0x0b0e10, 0.5));
      addSolidBox(ctx.root, ctx.world, 10, 0.4, 6, STORM.floor, 0, -0.2, 3.4);
      addSolidBox(ctx.root, ctx.world, 10, 0.4, 6, STORM.floor, 0, -0.2, -4.6);
      addSolidBox(ctx.root, ctx.world, 0.4, 1.2, 1.2, STORM.wall, -1.6, 0.5, 0.4);
      addSolidBox(ctx.root, ctx.world, 0.4, 1.2, 1.2, STORM.wall, 1.6, 0.5, 0.4);

      const holster = boxMesh(0.18, 0.5, 0.18, 0x7ec8c3, -2.2, 1.1, 2.2);
      ctx.root.add(holster);
      const plateA = boxMesh(1.15, 0.12, 0.7, 0x8a8f86, 2.4, 0.4, 2.6);
      const plateB = boxMesh(1.15, 0.16, 0.7, 0x6a6560, 2.4, 0.4, 3.5);
      ctx.root.add(plateA, plateB);

      ctx.world.addTrigger("gap", new THREE.Vector3(-2.2, -1.4, -1.1), new THREE.Vector3(2.2, 0.15, 0.9));
      ctx.player.reset(0, 0, 4.6, Math.PI);
      ctx.camera.yaw = Math.PI;
      ctx.hud.setTask(TASK["P-S03-pick"] ?? "");

      ctx.interact.add({
        id: "holster",
        prompt: PROMPT.pickTether,
        position: new THREE.Vector3(-2.2, 0, 2.2),
        radius: 1.6,
        enabled: true,
        onUse: () => {
          ctx.tether.grantPickup();
          ctx.save.player.tool.tether = true;
          ctx.persist();
          holster.visible = false;
          ctx.hud.setTask(TASK["P-S03-snap"] ?? "");
          ctx.queueLines(["P-S03-D001", "P-S03-D002"]);
          ctx.tether.registerBody({
            id: "plate-a",
            object: plateA,
            mass: "medium",
            shape: "chevron",
            walkSize: new THREE.Vector3(1.2, 0.22, 0.8),
          });
          ctx.tether.registerBody({
            id: "plate-b",
            object: plateB,
            mass: "heavy",
            shape: "notch",
            walkSize: new THREE.Vector3(1.2, 0.22, 0.8),
          });
          ctx.tether.registerSocket({
            id: "seat-a",
            shape: "chevron",
            position: new THREE.Vector3(-0.55, 0.12, -0.15),
            parent: ctx.root,
            onSeat: () => check(ctx),
          });
          ctx.tether.registerSocket({
            id: "seat-b",
            shape: "notch",
            position: new THREE.Vector3(0.55, 0.12, -0.15),
            parent: ctx.root,
            onSeat: () => check(ctx),
          });
        },
      });

      function check(inner: SceneContext): void {
        if (inner.tether.seatedIn("seat-a") && inner.tether.seatedIn("seat-b")) ready = true;
      }
    },
    update(_dt, ctx) {
      const hits = ctx.world.sampleTriggers(ctx.player.position);
      if (hits.includes("gap")) ctx.player.pullTo(new THREE.Vector3(0, 0, 3.8), "void");
      if (ready && ctx.player.position.z < -2.4) ctx.completeAndGo();
    },
    unmount() {
      ready = false;
    },
  };
}

function createGalleryLesson(): GameScene {
  const done = { wrong: false, jam: false, loose: false };
  let scanned = false;

  return {
    id: "P-S04",
    mount(ctx) {
      lightBooth(ctx);
      addSolidBox(ctx.root, ctx.world, 14, 0.4, 12, STORM.floor, 0, -0.2, 0);
      addSolidBox(ctx.root, ctx.world, 14, 3.4, 0.3, STORM.wall, 0, 1.5, -6);
      addSolidBox(ctx.root, ctx.world, 0.3, 3.4, 12, STORM.wall, -7, 1.5, 0);
      addSolidBox(ctx.root, ctx.world, 0.3, 3.4, 12, STORM.wall, 7, 1.5, 0);
      addSolidBox(ctx.root, ctx.world, 4, 1.4, 0.2, 0x3a4650, 0, 2.1, -5.8);

      ctx.signals.add({
        id: "bus",
        kind: "power_live",
        a: new THREE.Vector3(-4, 1.8, -5.5),
        b: new THREE.Vector3(4, 1.8, -5.5),
      });
      ctx.signals.add({
        id: "stop",
        kind: "device_link",
        a: new THREE.Vector3(0, 1.6, -5.4),
        b: new THREE.Vector3(0, 1.2, -2.2),
      });

      const debris = boxMesh(1.1, 0.7, 0.8, 0x6a5340, -2.4, 0.4, -2.1);
      const relayWrong = boxMesh(0.45, 0.45, 0.45, 0x8a6a3a, 2.6, 0.7, -1.2);
      const relayJam = boxMesh(0.45, 0.45, 0.45, 0x6a5340, -2.4, 1.1, -2.1);
      const relayLoose = boxMesh(0.4, 0.4, 0.4, 0x8aa0b8, 0.2, 2.3, -3.4);
      ctx.root.add(debris, relayWrong, relayJam, relayLoose);

      ctx.tether.grantPickup();
      ctx.tether.registerBody({ id: "debris", object: debris, mass: "medium", shape: "crate" });
      ctx.tether.registerBody({ id: "wrong", object: relayWrong, mass: "light", shape: "relay", cuttable: true });
      ctx.tether.registerBody({ id: "jam", object: relayJam, mass: "medium", shape: "relay" });
      ctx.tether.registerBody({ id: "loose", object: relayLoose, mass: "light", shape: "relay" });
      ctx.tether.registerSocket({
        id: "dummy",
        shape: "relay",
        position: new THREE.Vector3(3.4, 0.7, -4.4),
        parent: ctx.root,
      });
      ctx.tether.registerSocket({
        id: "act-wrong",
        shape: "relay",
        position: new THREE.Vector3(2.2, 0.7, -4.6),
        parent: ctx.root,
        onSeat: () => mark("wrong"),
      });
      ctx.tether.registerSocket({
        id: "act-jam",
        shape: "relay",
        position: new THREE.Vector3(-2.2, 0.7, -4.6),
        parent: ctx.root,
        onSeat: () => mark("jam"),
      });
      ctx.tether.registerSocket({
        id: "act-loose",
        shape: "relay",
        position: new THREE.Vector3(0, 1.4, -4.6),
        parent: ctx.root,
        onSeat: () => mark("loose"),
      });

      ctx.player.reset(0, 0, 4.2, Math.PI);
      ctx.camera.yaw = Math.PI;
      ctx.hud.setTask(TASK["P-S04"] ?? "");
      ctx.say("P-S04-D001");

      function mark(key: keyof typeof done): void {
        if (done[key]) return;
        done[key] = true;
        if (key === "jam") ctx.say("P-S04-D003");
        if (done.wrong && done.jam && done.loose) {
          ctx.say("P-S04-D004");
          ctx.completeAndGo();
        }
      }
    },
    update(_dt, ctx) {
      if (!scanned && ctx.flowLens.justPulsed) {
        scanned = true;
        ctx.say("P-S04-D002");
      }
    },
    unmount() {
      done.wrong = false;
      done.jam = false;
      done.loose = false;
      scanned = false;
    },
  };
}

function createEvacLesson(): GameScene {
  let leverSeated = false;
  let elapsed = 0;
  let failed = false;
  let saidHold = false;
  let sawLift = false;

  return {
    id: "P-S05",
    mount(ctx) {
      applyFog(ctx.three, STORM, ctx.reducedMotion);
      ctx.root.add(new THREE.HemisphereLight(0x4c6478, 0x0b0e10, 0.4));
      addSolidBox(ctx.root, ctx.world, 4, 0.4, 22, STORM.floor, 0, -0.2, 0);
      addSolidBox(ctx.root, ctx.world, 0.25, 2.4, 22, STORM.wall, -2.1, 1.1, 0);
      addSolidBox(ctx.root, ctx.world, 0.25, 2.4, 22, STORM.wall, 2.1, 1.1, 0);
      addSolidBox(ctx.root, ctx.world, 4, 2.4, 0.3, STORM.wall, 0, 1.1, -11);

      ctx.signals.add({
        id: "evac",
        kind: "emergency_pulse",
        a: new THREE.Vector3(0, 1.3, 9),
        b: new THREE.Vector3(0, 1.3, -8.4),
      });

      const lever = boxMesh(0.12, 0.7, 0.12, 0xc9a36a, 1.2, 0.4, 1.4);
      ctx.root.add(lever);
      ctx.tether.grantPickup();
      ctx.tether.registerBody({ id: "lever", object: lever, mass: "light", shape: "lever" });
      ctx.tether.registerSocket({
        id: "lever-seat",
        shape: "lever",
        position: new THREE.Vector3(1.6, 1.1, -4.2),
        parent: ctx.root,
        onSeat: () => {
          leverSeated = true;
        },
      });

      ctx.player.reset(0, 0, 8.6, Math.PI);
      ctx.camera.yaw = Math.PI;
      ctx.hud.setTask(TASK["P-S05-run"] ?? "");
      ctx.say("P-S05-D001");
      ctx.hud.setStorm(ctx.save.settings.relaxedTimer ? null : 1);

      ctx.interact.add({
        id: "lift",
        prompt: PROMPT.holdLift,
        position: new THREE.Vector3(0, 0, -9.2),
        radius: 1.6,
        holdSeconds: 2.4,
        enabled: true,
        onUse: () => {
          if (!leverSeated) return;
          ctx.say("P-S05-D004");
          ctx.completeAndGo();
        },
      });
    },
    update(dt, ctx) {
      elapsed += dt;
      if (!ctx.save.settings.relaxedTimer) ctx.hud.setStorm(Math.max(0, 1 - elapsed / 70));
      if (ctx.player.position.z < -3.5 && !saidHold) {
        saidHold = true;
        ctx.hud.setTask(TASK["P-S05-hold"] ?? "");
        ctx.say("P-S05-D002");
      }
      if (ctx.player.position.z < -8 && !sawLift) {
        sawLift = true;
        ctx.say("P-S05-D003");
      }
      const limit = ctx.save.settings.relaxedTimer ? 999 : 70;
      if (elapsed > limit && !failed) {
        failed = true;
        ctx.say("P-S05-R001");
        ctx.player.pullTo(new THREE.Vector3(0, 0, 8.2), "water");
        elapsed = 0;
        failed = false;
        ctx.hud.setStorm(1);
        ctx.hud.setTask(TASK["P-S05-run"] ?? "");
      }
    },
    unmount() {
      leverSeated = false;
      elapsed = 0;
      failed = false;
      saidHold = false;
      sawLift = false;
    },
  };
}

function pipe(ctx: SceneContext, x: number, y: number, z: number, length: number, r: number, color: number): void {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r, length, 8),
    new THREE.MeshLambertMaterial({ color }),
  );
  mesh.rotation.z = Math.PI / 2;
  mesh.position.set(x + length / 2, y, z);
  ctx.root.add(mesh);
}
