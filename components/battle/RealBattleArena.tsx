"use client";

import { useEffect, useMemo, useState } from "react";
import { gsap } from "gsap";
import type { Phone, SpecKey } from "@/types/battle";
import { runBattle } from "@/lib/scoring/battle-engine";
import { collectDeviceProfile, type DeviceProfile } from "@/lib/device/device-profile";
import PhoneVisual from "./PhoneVisual";

const rounds: SpecKey[][] = [["performance", "camera"], ["display", "battery"], ["storage", "connectivity"]];
const meta: Record<SpecKey, { label: string; icon: string; detail: string }> = {
  performance: { label: "Performance", icon: "ϟ", detail: "Chipset · CPU · GPU" }, camera: { label: "Camera", icon: "◉", detail: "Sensors · OIS · Zoom · Video" }, display: { label: "Display", icon: "▣", detail: "Panel · Resolution · Refresh rate" }, battery: { label: "Battery", icon: "⌁", detail: "Capacity · Charging" }, storage: { label: "Storage", icon: "▤", detail: "Capacity · Storage type" }, connectivity: { label: "Connectivity", icon: "⌁", detail: "5G · Wi-Fi · Bluetooth · NFC · USB" }
};
const keys: SpecKey[] = ["performance", "camera", "display", "battery", "storage", "connectivity"];
async function lookup(params: string) { const r = await fetch(`/api/device-specs?${params}`, { cache: "no-store" }); const d = await r.json(); if (!r.ok) throw new Error(d.error || "Device not found"); return d.device as Phone; }
const pct = (n: number) => Math.round(n);

