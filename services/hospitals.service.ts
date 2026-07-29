import { prisma } from "@/lib/prisma";
import { toTitleCase } from "@/lib/text";
import type { HospitalMapDatum, CriticalHospital, CriticalHospitalDetail } from "@/types";

export interface HospitalFilters {
  search?: string;
  division?: string;
  district?: string;
  type?: string;
  sort?: "performance" | "occupancy" | "waiting" | "satisfaction";
  limit?: number;
}

export async function getHospitals(filters: HospitalFilters = {}) {
  const hospitals = await prisma.hospital.findMany({
    where: {
      ...(filters.search ? { name: { contains: filters.search } } : {}),
      ...(filters.type ? { type: filters.type } : {}),
      district: {
        ...(filters.division ? { division: { name: filters.division } } : {}),
        ...(filters.district ? { name: filters.district } : {}),
      },
    },
    include: {
      district: { include: { division: true } },
      doctors: { select: { available: true } },
    },
    orderBy:
      filters.sort === "occupancy"
        ? { occupancyRate: "desc" }
        : filters.sort === "waiting"
          ? { waitingTimeMin: "asc" }
          : filters.sort === "satisfaction"
            ? { satisfactionScore: "desc" }
            : { performanceScore: "desc" },
    take: filters.limit ?? 100,
  });

  return hospitals.map((h) => ({
    id: h.id,
    name: h.name,
    type: h.type,
    districtName: h.district.name,
    divisionName: h.district.division.name,
    lat: h.lat,
    lng: h.lng,
    beds: h.beds,
    availableBeds: h.availableBeds,
    icuBeds: h.icuBeds,
    icuAvailable: h.icuAvailable,
    ventilators: h.ventilators,
    ventilatorsInUse: h.ventilatorsInUse,
    occupancyRate: h.occupancyRate,
    waitingTimeMin: h.waitingTimeMin,
    satisfactionScore: h.satisfactionScore,
    performanceScore: h.performanceScore,
    hasEmergency: h.hasEmergency,
    doctorsTotal: h.doctors.length,
    doctorsAvailable: h.doctors.filter((d) => d.available).length,
  }));
}

export async function getHospitalMapData(): Promise<HospitalMapDatum[]> {
  const hospitals = await prisma.hospital.findMany({
    select: { id: true, name: true, type: true, lat: true, lng: true, occupancyRate: true, hasEmergency: true, district: { select: { name: true } } },
  });
  return hospitals.map((h) => ({
    id: h.id,
    name: h.name,
    type: h.type,
    districtName: h.district.name,
    lat: h.lat,
    lng: h.lng,
    occupancyRate: h.occupancyRate,
    hasEmergency: h.hasEmergency,
  }));
}

export async function getHospitalStats() {
  const agg = await prisma.hospital.aggregate({
    _avg: { waitingTimeMin: true, occupancyRate: true, satisfactionScore: true, performanceScore: true },
    _sum: { beds: true, availableBeds: true },
    _count: { _all: true },
  });
  return agg;
}

interface HealthMetrics {
  beds: number;
  admissionMale: number;
  admissionFemale: number;
  admissionTotal: number;
  deathMale: number;
  deathFemale: number;
  deathTotal: number;
  outdoorVisitMale: number;
  outdoorVisitFemale: number;
  outdoorVisitChild: number;
  outdoorVisitTotal: number;
}

// Composite 0-100 "care risk score" built from hospital_statistics' real report
// columns: fatality outcomes matter most, overcrowding and outdoor-visit burden
// contribute the rest. Thresholds were calibrated against the actual data
// distribution (see plan) so the top of the ranking stays a small, meaningful set.
function computeCareRiskScore(h: HealthMetrics) {
  const caseFatalityRate = h.admissionTotal > 0 ? (h.deathTotal / h.admissionTotal) * 100 : 0;
  const admissionsPerBed = h.beds > 0 ? h.admissionTotal / h.beds : 0;
  const outdoorVisitsPerBed = h.beds > 0 ? h.outdoorVisitTotal / h.beds : 0;

  const fatalityPressure = Math.min(100, caseFatalityRate * 20);
  const overcrowdingPressure = Math.min(100, admissionsPerBed);
  const outdoorBurdenPressure = Math.min(100, (outdoorVisitsPerBed / 540) * 100);

  const criticalityScore = fatalityPressure * 0.5 + overcrowdingPressure * 0.3 + outdoorBurdenPressure * 0.2;

  return { caseFatalityRate, admissionsPerBed, outdoorVisitsPerBed, fatalityPressure, overcrowdingPressure, outdoorBurdenPressure, criticalityScore };
}

