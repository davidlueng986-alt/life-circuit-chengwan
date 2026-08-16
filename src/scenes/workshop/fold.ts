import * as THREE from "three";
import { TASK } from "../../content/copy";
import type { GameScene } from "../types";
import { assemblyRing, bead, proteinKey, rnaStrand, shapeLock } from "./kit";
import { ensureWorkshopTools, finishWhenIdle, mountRoundRoom, spawnWorkshopPlayer, tickPad } from "./room";

const BEAD_COUNT = 10;
const RING_R = 2.6;

export function createFoldScene(): GameScene {
  let time = 0;
  let foldT = 0;
  let folded = false;
  let saidFold = false;
  let saidWork = false;
  let turned = false;
  const finish = { armed: false, wait: 0 };
  let pad: THREE.Group | null = null;
  let lock: THREE.Group | null = null;
  let protein: THREE.Group | null = null;
  const beads: THREE.Mesh[] = [];

  return {
    id: "W-S02",
    mount(ctx) {
      pad = mountRoundRoom(ctx, 8.5).pad;
      ensureWorkshopTools(ctx);
      spawnWorkshopPlayer(ctx, 0, 5.6, 0);
      ctx.hud.setTask(TASK["W-S02"] ?? "");

      const ring = assemblyRing(RING_R);
      ring.position.set(0, 1.05, -0.6);
      ctx.root.add(ring);

      const walk = new THREE.Mesh(
        new THREE.TorusGeometry(RING_R + 1.15, 0.55, 8, 36),
        new THREE.MeshLambertMaterial({ color: 0x243034 }),
      );
      walk.rotation.x = Math.PI / 2;
      walk.position.set(0, 0.04, -0.6);
      ctx.root.add(walk);

      for (let i = 0; i < BEAD_COUNT; i += 1) {
        const item = bead(i % 2 === 0 ? 0xc9a36a : 0xb85c38);
        item.position.copy(beadHome(i, 0));
        ctx.root.add(item);
        beads.push(item);
      }

      protein = proteinKey();
      protein.position.set(0, 1.05, -0.6);
      protein.visible = false;
      ctx.root.add(protein);

      const rna = rnaStrand(1.8);
      rna.position.set(2.4, 0.7, 1.6);
      ctx.root.add(rna);
      ctx.tether.registerBody({ id: "rna", object: rna, mass: "light", shape: "rna" });

      lock = shapeLock();
      lock.position.set(0, 0.85, -4.2);
      ctx.root.add(lock);
      ctx.tether.registerSocket({
        id: "protein-lock",
        shape: "protein",
        position: new THREE.Vector3(0, 0.85, -4.2),
        parent: ctx.root,
        onSeat: () => turnLock(ctx),
      });
    },
    update(dt, ctx) {
      time += dt;
      if (pad) tickPad(pad, time, ctx.reducedMotion);
      if (!folded) {
        foldT = ctx.reducedMotion ? 1 : Math.min(1, foldT + dt * 0.38);
        for (let i = 0; i < beads.length; i += 1) {
          beads[i]?.position.copy(beadHome(i, foldT));
        }
        if (foldT >= 1) revealProtein(ctx);
      }
      if (turned && lock) {
        const target = Math.PI * 0.55;
        lock.rotation.y = ctx.reducedMotion ? target : THREE.MathUtils.lerp(lock.rotation.y, target, 1 - Math.pow(0.001, dt));
      }
      finishWhenIdle(finish, dt, ctx);
    },
    unmount() {
      time = 0;
      foldT = 0;
      folded = false;
      saidFold = false;
      saidWork = false;
      turned = false;
      finish.armed = false;
      finish.wait = 0;
      pad = null;
      lock = null;
      protein = null;
      beads.length = 0;
    },
  };

  function revealProtein(ctx: import("../types").SceneContext): void {
    if (folded || !protein) return;
    folded = true;
    for (const item of beads) item.visible = false;
    protein.visible = true;
    ctx.tether.registerBody({ id: "protein", object: protein, mass: "medium", shape: "protein" });
    if (!saidFold) {
      saidFold = true;
      ctx.say("W-S02-D001");
    }
  }

  function turnLock(ctx: import("../types").SceneContext): void {
    if (turned) return;
    turned = true;
    if (!saidWork) {
      saidWork = true;
      ctx.queueLines(["W-S02-D002", "W-S02-D003"]);
    }
    finish.armed = true;
  }
}

function beadHome(index: number, fold01: number): THREE.Vector3 {
  const a = (index / BEAD_COUNT) * Math.PI * 2;
  const ring = new THREE.Vector3(Math.cos(a) * RING_R, 1.05, Math.sin(a) * RING_R - 0.6);
  const packed = new THREE.Vector3(Math.cos(a * 1.7) * 0.22, 1.05 + Math.sin(a * 2.1) * 0.12, -0.6 + Math.sin(a) * 0.16);
  return ring.lerp(packed, fold01);
}
