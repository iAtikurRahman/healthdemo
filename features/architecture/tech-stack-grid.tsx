"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/shared/glass-card";

const GROUPS: { category: string; items: string[] }[] = [
  { category: "Frontend", items: ["Next.js 15 (App Router)", "TypeScript", "Tailwind CSS", "shadcn/ui", "Framer Motion"] },
  { category: "State & Data Fetching", items: ["Zustand", "TanStack Query", "Zod validation"] },
  { category: "Visualization & GIS", items: ["Recharts", "React Leaflet", "Custom GIS projections"] },
  { category: "Backend & Database", items: ["Next.js API Routes", "Prisma ORM", "MySQL"] },
  { category: "Intelligence Layer", items: ["Rule-based AI engine", "Deterministic forecasting", "Executive report generation"] },
];

export function TechStackGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {GROUPS.map((group, i) => (
        <motion.div key={group.category} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.4, delay: i * 0.06 }}>
          <GlassCard className="h-full p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-primary)]">{group.category}</p>
            <ul className="mt-3 space-y-2">
              {group.items.map((item) => (
                <li key={item} className="text-xs text-muted-foreground">{item}</li>
              ))}
            </ul>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}
