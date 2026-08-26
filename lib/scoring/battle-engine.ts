import { BattleResult, BattleRound, Phone, SPEC_KEYS, SpecKey } from "@/types/battle";

export function scoreRound(left: Phone, right: Phone, spec: SpecKey): BattleRound {
  const leftScore = left.specs[spec];
  const rightScore = right.specs[spec];
  return { spec, leftScore, rightScore, winner: leftScore === rightScore ? "draw" : leftScore > rightScore ? "left" : "right" };
}

export function runBattle(left: Phone, right: Phone): BattleResult {
  const rounds = SPEC_KEYS.map((spec) => scoreRound(left, right, spec));
  const valid = rounds.filter((r) => Number.isFinite(r.leftScore) && Number.isFinite(r.rightScore));
  const leftTotal = valid.reduce((sum, r) => sum + r.leftScore, 0);
  const rightTotal = valid.reduce((sum, r) => sum + r.rightScore, 0);
  return { rounds, leftTotal, rightTotal, winner: leftTotal === rightTotal ? "draw" : leftTotal > rightTotal ? "left" : "right" };
}
