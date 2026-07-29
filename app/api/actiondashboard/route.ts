import { NextResponse } from "next/server";
import { getCriticalHospitals } from "@/services/hospitals.service";

export async function GET() {
  try {
    const hospitals = await getCriticalHospitals();

    const critical = hospitals.filter((h) => h.criticalityScore >= 75).length;
    const serious = hospitals.filter((h) => h.criticalityScore >= 55 && h.criticalityScore < 75).length;
    const withAdmissions = hospitals.filter((h) => h.admissionTotal > 0);
    const avgCaseFatalityRate = withAdmissions.length
      ? Math.round((withAdmissions.reduce((sum, h) => sum + h.caseFatalityRate, 0) / withAdmissions.length) * 10) / 10
      : 0;
    const totalDeaths = hospitals.reduce((sum, h) => sum + h.deathTotal, 0);
    const districtsAtRisk = new Set(hospitals.filter((h) => h.criticalityScore >= 75).map((h) => h.districtName)).size;
    const reportYear = hospitals[0]?.reportYear ?? 0;

    return NextResponse.json({
      data: {
        hospitals,
        stats: {
          hospitalsNeedingSupport: critical,
          hospitalsElevated: serious,
          avgCaseFatalityRate,
          totalDeaths,
          districtsAtRisk,
          reportYear,
        },
      },
    });
  } catch (error) {
    console.error("[api/actiondashboard]", error);
    return NextResponse.json({ error: "Failed to load action dashboard data" }, { status: 500 });
  }
}
