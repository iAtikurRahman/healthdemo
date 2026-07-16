import { prisma } from "@/lib/prisma";
import { createRng, randFloat } from "@/utils/random";
import { formatCompact } from "@/lib/format";
import type { KpiDatum, ChartPoint } from "@/types";

function dailySeed(key: string) {
  const today = new Date().toISOString().slice(0, 10);
  return createRng(`${key}-${today}`);
}

function dailyDelta(key: string, min = -6, max = 6) {
  return randFloat(dailySeed(key), min, max, 1);
}

export async function getDashboardKpis(): Promise<KpiDatum[]> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    populationAgg,
    todaysPatients,
    hospitalAgg,
    criticalAlerts,
    medicineAgg,
    emergencyCases,
    healthIndexAgg,
    riskAgg,
  ] = await Promise.all([
    prisma.district.aggregate({ _sum: { population: true } }),
    prisma.patient.count({ where: { admissionDate: { gte: startOfToday } } }),
    prisma.hospital.aggregate({ _avg: { occupancyRate: true }, _sum: { availableBeds: true } }),
    prisma.alert.count({ where: { priority: { in: ["Critical", "High"] }, createdAt: { gte: new Date(Date.now() - 7 * 86400000) } } }),
    prisma.medicineStock.aggregate({ _sum: { stockLevel: true, capacity: true } }),
    prisma.patient.count({ where: { severity: "Critical", status: { in: ["Admitted", "Under Treatment", "Critical"] } } }),
    prisma.district.aggregate({ _avg: { healthIndex: true } }),
    prisma.diseaseRecord.aggregate({
      where: { date: { gte: new Date(Date.now() - 7 * 86400000) } },
      _avg: { riskScore: true },
    }),
  ]);

  const population = populationAgg._sum.population ?? 0;
  const occupancy = Math.round((hospitalAgg._avg.occupancyRate ?? 0) * 10) / 10;
  const availableBeds = hospitalAgg._sum.availableBeds ?? 0;
  const medicineStockPct = medicineAgg._sum.capacity
    ? Math.round(((medicineAgg._sum.stockLevel ?? 0) / medicineAgg._sum.capacity) * 1000) / 10
    : 0;
  const healthIndex = Math.round((healthIndexAgg._avg.healthIndex ?? 0) * 10) / 10;
  const aiRiskScore = Math.round(riskAgg._avg.riskScore ?? 0);

  const kpis: KpiDatum[] = [
    {
      id: "population",
      label: "Population Monitored",
      value: population,
      formattedValue: formatCompact(population),
      deltaPercent: dailyDelta("population", 0.1, 0.4),
      trend: "up",
      sentiment: "good",
      icon: "Users",
    },
    {
      id: "todays-patients",
      label: "Today's Patients",
      value: todaysPatients,
      formattedValue: formatCompact(todaysPatients),
      deltaPercent: dailyDelta("todays-patients"),
      trend: dailyDelta("todays-patients") >= 0 ? "up" : "down",
      sentiment: "warning",
      icon: "Stethoscope",
    },
    {
      id: "hospital-occupancy",
      label: "Hospital Occupancy",
      value: occupancy,
      formattedValue: `${occupancy}`,
      unit: "%",
      deltaPercent: dailyDelta("occupancy"),
      trend: dailyDelta("occupancy") >= 0 ? "up" : "down",
      sentiment: occupancy > 85 ? "critical" : occupancy > 70 ? "warning" : "good",
      icon: "BedDouble",
    },
    {
      id: "disease-alerts",
      label: "Disease Alerts",
      value: criticalAlerts,
      formattedValue: `${criticalAlerts}`,
      deltaPercent: dailyDelta("disease-alerts"),
      trend: dailyDelta("disease-alerts") >= 0 ? "up" : "down",
      sentiment: criticalAlerts > 15 ? "critical" : criticalAlerts > 8 ? "warning" : "good",
      icon: "Siren",
    },
    {
      id: "available-beds",
      label: "Available Beds",
      value: availableBeds,
      formattedValue: formatCompact(availableBeds),
      deltaPercent: dailyDelta("available-beds"),
      trend: dailyDelta("available-beds") >= 0 ? "up" : "down",
      sentiment: "good",
      icon: "BedSingle",
    },
    {
      id: "medicine-stock",
      label: "Medicine Stock Health",
      value: medicineStockPct,
      formattedValue: `${medicineStockPct}`,
      unit: "%",
      deltaPercent: dailyDelta("medicine-stock"),
      trend: dailyDelta("medicine-stock") >= 0 ? "up" : "down",
      sentiment: medicineStockPct < 30 ? "critical" : medicineStockPct < 50 ? "warning" : "good",
      icon: "Pill",
    },
    {
      id: "emergency-cases",
      label: "Emergency Cases",
      value: emergencyCases,
      formattedValue: `${emergencyCases}`,
      deltaPercent: dailyDelta("emergency-cases"),
      trend: dailyDelta("emergency-cases") >= 0 ? "up" : "down",
      sentiment: emergencyCases > 400 ? "critical" : emergencyCases > 200 ? "warning" : "good",
      icon: "HeartPulse",
    },
    {
      id: "health-index",
      label: "National Health Index",
      value: healthIndex,
      formattedValue: `${healthIndex}`,
      unit: "/100",
      deltaPercent: dailyDelta("health-index", -2, 2),
      trend: dailyDelta("health-index", -2, 2) >= 0 ? "up" : "down",
      sentiment: healthIndex > 70 ? "good" : healthIndex > 55 ? "warning" : "critical",
      icon: "Activity",
    },
    {
      id: "ai-risk-score",
      label: "AI Risk Score",
      value: aiRiskScore,
      formattedValue: `${aiRiskScore}`,
      unit: "/100",
      deltaPercent: dailyDelta("ai-risk-score"),
      trend: dailyDelta("ai-risk-score") >= 0 ? "up" : "down",
      sentiment: aiRiskScore > 65 ? "critical" : aiRiskScore > 40 ? "warning" : "good",
      icon: "BrainCircuit",
    },
  ];

  return kpis;
}

