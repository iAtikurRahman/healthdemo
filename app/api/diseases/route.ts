import { NextRequest, NextResponse } from "next/server";
import { getDiseaseOverview, getDiseaseTrend, getDiseaseAffectedDistricts } from "@/services/diseases.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const disease = searchParams.get("disease");

    if (disease) {
      const [trend, affectedDistricts] = await Promise.all([
        getDiseaseTrend(disease),
        getDiseaseAffectedDistricts(disease),
      ]);
      return NextResponse.json({ data: { disease, trend, affectedDistricts } });
    }

    const overview = await getDiseaseOverview();
    return NextResponse.json({ data: { overview } });
  } catch (error) {
    console.error("[api/diseases]", error);
    return NextResponse.json({ error: "Failed to load disease data" }, { status: 500 });
  }
}
