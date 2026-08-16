import * as THREE from "three";
import { P_LINE } from "../../content/prologue/ids";
import { P00_LAYOUT as L } from "../../content/prologue/layout";
import { P00 } from "../../content/prologue/script";
import { PROMPT, TASK } from "../../content/copy";
import { addSolidBox, placeSolid, playPoint } from "../../engine/greybox";
import { makeWorldLabel } from "../../engine/worldHints";
import type { GameScene } from "../types";
import {
  SceneVoice,
  addAmberSpine,
  addDeck,
  addGate3,
  addSosBeacon,
  addWaterChannel,
  addXiaocenFigure,
  onceFlags,
  stormShell,
  tickSceneRain,
} from "./kit";

export function createStormArrival(): GameScene {
  const flags = onceFlags();
  const voice = new SceneVoice();
  let rain: THREE.Points | null = null;
  let fill = (t: number) => {
    void t;
  };
  let sos: ReturnType<typeof addSosBeacon> | null = null;
  let water: ReturnType<typeof addWaterChannel> | null = null;
  let elapsed = 0;
  let controlled = false;
  let idle = 0;
  let wrong = 0;
  let doorMesh: THREE.Mesh | null = null;

  return {
    id: "P-S00",
    mount(ctx) {
      const lights = stormShell(ctx, true);
      rain = lights.rain;
      fill = lights.setFill;
      fill(ctx.reducedMotion ? 1 : 0);
      lights.key.position.set(10, 18, -8);

      addDeck(ctx, 14, 10, 0.4, 0);
      addDeck(ctx, 3.6, 26, L.spineX, 11.2);
      addSolidBox(ctx.root, ctx.world, 3.2, 0.2, 0.7, 0x4a535c, L.spineX, 0.1, L.pipeZ);
      addSolidBox(ctx.root, ctx.world, 0.16, 1.05, 26, 0x1a2127, L.spineX - 1.7, 0.52, 11.2);
      addSolidBox(ctx.root, ctx.world, 0.16, 1.05, 26, 0x1a2127, L.spineX + 1.7, 0.52, 11.2);
      addAmberSpine(ctx, L.spineX + 1.05, 1.2, 21.5);

      addSolidBox(ctx.root, ctx.world, 5.2, 3.2, 0.35, 0x2a241c, 6.6, 1.4, -2.4);
      addSolidBox(ctx.root, ctx.world, 5.2, 3.2, 0.35, 0x2a241c, 6.6, 1.4, 2.4);
      addSolidBox(ctx.root, ctx.world, 0.35, 3.2, 5.2, 0x2a241c, 9.2, 1.4, 0);
      addSolidBox(ctx.root, ctx.world, 4.6, 0.4, 4.8, 0x2a241c, 7.2, -0.2, 0);
      addSolidBox(ctx.root, ctx.world, 0.18, 2.3, 1.45, 0x2a241c, L.indoorDoor.x, 1.15, -1.55);
      addSolidBox(ctx.root, ctx.world, 0.18, 2.3, 1.45, 0x2a241c, L.indoorDoor.x, 1.15, 1.55);
      doorMesh = addSolidBox(ctx.root, ctx.world, 0.18, 2.3, 1.5, 0x3a2e22, L.indoorDoor.x, 1.15, 0);
      const warm = playPoint(0xffd08a, 1.8, 8, 1.1);
      warm.position.set(7.4, 1.9, 0);
      const alcoveFill = playPoint(0x9ec0d2, 1.1, 7, 1.15);
      alcoveFill.position.set(8.2, 2.2, 1.4);
      ctx.root.add(warm, alcoveFill);
      const map = addSolidBox(ctx.root, ctx.world, 0.06, 1.1, 1.6, 0x2a2620, 9.02, 1.5, 0);
      map.name = "wall-map";
      const wallPlan = makeWallPlan();
      wallPlan.position.set(8.94, 1.52, 0);
      wallPlan.rotation.y = -Math.PI / 2;
      ctx.root.add(wallPlan);
      const indoorTag = makeWorldLabel("牆上簡圖", "控制室在黃線盡頭");
      indoorTag.position.set(7.6, 2.15, 0);
      ctx.root.add(indoorTag);

      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(0.07, 1.35, 2.5),
        new THREE.MeshLambertMaterial({ color: 0x6f8a99, transparent: true, opacity: 0.28 }),
      );
      glass.position.set(L.spineX - 1.68, 1.15, L.glassZ);
      ctx.root.add(glass);

      addGate3(ctx.root, L.gate.x, L.gate.y, L.gate.z);
      sos = addSosBeacon(ctx.root, L.sos.x, L.sos.y, L.sos.z);
      addXiaocenFigure(ctx.root, L.xiaocen.x, L.xiaocen.y, L.xiaocen.z);
      const gateTag = makeWorldLabel("三號閘", "防洪控制室在橙燈上方");
      gateTag.position.set(L.gate.x + 2.2, L.gate.y + 2.4, L.gate.z);
      const sosTag = makeWorldLabel("橙燈／小岑", "無線電從這裡來");
      sosTag.position.set(L.sos.x, 5.4, L.sos.z);
      const liftTag = makeWorldLabel("控制室入口", "走黃線進升降機");
      liftTag.position.set(L.lift.x, 2.15, L.lift.z);
      ctx.root.add(gateTag, sosTag, liftTag);
      for (let z = 3.2; z < 21; z += 3.4) {
        const chevron = new THREE.Mesh(
          new THREE.ConeGeometry(0.22, 0.55, 3),
          new THREE.MeshBasicMaterial({ color: 0xffc14a }),
        );
        chevron.rotation.x = Math.PI / 2;
        chevron.position.set(L.spineX + 0.15, 0.12, z);
        ctx.root.add(chevron);
      }
      water = addWaterChannel(ctx.root, -10, -3.15, 18);
      water.setDir(-1);

      addSolidBox(ctx.root, ctx.world, 3.6, 0.4, 3.6, 0x2a3036, L.lift.x, -0.2, L.lift.z);
      addSolidBox(ctx.root, ctx.world, 1.7, 2.5, 1.7, 0x1b1f24, L.lift.x, 1.1, L.lift.z + 0.7);
      const cage = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 2.1, 0.08),
        new THREE.MeshLambertMaterial({ color: 0x2a3038, transparent: true, opacity: 0.45 }),
      );
      cage.position.set(L.lift.x, 1.15, L.lift.z - 0.15);
      ctx.root.add(cage);

      ctx.world.addTrigger(
        "indoor",
        new THREE.Vector3(6.5, 0, -1.6),
        new THREE.Vector3(9.1, 2.4, 1.6),
      );
      ctx.world.addTrigger(
        "lift",
        new THREE.Vector3(L.lift.x - 1.4, 0, L.lift.z - 1.5),
        new THREE.Vector3(L.lift.x + 1.4, 2.4, L.lift.z + 1.6),
      );
      ctx.world.addHazard(
        "channel",
        "water",
        new THREE.Vector3(-36, -9, -8),
        new THREE.Vector3(16, -0.55, 48),
      );
      ctx.world.killY = -2.2;
      ctx.world.addAnchor("spawn", 0, 0, 0);
      ctx.world.addAnchor("pipe", L.spineX, 0.2, L.pipeZ);
      ctx.world.addAnchor("glass", L.spineX, 0, L.glassZ);
      ctx.world.addAnchor("lift", L.lift.x, 0, L.lift.z);

      ctx.player.reset(L.spawn.x, L.spawn.y, L.spawn.z, L.spawn.yaw);
      ctx.camera.yaw = L.spawn.yaw;
      ctx.camera.pitch = -0.18;
      ctx.hud.setTask(TASK["P-S00"] ?? "");

      ctx.interact.add({
        id: "indoor-door",
        prompt: PROMPT.wallMap,
        position: new THREE.Vector3(L.indoorDoor.x, 0, 0),
        radius: 1.5,
        enabled: true,
        onUse: () => {
          if (!doorMesh || !flags.take("door")) return;
          placeSolid(doorMesh, L.indoorDoor.x, 1.15, 1.35);
        },
      });
      ctx.interact.add({
        id: "lift-go",
        prompt: "進入升降機井",
        position: new THREE.Vector3(L.lift.x, 0, L.lift.z),
        radius: 2.1,
        enabled: true,
        onUse: () => ctx.completeAndGo(),
      });
      const gateLamp = playPoint(0xff7a28, 3.4, 28, 1.15);
      gateLamp.position.set(L.gate.x, L.gate.y + 2, L.gate.z);
      const liftLamp = playPoint(0xffd08a, 2.1, 12, 1.1);
      liftLamp.position.set(L.lift.x, 2.4, L.lift.z);
      ctx.root.add(gateLamp, liftLamp);

      voice.startRumble();
      voice.squelch();
    },
    update(dt, ctx) {
      elapsed += dt;
      tickSceneRain(rain, dt);
      water?.tick(dt);
      sos?.tick(elapsed);

      if (!controlled) {
        ctx.player.position.set(L.spawn.x, L.spawn.y, L.spawn.z);
        ctx.player.velocity.set(0, 0, 0);
        const t = ctx.reducedMotion ? 1 : Math.min(1, Math.max(0, (elapsed - 0.35) / P00.fadeIn));
        fill(t);
        if (t >= 1) {
          controlled = true;
          ctx.say(P_LINE.control);
        }
        return;
      }

      const moving = ctx.input.axis().x !== 0 || ctx.input.axis().z !== 0;
      if (!moving && ctx.player.position.length() < 2.4) idle += dt;
      else idle = 0;
      if (idle > P00.idleSeconds && flags.take("idle")) ctx.say(P_LINE.linger);

      const look = ctx.camera.lookDir();
      const toGate = new THREE.Vector3(L.gate.x, 0, L.gate.z).sub(ctx.player.position).setY(0);
      if (toGate.lengthSq() > 0.01) toGate.normalize();
      if (look.dot(toGate) < 0.15) wrong += dt;
      else wrong = 0;
      if (wrong > P00.wrongLookSeconds && flags.take("wrong")) ctx.say(P_LINE.wrongLook);

      const hits = ctx.world.sampleTriggers(ctx.player.position);
      if (hits.includes("indoor") && flags.take("indoor")) {
        ctx.say(P_LINE.indoor);
        const route = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, 0.08, 0.9),
          new THREE.MeshBasicMaterial({ color: 0xc9861a }),
        );
        route.position.set(8.96, 1.45, 0);
        ctx.root.add(route);
      }
      if (hits.includes("lift")) ctx.completeAndGo();
    },
    unmount() {
      rain = null;
      sos = null;
      water = null;
      doorMesh = null;
      voice.dispose();
    },
  };
}