const PRIMARY_DISEASES = ["Dengue", "COVID-19", "Tuberculosis", "Diabetes"];

export async function getDiseaseTrendChart(days = 21): Promise<ChartPoint[]> {
  const since = new Date(Date.now() - days * 86400000);
  const records = await prisma.diseaseRecord.findMany({
    where: { disease: { in: PRIMARY_DISEASES }, date: { gte: since } },
    select: { date: true, disease: true, cases: true },
  });
  const byDate = new Map<string, ChartPoint>();
  for (const r of records) {
    const key = r.date.toISOString().slice(0, 10);
    const label = new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short" }).format(r.date);
    const point = byDate.get(key) ?? { label, dateKey: key };
    point[r.disease] = ((point[r.disease] as number) ?? 0) + r.cases;
    byDate.set(key, point);
  }
  return Array.from(byDate.values()).sort((a, b) => String(a.dateKey).localeCompare(String(b.dateKey)));
}

export async function getHospitalPerformanceByDivision(): Promise<ChartPoint[]> {
  const hospitals = await prisma.hospital.findMany({
    select: { performanceScore: true, occupancyRate: true, district: { select: { division: { select: { name: true } } } } },
  });
  const byDivision = new Map<string, { perf: number; occ: number; count: number }>();
  for (const h of hospitals) {
    const div = h.district.division.name;
    const entry = byDivision.get(div) ?? { perf: 0, occ: 0, count: 0 };
    entry.perf += h.performanceScore;
    entry.occ += h.occupancyRate;
    entry.count += 1;
    byDivision.set(div, entry);
  }
  return Array.from(byDivision.entries()).map(([label, v]) => ({
    label,
    Performance: Math.round((v.perf / v.count) * 10) / 10,
    Occupancy: Math.round((v.occ / v.count) * 10) / 10,
  }));
}

