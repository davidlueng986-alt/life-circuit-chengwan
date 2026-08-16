import * as THREE from "three";
import { C1_LAYOUT } from "../../../content/chapter1/layout";
import { HARBOR, HUB, addPlayLights, addSolidBox, applyFog, boxMesh, configureKeyShadow, lamp, makeRain, playPoint, waterSheet, type Palette } from "../../engine/greybox";
import { makeWorldLabel } from "../../engine/worldHints";
import type { SceneContext } from "../types";

export type HarborWeather = "hub" | "fog" | "storm";

export function xyz(at: readonly [number, number, number]): THREE.Vector3 {
  return new THREE.Vector3(at[0], at[1], at[2]);
}

export function lightHarbor(ctx: SceneContext, weather: HarborWeather): THREE.Points | null {
  const palette: Palette = weather === "hub" ? HUB : HARBOR;
  applyFog(ctx.three, palette, ctx.reducedMotion);
  if (weather === "hub") {
    if (ctx.three.fog instanceof THREE.FogExp2) {
      ctx.three.fog.density = ctx.reducedMotion ? 0.004 : 0.006;
    }
    ctx.root.add(new THREE.HemisphereLight(0xfff0dc, 0x2a2218, 1.25));
    const sun = new THREE.DirectionalLight(0xffe6c4, 1.85);
    sun.position.set(8, 16, 6);
    configureKeyShadow(sun, 22);
    ctx.root.add(sun);
    ctx.root.add(lamp(HUB.accent, 0, 3.2, 0));
    addPlayLights(ctx.root, "hub");
    return null;
  }
  if (ctx.three.fog instanceof THREE.FogExp2) {
    ctx.three.fog.density = ctx.reducedMotion ? 0.005 : weather === "storm" ? 0.008 : 0.006;
  }
  ctx.root.add(new THREE.HemisphereLight(0xf0dcc4, 0x2a2218, 1.18));
  const key = new THREE.DirectionalLight(weather === "storm" ? 0xc4d8e6 : 0xffe2b8, weather === "storm" ? 1.45 : 1.7);
  key.position.set(weather === "storm" ? -8 : 10, 18, 6);
  configureKeyShadow(key, 30);
  ctx.root.add(key);
  addPlayLights(ctx.root, weather === "storm" ? "storm" : "harbor");
  if (weather !== "storm") return null;
  const rain = makeRain(ctx.reducedMotion);
  if (rain) ctx.root.add(rain);
  return rain;
}

export function deck(
  ctx: SceneContext,
  w: number,
  d: number,
  x: number,
  z: number,
  y = 0,
  color = HARBOR.floor,
): THREE.Mesh {
  return addSolidBox(ctx.root, ctx.world, w, 0.4, d, color, x, y - 0.2, z);
}

export function wall(ctx: SceneContext, w: number, h: number, d: number, x: number, y: number, z: number, color = HARBOR.wall): THREE.Mesh {
  return addSolidBox(ctx.root, ctx.world, w, h, d, color, x, y, z);
}

export function addLadder(ctx: SceneContext, id: string, x: number, z: number, top: number): void {
  addSolidBox(ctx.root, ctx.world, 0.36, top, 0.18, 0x6a5340, x, top / 2, z);
  ctx.world.addLadder(id, new THREE.Vector3(x - 0.45, 0, z - 0.4), new THREE.Vector3(x + 0.45, top + 0.2, z + 0.4));
}

export function mountWater(ctx: SceneContext): void {
  ctx.root.add(waterSheet(90, 110, 6, -1.6, 24));
  ctx.world.killY = -2.2;
  ctx.world.addHazard("basin", "water", new THREE.Vector3(-28, -8, -8), new THREE.Vector3(34, -0.45, 70));
}

export function blinkMesh(color: number, x: number, y: number, z: number): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 8, 8),
    new THREE.MeshBasicMaterial({ color }),
  ).translateX(x).translateY(y).translateZ(z);
}

