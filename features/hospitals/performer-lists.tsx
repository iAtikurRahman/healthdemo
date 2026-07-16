"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { HospitalRow } from "@/types";

function List({ hospitals, icon: Icon, title, tone }: { hospitals: HospitalRow[]; icon: typeof TrendingUp; title: string; tone: "good" | "critical" }) {
  return (
    <GlassCard className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <Icon className={tone === "good" ? "size-4 text-[var(--status-good)]" : "size-4 text-[var(--status-critical)]"} />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="space-y-2">
        {hospitals.map((h, i) => (
          <div key={h.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-xs">
            <div className="min-w-0">
              <p className="truncate font-medium">{i + 1}. {h.name}</p>
              <p className="text-muted-foreground">{h.districtName}</p>
            </div>
            <span className="shrink-0 font-semibold tabular-nums">{h.performanceScore.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export function PerformerLists({ hospitals, isLoading }: { hospitals?: HospitalRow[]; isLoading?: boolean }) {
  if (isLoading || !hospitals) {
    return (
      <div className="grid grid-cols-1 gap-4">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }
  const sorted = [...hospitals].sort((a, b) => b.performanceScore - a.performanceScore);
  const top = sorted.slice(0, 5);
  const bottom = sorted.slice(-5).reverse();

  return (
    <div className="grid grid-cols-1 gap-4">
      <List hospitals={top} icon={TrendingUp} title="Top Performing Hospitals" tone="good" />
      <List hospitals={bottom} icon={TrendingDown} title="Lowest Performing Hospitals" tone="critical" />
    </div>
  );
}