// Short, scannable reasons a hospital is flagged — surfaced directly on cards/rows
// so the problem is legible without reading the composite score.
function buildHospitalConcerns(h: HealthMetrics, derived: ReturnType<typeof computeCareRiskScore>): string[] {
  const concerns: string[] = [];
  if (h.admissionTotal > 0 && derived.caseFatalityRate >= 1) {
    concerns.push(`High case fatality rate (${derived.caseFatalityRate.toFixed(1)}%)`);
  }
  if (h.beds > 0 && derived.admissionsPerBed >= 70) {
    concerns.push(`Overcrowded — ${Math.round(derived.admissionsPerBed)} admissions per bed`);
  }
  if (h.beds > 0 && derived.outdoorVisitsPerBed >= 300) {
    concerns.push(`High outdoor patient load — ${Math.round(derived.outdoorVisitsPerBed)} visits per bed`);
  }
  if (h.beds === 0) concerns.push("No bed capacity recorded");
  if (h.admissionTotal === 0 && h.outdoorVisitTotal === 0) concerns.push("No 2011 activity data reported");
  return concerns;
}

export async function getCriticalHospitals(): Promise<CriticalHospital[]> {
  const [stats, areas] = await Promise.all([
    prisma.hospitalStatistic.findMany({
      select: {
        id: true,
        reportYear: true,
        hospitalName: true,
        no_of_beds: true,
        admission_male: true,
        admission_female: true,
        admission_total: true,
        death_male: true,
        death_female: true,
        death_total: true,
        outdoor_visit_male: true,
        outdoor_visit_female: true,
        outdoor_visit_child: true,
        outdoor_visit_total: true,
        divisionId: true,
        districtId: true,
        upazilaId: true,
        district: true,
        upazila: true,
      },
    }),
    prisma.areaInfo.findMany({
      where: { areaType: { in: [1, 2, 4] }, status: 1 },
      select: { id: true, name: true, areaType: true },
    }),
  ]);

  const nameById = new Map(areas.map((a) => [a.id, toTitleCase(a.name)]));

  const results = stats.map((s) => {
    const metrics: HealthMetrics = {
      beds: s.no_of_beds ?? 0,
      admissionMale: s.admission_male ?? 0,
      admissionFemale: s.admission_female ?? 0,
      admissionTotal: s.admission_total ?? 0,
      deathMale: s.death_male ?? 0,
      deathFemale: s.death_female ?? 0,
      deathTotal: s.death_total ?? 0,
      outdoorVisitMale: s.outdoor_visit_male ?? 0,
      outdoorVisitFemale: s.outdoor_visit_female ?? 0,
      outdoorVisitChild: s.outdoor_visit_child ?? 0,
      outdoorVisitTotal: s.outdoor_visit_total ?? 0,
    };
    const derived = computeCareRiskScore(metrics);
    const concerns = buildHospitalConcerns(metrics, derived);

    return {
      id: s.id,
      name: s.hospitalName,
      reportYear: s.reportYear,
      divisionName: s.divisionId != null ? (nameById.get(s.divisionId) ?? "Unknown") : "Unknown",
      districtName: s.districtId != null ? (nameById.get(s.districtId) ?? toTitleCase(s.district)) : toTitleCase(s.district),
      upazilaName: s.upazilaId != null ? (nameById.get(s.upazilaId) ?? toTitleCase(s.upazila)) : toTitleCase(s.upazila),
      ...metrics,
      caseFatalityRate: Math.round(derived.caseFatalityRate * 10) / 10,
      admissionsPerBed: Math.round(derived.admissionsPerBed * 10) / 10,
      outdoorVisitsPerBed: Math.round(derived.outdoorVisitsPerBed * 10) / 10,
      criticalityScore: Math.round(derived.criticalityScore * 10) / 10,
      concerns,
      hasReportedActivity: metrics.admissionTotal > 0 || metrics.outdoorVisitTotal > 0,
    };
  });

  return results.sort((a, b) => b.criticalityScore - a.criticalityScore);
}

export async function getCriticalHospitalDetail(idParam: string): Promise<CriticalHospitalDetail | null> {
  const id = Number(idParam);
  if (!Number.isInteger(id)) return null;

  const all = await getCriticalHospitals();
  const hospital = all.find((h) => h.id === id);
  if (!hospital) return null;

  const nationalRank = all.findIndex((h) => h.id === id) + 1;
  const districtPeers = all.filter((h) => h.districtName === hospital.districtName).sort((a, b) => b.criticalityScore - a.criticalityScore);
  const districtRank = districtPeers.findIndex((h) => h.id === id) + 1;
  const divisionPeers = all.filter((h) => h.divisionName === hospital.divisionName).sort((a, b) => b.criticalityScore - a.criticalityScore);
  const divisionRank = divisionPeers.findIndex((h) => h.id === id) + 1;

  const derived = computeCareRiskScore(hospital);

  return {
    ...hospital,
    nationalRank,
    totalHospitalsNational: all.length,
    districtRank,
    totalHospitalsInDistrict: districtPeers.length,
    divisionRank,
    totalHospitalsInDivision: divisionPeers.length,
    scoreBreakdown: {
      fatalityPressure: Math.round(derived.fatalityPressure * 10) / 10,
      overcrowdingPressure: Math.round(derived.overcrowdingPressure * 10) / 10,
      outdoorBurdenPressure: Math.round(derived.outdoorBurdenPressure * 10) / 10,
    },
    districtPeers: districtPeers
      .filter((h) => h.id !== id)
      .slice(0, 8)
      .map((h) => ({ id: h.id, name: h.name, upazilaName: h.upazilaName, criticalityScore: h.criticalityScore })),
  };
}
