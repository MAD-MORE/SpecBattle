"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import type { Phone } from "@/types/battle";

export default function PhoneVisual({ phone, side, winner = false, loser = false }: { phone: Phone; side: "left" | "right"; winner?: boolean; loser?: boolean }) {
  const [imageFailed, setImageFailed] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const label = `${phone.brand} ${phone.name}`.trim();

  useEffect(() => {
    if (!root.current) return;
    const node = root.current;
    gsap.killTweensOf(node);
    if (winner) {
      gsap.timeline()
        .to(node, { scale: 1.08, duration: 0.18 })
        .to(node, { x: side === "left" ? -8 : 8, rotation: side === "left" ? -2 : 2, duration: 0.08, repeat: 4, yoyo: true })
        .to(node, { x: 0, rotation: 0, scale: 1.02, duration: 0.2 });
    } else if (loser) {
      gsap.to(node, { scale: 0.94, opacity: 0.32, duration: 0.3 });
    } else {
      gsap.to(node, { scale: 1, opacity: 1, x: 0, rotation: 0, duration: 0.25 });
    }
    return () => { gsap.killTweensOf(node); };
  }, [winner, loser, side]);

  return (
    <div ref={root} className={`device-visual device-${side} ${winner ? "device-winner" : ""} ${loser ? "device-loser" : ""}`} aria-label={label || "Phone"}>
      <div className="device-glow" />
      <div className="device-shell">
        {phone.image && !imageFailed ? <img src={phone.image} alt={label || "Phone"} className="device-image" loading="eager" decoding="async" referrerPolicy="no-referrer" onError={() => setImageFailed(true)} /> : <div className="device-fallback" aria-label="Device image unavailable"><span>{side === "left" ? "A" : "B"}</span><small>{label || "DEVICE"}</small></div>}
      </div>
      {winner && <div className="device-win-ring" aria-hidden="true" />}
    </div>
  );
}
