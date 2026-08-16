import * as THREE from "three";
import { PROMPT, TASK } from "../../content/copy";
import type { GameScene } from "../types";
import { doubleRail, geneMarks, railPost, rnaStrand, setEmissive } from "./kit";
import { ensureWorkshopTools, finishWhenIdle, mountRoundRoom, spawnWorkshopPlayer, tickPad } from "./room";

export function createTrackScene(): GameScene {
  let time = 0;
  let reading = false;
  let readT = 0;
  let peeled = false;
  let seated = false;
  const finish = { armed: false, wait: 0 };
  let pad: THREE.Group | null = null;
  let head: THREE.Mesh | null = null;
  let rna: THREE.Group | null = null;
  let glow: THREE.Mesh | null = null;
  let wrong: THREE.Mesh | null = null;

  return {
    id: "W-S01",
    mount(ctx) {
      pad = mountRoundRoom(ctx, 8.4).pad;
      ensureWorkshopTools(ctx);
      spawnWorkshopPlayer(ctx, 0, 5.4, 0);
      ctx.hud.setTask(TASK["W-S01"] ?? "");

      const dna = doubleRail(8.2);
      dna.position.set(0, 1.2, -2.1);
      ctx.root.add(dna);
      ctx.tether.registerBody({ id: "dna", object: dna, mass: "locked", shape: "dna" });
      ctx.root.add(railPost(-3.8, 0.55, -2.1), railPost(3.8, 0.55, -2.1));
      const marks = geneMarks(2.2);
      marks.position.set(-0.4, 1.32, -2.1);
      ctx.root.add(marks);

      const bench = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.6), new THREE.MeshLambertMaterial({ color: 0x3a4848 }));
      bench.position.set(-3.4, 0.35, -1.1);
      ctx.root.add(bench);

      head = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.18, 0.22),
        new THREE.MeshLambertMaterial({ color: 0x8aa0b8, emissive: 0x3a5058, emissiveIntensity: 0.3 }),
      );
      head.position.set(-3.2, 1.42, -2.1);
      ctx.root.add(head);

      rna = rnaStrand(2.4);
      rna.position.set(-2.2, 1.15, -1.15);
      rna.visible = false;
      ctx.root.add(rna);

      glow = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.22, 5),
        new THREE.MeshBasicMaterial({ color: 0xc9861a, transparent: true, opacity: 0.85 }),
      );
      glow.visible = false;
      ctx.root.add(glow);

      const next = new THREE.Mesh(
        new THREE.TorusGeometry(0.28, 0.03, 6, 16),
        new THREE.MeshLambertMaterial({ color: 0x7ec8c3, emissive: 0x3a8884, emissiveIntensity: 0.4 }),
      );
      next.position.set(3.6, 1.05, 1.8);
      next.rotation.x = Math.PI / 2;
      ctx.root.add(next);

      wrong = new THREE.Mesh(
        new THREE.TorusGeometry(0.26, 0.025, 6, 14),
        new THREE.MeshLambertMaterial({ color: 0x5a6570, emissive: 0x1a2024, emissiveIntensity: 0.15 }),
      );
      wrong.position.set(-3.2, 1.05, 2.2);
      wrong.rotation.x = Math.PI / 2;
      ctx.root.add(wrong);
      ctx.tether.registerSocket({
        id: "wrong-station",
        shape: "circle",
        position: new THREE.Vector3(-3.2, 1.05, 2.2),
        parent: ctx.root,
      });

      ctx.interact.add({
        id: "reader",
        prompt: PROMPT.guideRna,
        position: new THREE.Vector3(-3.4, 0, -1.1),
        radius: 1.5,
        enabled: true,
        onUse: () => {
          if (reading) return;
          reading = true;
          ctx.say("W-S01-D001");
        },
      });

      ctx.signals.add({
        id: "copy-path",
        kind: "workshop_trace",
        a: new THREE.Vector3(-3.2, 1.2, -2.1),
        b: new THREE.Vector3(3.6, 1.05, 1.8),
        enabled: false,
      });
    },
    update(dt, ctx) {
      time += dt;
      if (pad) tickPad(pad, time, ctx.reducedMotion);
      if (reading && !peeled) {
        readT = ctx.reducedMotion ? 1 : Math.min(1, readT + dt * 0.45);
        if (head) head.position.x = -3.2 + readT * 3.4;
        if (readT >= 1) peel(ctx);
      }
      if (peeled && rna && glow && !seated) {
        const tip = rna.position.clone();
        tip.x += 1.3;
        const dest = new THREE.Vector3(3.6, 1.05, 1.8);
        glow.visible = true;
        glow.position.copy(tip);
        glow.lookAt(dest);
        glow.rotateX(Math.PI / 2);
        const pulse = ctx.reducedMotion ? 0.8 : 0.55 + 0.35 * Math.sin(time * 4);
        const mat = glow.material;
        if (mat instanceof THREE.MeshBasicMaterial) mat.opacity = pulse;
        if (wrong) setEmissive(wrong, 0.1);
      }
      finishWhenIdle(finish, dt, ctx);
    },
    unmount() {
      time = 0;
      reading = false;
      readT = 0;
      peeled = false;
      seated = false;
      finish.armed = false;
      finish.wait = 0;
      pad = null;
      head = null;
      rna = null;
      glow = null;
      wrong = null;
    },
  };

  function peel(ctx: import("../types").SceneContext): void {
    if (peeled || !rna) return;
    peeled = true;
    rna.visible = true;
    ctx.tether.registerBody({ id: "rna", object: rna, mass: "light", shape: "rna" });
    ctx.tether.registerSocket({
      id: "next-station",
      shape: "rna",
      position: new THREE.Vector3(3.6, 1.05, 1.8),
      parent: ctx.root,
      onSeat: () => {
        if (seated) return;
        seated = true;
        if (glow) glow.visible = false;
        ctx.say("W-S01-D003");
        finish.armed = true;
      },
    });
    ctx.signals.setEnabled("copy-path", true);
    ctx.say("W-S01-D002");
  }
}
