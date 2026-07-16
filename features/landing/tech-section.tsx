"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/shared/glass-card";
import {
  Code2, Database, Map as MapIcon, LineChart, Sparkles, Layers, Palette, Wand2,
} from "lucide-react";

const TECHS = [
  { icon: Code2, name: "Next.js 15", desc: "App Router, Server Components" },
  { icon: Layers, name: "TypeScript", desc: "End-to-end type safety" },
  { icon: Palette, name: "Tailwind CSS", desc: "Utility-first styling system" },
  { icon: Wand2, name: "shadcn/ui", desc: "Accessible component primitives" },
  { icon: Sparkles, name: "Framer Motion", desc: "Fluid animation engine" },
  { icon: LineChart, name: "Recharts", desc: "Composable data visualization" },
  { icon: MapIcon, name: "React Leaflet", desc: "Interactive GIS mapping" },
  { icon: Database, name: "MySQL & Prisma", desc: "Type-safe relational data layer" },
];

export function TechSection() {
  return (
    <section id="technology" className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Built on a modern, enterprise-grade stack</h2>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Every layer of the platform mirrors the architecture patterns used in production health
          and GIS systems &mdash; rendered here with fully synthetic demo data.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {TECHS.map((tech, i) => (
          <motion.div
            key={tech.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: i * 0.05 }}
            whileHover={{ y: -3 }}
          >
            <GlassCard className="flex h-full flex-col items-start gap-2.5 p-5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--brand-secondary)]/10 text-[var(--brand-secondary)]">
                <tech.icon className="size-4.5" />
              </div>
              <p className="text-sm font-semibold">{tech.name}</p>
              <p className="text-xs text-muted-foreground">{tech.desc}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
