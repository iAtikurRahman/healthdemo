import { prisma } from "@/lib/prisma";
import { DISTRICTS } from "@/mock-data/geo";
import { getDashboardKpis } from "@/services/dashboard.service";
import { getDiseaseAffectedDistricts, getDiseaseTrend } from "@/services/diseases.service";
import { getMedicineStockAlerts, getResourceOverview } from "@/services/resources.service";
import { getAlerts } from "@/services/alerts.service";
import { createRng, randFloat } from "@/utils/random";
import type { ChatMessage } from "@/types";

type AiResponse = Omit<ChatMessage, "id" | "role" | "createdAt">;

function findMentionedDistricts(message: string): string[] {
  const lower = message.toLowerCase();
  const names = Array.from(new Set(DISTRICTS.map((d) => d.name)));
  return names.filter((n) => lower.includes(n.toLowerCase()));
}

async function handleDengueRisk(): Promise<AiResponse> {
  const affected = await getDiseaseAffectedDistricts("Dengue");
  const top = affected.slice(0, 8);
  const avgRisk = Math.round(top.reduce((s, d) => s + d.riskScore, 0) / Math.max(1, top.length));

  const content = `## Dengue Risk Assessment — National

Based on the last 14 days of surveillance data, **${top[0]?.district ?? "N/A"}** shows the highest Dengue risk nationally, with **${top[0]?.cases ?? 0} reported cases** and an AI risk score of **${top[0]?.riskScore ?? 0}/100**.

${top.length} districts currently exceed the elevated-risk threshold. The average risk score across the top affected districts is **${avgRisk}/100**, indicating a ${avgRisk > 60 ? "critical" : avgRisk > 35 ? "moderate-to-high" : "manageable"} national situation requiring ${avgRisk > 60 ? "immediate" : "continued"} vector-control intervention.`;

  return {
    content,
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
    recommendations: [
      `Deploy additional vector-control teams to ${top[0]?.district ?? "the highest-risk district"} within 72 hours.`,
      "Launch community awareness campaigns in the top 5 affected districts.",
      "Pre-position IV fluids and platelet supplies at district hospitals in high-risk zones.",
      "Increase surveillance sampling frequency from weekly to twice-weekly in Severe/High risk districts.",
    ],
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

  const content = `## ICU Demand Forecast — Next 7 Days

Current national ICU occupancy stands at **${usageRate}%** (${used.toLocaleString()} of ${overview.icu.total.toLocaleString()} beds in use). The predictive model projects occupancy to ${peak > usageRate ? "rise" : "hold steady"} toward **${peak}%** over the coming week under current admission trends.

${peak > 85 ? "This exceeds the safe capacity buffer — surge planning is recommended." : peak > 70 ? "This approaches the caution threshold; monitor closely." : "Capacity remains within a comfortable operating margin."}`;

  return {
    content,
    charts: [
      {
        type: "line",
        title: "7-Day ICU Demand Projection",
        data: forecast,
        seriesKeys: ["Projected Demand %"],
      },
    ],
    recommendations: [
      peak > 85 ? "Activate ICU surge protocol and reassign ventilators from lower-demand divisions." : "Maintain current ICU staffing rotation.",
      "Prioritize ICU discharge planning for stabilized patients to free capacity.",
      "Coordinate with private hospitals for overflow ICU arrangements in high-demand divisions.",
    ],
    riskScore: Math.round(peak),
  };
}

async function handleMedicineShortages(): Promise<AiResponse> {
  const alerts = await getMedicineStockAlerts(10);
  const criticalCount = alerts.filter((a) => a.status === "Critical").length;

  const content = `## Medicine Shortage Prediction

The inventory model has identified **${alerts.length} facilities** with medicine stock levels below the safe reorder threshold, including **${criticalCount} in a Critical state** requiring resupply within 72 hours.

The most urgent shortage is **${alerts[0]?.name ?? "N/A"}** at **${alerts[0]?.hospitalName ?? "N/A"}** (${alerts[0]?.districtName ?? ""}), currently at ${alerts[0] ? Math.round((alerts[0].stockLevel / alerts[0].capacity) * 100) : 0}% of capacity.`;

  return {
    content,
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
    recommendations: [
      "Trigger emergency procurement for all Critical-status medicines within 48 hours.",
      "Redistribute surplus stock from Overstocked facilities to nearby Critical/Low facilities.",
      "Adjust national reorder thresholds upward for high-consumption categories (Antibiotics, IV Fluids).",
    ],
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

  const content = `## District Comparison: ${a.name} vs ${b.name}

| Metric | ${a.name} | ${b.name} |
|---|---|---|
| Population | ${a.population.toLocaleString()} | ${b.population.toLocaleString()} |
| Health Index | ${a.healthIndex}/100 | ${b.healthIndex}/100 |
| Avg. Hospital Occupancy | ${a.avgOccupancy}% | ${b.avgOccupancy}% |
| Total Hospital Beds | ${a.beds.toLocaleString()} | ${b.beds.toLocaleString()} |
| Risk Level | ${a.riskLevel} | ${b.riskLevel} |

${a.healthIndex > b.healthIndex ? a.name : b.name} currently records the stronger overall health index, while ${a.avgOccupancy > b.avgOccupancy ? a.name : b.name} is operating under greater hospital capacity pressure.`;

  return {
    content,
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
    recommendations: [
      `Share capacity-management best practices from ${a.avgOccupancy < b.avgOccupancy ? a.name : b.name} with the higher-occupancy district.`,
      "Consider inter-district ambulance rerouting during peak demand periods.",
    ],
  };
}

async function handleExecutiveSummary(): Promise<AiResponse> {
  const [kpis, alerts] = await Promise.all([getDashboardKpis(), getAlerts({ limit: 5 })]);
  const critical = kpis.filter((k) => k.sentiment === "critical");
  const good = kpis.filter((k) => k.sentiment === "good");

  const content = `## National Executive Summary

**Overview:** The national health system is monitoring **${kpis.find((k) => k.id === "population")?.formattedValue}** citizens across 64 districts. ${good.length} of ${kpis.length} tracked indicators are within healthy operating range.

**Areas of concern:** ${critical.length > 0 ? critical.map((k) => `${k.label} (${k.formattedValue}${k.unit ?? ""})`).join(", ") : "None — all indicators nominal."}

**Top active alerts:**
${alerts.slice(0, 5).map((a) => `- **[${a.priority}]** ${a.title}${a.districtName ? ` — ${a.districtName}` : ""}`).join("\n")}

**Outlook:** The AI Risk Score of **${kpis.find((k) => k.id === "ai-risk-score")?.formattedValue}/100** reflects the composite of disease surveillance, hospital capacity, and resource availability signals nationwide.`;

  return {
    content,
    charts: [
      {
        type: "bar",
        title: "Key KPI Snapshot",
        data: kpis.slice(0, 6).map((k) => ({ label: k.label, Value: k.value })),
        seriesKeys: ["Value"],
      },
    ],
    recommendations: [
      "Prioritize resource reallocation toward districts flagged Critical this week.",
      "Schedule a cross-division capacity review for hospitals above 85% occupancy.",
      "Continue AI-driven surveillance polling at current cadence — no escalation required beyond flagged items.",
    ],
    riskScore: Number(kpis.find((k) => k.id === "ai-risk-score")?.value ?? 0),
  };
}

async function handleGenericQuery(message: string): Promise<AiResponse> {
  const diseaseKeywords = ["covid", "tuberculosis", "tb", "diabetes", "hypertension", "cancer", "maternal", "child"];
  const lower = message.toLowerCase();
  const matchedDisease = diseaseKeywords.find((k) => lower.includes(k));

  if (matchedDisease) {
    const diseaseNameMap: Record<string, string> = {
      covid: "COVID-19", tuberculosis: "Tuberculosis", tb: "Tuberculosis", diabetes: "Diabetes",
      hypertension: "Hypertension", cancer: "Cancer", maternal: "Maternal Health", child: "Child Health",
    };
    const disease = diseaseNameMap[matchedDisease];
    const trend = await getDiseaseTrend(disease, 21);
    const latest = trend[trend.length - 1];
    const content = `## ${disease} — 21-Day Trend Analysis

Latest recorded daily figures show **${latest?.cases ?? 0} cases**, **${latest?.recovered ?? 0} recoveries**, and **${latest?.deaths ?? 0} deaths** nationally.

The trend below reflects aggregated case counts across all 64 districts over the past three weeks.`;
    return {
      content,
      charts: [{ type: "line", title: `${disease} Case Trend`, data: trend, seriesKeys: ["cases", "recovered"] }],
      recommendations: [`Continue routine surveillance for ${disease}.`, "Cross-reference with hospital admission data for early warning signals."],
    };
  }

  const content = `## AI Executive Assistant

I can generate live executive analysis from the national health data platform. Try asking about:

- **"Which districts have the highest Dengue risk?"**
- **"Predict ICU demand for the next week."**
- **"Show current medicine shortages."**
- **"Compare Dhaka and Chattogram."**
- **"Generate an executive summary."**

You can also ask about any disease category — COVID-19, Tuberculosis, Diabetes, Hypertension, Cancer, Maternal Health, or Child Health.`;

  return { content };
}

export async function generateAiResponse(message: string): Promise<AiResponse> {
  const lower = message.toLowerCase();

  if (lower.includes("dengue") && (lower.includes("risk") || lower.includes("district") || lower.includes("highest"))) {
    return handleDengueRisk();
  }
  if (lower.includes("icu")) {
    return handleIcuDemand();
  }
  if (lower.includes("medicine") || lower.includes("shortage") || lower.includes("stock")) {
    return handleMedicineShortages();
  }
  if (lower.includes("compare")) {
    return handleCompareDistricts(message);
  }
  if (lower.includes("executive summary") || lower.includes("summary") || lower.includes("report")) {
    return handleExecutiveSummary();
  }
  return handleGenericQuery(message);
}
