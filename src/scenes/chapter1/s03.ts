import * as THREE from "three";
import { C1_LAYOUT } from "../../../content/chapter1/layout";
import { openingLineIds } from "../../content/beats";
import { COMM, PROMPT, TASK } from "../../content/copy";
import { pushRun } from "../../content/progress";
import { addSolidBox, boxMesh, playPoint } from "../../engine/greybox";
import type { GameScene, SceneContext } from "../types";
import { deck, lightHarbor, mountEastShore, xyz } from "./kit";

export function createC1S03(): GameScene {
  let moonDone = false;
  let sunValid = false;
  let named = false;
  let started = 0;
  const hatch = { mesh: null as THREE.Mesh | null };

  return {
    id: "C1-S03",
    mount(ctx) {
      lightHarbor(ctx, "fog");
      if (ctx.three.fog instanceof THREE.FogExp2) {
        ctx.three.fog.density = ctx.reducedMotion ? 0.01 : 0.014;
      }
      mountEastShore(ctx, {});
      deck(ctx, 13, 14, -12.4, 39, 1.2);
      deck(ctx, 7, 5, -8.2, 35.4, 0.55);
      const vanLamp = playPoint(0xf0d8b0, 4.2, 16, 1);
      vanLamp.position.set(-12.4, 3.6, 39.2);
      ctx.root.add(vanLamp);
      ctx.world.addAnchor("van", C1_LAYOUT.van[0], C1_LAYOUT.van[1], C1_LAYOUT.van[2]);

      ctx.docks.reset(true);
      ctx.docks.moon.output = "mid";
      ctx.bioRig.grantPickup(ctx.save.c1.loadout);
      ctx.bioRig.saturated = true;
      ctx.bioRig.selfTestBlink = true;
      ctx.bioRig.placeAt(new THREE.Vector3(C1_LAYOUT.van[0], C1_LAYOUT.van[1] + 0.55, C1_LAYOUT.van[2]));
      ctx.signals.add({
        id: "reg-jam",
        kind: "device_link",
        a: new THREE.Vector3(C1_LAYOUT.van[0] - 0.2, 1.8, C1_LAYOUT.van[2]),
        b: new THREE.Vector3(C1_LAYOUT.van[0] + 0.05, 1.8, C1_LAYOUT.van[2]),
      });
      ctx.signals.add({
        id: "wet-out",
        kind: "self_test",
        a: new THREE.Vector3(C1_LAYOUT.van[0] + 0.12, 1.8, C1_LAYOUT.van[2]),
        b: new THREE.Vector3(C1_LAYOUT.van[0] + 0.4, 1.8, C1_LAYOUT.van[2] + 0.2),
      });

      const moon = addSolidBox(ctx.root, ctx.world, 1.05, 1.15, 1.05, 0x8aa0b8, C1_LAYOUT.moonDock[0], 1.65, C1_LAYOUT.moonDock[2]);
      const sun = addSolidBox(ctx.root, ctx.world, 1.05, 1.15, 1.05, 0xc9a227, C1_LAYOUT.sunDock[0], 1.65, C1_LAYOUT.sunDock[2]);
      const unknown = addSolidBox(ctx.root, ctx.world, 1.05, 1.15, 1.05, 0x4a4a4a, C1_LAYOUT.unknownDock[0], 1.65, C1_LAYOUT.unknownDock[2]);
      markDock(ctx.root, "moon", C1_LAYOUT.moonDock[0], 2.42, C1_LAYOUT.moonDock[2]);
      markDock(ctx.root, "sun", C1_LAYOUT.sunDock[0], 2.42, C1_LAYOUT.sunDock[2]);
      markDock(ctx.root, "ask", C1_LAYOUT.unknownDock[0], 2.42, C1_LAYOUT.unknownDock[2]);
      glowMesh(moon, 0x8aa0b8, 0.35);
      glowMesh(sun, 0xc9a227, 0.4);
      hatch.mesh = unknown;

      const portA = boxMesh(0.28, 0.28, 0.28, 0x6a5340, C1_LAYOUT.portReg[0], C1_LAYOUT.portReg[1], C1_LAYOUT.portReg[2]);
      const portB = boxMesh(0.28, 0.28, 0.28, 0x8aa0b8, C1_LAYOUT.portOut[0], C1_LAYOUT.portOut[1], C1_LAYOUT.portOut[2]);
      glowMesh(portA, 0x6a5340, 0.4);
      glowMesh(portB, 0x8aa0b8, 0.45);
      ctx.root.add(portA, portB);
      ctx.tether.registerBody({ id: "port-reg", object: portA, mass: "light", shape: "port-reg" });
      ctx.tether.registerBody({ id: "port-out", object: portB, mass: "light", shape: "port-out" });
      ctx.tether.registerSocket({
        id: "reg-seat",
        shape: "port-reg",
        position: new THREE.Vector3(C1_LAYOUT.van[0] - 0.45, 1.75, 38.75),
        parent: ctx.root,
        onSeat: () => tryRepair(ctx),
      });
      ctx.tether.registerSocket({
        id: "out-seat",
        shape: "port-out",
        position: new THREE.Vector3(C1_LAYOUT.van[0] + 0.45, 1.75, 38.75),
        parent: ctx.root,
        onSeat: () => tryRepair(ctx),
      });

      ctx.player.reset(-12.4, 1.2, 36.55, Math.PI);
      ctx.camera.yaw = Math.PI;
      ctx.camera.pitch = -0.3;
      ctx.camera.dist = 2.55;
      ctx.hud.setTask(TASK["C1-S03-refs"] ?? "");
      ctx.queueLines(openingLineIds("C1-S03", ctx.save));
      started = performance.now();
      stamp(ctx);

      ctx.interact.add({
        id: "moon",
        prompt: PROMPT.moonDock,
        position: xyz(C1_LAYOUT.moonDock),
        radius: 1.6,
        enabled: true,
        onUse: () => {
          ctx.docks.moon.occupied = true;
          ctx.docks.moon.output = "low";
          moonDone = true;
          ctx.bioRig.placeAt(xyz(C1_LAYOUT.moonDock).setY(1.7));
          ctx.say("C1-S03-D002");
          pushRun(ctx.save, ctx.docks.record("C1-S03", "moon", ctx.save.c1.loadout));
          ctx.persist();
          stamp(ctx);
        },
      });
      ctx.interact.add({
        id: "sun",
        prompt: PROMPT.sunDock,
        position: xyz(C1_LAYOUT.sunDock),
        radius: 1.6,
        enabled: true,
        onUse: () => {
          ctx.bioRig.placeAt(xyz(C1_LAYOUT.sunDock).setY(1.7));
          if (!ctx.docks.portsOk) {
            ctx.docks.sun.output = "saturated";
            ctx.docks.sun.occupied = true;
            pushRun(ctx.save, {
              ...ctx.docks.record("C1-S03", "sun", ctx.save.c1.loadout),
              outputBand: "saturated",
              readable: false,
            });
          } else {
            ctx.docks.sun.output = "high";
            sunValid = true;
            pushRun(ctx.save, ctx.docks.record("C1-S03", "sun", ctx.save.c1.loadout));
            afterRefs(ctx);
          }
          ctx.persist();
          stamp(ctx);
        },
      });
      ctx.interact.add({
        id: "unknown",
        prompt: PROMPT.unknownDock,
        position: xyz(C1_LAYOUT.unknownDock),
        radius: 1.5,
        enabled: true,
        onUse: () => {
          if (!ctx.docks.unknownOpen || !moonDone || !sunValid) {
            ctx.hud.announce(COMM.unknownDock);
            return;
          }
          ctx.docks.unknown.output = "fluctuating";
          ctx.bioRig.placeAt(xyz(C1_LAYOUT.unknownDock).setY(1.7));
          pushRun(ctx.save, ctx.docks.record("C1-S03", "unknown", ctx.save.c1.loadout));
          ctx.say("C1-S03-D005");
          ctx.persist();
          ctx.completeAndGo();
        },
      });
    },
    update(_dt, ctx) {
      if (hatch.mesh) {
        const mat = hatch.mesh.material;
        if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshLambertMaterial) {
          mat.color.setHex(ctx.docks.unknownOpen && moonDone ? 0x6a6a6a : 0x2a2a2a);
        }
      }
      if (moonDone && sunValid && ctx.docks.portsOk && !named) {
        afterRefs(ctx);
      }
    },
    unmount() {
      hatch.mesh = null;
    },
  };

  function tryRepair(ctx: SceneContext): void {
    if (!ctx.tether.seatedIn("reg-seat") || !ctx.tether.seatedIn("out-seat")) return;
    ctx.docks.repairSun();
    ctx.bioRig.saturated = false;
    ctx.bioRig.selfTestBlink = false;
    ctx.bioRig.powered = true;
    stamp(ctx);
  }

  function afterRefs(ctx: SceneContext): void {
    if (named || !moonDone || !ctx.docks.unknownOpen) return;
    named = true;
    ctx.queueLines(["C1-S03-D003", "C1-S03-D004"]);
    ctx.hud.setTask(TASK["C1-S03-unknown"] ?? "");
    stamp(ctx);
  }

  function stamp(ctx: SceneContext): void {
    const sec = Math.max(0, Math.floor((performance.now() - started) / 1000));
    ctx.workbench.openDocks(ctx.save, ctx.docks.portsOk, ctx.docks.unknownOpen, `${sec} 秒`);
  }
}

