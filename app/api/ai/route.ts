import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateAiResponse } from "@/services/ai.service";

const bodySchema = z.object({
  message: z.string().min(1).max(500),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const { message } = bodySchema.parse(json);

    const response = await generateAiResponse(message);

    return NextResponse.json({
      data: {
        id: `msg_${Date.now()}`,
        role: "assistant",
        createdAt: new Date().toISOString(),
        ...response,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    console.error("[api/ai]", error);
    return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 });
  }
}
