"use client";

import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { ChartCard, ChartCardSkeleton, ChartTooltip } from "@/components/shared/chart-card";
import { CHART_SERIES, GRID_COLOR, AXIS_COLOR } from "@/lib/chart-colors";
import type { CriticalHospital } from "@/types";

export function DivisionPressureChart({ hospitals, isLoading }: { hospitals?: CriticalHospital[]; isLoading?: boolean }) {
  if (isLoading || !hospitals) return <ChartCardSkeleton height={300} />;

  const byDivision = new Map<string, { sum: number; count: number }>();
  for (const h of hospitals) {
    const entry = byDivision.get(h.divisionName) ?? { sum: 0, count: 0 };
    entry.sum += h.criticalityScore;
    entry.count += 1;
    byDivision.set(h.divisionName, entry);
  }
  const data = Array.from(byDivision.entries())
    .map(([label, { sum, count }]) => ({ label, "Avg. Criticality": Math.round((sum / count) * 10) / 10 }))
    .sort((a, b) => b["Avg. Criticality"] - a["Avg. Criticality"]);

  return (
    <ChartCard title="Pressure by Division" subtitle="Average hospital criticality score, national comparison" height={300}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: AXIS_COLOR }} tickLine={false} axisLine={{ stroke: GRID_COLOR }} angle={-25} textAnchor="end" height={60} interval={0} />
          <YAxis tick={{ fontSize: 11, fill: AXIS_COLOR }} tickLine={false} axisLine={{ stroke: GRID_COLOR }} width={32} domain={[0, 100]} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="Avg. Criticality" fill={CHART_SERIES[3]} radius={[4, 4, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
