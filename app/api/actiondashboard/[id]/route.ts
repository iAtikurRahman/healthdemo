import { NextResponse } from "next/server";
import { getCriticalHospitalDetail } from "@/services/hospitals.service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const hospital = await getCriticalHospitalDetail(id);
    if (!hospital) {
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
    }
    return NextResponse.json({ data: hospital });
  } catch (error) {
    console.error("[api/actiondashboard/[id]]", error);
    return NextResponse.json({ error: "Failed to load hospital detail" }, { status: 500 });
  }
}
