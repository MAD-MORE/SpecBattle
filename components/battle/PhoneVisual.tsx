"use client";
import { motion } from "framer-motion";
import type { Phone } from "@/types/battle";

export default function PhoneVisual({ phone, side, winner=false, loser=false }: { phone: Phone; side: "left"|"right"; winner?: boolean; loser?: boolean }) {
  return (
    <motion.div className={`device-visual device-${side} ${winner ? "device-winner" : ""} ${loser ? "device-loser" : ""}`}
      animate={winner ? { y:[0,-8,0], rotate: side === "left" ? [0,-1.5,1.5,0] : [0,1.5,-1.5,0] } : {}}
      transition={{ duration: .65, ease: "easeInOut" }}>
      <div className="device-glow" />
      <div className="device-shell">
        {phone.image ? <img src={phone.image} alt={`${phone.brand} ${phone.name}`} className="device-image" /> : <div className="device-fallback">{side === "left" ? "A" : "B"}</div>}
      </div>
      {winner && <div className="device-win-ring" aria-hidden="true" />}
    </motion.div>
  );
}
