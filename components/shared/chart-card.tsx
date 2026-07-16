"use client";

import { motion } from "framer-motion";
import { GlassCard } from "./glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ChartCard({
  title,
  subtitle,
  actions,
  children,
  className,
  height = 280,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  height?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassCard className={cn("p-5", className)}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">{title}</h3>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          {actions}
        </div>
        <div style={{ height }}>{children}</div>
      </GlassCard>
    </motion.div>
  );
}

export function ChartCardSkeleton({ height = 280, className }: { height?: number; className?: string }) {
  return (
    <GlassCard className={cn("p-5", className)}>
      <Skeleton className="h-4 w-40 mb-2" />
      <Skeleton className="h-3 w-28 mb-4" />
      <Skeleton className="w-full" style={{ height }} />
    </GlassCard>
  );
}

export function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number | string; color?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover/95 backdrop-blur px-3 py-2 shadow-lg text-xs">
      {label && <p className="mb-1 font-medium text-popover-foreground">{label}</p>}
      <div className="space-y-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="size-2 rounded-full shrink-0" style={{ background: p.color }} />
            <span className="text-muted-foreground">{p.name}:</span>
            <span className="font-medium text-popover-foreground tabular-nums">{p.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
