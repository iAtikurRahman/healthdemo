"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip,
} from "recharts";
import { ArrowLeft, Activity, Sparkles, Siren } from "lucide-react";
import { LiveIndicator } from "@/features/command-center/live-indicator";
import { WeatherWidget } from "@/features/command-center/weather-widget";
import { CommandKpiTile } from "@/features/command-center/command-kpi-tile";
import { Ticker } from "@/features/command-center/ticker";
import { BangladeshMapClient } from "@/features/gis/bangladesh-map-client";
import { LiveClock } from "@/components/shared/live-clock";
import { ChartTooltip } from "@/components/shared/chart-card";
import { CHART_SERIES } from "@/lib/chart-colors";
import { timeAgo } from "@/lib/format";
import type { KpiDatum, ChartPoint, AlertItem, ChatMessage, DistrictMapDatum } from "@/types";

interface DashboardData {
  kpis: KpiDatum[];
  diseaseTrend: ChartPoint[];
  hospitalPerformance: ChartPoint[];
  alerts: AlertItem[];
}

async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch("/api/dashboard");
  if (!res.ok) throw new Error("Failed to load dashboard");
  return (await res.json()).data;
}

async function fetchMapDistricts(): Promise<DistrictMapDatum[]> {
  const res = await fetch("/api/map");
  if (!res.ok) throw new Error("Failed to load map");
  return (await res.json()).data.districts;
}

async function fetchAiSummary(): Promise<ChatMessage> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Generate an executive summary" }),
  });
  if (!res.ok) throw new Error("Failed to load AI summary");
  return (await res.json()).data;
}

export default function CommandCenterPage() {
  const { data } = useQuery({ queryKey: ["command-center", "dashboard"], queryFn: fetchDashboard, refetchInterval: 30000 });
  const { data: districts } = useQuery({ queryKey: ["command-center", "map"], queryFn: fetchMapDistricts, refetchInterval: 45000 });
  const { data: aiSummary } = useQuery({ queryKey: ["command-center", "ai"], queryFn: fetchAiSummary, refetchInterval: 60000 });

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="flex flex-wrap items-center gap-3 border-b border-white/10 px-6 py-4">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white">
          <ArrowLeft className="size-3.5" /> Exit
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--brand-primary)]">
            <Activity className="size-4" />
          </div>
          <h1 className="text-base font-bold tracking-tight">National Health Command Center</h1>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <LiveIndicator intervalSeconds={30} />
          <WeatherWidget />
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
            <LiveClock className="flex text-white [&_span:last-child]:text-white/50" />
          </div>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-3 overflow-y-auto p-4 xl:grid-cols-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:col-span-4">
          {(data?.kpis ?? Array.from({ length: 9 })).slice(0, 9).map((kpi, i) =>
            kpi ? <CommandKpiTile key={(kpi as KpiDatum).id} kpi={kpi as KpiDatum} index={i} /> : (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />
            )
          )}
        </div>

        <div className="xl:col-span-2">
          <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">Live National GIS</p>
            {districts ? (
              <BangladeshMapClient districts={districts} height={380} />
            ) : (
              <div className="h-[380px] animate-pulse rounded-xl bg-white/5" />
            )}
          </div>
        </div>

        <div className="space-y-3 xl:col-span-1">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">Disease Trend</p>
            <div style={{ height: 170 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.diseaseTrend ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.4)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.4)" }} tickLine={false} axisLine={false} width={24} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="Dengue" stroke={CHART_SERIES[0]} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="COVID-19" stroke={CHART_SERIES[7]} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">Hospital Performance</p>
            <div style={{ height: 170 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.hospitalPerformance ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.4)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.4)" }} tickLine={false} axisLine={false} width={24} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="Performance" fill={CHART_SERIES[4]} radius={[3, 3, 0, 0]} maxBarSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 xl:col-span-2">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/50">
            <Siren className="size-3.5 text-[var(--status-critical)]" /> Live Alert Feed
          </p>
          <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 220 }}>
            {(data?.alerts ?? []).map((a) => (
              <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white/90">{a.title}</span>
                  <span className="shrink-0 text-[10px] text-white/40">{timeAgo(a.createdAt)}</span>
                </div>
                <p className="mt-0.5 text-white/50">{a.districtName ?? "National"} &middot; {a.category}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--brand-accent)]/20 bg-[var(--brand-accent)]/5 p-4 xl:col-span-2">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--brand-accent)]">
            <Sparkles className="size-3.5" /> AI Executive Recommendations
          </p>
          <ul className="space-y-2">
            {(aiSummary?.recommendations ?? ["Awaiting AI analysis..."]).map((rec, i) => (
              <li key={i} className="flex gap-2 text-xs text-white/80">
                <span className="text-[var(--brand-accent)]">&bull;</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Ticker alerts={data?.alerts ?? []} />
    </div>
  );
}
