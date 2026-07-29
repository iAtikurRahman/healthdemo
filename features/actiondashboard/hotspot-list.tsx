"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, Award, Stethoscope, HeartPulse, ChevronRight } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { scoreTone, scoreLabel, SCORE_BORDER } from "./score-utils";
import type { CriticalHospital } from "@/types";

export function HotspotList({
  hospitals,
  view = "negative",
  isLoading,
}: {
  hospitals?: CriticalHospital[];
  view?: "negative" | "positive";
  isLoading?: boolean;
}) {
  if (isLoading || !hospitals) {
    return (
      <GlassCard className="p-5">
        <Skeleton className="mb-3 h-4 w-48" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </GlassCard>
    );
  }

  const top = hospitals.slice(0, 10);
  const isPositive = view === "positive";

  return (
    <GlassCard className="p-5">
      <div className="mb-4 flex items-center gap-2">
        {isPositive ? (
          <Award className="size-4 text-[var(--status-good)]" />
        ) : (
          <AlertTriangle className="size-4 text-[var(--status-critical)]" />
        )}
        <h3 className="text-sm font-semibold">{isPositive ? "Top Performers — Best Practices" : "Top Hotspots — Worst Emergency Situations"}</h3>
        <span className="text-xs text-muted-foreground">Click a hospital for full details</span>
      </div>
      <div className="space-y-2">
        {top.map((h, i) => {
          const tone = scoreTone(h.criticalityScore);
          return (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
            >
              <Link
                href={`/actiondashboard/${h.id}`}
                className={`group flex flex-col gap-2 rounded-lg border border-l-4 border-border ${SCORE_BORDER[tone]} bg-card/40 px-3 py-2.5 transition-colors hover:bg-muted/60 sm:flex-row sm:items-center sm:justify-between`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold tabular-nums">
                      {i + 1}
                    </span>
                    <p className="truncate text-sm font-medium">{h.name}</p>
                  </div>
                  <p className="mt-0.5 pl-7 text-xs text-muted-foreground">{h.upazilaName}, {h.districtName}, {h.divisionName}</p>
                  {h.concerns.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5 pl-7">
                      {h.concerns.slice(0, 3).map((c) => (
                        <span
                          key={c}
                          className="rounded-full bg-[color-mix(in_oklab,var(--status-critical)_10%,transparent)] px-2 py-0.5 text-[10px] font-medium text-[var(--status-critical)]"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-4 pl-7 sm:pl-0">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground" title="Case fatality rate">
                    <HeartPulse className="size-3.5 text-[var(--status-critical)]" />
                    <span className="font-medium tabular-nums text-foreground">{h.caseFatalityRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground" title="Admissions per bed">
                    <Stethoscope className="size-3.5" />
                    <span className="font-medium tabular-nums text-foreground">{h.admissionsPerBed.toFixed(0)}/bed</span>
                  </div>
                  <StatusBadge tone={tone} label={scoreLabel(h.criticalityScore)} showIcon={false} />
                  <span className="w-9 text-right text-sm font-semibold tabular-nums">{h.criticalityScore.toFixed(0)}</span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
}
