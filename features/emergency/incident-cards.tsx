"use client";

import { motion } from "framer-motion";
import { CloudRain, Wind, Activity, Waves, Mountain, AlertTriangle } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { StatusBadge, priorityToTone } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCompact } from "@/lib/format";
import { timeAgo } from "@/lib/format";

export interface Incident {
  id: string;
  type: string;
  districtName: string;
  severity: string;
  status: string;
  startedAt: string;
  affectedPopulation: number;
  description: string;
}

const TYPE_ICON: Record<string, typeof CloudRain> = {
  Flood: CloudRain,
  Cyclone: Wind,
  "Disease Outbreak": Activity,
  "River Erosion": Waves,
  Landslide: Mountain,
};

const STATUS_TONE: Record<string, "critical" | "warning" | "good"> = {
  Active: "critical",
  Contained: "warning",
  Resolved: "good",
};

export function IncidentCards({ incidents, isLoading }: { incidents?: Incident[]; isLoading?: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {isLoading || !incidents
        ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)
        : incidents.map((incident, i) => {
            const Icon = TYPE_ICON[incident.type] ?? AlertTriangle;
            return (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                whileHover={{ y: -3 }}
              >
                <GlassCard className="h-full p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--brand-danger)]/10 text-[var(--brand-danger)]">
                      <Icon className="size-4.5" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge tone={STATUS_TONE[incident.status] ?? "warning"} label={incident.status} showIcon={false} />
                      <StatusBadge tone={priorityToTone(incident.severity)} label={incident.severity} showIcon={false} />
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-semibold">{incident.type} &middot; {incident.districtName}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{incident.description}</p>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Affected: <strong className="text-foreground">{formatCompact(incident.affectedPopulation)}</strong></span>
                    <span>{timeAgo(incident.startedAt)}</span>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
    </div>
  );
}
