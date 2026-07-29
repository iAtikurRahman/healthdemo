"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, ShieldCheck, HeartPulse, Siren, Stethoscope, MapPinned, type LucideIcon } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { Skeleton } from "@/components/ui/skeleton";
import type { CriticalHospital } from "@/types";

interface Stats {
  hospitalsNeedingSupport: number;
  hospitalsElevated: number;
  avgCaseFatalityRate: number;
  totalDeaths: number;
  districtsAtRisk: number;
  reportYear: number;
}

interface StatItem {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix: string;
  decimals: number;
  tone: string;
}

function buildNegativeItems(stats?: Stats): StatItem[] {
  return [
    {
      icon: ShieldAlert,
      label: "Hospitals Needing Support",
      value: stats?.hospitalsNeedingSupport ?? 0,
      suffix: "",
      decimals: 0,
      tone: "text-[var(--status-critical)] bg-[var(--status-critical)]/10",
    },
    {
      icon: Siren,
      label: `Total Deaths (${stats?.reportYear ?? "—"})`,
      value: stats?.totalDeaths ?? 0,
      suffix: "",
      decimals: 0,
      tone: "text-[var(--status-serious)] bg-[var(--status-serious)]/10",
    },
    {
      icon: HeartPulse,
      label: "Avg. Case Fatality Rate",
      value: stats?.avgCaseFatalityRate ?? 0,
      suffix: "%",
      decimals: 1,
      tone: "text-[var(--brand-primary)] bg-[var(--brand-primary)]/10",
    },
    {
      icon: MapPinned,
      label: "Districts at Risk",
      value: stats?.districtsAtRisk ?? 0,
      suffix: "",
      decimals: 0,
      tone: "text-[var(--status-warning)] bg-[var(--status-warning)]/10",
    },
  ];
}

// Excludes hospitals with no reported 2011 activity — otherwise non-reporting
// hospitals (which also score 0) would falsely count as "performing well".
function buildPositiveItems(hospitals?: CriticalHospital[]): StatItem[] {
  const reporting = (hospitals ?? []).filter((h) => h.hasReportedActivity);
  const performingWell = reporting.filter((h) => h.criticalityScore < 35).length;
  const withAdmissions = reporting.filter((h) => h.admissionTotal > 0);
  const avgSurvivalRate = withAdmissions.length
    ? Math.round((withAdmissions.reduce((sum, h) => sum + (100 - h.caseFatalityRate), 0) / withAdmissions.length) * 10) / 10
    : 100;
  const totalAdmissionsHandled = reporting.reduce((sum, h) => sum + h.admissionTotal, 0);
  const districtsReporting = new Set(reporting.map((h) => h.districtName));
  const districtsAtRisk = new Set((hospitals ?? []).filter((h) => h.criticalityScore >= 55).map((h) => h.districtName));
  const districtsFullyStable = [...districtsReporting].filter((d) => !districtsAtRisk.has(d)).length;

  return [
    {
      icon: ShieldCheck,
      label: `Performing Well (of ${reporting.length} reporting)`,
      value: performingWell,
      suffix: "",
      decimals: 0,
      tone: "text-[var(--status-good)] bg-[var(--status-good)]/10",
    },
    {
      icon: HeartPulse,
      label: "Avg. Survival Rate",
      value: avgSurvivalRate,
      suffix: "%",
      decimals: 1,
      tone: "text-[var(--status-good)] bg-[var(--status-good)]/10",
    },
    {
      icon: Stethoscope,
      label: "Total Admissions Handled",
      value: totalAdmissionsHandled,
      suffix: "",
      decimals: 0,
      tone: "text-[var(--brand-primary)] bg-[var(--brand-primary)]/10",
    },
    {
      icon: MapPinned,
      label: "Districts Fully Stable",
      value: districtsFullyStable,
      suffix: "",
      decimals: 0,
      tone: "text-[var(--status-good)] bg-[var(--status-good)]/10",
    },
  ];
}

export function HotspotStatsRow({
  stats,
  hospitals,
  view = "negative",
  isLoading,
}: {
  stats?: Stats;
  hospitals?: CriticalHospital[];
  view?: "negative" | "positive";
  isLoading?: boolean;
}) {
  const items = useMemo(
    () => (view === "positive" ? buildPositiveItems(hospitals) : buildNegativeItems(stats)),
    [view, hospitals, stats]
  );

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((item, i) => (
        <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.05 }}>
          <GlassCard className="p-5">
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <>
                <div className={`flex size-9 items-center justify-center rounded-lg ${item.tone}`}>
                  <item.icon className="size-4.5" />
                </div>
                <AnimatedCounter value={item.value} decimals={item.decimals} suffix={item.suffix} className="mt-3 block text-2xl font-semibold tabular-nums" />
                <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
              </>
            )}
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}
