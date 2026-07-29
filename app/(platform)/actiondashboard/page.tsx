"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { HotspotStatsRow } from "@/features/actiondashboard/hotspot-stats-row";
import { HotspotList } from "@/features/actiondashboard/hotspot-list";
import { DivisionPressureChart } from "@/features/actiondashboard/division-pressure-chart";
import { HotspotTable } from "@/features/actiondashboard/hotspot-table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CriticalHospital } from "@/types";

interface ActionDashboardResponse {
  hospitals: CriticalHospital[];
  stats: {
    hospitalsNeedingSupport: number;
    hospitalsElevated: number;
    avgCaseFatalityRate: number;
    totalDeaths: number;
    districtsAtRisk: number;
    reportYear: number;
  };
}

type View = "negative" | "positive";

async function fetchActionDashboard(): Promise<ActionDashboardResponse> {
  const res = await fetch("/api/actiondashboard");
  if (!res.ok) throw new Error("Failed to load action dashboard data");
  return (await res.json()).data;
}

export default function ActionDashboardPage() {
  const [search, setSearch] = useState("");
  const [division, setDivision] = useState("all");
  const [view, setView] = useState<View>("negative");
  const { data, isLoading } = useQuery({ queryKey: ["actiondashboard"], queryFn: fetchActionDashboard });

  // Negative view: API already sorts worst-first. Positive view: only hospitals
  // with real reported activity (else non-reporting hospitals, which also score
  // 0, would falsely look like "top performers"), sorted best-first.
  const displayHospitals = useMemo(() => {
    if (!data?.hospitals) return undefined;
    if (view === "negative") return data.hospitals;
    return [...data.hospitals].filter((h) => h.hasReportedActivity).sort((a, b) => a.criticalityScore - b.criticalityScore);
  }, [data, view]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Action Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {view === "negative"
              ? "Which hospitals are performing worst — by case fatality rate, overcrowding, and outdoor patient burden from the hospital_statistics report — ranked so support can be targeted where it's needed most."
              : "Which reporting hospitals are performing best — lowest case fatality rate and healthiest patient load — worth studying as models of good practice."}
          </p>
        </div>
        <Tabs value={view} onValueChange={(v) => setView(v as View)}>
          <TabsList>
            <TabsTrigger value="negative">Needs Attention</TabsTrigger>
            <TabsTrigger value="positive">Top Performers</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      <HotspotStatsRow stats={data?.stats} hospitals={data?.hospitals} view={view} isLoading={isLoading} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <HotspotList hospitals={displayHospitals} view={view} isLoading={isLoading} />
        </div>
        <div className="xl:col-span-1">
          <DivisionPressureChart hospitals={data?.hospitals} isLoading={isLoading} />
        </div>
      </div>

      <HotspotTable
        hospitals={displayHospitals}
        view={view}
        isLoading={isLoading}
        search={search}
        onSearchChange={setSearch}
        division={division}
        onDivisionChange={setDivision}
      />
    </div>
  );
}
