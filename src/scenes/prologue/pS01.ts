import * as THREE from "three";
import { PROMPT, TASK } from "../../content/copy";
import { P_LINE } from "../../content/prologue/ids";
import { P01_LAYOUT as L } from "../../content/prologue/layout";
import { addSolidBox, isLitMat, placeSolid, playPoint } from "../../engine/greybox";
import { applyKind } from "../../engine/materials";
import { lookFlat } from "../../engine/motorMath";
import { addVoxelFloor, addVoxelVolume } from "../../engine/voxels";
import { makeWorldLabel } from "../../engine/worldHints";
import type { GameScene, SceneContext } from "../types";
import { addRelayMesh, onceFlags, stormShell, tickSceneRain } from "./kit";

export function createDeadLift(): GameScene {
  const flags = onceFlags();
  let rain: THREE.Points | null = null;
  let crate: THREE.Mesh | null = null;
  let cratePos = new THREE.Vector3(L.crate.x, L.crate.y, L.crate.z);
  let ladderReady = false;
  let climbed = false;
  let nudgeHint = 0;

  return {
    id: "P-S01",
    mount(ctx) {
      const lights = stormShell(ctx, false);
      rain = lights.rain;
      const key = playPoint(0xffd8a0, 1.8, 10, 1.05);
      key.position.set(-1.2, 2.3, -1.4);
      const crateLamp = playPoint(0xffc14a, 2.2, 8, 1);
      crateLamp.position.set(L.crate.x, 1.7, L.crate.z);
      ctx.root.add(key, crateLamp);

      addVoxelFloor(ctx.root, ctx.world, 10.4, 10.4, 0x4a5560, 0, 0);
      addVoxelVolume(ctx.root, ctx.world, 10.4, 3.2, 0.4, 0x4e5c68, 0, 1.4, -5.1);
      addVoxelVolume(ctx.root, ctx.world, 10.4, 3.2, 0.4, 0x4e5c68, 0, 1.4, 5.1);
      addVoxelVolume(ctx.root, ctx.world, 0.4, 3.2, 10.4, 0x4e5c68, -5.2, 1.4, 0);
      addVoxelVolume(ctx.root, ctx.world, 0.4, 3.2, 10.4, 0x4e5c68, 5.2, 1.4, 0);

      addVoxelVolume(ctx.root, ctx.world, 1.9, 2.5, 1.9, 0x15191d, L.liftCage.x, 1.15, L.liftCage.z);
      const door = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 2.1, 0.06),
        new THREE.MeshLambertMaterial({ color: 0x1b1f24 }),
      );
      door.position.set(L.liftCage.x + 0.95, 1.1, L.liftCage.z);
      ctx.root.add(door);

      crate = addSolidBox(ctx.root, ctx.world, 1.15, 0.84, 1.15, 0x8a6a48, cratePos.x, cratePos.y, cratePos.z);
      crate.name = "toolbox";
      const crateMat = crate.material;
      if (crateMat instanceof THREE.MeshStandardMaterial) {
        applyKind(crateMat, "wood", 1.2, 1.2);
        crateMat.emissive = new THREE.Color(0xc9861a);
        crateMat.emissiveIntensity = 0.38;
      } else if (isLitMat(crateMat)) {
        crateMat.emissive = new THREE.Color(0xc9861a);
        crateMat.emissiveIntensity = 0.42;
      }
      const crateTag = makeWorldLabel("工具箱", "按住 E 往梯子推");
      crateTag.position.set(0, 0.92, 0);
      crate.add(crateTag);
      const crateHalo = new THREE.Mesh(
        new THREE.TorusGeometry(0.82, 0.07, 8, 28),
        new THREE.MeshBasicMaterial({
          color: 0xffc14a,
          fog: false,
          toneMapped: false,
          transparent: true,
          opacity: 0.85,
          depthWrite: false,
        }),
      );
      crateHalo.rotation.x = -Math.PI / 2;
      crateHalo.position.y = -0.38;
      crate.add(crateHalo);
      const ladderTag = makeWorldLabel("維修梯", "箱子擋住了，先推開");
      ladderTag.position.set(L.ladder.x, 2.4, L.ladder.z);
      ctx.root.add(ladderTag);
      const handle = new THREE.Mesh(
        new THREE.TorusGeometry(0.16, 0.03, 6, 10, Math.PI),
        new THREE.MeshLambertMaterial({ color: 0xc9a36a }),
      );
      handle.position.set(0, 0.48, 0);
      crate.add(handle);

      const ladder = new THREE.Mesh(
        new THREE.BoxGeometry(0.72, 2.65, 0.1),
        new THREE.MeshLambertMaterial({ color: 0x8a7a62 }),
      );
      ladder.position.set(L.ladder.x, 1.3, L.ladder.z);
      ctx.root.add(ladder);
      for (let i = 0; i < 6; i += 1) {
        const rung = new THREE.Mesh(
          new THREE.BoxGeometry(0.62, 0.04, 0.08),
          new THREE.MeshLambertMaterial({ color: 0x6a5a44 }),
        );
        rung.position.set(L.ladder.x, 0.3 + i * 0.4, L.ladder.z + 0.04);
        ctx.root.add(rung);
      }

      addVoxelVolume(ctx.root, ctx.world, 2.3, 0.28, 1.8, 0x2a3038, 3.4, 2.55, 2.45);
      addVoxelVolume(ctx.root, ctx.world, 2.4, 1.6, 0.18, 0x12161a, 3.4, 3.3, 3.35);
      const crack = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 1.5, 0.06),
        new THREE.MeshBasicMaterial({ color: 0x050608 }),
      );
      crack.position.set(3.55, 3.15, 3.28);
      ctx.root.add(crack);

      const deskGlow = playPoint(0xc9861a, 2.2, 8, 1.1);
      deskGlow.position.set(3.4, 2.95, 2.7);
      ctx.root.add(deskGlow);
      addRelayMesh(ctx.root, 3.35, 2.82, 2.55, 0xc9861a);

      ctx.world.addAnchor("floor", 0, 0, -2.6);
      ctx.world.killY = -2.2;
      const faceCrate = Math.atan2(-(L.crate.x - L.spawn.x), -(L.crate.z - L.spawn.z));
      ctx.player.reset(L.spawn.x, L.spawn.y, L.spawn.z, faceCrate);
      ctx.camera.yaw = faceCrate;
      ctx.camera.pitch = -0.1;
      ctx.hud.setTask(TASK["P-S01-crate"] ?? "");
      ctx.say(P_LINE.deadLift);

      ctx.interact.add({
        id: "crate",
        prompt: PROMPT.pushCrate,
        position: cratePos.clone(),
        radius: 2.35,
        enabled: true,
        onUse: () => nudge(ctx, 0.42),
      });
    },
    update(dt, ctx) {
      tickSceneRain(rain, dt);
      if (ctx.interact.focused?.id === "crate" && ctx.input.interactHeld) {
        nudge(ctx, 1.55 * dt);
      }
      if (climbed || !ladderReady) return;
      const hits = ctx.world.sampleTriggers(ctx.player.position);
      if (hits.includes("booth") || (ctx.player.position.y > 2.3 && ctx.player.position.z > 2.05)) {
        climbed = true;
        ctx.completeAndGo();
      }
    },
    unmount() {
      rain = null;
      crate = null;
      ladderReady = false;
      climbed = false;
    },
  };

  function nudge(ctx: SceneContext, step: number): void {
    if (!crate) return;
    const look = lookFlat(ctx.camera.yaw);
    const toPark = new THREE.Vector3(L.cratePark.x - cratePos.x, 0, L.cratePark.z - cratePos.z);
    const along = look.x * toPark.x + look.z * toPark.z;
    if (along < -0.05 && toPark.length() > 0.2) {
      nudgeHint += 1;
      if (nudgeHint === 1 || nudgeHint % 40 === 0) ctx.hud.announce("往梯子那一側推");
      return;
    }
    const nx = THREE.MathUtils.clamp(cratePos.x + look.x * step, -4.2, 4.6);
    const nz = THREE.MathUtils.clamp(cratePos.z + look.z * step, -4.2, 4.4);
    cratePos.set(nx, L.crate.y, nz);
    placeSolid(crate, cratePos.x, cratePos.y, cratePos.z);
    const item = ctx.interact.items.find((entry) => entry.id === "crate");
    if (item) item.position.copy(cratePos);
    const cleared = cratePos.distanceTo(new THREE.Vector3(L.ladder.x, L.crate.y, L.ladder.z)) > 1.25;
    if (cleared && !ladderReady) openLadder(ctx);
  }

  function openLadder(ctx: SceneContext): void {
    ladderReady = true;
    ctx.hud.setTask(TASK["P-S01-ladder"] ?? "");
    if (flags.take("swim")) ctx.say(P_LINE.noSwim);
    ctx.world.addLadder(
      "maint",
      new THREE.Vector3(L.ladder.x - 0.35, 0, L.ladder.z - 0.35),
      new THREE.Vector3(L.ladder.x + 0.4, 2.9, L.ladder.z + 0.4),
    );
    ctx.world.addTrigger("booth", new THREE.Vector3(2.55, 2.2, 1.85), new THREE.Vector3(4.45, 3.5, 3.35));
    ctx.interact.add({
      id: "ladder",
      prompt: PROMPT.climb,
      position: new THREE.Vector3(L.ladder.x, 0, L.ladder.z),
      radius: 2.05,
      enabled: true,
      onUse: () => {
        ctx.player.position.set(L.booth.x, 2.55, L.booth.z);
        ctx.completeAndGo();
      },
    });
    ctx.interact.add({
      id: "booth",
      prompt: "進入控制室",
      position: new THREE.Vector3(L.booth.x, 2.4, L.booth.z),
      radius: 1.6,
      enabled: true,
      onUse: () => ctx.completeAndGo(),
    });
  }
}
