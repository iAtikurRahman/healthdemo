"use client";

import { motion } from "framer-motion";
import { FlowDiagram } from "@/features/architecture/flow-diagram";
import { TechStackGrid } from "@/features/architecture/tech-stack-grid";

export default function ArchitecturePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-12">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-xl font-semibold tracking-tight">Platform Architecture</h1>
        <p className="text-sm text-muted-foreground">
          Data flows from the point of care up to executive decision-making — every layer feeds the next.
        </p>
      </motion.div>

      <FlowDiagram />

      <div>
        <h2 className="mb-4 text-center text-lg font-semibold">Technology Stack</h2>
        <TechStackGrid />
      </div>
    </div>
  );
}
