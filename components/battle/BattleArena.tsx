"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { runBattle } from "@/lib/scoring/battle-engine";
import { activeBattlePhones } from "@/lib/phones/active";
import { BATTLE_STAGES, ROUND_DURATION_MS } from "@/lib/battles/stages";

const labels = { performance: "Performance", camera: "Camera", display: "Display", battery: "Battery", storage: "Storage", connectivity: "Connectivity" } as const;
const icons = { performance: "⚡", camera: "📸", display: "◉", battery: "⌁", storage: "▣", connectivity: "⌁" } as const;

export default function BattleArena() {
  const result = useMemo(() => runBattle(...activeBattlePhones), []);
  const [index, setIndex] = useState(0);
  const stage = BATTLE_STAGES[index];
  useEffect(() => { const timer = window.setTimeout(() => setIndex((i) => (i + 1) % BATTLE_STAGES.length), ROUND_DURATION_MS); return () => window.clearTimeout(timer); }, [index]);
  const round = result.rounds.find((r) => r.spec === stage);
  const progress = (index / (BATTLE_STAGES.length - 1)) * 100;
  const title = stage === "battle-start" ? "BATTLE START" : stage === "final" ? "FINAL VERDICT" : labels[stage];
  const [left, right] = activeBattlePhones;
  return <main className="arena">
    <header><div className="brand">SPEC<span>BATTLE</span></div><div className="live"><i /> LIVE</div></header>
    <section className="combatants"><div className="combatant"><div className="phone-orb">{left.brand.slice(0,1)}</div><div><b>{left.name}</b><small>{left.brand}</small></div></div><div className="versus">VS</div><div className="combatant right"><div><b>{right.name}</b><small>{right.brand}</small></div><div className="phone-orb">{right.brand.slice(0,1)}</div></div></section>
    <section className="arena-stage"><AnimatePresence mode="wait">
      {stage === "final" ? <motion.div className="battle-card final-card" key="final" initial={{ opacity: 0, scale: .82, y: 35 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 1.08, y: -35 }}><div className="spec-icon">🏆</div><span className="round-label">FINAL VERDICT</span><h1>{result.winner === "draw" ? "DRAW" : `${result.winner === "left" ? left.name : right.name} WINS`}</h1><div className="final-score"><strong>{result.leftTotal}</strong><span>—</span><strong>{result.rightTotal}</strong></div></motion.div> : stage === "battle-start" ? <motion.div className="battle-card start-card" key="start" initial={{ opacity: 0, scale: .75 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.12 }}><div className="cross">⚔</div><span className="round-label">READY</span><h1>BATTLE START</h1><p>LET THE SPECS DECIDE</p></motion.div> : round ? <motion.div className="battle-card" key={stage} initial={{ opacity: 0, x: 260, rotate: 4, scale: .94 }} animate={{ opacity: 1, x: 0, rotate: 0, scale: 1 }} exit={{ opacity: 0, x: -260, rotate: -4, scale: .94 }} transition={{ type: "spring", stiffness: 180, damping: 20 }}><div className="spec-icon">{icons[stage]}</div><span className="round-label">SPEC ROUND</span><h1>{title}</h1><div className="duel-score"><div className={round.winner === "left" ? "champ" : ""}><strong>{round.leftScore}</strong><span>{left.name}</span></div><em>VS</em><div className={round.winner === "right" ? "champ" : ""}><strong>{round.rightScore}</strong><span>{right.name}</span></div></div><div className="round-result">{round.winner === "draw" ? "DRAW" : `${round.winner === "left" ? left.name : right.name} TAKES THE ROUND`}</div></motion.div> : null}
    </AnimatePresence></section>
    <footer><span>ROUND {Math.min(index, 6)} / 6</span><div className="progress"><motion.div animate={{ width: `${progress}%` }} /></div><span>{title.toUpperCase()}</span></footer>
  </main>;
}
