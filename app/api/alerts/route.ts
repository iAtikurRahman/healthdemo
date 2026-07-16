import { NextRequest, NextResponse } from "next/server";
import { getAlerts } from "@/services/alerts.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const data = await getAlerts({
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
      priority: searchParams.get("priority") ?? undefined,
      category: searchParams.get("category") ?? undefined,
    });
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[api/alerts]", error);
    return NextResponse.json({ error: "Failed to load alerts" }, { status: 500 });
  }
}