export default function RealBattleArena() {
  const [profile, setProfile] = useState<DeviceProfile | null>(null), [me, setMe] = useState<Phone | null>(null), [opp, setOpp] = useState<Phone | null>(null), [query, setQuery] = useState("Samsung Galaxy S25 Ultra"), [loading, setLoading] = useState(true), [error, setError] = useState(""), [stage, setStage] = useState(-1), [phase, setPhase] = useState<"show" | "winner">("show");
  useEffect(() => { collectDeviceProfile().then(async p => { setProfile(p); if (p.model) try { setMe(await lookup(`model=${encodeURIComponent(p.model)}`)); } catch (e) { setError(e instanceof Error ? e.message : "Unable to resolve your device"); } else setError("Your browser did not expose a device model."); }).finally(() => setLoading(false)); }, []);
  const result = useMemo(() => me && opp ? runBattle(me, opp) : null, [me, opp]);
  const sequence = ["r1", "performance", "performance-w", "camera", "camera-w", "r1-w", "r2", "display", "battery", "r2-w", "r3", "storage", "connectivity", "r3-w", "final"] as const;
  const key = sequence[Math.max(0, stage)];
  const spec = key && keys.includes(key.replace("-w", "") as SpecKey) ? key.replace("-w", "") as SpecKey : null;
  const current = spec && result ? result.rounds.find(r => r.spec === spec) : null;
  useEffect(() => { if (stage < 0 || !result) return; setPhase(key?.endsWith("-w") ? "winner" : "show"); const t = setTimeout(() => setStage(s => s + 1), key?.endsWith("-w") ? 1700 : key?.startsWith("r") ? 1500 : 3300); return () => clearTimeout(t); }, [stage, result, key]);
  useEffect(() => { if (!key) return; const els = document.querySelectorAll<HTMLElement>(".spec-panel > *, .round-intro > *, .round-verdict > *, .verdict > *"); const ctx = gsap.context(() => { gsap.fromTo(els, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: .5, stagger: .06, ease: "power3.out" }); }); return () => ctx.revert(); }, [key]);
  async function start() { setError(""); setLoading(true); try { const p = await lookup(`name=${encodeURIComponent(query)}`); setOpp(p); if (!me) throw new Error("Your device could not be identified yet."); setStage(0); } catch (e) { setError(e instanceof Error ? e.message : "Unable to start battle"); } finally { setLoading(false); } }
  const winnerSide = current?.winner === "left" ? "left" : current?.winner === "right" ? "right" : null;
  const roundNo = spec ? rounds.findIndex(r => r.includes(spec)) + 1 : key?.startsWith("r") ? Number(key[1]) : 3;
  const finalWinner = result?.winner === "left" ? "left" : result?.winner === "right" ? "right" : null;
  const flawless = result?.victoryType === "flawless";
  const fallback = (side: "left" | "right"): Phone => ({ id: side, name: side === "left" ? "Your Phone" : "Opponent", brand: "", specs: { performance: 0, camera: 0, display: 0, battery: 0, storage: 0, connectivity: 0 } });
  return <main className="real-arena"><div className="noise"/><header className="real-header"><div className="real-logo">SPEC<span>BATTLE</span></div><div className="status"><i/> LIVE COMPARISON</div></header>
    <div className="battle-controls"><div className="device-chip"><span>YOU</span><b>{me ? `${me.brand} ${me.name}` : profile?.model || "Detecting device…"}</b></div><div className="versus-mark">VS</div><div className="opponent-input"><input aria-label="Opponent phone" value={query} onChange={e => { setQuery(e.target.value); setStage(-1); }} /><button onClick={start} disabled={loading || !query.trim()}>{loading ? "…" : "START BATTLE"}</button></div></div>
    <section className="real-stage"><div className={`side-device left ${winnerSide === "left" ? "is-winner" : ""} ${winnerSide === "right" ? "is-loser" : ""}`}><PhoneVisual phone={me || fallback("left")} side="left" winner={winnerSide === "left" && phase === "winner"} loser={winnerSide === "right" && phase === "winner"}/><strong>{me?.name || "YOUR DEVICE"}</strong></div>
      <div className="center-stage" key={key || "idle"}>
        {key === "final" && result ? <div className={`verdict ${flawless ? "flawless" : ""}`}><span className="eyebrow">FINAL VERDICT</span><h1>{flawless ? "FLAWLESS VICTORY" : finalWinner ? `${finalWinner === "left" ? me?.name : opp?.name} WINS` : "DRAW"}</h1><div className="final-numbers"><b>{flawless && finalWinner === "left" ? 100 : pct(result.leftTotal / 6)}<small>/100</small></b><em>—</em><b>{flawless && finalWinner === "right" ? 100 : pct(result.rightTotal / 6)}<small>/100</small></b></div><p>{flawless ? "6/6 CATEGORIES · 3/3 ROUNDS" : "OVERALL SCORE · 3 ROUNDS"}</p></div> : key?.startsWith("r") && key.endsWith("-w") && result ? <div className="round-verdict"><span className="eyebrow">ROUND {key[1]} COMPLETE</span><h1>{(() => { const rs = result.rounds.filter(r => rounds[Number(key[1]) - 1].includes(r.spec)); const l = rs.filter(r => r.winner === "left").length; const rr = rs.filter(r => r.winner === "right").length; return l === rr ? "DRAW" : l > rr ? me?.name : opp?.name; })()}</h1><p>ROUND WINNER</p></div> : key?.startsWith("r") ? <div className="round-intro"><span className="eyebrow">THE BATTLE CONTINUES</span><h1>ROUND {key[1]}</h1><p>{rounds[Number(key[1]) - 1].map(s => meta[s].label).join(" · ")}</p></div> : current && spec ? <div className="spec-panel"><span className="eyebrow">ROUND {roundNo} · {meta[spec].label.toUpperCase()}</span><div className="spec-title"><span>{meta[spec].icon}</span><h1>{meta[spec].label}</h1></div><p className="spec-sub">{meta[spec].detail}</p><div className="score-grid"><div className={winnerSide === "left" ? "lead" : ""}><b>{current.leftScore}%</b><span>{me?.name}</span><small>{current.leftScore} POINTS</small></div><em>VS</em><div className={winnerSide === "right" ? "lead" : ""}><b>{current.rightScore}%</b><span>{opp?.name}</span><small>{current.rightScore} POINTS</small></div></div><div className="hardware-grid"><div><small>{me?.name}</small><p>{me?.details?.[spec] || "Hardware information unavailable"}</p></div><div><small>{opp?.name}</small><p>{opp?.details?.[spec] || "Hardware information unavailable"}</p></div></div><div className="result-line">{phase === "show" ? "ANALYZING HARDWARE…" : current.winner === "draw" ? "DRAW" : `${current.winner === "left" ? me?.name : opp?.name} WINS ${meta[spec].label.toUpperCase()}`}</div></div> : <div className="idle"><span className="eyebrow">PHONE VS PHONE</span><h1>READY?</h1><p>Choose an opponent and start the comparison.</p></div>}
      </div>
      <div className={`side-device right ${winnerSide === "right" ? "is-winner" : ""} ${winnerSide === "left" ? "is-loser" : ""}`}><PhoneVisual phone={opp || fallback("right")} side="right" winner={winnerSide === "right" && phase === "winner"} loser={winnerSide === "left" && phase === "winner"}/><strong>{opp?.name || "OPPONENT"}</strong></div></section>
    <footer className="real-footer"><span>ROUND {roundNo} / 3</span><div className="track"><div style={{ width: `${stage < 0 ? 0 : (stage / (sequence.length - 1)) * 100}%` }}/></div><span>{key === "final" ? "FINAL VERDICT" : spec ? meta[spec].label.toUpperCase() : "READY"}</span></footer>{error && <div className="toast">{error}</div>}
  </main>;
}
