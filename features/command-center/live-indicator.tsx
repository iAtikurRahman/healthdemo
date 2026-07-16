"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function LiveIndicator({ intervalSeconds = 30 }: { intervalSeconds?: number }) {
  const [secondsLeft, setSecondsLeft] = useState(intervalSeconds);

  useEffect(() => {
    const t = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? intervalSeconds : s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [intervalSeconds]);

  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white">
      <motion.span
        className="size-2 rounded-full bg-[var(--status-critical)]"
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
      <span className="text-xs font-semibold tracking-wide">LIVE</span>
      <span className="text-[10px] text-white/50">refresh in {secondsLeft}s</span>
    </div>
  );
}
