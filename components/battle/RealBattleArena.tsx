"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import type { Phone, SpecKey } from "@/types/battle";
import { runBattle } from "@/lib/scoring/battle-engine";
import { collectDeviceProfile, type DeviceProfile } from "@/lib/device/device-profile";
import PhoneVisual from "./PhoneVisual";

const rounds: SpecKey[][] = [["performance", "camera"], ["display", "battery"], ["storage", "connectivity"]];
const meta: Record<SpecKey, { label: string; icon: string; detail: string }> = {
  performance: { label: "Performance", icon: "ϟ", detail: "Chipset · CPU · GPU · sustained performance" },
  camera: { label: "Camera", icon: "◉", detail: "Sensors · OIS · zoom · video" },
  display: { label: "Display", icon: "▣", detail: "Panel · resolution · refresh rate" },
  battery: { label: "Battery", icon: "⌁", detail: "Capacity · charging · endurance" },
  storage: { label: "Storage", icon: "▤", detail: "Capacity · storage type · speed" },
  connectivity: { label: "Connectivity", icon: "⌁", detail: "5G · Wi-Fi · Bluetooth · NFC · USB" },
};

const sequence = [
  "r1", "performance", "performance-w", "camera", "camera-w", "r1-w",
  "r2", "display", "battery", "r2-w", "r3", "storage", "connectivity", "r3-w", "final",
] as const;

type StageKey = (typeof sequence)[number];

