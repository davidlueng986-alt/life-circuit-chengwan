import * as THREE from "three";
import { PROMPT, TASK } from "../../content/copy";
import { P_LINE } from "../../content/prologue/ids";
import { P01_LAYOUT as L } from "../../content/prologue/layout";
import { addSolidBox, placeSolid, playPoint } from "../../engine/greybox";
import { makeWorldLabel } from "../../engine/worldHints";
import type { GameScene } from "../types";
import { addRelayMesh, onceFlags, stormShell, tickSceneRain } from "./kit";

export function createDeadLift(): GameScene {
  const flags = onceFlags();
  let rain: THREE.Points | null = null;
  let crate: THREE.Mesh | null = null;
  let cratePos = new THREE.Vector3(L.crate.x, L.crate.y, L.crate.z);
  let pushed = false;
  let climbed = false;

  return {
    id: "P-S01",
    mount(ctx) {
      const lights = stormShell(ctx, false);
      rain = lights.rain;
      const key = playPoint(0xffd8a0, 4.6, 16, 0.95);
      key.position.set(-1.2, 2.3, -1.4);
      const fill = playPoint(0xa8c8dc, 3.4, 16, 1);
      fill.position.set(3.4, 2.6, 2.1);
      const crateLamp = playPoint(0xffc14a, 4.8, 12, 0.9);
      crateLamp.position.set(L.crate.x, 1.9, L.crate.z);
      const rear = playPoint(0x8aa4b8, 2.6, 12, 1);
      rear.position.set(-2.2, 2.4, 2.6);
      ctx.root.add(key, fill, crateLamp, rear);

      addSolidBox(ctx.root, ctx.world, 10.4, 0.4, 10.4, 0x4a5560, 0, -0.2, 0);
      addSolidBox(ctx.root, ctx.world, 10.4, 3.2, 0.4, 0x4e5c68, 0, 1.4, -5.1);
      addSolidBox(ctx.root, ctx.world, 10.4, 3.2, 0.4, 0x4e5c68, 0, 1.4, 5.1);
      addSolidBox(ctx.root, ctx.world, 0.4, 3.2, 10.4, 0x4e5c68, -5.2, 1.4, 0);
      addSolidBox(ctx.root, ctx.world, 0.4, 3.2, 10.4, 0x4e5c68, 5.2, 1.4, 0);

      addSolidBox(ctx.root, ctx.world, 1.9, 2.5, 1.9, 0x15191d, L.liftCage.x, 1.15, L.liftCage.z);
      const door = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 2.1, 0.06),
        new THREE.MeshLambertMaterial({ color: 0x1b1f24 }),
      );
      door.position.set(L.liftCage.x + 0.95, 1.1, L.liftCage.z);
      ctx.root.add(door);

      crate = addSolidBox(ctx.root, ctx.world, 1.15, 0.84, 1.15, 0x8a6a48, cratePos.x, cratePos.y, cratePos.z);
      crate.name = "toolbox";
      const crateMat = crate.material;
      if (crateMat instanceof THREE.MeshStandardMaterial || crateMat instanceof THREE.MeshLambertMaterial) {
        crateMat.emissive = new THREE.Color(0xc9861a);
        crateMat.emissiveIntensity = 0.42;
      }
      const crateTag = makeWorldLabel("工具箱", "E 推開它");
      crateTag.position.set(0, 0.92, 0);
      crate.add(crateTag);
      const crateHalo = new THREE.Mesh(
        new THREE.TorusGeometry(0.82, 0.07, 8, 28),
        new THREE.MeshBasicMaterial({ color: 0xffc14a, fog: false, toneMapped: false, transparent: true, opacity: 0.85, depthWrite: false }),
      );
      crateHalo.rotation.x = -Math.PI / 2;
      crateHalo.position.y = -0.38;
      crate.add(crateHalo);
      const ladderTag = makeWorldLabel("維修梯", "推開後再爬");
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

      addSolidBox(ctx.root, ctx.world, 2.3, 0.28, 1.8, 0x2a3038, 3.4, 2.55, 2.45);
      addSolidBox(ctx.root, ctx.world, 2.4, 1.6, 0.18, 0x12161a, 3.4, 3.3, 3.35);
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
        onUse: () => shove(ctx),
      });
    },
    update(_dt, ctx) {
      tickSceneRain(rain, _dt);
      if (climbed || !pushed) return;
      const hits = ctx.world.sampleTriggers(ctx.player.position);
      if (hits.includes("booth") || (ctx.player.position.y > 2.3 && ctx.player.position.z > 2.05)) {
        climbed = true;
        ctx.completeAndGo();
      }
    },
    unmount() {
      rain = null;
      crate = null;
      pushed = false;
      climbed = false;
    },
  };

  function shove(ctx: Parameters<GameScene["mount"]>[0]): void {
    if (!crate) return;
    const target = pushed
      ? new THREE.Vector3(L.cratePark.x + 0.35, L.cratePark.y, L.cratePark.z + 0.4)
      : new THREE.Vector3(L.cratePark.x, L.cratePark.y, L.cratePark.z);
    placeSolid(crate, target.x, target.y, target.z);
    cratePos.copy(crate.position);
    const item = ctx.interact.items.find((entry) => entry.id === "crate");
    if (item) item.position.copy(cratePos);
    if (pushed) return;
    pushed = true;
    ctx.hud.setTask(TASK["P-S01-ladder"] ?? "");
    if (flags.take("swim")) ctx.say(P_LINE.noSwim);
    ctx.world.addLadder(
      "maint",
      new THREE.Vector3(L.ladder.x - 0.35, 0, L.ladder.z - 0.35),
      new THREE.Vector3(L.ladder.x + 0.4, 2.9, L.ladder.z + 0.4),
    );
    ctx.world.addTrigger(
      "booth",
      new THREE.Vector3(2.55, 2.2, 1.85),
      new THREE.Vector3(4.45, 3.5, 3.35),
    );
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
