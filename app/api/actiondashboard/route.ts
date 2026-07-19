import { NextResponse } from "next/server";
import { getCriticalHospitals } from "@/services/hospitals.service";

export async function GET() {
  try {
    const hospitals = await getCriticalHospitals();

    const critical = hospitals.filter((h) => h.criticalityScore >= 75).length;
    const serious = hospitals.filter((h) => h.criticalityScore >= 55 && h.criticalityScore < 75).length;
    const totalCriticalPatients = hospitals.reduce((sum, h) => sum + h.criticalPatients + h.severePatients, 0);
    const avgIcuAvailability =
      hospitals.reduce((sum, h) => sum + (h.icuBeds > 0 ? (h.icuAvailable / h.icuBeds) * 100 : 100), 0) /
      (hospitals.length || 1);
    const districtsWithActiveIncidents = new Set(
      hospitals.filter((h) => h.activeDistrictIncidents > 0).map((h) => h.districtName)
    ).size;

    return NextResponse.json({
      data: {
        hospitals,
        stats: {
          hospitalsNeedingSupport: critical,
          hospitalsElevated: serious,
          totalCriticalPatients,
          avgIcuAvailability: Math.round(avgIcuAvailability * 10) / 10,
          districtsWithActiveIncidents,
        },
      },
    });
  } catch (error) {
    console.error("[api/actiondashboard]", error);
    return NextResponse.json({ error: "Failed to load action dashboard data" }, { status: 500 });
  }
}
