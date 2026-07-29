import { NextResponse } from "next/server";
import { getHospitalAiSuggestions } from "@/services/ai-suggestions.service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await getHospitalAiSuggestions(id);
    if (!data) {
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
    }
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[api/actiondashboard/[id]/suggestions]", error);
    return NextResponse.json({ error: "Failed to generate AI suggestions" }, { status: 500 });
  }
}