export function mountEastShore(ctx: SceneContext, opts: { floodMarket?: boolean; floodPier?: boolean; roofs?: boolean }): void {
  deck(ctx, 22, 18, 0, 8);
  deck(ctx, 12, 22, -1, 26);
  deck(ctx, 10, 10, -12, 12, 0, 0x3a322c);
  deck(ctx, 8, 6, 10, 11.2);
  wall(ctx, 0.4, 2.2, 8, 15.4, 1.1, 20, 0x4a4034);
  wall(ctx, 6, 3.4, 6, 19.4, 1.7, 20, 0x5a4034);
  wall(ctx, 6.4, 3.6, 6.4, 1, 1.8, 31.2, 0x3a322c);
  wall(ctx, 0.35, 2.4, 8, -2.2, 1.2, 38.4);
  wall(ctx, 0.35, 2.4, 8, 3.2, 1.2, 38.4);
  deck(ctx, 5.2, 10, 0.5, 39.2);
  deck(ctx, 8, 8, -12.2, 40, 1.2, 0x4a4034);
  wall(ctx, 5.4, 2.2, 0.32, -12.4, 2.4, 42.15, 0x3d5c58);
  wall(ctx, 0.28, 2.2, 2.5, -15.05, 2.4, 40.9, 0x3d5c58);
  wall(ctx, 0.28, 2.2, 2.5, -9.75, 2.4, 40.9, 0x3d5c58);
  wall(ctx, 5.4, 0.22, 2.6, -12.4, 3.52, 40.9, 0x2f4a48);

  const stall = addSolidBox(ctx.root, ctx.world, 3.4, 2.2, 2.4, 0x4a4034, -13.2, 1.1, 13.4);
  stall.name = "stall-shade";
  addSolidBox(ctx.root, ctx.world, 1.4, 0.7, 0.9, 0x6a5340, C1_LAYOUT.cart[0], C1_LAYOUT.cart[1], C1_LAYOUT.cart[2]);

  const warehouseLamp = playPoint(0xef6a1a, 5.2, 22, 1.05);
  warehouseLamp.position.set(18.6, 3.6, 20);
  warehouseLamp.name = "city-blink";
  ctx.root.add(warehouseLamp);
  const marketTag = makeWorldLabel("市集棚", "陳姨走這裡");
  marketTag.position.set(-13.2, 2.6, 13.4);
  const storeTag = makeWorldLabel("倉庫燈", "遠方城市光");
  storeTag.position.set(18.6, 4.4, 20);
  const pumpTag = makeWorldLabel("抽水站", "往河閘");
  pumpTag.position.set(1, 3.4, 31.2);
  ctx.root.add(marketTag, storeTag, pumpTag);

  if (opts.floodMarket) {
    ctx.world.addHazard("market-tide", "water", new THREE.Vector3(-18, -1, 6), new THREE.Vector3(-6, 0.55, 20));
    ctx.root.add(waterSheet(14, 16, -12, 0.35, 12));
  }
  if (opts.floodPier) {
    ctx.world.addHazard("pier-tide", "water", new THREE.Vector3(6, -1, 8), new THREE.Vector3(16, 0.45, 15));
  }
  if (opts.roofs) {
    deck(ctx, 8, 8, -11.4, 12, 3.15, 0x4a4034);
    deck(ctx, 4, 4, 6.4, 22.4, 3.25, 0x5a6570);
    deck(ctx, 3.4, 3.4, -3.6, 32.2, 4.05, 0x4a534c);
    deck(ctx, 5, 4, 1.2, 30.8, 3.35, 0x3a322c);
    deck(ctx, 8, 10, 2.2, 48, 3.15, 0x3a4038);
    addLadder(ctx, "lad-market", -7.6, 10.4, 3.2);
    addLadder(ctx, "lad-crane", 4.4, 20.6, 3.3);
    addLadder(ctx, "lad-drain", -3.6, 28.6, 4.1);
    addLadder(ctx, "lad-pump", -2.4, 30.8, 3.4);
    addLadder(ctx, "lad-sluice", 2.2, 42.2, 3.2);
    wall(ctx, 1.8, 2.2, 0.3, -2.2, 4.2, 32.4, 0x2a2620);
    ctx.signals.addOccluder({
      id: "drain-occlude",
      min: new THREE.Vector3(-3.2, 3.2, 31.8),
      max: new THREE.Vector3(-1.2, 5.6, 32.8),
      kind: "solid",
    });
  }

  ctx.root.add(waterSheet(40, 20, 18, -0.8, 36));
}

