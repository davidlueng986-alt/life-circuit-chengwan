/** Timing and persist notes from Life_Circuit_Chengwan_Full_Game_Script_v1. */

export const P00 = {
  fadeIn: 1.55,
  idleSeconds: 12,
  wrongLookSeconds: 3,
  sosPeriod: 3,
  sosOn: 0.35,
} as const;

export const P02 = {
  deadFade: 1,
  liveReveal: 2,
} as const;

export const P03 = {
  gapMeters: 1,
} as const;

export const P05 = {
  evacSeconds: 70,
  liftHold: 2.4,
  liftHoldAlt: 0.35,
} as const;

export const P06 = {
  titleHold: 2.8,
} as const;

export const PROLOGUE_PERSIST = [
  "prologueComplete",
  "hub.unlocked",
  "workshop.available",
  "relationships.xiaocen.rescued",
  "player.tool.flowLens",
  "player.tool.tether",
] as const;
