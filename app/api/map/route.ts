import { NextRequest, NextResponse } from "next/server";
import { getDistrictMapData, getDivisions, getDistrictNames } from "@/services/districts.service";
import { getHospitalMapData } from "@/services/hospitals.service";
import { getAmbulanceMapData } from "@/services/ambulances.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      division: searchParams.get("division") ?? undefined,
      district: searchParams.get("district") ?? undefined,
      disease: searchParams.get("disease") ?? undefined,
      gender: searchParams.get("gender") ?? undefined,
      ageMin: searchParams.get("ageMin") ? Number(searchParams.get("ageMin")) : undefined,
      ageMax: searchParams.get("ageMax") ? Number(searchParams.get("ageMax")) : undefined,
      dateFrom: searchParams.get("dateFrom") ?? undefined,
      dateTo: searchParams.get("dateTo") ?? undefined,
    };

    const [districts, hospitals, ambulances, divisions, districtNames] = await Promise.all([
      getDistrictMapData(filters),
      getHospitalMapData(),
      getAmbulanceMapData(),
      getDivisions(),
      getDistrictNames(),
    ]);

    return NextResponse.json({ data: { districts, hospitals, ambulances, divisions, districtNames } });
  } catch (error) {
    console.error("[api/map]", error);
    return NextResponse.json({ error: "Failed to load map data" }, { status: 500 });
  }
}
