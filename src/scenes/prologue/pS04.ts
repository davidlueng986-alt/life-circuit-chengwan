import * as THREE from "three";
import { TASK } from "../../content/copy";
import { P_LINE } from "../../content/prologue/ids";
import { P04_LAYOUT as L } from "../../content/prologue/layout";
import { boxMesh, playPoint } from "../../engine/greybox";
import { heroRelay } from "../../engine/props";
import { BlockStamp, floorBox, wallBox } from "../../engine/blocks";
import { dressInterior, stampCatwalk, stampCrateStack, stampStripe } from "../../engine/dress";
import type { GameScene, SceneContext } from "../types";
import {
  SceneVoice,
  addControlLamp,
  addGate3,
  addSosBeacon,
  addWaterChannel,
  addXiaocenFigure,
  lightLamp,
  onceFlags,
  stormShell,
  tickSceneRain,
} from "./kit";

export function createActuatorGallery(): GameScene {
  const flags = onceFlags();
  const voice = new SceneVoice();
  const done = { wrong: false, jam: false, loose: false };
  let rain: THREE.Points | null = null;
  let water: ReturnType<typeof addWaterChannel> | null = null;
  let sos: ReturnType<typeof addSosBeacon> | null = null;
  let gate: ReturnType<typeof addGate3> | null = null;
  let deck: THREE.Group | null = null;
  let lamps: THREE.Mesh[] = [];
  let elapsed = 0;
  let closing = false;
  let closeT = 0;

  return {
    id: "P-S04",
    mount(ctx) {
      const lights = stormShell(ctx, false);
      rain = lights.rain;
      const key = playPoint(0xffd8a0, 4.2, 18, 0.95);
      key.position.set(0, 2.6, 1.2);
      const wash = playPoint(0x8aa8b8, 2.8, 16, 1);
      wash.position.set(-2.2, 2.8, -3.4);
      ctx.root.add(key, wash);

      const map = new BlockStamp();
      map.room(-7, -6, 7, 6, -1, 3, "iron", "stone");
      for (let x = -2; x <= 2; x += 1) {
        for (let y = 1; y <= 3; y += 1) map.erase(x, y, -6);
      }
      map.fill(-2, 1, -6, 2, 3, -6, "glass");
      map.fill(-2, 0, -6, 2, 0, -6, "iron");
      map.fill(-2, 3, -6, 2, 3, -6, "iron");
      dressInterior(map, { x0: -7, z0: -6, x1: 7, z1: 6, y0: -1, h: 3 });
      stampCatwalk(map, -4, -4, -3);
      stampCrateStack(map, 5, 4, 2);
      stampStripe(map, -1, -4, -1, 3);
      stampStripe(map, 0, -4, 0, 3);
      stampStripe(map, 1, -4, 1, 3);
      map.commit(ctx.root);
      floorBox(ctx.world, -7, -6, 7, 6, 0);
      wallBox(ctx.world, -7, 0, -6, 7, 3, -6);
      wallBox(ctx.world, -7, 0, 6, 7, 3, 6);
      wallBox(ctx.world, -7, 0, -6, -7, 3, 6);
      wallBox(ctx.world, 7, 0, -6, 7, 3, 6);
      ctx.camera.dist = 6.2;
      ctx.camera.pitch = -0.18;
      ctx.world.addLadder(
        "cat",
        new THREE.Vector3(-4.1, 0, -3.7),
        new THREE.Vector3(-3.4, 1.7, -3.05),
      );

      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(4.8, 1.4, 0.06),
        new THREE.MeshLambertMaterial({ color: 0x6f8a99, transparent: true, opacity: 0.22 }),
      );
      glass.position.set(0, 2.15, -6.08);
      ctx.root.add(glass);

      gate = addGate3(ctx.root, L.gate.x, L.gate.y, L.gate.z);
      water = addWaterChannel(ctx.root, 0, -3.4, -16);
      water.setDir(-1);
      sos = addSosBeacon(ctx.root, L.deck.x, L.deck.y + 0.8, L.deck.z);
      deck = addXiaocenFigure(ctx.root, L.deck.x, L.deck.y, L.deck.z);
      deck.scale.setScalar(1.05);

      const bus = boxMesh(8.4, 0.12, 0.18, 0xc9a36a, 0, 2.35, -5.7);
      const busMat = bus.material;
      if (busMat instanceof THREE.MeshLambertMaterial) {
        busMat.emissive = new THREE.Color(0xc9861a);
        busMat.emissiveIntensity = 0.7;
      }
      ctx.root.add(bus);

      lamps = [
        addControlLamp(ctx.root, -1.1, 2.05, -5.92, "circle"),
        addControlLamp(ctx.root, 0, 2.05, -5.92, "bar"),
        addControlLamp(ctx.root, 1.1, 2.05, -5.92, "tri"),
      ];

      const debris = boxMesh(1.15, 0.72, 0.85, 0x6a5340, L.debris.x, L.debris.y, L.debris.z);
      const relayWrong = heroRelay(0x8a6a3a);
      relayWrong.position.set(L.wrongHome.x, L.wrongHome.y, L.wrongHome.z);
      const relayJam = heroRelay(0x6a5340);
      relayJam.position.set(L.jam.x, L.jam.y, L.jam.z);
      const relayLoose = heroRelay(0x8aa0b8);
      relayLoose.position.set(L.loose.x, L.loose.y, L.loose.z);
      ctx.root.add(debris, relayWrong, relayJam, relayLoose);

      ctx.signals.add({
        id: "bus",
        kind: "power_live",
        a: new THREE.Vector3(-4.2, 2.3, -5.55),
        b: new THREE.Vector3(4.2, 2.3, -5.55),
      });
      ctx.signals.add({
        id: "stop-jam",
        kind: "device_link",
        a: new THREE.Vector3(-2.2, 2.1, -5.5),
        b: new THREE.Vector3(L.jam.x, L.jam.y, L.jam.z),
      });
      ctx.signals.add({
        id: "dummy-loop",
        kind: "leftover_residue",
        a: new THREE.Vector3(3.4, 1.4, -5.4),
        b: new THREE.Vector3(3.5, 0.7, -4.2),
      });
      ctx.signals.add({
        id: "act-wrong",
        kind: "power_live",
        a: new THREE.Vector3(2.15, 1.6, -5.4),
        b: new THREE.Vector3(2.15, 0.8, -4.55),
        enabled: false,
      });
      ctx.signals.add({
        id: "stop-loose",
        kind: "device_link",
        a: new THREE.Vector3(0, 2.2, -5.4),
        b: new THREE.Vector3(L.loose.x, L.loose.y, L.loose.z),
      });

      ctx.tether.grantPickup();
      if (!ctx.flowLens.owned) ctx.flowLens.grantPickup();
      ctx.tether.registerBody({ id: "debris", object: debris, mass: "medium", shape: "crate", recoverOnDrop: false });
      ctx.tether.registerBody({ id: "wrong", object: relayWrong, mass: "light", shape: "relay", cuttable: true });
      ctx.tether.registerBody({ id: "jam", object: relayJam, mass: "medium", shape: "relay" });
      ctx.tether.registerBody({ id: "loose", object: relayLoose, mass: "light", shape: "relay" });

      const dummy = ctx.tether.registerSocket({
        id: "dummy",
        shape: "relay",
        position: new THREE.Vector3(L.wrongHome.x, L.wrongHome.y, L.wrongHome.z),
        parent: ctx.root,
        onUnseat: () => refresh(ctx),
      });
      ctx.tether.registerSocket({
        id: "act-wrong",
        shape: "relay",
        position: new THREE.Vector3(L.actWrong.x, L.actWrong.y, L.actWrong.z),
        parent: ctx.root,
        onSeat: () => refresh(ctx),
        onUnseat: () => refresh(ctx),
      });
      ctx.tether.registerSocket({
        id: "act-jam",
        shape: "relay",
        position: new THREE.Vector3(L.actJam.x, L.actJam.y, L.actJam.z),
        parent: ctx.root,
        onSeat: () => refresh(ctx),
        onUnseat: () => refresh(ctx),
      });
      ctx.tether.registerSocket({
        id: "act-loose",
        shape: "relay",
        position: new THREE.Vector3(L.actLoose.x, L.actLoose.y, L.actLoose.z),
        parent: ctx.root,
        onSeat: () => refresh(ctx),
        onUnseat: () => refresh(ctx),
      });

      const wrongBody = ctx.tether.body("wrong");
      if (wrongBody) {
        wrongBody.seated = true;
        wrongBody.seatedIn = "dummy";
        dummy.occupiedBy = "wrong";
      }

      ctx.player.reset(L.spawn.x, L.spawn.y, L.spawn.z, L.spawn.yaw);
      ctx.camera.yaw = L.spawn.yaw;
      ctx.tether.grantPickup();
      ctx.save.player.tool.tether = true;
      ctx.persist();
      ctx.hud.setTask(TASK["P-S04"] ?? "");
      ctx.guide.set("path", new THREE.Vector3(L.debris.x, 0, L.debris.z), [{ x0: -7, z0: -6, x1: 7, z1: 6 }]);
      ctx.say(P_LINE.findBreak);
      voice.startRumble();
      ctx.hud.announce("雜物離座太遠時，按住 F 拉過來。");

      const grab = (id: string, x: number, z: number, label: string) => {
        ctx.interact.add({
          id,
          prompt: label,
          position: new THREE.Vector3(x, 0, z),
          radius: 1.5,
          enabled: true,
          onUse: () => {
            ctx.tether.grabById(id === "grab-debris" ? "debris" : id.replace("grab-", ""));
          },
        });
      };
      grab("grab-debris", L.debris.x, L.debris.z, "按住 F 清雜物");
      grab("grab-wrong", L.wrongHome.x, L.wrongHome.z, "按住 F 搬走接錯的");
      grab("grab-jam", L.jam.x, L.jam.z, "按住 F 接回卡住的");
      grab("grab-loose", L.loose.x, L.loose.z, "按住 F 壓回鬆脫的");
    },
    update(dt, ctx) {
      elapsed += dt;
      tickSceneRain(rain, dt);
      water?.tick(dt);
      sos?.tick(elapsed);
      refresh(ctx);
      if (ctx.flowLens.justPulsed && flags.take("scan")) ctx.say(P_LINE.oneHear);
      if (
        ctx.flowLens.lastHits.some((hit) => hit.id === "stop-jam") &&
        flags.take("jam-line")
      ) {
        ctx.say(P_LINE.jamStop);
      }

      if (closing) {
        closeT += dt;
        const t = Math.min(1, closeT / 2.4);
        gate?.setRise(t);
        water?.setDir(1);
        if (deck) deck.position.y = L.deck.y - t * 1.4;
        if (t >= 1) ctx.completeAndGo();
      }
    },
    unmount() {
      rain = null;
      water = null;
      sos = null;
      gate = null;
      deck = null;
      lamps = [];
      voice.dispose();
    },
  };

  function refresh(ctx: SceneContext): void {
    const debris = ctx.tether.body("debris");
    const debrisClear =
      !debris ||
      debris.object.position.distanceTo(new THREE.Vector3(L.actJam.x, L.actJam.y, L.actJam.z)) > 1.45;
    const next = {
      wrong: !!ctx.tether.seatedIn("act-wrong"),
      jam: debrisClear && !!ctx.tether.seatedIn("act-jam"),
      loose: !!ctx.tether.seatedIn("act-loose"),
    };
    const before = (done.wrong ? 1 : 0) + (done.jam ? 1 : 0) + (done.loose ? 1 : 0);
    done.wrong = next.wrong;
    done.jam = next.jam;
    done.loose = next.loose;
    const after = (done.wrong ? 1 : 0) + (done.jam ? 1 : 0) + (done.loose ? 1 : 0);
    lightLamp(lamps[0]!, done.wrong);
    lightLamp(lamps[1]!, done.jam);
    lightLamp(lamps[2]!, done.loose);
    ctx.signals.setEnabled("dummy-loop", !done.wrong);
    ctx.signals.setEnabled("act-wrong", done.wrong);
    ctx.signals.setEnabled("stop-jam", !done.jam);
    ctx.signals.setEnabled("stop-loose", !done.loose);
    if (after > before) {
      voice.setLayers(after);
      voice.clunk(after);
    }
    if (done.wrong && done.jam && done.loose && flags.take("all")) {
      ctx.say(P_LINE.gateMoves);
      closing = true;
    }
  }
}
