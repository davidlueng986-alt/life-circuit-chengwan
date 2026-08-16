import * as THREE from "three";
import { openingLineIds } from "../content/beats";
import { SCENE_DEFS } from "../content/catalog";
import { defaultTask, PROMPT, TASK } from "../content/copy";
import type { SceneId } from "../content/ids";
import { applyMonitoring, pushRun } from "../content/progress";
import { HARBOR, WORKSHOP, addSolidBox, applyFog, boxMesh, type Palette } from "../engine/greybox";
import type { GameScene, SceneContext } from "./types";

export function createSpineScene(id: SceneId): GameScene {
  const def = SCENE_DEFS[id];
  const workshop = def.chapter === "workshop";
  const palette: Palette = workshop ? WORKSHOP : HARBOR;
  let evac = 70;
  let evacArmed = false;
  let sitDone = false;
  let pulsed = false;
  let clock = 0;

  return {
    id,
    mount(ctx) {
      applyFog(ctx.three, palette, ctx.reducedMotion);
      ctx.root.add(new THREE.HemisphereLight(workshop ? 0x9fd0cc : 0xc9b39a, 0x101214, 0.65));
      addSolidBox(ctx.root, ctx.world, 16, 0.4, 16, palette.floor, 0, -0.2, 0);
      addSolidBox(ctx.root, ctx.world, 16, 3.4, 0.4, palette.wall, 0, 1.5, -8);
      addSolidBox(ctx.root, ctx.world, 16, 3.4, 0.4, palette.wall, 0, 1.5, 8);
      addSolidBox(ctx.root, ctx.world, 0.4, 3.4, 16, palette.wall, -8, 1.5, 0);
      addSolidBox(ctx.root, ctx.world, 0.4, 3.4, 16, palette.wall, 8, 1.5, 0);

      ctx.player.reset(0, 0, 5.4, Math.PI);
      ctx.camera.yaw = Math.PI;
      ctx.hud.setTask(defaultTask(id));
      const opening = openingLineIds(id, ctx.save);
      if (opening.length > 0) ctx.queueLines(opening);

      if (id === "C1-S00") mountLoadout(ctx);
      else if (id === "C1-S02") mountSaturation(ctx);
      else if (id === "C1-S03" || id === "W-S04") mountDocks(ctx, id);
      else if (id === "C1-S05") mountChen(ctx);
      else if (id === "C1-S07") mountMap(ctx);
      else if (id === "C1-S08") mountRecap(ctx);
      else mountVerb(ctx, id);

      if (id === "P-S05") {
        evacArmed = true;
        evac = ctx.save.settings.relaxedTimer ? 999 : 70;
        ctx.hud.setStorm(ctx.save.settings.relaxedTimer ? null : 1);
        ctx.hud.setRelaxed(ctx.save.settings.relaxedTimer);
      }
    },
    update(dt, ctx) {
      clock += dt;
      if (id === "P-S02" && ctx.flowLens.lastPulseAt > 0 && !pulsed) {
        pulsed = true;
        ctx.say("P-S02-D002");
        ctx.hud.setTask(TASK["P-S02-follow"] ?? "");
      }
      if (id === "P-S05" && evacArmed && !ctx.save.settings.relaxedTimer) {
        evac = Math.max(0, evac - dt);
        ctx.hud.setStorm(evac / 70);
        if (evac <= 0) {
          evac = 70;
          ctx.say("P-S05-R001");
          ctx.player.pullTo(new THREE.Vector3(0, 0, 5.4), "water");
          ctx.hud.setTask(TASK["P-S05-run"] ?? "");
        }
      }
      if ((id === "W-S05" || id === "C1-S08") && ctx.hud.queueIdle && !sitDone && clock > 1) {
        sitDone = true;
        if (id === "C1-S08") return;
        ctx.completeAndGo();
      }
    },
    unmount() {
      evacArmed = false;
    },
  };
}

