"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/shared/glass-card";
import { StatusBadge, riskToTone } from "@/components/shared/status-badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { DistrictMapDatum } from "@/types";

export function DistrictRiskList({ districts, isLoading }: { districts?: DistrictMapDatum[]; isLoading?: boolean }) {
  return (
    <GlassCard className="p-5">
      <h3 className="mb-4 text-sm font-semibold">District Risk Ranking</h3>
      <ScrollArea className="h-[420px] pr-3">
        <div className="space-y-2">
          {isLoading || !districts
            ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)
            : districts.map((d, i) => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.02 }}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{d.division} &middot; {d.activeCases} active cases</p>
                  </div>
                  <StatusBadge tone={riskToTone(d.riskLevel)} label={d.riskLevel} />
                </motion.div>
              ))}
        </div>
      </ScrollArea>
    </GlassCard>
  );
}
