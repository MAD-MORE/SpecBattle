import { BattleResult, BattleRound, Phone, SPEC_KEYS, SpecKey } from "@/types/battle";

export function scoreRound(left: Phone, right: Phone, spec: SpecKey): BattleRound {
  const leftRaw = Number(left.specs[spec]);
  const rightRaw = Number(right.specs[spec]);
  const leftValid = Number.isFinite(leftRaw) && leftRaw >= 0;
  const rightValid = Number.isFinite(rightRaw) && rightRaw >= 0;
  const total = (leftValid ? leftRaw : 0) + (rightValid ? rightRaw : 0);
  const leftScore = total > 0 && leftValid ? Math.round((leftRaw / total) * 100) : 0;
  const rightScore = total > 0 && rightValid ? 100 - leftScore : 0;
  const winner = leftScore === rightScore ? "draw" : leftScore > rightScore ? "left" : "right";
  return { spec, leftScore, rightScore, winner };
}

export function runBattle(left: Phone, right: Phone): BattleResult {
  const rounds = SPEC_KEYS.map((spec) => scoreRound(left, right, spec));
  const leftTotal = rounds.reduce((sum, r) => sum + r.leftScore, 0);
  const rightTotal = rounds.reduce((sum, r) => sum + r.rightScore, 0);
  return { rounds, leftTotal, rightTotal, winner: leftTotal === rightTotal ? "draw" : leftTotal > rightTotal ? "left" : "right" };
}
