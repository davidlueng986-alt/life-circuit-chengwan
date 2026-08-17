import * as THREE from "three";
import { C1_PROMPT } from "../../../content/chapter1/copy";
import { C1_LAYOUT } from "../../../content/chapter1/layout";
import { TASK } from "../../content/copy";
import { addSolidBox } from "../../engine/greybox";
import { createNpc } from "../../engine/npc";
import type { GameScene, SceneContext } from "../types";
import { addReporterStand, lightHarbor, mountEastShore, near, xyz } from "./kit";

export function createC1S05(): GameScene {
  let placed = false;
  let walk = 0;
  let shadeSaid = false;
  let guessSaid = false;
  let deskSaid = false;
  let pass = false;
  let cartMoved = false;
  let chen: THREE.Object3D | null = null;
  let stand: THREE.Group | null = null;
  let board: THREE.Mesh | null = null;
  const path = [
    xyz(C1_LAYOUT.demoStand),
    new THREE.Vector3(-11.4, 0, 12.2),
    xyz(C1_LAYOUT.shade),
    xyz(C1_LAYOUT.cart),
    new THREE.Vector3(-10.2, 0, 16.2),
  ];

  return {
    id: "C1-S05",
    mount(ctx) {
      lightHarbor(ctx, "fog");
      mountEastShore(ctx, {});
      ctx.world.addAnchor("market", C1_LAYOUT.spawnS05[0], 0, C1_LAYOUT.spawnS05[2]);
      addSolidBox(ctx.root, ctx.world, 2.6, 0.7, 1.2, 0x4a4034, C1_LAYOUT.desk[0], C1_LAYOUT.desk[1], C1_LAYOUT.desk[2]);
      board = addSolidBox(ctx.root, ctx.world, 1.2, 1.1, 0.08, 0x2a3640, -7.2, 1.2, 16.8);
      board.visible = false;
      addSolidBox(ctx.root, ctx.world, 0.9, 1.1, 0.4, 0x3a322c, C1_LAYOUT.demoStand[0], 0.55, C1_LAYOUT.demoStand[2]);
      const cart = addSolidBox(
        ctx.root,
        ctx.world,
        1.6,
        1.05,
        1.2,
        0x6a5340,
        C1_LAYOUT.cart[0],
        0.55,
        C1_LAYOUT.cart[2],
      );
      cart.name = "guess-cart";
      const bystander = createNpc("generic");
      bystander.position.set(C1_LAYOUT.cart[0] + 1.6, 0, C1_LAYOUT.cart[2] + 0.4);
      ctx.root.add(bystander);

      chen = createNpc("chen");
      chen.position.set(C1_LAYOUT.spawnS05[0] - 1.2, 0, C1_LAYOUT.spawnS05[2]);
      ctx.root.add(chen);
      const shadeVol = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.04, 2.4),
        new THREE.MeshBasicMaterial({ color: 0x050608, transparent: true, opacity: 0.45 }),
      );
      shadeVol.position.copy(xyz(C1_LAYOUT.shade)).setY(0.03);
      ctx.root.add(shadeVol);

      ctx.bioRig.grantPickup(ctx.save.c1.loadout);
      ctx.bioRig.accessibility = ctx.save.c1.accessibilityOutput ?? "color_only";
      ctx.bioRig.placeAt(xyz(C1_LAYOUT.desk).setY(1.1));

      ctx.player.reset(C1_LAYOUT.spawnS05[0], 0, C1_LAYOUT.spawnS05[2], Math.PI);
      ctx.camera.yaw = Math.PI;
      ctx.hud.setTask(TASK["C1-S05-walk"] ?? "");

      ctx.workbench.bind({
        onChenChange: (draft) => {
          ctx.save.c1.accessibilityOutput = draft.output;
          ctx.bioRig.accessibility = draft.output;
          ctx.bioRig.swapReporter(draft.output === "shape_audio" ? "flag" : "triangle");
          ctx.save.c1.notificationRule =
            draft.action && draft.notice === "municipal_update_with_timestamp"
              ? "municipal_update_with_timestamp"
              : "none";
          if (board) board.visible = ctx.save.c1.notificationRule === "municipal_update_with_timestamp";
          syncStand(draft.output === "color_only");
          if (draft.output === "shape_audio" && !deskSaid) {
            deskSaid = true;
            ctx.say("C1-S05-D004");
          }
          ctx.persist();
        },
        onChenWalk: () => startSecond(ctx),
        onOpenLayer: () => undefined,
        onMissingLayer: () => undefined,
        onPlaceModel: () => undefined,
      });

      ctx.interact.add({
        id: "place-demo",
        prompt: C1_PROMPT.demoPlace,
        position: xyz(C1_LAYOUT.demoStand),
        radius: 1.6,
        enabled: true,
        onUse: () => {
          if (placed) return;
          placed = true;
          stand = addReporterStand(ctx, xyz(C1_LAYOUT.demoStand), true);
          ctx.say("C1-S05-D001");
          walk = 0.01;
        },
      });
      ctx.interact.add({
        id: "cart",
        prompt: "推開推車",
        position: xyz(C1_LAYOUT.cart),
        radius: 1.7,
        enabled: true,
        onUse: () => {
          cart.position.x -= 1.8;
          const box = cart.userData["aabb"] as { min: THREE.Vector3; max: THREE.Vector3 } | undefined;
          if (box) {
            box.min.x -= 1.8;
            box.max.x -= 1.8;
          }
          const item = ctx.interact.items.find((entry) => entry.id === "cart");
          if (item) item.enabled = false;
          cartMoved = true;
          ctx.hud.announce("有人指著那團紅，開始亂猜。");
        },
      });
      ctx.interact.add({
        id: "desk",
        prompt: TASK["C1-S05-desk"] ?? "",
        position: xyz(C1_LAYOUT.desk),
        radius: 1.6,
        enabled: true,
        onUse: () => {
          ctx.hud.setTask(TASK["C1-S05-desk"] ?? "");
          ctx.workbench.openChen(ctx.save);
          if (!deskSaid) {
            deskSaid = true;
            ctx.say("C1-S05-D004");
          }
        },
      });
    },
    update(dt, ctx) {
      if (!chen || walk <= 0) return;
      const idx = Math.min(path.length - 1, Math.floor(walk));
      const nextIdx = Math.min(path.length - 1, idx + 1);
      const a = path[idx];
      const b = path[nextIdx];
      if (!a || !b) return;
      const local = walk - idx;
      chen.position.lerpVectors(a, b, nextIdx === idx ? 1 : local);
      chen.position.y = 0;
      if (!cartMoved && near(chen.position, C1_LAYOUT.cart, 1.4)) {
        ctx.hud.announce("推車擋住了。先推開。");
        return;
      }
      walk += dt * 0.55;

      if (!shadeSaid && near(chen.position, C1_LAYOUT.shade, 1.6)) {
        shadeSaid = true;
        if ((ctx.save.c1.accessibilityOutput ?? "color_only") === "color_only") ctx.say("C1-S05-D002");
      }
      if (!guessSaid && near(chen.position, C1_LAYOUT.cart, 1.6)) {
        guessSaid = true;
        if (ctx.save.c1.notificationRule !== "municipal_update_with_timestamp") ctx.say("C1-S05-D003");
      }
      if (walk >= path.length - 0.05) {
        walk = 0;
        if (pass) {
          ctx.say("C1-S05-D005");
          ctx.completeAndGo();
        } else {
          ctx.hud.setTask(TASK["C1-S05-desk"] ?? "");
          ctx.workbench.openChen(ctx.save);
        }
      }
    },
    unmount() {
      chen = null;
      stand = null;
      board = null;
      placed = false;
      walk = 0;
      pass = false;
      cartMoved = false;
    },
  };

  function syncStand(colorOnly: boolean): void {
    if (!stand) return;
    const flag = stand.getObjectByName("demo-flag");
    const lampHead = stand.getObjectByName("demo-lamp");
    if (flag) flag.visible = !colorOnly;
    if (lampHead instanceof THREE.Mesh && lampHead.material instanceof THREE.MeshLambertMaterial) {
      lampHead.material.emissiveIntensity = colorOnly ? 0.25 : 0.8;
    }
  }

  function startSecond(ctx: SceneContext): void {
    const ok =
      ctx.save.c1.accessibilityOutput === "shape_audio" &&
      ctx.save.c1.notificationRule === "municipal_update_with_timestamp";
    if (!ok) {
      ctx.say("C1-S05-D002");
      ctx.hud.setTask(TASK["C1-S05-desk"] ?? "");
      return;
    }
    pass = true;
    shadeSaid = true;
    guessSaid = true;
    walk = 0.01;
    ctx.hud.setTask(TASK["C1-S05-walk"] ?? "");
  }
}
