"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { HotspotStatsRow } from "@/features/actiondashboard/hotspot-stats-row";
import { HotspotList } from "@/features/actiondashboard/hotspot-list";
import { DivisionPressureChart } from "@/features/actiondashboard/division-pressure-chart";
import { HotspotTable } from "@/features/actiondashboard/hotspot-table";
import type { CriticalHospital } from "@/types";

interface ActionDashboardResponse {
  hospitals: CriticalHospital[];
  stats: {
    hospitalsNeedingSupport: number;
    hospitalsElevated: number;
    totalCriticalPatients: number;
    avgIcuAvailability: number;
    districtsWithActiveIncidents: number;
  };
}

async function fetchActionDashboard(): Promise<ActionDashboardResponse> {
  const res = await fetch("/api/actiondashboard");
  if (!res.ok) throw new Error("Failed to load action dashboard data");
  return (await res.json()).data;
}

export default function ActionDashboardPage() {
  const [search, setSearch] = useState("");
  const [division, setDivision] = useState("all");
  const { data, isLoading } = useQuery({ queryKey: ["actiondashboard"], queryFn: fetchActionDashboard });

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-xl font-semibold tracking-tight">Action Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Which hospitals have the worst emergency patient situations right now — ranked so support can be targeted where it&apos;s needed most.
        </p>
      </motion.div>

      <HotspotStatsRow stats={data?.stats} isLoading={isLoading} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <HotspotList hospitals={data?.hospitals} isLoading={isLoading} />
        </div>
        <div className="xl:col-span-1">
          <DivisionPressureChart hospitals={data?.hospitals} isLoading={isLoading} />
        </div>
      </div>

      <HotspotTable
        hospitals={data?.hospitals}
        isLoading={isLoading}
        search={search}
        onSearchChange={setSearch}
        division={division}
        onDivisionChange={setDivision}
      />
    </div>
  );
}
