import * as THREE from "three";
import { P_LINE } from "../../content/prologue/ids";
import { P00_LAYOUT as L } from "../../content/prologue/layout";
import { P00 } from "../../content/prologue/script";
import { PROMPT, TASK } from "../../content/copy";
import { addSolidBox, placeSolid, playPoint } from "../../engine/greybox";
import { BlockStamp, floorBox, wallBox } from "../../engine/blocks";
import {
  dressInterior,
  dressPerimeter,
  stampBuilding,
  stampLampPost,
  stampPiling,
  stampRailing,
  stampStationMass,
} from "../../engine/dress";
import type { GameScene } from "../types";
import {
  SceneVoice,
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
  let gate: ReturnType<typeof addGate3> | null = null;

  return {
    id: "P-S00",
    mount(ctx) {
      const lights = stormShell(ctx, true);
      rain = lights.rain;
      fill = lights.setFill;
      fill(ctx.reducedMotion ? 1 : 0);
      lights.key.position.set(10, 18, -8);

      const map = new BlockStamp();
      map.fill(-8, -1, -5, 10, -1, 7, "stone");
      map.fill(-3, -1, 7, 2, -1, 25, "lamp");
      map.fill(-8, -1, 7, -4, -1, 18, "stone");
      map.fill(-4, 0, 7, -4, 1, 24, "iron");
      map.fill(3, 0, 7, 3, 1, 24, "iron");
      map.fill(-16, -4, -2, -5, -2, 28, "water");
      map.fill(-5, 0, 12, -5, 2, 16, "glass");
      map.room(6, -3, 12, 3, -1, 3, "wood", "wood");
      for (let y = 0; y <= 2; y += 1) {
        map.erase(6, y, 0);
        map.erase(6, y, -1);
        map.erase(6, y, 1);
      }
      map.fill(-2, -1, 21, 1, -1, 24, "iron");
      map.fill(-2, 0, 24, 1, 2, 24, "iron");
      map.fill(-14, 3, 20, -6, 8, 21, "iron");
      dressPerimeter(map, { x0: -8, z0: -5, x1: 10, z1: 24 }, { wall: "iron", lamps: true, open: "ns" });
      stampStationMass(map, 13, -6);
      stampBuilding(map, 8, 18, 4, 4, 5, "brick", "w");
      stampBuilding(map, -18, 8, 5, 5, 6, "stone", "e");
      dressInterior(map, { x0: 6, z0: -3, x1: 12, z1: 3, y0: -1, h: 3 });
      stampRailing(map, -4, 8, -4, 23);
      stampRailing(map, 3, 8, 3, 23);
      for (let z = 0; z <= 24; z += 4) stampPiling(map, -11, z);
      stampLampPost(map, 4, 10);
      stampLampPost(map, 4, 16);
      stampLampPost(map, -1, 10);
      stampLampPost(map, 0, 16);
      stampLampPost(map, -1, 21);
      map.commit(ctx.root);
      floorBox(ctx.world, -8, -5, 10, 7, 0);
      floorBox(ctx.world, -3, 7, 2, 25, 0);
      floorBox(ctx.world, 6, -3, 12, 3, 0);
      wallBox(ctx.world, -4, 0, 7, -4, 1, 24);
      wallBox(ctx.world, 3, 0, 7, 3, 1, 24);
      wallBox(ctx.world, -2, 0, 24, 1, 2, 24);
      doorMesh = addSolidBox(ctx.root, ctx.world, 0.18, 2.3, 1.5, 0x3a2e22, L.indoorDoor.x, 1.15, 0);
      const warm = playPoint(0xffd08a, 1.8, 8, 1.1);
      warm.position.set(7.4, 1.9, 0);
      const alcoveFill = playPoint(0x9ec0d2, 1.1, 7, 1.15);
      alcoveFill.position.set(8.2, 2.2, 1.4);
      ctx.root.add(warm, alcoveFill);
      addSolidBox(ctx.root, ctx.world, 0.06, 1.1, 1.6, 0x2a2620, 11.4, 1.55, 0).name = "wall-map";
      const wallPlan = makeWallPlan();
      wallPlan.position.set(11.35, 1.55, 0);
      wallPlan.rotation.y = -Math.PI / 2;
      ctx.root.add(wallPlan);

      gate = addGate3(ctx.root, L.gate.x, L.gate.y, L.gate.z);
      sos = addSosBeacon(ctx.root, L.sos.x, L.sos.y, L.sos.z);
      addXiaocenFigure(ctx.root, L.xiaocen.x, L.xiaocen.y, L.xiaocen.z);
      water = addWaterChannel(ctx.root, -11, -3.2, 14);
      water.setDir(-1);

      ctx.world.addTrigger("indoor", new THREE.Vector3(6.5, 0, -1.6), new THREE.Vector3(9.1, 2.4, 1.6));
      ctx.world.addTrigger(
        "lift",
        new THREE.Vector3(L.lift.x - 1.4, 0, L.lift.z - 1.5),
        new THREE.Vector3(L.lift.x + 1.4, 2.4, L.lift.z + 1.6),
      );
      ctx.world.addHazard("channel", "water", new THREE.Vector3(-36, -9, -8), new THREE.Vector3(16, -0.55, 48));
      ctx.world.killY = -2.2;
      ctx.world.addAnchor("spawn", 0, 0, 0);
      ctx.world.addAnchor("pipe", L.spineX, 0.2, L.pipeZ);
      ctx.world.addAnchor("glass", L.spineX, 0, L.glassZ);
      ctx.world.addAnchor("lift", L.lift.x, 0, L.lift.z);

      const faceGate = Math.atan2(-(L.gate.x - L.spawn.x), -(L.gate.z - L.spawn.z));
      ctx.player.reset(L.spawn.x, L.spawn.y, L.spawn.z, faceGate);
      ctx.camera.yaw = faceGate;
      ctx.camera.pitch = -0.22;
      ctx.camera.dist = 9.2;
      ctx.hud.setTask(TASK["P-S00"] ?? "");
      ctx.guide.set("path", new THREE.Vector3(L.lift.x, 0, L.lift.z), [
        { x0: -8, z0: -5, x1: 10, z1: 7 },
        { x0: -3, z0: 7, x1: 2, z1: 25 },
        { x0: 6, z0: -3, x1: 12, z1: 3 },
      ]);

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
      const gateLamp = playPoint(0xff7a28, 6.4, 36, 1.15);
      gateLamp.position.set(L.gate.x, L.gate.y + 2, L.gate.z);
      const liftLamp = playPoint(0xffd08a, 2.8, 16, 1.1);
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
      if (gate && !ctx.reducedMotion) gate.spin(dt * 0.04);
    },
    unmount() {
      rain = null;
      sos = null;
      water = null;
      doorMesh = null;
      gate = null;
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