function mountVerb(ctx: SceneContext, id: SceneId): void {
  addSolidBox(ctx.root, ctx.world, 1.4, 1.2, 1.4, 0x8a6a3a, 0, 0.6, -4.2);
  if (id === "P-S02") {
    ctx.interact.add({
      id: "lens",
      prompt: PROMPT.pickLens,
      position: new THREE.Vector3(0, 0, -4.2),
      radius: 1.8,
      enabled: true,
      onUse: () => {
        ctx.save.player.tool.flowLens = true;
        ctx.flowLens.reset(true);
        ctx.hud.setBattery(true, ctx.save.player.tool.battery);
        ctx.hud.setTask(TASK["P-S02-pulse"] ?? "");
        ctx.say("P-S02-D001");
        ctx.persist();
        ctx.interact.add({
          id: "relay",
          prompt: PROMPT.seatRelay,
          position: new THREE.Vector3(2.4, 0, -4.2),
          radius: 1.6,
          enabled: true,
          onUse: () => {
            ctx.say("P-S02-D003");
            ctx.hud.setTask(TASK["P-S02-seat"] ?? "");
            ctx.completeAndGo();
          },
        });
      },
    });
    addSolidBox(ctx.root, ctx.world, 0.8, 1.1, 0.8, 0x6a5340, 2.4, 0.55, -4.2);
    return;
  }
  if (id === "P-S03") {
    ctx.interact.add({
      id: "tether",
      prompt: PROMPT.pickTether,
      position: new THREE.Vector3(0, 0, -4.2),
      radius: 1.8,
      enabled: true,
      onUse: () => {
        ctx.save.player.tool.tether = true;
        ctx.tether.reset(true, ctx.save.settings.holdAlternatives);
        ctx.hud.setTask(TASK["P-S03-snap"] ?? "");
        ctx.say("P-S03-D002");
        ctx.persist();
        ctx.interact.add({
          id: "snap",
          prompt: PROMPT.snapPlate,
          position: new THREE.Vector3(-2.2, 0, -4.2),
          radius: 1.6,
          enabled: true,
          onUse: () => ctx.completeAndGo(),
        });
      },
    });
    addSolidBox(ctx.root, ctx.world, 1.6, 0.12, 0.9, 0x7a8490, -2.2, 0.2, -4.2);
    return;
  }
  if (id === "P-S04") {
    let scanned = false;
    ctx.interact.add({
      id: "scan",
      prompt: PROMPT.pulseWall,
      position: new THREE.Vector3(0, 0, -4.2),
      radius: 1.8,
      enabled: true,
      onUse: () => {
        if (!scanned) {
          scanned = true;
          ctx.queueLines(["P-S04-D002", "P-S04-D003", "P-S04-D004"]);
        } else {
          ctx.say("P-S04-D004");
        }
        ctx.completeAndGo();
      },
    });
    return;
  }
  if (id === "P-S05") {
    ctx.interact.add({
      id: "lift",
      prompt: TASK["P-S05-hold"] ?? PROMPT.advance,
      position: new THREE.Vector3(0, 0, -4.2),
      radius: 1.8,
      holdSeconds: ctx.save.settings.holdAlternatives ? 0 : 1.6,
      enabled: true,
      onUse: () => {
        ctx.queueLines(["P-S05-D003", "P-S05-D004"]);
        ctx.hud.setTask(TASK["P-S05-hold"] ?? "");
        ctx.completeAndGo();
      },
    });
    ctx.interact.add({
      id: "platform",
      prompt: PROMPT.advance,
      position: new THREE.Vector3(3.2, 0, 2.2),
      radius: 1.5,
      enabled: true,
      onUse: () => ctx.say("P-S05-D002"),
    });
    return;
  }
  if (id === "W-S00") {
    ctx.interact.add({
      id: "frames",
      prompt: TASK["W-S00-aim"] ?? PROMPT.advance,
      position: new THREE.Vector3(0, 0, -4.2),
      radius: 1.8,
      enabled: true,
      onUse: () => {
        ctx.queueLines(["W-S00-D002", "W-S00-D003"]);
        ctx.completeAndGo();
      },
    });
    return;
  }
  if (id === "W-S01") {
    ctx.interact.add({
      id: "rna",
      prompt: TASK["W-S01"] ?? PROMPT.advance,
      position: new THREE.Vector3(0, 0, -4.2),
      radius: 1.8,
      enabled: true,
      onUse: () => {
        ctx.queueLines(["W-S01-D002", "W-S01-D003"]);
        ctx.completeAndGo();
      },
    });
    return;
  }
  if (id === "W-S02") {
    ctx.interact.add({
      id: "protein",
      prompt: TASK["W-S02"] ?? PROMPT.advance,
      position: new THREE.Vector3(0, 0, -4.2),
      radius: 1.8,
      enabled: true,
      onUse: () => {
        ctx.queueLines(["W-S02-D002", "W-S02-D003"]);
        ctx.completeAndGo();
      },
    });
    return;
  }
  if (id === "W-S03") {
    ctx.interact.add({
      id: "smoke",
      prompt: TASK["W-S03-smoke"] ?? PROMPT.advance,
      position: new THREE.Vector3(0, 0, -4.2),
      radius: 1.8,
      enabled: true,
      onUse: () => {
        ctx.hud.setTask(TASK["W-S03-trace"] ?? "");
        ctx.queueLines(["W-S03-D002", "W-S03-D003"]);
        ctx.interact.add({
          id: "flag",
          prompt: TASK["W-S03-flag"] ?? "",
          position: new THREE.Vector3(2.4, 0, -3.2),
          radius: 1.5,
          enabled: true,
          onUse: () => ctx.completeAndGo(),
        });
      },
    });
    return;
  }
  if (id === "C1-S01") {
    ctx.interact.add({
      id: "trace",
      prompt: TASK["C1-S01-hunt"] ?? PROMPT.advance,
      position: new THREE.Vector3(0, 0, -4.2),
      radius: 1.8,
      enabled: true,
      onUse: () => {
        ctx.queueLines(["C1-S01-D002", "C1-S01-D003", "C1-S01-D004"]);
        ctx.hud.setTask(TASK["C1-S01-back"] ?? "");
        ctx.completeAndGo();
      },
    });
    return;
  }
  if (id === "C1-S04") {
    let beacons = 0;
    ctx.interact.add({
      id: "beacon",
      prompt: TASK["C1-S04"] ?? PROMPT.advance,
      position: new THREE.Vector3(0, 0, -4.2),
      radius: 1.8,
      enabled: true,
      onUse: () => {
        beacons += 1;
        if (beacons === 1) {
          ctx.queueLines(["C1-S04-D002", "C1-S04-D003"]);
          ctx.hud.setTask(TASK["C1-S04-wide"] ?? "");
        } else {
          ctx.queueLines(["C1-S04-D004", "C1-S04-D005"]);
          ctx.hud.setTask(TASK["C1-S04-ok"] ?? "");
          ctx.completeAndGo();
        }
      },
    });
    return;
  }
  if (id === "C1-S06") {
    ctx.bioRig.latchKept = true;
    ctx.interact.add({
      id: "pipe",
      prompt: TASK["C1-S06-open"] ?? PROMPT.advance,
      position: new THREE.Vector3(0, 0, -4.2),
      radius: 1.8,
      enabled: true,
      onUse: () => {
        ctx.queueLines(["C1-S06-D002", "C1-S06-D003", "C1-S06-D004"]);
        ctx.interact.add({
          id: "rover",
          prompt: TASK["C1-S06-evac"] ?? "",
          position: new THREE.Vector3(2.6, 0, -3.4),
          radius: 1.5,
          enabled: true,
          onUse: () => {
            ctx.queueLines(["C1-S06-D005", "C1-S06-D006"]);
            ctx.hud.setTask(TASK["C1-S06-evac"] ?? "");
            ctx.completeAndGo();
          },
        });
      },
    });
    return;
  }
  if (id === "W-S05") {
    ctx.interact.add({
      id: "replay",
      prompt: TASK["W-S05"] ?? PROMPT.advance,
      position: new THREE.Vector3(0, 0, -4.2),
      radius: 1.8,
      enabled: true,
      onUse: () => ctx.completeAndGo(),
    });
    return;
  }
  ctx.interact.add({
    id: "verb",
    prompt: PROMPT.advance,
    position: new THREE.Vector3(0, 0, -4.2),
    radius: 1.8,
    enabled: true,
    onUse: () => ctx.completeAndGo(),
  });
}

