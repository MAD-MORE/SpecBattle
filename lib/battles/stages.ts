import { SPEC_KEYS } from "@/types/battle";
import type { BattleStage } from "@/types/battle";

export const BATTLE_STAGES: BattleStage[] = ["battle-start", ...SPEC_KEYS, "final"];
export const ROUND_DURATION_MS = 2200;
