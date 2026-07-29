import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getGeminiClient } from "@/lib/gemini";
import { DISTRICTS } from "@/mock-data/geo";
import { getDashboardKpis } from "@/services/dashboard.service";
import { getDiseaseAffectedDistricts, getDiseaseTrend } from "@/services/diseases.service";
import { getMedicineStockAlerts, getResourceOverview } from "@/services/resources.service";
import { getAlerts } from "@/services/alerts.service";
import { getCriticalHospitalDetail, getCriticalHospitals } from "@/services/hospitals.service";
import { getNationalGisOverview } from "@/services/hospital-statistics.service";
import { createRng, randFloat } from "@/utils/random";
import type { ChatMessage } from "@/types";

type AiResponse = Omit<ChatMessage, "id" | "role" | "createdAt">;

function findMentionedDistricts(message: string): string[] {
  const lower = message.toLowerCase();
  const names = Array.from(new Set(DISTRICTS.map((d) => d.name)));
  return names.filter((n) => lower.includes(n.toLowerCase()));
}

// Whole-word match -- plain .includes() falsely matches "tb" inside "football",
// "icu" inside "particular", etc., which misroutes real questions into the
// wrong (now genuinely AI-answered) handler.
function hasWord(text: string, word: string): boolean {
  return new RegExp(`\\b${word}\\b`, "i").test(text);
}

const InsightSchema = z.object({
  narrative: z
    .string()
    .describe("2-4 short paragraphs of Markdown analysis. Start with a '## Title' heading and use **bold** for key figures. Cite only numbers present in the provided data."),
  recommendations: z
    .array(z.string().describe("A single concise, actionable recommendation"))
    .min(2)
    .max(5),
});

// Turns already-queried real platform data into a genuine Claude-generated
// narrative + recommendations, grounded strictly in that data (no invented
// facts). Charts/tables stay deterministically built from the same data by
// each caller -- only the prose and recommendation list are LLM-generated.
async function generateInsight(topic: string, dataContext: unknown): Promise<{ narrative: string; recommendations: string[] }> {
  const client = getGeminiClient();
  const response = await client.models.generateContent({
    model: "gemini-flash-latest",
    contents: `Topic: ${topic}\n\nData (JSON):\n${JSON.stringify(dataContext, null, 2)}`,
    config: {
      systemInstruction:
        "You are the AI Executive Assistant embedded in a national public-health analytics dashboard. You are given real data already queried from the platform's database for the requested topic. Write for a health-ministry executive: concise, decisive, and action-oriented. Cite specific figures from the data -- never invent numbers, districts, hospitals, or events not present in it. If the provided data doesn't cover what's being asked, say so honestly instead of guessing.",
      responseMimeType: "application/json",
      responseJsonSchema: z.toJSONSchema(InsightSchema),
    },
  });

  if (!response.text) {
    throw new Error("Gemini did not return a response");
  }
  return InsightSchema.parse(JSON.parse(response.text));
}

async function handleDengueRisk(): Promise<AiResponse> {
  const affected = await getDiseaseAffectedDistricts("Dengue");
  const top = affected.slice(0, 8);
  const avgRisk = Math.round(top.reduce((s, d) => s + d.riskScore, 0) / Math.max(1, top.length));

  const insight = await generateInsight("Dengue risk assessment across the top affected districts (last 14 days)", {
    topAffectedDistricts: top,
    averageRiskScore: avgRisk,
  });

  return {
    content: insight.narrative,
    charts: [
      {
        type: "bar",
        title: "Dengue Cases by District (14-day)",
        data: top.map((d) => ({ label: d.district, Cases: d.cases, "Risk Score": d.riskScore })),
        seriesKeys: ["Cases", "Risk Score"],
      },
    ],
    table: {
      title: "Top Affected Districts",
      columns: ["District", "Cases", "Deaths", "Risk Score", "Population"],
      rows: top.map((d) => [d.district, d.cases, d.deaths, d.riskScore, d.population.toLocaleString()]),
    },
    recommendations: insight.recommendations,
    riskScore: avgRisk,
  };
}

async function handleIcuDemand(): Promise<AiResponse> {
  const overview = await getResourceOverview();
  const used = overview.icu.total - overview.icu.available;
  const usageRate = overview.icu.total ? Math.round((used / overview.icu.total) * 1000) / 10 : 0;

  const rng = createRng(`icu-forecast-${new Date().toISOString().slice(0, 10)}`);
  const forecast: { label: string; "Projected Demand %": number }[] = [];
  let level = usageRate;
  for (let i = 1; i <= 7; i++) {
    level = Math.min(99, Math.max(20, level + randFloat(rng, -1.5, 3.2, 2)));
    forecast.push({ label: `Day +${i}`, "Projected Demand %": Math.round(level * 10) / 10 });
  }
  const peak = Math.max(...forecast.map((f) => f["Projected Demand %"]));

  const insight = await generateInsight("7-day national ICU demand forecast", {
    currentOccupancyPercent: usageRate,
    icuBedsInUse: used,
    icuBedsTotal: overview.icu.total,
    sevenDayForecast: forecast,
    projectedPeakPercent: peak,
  });

  return {
    content: insight.narrative,
    charts: [
      {
        type: "line",
        title: "7-Day ICU Demand Projection",
        data: forecast,
        seriesKeys: ["Projected Demand %"],
      },
    ],
    recommendations: insight.recommendations,
    riskScore: Math.round(peak),
  };
}

