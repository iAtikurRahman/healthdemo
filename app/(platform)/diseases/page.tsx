"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { DiseaseOverviewCards, type DiseaseOverview } from "@/features/diseases/disease-overview-cards";
import { DiseaseDetailPanel } from "@/features/diseases/disease-detail-panel";
import { DISEASES } from "@/mock-data/geo";

async function fetchOverview(): Promise<DiseaseOverview[]> {
  const res = await fetch("/api/diseases");
  if (!res.ok) throw new Error("Failed to load disease overview");
  return (await res.json()).data.overview;
}

interface DiseaseDetail {
  trend: { label: string; cases: number; deaths: number; recovered: number }[];
  affectedDistricts: { district: string; cases: number; deaths: number; riskScore: number; population: number }[];
}

async function fetchDetail(disease: string): Promise<DiseaseDetail> {
  const res = await fetch(`/api/diseases?disease=${encodeURIComponent(disease)}`);
  if (!res.ok) throw new Error("Failed to load disease detail");
  const json = await res.json();
  return { trend: json.data.trend, affectedDistricts: json.data.affectedDistricts };
}

export default function DiseasesPage() {
  const [selected, setSelected] = useState<string>(DISEASES[0]);

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ["diseases", "overview"],
    queryFn: fetchOverview,
  });

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ["diseases", "detail", selected],
    queryFn: () => fetchDetail(selected),
  });

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-xl font-semibold tracking-tight">Disease Surveillance</h1>
        <p className="text-sm text-muted-foreground">Select a disease to view its trend, prediction, risk, and affected districts.</p>
      </motion.div>

      <DiseaseOverviewCards overview={overview} isLoading={overviewLoading} selected={selected} onSelect={setSelected} />

      <DiseaseDetailPanel
        disease={selected}
        trend={detail?.trend}
        affectedDistricts={detail?.affectedDistricts}
        isLoading={detailLoading}
      />
    </div>
  );
}