function mountLoadout(ctx: SceneContext): void {
  addSolidBox(ctx.root, ctx.world, 0.8, 0.8, 0.5, 0xc9a227, -2.2, 0.5, -3.2);
  addSolidBox(ctx.root, ctx.world, 0.9, 0.7, 0.7, 0x5a6570, 2.2, 0.45, -3.2);
  addSolidBox(ctx.root, ctx.world, 0.7, 1.1, 0.7, 0x3d5c58, 0, 0.55, -5.4);
  const pick = (kind: "battery" | "crash_shell"): void => {
    ctx.save.c1.loadout = kind;
    ctx.bioRig.loadout = kind;
    ctx.bioRig.grantPickup(kind);
    ctx.hud.setTask(TASK["C1-S00-go"] ?? "");
    ctx.persist();
  };
  ctx.interact.add({
    id: "battery",
    prompt: PROMPT.battery,
    position: new THREE.Vector3(-2.2, 0, -3.2),
    radius: 1.6,
    enabled: true,
    onUse: () => pick("battery"),
  });
  ctx.interact.add({
    id: "shell",
    prompt: PROMPT.shell,
    position: new THREE.Vector3(2.2, 0, -3.2),
    radius: 1.6,
    enabled: true,
    onUse: () => pick("crash_shell"),
  });
  ctx.interact.add({
    id: "probe",
    prompt: PROMPT.pickProbe,
    position: new THREE.Vector3(0, 0, -5.4),
    radius: 1.6,
    enabled: true,
    onUse: () => {
      if (!ctx.save.c1.loadout) return;
      ctx.say("C1-S00-D004");
      ctx.completeAndGo();
    },
  });
}

