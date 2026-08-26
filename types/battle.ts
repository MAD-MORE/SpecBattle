export const SPEC_KEYS = ["performance", "camera", "display", "battery", "storage", "connectivity"] as const;
export type SpecKey = (typeof SPEC_KEYS)[number];

export type Phone = {
  id: string;
  name: string;
  brand: string;
  image?: string;
  specs: Record<SpecKey, number>;
};

export type BattleRound = {
  spec: SpecKey;
  leftScore: number;
  rightScore: number;
  winner: "left" | "right" | "draw";
};

export type BattleResult = {
  rounds: BattleRound[];
  leftTotal: number;
  rightTotal: number;
  winner: "left" | "right" | "draw";
};

export type BattleStage = "idle" | "ready" | "battle-start" | SpecKey | "final";
