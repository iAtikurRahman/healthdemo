"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { KpiGrid } from "@/features/dashboard/kpi-grid";
import { DistrictMapCard } from "@/features/dashboard/district-map-card";
import { RecentAlertsPanel } from "@/features/dashboard/recent-alerts-panel";
import {
  DiseaseTrendChart,
  HospitalPerformanceChart,
  IcuUsageChart,
  DoctorAvailabilityChart,
  MedicineConsumptionChart,
  MaternalChildHealthChart,
  VaccinationProgressChart,
  BudgetUtilizationChart,
} from "@/features/dashboard/dashboard-charts";
import type { KpiDatum, ChartPoint, AlertItem } from "@/types";

interface DashboardData {
  kpis: KpiDatum[];
  diseaseTrend: ChartPoint[];
  hospitalPerformance: ChartPoint[];
  icuUsage: ChartPoint[];
  doctorAvailability: ChartPoint[];
  medicineConsumption: ChartPoint[];
  maternalChildHealth: ChartPoint[];
  vaccinationProgress: ChartPoint[];
  budgetUtilization: ChartPoint[];
  alerts: AlertItem[];
}

async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch("/api/dashboard");
  if (!res.ok) throw new Error("Failed to load dashboard");
  return (await res.json()).data;
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: fetchDashboard });

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-xl font-semibold tracking-tight">Executive Overview</h1>
        <p className="text-sm text-muted-foreground">Real-time national health indicators &mdash; synthetic demo data.</p>
      </motion.div>

      <KpiGrid kpis={data?.kpis} isLoading={isLoading} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <DistrictMapCard />
        </div>
        <div className="xl:col-span-1">
          <RecentAlertsPanel alerts={data?.alerts} isLoading={isLoading} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DiseaseTrendChart data={data?.diseaseTrend} isLoading={isLoading} />
        <HospitalPerformanceChart data={data?.hospitalPerformance} isLoading={isLoading} />
        <IcuUsageChart data={data?.icuUsage} isLoading={isLoading} />
        <DoctorAvailabilityChart data={data?.doctorAvailability} isLoading={isLoading} />
        <MedicineConsumptionChart data={data?.medicineConsumption} isLoading={isLoading} />
        <MaternalChildHealthChart data={data?.maternalChildHealth} isLoading={isLoading} />
        <VaccinationProgressChart data={data?.vaccinationProgress} isLoading={isLoading} />
        <BudgetUtilizationChart data={data?.budgetUtilization} isLoading={isLoading} />
      </div>
    </div>
  );
}
