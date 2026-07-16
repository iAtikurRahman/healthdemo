"use client";

import { motion } from "framer-motion";
import { Sparkles, MapPin } from "lucide-react";
import { StatusBadge, priorityToTone } from "./status-badge";
import { timeAgo } from "@/lib/format";
import type { AlertItem } from "@/types";
import { cn } from "@/lib/utils";

export function AlertCard({ alert, index = 0 }: { alert: AlertItem; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className={cn(
        "group rounded-xl border border-border bg-card/60 p-4 transition-colors hover:bg-card"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={priorityToTone(alert.priority)} label={alert.priority} />
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{alert.category}</span>
            {alert.aiGenerated && (
              <span className="inline-flex items-center gap-1 text-[11px] text-[var(--brand-accent)]">
                <Sparkles className="size-3" /> AI
              </span>
            )}
          </div>
          <p className="mt-1.5 text-sm font-medium leading-snug">{alert.title}</p>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{alert.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
            {alert.districtName && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" /> {alert.districtName}
              </span>
            )}
            <span>{timeAgo(alert.createdAt)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
