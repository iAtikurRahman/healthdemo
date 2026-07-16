"use client";

import { motion } from "framer-motion";
import { Siren } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { AlertCard } from "@/components/shared/alert-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AlertItem } from "@/types";

export function RecentAlertsPanel({ alerts, isLoading }: { alerts?: AlertItem[]; isLoading?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }}>
      <GlassCard className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <Siren className="size-4 text-[var(--brand-danger)]" />
          <h3 className="text-sm font-semibold">Recent Alerts</h3>
        </div>
        <div className="space-y-3">
          {isLoading || !alerts
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
            : alerts.map((alert, i) => <AlertCard key={alert.id} alert={alert} index={i} />)}
        </div>
      </GlassCard>
    </motion.div>
  );
}
