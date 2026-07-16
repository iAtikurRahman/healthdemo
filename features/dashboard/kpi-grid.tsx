"use client";

import { KpiCard, KpiCardSkeleton } from "@/components/shared/kpi-card";
import { resolveIcon } from "@/lib/icon-map";
import type { KpiDatum } from "@/types";

export function KpiGrid({ kpis, isLoading }: { kpis?: KpiDatum[]; isLoading: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
      {isLoading || !kpis
        ? Array.from({ length: 9 }).map((_, i) => <KpiCardSkeleton key={i} />)
        : kpis.map((kpi, i) => <KpiCard key={kpi.id} kpi={kpi} icon={resolveIcon(kpi.icon)} index={i} />)}
    </div>
  );
}
