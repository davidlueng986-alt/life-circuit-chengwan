/** Greybox metres. Facing +Z (camera yaw = π) so Gate 3 sits in the default frame. */

export const P00_LAYOUT = {
  spawn: { x: 0, y: 0, z: 0, yaw: Math.PI },
  indoorDoor: { x: 6.35, y: 0, z: 0 },
  indoorRoom: { x: 8.6, z: 0 },
  spineX: -1.45,
  pipeZ: 8.2,
  glassZ: 14.4,
  lift: { x: -1.45, z: 22.4 },
  gate: { x: -8.2, y: 12.2, z: 34 },
  sos: { x: -7.1, y: -2.7, z: 31.6 },
  xiaocen: { x: -6.4, y: -2.35, z: 31.2 },
} as const;

export const P01_LAYOUT = {
  spawn: { x: 0, y: 0, z: -3.1, yaw: Math.PI },
  liftCage: { x: -2.5, z: -1.8 },
  crate: { x: 3.22, y: 0.42, z: 1.35 },
  cratePark: { x: 4.55, y: 0.42, z: 3.15 },
  ladder: { x: 3.35, z: 1.35 },
  booth: { x: 3.35, y: 2.55, z: 2.55 },
} as const;

export const P02_LAYOUT = {
  spawn: { x: -0.35, y: 0, z: 4.7, yaw: 0.08 },
  desk: { x: 0, z: 2.05 },
  wallZ: -5.15,
  deadY: 2.38,
  liveY: 1.52,
  dummyY: 0.72,
  panel: { x: 1.55, z: -4.12 },
  relay: { x: 3.15, y: 1.52, z: -3.35 },
  lock: { x: 3.45, y: 1.52, z: -3.45 },
} as const;

export const P03_LAYOUT = {
  spawn: { x: 0, y: 0, z: 4.5, yaw: 0 },
  holster: { x: -2.25, y: 1.05, z: 2.15 },
  plateA: { x: 2.45, y: 0.38, z: 2.55 },
  plateB: { x: 2.45, y: 0.4, z: 3.45 },
  seatA: { x: -0.52, y: 0.12, z: 0 },
  seatB: { x: 0.52, y: 0.12, z: 0 },
  farLip: { z: -2.6 },
} as const;

export const P04_LAYOUT = {
  spawn: { x: 0, y: 0, z: 5.1, yaw: 0 },
  jam: { x: -2.2, y: 0.55, z: -3.85 },
  debris: { x: -2.2, y: 0.48, z: -4.45 },
  wrongHome: { x: 3.45, y: 0.72, z: -4.25 },
  actWrong: { x: 2.15, y: 0.72, z: -4.55 },
  actJam: { x: -2.2, y: 0.72, z: -4.55 },
  loose: { x: 0.15, y: 2.45, z: -3.15 },
  actLoose: { x: 0, y: 1.45, z: -4.55 },
  gate: { x: 0, y: 6.4, z: -18 },
  deck: { x: 3.4, y: -1.8, z: -14.5 },
} as const;

export const P05_LAYOUT = {
  spawn: { x: 0, y: 0, z: 9.2, yaw: 0 },
  corridorMouth: { x: 3.15, y: 0, z: 6.4 },
  lever: { x: 3.25, y: 0.22, z: 1.15 },
  leverSeat: { x: 3.55, y: 1.05, z: -3.15 },
  door: { x: 3.15, z: -3.15 },
  lift: { x: 3.15, z: -10.2 },
  xiaocen: { x: 3.15, y: -2.4, z: -10.2 },
} as const;

export const P06_LAYOUT = {
  spawn: { x: 0, y: 0, z: 2.4, yaw: 0 },
} as const;
