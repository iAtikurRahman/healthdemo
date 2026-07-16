"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ReferenceLine,
} from "recharts";
import { GlassCard } from "@/components/shared/glass-card";
import { ChartTooltip } from "@/components/shared/chart-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CHART_SERIES, GRID_COLOR, AXIS_COLOR } from "@/lib/chart-colors";

interface TrendPoint {
  label: string;
  cases: number;
  deaths: number;
  recovered: number;
}
interface AffectedDistrict {
  district: string;
  cases: number;
  deaths: number;
  riskScore: number;
  population: number;
}

function riskTone(score: number) {
  return score > 65 ? "critical" : score > 40 ? "warning" : "good";
}

function heatColor(score: number) {
  if (score > 65) return "var(--status-critical)";
  if (score > 40) return "var(--status-serious)";
  if (score > 20) return "var(--status-warning)";
  return "var(--status-good)";
}

export function DiseaseDetailPanel({
  disease,
  trend,
  affectedDistricts,
  isLoading,
}: {
  disease: string;
  trend?: TrendPoint[];
  affectedDistricts?: AffectedDistrict[];
  isLoading?: boolean;
}) {
  const forecast = useMemo(() => {
    if (!trend || trend.length < 7) return [];
    const last7 = trend.slice(-7);
    const avgDelta = (last7[6].cases - last7[0].cases) / 6;
    const points: { label: string; cases: number; projected: true }[] = [];
    let level = last7[6].cases;
    for (let i = 1; i <= 5; i++) {
      level = Math.max(0, Math.round(level + avgDelta));
      points.push({ label: `+${i}d`, cases: level, projected: true });
    }
    return points;
  }, [trend]);

  const combinedTrend = trend ? [...trend, ...forecast.map((f) => ({ ...f, deaths: 0, recovered: 0 }))] : [];

  if (isLoading || !trend || !affectedDistricts) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-80 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <GlassCard className="p-5">
        <h3 className="text-sm font-semibold">{disease} — Trend & 5-Day Prediction</h3>
        <p className="text-xs text-muted-foreground">Solid line: recorded cases &middot; dashed: AI projection</p>
        <div className="mt-3" style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedTrend} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: AXIS_COLOR }} tickLine={false} axisLine={{ stroke: GRID_COLOR }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: AXIS_COLOR }} tickLine={false} axisLine={{ stroke: GRID_COLOR }} width={32} />
              <Tooltip content={<ChartTooltip />} />
              {trend.length > 0 && <ReferenceLine x={trend[trend.length - 1].label} stroke={GRID_COLOR} strokeDasharray="3 3" />}
              <Line type="monotone" dataKey="cases" stroke={CHART_SERIES[0]} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="recovered" stroke={CHART_SERIES[4]} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <h3 className="text-sm font-semibold">Top Affected Districts (14-day)</h3>
        <p className="text-xs text-muted-foreground">Case load and AI risk score by district</p>
        <div className="mt-3" style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={affectedDistricts} layout="vertical" margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: AXIS_COLOR }} tickLine={false} axisLine={{ stroke: GRID_COLOR }} />
              <YAxis type="category" dataKey="district" tick={{ fontSize: 10, fill: AXIS_COLOR }} tickLine={false} axisLine={{ stroke: GRID_COLOR }} width={80} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="cases" fill={CHART_SERIES[0]} radius={[0, 4, 4, 0]} maxBarSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="mb-2 mt-4 text-xs font-semibold text-muted-foreground">Risk Heatmap</p>
        <div className="grid grid-cols-5 gap-1.5">
          {affectedDistricts.map((d) => (
            <div
              key={d.district}
              className="flex aspect-square flex-col items-center justify-center rounded-lg p-1 text-center"
              style={{ background: `color-mix(in oklab, ${heatColor(d.riskScore)} 22%, transparent)` }}
              title={`${d.district}: risk ${d.riskScore}`}
            >
              <span className="truncate text-[9px] font-medium">{d.district}</span>
              <span className="text-[10px] font-bold" style={{ color: heatColor(d.riskScore) }}>{d.riskScore}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {affectedDistricts.slice(0, 4).map((d) => (
            <StatusBadge key={d.district} tone={riskTone(d.riskScore)} label={`${d.district}: ${d.cases} cases`} showIcon={false} />
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