export function mountHubMorning(ctx: SceneContext): void {
  deck(ctx, 22, 16, 0, 0, 0, HUB.floor);
  wall(ctx, 22, 4, 0.4, 0, 2, -8, HUB.wall);
  wall(ctx, 22, 4, 0.4, 0, 2, 8, HUB.wall);
  wall(ctx, 0.4, 4, 16, -11, 2, 0, HUB.wall);
  wall(ctx, 0.4, 4, 16, 11, 2, 0, HUB.wall);
  addSolidBox(ctx.root, ctx.world, 4.6, 0.7, 2.2, 0x4a4034, 0, 0.35, 0);
  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(8, 2.2, 0.08),
    new THREE.MeshLambertMaterial({ color: 0x88a0b0, transparent: true, opacity: 0.28 }),
  );
  glass.position.set(0, 2.2, 7.7);
  ctx.root.add(glass);
}

export function mountSluiceRoof(ctx: SceneContext): void {
  deck(ctx, 10, 14, 2.2, 48, 3.15, 0x3a4038);
  wall(ctx, 10, 1.1, 0.2, 2.2, 3.7, 41.2);
  wall(ctx, 0.25, 1.4, 14, -2.6, 3.9, 48);
  wall(ctx, 0.25, 1.4, 14, 7, 3.9, 48);
  wall(ctx, 4.6, 3.4, 0.5, 2.4, 4.8, 55.4, 0x2a2620);
  addSolidBox(ctx.root, ctx.world, 0.7, 2.6, 0.18, 0xc9a227, 4.8, 4.4, 52.2);
  ctx.world.addAnchor("sluice", 1.6, 3.15, 44.2);
  ctx.world.addAnchor("door-pad", 2.4, 3.15, 50.6);
}

export function addReporterStand(ctx: SceneContext, at: THREE.Vector3, colorOnly: boolean): THREE.Group {
  const group = new THREE.Group();
  group.position.copy(at);
  const pole = boxMesh(0.12, 1.1, 0.12, 0x3a322c, 0, 0, 0);
  const lampHead = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 8, 8),
    new THREE.MeshLambertMaterial({ color: 0x8a3030, emissive: 0x6a1010, emissiveIntensity: 0.5 }),
  );
  lampHead.position.set(0, 0.7, 0);
  lampHead.name = "demo-lamp";
  const flag = boxMesh(0.08, 0.28, 0.2, 0x7ec8c3, 0.18, 0.72, 0);
  flag.visible = !colorOnly;
  flag.name = "demo-flag";
  group.add(pole, lampHead, flag);
  ctx.root.add(group);
  return group;
}

export function pulseCityLight(mesh: THREE.Object3D | null, t: number): void {
  if (!mesh) return;
  if (mesh instanceof THREE.PointLight) {
    mesh.intensity = t % 2.4 < 0.28 ? 280 : 24;
  }
}

export function near(player: THREE.Vector3, at: readonly [number, number, number], radius: number): boolean {
  const dx = player.x - at[0];
  const dz = player.z - at[2];
  return dx * dx + dz * dz < radius * radius;
}

export function lookToward(ctx: SceneContext, at: readonly [number, number, number]): number {
  const dir = new THREE.Vector3(at[0] - ctx.player.position.x, 0, at[2] - ctx.player.position.z);
  if (dir.lengthSq() < 1e-4) return 1;
  dir.normalize();
  return ctx.camera.lookDir().dot(dir);
}

export function furnitureForModel(ctx: SceneContext, model: "fixed_station" | "portable_kits" | null): void {
  addSolidBox(ctx.root, ctx.world, 0.4, 1.1, 0.4, 0xb85c38, C1_LAYOUT.stopBtn[0], C1_LAYOUT.stopBtn[1], C1_LAYOUT.stopBtn[2]);
  addSolidBox(ctx.root, ctx.world, 1.6, 1.4, 0.12, 0x2a3640, C1_LAYOUT.board[0], C1_LAYOUT.board[1], C1_LAYOUT.board[2]);
  if (model === "fixed_station") {
    addSolidBox(ctx.root, ctx.world, 1.8, 2.1, 1.8, 0x8a8f86, 8.2, 1.05, 5.6);
    addSolidBox(ctx.root, ctx.world, 0.9, 1.1, 0.9, 0x6a7068, 14.4, 0.55, 18.2);
  } else if (model === "portable_kits") {
    for (let i = 0; i < 4; i += 1) {
      addSolidBox(ctx.root, ctx.world, 0.45, 0.7, 0.45, 0x8a6a40, 7.2 + i * 0.7, 0.35, 5.2 + (i % 2) * 0.5);
    }
    addSolidBox(ctx.root, ctx.world, 1.8, 0.35, 0.6, 0x5a4a34, 8.4, 0.22, 6.6);
  }
}
