"use client";

import { motion } from "framer-motion";
import { Clock, BedDouble, Stethoscope, Smile } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
  avgWaitingTimeMin: number;
  avgOccupancyRate: number;
  avgSatisfaction: number;
  avgPerformance: number;
  totalBeds: number;
  availableBeds: number;
  totalHospitals: number;
}

export function HospitalStatsRow({ stats, isLoading }: { stats?: Stats; isLoading?: boolean }) {
  const items = [
    { icon: Clock, label: "Avg. Waiting Time", value: stats?.avgWaitingTimeMin ?? 0, suffix: " min", decimals: 0 },
    { icon: BedDouble, label: "Avg. Bed Occupancy", value: stats?.avgOccupancyRate ?? 0, suffix: "%", decimals: 1 },
    { icon: Stethoscope, label: "Avg. Performance Score", value: stats?.avgPerformance ?? 0, suffix: "/100", decimals: 1 },
    { icon: Smile, label: "Avg. Patient Satisfaction", value: stats?.avgSatisfaction ?? 0, suffix: "/100", decimals: 1 },
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
                <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
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
