"use client";

import { motion } from "framer-motion";
import { Siren, Users, Ambulance, Building2 } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCompact } from "@/lib/format";

export interface EmergencyStats {
  activeCount: number;
  activeAffectedPopulation: number;
  emergencyHospitalsCount: number;
}

export function EmergencyStatsRow({
  stats,
  ambulancesAvailable,
  isLoading,
}: {
  stats?: EmergencyStats;
  ambulancesAvailable?: number;
  isLoading?: boolean;
}) {
  const items: { icon: typeof Siren; label: string; value: number; formatted?: boolean; tone: "critical" | "warning" | "good" }[] = [
    { icon: Siren, label: "Active Incidents", value: stats?.activeCount ?? 0, tone: "critical" },
    { icon: Users, label: "Population Affected", value: stats?.activeAffectedPopulation ?? 0, formatted: true, tone: "warning" },
    { icon: Ambulance, label: "Ambulances Available", value: ambulancesAvailable ?? 0, tone: "good" },
    { icon: Building2, label: "Emergency-Ready Hospitals", value: stats?.emergencyHospitalsCount ?? 0, tone: "good" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((item, i) => (
        <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.05 }}>
          <GlassCard className="p-5">
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <>
                <div
                  className="flex size-9 items-center justify-center rounded-lg"
                  style={{
                    background: item.tone === "critical" ? "color-mix(in oklab, var(--status-critical) 15%, transparent)" : item.tone === "warning" ? "color-mix(in oklab, var(--status-warning) 18%, transparent)" : "color-mix(in oklab, var(--status-good) 15%, transparent)",
                    color: item.tone === "critical" ? "var(--status-critical)" : item.tone === "warning" ? "var(--status-warning)" : "var(--status-good)",
                  }}
                >
                  <item.icon className="size-4.5" />
                </div>
                {item.formatted ? (
                  <p className="mt-3 text-2xl font-semibold tabular-nums">{formatCompact(item.value)}</p>
                ) : (
                  <AnimatedCounter value={item.value} className="mt-3 block text-2xl font-semibold tabular-nums" />
                )}
                <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
              </>
            )}
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}
