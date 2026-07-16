"use client";

import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { ChartCard, ChartCardSkeleton, ChartTooltip } from "@/components/shared/chart-card";
import { CHART_SERIES, GRID_COLOR, AXIS_COLOR, STATUS_COLORS } from "@/lib/chart-colors";
import type { ResourceOverview } from "./resource-kpi-grid";

const axisProps = {
  tick: { fontSize: 11, fill: AXIS_COLOR },
  tickLine: false,
  axisLine: { stroke: GRID_COLOR },
};

const AMBULANCE_COLORS: Record<string, string> = {
  Available: STATUS_COLORS.good,
  Dispatched: STATUS_COLORS.warning,
  Maintenance: "var(--muted-foreground)",
};

export function MedicineInventoryChart({ overview, isLoading }: { overview?: ResourceOverview; isLoading?: boolean }) {
  if (isLoading || !overview) return <ChartCardSkeleton />;
  const data = overview.medicineByCategory.map((m) => ({
    label: m.category,
    Stock: m.stockLevel,
    Capacity: m.capacity - m.stockLevel,
  }));
  return (
    <ChartCard title="Medicine Inventory" subtitle="Current stock vs remaining capacity by category">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} horizontal={false} />
          <XAxis type="number" {...axisProps} />
          <YAxis type="category" dataKey="label" {...axisProps} width={100} />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="Stock" stackId="inv" fill={CHART_SERIES[4]} maxBarSize={16} />
          <Bar dataKey="Capacity" stackId="inv" fill={CHART_SERIES[5]} radius={[0, 4, 4, 0]} maxBarSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function BloodBankChart({ overview, isLoading }: { overview?: ResourceOverview; isLoading?: boolean }) {
  if (isLoading || !overview) return <ChartCardSkeleton />;
  const data = overview.bloodBank.map((b) => ({ label: b.group, Units: b.units, Capacity: b.capacity }));
  return (
    <ChartCard title="Blood Bank Reserves" subtitle="Units available by blood group">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis {...axisProps} width={32} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="Units" fill={CHART_SERIES[2]} radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function AmbulanceStatusChart({ overview, isLoading }: { overview?: ResourceOverview; isLoading?: boolean }) {
  if (isLoading || !overview) return <ChartCardSkeleton />;
  return (
    <ChartCard title="Ambulance Fleet Status" subtitle="National fleet availability">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Pie
            data={overview.ambulances}
            dataKey="count"
            nameKey="status"
            outerRadius={90}
            label={(props: unknown) => {
              const d = props as { status?: string; count?: number };
              return `${d.status}: ${d.count}`;
            }}
          >
            {overview.ambulances.map((a) => (
              <Cell key={a.status} fill={AMBULANCE_COLORS[a.status] ?? CHART_SERIES[0]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
