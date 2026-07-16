"use client";

import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { ChartCard, ChartCardSkeleton, ChartTooltip } from "@/components/shared/chart-card";
import { CHART_SERIES, GRID_COLOR, AXIS_COLOR } from "@/lib/chart-colors";
import type { HospitalRow } from "@/types";

export function HospitalComparisonChart({ hospitals, isLoading }: { hospitals?: HospitalRow[]; isLoading?: boolean }) {
  if (isLoading || !hospitals) return <ChartCardSkeleton height={340} />;
  const top = [...hospitals].sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 8);
  const data = top.map((h) => ({
    label: h.name.length > 18 ? `${h.name.slice(0, 18)}…` : h.name,
    Performance: h.performanceScore,
    Satisfaction: h.satisfactionScore,
  }));

  return (
    <ChartCard title="Hospital Comparison" subtitle="Top 8 hospitals by performance score" height={340}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: AXIS_COLOR }} tickLine={false} axisLine={{ stroke: GRID_COLOR }} angle={-25} textAnchor="end" height={70} interval={0} />
          <YAxis tick={{ fontSize: 11, fill: AXIS_COLOR }} tickLine={false} axisLine={{ stroke: GRID_COLOR }} width={32} />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="Performance" fill={CHART_SERIES[0]} radius={[4, 4, 0, 0]} maxBarSize={26} />
          <Bar dataKey="Satisfaction" fill={CHART_SERIES[4]} radius={[4, 4, 0, 0]} maxBarSize={26} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
