import type { BlockKind, BlockStamp } from "./blocks";

export interface DressRect {
  x0: number;
  z0: number;
  x1: number;
  z1: number;
}

/** Visual-only brick dressing. Collision stays on the few scene AABBs. */

export function stampLampPost(map: BlockStamp, x: number, z: number): void {
  map.set(x, 0, z, "iron");
  map.set(x, 1, z, "iron");
  map.set(x, 2, z, "lamp");
}

export function stampCrateStack(map: BlockStamp, x: number, z: number, h = 2): void {
  for (let y = 0; y < h; y += 1) {
    map.set(x, y, z, "wood");
    if (y < h - 1) map.set(x + 1, y, z, "wood");
  }
}

export function stampPiling(map: BlockStamp, x: number, z: number, y0 = -3, y1 = 0): void {
  map.fill(x, y0, z, x, y1, z, "iron");
}

export function stampRailing(map: BlockStamp, x0: number, z0: number, x1: number, z1: number): void {
  const xa = Math.min(x0, x1);
  const xb = Math.max(x0, x1);
  const za = Math.min(z0, z1);
  const zb = Math.max(z0, z1);
  if (xa === xb) {
    for (let z = za; z <= zb; z += 1) map.set(xa, 0, z, "iron");
    return;
  }
  for (let x = xa; x <= xb; x += 1) map.set(x, 0, z0, "iron");
}

export function stampStripe(map: BlockStamp, x0: number, z0: number, x1: number, z1: number): void {
  map.fill(x0, 0, z0, x1, 0, z1, "stripe");
}

export function stampHollow(map: BlockStamp, x: number, z: number, w: number, d: number, h: number, wall: BlockKind): void {
  const x1 = x + w - 1;
  const z1 = z + d - 1;
  map.fill(x, 0, z, x1, h - 1, z, wall);
  map.fill(x, 0, z1, x1, h - 1, z1, wall);
  map.fill(x, 0, z, x, h - 1, z1, wall);
  map.fill(x1, 0, z, x1, h - 1, z1, wall);
  map.fill(x, h - 1, z, x1, h - 1, z1, wall);
}

export function stampWindows(map: BlockStamp, x: number, z: number, w: number, h: number, face: "n" | "s" | "e" | "w"): void {
  for (let y = 1; y < h - 1; y += 2) {
    for (let i = 1; i < w - 1; i += 2) {
      if (face === "n") map.set(x + i, y, z, "night");
      else if (face === "s") map.set(x + i, y, z, "night");
      else if (face === "e") map.set(x + w - 1, y, z + i, "night");
      else map.set(x, y, z + i, "night");
    }
  }
}

export function stampBuilding(
  map: BlockStamp,
  x: number,
  z: number,
  w: number,
  d: number,
  h: number,
  wall: BlockKind,
  face: "n" | "s" | "e" | "w" = "s",
): void {
  stampHollow(map, x, z, w, d, h, wall);
  stampWindows(map, x, z, face === "e" || face === "w" ? d : w, h, face);
}

export function stampFacade(map: BlockStamp, x0: number, z: number, len: number, h: number, wall: BlockKind): void {
  for (let i = 0; i < len; i += 1) {
    const colH = h - (i % 5 === 2 ? 2 : i % 4 === 0 ? 1 : 0);
    map.fill(x0 + i, 0, z, x0 + i, colH, z, wall);
    for (let y = 1; y < colH; y += 2) {
      if (i % 2 === 1) map.set(x0 + i, y, z, "night");
    }
  }
}

export function stampCabinet(map: BlockStamp, x: number, z: number): void {
  map.set(x, 0, z, "iron");
  map.set(x, 1, z, "iron");
}

export function dressPerimeter(map: BlockStamp, play: DressRect, opts?: { wall?: BlockKind; lamps?: boolean; open?: string }): void {
  const wall = opts?.wall ?? "iron";
  const ox0 = play.x0 - 2;
  const ox1 = play.x1 + 2;
  const oz0 = play.z0 - 2;
  const oz1 = play.z1 + 2;
  const open = opts?.open ?? "";
  for (let x = ox0; x <= ox1; x += 1) {
    if (!open.includes("n")) {
      map.set(x, 0, oz0, wall);
      map.set(x, 1, oz0, wall);
    }
    if (!open.includes("s")) {
      map.set(x, 0, oz1, wall);
      map.set(x, 1, oz1, wall);
    }
  }
  for (let z = oz0; z <= oz1; z += 1) {
    if (!open.includes("w")) {
      map.set(ox0, 0, z, wall);
      map.set(ox0, 1, z, wall);
    }
    if (!open.includes("e")) {
      map.set(ox1, 0, z, wall);
      map.set(ox1, 1, z, wall);
    }
  }
  if (opts?.lamps !== false) {
    for (let x = ox0 + 2; x < ox1; x += 5) {
      if (!open.includes("n")) stampLampPost(map, x, oz0);
      if (!open.includes("s")) stampLampPost(map, x, oz1);
    }
  }
  stampCrateStack(map, ox0 + 1, oz0 + 1, 2);
  stampCrateStack(map, ox1 - 2, oz0 + 1, 3);
  stampCrateStack(map, ox0 + 1, oz1 - 2, 2);
}

export function dressInterior(map: BlockStamp, room: DressRect & { y0?: number; h?: number }): void {
  const y0 = room.y0 ?? -1;
  const h = room.h ?? 3;
  const ceil = y0 + h;
  for (let x = room.x0 + 1; x < room.x1; x += 3) {
    map.fill(x, ceil, room.z0 + 1, x, ceil, room.z1 - 1, "iron");
  }
  for (let z = room.z0 + 2; z < room.z1 - 1; z += 2) {
    map.set(room.x0, 1, z, "iron");
    map.set(room.x1, 1, z, "iron");
  }
  stampCabinet(map, room.x0 + 1, room.z0 + 1);
  stampCabinet(map, room.x1 - 1, room.z0 + 1);
  stampCabinet(map, room.x0 + 1, room.z1 - 1);
  if (room.x1 - room.x0 > 4) {
    stampStripe(map, Math.floor((room.x0 + room.x1) / 2), room.z0 + 1, Math.floor((room.x0 + room.x1) / 2), room.z1 - 1);
  }
}

export function stampStationMass(map: BlockStamp, x: number, z: number): void {
  stampBuilding(map, x, z, 7, 6, 6, "brick", "w");
  stampBuilding(map, x + 5, z + 4, 5, 5, 4, "stone", "w");
  stampLampPost(map, x - 1, z + 2);
  stampCrateStack(map, x - 1, z + 4, 2);
}

export function stampTornEdge(map: BlockStamp, x0: number, z: number, x1: number): void {
  for (let x = x0; x <= x1; x += 1) {
    map.set(x, 0, z, "iron");
    if (x % 2 === 0) map.set(x, 1, z, "iron");
  }
}

export function stampCatwalk(map: BlockStamp, x0: number, z: number, x1: number): void {
  map.fill(x0, 1, z, x1, 1, z, "iron");
  map.set(x0, 2, z, "iron");
  map.set(x1, 2, z, "iron");
}
