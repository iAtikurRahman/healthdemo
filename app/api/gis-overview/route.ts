import { NextResponse } from "next/server";
import { getNationalGisOverview } from "@/services/hospital-statistics.service";

export async function GET() {
  try {
    const data = await getNationalGisOverview();
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[api/gis-overview]", error);
    return NextResponse.json({ error: "Failed to load GIS overview" }, { status: 500 });
  }
}
