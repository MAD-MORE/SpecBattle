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

function roundWinner(rounds: BattleRound[], roundNo: 1 | 2 | 3): "left" | "right" | "draw" {
  const specsByRound = [
    ["performance", "camera"],
    ["display", "battery"],
    ["storage", "connectivity"],
  ] as const;
  const specs = specsByRound[roundNo - 1];
  const wins = specs.map((spec) => rounds.find((round) => round.spec === spec)?.winner ?? "draw");
  const left = wins.filter((winner) => winner === "left").length;
  const right = wins.filter((winner) => winner === "right").length;
  return left === right ? "draw" : left > right ? "left" : "right";
}

export function runBattle(left: Phone, right: Phone): BattleResult {
  const rounds = SPEC_KEYS.map((spec) => scoreRound(left, right, spec));
  const leftTotal = rounds.reduce((sum, r) => sum + r.leftScore, 0);
  const rightTotal = rounds.reduce((sum, r) => sum + r.rightScore, 0);
  const leftCategoryWins = rounds.filter((r) => r.winner === "left").length;
  const rightCategoryWins = rounds.filter((r) => r.winner === "right").length;
  const roundWinners = ([1, 2, 3] as const).map((round) => roundWinner(rounds, round));
  const leftRoundWins = roundWinners.filter((winner) => winner === "left").length;
  const rightRoundWins = roundWinners.filter((winner) => winner === "right").length;
  const winner = leftTotal === rightTotal ? "draw" : leftTotal > rightTotal ? "left" : "right";

  // Flawless means a device won every one of the six categories and all three rounds.
  // This is deliberately stricter than simply having the highest aggregate score.
  const flawless = leftCategoryWins === SPEC_KEYS.length && leftRoundWins === 3
    ? "left"
    : rightCategoryWins === SPEC_KEYS.length && rightRoundWins === 3
      ? "right"
      : null;

  const winningTotal = Math.max(leftTotal, rightTotal);
  const losingTotal = Math.min(leftTotal, rightTotal);
  const scoreGap = winningTotal - losingTotal;
  const victoryType = flawless
    ? "flawless"
    : winner === "draw"
      ? "draw"
      : scoreGap >= 120
        ? "clear"
        : scoreGap <= 24
          ? "close"
          : "victory";

  return {
    rounds,
    leftTotal,
    rightTotal,
    winner,
    leftCategoryWins,
    rightCategoryWins,
    leftRoundWins,
    rightRoundWins,
    victoryType,
  };
}