function makeWallPlan(): THREE.Mesh {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 320;
  const g = canvas.getContext("2d");
  if (g) {
    g.fillStyle = "#1a2228";
    g.fillRect(0, 0, 512, 320);
    g.strokeStyle = "#e0a03a";
    g.lineWidth = 10;
    g.strokeRect(12, 12, 488, 296);
    g.fillStyle = "#fff4d6";
    g.font = "bold 34px 'Noto Sans TC', 'Microsoft JhengHei', sans-serif";
    g.fillText("控制室不在這間房", 40, 72);
    g.fillStyle = "#8fd4cf";
    g.font = "28px 'Noto Sans TC', 'Microsoft JhengHei', sans-serif";
    g.fillText("沿黃線走到橙燈／升降機", 40, 122);
    g.strokeStyle = "#c9861a";
    g.lineWidth = 12;
    g.beginPath();
    g.moveTo(70, 240);
    g.lineTo(250, 240);
    g.lineTo(250, 176);
    g.stroke();
    g.fillStyle = "#ff7a28";
    g.beginPath();
    g.arc(250, 164, 16, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#ffe2a0";
    g.font = "22px 'Noto Sans TC', 'Microsoft JhengHei', sans-serif";
    g.fillText("橙燈", 274, 172);
  }
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(
    new THREE.PlaneGeometry(1.72, 1.08),
    new THREE.MeshBasicMaterial({ map, fog: false, toneMapped: false }),
  );
}
