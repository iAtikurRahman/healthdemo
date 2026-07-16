"use client";

import { motion } from "framer-motion";
import type { AlertItem } from "@/types";

export function Ticker({ alerts }: { alerts: AlertItem[] }) {
  const items = alerts.length ? alerts : [{ id: "0", title: "All systems nominal — no active alerts", priority: "Low" } as AlertItem];
  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-t border-white/10 bg-black/40 py-2.5">
      <motion.div
        className="flex w-max gap-10 whitespace-nowrap px-4 text-xs text-white/80"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((a, i) => (
          <span key={`${a.id}-${i}`} className="inline-flex items-center gap-2">
            <span
              className="size-1.5 rounded-full"
              style={{
                background:
                  a.priority === "Critical" ? "var(--status-critical)" : a.priority === "High" ? "var(--status-serious)" : "var(--status-warning)",
              }}
            />
            <span className="font-semibold uppercase tracking-wide text-white/50">{a.priority}</span>
            {a.title}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
