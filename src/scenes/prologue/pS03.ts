import * as THREE from "three";
import { PROMPT, TASK } from "../../content/copy";
import { P_LINE } from "../../content/prologue/ids";
import { P03_LAYOUT as L } from "../../content/prologue/layout";
import { lookFlat } from "../../engine/motorMath";
import { heroPlate, heroSeat } from "../../engine/props";
import { BlockStamp, floorBox } from "../../engine/blocks";
import type { GameScene, SceneContext } from "../types";
import { SceneVoice, addAmberSpine, addGate3, addSosBeacon, addWaterChannel, onceFlags, stormShell, tickSceneRain } from "./kit";

type PlateId = "plate-a" | "plate-b";
type SeatId = "seat-a" | "seat-b";

export function createCutSpan(): GameScene {
  const flags = onceFlags();
  const voice = new SceneVoice();
  let rain: THREE.Points | null = null;
  let water: ReturnType<typeof addWaterChannel> | null = null;
  let sos: ReturnType<typeof addSosBeacon> | null = null;
  let plateA: THREE.Group | null = null;
  let plateB: THREE.Group | null = null;
  let carried: PlateId | null = null;
  let ready = false;
  let liftT = 0;
  let elapsed = 0;
  let falls = 0;
  let idle = 0;
  const seated: Record<SeatId, boolean> = { "seat-a": false, "seat-b": false };
  const home = {
    "plate-a": new THREE.Vector3(L.plateA.x, L.plateA.y, L.plateA.z),
    "plate-b": new THREE.Vector3(L.plateB.x, L.plateB.y, L.plateB.z),
  };
  const match: Record<PlateId, SeatId> = { "plate-a": "seat-a", "plate-b": "seat-b" };
  const seats = {
    "seat-a": new THREE.Vector3(L.seatA.x, L.seatA.y, L.seatA.z),
    "seat-b": new THREE.Vector3(L.seatB.x, L.seatB.y, L.seatB.z),
  };

  return {
    id: "P-S03",
    mount(ctx) {
      const lights = stormShell(ctx, true);
      rain = lights.rain;
      voice.startRumble();

      const map = new BlockStamp();
      map.fill(-5, -1, 1, 5, -1, 6, "stone");
      map.fill(-5, -1, -6, 5, -1, -1, "stone");
      map.fill(-6, -4, -1, 6, -2, 1, "water");
      map.fill(-6, 0, 1, -6, 1, 6, "iron");
      map.fill(6, 0, 1, 6, 1, 6, "iron");
      map.commit(ctx.root);
      floorBox(ctx.world, -5, 1, 5, 6, 0);
      floorBox(ctx.world, -5, -6, 5, -1, 0);
      addAmberSpine(ctx, -3, 2, 6);
      addGate3(ctx.root, -8, 6.2, -14);

      plateA = heroPlate("chevron");
      plateA.position.copy(home["plate-a"]);
      plateB = heroPlate("notch");
      plateB.position.copy(home["plate-b"]);
      ctx.root.add(plateA, plateB);

      const seatA = heroSeat("chevron");
      seatA.position.copy(seats["seat-a"]);
      const seatB = heroSeat("notch");
      seatB.position.copy(seats["seat-b"]);
      ctx.root.add(seatA, seatB);
      ctx.camera.dist = 6.4;
      ctx.camera.pitch = -0.28;

      water = addWaterChannel(ctx.root, 0, -3.1, 0);
      sos = addSosBeacon(ctx.root, -6.4, -1.8, -8);
      ctx.world.addTrigger("gap", new THREE.Vector3(-2.3, -1.5, -0.5), new THREE.Vector3(2.3, -0.18, 0.5));
      ctx.world.addHazard("span-void", "void", new THREE.Vector3(-2.4, -4, -0.5), new THREE.Vector3(2.4, -0.4, 0.5));
      ctx.world.addAnchor("near", 0, 0, 3.6);
      ctx.world.addAnchor("far", 0, 0, -3.4);
      ctx.world.killY = -2.2;

      const facePlates = Math.atan2(-(L.plateA.x - L.spawn.x), -(L.plateA.z - L.spawn.z));
      ctx.player.reset(L.spawn.x, L.spawn.y, L.spawn.z, facePlates);
      ctx.camera.yaw = facePlates;
      ctx.hud.setTask(TASK["P-S03-pick"] ?? "");
      ctx.say(P_LINE.pickTether);

      ctx.interact.add({
        id: "plate-a",
        prompt: PROMPT.pickLightPlate,
        position: home["plate-a"].clone().setY(0),
        radius: 1.9,
        enabled: true,
        onUse: () => usePlate(ctx, "plate-a"),
      });
      ctx.interact.add({
        id: "plate-b",
        prompt: PROMPT.pickHeavyPlate,
        position: home["plate-b"].clone().setY(0),
        radius: 1.9,
        enabled: true,
        onUse: () => usePlate(ctx, "plate-b"),
      });
      ctx.interact.add({
        id: "seat-a",
        prompt: PROMPT.placeChevron,
        position: seats["seat-a"].clone().setY(0),
        radius: 1.7,
        enabled: true,
        onUse: () => useSeat(ctx, "seat-a"),
      });
      ctx.interact.add({
        id: "seat-b",
        prompt: PROMPT.placeNotch,
        position: seats["seat-b"].clone().setY(0),
        radius: 1.7,
        enabled: true,
        onUse: () => useSeat(ctx, "seat-b"),
      });
      ctx.interact.add({
        id: "drop-carry",
        prompt: PROMPT.dropPlate,
        position: new THREE.Vector3(L.spawn.x, 0, L.spawn.z),
        radius: 0.55,
        enabled: false,
        onUse: () => dropHere(ctx),
      });
    },
    update(dt, ctx) {
      elapsed += dt;
      tickSceneRain(rain, dt);
      water?.tick(dt);
      sos?.tick(elapsed);
      followCarry(ctx, dt);

      if (!carried && !seated["seat-a"] && !seated["seat-b"]) {
        idle += dt;
        if (idle > 8 && flags.take("nudge")) ctx.hud.announce("走近腳邊的板，按 E 撿起來。");
      } else idle = 0;

      const hits = ctx.world.sampleTriggers(ctx.player.position);
      if (hits.includes("gap")) {
        falls += 1;
        if (carried) sendHome(carried);
        ctx.player.pullTo(new THREE.Vector3(0, 0, 3.7), "void");
        if (falls >= 2 && !ready) ctx.hud.announce("兩塊都放好才過得去。");
      }

      syncPrompts(ctx);

      if (seated["seat-a"] && seated["seat-b"] && !ready) {
        ready = true;
        ctx.world.triggers = ctx.world.triggers.filter((item) => item.id !== "gap");
        ctx.hud.setTask("走過短橋");
        ctx.interact.add({
          id: "cross-span",
          prompt: "走過短橋",
          position: new THREE.Vector3(0, 0, -2.2),
          radius: 1.8,
          enabled: true,
          onUse: () => finish(ctx),
        });
      }

      if (ready && ctx.player.position.z < L.farLip.z + 0.45) {
        liftT += dt;
        if (plateA) {
          plateA.rotation.x = Math.min(0.55, liftT * 0.4);
          plateA.position.y = L.seatA.y + Math.min(0.22, liftT * 0.16);
        }
        if (liftT > 1.1) finish(ctx);
      }
    },
    unmount() {
      rain = null;
      water = null;
      sos = null;
      plateA = null;
      plateB = null;
      carried = null;
      voice.dispose();
    },
  };

  function plateOf(id: PlateId): THREE.Group | null {
    return id === "plate-a" ? plateA : plateB;
  }

  function usePlate(ctx: SceneContext, id: PlateId): void {
    if (seated[match[id]]) return;
    if (carried === id) {
      dropHere(ctx);
      return;
    }
    if (carried) dropHere(ctx);
    carried = id;
    ctx.player.playAction("pick");
    ctx.hud.setTask(id === "plate-a" ? TASK["P-S03-place-light"] ?? "" : TASK["P-S03-place-heavy"] ?? "");
    if (flags.take("first-pick")) ctx.say(P_LINE.rotateSlow);
  }

  function useSeat(ctx: SceneContext, seat: SeatId): void {
    if (seated[seat]) return;
    if (!carried) {
      ctx.hud.announce("先撿一塊板。");
      return;
    }
    if (match[carried] !== seat) {
      ctx.hud.announce(seat === "seat-a" ? "這是三角座，換輕板。" : "這是缺角座，換重板。");
      return;
    }
    placeOn(ctx, carried, seat);
  }

  function placeOn(ctx: SceneContext, id: PlateId, seat: SeatId): void {
    const plate = plateOf(id);
    if (!plate) return;
    plate.position.copy(seats[seat]);
    plate.rotation.set(0, 0, 0);
    seated[seat] = true;
    carried = null;
    ctx.player.playAction("push");
    ctx.world.addBox(
      new THREE.Vector3(seats[seat].x - 0.68, 0, seats[seat].z - 0.68),
      new THREE.Vector3(seats[seat].x + 0.68, 0.28, seats[seat].z + 0.68),
    );
    const plateItem = ctx.interact.items.find((item) => item.id === id);
    if (plateItem) plateItem.enabled = false;
    const seatItem = ctx.interact.items.find((item) => item.id === seat);
    if (seatItem) seatItem.enabled = false;
    ctx.hud.setTask(seated["seat-a"] && seated["seat-b"] ? "走過短橋" : TASK["P-S03-pick"] ?? "");
  }

  function dropHere(ctx: SceneContext): void {
    if (!carried) return;
    const plate = plateOf(carried);
    if (!plate) return;
    const look = lookFlat(ctx.camera.yaw);
    plate.position.set(ctx.player.position.x + look.x * 0.95, home[carried].y, ctx.player.position.z + look.z * 0.95);
    if (plate.position.y < -0.4 || Math.abs(plate.position.z) < 0.55) sendHome(carried);
    carried = null;
  }

  function sendHome(id: PlateId): void {
    const plate = plateOf(id);
    if (plate) {
      plate.position.copy(home[id]);
      plate.rotation.set(0, 0, 0);
    }
    if (carried === id) carried = null;
  }

  function followCarry(ctx: SceneContext, dt: number): void {
    ctx.player.walkSpeed = carried === "plate-b" ? 3.1 : 4.317;
    if (!carried) return;
    const plate = plateOf(carried);
    if (!plate) return;
    const look = lookFlat(ctx.camera.yaw);
    const target = new THREE.Vector3(
      ctx.player.position.x + look.x * 0.85,
      1.05,
      ctx.player.position.z + look.z * 0.85,
    );
    if (carried === "plate-b") {
      target.x += Math.sin(elapsed * 2.1) * 0.08;
      ctx.player.velocity.x += Math.sin(elapsed * 1.6) * 1.4 * dt;
    }
    plate.position.lerp(target, Math.min(1, dt * 10));
    plate.rotation.y = ctx.camera.yaw;
    if (plate.position.y < -1) sendHome(carried);
    const item = ctx.interact.items.find((entry) => entry.id === carried);
    if (item) item.position.copy(plate.position).setY(0);
  }

  function syncPrompts(ctx: SceneContext): void {
    const a = ctx.interact.items.find((item) => item.id === "plate-a");
    const b = ctx.interact.items.find((item) => item.id === "plate-b");
    if (a) {
      a.prompt = PROMPT.pickLightPlate;
      a.enabled = !seated["seat-a"] && carried !== "plate-a";
    }
    if (b) {
      b.prompt = PROMPT.pickHeavyPlate;
      b.enabled = !seated["seat-b"] && carried !== "plate-b";
    }
    const sa = ctx.interact.items.find((item) => item.id === "seat-a");
    const sb = ctx.interact.items.find((item) => item.id === "seat-b");
    if (sa) sa.enabled = !seated["seat-a"];
    if (sb) sb.enabled = !seated["seat-b"];
    const drop = ctx.interact.items.find((item) => item.id === "drop-carry");
    if (drop) {
      drop.position.copy(ctx.player.position).setY(0);
      const nearSeat =
        (carried === "plate-a" && ctx.player.position.distanceTo(seats["seat-a"]) < 1.8) ||
        (carried === "plate-b" && ctx.player.position.distanceTo(seats["seat-b"]) < 1.8);
      drop.enabled = !!carried && !nearSeat;
    }
  }

  function finish(ctx: SceneContext): void {
    ctx.save.player.tool.tether = true;
    ctx.persist();
    ctx.completeAndGo();
  }
}
