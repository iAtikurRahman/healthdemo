"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { HospitalStatsRow } from "@/features/hospitals/hospital-stats-row";
import { HospitalComparisonChart } from "@/features/hospitals/hospital-comparison-chart";
import { PerformerLists } from "@/features/hospitals/performer-lists";
import { HospitalTable } from "@/features/hospitals/hospital-table";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { HospitalRow } from "@/types";

interface HospitalsResponse {
  hospitals: HospitalRow[];
  stats: {
    avgWaitingTimeMin: number;
    avgOccupancyRate: number;
    avgSatisfaction: number;
    avgPerformance: number;
    totalBeds: number;
    availableBeds: number;
    totalHospitals: number;
  };
}

async function fetchHospitals(params: URLSearchParams): Promise<HospitalsResponse> {
  const res = await fetch(`/api/hospitals?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to load hospitals");
  return (await res.json()).data;
}

export default function HospitalsPage() {
  const [search, setSearch] = useState("");
  const [division, setDivision] = useState("all");
  const debouncedSearch = useDebouncedValue(search, 300);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (debouncedSearch) p.set("search", debouncedSearch);
    if (division !== "all") p.set("division", division);
    p.set("limit", "200");
    return p;
  }, [debouncedSearch, division]);

  const { data, isLoading } = useQuery({
    queryKey: ["hospitals", params.toString()],
    queryFn: () => fetchHospitals(params),
  });

  const { data: allData } = useQuery({
    queryKey: ["hospitals", "all-for-charts"],
    queryFn: () => fetchHospitals(new URLSearchParams({ limit: "500" })),
  });

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-xl font-semibold tracking-tight">Hospital Performance</h1>
        <p className="text-sm text-muted-foreground">Benchmarking across 500 demo hospitals nationwide.</p>
      </motion.div>

      <HospitalStatsRow stats={allData?.stats} isLoading={!allData} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <HospitalComparisonChart hospitals={allData?.hospitals} isLoading={!allData} />
        </div>
        <div className="xl:col-span-1">
          <PerformerLists hospitals={allData?.hospitals} isLoading={!allData} />
        </div>
      </div>

      <HospitalTable
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
