"use client";

import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from "recharts";
import { ChartCard, ChartCardSkeleton, ChartTooltip } from "@/components/shared/chart-card";
import { CHART_SERIES, GRID_COLOR, AXIS_COLOR } from "@/lib/chart-colors";
import type { ChartPoint } from "@/types";

const axisProps = {
  tick: { fontSize: 11, fill: AXIS_COLOR },
  tickLine: false,
  axisLine: { stroke: GRID_COLOR },
};

function Empty() {
  return <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No data for the selected range.</div>;
}

export function DiseaseTrendChart({ data, isLoading }: { data?: ChartPoint[]; isLoading?: boolean }) {
  if (isLoading || !data) return <ChartCardSkeleton />;
  const series = ["Dengue", "COVID-19", "Tuberculosis", "Diabetes"];
  return (
    <ChartCard title="Disease Trend" subtitle="Daily case counts — last 21 days">
      {data.length === 0 ? <Empty /> : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
            <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" />
            <YAxis {...axisProps} width={36} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {series.map((s, i) => (
              <Line key={s} type="monotone" dataKey={s} stroke={CHART_SERIES[i]} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export function HospitalPerformanceChart({ data, isLoading }: { data?: ChartPoint[]; isLoading?: boolean }) {
  if (isLoading || !data) return <ChartCardSkeleton />;
  return (
    <ChartCard title="Hospital Performance" subtitle="Average score by division">
      {data.length === 0 ? <Empty /> : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
            <XAxis dataKey="label" {...axisProps} angle={-20} textAnchor="end" height={50} />
            <YAxis {...axisProps} width={36} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Performance" fill={CHART_SERIES[0]} radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="Occupancy" fill={CHART_SERIES[4]} radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export function IcuUsageChart({ data, isLoading }: { data?: ChartPoint[]; isLoading?: boolean }) {
  if (isLoading || !data) return <ChartCardSkeleton />;
  return (
    <ChartCard title="ICU Usage" subtitle="Beds in use vs available by division">
      {data.length === 0 ? <Empty /> : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} stackOffset="expand">
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
            <XAxis dataKey="label" {...axisProps} angle={-20} textAnchor="end" height={50} />
            <YAxis {...axisProps} width={36} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="ICU In Use" stackId="icu" fill={CHART_SERIES[7]} radius={[0, 0, 0, 0]} maxBarSize={28} />
            <Bar dataKey="ICU Available" stackId="icu" fill={CHART_SERIES[4]} radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export function DoctorAvailabilityChart({ data, isLoading }: { data?: ChartPoint[]; isLoading?: boolean }) {
  if (isLoading || !data) return <ChartCardSkeleton />;
  return (
    <ChartCard title="Doctor Availability" subtitle="Available doctors by division">
      {data.length === 0 ? <Empty /> : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
            <XAxis dataKey="label" {...axisProps} angle={-20} textAnchor="end" height={50} />
            <YAxis {...axisProps} width={36} tickFormatter={(v) => `${v}%`} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="Availability %" fill={CHART_SERIES[1]} radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export function MedicineConsumptionChart({ data, isLoading }: { data?: ChartPoint[]; isLoading?: boolean }) {
  if (isLoading || !data) return <ChartCardSkeleton />;
  return (
    <ChartCard title="Medicine Consumption" subtitle="Consumed vs remaining stock by category">
      {data.length === 0 ? <Empty /> : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} horizontal={false} />
            <XAxis type="number" {...axisProps} />
            <YAxis type="category" dataKey="label" {...axisProps} width={90} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Consumed" stackId="med" fill={CHART_SERIES[5]} maxBarSize={16} />
            <Bar dataKey="Remaining" stackId="med" fill={CHART_SERIES[4]} radius={[0, 4, 4, 0]} maxBarSize={16} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export function MaternalChildHealthChart({ data, isLoading }: { data?: ChartPoint[]; isLoading?: boolean }) {
  if (isLoading || !data) return <ChartCardSkeleton />;
  return (
    <ChartCard title="Maternal & Child Health" subtitle="Daily case counts — last 30 days">
      {data.length === 0 ? <Empty /> : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
            <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" />
            <YAxis {...axisProps} width={36} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="Maternal Cases" stroke={CHART_SERIES[2]} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Child Cases" stroke={CHART_SERIES[3]} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export function VaccinationProgressChart({ data, isLoading }: { data?: ChartPoint[]; isLoading?: boolean }) {
  if (isLoading || !data) return <ChartCardSkeleton />;
  return (
    <ChartCard title="Vaccination Progress" subtitle="National coverage % by month">
      {data.length === 0 ? <Empty /> : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="vaxFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_SERIES[0]} stopOpacity={0.35} />
                <stop offset="100%" stopColor={CHART_SERIES[0]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} width={36} tickFormatter={(v) => `${v}%`} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="Coverage %" stroke={CHART_SERIES[0]} strokeWidth={2} fill="url(#vaxFill)" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export function BudgetUtilizationChart({ data, isLoading }: { data?: ChartPoint[]; isLoading?: boolean }) {
  if (isLoading || !data) return <ChartCardSkeleton />;
  return (
    <ChartCard title="Budget Utilization" subtitle="Allocated vs utilized (Cr BDT) by division">
      {data.length === 0 ? <Empty /> : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
            <XAxis dataKey="label" {...axisProps} angle={-20} textAnchor="end" height={50} />
            <YAxis {...axisProps} width={36} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Allocated (Cr BDT)" fill={CHART_SERIES[6]} radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="Utilized (Cr BDT)" fill={CHART_SERIES[0]} radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
