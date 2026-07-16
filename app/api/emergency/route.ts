import { NextResponse } from "next/server";
import { getEmergencyIncidents, getEmergencyStats } from "@/services/emergency.service";
import { getAmbulanceMapData, getAmbulanceStatusCounts } from "@/services/ambulances.service";

export async function GET() {
  try {
    const [incidents, stats, ambulances, ambulanceStatusCounts] = await Promise.all([
      getEmergencyIncidents(),
      getEmergencyStats(),
      getAmbulanceMapData(),
      getAmbulanceStatusCounts(),
    ]);
    return NextResponse.json({ data: { incidents, stats, ambulances, ambulanceStatusCounts } });
  } catch (error) {
    console.error("[api/emergency]", error);
    return NextResponse.json({ error: "Failed to load emergency data" }, { status: 500 });
  }
}
