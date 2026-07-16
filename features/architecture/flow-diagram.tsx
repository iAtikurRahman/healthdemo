"use client";

import { motion } from "framer-motion";
import { Building2, MapPin, Landmark, Globe2, BrainCircuit, MapPinned, LayoutDashboard, ChevronDown } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";

const STAGES = [
  { icon: Building2, title: "Hospital", desc: "Patient records, bed status, and doctor availability captured at the facility level." },
  { icon: MapPin, title: "District", desc: "District health offices aggregate hospital data across upazilas." },
  { icon: Landmark, title: "Division", desc: "Divisional health authorities consolidate district-level surveillance." },
  { icon: Globe2, title: "National Health Hub", desc: "Central data warehouse unifies all 64 districts into one live feed." },
  { icon: BrainCircuit, title: "AI Engine", desc: "Rule-based inference layer generates risk scores, forecasts, and recommendations." },
  { icon: MapPinned, title: "GIS Engine", desc: "Geospatial layer renders districts, hospitals, and ambulances on the live map." },
  { icon: LayoutDashboard, title: "Executive Dashboard", desc: "Ministry-level decision-makers view KPIs, alerts, and AI insights in real time." },
];

export function FlowDiagram() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center">
      {STAGES.map((stage, i) => (
        <div key={stage.title} className="flex w-full flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <GlassCard className="flex w-full items-center gap-4 p-5">
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.2 }}
                className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]"
              >
                <stage.icon className="size-5" />
              </motion.div>
              <div>
                <p className="text-sm font-semibold">{stage.title}</p>
                <p className="text-xs text-muted-foreground">{stage.desc}</p>
              </div>
            </GlassCard>
          </motion.div>
          {i < STAGES.length - 1 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              whileInView={{ opacity: 1, height: 32 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 + 0.2 }}
              className="flex flex-col items-center justify-center py-1 text-[var(--brand-secondary)]"
            >
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15 }}
              >
                <ChevronDown className="size-5" />
              </motion.div>
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}
