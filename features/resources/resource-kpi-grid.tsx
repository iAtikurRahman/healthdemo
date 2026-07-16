"use client";

import { motion } from "framer-motion";
import { Stethoscope, HeartHandshake, Pill, Droplets, Activity, Wind, Gauge, Ambulance } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { Skeleton } from "@/components/ui/skeleton";

export interface ResourceOverview {
  doctors: { total: number; available: number };
  nurses: { total: number };
  icu: { total: number; available: number };
  ventilators: { total: number; inUse: number };
  beds: { total: number; available: number };
  medicineByCategory: { category: string; stockLevel: number; capacity: number }[];
  medicineCriticalCount: number;
  ambulances: { status: string; count: number }[];
  bloodBank: { group: string; units: number; capacity: number; status: string }[];
}

export function ResourceKpiGrid({ overview, isLoading }: { overview?: ResourceOverview; isLoading?: boolean }) {
  const oxygen = overview?.medicineByCategory.find((m) => m.category === "Oxygen Supplies");
  const bloodTotal = overview?.bloodBank.reduce((s, b) => s + b.units, 0) ?? 0;
  const ambulancesAvailable = overview?.ambulances.find((a) => a.status === "Available")?.count ?? 0;
  const ambulancesTotal = overview?.ambulances.reduce((s, a) => s + a.count, 0) ?? 0;

  const items = [
    { icon: Stethoscope, label: "Doctors", value: overview?.doctors.available ?? 0, of: overview?.doctors.total },
    { icon: HeartHandshake, label: "Nurses", value: overview?.nurses.total ?? 0 },
    { icon: Activity, label: "ICU Beds", value: overview?.icu.available ?? 0, of: overview?.icu.total },
    { icon: Gauge, label: "Ventilators", value: (overview?.ventilators.total ?? 0) - (overview?.ventilators.inUse ?? 0), of: overview?.ventilators.total },
    { icon: Wind, label: "Oxygen Cylinders", value: oxygen?.stockLevel ?? 0, of: oxygen?.capacity },
    { icon: Droplets, label: "Blood Units", value: bloodTotal },
    { icon: Ambulance, label: "Ambulances", value: ambulancesAvailable, of: ambulancesTotal },
    { icon: Pill, label: "Critical Stock Items", value: overview?.medicineCriticalCount ?? 0 },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {items.map((item, i) => (
        <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.04 }}>
          <GlassCard className="p-4">
            {isLoading || !overview ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <>
                <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
                  <item.icon className="size-4" />
                </div>
                <div className="mt-2.5 flex items-baseline gap-1">
                  <AnimatedCounter value={item.value} className="text-xl font-semibold tabular-nums" />
                  {item.of !== undefined && <span className="text-xs text-muted-foreground">/ {item.of.toLocaleString()}</span>}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.label}</p>
              </>
            )}
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}
