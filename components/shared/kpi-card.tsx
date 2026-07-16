"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react";
import { GlassCard } from "./glass-card";
import { AnimatedCounter } from "./animated-counter";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { KpiDatum } from "@/types";

const SENTIMENT_RING: Record<KpiDatum["sentiment"], string> = {
  good: "from-[var(--status-good)]/20 to-transparent",
  warning: "from-[var(--status-warning)]/25 to-transparent",
  critical: "from-[var(--status-critical)]/25 to-transparent",
};

const SENTIMENT_ICON_BG: Record<KpiDatum["sentiment"], string> = {
  good: "bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]",
  warning: "bg-[var(--brand-warning)]/15 text-[color-mix(in_oklab,var(--brand-warning)_75%,black)]",
  critical: "bg-[var(--brand-danger)]/10 text-[var(--brand-danger)]",
};

export function KpiCard({
  kpi,
  icon: Icon,
  index = 0,
}: {
  kpi: KpiDatum;
  icon: LucideIcon;
  index?: number;
}) {
  const TrendIcon = kpi.trend === "up" ? ArrowUpRight : kpi.trend === "down" ? ArrowDownRight : Minus;
  const trendColor =
    kpi.trend === "flat"
      ? "text-muted-foreground"
      : kpi.sentiment === "critical" && kpi.trend === "up"
        ? "text-[var(--status-critical)]"
        : kpi.trend === "up"
          ? "text-[var(--status-good)]"
          : "text-[var(--status-critical)]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <GlassCard className={cn("relative h-full overflow-hidden p-5 transition-shadow hover:shadow-xl")}>
        <div className={cn("pointer-events-none absolute -top-10 -right-10 size-32 rounded-full bg-gradient-to-br blur-2xl", SENTIMENT_RING[kpi.sentiment])} />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
            <div className="mt-2 flex items-baseline gap-1">
              <AnimatedCounter
                value={kpi.value}
                decimals={kpi.value % 1 !== 0 ? 1 : 0}
                className="text-2xl font-semibold tracking-tight tabular-nums"
              />
              {kpi.unit && <span className="text-sm font-medium text-muted-foreground">{kpi.unit}</span>}
            </div>
            <div className={cn("mt-2 inline-flex items-center gap-1 text-xs font-medium", trendColor)}>
              <TrendIcon className="size-3.5" />
              {Math.abs(kpi.deltaPercent).toFixed(1)}% vs last period
            </div>
          </div>
          <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", SENTIMENT_ICON_BG[kpi.sentiment])}>
            <Icon className="size-5" />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

export function KpiCardSkeleton() {
  return (
    <GlassCard className="h-full p-5">
      <div className="flex items-start justify-between">
        <div className="w-full space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="size-10 shrink-0 rounded-xl" />
      </div>
    </GlassCard>
  );
}
