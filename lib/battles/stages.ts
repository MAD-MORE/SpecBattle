import { SPEC_KEYS, type SpecKey } from "@/types/battle";
import type { BattleStage } from "@/types/battle";

export const BATTLE_STAGES: BattleStage[] = [
  "round-1-intro", "performance", "camera", "round-1-winner",
  "round-2-intro", "display", "battery", "round-2-winner",
  "round-3-intro", "storage", "connectivity", "round-3-winner", "final",
];
export const ROUND_DURATION_MS = 2200;
export const ROUND_INTRO_DURATION_MS = 1900;
export const ROUND_WINNER_DURATION_MS = 3200;

export const BATTLE_ROUNDS: readonly SpecKey[][] = [
  ["performance", "camera"],
  ["display", "battery"],
  ["storage", "connectivity"],
];

export function getBattleRound(spec: SpecKey): number {
  return BATTLE_ROUNDS.findIndex((round) => round.includes(spec)) + 1;
}

export function isRoundIntro(stage: BattleStage): boolean {
  return stage.endsWith("-intro");
}

export function isRoundWinner(stage: BattleStage): boolean {
  return stage.endsWith("-winner");
}

export function getRoundNumber(stage: BattleStage): number {
  const match = stage.match(/round-(\d)-/);
  return match ? Number(match[1]) : 0;
}
