"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { DISEASE_ICON } from "@/lib/disease-icons";
import { cn } from "@/lib/utils";

export interface DiseaseOverview {
  disease: string;
  cases: number;
  deaths: number;
  recovered: number;
  avgRiskScore: number;
  deltaPercent: number;
}

export function DiseaseOverviewCards({
  overview,
  isLoading,
  selected,
  onSelect,
}: {
  overview?: DiseaseOverview[];
  isLoading?: boolean;
  selected: string;
  onSelect: (disease: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {isLoading || !overview
        ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)
        : overview.map((d, i) => {
            const Icon = DISEASE_ICON[d.disease];
            const isSelected = selected === d.disease;
            const riskTone = d.avgRiskScore > 65 ? "critical" : d.avgRiskScore > 40 ? "warning" : "good";
            return (
              <motion.button
                key={d.disease}
                onClick={() => onSelect(d.disease)}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                whileHover={{ y: -3 }}
                className="text-left"
              >
                <GlassCard
                  className={cn(
                    "h-full p-4 transition-colors",
                    isSelected && "ring-2 ring-[var(--brand-primary)] ring-offset-2 ring-offset-background"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
                      <Icon className="size-4" />
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5 text-[11px] font-medium",
                        d.deltaPercent >= 0 ? "text-[var(--status-critical)]" : "text-[var(--status-good)]"
                      )}
                    >
                      {d.deltaPercent >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                      {Math.abs(d.deltaPercent)}%
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-semibold">{d.disease}</p>
                  <p className="text-xs text-muted-foreground">{d.cases.toLocaleString()} cases · 30d</p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        riskTone === "critical" ? "bg-[var(--status-critical)]" : riskTone === "warning" ? "bg-[var(--status-warning)]" : "bg-[var(--status-good)]"
                      )}
                      style={{ width: `${d.avgRiskScore}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">Risk score: {d.avgRiskScore}/100</p>
                </GlassCard>
              </motion.button>
            );
          })}
    </div>
  );
}
