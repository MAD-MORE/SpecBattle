export const SPEC_KEYS = ["performance", "camera", "display", "battery", "storage", "connectivity"] as const;
export type SpecKey = (typeof SPEC_KEYS)[number];

export type PhoneDetails = { hardware?: string; display?: string; camera?: string; battery?: string; storage?: string; connectivity?: string; modelNumbers?: string };
export type Phone = { id:string; name:string; brand:string; image?:string; specs:Record<SpecKey,number>; details?:PhoneDetails };
export type BattleRound = { spec:SpecKey; leftScore:number; rightScore:number; winner:"left"|"right"|"draw" };
export type BattleResult = { rounds:BattleRound[]; leftTotal:number; rightTotal:number; winner:"left"|"right"|"draw" };
export type BattleStage = "idle"|"ready"|"battle-start"|"round-1-intro"|"round-1-winner"|"round-2-intro"|"round-2-winner"|"round-3-intro"|"round-3-winner"|SpecKey|"final";
