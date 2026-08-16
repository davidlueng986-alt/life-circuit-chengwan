import * as THREE from "three";
import { C1_LAYOUT, C1_PUBLIC_LAYERS } from "../../../content/chapter1/layout";
import { chooseMonitoring, hasFailedRun, stampUnresolved, zoneConfirmSeconds } from "../../../content/chapter1/state";
import { COMM, PROMPT, TASK } from "../../content/copy";
import type { MonitoringModel } from "../../content/ids";
import { addSolidBox, boxMesh } from "../../engine/greybox";
import { makeWorldLabel } from "../../engine/worldHints";
import type { GameScene, SceneContext } from "../types";
import { furnitureForModel, lightHarbor, mountEastShore, xyz } from "./kit";

export function createC1S07(): GameScene {
  let placed: MonitoringModel | null = null;
  const layerOn = new Set<string>();
  const marks: Partial<Record<string, THREE.Mesh>> = {};

  return {
    id: "C1-S07",
    mount(ctx) {
      lightHarbor(ctx, "fog");
      mountEastShore(ctx, {});
      ctx.world.addAnchor("square", C1_LAYOUT.spawnS07[0], 0, C1_LAYOUT.spawnS07[2]);

      addSolidBox(ctx.root, ctx.world, 4.4, 0.22, 3.2, 0x2a3640, C1_LAYOUT.mapTable[0], C1_LAYOUT.mapTable[1], C1_LAYOUT.mapTable[2]);
      const plate = boxMesh(3.2, 0.08, 2.2, 0x1a2428, C1_LAYOUT.cityPlate[0], C1_LAYOUT.cityPlate[1], C1_LAYOUT.cityPlate[2]);
      ctx.root.add(plate);
      const river = boxMesh(0.28, 0.06, 2.0, 0x3a88a0, C1_LAYOUT.cityPlate[0] + 0.2, C1_LAYOUT.cityPlate[1] + 0.08, C1_LAYOUT.cityPlate[2]);
      const market = boxMesh(0.55, 0.22, 0.45, 0xb85c38, C1_LAYOUT.cityPlate[0] - 0.9, C1_LAYOUT.cityPlate[1] + 0.16, C1_LAYOUT.cityPlate[2] - 0.4);
      const pump = boxMesh(0.4, 0.28, 0.4, 0x6a7068, C1_LAYOUT.cityPlate[0] + 0.7, C1_LAYOUT.cityPlate[1] + 0.18, C1_LAYOUT.cityPlate[2] + 0.55);
      river.name = "map-river";
      market.name = "map-market";
      pump.name = "map-pump";
      ctx.root.add(river, market, pump);
      const plateTag = makeWorldLabel("河港圖", "點圖層會亮這裡");
      plateTag.position.set(C1_LAYOUT.cityPlate[0], 1.35, C1_LAYOUT.cityPlate[2]);
      ctx.root.add(plateTag);
      addSolidBox(ctx.root, ctx.world, 1.2, 1.5, 1.2, 0x6a7068, C1_LAYOUT.modelFixed[0], C1_LAYOUT.modelFixed[1], C1_LAYOUT.modelFixed[2]);
      addSolidBox(ctx.root, ctx.world, 1.1, 0.7, 1.1, 0x8a6a40, C1_LAYOUT.modelKits[0], C1_LAYOUT.modelKits[1], C1_LAYOUT.modelKits[2]);

      const obtained: Record<string, boolean> = {
        fail: hasFailedRun(ctx.save) || ctx.save.c1.invalidRunExperienced,
        controls: ctx.save.c1.controlsRestored,
        zone: ctx.save.c1.sourceZoneMarked,
        route: ctx.save.player.tool.modules.includes("latch") || ctx.save.c1.sourceZoneMarked,
        wait: true,
      };
      C1_PUBLIC_LAYERS.forEach((layer, index) => {
        const mark = boxMesh(0.35, 0.08, 0.35, 0x3a4038, C1_LAYOUT.mapTable[0] - 1.2 + index * 0.55, 0.72, C1_LAYOUT.mapTable[2] - 1.1);
        mark.visible = false;
        mark.userData["layer"] = layer.id;
        mark.userData["obtained"] = obtained[layer.id] === true;
        ctx.root.add(mark);
        marks[layer.id] = mark;
      });

      ctx.player.reset(C1_LAYOUT.spawnS07[0], 0, C1_LAYOUT.spawnS07[2], Math.PI);
      ctx.camera.yaw = Math.PI;
      ctx.hud.setTask(TASK["C1-S07-layers"] ?? "");

      ctx.workbench.bind({
        onChenChange: () => undefined,
        onChenWalk: () => undefined,
        onOpenLayer: (id) => {
          layerOn.add(id);
          const mesh = marks[id];
          if (mesh) {
            mesh.visible = true;
            const mat = mesh.material;
            if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshLambertMaterial) {
              mat.emissive.setHex(0xe0a03a);
              mat.emissiveIntensity = 1.2;
            }
          }
          paintHarborLayer(ctx, id);
          if (id === "fail") ctx.hud.announce("地圖亮起：第一次全紅失效");
          if (id === "controls") ctx.hud.announce("地圖亮起：對照組已修好");
          if (id === "zone") ctx.hud.announce("地圖亮起：確認隊搜索範圍");
          if (id === "route") ctx.hud.announce("地圖亮起：你們走過的路線");
          if (id === "wait") ctx.hud.announce("地圖仍空：實驗室結果還沒回來");
          const row = C1_PUBLIC_LAYERS.find((item) => item.id === id);
          if (row) ctx.say(row.line);
          if (id === "zone") {
            ctx.hud.announce(`${COMM.layerZone} ${zoneConfirmSeconds(ctx.save)} 秒`);
          }
        },
        onMissingLayer: () => ctx.hud.missingLayer(),
        onPlaceModel: (model) => place(ctx, model),
      });
      ctx.workbench.openMap(ctx.save);

      ctx.interact.add({
        id: "fixed",
        prompt: PROMPT.placeFixed,
        position: xyz(C1_LAYOUT.modelFixed),
        radius: 1.6,
        enabled: true,
        onUse: () => place(ctx, "fixed_station"),
      });
      ctx.interact.add({
        id: "kits",
        prompt: PROMPT.placeKits,
        position: xyz(C1_LAYOUT.modelKits),
        radius: 1.6,
        enabled: true,
        onUse: () => place(ctx, "portable_kits"),
      });
    },
    update() {
      return;
    },
    unmount() {
      layerOn.clear();
    },
  };

  function place(ctx: SceneContext, model: MonitoringModel): void {
    placed = model;
    chooseMonitoring(ctx.save, model);
    stampUnresolved(ctx.save);
    ctx.save.c1.publicMapPublished = true;
    ctx.persist();
    furnitureForModel(ctx, model);
    ctx.hud.setTask(TASK["C1-S07-place"] ?? "");
    if (placed) ctx.completeAndGo();
  }
}