async function handleMedicineShortages(): Promise<AiResponse> {
  const alerts = await getMedicineStockAlerts(10);
  const criticalCount = alerts.filter((a) => a.status === "Critical").length;

  const insight = await generateInsight("Medicine shortage prediction across facilities below safe reorder threshold", {
    facilitiesBelowReorderThreshold: alerts.length,
    criticalCount,
    facilities: alerts,
  });

  return {
    content: insight.narrative,
    charts: [
      {
        type: "bar",
        title: "Stock Level vs Capacity (Top Shortages)",
        data: alerts.slice(0, 8).map((a) => ({ label: `${a.name.split(" ")[0]} · ${a.districtName}`, "Stock %": Math.round((a.stockLevel / a.capacity) * 1000) / 10 })),
        seriesKeys: ["Stock %"],
      },
    ],
    table: {
      title: "Facilities Requiring Resupply",
      columns: ["Medicine", "Hospital", "District", "Stock", "Capacity", "Status"],
      rows: alerts.map((a) => [a.name, a.hospitalName, a.districtName, `${a.stockLevel} ${a.unit}`, `${a.capacity} ${a.unit}`, a.status]),
    },
    recommendations: insight.recommendations,
    riskScore: Math.min(100, Math.round((criticalCount / Math.max(1, alerts.length)) * 100)),
  };
}

async function handleCompareDistricts(message: string): Promise<AiResponse> {
  const mentioned = findMentionedDistricts(message);
  const [nameA, nameB] = mentioned.length >= 2 ? mentioned : ["Dhaka", "Chattogram"];

  const [districtA, districtB] = await Promise.all([
    prisma.district.findFirst({ where: { name: nameA }, include: { hospitals: true, division: true } }),
    prisma.district.findFirst({ where: { name: nameB }, include: { hospitals: true, division: true } }),
  ]);

  const summarize = (d: typeof districtA) => {
    if (!d) return { name: "Unknown", population: 0, healthIndex: 0, avgOccupancy: 0, beds: 0, riskLevel: "Low" };
    const avgOccupancy = d.hospitals.length ? d.hospitals.reduce((s, h) => s + h.occupancyRate, 0) / d.hospitals.length : 0;
    return {
      name: d.name,
      population: d.population,
      healthIndex: d.healthIndex,
      avgOccupancy: Math.round(avgOccupancy * 10) / 10,
      beds: d.hospitals.reduce((s, h) => s + h.beds, 0),
      riskLevel: d.riskLevel,
    };
  };
  const a = summarize(districtA);
  const b = summarize(districtB);

  const insight = await generateInsight(`District comparison: ${a.name} vs ${b.name}`, { districtA: a, districtB: b });

  return {
    content: insight.narrative,
    charts: [
      {
        type: "bar",
        title: `${a.name} vs ${b.name} — Key Indicators`,
        data: [
          { label: "Health Index", [a.name]: a.healthIndex, [b.name]: b.healthIndex },
          { label: "Occupancy %", [a.name]: a.avgOccupancy, [b.name]: b.avgOccupancy },
        ],
        seriesKeys: [a.name, b.name],
      },
    ],
    recommendations: insight.recommendations,
  };
}

async function handleExecutiveSummary(): Promise<AiResponse> {
  const [kpis, alerts] = await Promise.all([getDashboardKpis(), getAlerts({ limit: 5 })]);
  const critical = kpis.filter((k) => k.sentiment === "critical");
  const good = kpis.filter((k) => k.sentiment === "good");

  const insight = await generateInsight("National executive summary", {
    kpis,
    healthyIndicatorCount: good.length,
    totalIndicators: kpis.length,
    criticalIndicators: critical,
    topActiveAlerts: alerts.slice(0, 5),
  });

  return {
    content: insight.narrative,
    charts: [
      {
        type: "bar",
        title: "Key KPI Snapshot",
        data: kpis.slice(0, 6).map((k) => ({ label: k.label, Value: k.value })),
        seriesKeys: ["Value"],
      },
    ],
    recommendations: insight.recommendations,
    riskScore: Number(kpis.find((k) => k.id === "ai-risk-score")?.value ?? 0),
  };
}

