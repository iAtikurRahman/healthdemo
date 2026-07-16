"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { EmergencyStatsRow, type EmergencyStats } from "@/features/emergency/emergency-stats-row";
import { IncidentCards, type Incident } from "@/features/emergency/incident-cards";
import { EmergencyMapCard } from "@/features/emergency/emergency-map-card";
import { GlassCard } from "@/components/shared/glass-card";
import { Timeline, type TimelineEvent } from "@/components/shared/timeline";
import { formatDate, formatTime } from "@/lib/format";

interface EmergencyResponse {
  incidents: Incident[];
  stats: EmergencyStats & { byType: { type: string; count: number }[]; byStatus: { status: string; count: number }[] };
  ambulanceStatusCounts: { status: string; count: number }[];
}

async function fetchEmergency(): Promise<EmergencyResponse> {
  const res = await fetch("/api/emergency");
  if (!res.ok) throw new Error("Failed to load emergency data");
  return (await res.json()).data;
}

const STATUS_TONE: Record<string, "critical" | "warning" | "good"> = {
  Active: "critical",
  Contained: "warning",
  Resolved: "good",
};

export default function EmergencyPage() {
  const { data, isLoading } = useQuery({ queryKey: ["emergency"], queryFn: fetchEmergency });
  const ambulancesAvailable = data?.ambulanceStatusCounts.find((a) => a.status === "Available")?.count ?? 0;

  const timelineEvents: TimelineEvent[] = (data?.incidents ?? []).slice(0, 10).map((incident) => ({
    id: incident.id,
    title: `${incident.type} — ${incident.districtName}`,
    description: incident.description,
    timestamp: `${formatDate(incident.startedAt)} · ${formatTime(incident.startedAt)}`,
    tone: STATUS_TONE[incident.status] ?? "warning",
    badge: incident.status,
  }));

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-xl font-semibold tracking-tight">Emergency Response</h1>
        <p className="text-sm text-muted-foreground">Live incident coordination — floods, cyclones, and disease outbreaks.</p>
      </motion.div>

      <EmergencyStatsRow stats={data?.stats} ambulancesAvailable={ambulancesAvailable} isLoading={isLoading} />

      <EmergencyMapCard />

      <div>
        <h2 className="mb-3 text-sm font-semibold">Active & Recent Incidents</h2>
        <IncidentCards incidents={data?.incidents} isLoading={isLoading} />
      </div>

      <GlassCard className="p-5">
        <h2 className="mb-4 text-sm font-semibold">Emergency Response Timeline</h2>
        {isLoading || !data ? (
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
        ) : (
          <Timeline events={timelineEvents} />
        )}
      </GlassCard>
    </div>
  );
}
