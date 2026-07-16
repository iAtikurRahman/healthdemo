import { NextRequest, NextResponse } from "next/server";
import { getResourceOverview, getMedicineStockAlerts } from "@/services/resources.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("alertsLimit") ? Number(searchParams.get("alertsLimit")) : 20;
    const [overview, stockAlerts] = await Promise.all([getResourceOverview(), getMedicineStockAlerts(limit)]);
    return NextResponse.json({ data: { overview, stockAlerts } });
  } catch (error) {
    console.error("[api/resources]", error);
    return NextResponse.json({ error: "Failed to load resource data" }, { status: 500 });
  }
}
