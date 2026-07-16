import { NextResponse } from "next/server";
import {
  getDashboardKpis,
  getDiseaseTrendChart,
  getHospitalPerformanceByDivision,
  getIcuUsageByDivision,
  getDoctorAvailabilityByDivision,
  getMedicineConsumptionByCategory,
  getMaternalChildHealthTrend,
  getVaccinationProgressTrend,
  getBudgetUtilizationByDivision,
} from "@/services/dashboard.service";
import { getAlerts } from "@/services/alerts.service";

export async function GET() {
  try {
    const [
      kpis,
      diseaseTrend,
      hospitalPerformance,
      icuUsage,
      doctorAvailability,
      medicineConsumption,
      maternalChildHealth,
      vaccinationProgress,
      alerts,
    ] = await Promise.all([
      getDashboardKpis(),
      getDiseaseTrendChart(),
      getHospitalPerformanceByDivision(),
      getIcuUsageByDivision(),
      getDoctorAvailabilityByDivision(),
      getMedicineConsumptionByCategory(),
      getMaternalChildHealthTrend(),
      getVaccinationProgressTrend(),
      getAlerts({ limit: 8 }),
    ]);
    const budgetUtilization = getBudgetUtilizationByDivision();

    return NextResponse.json({
      data: {
        kpis,
        diseaseTrend,
        hospitalPerformance,
        icuUsage,
        doctorAvailability,
        medicineConsumption,
        maternalChildHealth,
        vaccinationProgress,
        budgetUtilization,
        alerts,
      },
    });
  } catch (error) {
    console.error("[api/dashboard]", error);
    return NextResponse.json({ error: "Failed to load dashboard data" }, { status: 500 });
  }
}
