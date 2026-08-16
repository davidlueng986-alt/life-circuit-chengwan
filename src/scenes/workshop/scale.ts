import * as THREE from "three";
import { PROMPT, TASK } from "../../content/copy";
import type { GameScene, SceneContext } from "../types";
import {
  aimFrame,
  cellMembrane,
  doubleRail,
  geneMarks,
  magnifierFrame,
  railPost,
  scaleHandle,
  setEmissive,
} from "./kit";
import { playPoint } from "../../engine/greybox";
import { makeWorldLabel } from "../../engine/worldHints";
import {
  ensureWorkshopTools,
  finishWhenIdle,
  lookingAt,
  mountRoundRoom,
  spawnWorkshopPlayer,
  tickPad,
} from "./room";

const CELL = new THREE.Vector3(0, 1.55, -0.4);
const DNA = new THREE.Vector3(0, 1.25, -0.4);
const GENE = new THREE.Vector3(1.35, 1.35, -0.4);
const FRAMES = [
  { id: "cell" as const, pos: new THREE.Vector3(-2.8, 1.15, -6.4) },
  { id: "dna" as const, pos: new THREE.Vector3(0, 1.15, -6.4) },
  { id: "gene" as const, pos: new THREE.Vector3(2.6, 1.15, -6.4) },
];