function paintHarborLayer(ctx: SceneContext, id: string): void {
  const glow = (name: string, color: number): void => {
    const mesh = ctx.root.getObjectByName(name);
    if (!(mesh instanceof THREE.Mesh)) return;
    const mat = mesh.material;
    if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshLambertMaterial) {
      mat.emissive.setHex(color);
      mat.emissiveIntensity = 1.15;
    } else if (mat instanceof THREE.MeshBasicMaterial) {
      mat.color.setHex(color);
    }
  };
  if (id === "fail") glow("map-river", 0xc44a3a);
  if (id === "controls") glow("map-pump", 0x8fd4cf);
  if (id === "zone") {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(2.4, 4.6, 28),
      new THREE.MeshBasicMaterial({ color: 0xe0a03a, transparent: true, opacity: 0.38, side: THREE.DoubleSide }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(C1_LAYOUT.warehouse[0], 0.12, C1_LAYOUT.warehouse[2]);
    ctx.root.add(ring);
    const tableZone = new THREE.Mesh(
      new THREE.CircleGeometry(0.55, 18),
      new THREE.MeshBasicMaterial({ color: 0xe0a03a, transparent: true, opacity: 0.45, side: THREE.DoubleSide }),
    );
    tableZone.rotation.x = -Math.PI / 2;
    tableZone.position.set(C1_LAYOUT.cityPlate[0] + 0.55, C1_LAYOUT.cityPlate[1] + 0.1, C1_LAYOUT.cityPlate[2]);
    ctx.root.add(tableZone);
  }
  if (id === "route") {
    const line = boxMesh(1.8, 0.05, 0.08, 0xffe2a0, C1_LAYOUT.cityPlate[0], C1_LAYOUT.cityPlate[1] + 0.1, C1_LAYOUT.cityPlate[2] + 0.15);
    ctx.root.add(line);
  }
  if (id === "wait") glow("map-market", 0x8aa4b8);
}
