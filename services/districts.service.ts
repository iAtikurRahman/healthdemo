import { prisma } from "@/lib/prisma";
import type { DistrictMapDatum, GisFilters } from "@/types";

const RISK_RANK: Record<string, number> = { Low: 0, Moderate: 1, High: 2, Severe: 3 };

export async function getDistrictMapData(filters: GisFilters = {}): Promise<DistrictMapDatum[]> {
  const districts = await prisma.district.findMany({
    where: {
      ...(filters.division ? { division: { name: filters.division } } : {}),
      ...(filters.district ? { name: filters.district } : {}),
    },
    include: {
      division: true,
      hospitals: { select: { beds: true, availableBeds: true } },
    },
  });

  const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : new Date(Date.now() - 14 * 86400000);
  const dateTo = filters.dateTo ? new Date(filters.dateTo) : new Date();

  const caseAgg = await prisma.diseaseRecord.groupBy({
    by: ["districtId"],
    where: {
      ...(filters.disease ? { disease: filters.disease } : {}),
      date: { gte: dateFrom, lte: dateTo },
    },
    _sum: { cases: true, riskScore: true },
    _count: { _all: true },
  });
  const caseMap = new Map(caseAgg.map((c) => [c.districtId, c]));

  return districts
    .map((d) => {
      const agg = caseMap.get(d.id);
      const activeCases = agg?._sum.cases ?? 0;
      const avgRisk = agg && agg._count._all > 0 ? (agg._sum.riskScore ?? 0) / agg._count._all : 0;
      const derivedRisk: DistrictMapDatum["riskLevel"] = filters.disease
        ? avgRisk > 70
          ? "Severe"
          : avgRisk > 45
            ? "High"
            : avgRisk > 20
              ? "Moderate"
              : "Low"
        : (d.riskLevel as DistrictMapDatum["riskLevel"]);

      return {
        id: d.id,
        name: d.name,
        nameBn: d.nameBn,
        division: d.division.name,
        lat: d.lat,
        lng: d.lng,
        population: d.population,
        riskLevel: derivedRisk,
        healthIndex: d.healthIndex,
        activeCases,
        hospitalsCount: d.hospitals.length,
        bedsAvailable: d.hospitals.reduce((s, h) => s + h.availableBeds, 0),
      };
    })
    .sort((a, b) => RISK_RANK[b.riskLevel] - RISK_RANK[a.riskLevel]);
}

export async function getDivisions() {
  return prisma.division.findMany({ orderBy: { name: "asc" } });
}

export async function getDistrictNames() {
  return prisma.district.findMany({ select: { id: true, name: true, divisionId: true }, orderBy: { name: "asc" } });
}
