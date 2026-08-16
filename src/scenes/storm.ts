import * as THREE from "three";
import { TASK } from "../content/copy";
import {
  STORM,
  addSolidBox,
  applyFog,
  lamp,
  makeRain,
  tickRain,
  waterSheet,
} from "../engine/greybox";
import type { GameScene } from "./types";

export function createStormScene(): GameScene {
  let rain: THREE.Points | null = null;
  let sos: THREE.PointLight | null = null;
  let blink = 0;
  let idle = 0;
  let wrong = 0;
  let saidIdle = false;
  let saidWrong = false;
  let saidIndoor = false;

  return {
    id: "P-S00",
    mount(ctx) {
      applyFog(ctx.three, STORM, ctx.reducedMotion);
      const hemi = new THREE.HemisphereLight(0x5a7388, 0x080c10, 0.62);
      ctx.root.add(hemi);
      const dir = new THREE.DirectionalLight(0x8aa4b8, 0.42);
      dir.position.set(-10, 22, 8);
      dir.castShadow = true;
      dir.shadow.mapSize.set(1024, 1024);
      dir.shadow.camera.near = 2;
      dir.shadow.camera.far = 70;
      dir.shadow.camera.left = -22;
      dir.shadow.camera.right = 22;
      dir.shadow.camera.top = 22;
      dir.shadow.camera.bottom = -22;
      ctx.root.add(dir);

      addSolidBox(ctx.root, ctx.world, 16, 0.4, 12, STORM.floor, 0, -0.2, 0);
      addSolidBox(ctx.root, ctx.world, 4, 0.4, 30, STORM.floor, 1.4, -0.2, 16);
      addSolidBox(ctx.root, ctx.world, 3.2, 0.2, 0.7, 0x4a535c, 1.4, 0.1, 9);
      addSolidBox(ctx.root, ctx.world, 0.18, 1.1, 30, STORM.wall, -0.4, 0.55, 16);
      addSolidBox(ctx.root, ctx.world, 0.18, 1.1, 30, STORM.wall, 3.2, 0.55, 16);

      for (let i = 0; i < 8; i += 1) {
        const z = 3 + i * 3.4;
        ctx.root.add(lamp(STORM.accent, 0.2, 1.6, z));
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.06, 0.07, 1.4, 6),
          new THREE.MeshLambertMaterial({ color: 0x3a2a12, emissive: STORM.accent, emissiveIntensity: 0.28 }),
        );
        post.position.set(0.2, 0.7, z);
        ctx.root.add(post);
      }

      addSolidBox(ctx.root, ctx.world, 6, 3.2, 0.3, STORM.wall, -6.2, 1.4, 0);
      addSolidBox(ctx.root, ctx.world, 0.4, 2.4, 1.6, 0x2c2418, -3.4, 1.2, 0);
      ctx.world.addTrigger(
        "indoor",
        new THREE.Vector3(-7.2, 0, -1.4),
        new THREE.Vector3(-3.6, 2.4, 1.4),
      );

      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 1.4, 2.4),
        new THREE.MeshLambertMaterial({ color: 0x6f8a99, transparent: true, opacity: 0.28 }),
      );
      glass.position.set(3.15, 1.2, 16);
      ctx.root.add(glass);

      const gate = new THREE.Mesh(
        new THREE.BoxGeometry(14, 8, 1.2),
        new THREE.MeshLambertMaterial({ color: 0x4a5560 }),
      );
      gate.position.set(7, 12, 48);
      ctx.root.add(gate);
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(16, 0.6, 0.4),
        new THREE.MeshLambertMaterial({ color: 0x6a7380 }),
      );
      blade.position.set(7, 10.4, 47.2);
      ctx.root.add(blade);
      const gateKey = new THREE.PointLight(0x7a93a6, 1.8, 36, 2);
      gateKey.position.set(7, 14, 44);
      ctx.root.add(gateKey);

      sos = new THREE.PointLight(STORM.emissive, 4, 22, 2);
      sos.position.set(6.2, -3.4, 42);
      ctx.root.add(sos);
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 10, 10),
        new THREE.MeshBasicMaterial({ color: STORM.emissive }),
      );
      bulb.position.copy(sos.position);
      ctx.root.add(bulb);

      addSolidBox(ctx.root, ctx.world, 3.4, 0.4, 3.4, STORM.floor, 1.4, -0.2, 32);
      addSolidBox(ctx.root, ctx.world, 1.6, 2.6, 1.6, 0x2a3038, 1.4, 1.1, 33.2);
      ctx.world.addTrigger(
        "lift",
        new THREE.Vector3(0.1, 0, 30.4),
        new THREE.Vector3(2.8, 2.4, 34.2),
      );

      ctx.root.add(waterSheet(80, 90, 4, -3.2, 18));
      ctx.world.killY = -2.2;
      ctx.world.addHazard(
        "channel",
        "water",
        new THREE.Vector3(-30, -8, -20),
        new THREE.Vector3(40, -0.55, 70),
      );
      ctx.world.addAnchor("spawn", 0, 0, 0);
      ctx.world.addAnchor("pipe", 1.4, 0.2, 9);
      ctx.world.addAnchor("mid", 1.4, 0, 18);
      ctx.world.addAnchor("lift", 1.4, 0, 31.2);

      rain = makeRain(ctx.reducedMotion);
      if (rain) ctx.root.add(rain);

      ctx.player.reset(0, 0, 0, 0.22);
      ctx.camera.yaw = 0.22;
      ctx.camera.pitch = -0.2;
      ctx.hud.setTask(TASK["P-S00"] ?? "");
      ctx.say("P-S00-D001");
    },
    update(dt, ctx) {
      if (rain) tickRain(rain, dt);
      blink += dt;
      if (sos) sos.intensity = blink % 3 < 0.35 ? 6.2 : 0.18;

      const moving = ctx.input.axis().x !== 0 || ctx.input.axis().z !== 0;
      if (!moving && ctx.player.position.length() < 2.2) idle += dt;
      else idle = 0;
      if (idle > 12 && !saidIdle) {
        ctx.say("P-S00-D003");
        saidIdle = true;
      }

      const look = ctx.camera.lookDir();
      const toGate = new THREE.Vector3(7, 0, 48).sub(ctx.player.position).setY(0).normalize();
      if (look.dot(toGate) < 0.15) wrong += dt;
      else wrong = 0;
      if (wrong > 3 && !saidWrong) {
        ctx.say("P-S00-D002");
        saidWrong = true;
      }

      const hits = ctx.world.sampleTriggers(ctx.player.position);
      if (hits.includes("indoor") && !saidIndoor) {
        ctx.say("P-S00-R001");
        saidIndoor = true;
      }
      if (hits.includes("lift")) ctx.completeAndGo();
    },
    unmount() {
      rain = null;
      sos = null;
    },
  };
}
