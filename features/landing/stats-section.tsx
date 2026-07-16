"use client";

import { motion } from "framer-motion";
import { Map, Database, Building2, Gauge } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { AnimatedCounter } from "@/components/shared/animated-counter";

const STATS = [
  { icon: Map, label: "Districts Connected", value: 64, suffix: "", decimals: 0 },
  { icon: Database, label: "Demo Health Records", value: 18, suffix: "M", decimals: 0 },
  { icon: Building2, label: "Demo Hospitals Modeled", value: 12500, suffix: "", decimals: 0 },
  { icon: Gauge, label: "System Availability", value: 98.9, suffix: "%", decimals: 1 },
];

export function StatsSection() {
  return (
    <section id="stats" className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4 }}
          >
            <GlassCard className="flex h-full flex-col items-start gap-3 p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
                <stat.icon className="size-5" />
              </div>
              <AnimatedCounter
                value={stat.value}
                decimals={stat.decimals}
                suffix={stat.suffix}
                className="text-3xl font-semibold tabular-nums"
              />
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
