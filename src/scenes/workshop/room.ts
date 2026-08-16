import * as THREE from "three";
import { UI } from "../../content/copy";
import { leaveWorkshop } from "../../content/progress";
import { WORKSHOP, addPlayLights, addSolidBox, applyFog, lamp, playPoint } from "../../engine/greybox";
import type { SceneContext } from "../types";
import { lambert, safePadMesh } from "./kit";

export interface WorkshopRoom {
  pad: THREE.Group;
  floorY: number;
}

export function ensureWorkshopTools(ctx: SceneContext): void {
  let dirty = false;
  if (!ctx.save.player.tool.flowLens) {
    ctx.save.player.tool.flowLens = true;
    ctx.flowLens.grantPickup();
    dirty = true;
  }
  if (!ctx.save.player.tool.tether) {
    ctx.save.player.tool.tether = true;
    ctx.tether.grantPickup();
    dirty = true;
  }
  if (!ctx.flowLens.owned) ctx.flowLens.reset(true);
  if (!ctx.tether.owned) ctx.tether.reset(true, ctx.save.settings.holdAlternatives);
  if (dirty) ctx.persist();
}

export function mountRoundRoom(ctx: SceneContext, radius = 8.6): WorkshopRoom {
  applyFog(ctx.three, WORKSHOP, ctx.reducedMotion);
  if (ctx.three.fog instanceof THREE.FogExp2) ctx.three.fog.density = 0.0035;
  ctx.root.add(new THREE.HemisphereLight(0xe8fff8, 0x304848, 1.25));
  ctx.root.add(lamp(WORKSHOP.accent, 0, 3.4, 0));
  addPlayLights(ctx.root, "workshop");
  const key = playPoint(0xc8fff8, 4.4, 22, 1);
  key.position.set(2.4, 2.8, 3.2);
  const fill = new THREE.DirectionalLight(0xf0fffc, 0.95);
  fill.position.set(-4, 8, 6);
  ctx.root.add(key, fill);

  addSolidBox(ctx.root, ctx.world, radius * 2, 0.4, radius * 2, WORKSHOP.floor, 0, -0.2, 0);
  addSolidBox(ctx.root, ctx.world, radius * 2, 3.5, 0.4, WORKSHOP.wall, 0, 1.55, -radius);
  addSolidBox(ctx.root, ctx.world, radius * 2, 3.5, 0.4, WORKSHOP.wall, 0, 1.55, radius);
  addSolidBox(ctx.root, ctx.world, 0.4, 3.5, radius * 2, WORKSHOP.wall, -radius, 1.55, 0);
  addSolidBox(ctx.root, ctx.world, 0.4, 3.5, radius * 2, WORKSHOP.wall, radius, 1.55, 0);
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 3.2, 0.28),
      lambert(WORKSHOP.wall),
    );
    post.position.set(Math.cos(a) * (radius - 0.15), 1.6, Math.sin(a) * (radius - 0.15));
    ctx.root.add(post);
  }

  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(radius - 0.15, radius - 0.15, 0.06, 28),
    lambert(0x3a585c, 0x1a3034, 0.25),
  );
  disc.position.y = 0.01;
  ctx.root.add(disc);

  return { pad: placeSafePad(ctx, new THREE.Vector3(-(radius - 1.05), 0, radius - 1.05)), floorY: 0 };
}

export function mountHall(ctx: SceneContext, length = 20, width = 11): WorkshopRoom {
  applyFog(ctx.three, WORKSHOP, ctx.reducedMotion);
  if (ctx.three.fog instanceof THREE.FogExp2) ctx.three.fog.density = 0.0035;
  ctx.root.add(new THREE.HemisphereLight(0xc8fff4, 0x203028, 1.1));
  ctx.root.add(lamp(WORKSHOP.accent, 0, 3.1, 0));
  addPlayLights(ctx.root, "workshop");
  addSolidBox(ctx.root, ctx.world, width, 0.4, length, WORKSHOP.floor, 0, -0.2, 0);
  addSolidBox(ctx.root, ctx.world, width, 3.4, 0.4, WORKSHOP.wall, 0, 1.5, -length / 2);
  addSolidBox(ctx.root, ctx.world, width, 3.4, 0.4, WORKSHOP.wall, 0, 1.5, length / 2);
  addSolidBox(ctx.root, ctx.world, 0.4, 3.4, length, WORKSHOP.wall, -width / 2, 1.5, 0);
  addSolidBox(ctx.root, ctx.world, 0.4, 3.4, length, WORKSHOP.wall, width / 2, 1.5, 0);
  return { pad: placeSafePad(ctx, new THREE.Vector3(width / 2 - 1.4, 0, length / 2 - 1.15)), floorY: 0 };
}

export function placeSafePad(ctx: SceneContext, position: THREE.Vector3): THREE.Group {
  const pad = safePadMesh();
  pad.position.copy(position);
  ctx.root.add(pad);
  ctx.interact.add({
    id: "safe-pad",
    prompt: UI.leaveWorkshop,
    position: position.clone(),
    radius: 0.82,
    enabled: true,
    onUse: () => {
      leaveWorkshop(ctx.save, ctx.save.meta.currentScene);
      ctx.persist();
      ctx.loadScene("HUB-S00");
    },
  });
  return pad;
}

export function tickPad(pad: THREE.Group, time: number, reduced: boolean): void {
  const pulse = reduced ? 0.45 : 0.35 + 0.2 * Math.sin(time * 2.2);
  pad.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const mat = child.material;
    if (
      (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshLambertMaterial) &&
      child.geometry instanceof THREE.TorusGeometry
    ) {
      mat.emissiveIntensity = pulse;
    }
  });
}

export function spawnWorkshopPlayer(ctx: SceneContext, x: number, z: number, yaw = 0): void {
  ctx.player.reset(x, 0, z, yaw);
  ctx.camera.yaw = yaw;
  ctx.save.workshop.resumeScene = ctx.save.meta.currentScene;
  ctx.save.workshop.available = true;
}

export function lookingAt(
  ctx: SceneContext,
  target: THREE.Vector3,
  maxDist: number,
  minAlign: number,
): boolean {
  const eye = ctx.player.position.clone();
  eye.y += 1.35;
  const to = target.clone().sub(eye);
  const dist = to.length();
  if (dist > maxDist) return false;
  to.multiplyScalar(1 / dist);
  return ctx.camera.lookDir3().dot(to) >= minAlign;
}

export function finishWhenIdle(state: { armed: boolean; wait: number }, dt: number, ctx: SceneContext): void {
  if (!state.armed) return;
  if (!ctx.hud.queueIdle) return;
  state.wait += dt;
  if (state.wait > 0.55) ctx.completeAndGo();
}
