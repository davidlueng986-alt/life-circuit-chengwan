/** Greybox metres for east-shore C1. +Z inland / pump, +X warehouse water, −X market. */

export type Xz = readonly [number, number];
export type Xyz = readonly [number, number, number];

export const C1_LAYOUT = {
  spawnS00: [0, 0, 2.15] as Xyz,
  table: [0, 0, 0] as Xyz,
  battery: [-1.8, 0.45, 0.1] as Xyz,
  shell: [1.8, 0.4, 0.1] as Xyz,
  probe: [0, 0.55, 0.85] as Xyz,
  mapWall: [0, 1.6, -7.4] as Xyz,
  airlock: [0, 0, 6.8] as Xyz,

  spawnS01: [0, 0, 2.4] as Xyz,
  market: [-11.2, 0, 12] as Xyz,
  fish: [-6.4, 0, 17.2] as Xyz,
  pierGap: [10.2, 0, 11.2] as Xyz,
  crateA: [8.2, 0.28, 11.2] as Xyz,
  crateB: [12.4, 0.28, 11.2] as Xyz,
  crateSeat: [10.2, 0.18, 11.2] as Xyz,
  cageHome: [1.6, 0.35, 20.6] as Xyz,
  cageFar: [1.6, 0.35, 25.4] as Xyz,
  warehouse: [18.6, 1.2, 20] as Xyz,
  warehouseFence: [15.4, 0.9, 20] as Xyz,
  pumpJack: [2.2, 0, 31.6] as Xyz,
  wallPower: [-3.2, 0, 30.4] as Xyz,
  heading: [0.12, 0, 1] as Xyz,

  spawnS02: [0.4, 0, 36.2] as Xyz,
  slot: [0.4, 0, 38.4] as Xyz,
  leavePad: [0.4, 0, 30.6] as Xyz,
  envRelay: [3.4, 0.8, 38.2] as Xyz,
  lift: [-4.2, 0, 34.6] as Xyz,
  beam: [5.2, 1.1, 35.4] as Xyz,
  vanMouth: [-11.2, 1.1, 39.2] as Xyz,

  van: [-12.4, 1.1, 40] as Xyz,
  moonDock: [-14.2, 1.1, 38.2] as Xyz,
  sunDock: [-12.4, 1.1, 37.4] as Xyz,
  unknownDock: [-10.6, 1.1, 38.2] as Xyz,
  portReg: [-13.15, 1.55, 38.75] as Xyz,
  portOut: [-11.65, 1.55, 38.75] as Xyz,

  spawnS04: [0, 0, 8.4] as Xyz,
  roofMarket: [-11.4, 3.15, 12] as Xyz,
  cranePad: [6.4, 3.25, 22.4] as Xyz,
  drainPad: [-3.6, 4.05, 32.2] as Xyz,
  pumpRoof: [1.2, 3.35, 30.8] as Xyz,
  sluiceLip: [2.2, 3.15, 46.4] as Xyz,
  source: [2.4, 0.4, 50.2] as Xyz,

  spawnS05: [-10.4, 0, 8.6] as Xyz,
  demoStand: [-10.6, 0.7, 11.2] as Xyz,
  shade: [-13.4, 0, 13.6] as Xyz,
  cart: [-12.2, 0.35, 15.4] as Xyz,
  desk: [-8.2, 0.35, 16.8] as Xyz,

  spawnS06: [1.6, 3.15, 44.2] as Xyz,
  residuePipe: [-1.6, 4.1, 49] as Xyz,
  livePipe: [4.2, 4.1, 49] as Xyz,
  grate: [4.2, 3.7, 47.6] as Xyz,
  pressPipe: [1.4, 4.2, 47.2] as Xyz,
  latchHome: [-0.6, 3.45, 45.2] as Xyz,
  memorySlot: [2.4, 3.85, 51.2] as Xyz,
  roverStart: [2.4, 3.35, 45.6] as Xyz,
  roverEnd: [2.4, 3.35, 54.6] as Xyz,
  door: [2.4, 3.15, 52.4] as Xyz,
  evacCable: [6.4, 3.15, 44.8] as Xyz,
  unknownLock: [2.4, 4.2, 55.4] as Xyz,

  spawnS07: [-10.2, 0, 10.4] as Xyz,
  mapTable: [-10.4, 0.55, 13.2] as Xyz,
  modelFixed: [-14.2, 0.7, 16.4] as Xyz,
  modelKits: [-6.6, 0.45, 16.4] as Xyz,
  cityPlate: [-10.4, 0.85, 13.2] as Xyz,

  spawnS08: [0, 0, 4.2] as Xyz,
  failWall: [-6.2, 1.3, -7.5] as Xyz,
  stopBtn: [7.4, 0.9, 5.2] as Xyz,
  board: [8.6, 1.2, 4.2] as Xyz,
} as const;

export const C1_HIGH_PADS = [
  { id: "roof-market", at: C1_LAYOUT.roofMarket, occluded: true },
  { id: "crane", at: C1_LAYOUT.cranePad, occluded: false },
  { id: "drain", at: C1_LAYOUT.drainPad, occluded: true },
  { id: "pump-roof", at: C1_LAYOUT.pumpRoof, occluded: false },
  { id: "sluice-lip", at: C1_LAYOUT.sluiceLip, occluded: false },
] as const;

export const C1_PUBLIC_LAYERS = [
  { id: "fail", line: "C1-S07-D001" },
  { id: "controls", line: "C1-S07-D004" },
  { id: "zone", line: "C1-S07-D002" },
  { id: "route", line: "C1-S07-D002" },
  { id: "wait", line: "C1-S07-D003" },
] as const;

export const C1_SATURATE_DELAY = 58;
export const C1_OVERSTAY = 78;
export const C1_BROWNOUT = 7.5;
export const C1_WALL_POWER = 10;
