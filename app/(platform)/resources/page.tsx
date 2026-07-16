"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ResourceKpiGrid, type ResourceOverview } from "@/features/resources/resource-kpi-grid";
import { MedicineInventoryChart, BloodBankChart, AmbulanceStatusChart } from "@/features/resources/inventory-charts";
import { StockAlertsList, type StockAlert } from "@/features/resources/stock-alerts-list";

interface ResourcesResponse {
  overview: ResourceOverview;
  stockAlerts: StockAlert[];
}

async function fetchResources(): Promise<ResourcesResponse> {
  const res = await fetch("/api/resources");
  if (!res.ok) throw new Error("Failed to load resources");
  return (await res.json()).data;
}

export default function ResourcesPage() {
  const { data, isLoading } = useQuery({ queryKey: ["resources"], queryFn: fetchResources });

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-xl font-semibold tracking-tight">Resource Management</h1>
        <p className="text-sm text-muted-foreground">Staff, medicine, blood, and equipment availability nationwide.</p>
      </motion.div>

      <ResourceKpiGrid overview={data?.overview} isLoading={isLoading} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <MedicineInventoryChart overview={data?.overview} isLoading={isLoading} />
        </div>
        <AmbulanceStatusChart overview={data?.overview} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <BloodBankChart overview={data?.overview} isLoading={isLoading} />
        </div>
        <div className="xl:col-span-2">
          <StockAlertsList alerts={data?.stockAlerts} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
