import * as THREE from "three";
import { PROMPT, TASK } from "../../content/copy";
import { HUB, addSolidBox } from "../../engine/greybox";
import type { GameScene } from "../types";
import { consoleDesk, replayToken } from "./kit";
import { ensureWorkshopTools, mountRoundRoom, spawnWorkshopPlayer, tickPad } from "./room";

const STEPS = ["ask", "build", "run", "break", "fix", "retest"] as const;

export function createRecapScene(): GameScene {
  let time = 0;
  let shrink = 0;
  let replay = 0;
  let said = false;
  let pad: THREE.Group | null = null;
  let wing: THREE.Group | null = null;
  const tokens: THREE.Mesh[] = [];

  return {
    id: "W-S05",
    mount(ctx) {
      const room = mountRoundRoom(ctx, 7.6);
      pad = room.pad;
      ensureWorkshopTools(ctx);
      spawnWorkshopPlayer(ctx, 0, 4.6, 0);
      ctx.hud.setTask(TASK["W-S05"] ?? "");

      wing = new THREE.Group();
      wing.name = "model-wing";
      const shell = new THREE.Mesh(
        new THREE.SphereGeometry(2.1, 18, 12),
        new THREE.MeshLambertMaterial({ color: 0x3d6a68, transparent: true, opacity: 0.16, depthWrite: false }),
      );
      shell.position.set(0, 1.6, -1.2);
      wing.add(shell);
      ctx.root.add(wing);

      const desk = consoleDesk();
      desk.position.set(0, 0.75, -1.4);
      ctx.root.add(desk);
      for (let i = 0; i < STEPS.length; i += 1) {
        const step = STEPS[i]!;
        const token = replayToken(step);
        token.position.set(-0.75 + i * 0.3, 0.92, -1.4);
        ctx.root.add(token);
        tokens.push(token);
      }

      addSolidBox(ctx.root, ctx.world, 1.4, 2.1, 0.18, HUB.wall, 0, 1.1, -6.4);
      const door = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 1.8, 0.12),
        new THREE.MeshLambertMaterial({ color: 0x4a4034, emissive: 0xc9861a, emissiveIntensity: 0.2 }),
      );
      door.position.set(0, 0.95, -6.28);
      ctx.root.add(door);
      ctx.interact.add({
        id: "hub-door",
        prompt: PROMPT.advance,
        position: new THREE.Vector3(0, 0, -6.1),
        radius: 1.6,
        enabled: true,
        onUse: () => {
          if (!said) return;
          ctx.completeAndGo();
        },
      });
    },
    update(dt, ctx) {
      time += dt;
      if (pad) tickPad(pad, time, ctx.reducedMotion);
      shrink = ctx.reducedMotion ? 1 : Math.min(1, shrink + dt * 0.45);
      if (wing) {
        const s = 1 - shrink * 0.55;
        wing.scale.setScalar(s);
        wing.position.y = shrink * -0.2;
      }
      if (shrink >= 1) {
        replay = Math.min(STEPS.length, replay + dt * (ctx.reducedMotion ? 4 : 1.15));
        const shown = Math.floor(replay);
        for (let i = 0; i < tokens.length; i += 1) {
          const token = tokens[i];
          if (!token) continue;
          token.visible = i < shown;
          if (token.visible && !ctx.reducedMotion) {
            token.position.y = 0.92 + Math.sin(time * 3 + i) * 0.03;
          }
        }
        if (shown >= STEPS.length && !said) {
          said = true;
          ctx.queueLines(["W-S05-D001", "W-S05-D002", "W-S05-D003"]);
        }
      }
    },
    unmount() {
      time = 0;
      shrink = 0;
      replay = 0;
      said = false;
      pad = null;
      wing = null;
      tokens.length = 0;
    },
  };
}
