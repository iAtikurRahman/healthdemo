"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/shared/glass-card";
import { GisFilters } from "@/features/gis/gis-filters";
import { RiskLegend } from "@/features/gis/risk-legend";
import { DistrictRiskList } from "@/features/gis/district-risk-list";
import { BangladeshMapClient } from "@/features/gis/bangladesh-map-client";
import { useGisStore } from "@/features/gis/gis-store";
import type { DistrictMapDatum, HospitalMapDatum, AmbulanceMapDatum } from "@/types";

interface MapData {
  districts: DistrictMapDatum[];
  hospitals: HospitalMapDatum[];
  ambulances: AmbulanceMapDatum[];
}

async function fetchMap(params: URLSearchParams): Promise<MapData> {
  const res = await fetch(`/api/map?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to load map data");
  return (await res.json()).data;
}

export default function GisPage() {
  const store = useGisStore();
  const params = new URLSearchParams();
  if (store.division !== "all") params.set("division", store.division);
  if (store.district !== "all") params.set("district", store.district);
  if (store.disease !== "all") params.set("disease", store.disease);
  if (store.gender !== "all") params.set("gender", store.gender);
  if (store.ageRange[0] > 0) params.set("ageMin", String(store.ageRange[0]));
  if (store.ageRange[1] < 100) params.set("ageMax", String(store.ageRange[1]));
  if (store.dateFrom) params.set("dateFrom", store.dateFrom);
  if (store.dateTo) params.set("dateTo", store.dateTo);

  const { data, isLoading } = useQuery({
    queryKey: ["map", "gis", params.toString()],
    queryFn: () => fetchMap(params),
  });

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-xl font-semibold tracking-tight">GIS Intelligence</h1>
        <p className="text-sm text-muted-foreground">
          Filter by division, district, disease, demographics, and date range to simulate national surveillance queries.
        </p>
      </motion.div>

      <GisFilters />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-3 xl:col-span-2">
          <GlassCard className="p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <RiskLegend />
              <span className="text-xs text-muted-foreground">
                {isLoading ? "Loading..." : `${data?.districts.length ?? 0} districts matched`}
              </span>
            </div>
            {isLoading || !data ? (
              <div className="h-[560px] animate-pulse rounded-xl bg-muted" />
            ) : (
              <BangladeshMapClient
                districts={data.districts}
                hospitals={data.hospitals}
                ambulances={data.ambulances}
                showHospitals={store.showHospitals}
                showAmbulances={store.showAmbulances}
                height={560}
              />
            )}
          </GlassCard>
        </div>
        <div className="xl:col-span-1">
          <DistrictRiskList districts={data?.districts} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
