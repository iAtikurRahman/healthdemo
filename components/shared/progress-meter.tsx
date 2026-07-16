"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ProgressMeter({
  label,
  value,
  max = 100,
  suffix = "%",
  tone = "brand",
  className,
}: {
  label: string;
  value: number;
  max?: number;
  suffix?: string;
  tone?: "brand" | "good" | "warning" | "critical";
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const barColor =
    tone === "good"
      ? "bg-[var(--status-good)]"
      : tone === "warning"
        ? "bg-[var(--status-warning)]"
        : tone === "critical"
          ? "bg-[var(--status-critical)]"
          : "bg-[var(--brand-primary)]";

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">
          {value}
          {suffix}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className={cn("h-full rounded-full", barColor)}
        />
      </div>
    </div>
  );
}
