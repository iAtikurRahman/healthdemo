"use client";

import { motion } from "framer-motion";
import { DIVISIONS } from "@/mock-data/geo";

// Normalize Bangladesh's approximate lat/lng bounding box to a 0-100 viewbox
const LAT_MIN = 20.5;
const LAT_MAX = 26.8;
const LNG_MIN = 88.0;
const LNG_MAX = 92.8;

function project(lat: number, lng: number) {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 100;
  const y = 100 - ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * 100;
  return { x, y };
}

export function GisBackground() {
  const nodes = DIVISIONS.map((d) => ({ ...d, ...project(d.lat, d.lng) }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <motion.div
        className="absolute -top-32 left-1/4 size-[32rem] rounded-full bg-[var(--brand-primary)]/20 blur-3xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 right-0 size-[28rem] rounded-full bg-[var(--brand-secondary)]/20 blur-3xl"
        animate={{ scale: [1.1, 0.95, 1.1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 size-96 rounded-full bg-[var(--brand-accent)]/25 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--brand-accent)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--brand-accent)" stopOpacity="0" />
          </radialGradient>
        </defs>
        {nodes.map((a, i) =>
          nodes.slice(i + 1).map((b) => (
            <motion.line
              key={`${a.name}-${b.name}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="var(--brand-secondary)"
              strokeWidth="0.08"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.35, 0] }}
              transition={{ duration: 5, repeat: Infinity, delay: (i * 0.4) % 5, ease: "easeInOut" }}
            />
          ))
        )}
        {nodes.map((n, i) => (
          <g key={n.name}>
            <circle cx={n.x} cy={n.y} r="3.2" fill="url(#nodeGlow)" />
            <motion.circle
              cx={n.x}
              cy={n.y}
              r="0.6"
              fill="var(--brand-primary)"
              animate={{ r: [0.5, 1, 0.5] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.2 }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
