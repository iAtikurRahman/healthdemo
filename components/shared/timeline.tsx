"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { StatusBadge, type StatusTone } from "./status-badge";

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  tone?: StatusTone;
  badge?: string;
}

export function Timeline({ events, className }: { events: TimelineEvent[]; className?: string }) {
  return (
    <ol className={cn("relative space-y-6 border-l border-border pl-6", className)}>
      {events.map((e, i) => (
        <motion.li
          key={e.id}
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: i * 0.05 }}
          className="relative"
        >
          <span
            className={cn(
              "absolute -left-[29px] top-1 size-3 rounded-full border-2 border-background",
              e.tone === "critical"
                ? "bg-[var(--status-critical)]"
                : e.tone === "serious"
                  ? "bg-[var(--status-serious)]"
                  : e.tone === "warning"
                    ? "bg-[var(--status-warning)]"
                    : e.tone === "good"
                      ? "bg-[var(--status-good)]"
                      : "bg-muted-foreground"
            )}
          />
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium">{e.title}</p>
            {e.badge && <StatusBadge tone={e.tone ?? "neutral"} label={e.badge} showIcon={false} />}
          </div>
          {e.description && <p className="mt-0.5 text-xs text-muted-foreground">{e.description}</p>}
          <p className="mt-1 text-[11px] text-muted-foreground">{e.timestamp}</p>
        </motion.li>
      ))}
    </ol>
  );
}