export async function getIcuUsageByDivision(): Promise<ChartPoint[]> {
  const hospitals = await prisma.hospital.findMany({
    select: { icuBeds: true, icuAvailable: true, district: { select: { division: { select: { name: true } } } } },
  });
  const byDivision = new Map<string, { icuBeds: number; icuAvailable: number }>();
  for (const h of hospitals) {
    const div = h.district.division.name;
    const entry = byDivision.get(div) ?? { icuBeds: 0, icuAvailable: 0 };
    entry.icuBeds += h.icuBeds;
    entry.icuAvailable += h.icuAvailable;
    byDivision.set(div, entry);
  }
  return Array.from(byDivision.entries()).map(([label, v]) => ({
    label,
    "ICU In Use": v.icuBeds - v.icuAvailable,
    "ICU Available": v.icuAvailable,
  }));
}

export async function getDoctorAvailabilityByDivision(): Promise<ChartPoint[]> {
  const doctors = await prisma.doctor.findMany({
    select: { available: true, hospital: { select: { district: { select: { division: { select: { name: true } } } } } } },
  });
  const byDivision = new Map<string, { available: number; total: number }>();
  for (const d of doctors) {
    const div = d.hospital.district.division.name;
    const entry = byDivision.get(div) ?? { available: 0, total: 0 };
    entry.total += 1;
    if (d.available) entry.available += 1;
    byDivision.set(div, entry);
  }
  return Array.from(byDivision.entries()).map(([label, v]) => ({
    label,
    "Availability %": Math.round((v.available / v.total) * 1000) / 10,
  }));
}

export async function getMedicineConsumptionByCategory(): Promise<ChartPoint[]> {
  const grouped = await prisma.medicineStock.groupBy({
    by: ["category"],
    _sum: { stockLevel: true, capacity: true },
  });
  return grouped.map((g) => ({
    label: g.category,
    Consumed: (g._sum.capacity ?? 0) - (g._sum.stockLevel ?? 0),
    Remaining: g._sum.stockLevel ?? 0,
  }));
}

export async function getMaternalChildHealthTrend(days = 30): Promise<ChartPoint[]> {
  const since = new Date(Date.now() - days * 86400000);
  const records = await prisma.diseaseRecord.findMany({
    where: { disease: { in: ["Maternal Health", "Child Health"] }, date: { gte: since } },
    select: { date: true, disease: true, cases: true, recovered: true },
  });
  const byDate = new Map<string, ChartPoint>();
  for (const r of records) {
    const key = r.date.toISOString().slice(0, 10);
    const label = new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short" }).format(r.date);
    const point = byDate.get(key) ?? { label, dateKey: key };
    const seriesKey = r.disease === "Maternal Health" ? "Maternal Cases" : "Child Cases";
    point[seriesKey] = ((point[seriesKey] as number) ?? 0) + r.cases;
    byDate.set(key, point);
  }
  return Array.from(byDate.values()).sort((a, b) => String(a.dateKey).localeCompare(String(b.dateKey)));
}

export async function getVaccinationProgressTrend(): Promise<ChartPoint[]> {
  const records = await prisma.vaccination.findMany({
    select: { date: true, dosesAdministered: true, targetPopulation: true },
  });
  const byMonth = new Map<string, { doses: number; target: number }>();
  for (const r of records) {
    const key = `${r.date.getFullYear()}-${(r.date.getMonth() + 1).toString().padStart(2, "0")}`;
    const entry = byMonth.get(key) ?? { doses: 0, target: 0 };
    entry.doses += r.dosesAdministered;
    entry.target += r.targetPopulation;
    byMonth.set(key, entry);
  }
  return Array.from(byMonth.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, v]) => ({
      label: new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(`${key}-01`)),
      "Coverage %": Math.round((v.doses / v.target) * 1000) / 10,
    }));
}

const DIVISIONS_ORDER = ["Dhaka", "Chattogram", "Rajshahi", "Khulna", "Barishal", "Sylhet", "Rangpur", "Mymensingh"];

export function getBudgetUtilizationByDivision(): ChartPoint[] {
  return DIVISIONS_ORDER.map((division) => {
    const rng = createRng(`budget-${division}-${new Date().toISOString().slice(0, 7)}`);
    const allocated = Math.round(randFloat(rng, 80, 260, 1) * 10) / 10;
    const utilized = Math.round(allocated * randFloat(rng, 0.55, 0.96, 3) * 10) / 10;
    return { label: division, "Allocated (Cr BDT)": allocated, "Utilized (Cr BDT)": utilized };
  });
}
