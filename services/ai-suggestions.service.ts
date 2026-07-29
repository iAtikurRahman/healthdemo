import { z } from "zod";
import { getGeminiClient } from "@/lib/gemini";
import { getCriticalHospitalDetail } from "@/services/hospitals.service";
import type { AiSuggestionsResponse } from "@/types";

const SuggestionsSchema = z.object({
  summary: z.string().describe("One or two sentence assessment of this hospital's situation, citing its actual numbers"),
  suggestions: z
    .array(
      z.object({
        title: z.string().describe("Short imperative action title, under 8 words"),
        detail: z.string().describe("1-2 sentence explanation of why and how, referencing this hospital's specific metrics"),
        priority: z.enum(["High", "Medium", "Low"]),
      })
    )
    .min(3)
    .max(5),
});

// Real, LLM-generated recommendations for one hospital, grounded strictly in
// its actual hospital_statistics report row (via getCriticalHospitalDetail).
export async function getHospitalAiSuggestions(idParam: string): Promise<AiSuggestionsResponse | null> {
  const hospital = await getCriticalHospitalDetail(idParam);
  if (!hospital) return null;

  const client = getGeminiClient();
  const response = await client.models.generateContent({
    model: "gemini-flash-latest",
    contents: JSON.stringify(
      {
        hospitalName: hospital.name,
        location: `${hospital.upazilaName}, ${hospital.districtName}, ${hospital.divisionName}`,
        reportYear: hospital.reportYear,
        beds: hospital.beds,
        admissions: { male: hospital.admissionMale, female: hospital.admissionFemale, total: hospital.admissionTotal },
        deaths: { male: hospital.deathMale, female: hospital.deathFemale, total: hospital.deathTotal },
        outdoorVisits: {
          male: hospital.outdoorVisitMale,
          female: hospital.outdoorVisitFemale,
          child: hospital.outdoorVisitChild,
          total: hospital.outdoorVisitTotal,
        },
        caseFatalityRatePercent: hospital.caseFatalityRate,
        admissionsPerBed: hospital.admissionsPerBed,
        outdoorVisitsPerBed: hospital.outdoorVisitsPerBed,
        careRiskScore: hospital.criticalityScore,
        scoreBreakdown: hospital.scoreBreakdown,
        existingConcerns: hospital.concerns,
        nationalRank: `${hospital.nationalRank} of ${hospital.totalHospitalsNational}`,
      },
      null,
      2
    ),
    config: {
      systemInstruction:
        "You are a hospital operations advisor for a national health ministry dashboard. You are given one hospital's real 2011 report_year statistics from the hospital_statistics table (beds, admissions, deaths, outdoor visits, and a computed care-risk score with its breakdown). Recommend concrete, specific, operationally actionable steps to reduce mortality, overcrowding, and outdoor patient burden. Ground every recommendation in the actual numbers given -- do not invent facts, patients, or incidents not present in the data.",
      responseMimeType: "application/json",
      responseJsonSchema: z.toJSONSchema(SuggestionsSchema),
    },
  });

  if (!response.text) {
    throw new Error("Gemini did not return a response");
  }
  return SuggestionsSchema.parse(JSON.parse(response.text));
}