export function createScaleScene(): GameScene {
  let time = 0;
  let inside = false;
  let scaleT = 0;
  let marked = false;
  let nextAim = 0;
  let dwell = 0;
  let saidCell = false;
  let saidGene = false;
  let magSeated = false;
  const finish = { armed: false, wait: 0 };
  let pad: THREE.Group | null = null;
  let membrane: THREE.Mesh | null = null;
  let handle: THREE.Group | null = null;
  let dna: THREE.Group | null = null;
  let gene: THREE.Group | null = null;
  let nest: THREE.Group | null = null;
  const frameGroups: THREE.Group[] = [];

  return {
    id: "W-S00",
    mount(ctx) {
      const room = mountRoundRoom(ctx, 8.8);
      pad = room.pad;
      ensureWorkshopTools(ctx);
      spawnWorkshopPlayer(ctx, 0, 2.6, 0);
      ctx.camera.pitch = -0.14;
      ctx.hud.setTask(TASK["W-S00-enter"] ?? "");

      membrane = cellMembrane(2.35, 0.2);
      membrane.position.copy(CELL);
      ctx.root.add(membrane);
      const nucleus = new THREE.Mesh(
        new THREE.SphereGeometry(0.72, 18, 14),
        new THREE.MeshStandardMaterial({ color: 0xe0a03a, emissive: 0xc9861a, emissiveIntensity: 0.85, roughness: 0.42 }),
      );
      nucleus.position.copy(CELL);
      ctx.root.add(nucleus);
      const cellTag = makeWorldLabel("細胞", "cell＝有邊界的生命單位");
      cellTag.position.set(0, 3.35, -0.4);
      ctx.root.add(cellTag);

      handle = scaleHandle();
      handle.position.set(0, 2.55, 3.1);
      const handleLamp = playPoint(0xc9a36a, 2.4, 8, 1.05);
      handleLamp.position.set(0, 2.75, 3.1);
      ctx.root.add(handle, handleLamp);
      ctx.tether.registerBody({ id: "scale", object: handle, mass: "light", shape: "lever" });
      ctx.tether.registerSocket({
        id: "scale-seat",
        shape: "lever",
        position: new THREE.Vector3(0, 0.85, 3.1),
        parent: ctx.root,
        onSeat: () => beginScale(ctx),
      });

      dna = doubleRail(7.2);
      dna.position.copy(DNA);
      dna.visible = false;
      const dnaTag = makeWorldLabel("DNA 長軌", "gene 是上面一小段");
      dnaTag.position.set(0, 2.15, -0.4);
      dna.add(dnaTag);
      ctx.root.add(dna);
      ctx.root.add(railPost(-3.4, 0.55, -0.4));
      ctx.root.add(railPost(3.4, 0.55, -0.4));

      gene = geneMarks(1.5);
      gene.position.copy(GENE);
      gene.visible = false;
      ctx.root.add(gene);

      const mag = magnifierFrame();
      mag.position.set(3.1, 1.15, 2.4);
      ctx.root.add(mag);
      ctx.tether.registerBody({ id: "mag", object: mag, mass: "light", shape: "magnifier" });
      ctx.tether.registerSocket({
        id: "mag-seat",
        shape: "magnifier",
        position: GENE.clone(),
        parent: ctx.root,
        onSeat: () => {
          magSeated = true;
          if (inside) markGene(ctx);
        },
        onUnseat: () => {
          magSeated = false;
        },
      });

      for (const frame of FRAMES) {
        const mesh = aimFrame(frame.id);
        mesh.position.copy(frame.pos);
        ctx.root.add(mesh);
        frameGroups.push(mesh);
        const tag =
          frame.id === "cell"
            ? makeWorldLabel("整個細胞", "1")
            : frame.id === "dna"
              ? makeWorldLabel("整條 DNA", "2")
              : makeWorldLabel("上面一小段 gene", "3");
        tag.position.copy(frame.pos).add(new THREE.Vector3(0, 1.35, 0));
        ctx.root.add(tag);
      }

      nest = new THREE.Group();
      nest.visible = false;
      const shell = cellMembrane(0.85, 0.28);
      const rail = doubleRail(1.4);
      rail.scale.setScalar(0.55);
      const mark = geneMarks(0.55);
      mark.position.set(0.35, 0.12, 0);
      nest.add(shell, rail, mark);
      nest.position.set(0, 1.6, -6.4);
      ctx.root.add(nest);

      ctx.signals.add({
        id: "cell-bound",
        kind: "workshop_trace",
        a: new THREE.Vector3(-2.2, 1.6, -0.4),
        b: new THREE.Vector3(2.2, 1.6, -0.4),
      });
      ctx.signals.add({
        id: "dna-rail",
        kind: "workshop_trace",
        a: new THREE.Vector3(-3.4, 1.25, -0.4),
        b: new THREE.Vector3(3.4, 1.25, -0.4),
        enabled: false,
      });
      ctx.signals.add({
        id: "gene-mark",
        kind: "workshop_trace",
        a: new THREE.Vector3(0.6, 1.4, -0.4),
        b: new THREE.Vector3(2.1, 1.4, -0.4),
        enabled: false,
      });
    },
    update(dt, ctx) {
      time += dt;
      if (pad) tickPad(pad, time, ctx.reducedMotion);
      if (inside && scaleT < 1) {
        scaleT = ctx.reducedMotion ? 1 : Math.min(1, scaleT + dt * 0.7);
        const k = 1 - Math.pow(1 - scaleT, 2);
        if (membrane) {
          const r = 2.35 + k * 4.4;
          membrane.scale.setScalar(r / 2.35);
          const mat = membrane.material;
          if (mat instanceof THREE.MeshLambertMaterial) mat.opacity = 0.2 - k * 0.07;
        }
        if (dna) dna.visible = true;
        if (gene) gene.visible = true;
        ctx.signals.setEnabled("dna-rail", true);
        if (scaleT >= 1 && !saidCell) {
          saidCell = true;
          ctx.say("W-S00-D001");
          ctx.hud.setTask(PROMPT.pullMag);
          if (magSeated) markGene(ctx);
        }
      }
      if (marked && gene) gene.rotation.y = ctx.reducedMotion ? 0 : Math.sin(time * 2) * 0.08;
      if (finish.armed) {
        if (nest) {
          nest.visible = true;
          const pulse = ctx.reducedMotion ? 1 : 1 + Math.sin(time * 3) * 0.04;
          nest.scale.setScalar(pulse);
        }
        finishWhenIdle(finish, dt, ctx);
        return;
      }
      if (!marked) return;

      let aimed = -1;
      for (let i = 0; i < FRAMES.length; i += 1) {
        const spec = FRAMES[i];
        if (!spec) continue;
        if (lookingAt(ctx, spec.pos, 7.4, 0.7)) aimed = i;
      }
      if (aimed < 0) {
        dwell = 0;
        return;
      }
      dwell += dt;
      if (dwell < (ctx.save.settings.holdAlternatives ? 0.2 : 0.5)) return;
      dwell = 0;
      if (aimed === nextAim) {
        const accepted = frameGroups[nextAim];
        if (accepted) setEmissive(accepted, 0.7, 0x7ec8c3);
        nextAim += 1;
        if (nextAim === 2) ctx.hud.setTask(TASK["W-S00-aim"] ?? "");
        if (nextAim >= 3) {
          ctx.say("W-S00-D003");
          finish.armed = true;
        }
      } else if (aimed > nextAim && dwell > 0.9) {
        nextAim = 0;
        for (const frame of frameGroups) setEmissive(frame, 0.08, 0x3a4848);
      }
    },
    unmount() {
      time = 0;
      inside = false;
      scaleT = 0;
      marked = false;
      nextAim = 0;
      dwell = 0;
      saidCell = false;
      saidGene = false;
      magSeated = false;
      finish.armed = false;
      finish.wait = 0;
      pad = null;
      membrane = null;
      handle = null;
      dna = null;
      gene = null;
      nest = null;
      frameGroups.length = 0;
    },
  };

  function beginScale(ctx: SceneContext): void {
    if (inside) return;
    inside = true;
    if (dna) ctx.tether.registerBody({ id: "dna", object: dna, mass: "locked", shape: "dna" });
    if (ctx.reducedMotion) scaleT = 1;
  }

  function markGene(ctx: SceneContext): void {
    if (marked) return;
    marked = true;
    ctx.signals.setEnabled("gene-mark", true);
    if (!saidGene) {
      saidGene = true;
      ctx.say("W-S00-D002");
    }
    ctx.hud.setTask(TASK["W-S00-aim"] ?? "");
  }
}