function mountSaturation(ctx: SceneContext): void {
  const tried = { turn: false, leave: false, relay: false };
  const pads: Array<[keyof typeof tried, THREE.Vector3, string, string]> = [
    ["turn", new THREE.Vector3(-3.4, 0, -1), PROMPT.turn, "C1-S02-D001"],
    ["leave", new THREE.Vector3(3.4, 0, -1), PROMPT.leave, "C1-S02-D002"],
    ["relay", new THREE.Vector3(0, 0, -4.6), PROMPT.killRelay, "C1-S02-D003"],
  ];
  for (const [key, pos, prompt, lineId] of pads) {
    addSolidBox(ctx.root, ctx.world, 1, 0.3, 1, 0x6a3030, pos.x, 0.15, pos.z);
    ctx.interact.add({
      id: key,
      prompt,
      position: pos,
      radius: 1.5,
      enabled: true,
      onUse: () => {
        tried[key] = true;
        ctx.say(lineId);
        if (tried.turn && tried.leave && tried.relay) {
          ctx.bioRig.saturated = true;
          ctx.bioRig.selfTestBlink = true;
          ctx.hud.setTask(TASK["C1-S02"] ?? "");
          ctx.say("C1-S02-D004");
          pushRun(ctx.save, {
            id: `C1-S02-saturated-${Date.now()}`,
            scene: "C1-S02",
            at: new Date().toISOString(),
            kind: "saturated",
            outputBand: "saturated",
            readable: false,
            loadout: ctx.save.c1.loadout,
            retained: true,
          });
          ctx.persist();
          ctx.interact.add({
            id: "van",
            prompt: PROMPT.advance,
            position: new THREE.Vector3(0, 0, 4.4),
            radius: 1.8,
            enabled: true,
            onUse: () => ctx.completeAndGo(),
          });
        }
      },
    });
  }
}

