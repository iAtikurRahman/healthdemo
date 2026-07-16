"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GisBackground } from "./gis-background";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <GisBackground />
      <div className="relative mx-auto max-w-5xl px-6 pt-24 pb-20 text-center lg:pt-32 lg:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
        >
          <ShieldCheck className="size-3.5 text-[var(--brand-primary)]" />
          Demonstration Platform &middot; 100% Synthetic Data
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
        >
          AI-Powered GIS National Health
          <br />
          <span className="text-gradient-brand">Executive Decision Support</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-6 max-w-2xl text-balance text-base text-muted-foreground sm:text-lg"
        >
          A unified command platform for real-time disease surveillance, hospital performance,
          resource allocation, and emergency response &mdash; concept-built for ministry-level
          executive decision-making across all 64 districts.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Button size="lg" asChild className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 gap-2">
            <Link href="/dashboard">
              Explore Platform <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="gap-2">
            <Link href="/command-center">
              <PlayCircle className="size-4" /> View Live Demo
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
