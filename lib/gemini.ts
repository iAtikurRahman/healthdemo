import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

// Constructed lazily so a missing GEMINI_API_KEY only surfaces when an
// AI feature is actually invoked, not at module load / build time.
export function getGeminiClient(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}
