import { prisma } from "@/lib/prisma";
import { DISEASES } from "@/mock-data/geo";
import { formatDate } from "@/lib/format";

export async function getDiseaseOverview() {
  const since = new Date(Date.now() - 30 * 86400000);
  const grouped = await prisma.diseaseRecord.groupBy({
    by: ["disease"],
    where: { date: { gte: since } },
    _sum: { cases: true, deaths: true, recovered: true },
    _avg: { riskScore: true },
  });

  const prevSince = new Date(Date.now() - 60 * 86400000);
  const prevGrouped = await prisma.diseaseRecord.groupBy({
    by: ["disease"],
    where: { date: { gte: prevSince, lt: since } },
    _sum: { cases: true },
  });
  const prevMap = new Map(prevGrouped.map((p) => [p.disease, p._sum.cases ?? 0]));

  return DISEASES.map((disease) => {
    const g = grouped.find((x) => x.disease === disease);
    const cases = g?._sum.cases ?? 0;
    const prevCases = prevMap.get(disease) ?? 0;
    const deltaPercent = prevCases > 0 ? ((cases - prevCases) / prevCases) * 100 : 0;
    return {
      disease,
      cases,
      deaths: g?._sum.deaths ?? 0,
      recovered: g?._sum.recovered ?? 0,
      avgRiskScore: Math.round(g?._avg.riskScore ?? 0),
      deltaPercent: Math.round(deltaPercent * 10) / 10,
    };
  });
}

export async function getDiseaseTrend(disease: string, days = 30) {
  const since = new Date(Date.now() - days * 86400000);
  const records = await prisma.diseaseRecord.findMany({
    where: { disease, date: { gte: since } },
    select: { date: true, cases: true, deaths: true, recovered: true },
  });

  const byDate = new Map<string, { cases: number; deaths: number; recovered: number }>();
  for (const r of records) {
    const key = formatDate(r.date);
    const entry = byDate.get(key) ?? { cases: 0, deaths: 0, recovered: 0 };
    entry.cases += r.cases;
    entry.deaths += r.deaths;
    entry.recovered += r.recovered;
    byDate.set(key, entry);
  }
  return Array.from(byDate.entries())
    .map(([label, v]) => ({ label, ...v }))
    .sort((a, b) => new Date(a.label).getTime() - new Date(b.label).getTime());
}

export async function getDiseaseAffectedDistricts(disease: string) {
  const since = new Date(Date.now() - 14 * 86400000);
  const grouped = await prisma.diseaseRecord.groupBy({
    by: ["districtId"],
    where: { disease, date: { gte: since } },
    _sum: { cases: true, deaths: true },
    _avg: { riskScore: true },
    orderBy: { _sum: { cases: "desc" } },
    take: 10,
  });
  const districts = await prisma.district.findMany({
    where: { id: { in: grouped.map((g) => g.districtId) } },
    select: { id: true, name: true, population: true },
  });
  const dMap = new Map(districts.map((d) => [d.id, d]));
  return grouped.map((g) => ({
    district: dMap.get(g.districtId)?.name ?? "Unknown",
    cases: g._sum.cases ?? 0,
    deaths: g._sum.deaths ?? 0,
    riskScore: Math.round(g._avg.riskScore ?? 0),
    population: dMap.get(g.districtId)?.population ?? 0,
  }));
}
