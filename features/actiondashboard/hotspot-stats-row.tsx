"use client";

import { motion } from "framer-motion";
import { ShieldAlert, HeartPulse, Siren, MapPinned } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
  hospitalsNeedingSupport: number;
  hospitalsElevated: number;
  totalCriticalPatients: number;
  avgIcuAvailability: number;
  districtsWithActiveIncidents: number;
}

export function HotspotStatsRow({ stats, isLoading }: { stats?: Stats; isLoading?: boolean }) {
  const items = [
    {
      icon: ShieldAlert,
      label: "Hospitals Needing Support",
      value: stats?.hospitalsNeedingSupport ?? 0,
      suffix: "",
      decimals: 0,
      tone: "text-[var(--status-critical)] bg-[var(--status-critical)]/10",
    },
    {
      icon: HeartPulse,
      label: "Critical & Severe Patients",
      value: stats?.totalCriticalPatients ?? 0,
      suffix: "",
      decimals: 0,
      tone: "text-[var(--status-serious)] bg-[var(--status-serious)]/10",
    },
    {
      icon: Siren,
      label: "Avg. ICU Availability",
      value: stats?.avgIcuAvailability ?? 0,
      suffix: "%",
      decimals: 1,
      tone: "text-[var(--brand-primary)] bg-[var(--brand-primary)]/10",
    },
    {
      icon: MapPinned,
      label: "Districts with Active Incidents",
      value: stats?.districtsWithActiveIncidents ?? 0,
      suffix: "",
      decimals: 0,
      tone: "text-[var(--status-warning)] bg-[var(--status-warning)]/10",
    },
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
                <div className={`flex size-9 items-center justify-center rounded-lg ${item.tone}`}>
                  <item.icon className="size-4.5" />
                </div>
                <AnimatedCounter value={item.value} decimals={item.decimals} suffix={item.suffix} className="mt-3 block text-2xl font-semibold tabular-nums" />
                <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
              </>
            )}
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}