function mountDocks(ctx: SceneContext, id: SceneId): void {
  ctx.docks.reset(true);
  ctx.bioRig.grantPickup(ctx.save.c1.loadout);
  ctx.bioRig.placeAt(new THREE.Vector3(0, 0.85, -1.6));
  ctx.signals.add({
    id: "reg-jam",
    kind: "device_link",
    a: new THREE.Vector3(-0.4, 0.9, -1.6),
    b: new THREE.Vector3(-0.1, 0.9, -1.6),
  });
  ctx.signals.add({
    id: "wet-out",
    kind: "self_test",
    a: new THREE.Vector3(0.15, 0.9, -1.6),
    b: new THREE.Vector3(0.4, 0.9, -1.4),
  });
  const portA = boxMesh(0.22, 0.22, 0.22, 0x6a5340, -1.4, 0.4, -1.6);
  const portB = boxMesh(0.22, 0.22, 0.22, 0x8aa0b8, 1.4, 0.4, -1.6);
  ctx.root.add(portA, portB);
  ctx.tether.registerBody({ id: "port-reg", object: portA, mass: "light", shape: "port-reg" });
  ctx.tether.registerBody({ id: "port-out", object: portB, mass: "light", shape: "port-out" });
  ctx.tether.registerSocket({
    id: "reg-seat",
    shape: "port-reg",
    position: new THREE.Vector3(-0.28, 0.85, -1.6),
    parent: ctx.root,
    onSeat: () => {
      if (ctx.tether.seatedIn("out-seat")) ctx.docks.repairSun();
    },
  });
  ctx.tether.registerSocket({
    id: "out-seat",
    shape: "port-out",
    position: new THREE.Vector3(0.28, 0.85, -1.6),
    parent: ctx.root,
    onSeat: () => {
      if (ctx.tether.seatedIn("reg-seat")) ctx.docks.repairSun();
    },
  });
  addSolidBox(ctx.root, ctx.world, 1, 1, 1, 0x8aa0b8, -3, 0.5, -3.6);
  addSolidBox(ctx.root, ctx.world, 1, 1, 1, 0xc9a227, 0, 0.5, -3.6);
  addSolidBox(ctx.root, ctx.world, 1, 1, 1, 0x6a6a6a, 3, 0.5, -3.6);
  const stamp = () => {
    const started = performance.now();
    const label = () => {
      const sec = Math.max(0, Math.floor((performance.now() - started) / 1000));
      return `${sec} 秒`;
    };
    ctx.workbench.openDocks(ctx.save, ctx.docks.portsOk, ctx.docks.unknownOpen, label());
  };
  stamp();
  ctx.interact.add({
    id: "moon",
    prompt: PROMPT.moonDock,
    position: new THREE.Vector3(-3, 0, -3.6),
    radius: 1.6,
    enabled: true,
    onUse: () => {
      if (id === "C1-S03") ctx.say("C1-S03-D002");
      pushRun(ctx.save, ctx.docks.record(id, "moon", ctx.save.c1.loadout));
      stamp();
    },
  });
  ctx.interact.add({
    id: "sun-fix",
    prompt: TASK["W-S04-fix"] ?? TASK["C1-S03-refs"] ?? "",
    position: new THREE.Vector3(0, 0, -3.6),
    radius: 1.6,
    enabled: true,
    onUse: () => {
      if (id === "W-S04") ctx.queueLines(["W-S04-D002", "W-S04-D003", "W-S04-D004"]);
      else ctx.queueLines(["C1-S03-D003", "C1-S03-D004"]);
      if (!ctx.docks.portsOk) return;
      ctx.docks.repairSun();
      pushRun(ctx.save, ctx.docks.record(id, "sun", ctx.save.c1.loadout));
      ctx.hud.setTask(id === "W-S04" ? TASK["W-S04-unknown"] ?? "" : TASK["C1-S03-unknown"] ?? "");
      stamp();
    },
  });
  ctx.interact.add({
    id: "unknown",
    prompt: PROMPT.unknownDock,
    position: new THREE.Vector3(3, 0, -3.6),
    radius: 1.6,
    enabled: true,
    onUse: () => {
      if (!ctx.docks.unknownOpen) return;
      ctx.docks.unknown.output = "fluctuating";
      pushRun(ctx.save, ctx.docks.record(id, "unknown", ctx.save.c1.loadout));
      if (id === "C1-S03") ctx.say("C1-S03-D005");
      ctx.completeAndGo();
    },
  });
}

