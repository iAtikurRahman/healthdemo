"use client";

import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { resolveIcon } from "@/lib/icon-map";
import type { KpiDatum } from "@/types";
import { cn } from "@/lib/utils";

const SENTIMENT_GLOW: Record<KpiDatum["sentiment"], string> = {
  good: "shadow-[0_0_24px_rgba(12,163,12,0.25)] border-[var(--status-good)]/30",
  warning: "shadow-[0_0_24px_rgba(255,193,7,0.2)] border-[var(--status-warning)]/30",
  critical: "shadow-[0_0_24px_rgba(211,47,47,0.3)] border-[var(--status-critical)]/40",
};

export function CommandKpiTile({ kpi, index = 0 }: { kpi: KpiDatum; index?: number }) {
  const Icon = resolveIcon(kpi.icon);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className={cn("rounded-2xl border bg-white/[0.04] p-4 backdrop-blur", SENTIMENT_GLOW[kpi.sentiment])}
    >
      <div className="flex items-center justify-between text-white/50">
        <p className="text-[11px] font-medium uppercase tracking-wide">{kpi.label}</p>
        <Icon className="size-4" />
      </div>
      <div className="mt-2 flex items-baseline gap-1 text-white">
        <AnimatedCounter value={kpi.value} decimals={kpi.value % 1 !== 0 ? 1 : 0} className="text-2xl font-bold tabular-nums" />
        {kpi.unit && <span className="text-xs text-white/50">{kpi.unit}</span>}
      </div>
    </motion.div>
  );
}
