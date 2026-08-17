import * as THREE from "three";
import { BlockStamp } from "../engine/blocks";
import { stampBuilding, stampCrateStack, stampFacade, stampLampPost, stampPiling } from "../engine/dress";
import { waterSheet } from "../engine/greybox";

export interface HorizonOpts {
  weather?: "storm" | "fog" | "hub";
  /** Extra water sheet under the far field. */
  water?: boolean;
  /** Shift the whole district (harbor sits further +Z). */
  shift?: { x?: number; z?: number };
}

/**
 * Shared Chengwan mid/far field. Visual only.
 * Replaces the black-bar `citySkyline`.
 */
export function dressHorizon(root: THREE.Object3D, opts: HorizonOpts = {}): void {
  const map = new BlockStamp();
  const sx = opts.shift?.x ?? 0;
  const sz = opts.shift?.z ?? 0;

  stampFacade(map, -16 + sx, -18 + sz, 28, 8, "brick");
  stampBuilding(map, -12 + sx, -16 + sz, 5, 4, 7, "stone", "s");
  stampBuilding(map, -4 + sx, -17 + sz, 6, 4, 5, "brick", "s");
  stampBuilding(map, 5 + sx, -15 + sz, 5, 4, 8, "stone", "s");
  stampBuilding(map, 12 + sx, -16 + sz, 4, 3, 6, "brick", "s");

  stampBuilding(map, 20 + sx, -6 + sz, 5, 6, 6, "brick", "w");
  stampBuilding(map, 22 + sx, 4 + sz, 4, 5, 5, "stone", "w");
  stampCrateStack(map, 19 + sx, 2 + sz, 2);
  stampLampPost(map, 19 + sx, -2 + sz);

  stampBuilding(map, -26 + sx, -2 + sz, 5, 6, 5, "brick", "e");
  stampBuilding(map, -25 + sx, 8 + sz, 4, 5, 7, "stone", "e");
  for (let z = -4; z <= 20; z += 5) stampPiling(map, -14 + sx, z + sz);

  if (opts.weather === "hub") {
    stampBuilding(map, -8 + sx, -26 + sz, 6, 4, 4, "wood", "s");
  }

  map.commit(root as THREE.Group);

  if (opts.water) {
    root.add(waterSheet(70, 40, -8 + sx, -2.4, -22 + sz));
  }
}
