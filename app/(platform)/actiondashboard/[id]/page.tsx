"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, BedDouble, HeartPulse, Siren, Clock } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProgressMeter } from "@/components/shared/progress-meter";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { AlertCard } from "@/components/shared/alert-card";
import { Timeline, type TimelineEvent } from "@/components/shared/timeline";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatTime } from "@/lib/format";
import { scoreTone, scoreLabel } from "@/features/actiondashboard/score-utils";
import type { CriticalHospitalDetail, AlertItem } from "@/types";

async function fetchHospitalDetail(id: string): Promise<CriticalHospitalDetail> {
  const res = await fetch(`/api/actiondashboard/${id}`);
  if (!res.ok) throw new Error("Failed to load hospital detail");
  return (await res.json()).data;
}

const INCIDENT_STATUS_TONE: Record<string, "critical" | "warning" | "good"> = {
  Active: "critical",
  Contained: "warning",
  Resolved: "good",
};

function pressureTone(value: number, highThreshold: number, midThreshold: number): "critical" | "warning" | "good" {
  if (value >= highThreshold) return "critical";
  if (value >= midThreshold) return "warning";
  return "good";
}

export default function HospitalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ["actiondashboard", id],
    queryFn: () => fetchHospitalDetail(id),
  });

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-[1200px] space-y-6">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const tone = scoreTone(data.criticalityScore);

  const incidentEvents: TimelineEvent[] = data.recentIncidents.map((inc) => ({
    id: inc.id,
    title: inc.type,
    description: inc.description,
    timestamp: `${formatDate(inc.startedAt)} · ${formatTime(inc.startedAt)}`,
    tone: INCIDENT_STATUS_TONE[inc.status] ?? "warning",
    badge: inc.status,
  }));

  const alertItems: AlertItem[] = data.recentAlerts.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    category: a.category,
    priority: a.priority as AlertItem["priority"],
    districtName: data.districtName,
    aiGenerated: a.aiGenerated,
    createdAt: a.createdAt,
  }));

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <Link href="/actiondashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to Action Dashboard
      </Link>

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <GlassCard className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">{data.name}</h1>
                {data.hasEmergency && <StatusBadge tone="critical" label="Emergency" showIcon={false} />}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {data.type} · {data.districtName}, {data.divisionName} · District risk: {data.districtRiskLevel}
              </p>
              {data.concerns.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {data.concerns.map((c) => (
                    <span
                      key={c}
                      className="rounded-full bg-[color-mix(in_oklab,var(--status-critical)_10%,transparent)] px-2.5 py-1 text-xs font-medium text-[var(--status-critical)]"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
              <StatusBadge tone={tone} label={scoreLabel(data.criticalityScore)} />
              <span className="text-3xl font-semibold tabular-nums">
                {data.criticalityScore.toFixed(0)}
                <span className="text-sm text-muted-foreground">/100</span>
              </span>
              <span className="text-xs text-muted-foreground">Criticality score</span>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <GlassCard className="p-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--status-critical)]/10 text-[var(--status-critical)]">
            <HeartPulse className="size-4.5" />
          </div>
          <AnimatedCounter value={data.criticalPatients + data.severePatients} className="mt-3 block text-2xl font-semibold tabular-nums" />
          <p className="mt-1 text-xs text-muted-foreground">Critical + severe patients ({data.activePatients} active total)</p>
        </GlassCard>
        <GlassCard className="p-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
            <BedDouble className="size-4.5" />
          </div>
          <AnimatedCounter value={data.availableBeds} className="mt-3 block text-2xl font-semibold tabular-nums" />
          <p className="mt-1 text-xs text-muted-foreground">Beds available of {data.beds} ({data.occupancyRate.toFixed(0)}% occupied)</p>
        </GlassCard>
        <GlassCard className="p-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--status-serious)]/10 text-[var(--status-serious)]">
            <Siren className="size-4.5" />
          </div>
          <AnimatedCounter value={data.icuAvailable} className="mt-3 block text-2xl font-semibold tabular-nums" />
          <p className="mt-1 text-xs text-muted-foreground">ICU beds free of {data.icuBeds} · {data.ventilators - data.ventilatorsInUse}/{data.ventilators} ventilators free</p>
        </GlassCard>
        <GlassCard className="p-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--status-warning)]/10 text-[var(--status-warning)]">
            <Clock className="size-4.5" />
          </div>
          <AnimatedCounter value={data.waitingTimeMin} suffix=" min" className="mt-3 block text-2xl font-semibold tabular-nums" />
          <p className="mt-1 text-xs text-muted-foreground">Avg. waiting time · {data.doctorsAvailable}/{data.doctorsTotal} doctors on duty</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard className="p-5">
          <h3 className="mb-4 text-sm font-semibold">Why This Score</h3>
          <div className="space-y-4">
            <ProgressMeter
              label="Patient severity pressure"
              value={data.scoreBreakdown.patientSeverityPressure}
              tone={pressureTone(data.scoreBreakdown.patientSeverityPressure, 60, 35)}
            />
            <ProgressMeter
              label="Bed occupancy"
              value={data.scoreBreakdown.occupancyPressure}
              tone={pressureTone(data.scoreBreakdown.occupancyPressure, 90, 75)}
            />
            <ProgressMeter label="ICU pressure" value={data.scoreBreakdown.icuPressure} tone={pressureTone(data.scoreBreakdown.icuPressure, 85, 60)} />
            <ProgressMeter
              label="Ventilator pressure"
              value={data.scoreBreakdown.ventilatorPressure}
              tone={pressureTone(data.scoreBreakdown.ventilatorPressure, 85, 60)}
            />
            <ProgressMeter
              label="Waiting time pressure"
              value={data.scoreBreakdown.waitingPressure}
              tone={pressureTone(data.scoreBreakdown.waitingPressure, 70, 40)}
            />
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="mb-4 text-sm font-semibold">Active Patients by Severity</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Critical</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-[var(--status-critical)]">{data.severityBreakdown.critical}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Severe</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-[var(--status-serious)]">{data.severityBreakdown.severe}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Moderate</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-[var(--status-warning)]">{data.severityBreakdown.moderate}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Mild</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-[var(--status-good)]">{data.severityBreakdown.mild}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard className="p-5">
          <h3 className="mb-4 text-sm font-semibold">Recent District Incidents</h3>
          {incidentEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent emergency incidents reported in {data.districtName}.</p>
          ) : (
            <Timeline events={incidentEvents} />
          )}
        </GlassCard>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Recent District Alerts</h3>
          {alertItems.length === 0 ? (
            <GlassCard className="p-5">
              <p className="text-sm text-muted-foreground">No recent alerts for {data.districtName}.</p>
            </GlassCard>
          ) : (
            <div className="space-y-2">
              {alertItems.map((a, i) => (
                <AlertCard key={a.id} alert={a} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