function glowMesh(mesh: THREE.Mesh, tint: number, intensity: number): void {
  const mat = mesh.material;
  if (!(mat instanceof THREE.MeshStandardMaterial) && !(mat instanceof THREE.MeshLambertMaterial)) return;
  mat.emissive = new THREE.Color(tint);
  mat.emissiveIntensity = intensity;
}

function markDock(root: THREE.Group, kind: "moon" | "sun" | "ask", x: number, y: number, z: number): void {
  if (kind === "moon") {
    const disc = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 10, 8),
      new THREE.MeshLambertMaterial({ color: 0xb8c8d0, emissive: 0x3a5060, emissiveIntensity: 0.55 }),
    );
    disc.position.set(x, y, z);
    const cut = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshLambertMaterial({ color: 0x2a3034 }));
    cut.position.set(x + 0.12, y, z);
    root.add(disc, cut);
    return;
  }
  if (kind === "sun") {
    const disc = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 10, 8),
      new THREE.MeshLambertMaterial({ color: 0xe8c04a, emissive: 0x8a6a10, emissiveIntensity: 0.65 }),
    );
    disc.position.set(x, y, z);
    root.add(disc);
    return;
  }
  const stem = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.32, 0.1),
    new THREE.MeshLambertMaterial({ color: 0xd0d0c8, emissive: 0x444440, emissiveIntensity: 0.45 }),
  );
  const dot = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), stem.material);
  stem.position.set(x, y + 0.08, z);
  dot.position.set(x, y - 0.2, z);
  root.add(stem, dot);
}
