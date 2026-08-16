import * as THREE from "three";
import { C1_HIGH_PADS, C1_LAYOUT } from "../../../content/chapter1/layout";
import { keepFieldTrace } from "../../../content/chapter1/state";
import { openingLineIds } from "../../content/beats";
import { PROMPT, TASK } from "../../content/copy";
import { boxMesh } from "../../engine/greybox";
import type { GameScene, SceneContext } from "../types";
import { lightHarbor, mountEastShore, mountWater, near, xyz } from "./kit";

export function createC1S04(): GameScene {
  let parked = 0;
  let accepted = false;
  let nearSecond = false;
  let sluiceOpen = false;
  const used = new Set<string>();

  return {
    id: "C1-S04",
    mount(ctx) {
      lightHarbor(ctx, "fog");
      mountEastShore(ctx, { floodMarket: true, roofs: true });
      mountWater(ctx);
      ctx.world.addAnchor("roof", C1_LAYOUT.spawnS04[0], C1_LAYOUT.spawnS04[1], C1_LAYOUT.spawnS04[2]);

      ctx.bioRig.grantPickup(ctx.save.c1.loadout);
      ctx.bioRig.carry();
      ctx.bioRig.saturated = false;
      ctx.bioRig.setHeadingTarget(new THREE.Vector3(C1_LAYOUT.source[0], 0, C1_LAYOUT.source[2]));

      ctx.signals.add({
        id: "first-trace",
        kind: "env_flow",
        a: new THREE.Vector3(2.2, 1.2, 32),
        b: new THREE.Vector3(0.4, 0.8, 6),
      });
      ctx.signals.add({
        id: "source-hum",
        kind: "probe_bearing",
        a: xyz(C1_LAYOUT.source),
        b: new THREE.Vector3(2.4, 1.2, 36),
      });

      const b0 = boxMesh(0.32, 0.7, 0.32, 0x8aa0b8, C1_LAYOUT.spawnS04[0] - 0.8, 0.4, C1_LAYOUT.spawnS04[2] + 0.6);
      const b1 = boxMesh(0.32, 0.7, 0.32, 0x7ec8c3, C1_LAYOUT.spawnS04[0] + 0.8, 0.4, C1_LAYOUT.spawnS04[2] + 0.6);
      ctx.root.add(b0, b1);
      ctx.tether.registerBody({ id: "beacon-0", object: b0, mass: "medium", shape: "beacon", recoverOnDrop: true });
      ctx.tether.registerBody({ id: "beacon-1", object: b1, mass: "fragile", shape: "beacon", recoverOnDrop: true });

      for (const pad of C1_HIGH_PADS) {
        ctx.tether.registerSocket({
          id: `pad-${pad.id}`,
          shape: "beacon",
          position: new THREE.Vector3(pad.at[0], pad.at[1] + 0.45, pad.at[2]),
          parent: ctx.root,
          onSeat: (bodyId) => park(ctx, pad.id, pad.occluded, bodyId),
        });
      }

      const gate = boxMesh(2.4, 2.2, 0.28, 0x3a322c, 2.2, 4.2, 44.6);
      gate.name = "hidden-sluice";
      ctx.root.add(gate);
      ctx.tether.registerBody({ id: "sluice-gate", object: gate, mass: "locked", shape: "joint" });

      ctx.player.reset(C1_LAYOUT.spawnS04[0], C1_LAYOUT.spawnS04[1], C1_LAYOUT.spawnS04[2], Math.PI);
      ctx.camera.yaw = Math.PI;
      ctx.hud.setTask(TASK["C1-S04"] ?? "");
      ctx.queueLines(openingLineIds("C1-S04", ctx.save));
    },
    update(_dt, ctx) {
      const look = ctx.camera.lookDir();
      ctx.triangulation.handheld = ctx.triangulation.makeCone(ctx.player.position, look, {
        readable: ctx.save.c1.controlsRestored && ctx.bioRig.fieldReadable(ctx.save),
        saturated: ctx.bioRig.saturated,
        lie: "live",
      });

      if (!nearSecond && (near(ctx.player.position, C1_LAYOUT.drainPad, 5) || near(ctx.player.position, C1_LAYOUT.sluiceLip, 6))) {
        nearSecond = true;
        ctx.say("C1-S04-D003");
      }
      if (nearSecond && !sluiceOpen && near(ctx.player.position, C1_LAYOUT.sluiceLip, 4.2)) {
        sluiceOpen = true;
        const gate = ctx.tether.body("sluice-gate");
        if (gate) gate.object.position.x = 5.8;
        ctx.say("C1-S04-D004");
      }

      if (accepted) return;
      const result = ctx.triangulation.overlap();
      if (result.accepted && parked >= 2) {
        accepted = true;
        const tight = result.confirmSeconds <= 50;
        keepFieldTrace(ctx.save, tight, result.confirmSeconds);
        ctx.save.evidence.claimMatchesObservedRange = true;
        ctx.persist();
        ctx.say("C1-S04-D005");
        ctx.hud.setTask(TASK["C1-S04-ok"] ?? "");
        ctx.interact.add({
          id: "hand-off",
          prompt: PROMPT.advance,
          position: xyz(C1_LAYOUT.sluiceLip),
          radius: 2.2,
          enabled: true,
          onUse: () => ctx.completeAndGo(),
        });
      } else if (parked >= 2 && !result.accepted) {
        ctx.hud.setTask(TASK["C1-S04-wide"] ?? "");
      }
    },
    unmount() {
      parked = 0;
      accepted = false;
      nearSecond = false;
      sluiceOpen = false;
      used.clear();
    },
  };

  function park(ctx: SceneContext, padId: string, occluded: boolean, bodyId: string): void {
    const pad = C1_HIGH_PADS.find((item) => item.id === padId);
    if (!pad) return;
    const index = bodyId === "beacon-1" ? 1 : 0;
    const origin = xyz(pad.at);
    const dir = xyz(C1_LAYOUT.source).sub(origin).setY(0);
    if (dir.lengthSq() < 1e-4) dir.set(0, 0, 1);
    else dir.normalize();
    ctx.triangulation.setBeacon(
      index,
      ctx.triangulation.makeCone(origin, dir, {
        occluded,
        readable: ctx.save.c1.controlsRestored,
        lie: "live",
      }),
    );
    used.add(bodyId);
    parked = ctx.triangulation.beacons.filter((item) => item && item.valid).length;
    if (parked === 1) ctx.say("C1-S04-D002");
  }
}
