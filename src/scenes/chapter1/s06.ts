import * as THREE from "three";
import { C1_BROWNOUT, C1_LAYOUT } from "../../../content/chapter1/layout";
import { openingLineIds } from "../../content/beats";
import { PROMPT, TASK } from "../../content/copy";
import { boxMesh, playPoint, tickRain } from "../../engine/greybox";
import type { GameScene, SceneContext } from "../types";
import { lightHarbor, mountEastShore, mountSluiceRoof, mountWater, xyz } from "./kit";

export function createC1S06(): GameScene {
  let rain: THREE.Points | null = null;
  let saidFlow = false;
  let brownoutSaid = false;
  let latch = false;
  let grateClear = false;
  let relaySeated = false;
  let door = false;
  let roverIn = false;
  let leaving = false;
  let flicker = 0;
  let dim = 1;
  let rover: THREE.Mesh | null = null;
  let grateHome = new THREE.Vector3();
  const key = playPoint(0x8aa4b8, 2.6, 16, 1.1);

  return {
    id: "C1-S06",
    mount(ctx) {
      rain = lightHarbor(ctx, "storm");
      mountEastShore(ctx, { roofs: true });
      mountSluiceRoof(ctx);
      mountWater(ctx);
      key.position.set(2.4, 5.4, 48);
      ctx.root.add(key);

      ctx.bioRig.grantPickup(ctx.save.c1.loadout);
      ctx.bioRig.carry();
      ctx.signals.add({
        id: "residue",
        kind: "leftover_residue",
        a: new THREE.Vector3(C1_LAYOUT.residuePipe[0], 4.1, 46),
        b: new THREE.Vector3(C1_LAYOUT.residuePipe[0], 4.1, 53),
      });
      ctx.signals.add({
        id: "flow",
        kind: "power_live",
        a: new THREE.Vector3(C1_LAYOUT.livePipe[0], 4.1, 46),
        b: new THREE.Vector3(C1_LAYOUT.livePipe[0], 4.1, 53),
      });

      const grate = boxMesh(1.5, 1.1, 0.16, 0x6a6560, C1_LAYOUT.grate[0], C1_LAYOUT.grate[1], C1_LAYOUT.grate[2]);
      const press = boxMesh(0.28, 1.5, 0.28, 0x8a4030, C1_LAYOUT.pressPipe[0], C1_LAYOUT.pressPipe[1], C1_LAYOUT.pressPipe[2]);
      rover = boxMesh(0.7, 0.35, 0.9, 0x4a534c, C1_LAYOUT.roverStart[0], C1_LAYOUT.roverStart[1], C1_LAYOUT.roverStart[2]);
      ctx.root.add(grate, press, rover);
      grateHome.copy(grate.position);

      ctx.tether.registerBody({ id: "grate", object: grate, mass: "heavy", shape: "crate", recoverOnDrop: true });
      ctx.tether.registerBody({ id: "press", object: press, mass: "locked", shape: "joint", pressurised: true });
      ctx.tether.registerSocket({
        id: "grate-park",
        shape: "crate",
        position: new THREE.Vector3(6.2, 3.55, 47.2),
        parent: ctx.root,
        onSeat: () => {
          grateClear = true;
        },
      });
      ctx.tether.registerSocket({
        id: "rover-relay",
        shape: "beacon",
        position: new THREE.Vector3(C1_LAYOUT.door[0], 3.7, C1_LAYOUT.door[2] - 0.6),
        parent: ctx.root,
        onSeat: () => {
          relaySeated = true;
        },
        onUnseat: () => {
          if (!latch) relaySeated = false;
        },
      });
      ctx.tether.registerSocket({
        id: "memory",
        shape: "latch",
        position: xyz(C1_LAYOUT.memorySlot),
        parent: ctx.root,
        onSeat: () => {
          latch = true;
          ctx.bioRig.seatLatch();
          ctx.say("C1-S06-D004");
        },
      });

      const relay = boxMesh(0.28, 0.4, 0.28, 0x8aa0b8, C1_LAYOUT.roverStart[0] + 1.1, 3.45, C1_LAYOUT.roverStart[2]);
      const latchMod = boxMesh(0.26, 0.26, 0.26, 0x7ec8c3, C1_LAYOUT.latchHome[0], C1_LAYOUT.latchHome[1], C1_LAYOUT.latchHome[2]);
      ctx.root.add(relay, latchMod);
      ctx.tether.registerBody({ id: "rover-link", object: relay, mass: "light", shape: "beacon" });
      ctx.tether.registerBody({ id: "latch", object: latchMod, mass: "light", shape: "latch" });

      ctx.player.reset(C1_LAYOUT.spawnS06[0], C1_LAYOUT.spawnS06[1], C1_LAYOUT.spawnS06[2], 0);
      ctx.camera.yaw = 0;
      ctx.hud.setTask(TASK["C1-S06-open"] ?? "");
      ctx.queueLines(openingLineIds("C1-S06", ctx.save));

      ctx.interact.add({
        id: "door",
        prompt: PROMPT.openDoor,
        position: xyz(C1_LAYOUT.door),
        radius: 1.8,
        enabled: true,
        onUse: () => {
          if (!grateClear) {
            ctx.hud.announce("先把格柵移開");
            return;
          }
          if (!relaySeated) {
            ctx.hud.announce("先把無人車接頭扣上");
            return;
          }
          if (!latch) {
            ctx.say("C1-S06-D003");
            ctx.hud.announce("斷電會清掉門鎖。把記憶模組接到槽裡。");
            return;
          }
          door = true;
          ctx.hud.setTask(TASK["C1-S06-evac"] ?? "");
        },
      });
      ctx.interact.add({
        id: "evac",
        prompt: TASK["C1-S06-evac"] ?? PROMPT.advance,
        position: xyz(C1_LAYOUT.evacCable),
        radius: 1.8,
        enabled: true,
        onUse: () => {
          if (!roverIn) {
            ctx.hud.announce("等無人車進去再撤");
            return;
          }
          leaving = true;
          ctx.say("C1-S06-D006");
          ctx.completeAndGo();
        },
      });
    },
    update(dt, ctx) {
      if (rain) tickRain(rain, dt);
      flicker += dt;
      if (ctx.tether.lockHint && ctx.tether.consumedInteract && ctx.tether.focusId === "press") {
        slam(ctx);
      }

      if (ctx.flowLens.justPulsed && !saidFlow) {
        saidFlow = true;
        ctx.say("C1-S06-D002");
      }

      if (!latch && flicker > C1_BROWNOUT) {
        flicker = 0;
        dim = 0.15;
        if (relaySeated) {
          const seated = ctx.tether.seatedIn("rover-relay");
          if (seated) {
            ctx.tether.drop();
            seated.seated = false;
            seated.seatedIn = null;
            const sock = ctx.tether.sockets.find((item) => item.id === "rover-relay");
            if (sock) sock.occupiedBy = null;
            seated.object.position.copy(seated.home);
          }
          relaySeated = false;
        }
        if (!brownoutSaid) {
          brownoutSaid = true;
          ctx.say("C1-S06-D003");
        }
      }
      dim = Math.min(1, dim + dt * 1.8);
      key.intensity = 0.4 + dim * 1.4;

      if (door && rover && !roverIn) {
        rover.position.z += dt * 1.6;
        if (rover.position.z >= C1_LAYOUT.roverEnd[2]) {
          rover.position.z = C1_LAYOUT.roverEnd[2];
          roverIn = true;
          ctx.say("C1-S06-D005");
        }
      }

      if (!leaving && ctx.player.position.y < 2.4 && ctx.player.position.z > 46) {
        ctx.player.pullTo(new THREE.Vector3(C1_LAYOUT.spawnS06[0], C1_LAYOUT.spawnS06[1], C1_LAYOUT.spawnS06[2]), "water");
      }
    },
    unmount() {
      rain = null;
      rover = null;
    },
  };

  function slam(ctx: SceneContext): void {
    const grate = ctx.tether.body("grate");
    if (!grate || !grateClear) return;
    grateClear = false;
    grate.seated = false;
    grate.seatedIn = null;
    const sock = ctx.tether.sockets.find((item) => item.id === "grate-park");
    if (sock) sock.occupiedBy = null;
    grate.object.position.copy(grateHome);
    ctx.hud.announce("安全閥關閉");
  }
}
