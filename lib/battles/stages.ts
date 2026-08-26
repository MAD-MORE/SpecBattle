import { SPEC_KEYS, type SpecKey } from "@/types/battle";
import type { BattleStage } from "@/types/battle";

export const BATTLE_STAGES: BattleStage[] = ["battle-start", ...SPEC_KEYS, "final"];
export const ROUND_DURATION_MS = 2200;

// Three rounds, two categories each.
// Round 1: Performance + Camera
// Round 2: Display + Battery
// Round 3: Storage + Connectivity
export const BATTLE_ROUNDS: readonly SpecKey[][] = [
  ["performance", "camera"],
  ["display", "battery"],
  ["storage", "connectivity"],
];

export function getBattleRound(spec: SpecKey): number {
  return BATTLE_ROUNDS.findIndex((round) => round.includes(spec)) + 1;
}