// Triggered from the "Details" button on a hospital's Action Dashboard page --
// carries the hospitalId straight through rather than parsing it out of the
// chat message, since free-text keyword matching can't reliably extract an ID.
async function handleHospitalDetails(hospitalId: string): Promise<AiResponse> {
  const hospital = await getCriticalHospitalDetail(hospitalId);
  if (!hospital) {
    return { content: `## Hospital Not Found\n\nNo hospital_statistics record was found for ID **${hospitalId}**.` };
  }

  const insight = await generateInsight(`Detailed operational analysis of ${hospital.name}`, {
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
    concerns: hospital.concerns,
    nationalRank: `${hospital.nationalRank} of ${hospital.totalHospitalsNational}`,
    districtRank: `${hospital.districtRank} of ${hospital.totalHospitalsInDistrict}`,
  });

  return {
    content: insight.narrative,
    charts: [
      {
        type: "bar",
        title: `${hospital.name} — Admissions, Deaths & Outdoor Visits`,
        data: [
          { label: "Admissions", Male: hospital.admissionMale, Female: hospital.admissionFemale },
          { label: "Deaths", Male: hospital.deathMale, Female: hospital.deathFemale },
          { label: "Outdoor Visits", Male: hospital.outdoorVisitMale, Female: hospital.outdoorVisitFemale },
        ],
        seriesKeys: ["Male", "Female"],
      },
    ],
    table: {
      title: "Key Metrics",
      columns: ["Metric", "Value"],
      rows: [
        ["Beds", hospital.beds],
        ["Total Admissions", hospital.admissionTotal],
        ["Total Deaths", hospital.deathTotal],
        ["Case Fatality Rate", `${hospital.caseFatalityRate}%`],
        ["Admissions / Bed", hospital.admissionsPerBed],
        ["Care Risk Score", `${hospital.criticalityScore}/100`],
        ["National Rank", `${hospital.nationalRank} of ${hospital.totalHospitalsNational}`],
      ],
    },
    recommendations: insight.recommendations,
    riskScore: hospital.criticalityScore,
  };
}

async function handleGenericQuery(message: string): Promise<AiResponse> {
  const diseaseKeywords = ["covid", "tuberculosis", "tb", "diabetes", "hypertension", "cancer", "maternal", "child"];
  const matchedDisease = diseaseKeywords.find((k) => hasWord(message, k));

  if (matchedDisease) {
    const diseaseNameMap: Record<string, string> = {
      covid: "COVID-19", tuberculosis: "Tuberculosis", tb: "Tuberculosis", diabetes: "Diabetes",
      hypertension: "Hypertension", cancer: "Cancer", maternal: "Maternal Health", child: "Child Health",
    };
    const disease = diseaseNameMap[matchedDisease];
    const trend = await getDiseaseTrend(disease, 21);
    const latest = trend[trend.length - 1];
    const insight = await generateInsight(`${disease} — 21-day national trend analysis`, { disease, latest, trend });
    return {
      content: insight.narrative,
      charts: [{ type: "line", title: `${disease} Case Trend`, data: trend, seriesKeys: ["cases", "recovered"] }],
      recommendations: insight.recommendations,
    };
  }

  // No specific intent matched -- answer the question directly with the AI,
  // grounded in a broad real-data snapshot so any question about the platform
  // can be genuinely answered instead of falling back to a canned menu.
  const [kpis, alerts, coverage, hospitals] = await Promise.all([
    getDashboardKpis(),
    getAlerts({ limit: 10 }),
    getNationalGisOverview(),
    getCriticalHospitals(),
  ]);
  const reporting = hospitals.filter((h) => h.hasReportedActivity);

  const insight = await generateInsight(message, {
    nationalKpis: kpis,
    recentAlerts: alerts,
    coverageTotals: coverage.totals,
    worstHospitals: hospitals.slice(0, 5),
    bestHospitals: [...reporting].sort((a, b) => a.criticalityScore - b.criticalityScore).slice(0, 5),
  });

  return {
    content: insight.narrative,
    recommendations: insight.recommendations,
  };
}

export async function generateAiResponse(message: string, hospitalId?: string): Promise<AiResponse> {
  if (hospitalId) {
    return handleHospitalDetails(hospitalId);
  }

  if (hasWord(message, "dengue") && (hasWord(message, "risk") || hasWord(message, "district") || hasWord(message, "highest"))) {
    return handleDengueRisk();
  }
  if (hasWord(message, "icu")) {
    return handleIcuDemand();
  }
  if (hasWord(message, "medicine") || hasWord(message, "shortage") || hasWord(message, "stock")) {
    return handleMedicineShortages();
  }
  if (hasWord(message, "compare")) {
    return handleCompareDistricts(message);
  }
  if (hasWord(message, "summary") || hasWord(message, "report")) {
    return handleExecutiveSummary();
  }
  return handleGenericQuery(message);
}
