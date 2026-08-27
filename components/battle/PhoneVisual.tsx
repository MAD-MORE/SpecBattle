"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { Phone } from "@/types/battle";

export default function PhoneVisual({
  phone,
  side,
  winner = false,
  loser = false,
}: {
  phone: Phone;
  side: "left" | "right";
  winner?: boolean;
  loser?: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const label = `${phone.brand} ${phone.name}`.trim();

  return (
    <motion.div
      className={`device-visual device-${side} ${winner ? "device-winner" : ""} ${loser ? "device-loser" : ""}`}
      animate={
        winner
          ? {
              y: [0, -8, 0],
              rotate: side === "left" ? [0, -1.5, 1.5, 0] : [0, 1.5, -1.5, 0],
              scale: [1, 1.035, 1],
            }
          : loser
            ? { scale: 0.96 }
            : { y: [0, -3, 0] }
      }
      transition={
        winner
          ? { duration: 0.65, ease: "easeInOut" }
          : { duration: 3.8, repeat: Infinity, ease: "easeInOut" }
      }
      aria-label={label || "Phone"}
    >
      <div className="device-glow" />
      <div className="device-shell">
        {phone.image && !imageFailed ? (
          <img
            src={phone.image}
            alt={label || "Phone"}
            className="device-image"
            loading="eager"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="device-fallback" aria-label="Device image unavailable">
            <span>{side === "left" ? "A" : "B"}</span>
            <small>{label || "DEVICE"}</small>
          </div>
        )}
      </div>
      {winner && <div className="device-win-ring" aria-hidden="true" />}
    </motion.div>
  );
}