function mountChen(ctx: SceneContext): void {
  ctx.hud.setTask(TASK["C1-S05-desk"] ?? "");
  addSolidBox(ctx.root, ctx.world, 2.4, 0.7, 1.2, 0x4a4034, 0, 0.35, -3.4);
  ctx.workbench.bind({
    onChenChange: (draft) => {
      ctx.save.c1.accessibilityOutput = draft.output;
      ctx.bioRig.accessibility = draft.output;
      ctx.save.c1.notificationRule = draft.action && draft.notice === "municipal_update_with_timestamp"
        ? "municipal_update_with_timestamp"
        : "none";
      if (draft.output === "color_only") ctx.say("C1-S05-D002");
      if (!draft.action) ctx.say("C1-S05-D003");
      if (draft.output === "shape_audio") ctx.say("C1-S05-D004");
      ctx.persist();
    },
    onChenWalk: () => {
      const ok =
        ctx.save.c1.accessibilityOutput === "shape_audio" &&
        ctx.save.c1.notificationRule === "municipal_update_with_timestamp";
      ctx.say(ok ? "C1-S05-D005" : "C1-S05-D002");
      ctx.hud.setTask(ok ? TASK["C1-S05-walk"] ?? "" : TASK["C1-S05-desk"] ?? "");
      if (ok) ctx.completeAndGo();
    },
    onOpenLayer: () => undefined,
    onMissingLayer: () => undefined,
    onPlaceModel: () => undefined,
  });
  ctx.workbench.openChen(ctx.save);
}

function mountMap(ctx: SceneContext): void {
  addSolidBox(ctx.root, ctx.world, 4, 0.2, 3, 0x2a3640, 0, 0.2, -3);
  addSolidBox(ctx.root, ctx.world, 1.1, 1.4, 1.1, 0x6a7068, -3.4, 0.7, 2.4);
  addSolidBox(ctx.root, ctx.world, 1.1, 0.8, 1.1, 0x8a6a40, 3.4, 0.4, 2.4);
  ctx.workbench.bind({
    onChenChange: () => undefined,
    onChenWalk: () => undefined,
    onOpenLayer: (layer) => {
      if (layer === "fail") ctx.say("C1-S07-D001");
      if (layer === "controls") ctx.say("C1-S07-D004");
      if (layer === "zone" || layer === "route") ctx.say("C1-S07-D002");
      if (layer === "wait") ctx.say("C1-S07-D003");
    },
    onMissingLayer: () => ctx.hud.missingLayer(),
    onPlaceModel: (model) => {
      applyMonitoring(ctx.save, model);
      ctx.hud.setTask(TASK["C1-S07-place"] ?? "");
      ctx.persist();
      ctx.completeAndGo();
    },
  });
  ctx.workbench.openMap(ctx.save);
  ctx.interact.add({
    id: "fixed",
    prompt: PROMPT.placeFixed,
    position: new THREE.Vector3(-3.4, 0, 2.4),
    radius: 1.6,
    enabled: true,
    onUse: () => {
      applyMonitoring(ctx.save, "fixed_station");
      ctx.completeAndGo();
    },
  });
  ctx.interact.add({
    id: "kits",
    prompt: PROMPT.placeKits,
    position: new THREE.Vector3(3.4, 0, 2.4),
    radius: 1.6,
    enabled: true,
    onUse: () => {
      applyMonitoring(ctx.save, "portable_kits");
      ctx.completeAndGo();
    },
  });
}

function mountRecap(ctx: SceneContext): void {
  ctx.hud.setTask("");
  ctx.hud.setRecap(true);
  addSolidBox(ctx.root, ctx.world, 2.2, 1.6, 0.2, 0x3a322c, 0, 1.1, -4);
  ctx.interact.add({
    id: "wall",
    prompt: PROMPT.advance,
    position: new THREE.Vector3(0, 0, -3.6),
    radius: 1.8,
    enabled: true,
    onUse: () => ctx.completeAndGo(),
  });
}
