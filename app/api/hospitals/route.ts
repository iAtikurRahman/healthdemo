import { NextRequest, NextResponse } from "next/server";
import { getHospitals, getHospitalStats } from "@/services/hospitals.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      search: searchParams.get("search") ?? undefined,
      division: searchParams.get("division") ?? undefined,
      district: searchParams.get("district") ?? undefined,
      type: searchParams.get("type") ?? undefined,
      sort: (searchParams.get("sort") as "performance" | "occupancy" | "waiting" | "satisfaction" | null) ?? undefined,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
    };

    const [hospitals, stats] = await Promise.all([getHospitals(filters), getHospitalStats()]);

    return NextResponse.json({
      data: {
        hospitals,
        stats: {
          avgWaitingTimeMin: Math.round((stats._avg.waitingTimeMin ?? 0) * 10) / 10,
          avgOccupancyRate: Math.round((stats._avg.occupancyRate ?? 0) * 10) / 10,
          avgSatisfaction: Math.round((stats._avg.satisfactionScore ?? 0) * 10) / 10,
          avgPerformance: Math.round((stats._avg.performanceScore ?? 0) * 10) / 10,
          totalBeds: stats._sum.beds ?? 0,
          availableBeds: stats._sum.availableBeds ?? 0,
          totalHospitals: stats._count._all,
        },
      },
    });
  } catch (error) {
    console.error("[api/hospitals]", error);
    return NextResponse.json({ error: "Failed to load hospital data" }, { status: 500 });
  }
}
