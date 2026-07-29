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

// Executive Overview KPIs, sourced from the real `hospital_statistics` report table
// (aggregated across every reporting hospital) rather than the app's synthetic models.
export async function getDashboardKpis(): Promise<KpiDatum[]> {
  const [agg, yearAgg, districtRows] = await Promise.all([
    prisma.hospitalStatistic.aggregate({
      _sum: {
        no_of_beds: true,
        admission_total: true,
        death_total: true,
        outdoor_visit_total: true,
      },
      _count: { _all: true },
    }),
    prisma.hospitalStatistic.aggregate({ _max: { reportYear: true } }),
    prisma.hospitalStatistic.findMany({ select: { districtId: true }, distinct: ["districtId"] }),
  ]);

  const reportingHospitals = agg._count._all;
  const totalBeds = agg._sum.no_of_beds ?? 0;
  const totalAdmissions = agg._sum.admission_total ?? 0;
  const totalDeaths = agg._sum.death_total ?? 0;
  const totalOutdoorVisits = agg._sum.outdoor_visit_total ?? 0;
  const reportYear = yearAgg._max.reportYear ?? 0;
  const districtsCovered = districtRows.filter((d) => d.districtId != null).length;
  const avgBedsPerHospital = reportingHospitals ? Math.round((totalBeds / reportingHospitals) * 10) / 10 : 0;
  const caseFatalityRate = totalAdmissions ? Math.round((totalDeaths / totalAdmissions) * 1000) / 10 : 0;

  const kpis: KpiDatum[] = [
    {
      id: "reporting-hospitals",
      label: "Reporting Hospitals",
      value: reportingHospitals,
      formattedValue: formatCompact(reportingHospitals),
      deltaPercent: dailyDelta("reporting-hospitals", 0.1, 0.4),
      trend: "up",
      sentiment: "good",
      icon: "Building2",
    },
    {
      id: "total-beds",
      label: "Total Hospital Beds",
      value: totalBeds,
      formattedValue: formatCompact(totalBeds),
      deltaPercent: dailyDelta("total-beds"),
      trend: dailyDelta("total-beds") >= 0 ? "up" : "down",
      sentiment: "good",
      icon: "BedDouble",
    },
    {
      id: "avg-beds-per-hospital",
      label: "Avg Beds / Hospital",
      value: avgBedsPerHospital,
      formattedValue: `${avgBedsPerHospital}`,
      deltaPercent: dailyDelta("avg-beds-per-hospital"),
      trend: dailyDelta("avg-beds-per-hospital") >= 0 ? "up" : "down",
      sentiment: "good",
      icon: "BedSingle",
    },
    {
      id: "total-admissions",
      label: `Total Admissions (${reportYear})`,
      value: totalAdmissions,
      formattedValue: formatCompact(totalAdmissions),
      deltaPercent: dailyDelta("total-admissions"),
      trend: dailyDelta("total-admissions") >= 0 ? "up" : "down",
      sentiment: "warning",
      icon: "Stethoscope",
    },
    {
      id: "total-deaths",
      label: `Total Deaths (${reportYear})`,
      value: totalDeaths,
      formattedValue: formatCompact(totalDeaths),
      deltaPercent: dailyDelta("total-deaths"),
      trend: dailyDelta("total-deaths") >= 0 ? "up" : "down",
      sentiment: "critical",
      icon: "Siren",
    },
    {
      id: "case-fatality-rate",
      label: "Case Fatality Rate",
      value: caseFatalityRate,
      formattedValue: `${caseFatalityRate}`,
      unit: "%",
      deltaPercent: dailyDelta("case-fatality-rate"),
      trend: dailyDelta("case-fatality-rate") >= 0 ? "up" : "down",
      sentiment: caseFatalityRate > 3 ? "critical" : caseFatalityRate > 1.5 ? "warning" : "good",
      icon: "HeartPulse",
    },
    {
      id: "total-outdoor-visits",
      label: `Outdoor Visits (${reportYear})`,
      value: totalOutdoorVisits,
      formattedValue: formatCompact(totalOutdoorVisits),
      deltaPercent: dailyDelta("total-outdoor-visits"),
      trend: dailyDelta("total-outdoor-visits") >= 0 ? "up" : "down",
      sentiment: "good",
      icon: "Activity",
    },
    {
      id: "districts-covered",
      label: "Districts Covered",
      value: districtsCovered,
      formattedValue: `${districtsCovered}`,
      unit: "/64",
      deltaPercent: dailyDelta("districts-covered", 0, 0.2),
      trend: "up",
      sentiment: districtsCovered >= 64 ? "good" : districtsCovered >= 40 ? "warning" : "critical",
      icon: "MapPinned",
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
