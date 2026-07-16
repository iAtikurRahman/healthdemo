"use client";

import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from "recharts";
import { ChartTooltip } from "@/components/shared/chart-card";
import { CHART_SERIES, GRID_COLOR, AXIS_COLOR } from "@/lib/chart-colors";
import type { ChatMessage } from "@/types";

const axisProps = {
  tick: { fontSize: 11, fill: AXIS_COLOR },
  tickLine: false,
  axisLine: { stroke: GRID_COLOR },
};

export function MessageChart({ chart }: { chart: NonNullable<ChatMessage["charts"]>[number] }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-4">
      <p className="mb-3 text-xs font-semibold text-muted-foreground">{chart.title}</p>
      <div style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          {chart.type === "line" ? (
            <LineChart data={chart.data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis {...axisProps} width={32} />
              <Tooltip content={<ChartTooltip />} />
              {chart.seriesKeys.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
              {chart.seriesKeys.map((key, i) => (
                <Line key={key} type="monotone" dataKey={key} stroke={CHART_SERIES[i]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          ) : chart.type === "pie" ? (
            <PieChart>
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Pie data={chart.data} dataKey={chart.seriesKeys[0]} nameKey="label" outerRadius={90}>
                {chart.data.map((_, i) => (
                  <Cell key={i} fill={CHART_SERIES[i % CHART_SERIES.length]} />
                ))}
              </Pie>
            </PieChart>
          ) : (
            <BarChart data={chart.data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="label" {...axisProps} angle={chart.data.length > 5 ? -20 : 0} textAnchor={chart.data.length > 5 ? "end" : "middle"} height={chart.data.length > 5 ? 50 : 24} />
              <YAxis {...axisProps} width={32} />
              <Tooltip content={<ChartTooltip />} />
              {chart.seriesKeys.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
              {chart.seriesKeys.map((key, i) => (
                <Bar key={key} dataKey={key} fill={CHART_SERIES[i]} radius={[4, 4, 0, 0]} maxBarSize={32} />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
