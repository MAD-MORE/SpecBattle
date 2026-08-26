"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { runBattle } from "@/lib/scoring/battle-engine";
import { demoPhones } from "@/lib/phones/demo";
import type { BattleStage } from "@/types/battle";

const labels = { performance: "Performance", camera: "Camera", display: "Display", battery: "Battery", storage: "Storage", connectivity: "Connectivity" } as const;
const icons = { performance: "⚡", camera: "📸", display: "🖥️", battery: "🔋", storage: "💾", connectivity: "🌐" } as const;

export default function BattleArena() {
  const result = useMemo(() => runBattle(...demoPhones), []);
  const [stageIndex, setStageIndex] = useState(-1);
  const stages: BattleStage[] = ["battle-start", ...result.rounds.map((r) => r.spec), "final"];

  useEffect(() => {
    const timer = window.setInterval(() => setStageIndex((i) => Math.min(i + 1, stages.length - 1)), 2200);
    return () => window.clearInterval(timer);
  }, [stages.length]);

  const stage = stages[Math.max(0, stageIndex)];
  const round = result.rounds.find((r) => r.spec === stage);
  const isFinal = stage === "final";

  return (
    <main className="arena">
      <header><span className="brand">SPEC<span>BATTLE</span></span><span className="status">LIVE BATTLE</span></header>
      <section className="phones"><div className="phone left"><b>{demoPhones[0].name}</b><span>{demoPhones[0].brand}</span></div><div className="vs">VS</div><div className="phone right"><b>{demoPhones[1].name}</b><span>{demoPhones[1].brand}</span></div></section>
      <section className="stage-wrap">
        <AnimatePresence mode="wait">
          {stageIndex < 0 ? <motion.div className="intro" key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>TAP INTO THE BATTLE</motion.div> : isFinal ? (
            <motion.div className="card final" key="final" initial={{ scale: .7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}><div className="icon">🏆</div><h1>{result.winner === "draw" ? "DRAW" : `${result.winner === "left" ? demoPhones[0].name : demoPhones[1].name} WINS`}</h1><div className="totals"><strong>{result.leftTotal}</strong><span>—</span><strong>{result.rightTotal}</strong></div></motion.div>
          ) : stage === "battle-start" ? <motion.div className="card start" key="start" initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -80, opacity: 0 }}><div className="icon">⚔️</div><h1>BATTLE START</h1></motion.div> : round ? (
            <motion.div className="card" key={round.spec} initial={{ x: 240, opacity: 0, rotate: 3 }} animate={{ x: 0, opacity: 1, rotate: 0 }} exit={{ x: -240, opacity: 0, rotate: -3 }} transition={{ type: "spring", stiffness: 160, damping: 18 }}>
              <div className="icon">{icons[round.spec]}</div><p className="eyebrow">SPEC ROUND</p><h1>{labels[round.spec]}</h1><div className="scores"><div><b>{round.leftScore}</b><span>{demoPhones[0].name}</span></div><div className="strike">VS</div><div><b>{round.rightScore}</b><span>{demoPhones[1].name}</span></div></div><div className={`winner ${round.winner}`}>{round.winner === "draw" ? "DRAW" : `${round.winner === "left" ? demoPhones[0].name : demoPhones[1].name} TAKES THE ROUND`}</div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>
      <footer><span>ROUND {Math.max(0, stageIndex)}/{stages.length - 2}</span><div className="progress"><motion.div animate={{ width: `${Math.max(0, stageIndex) / (stages.length - 1) * 100}%` }} /></div></footer>
    </main>
  );
}
