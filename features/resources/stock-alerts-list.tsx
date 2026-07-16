"use client";

import { motion } from "framer-motion";
import { PackageX } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";

export interface StockAlert {
  id: string;
  name: string;
  category: string;
  hospitalName: string;
  districtName: string;
  stockLevel: number;
  capacity: number;
  status: string;
  unit: string;
}

export function StockAlertsList({ alerts, isLoading }: { alerts?: StockAlert[]; isLoading?: boolean }) {
  return (
    <GlassCard className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <PackageX className="size-4 text-[var(--brand-danger)]" />
        <h3 className="text-sm font-semibold">Medicine Stock Alerts</h3>
      </div>
      <div className="space-y-2">
        {isLoading || !alerts
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)
          : alerts.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className="flex items-center justify-between rounded-lg border border-border p-3 text-xs"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{a.name}</p>
                  <p className="truncate text-muted-foreground">{a.hospitalName} &middot; {a.districtName}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="tabular-nums text-muted-foreground">{a.stockLevel}/{a.capacity} {a.unit}</span>
                  <StatusBadge tone={a.status === "Critical" ? "critical" : "warning"} label={a.status} showIcon={false} />
                </div>
              </motion.div>
            ))}
      </div>
    </GlassCard>
  );
}