async function lookup(params: string) {
  const response = await fetch(`/api/device-specs?${params}`, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Device not found");
  return data.device as Phone;
}

function score100(total: number) { return Math.round(total / 6); }
function roundWinner(result: NonNullable<ReturnType<typeof runBattle>>, roundNo: number) {
  const rs = result.rounds.filter((r) => rounds[roundNo - 1]?.includes(r.spec));
  const left = rs.filter((r) => r.winner === "left").length;
  const right = rs.filter((r) => r.winner === "right").length;
  return left === right ? "draw" : left > right ? "left" : "right";
}

export default function RealBattleArena() {
  const [profile, setProfile] = useState<DeviceProfile | null>(null);
  const [me, setMe] = useState<Phone | null>(null);
  const [opponent, setOpponent] = useState<Phone | null>(null);
  const [query, setQuery] = useState("Samsung Galaxy S25 Ultra");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(-1);
  const [phase, setPhase] = useState<"reveal" | "verdict">("reveal");
  const centerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    collectDeviceProfile()
      .then(async (p) => {
        setProfile(p);
        if (!p.model) {
          setError("Your browser did not expose a device model. You can still choose an opponent after device detection.");
          return;
        }
        try { setMe(await lookup(`model=${encodeURIComponent(p.model)}`)); }
        catch (e) { setError(e instanceof Error ? e.message : "Unable to resolve your device"); }
      })
      .finally(() => setBusy(false));
  }, []);

  const result = useMemo(() => (me && opponent ? runBattle(me, opponent) : null), [me, opponent]);
  const stage = (index < 0 ? "idle" : sequence[Math.min(index, sequence.length - 1)]) as StageKey | "idle";
  const spec = stage !== "idle" && !stage.endsWith("-w") && !stage.startsWith("r") && stage !== "final" ? stage as SpecKey : null;
  const activeRound = spec && result ? result.rounds.find((r) => r.spec === spec) : null;
  const roundNo = spec ? rounds.findIndex((r) => r.includes(spec)) + 1 : stage.startsWith("r") ? Number(stage[1]) : 3;
  const finalWinner = result?.winner === "left" ? "left" : result?.winner === "right" ? "right" : "draw";
  const flawless = result?.victoryType === "flawless";
  const leftName = me ? `${me.brand} ${me.name}`.trim() : profile?.model || "Your phone";
  const rightName = opponent ? `${opponent.brand} ${opponent.name}`.trim() : "Opponent";
  const winnerSide = activeRound?.winner === "left" || activeRound?.winner === "right" ? activeRound.winner : null;

  useEffect(() => {
    if (!playing || !result) return;
    if (stage.startsWith("r")) {
      setPhase("reveal");
      const t = window.setTimeout(() => setIndex((v) => v + 1), stage.endsWith("-w") ? 1700 : 1600);
      return () => window.clearTimeout(t);
    }
    if (stage === "final") return;
    if (!spec) return;
    setPhase("reveal");
    const verdictTimer = window.setTimeout(() => setPhase("verdict"), 2500);
    const nextTimer = window.setTimeout(() => setIndex((v) => v + 1), 5200);
    return () => { window.clearTimeout(verdictTimer); window.clearTimeout(nextTimer); };
  }, [playing, result, stage, spec]);

  useEffect(() => {
    if (!centerRef.current || stage === "idle") return;
    const ctx = gsap.context(() => {
      const content = centerRef.current?.querySelectorAll<HTMLElement>("[data-animate]");
      if (content?.length) gsap.fromTo(content, { opacity: 0, y: 24, scale: .98 }, { opacity: 1, y: 0, scale: 1, duration: .55, stagger: .06, ease: "power3.out" });
      if (stage.startsWith("r") && !stage.endsWith("-w")) gsap.fromTo(centerRef.current, { scale: .7, opacity: 0, rotation: -2 }, { scale: 1, opacity: 1, rotation: 0, duration: .7, ease: "back.out(1.5)" });
      if (stage.endsWith("-w")) gsap.fromTo(centerRef.current, { scale: .9, opacity: 0 }, { scale: 1, opacity: 1, duration: .65, ease: "back.out(1.35)" });
    }, centerRef);
    return () => ctx.revert();
  }, [stage]);

  async function startBattle() {
    if (!me || !query.trim()) return;
    setError(""); setBusy(true); setPhase("reveal");
    try { const found = opponent?.name === query ? opponent : await lookup(`name=${encodeURIComponent(query.trim())}`); setOpponent(found); setIndex(0); setPlaying(true); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load opponent"); }
    finally { setBusy(false); }
  }

  const progress = index < 0 ? 0 : Math.min(100, (index / (sequence.length - 1)) * 100);
  const fallback = (side: "left" | "right"): Phone => ({ id: side, name: side === "left" ? "Your Phone" : "Opponent", brand: "", specs: { performance: 0, camera: 0, display: 0, battery: 0, storage: 0, connectivity: 0 } });
  const leftPhone = me || fallback("left");
  const rightPhone = opponent || fallback("right");

  return <main className="battle-ui">
    <header className="battle-header">
      <div className="brand-lockup"><strong>SPEC</strong><span>BATTLE</span></div>
      <div className="live-state"><i /> {busy ? "SCANNING DEVICE" : "LIVE BATTLE"}</div>
    </header>

    <section className="battle-command" data-animate>
      <div className="device-pill"><small>YOU</small><strong>{leftName}</strong></div>
      <div className="versus-mark">VS</div>
      <div className="opponent-picker">
        <input value={query} onChange={(e) => { setQuery(e.target.value); setPlaying(false); setIndex(-1); }} aria-label="Opponent phone model" placeholder="Choose an opponent phone" />
        <button onClick={startBattle} disabled={busy || !me || !query.trim()}>{busy ? "LOADING" : "START BATTLE"}</button>
      </div>
    </section>

    <section className="battle-arena">
      <div className={`phone-side left ${winnerSide === "left" && phase === "verdict" ? "win" : ""} ${winnerSide === "right" && phase === "verdict" ? "lose" : ""}`}>
        <PhoneVisual phone={leftPhone} side="left" winner={winnerSide === "left" && phase === "verdict"} loser={winnerSide === "right" && phase === "verdict"} />
        <div className="phone-name">{leftName}</div>
      </div>

      <div ref={centerRef} className="battle-center">
        {stage === "idle" && <div className="center-card ready-card"><span className="micro" data-animate>{me ? "DEVICE READY" : "DEVICE SCAN"}</span><h1 data-animate>{me ? "READY TO BATTLE" : "READING YOUR PHONE"}</h1><p data-animate>{me ? "Choose an opponent. Every category will show its hardware evidence and score." : "Allow device detection, then choose an opponent."}</p></div>}

        {stage.startsWith("r") && !stage.endsWith("-w") && <div className="center-card round-card">
          <span className="micro" data-animate>THE BATTLE CONTINUES</span>
          <h1 data-animate>ROUND {stage[1]}</h1>
          <p data-animate>{rounds[Number(stage[1]) - 1].map((s) => meta[s].label.toUpperCase()).join("  ·  ")}</p>
          <div className="round-number" data-animate>0{stage[1]}</div>
        </div>}

        {stage.endsWith("-w") && result && <div className="center-card round-result-card">
          <span className="micro" data-animate>ROUND {stage[1]} COMPLETE</span>
          <h1 data-animate>{(() => { const w = roundWinner(result, Number(stage[1])); return w === "draw" ? "DRAW" : w === "left" ? leftName : rightName; })()}</h1>
          <div className="winner-label" data-animate>{(() => { const w = roundWinner(result, Number(stage[1])); return w === "draw" ? "ROUND TIED" : `WINS ROUND ${stage[1]}`; })()}</div>
          <p data-animate>{(() => { const w = roundWinner(result, Number(stage[1])); return w === "draw" ? "Both phones won one category." : "Both categories in this round belong to the same phone."; })()}</p>
        </div>}

        {activeRound && spec && <div className={`center-card spec-card ${phase === "verdict" ? "show-verdict" : ""}`}>
          <div className="spec-head" data-animate><span className="spec-icon">{meta[spec].icon}</span><div><span className="micro">ROUND {roundNo}  ·  {meta[spec].label.toUpperCase()}</span><h1>{meta[spec].label}</h1></div></div>
          <p className="spec-detail" data-animate>{meta[spec].detail}</p>
          <div className="score-duel" data-animate>
            <div className={activeRound.winner === "left" ? "leading" : ""}><strong>{activeRound.leftScore}%</strong><span>{leftName}</span><small>{activeRound.leftScore} POINTS</small></div>
            <em>VS</em>
            <div className={activeRound.winner === "right" ? "leading" : ""}><strong>{activeRound.rightScore}%</strong><span>{rightName}</span><small>{activeRound.rightScore} POINTS</small></div>
          </div>
          <div className="evidence-grid" data-animate>
            <div><small>{leftName}</small><strong>{leftPhone.details?.[spec] || "Hardware specification available from device data."}</strong></div>
            <div><small>{rightName}</small><strong>{rightPhone.details?.[spec] || "Hardware specification available from device data."}</strong></div>
          </div>
          <div className="result-banner" data-animate>{phase === "reveal" ? "ANALYZING HARDWARE" : activeRound.winner === "draw" ? "DRAW" : `${activeRound.winner === "left" ? leftName : rightName} WINS ${meta[spec].label.toUpperCase()}`}</div>
        </div>}

        {stage === "final" && result && <div className={`center-card final-card ${flawless ? "flawless" : ""}`}>
          <span className="micro" data-animate>FINAL VERDICT</span>
          <h1 data-animate>{flawless ? "FLAWLESS VICTORY" : finalWinner === "draw" ? "DRAW" : `${finalWinner === "left" ? leftName : rightName} WINS`}</h1>
          {flawless && <div className="winner-label" data-animate>{finalWinner === "left" ? leftName : rightName} WON ALL 6 CATEGORIES</div>}
          <div className="final-score" data-animate><strong>{flawless && finalWinner === "left" ? 100 : score100(result.leftTotal)}<small>/100</small></strong><span>—</span><strong>{flawless && finalWinner === "right" ? 100 : score100(result.rightTotal)}<small>/100</small></strong></div>
          <div className="final-rounds" data-animate>{([1,2,3] as const).map((n) => { const w = roundWinner(result, n); const rs = result.rounds.filter((r) => getRoundForSpec(r.spec) === n); return <div key={n}><span>ROUND {n}</span><strong>{Math.round(rs.reduce((s, r) => s + r.leftScore, 0) / 2)}%  —  {Math.round(rs.reduce((s, r) => s + r.rightScore, 0) / 2)}%</strong><em>{w === "draw" ? "DRAW" : w === "left" ? leftName : rightName}</em></div>; })}</div>
        </div>}
      </div>

      <div className={`phone-side right ${winnerSide === "right" && phase === "verdict" ? "win" : ""} ${winnerSide === "left" && phase === "verdict" ? "lose" : ""}`}>
        <PhoneVisual phone={rightPhone} side="right" winner={winnerSide === "right" && phase === "verdict"} loser={winnerSide === "left" && phase === "verdict"} />
        <div className="phone-name">{rightName}</div>
      </div>
    </section>

    <footer className="battle-footer"><span>ROUND {roundNo} / 3</span><div className="progress-line"><div style={{ width: `${progress}%` }} /></div><span>{spec ? meta[spec].label.toUpperCase() : stage === "final" ? "FINAL VERDICT" : "READY"}</span></footer>
    {error && <div className="battle-error">{error}</div>}
  </main>;
}

function getRoundForSpec(spec: SpecKey) { return rounds.findIndex((r) => r.includes(spec)) + 1; }
