import { prisma } from "@/lib/prisma";
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

const ACTIVE_PATIENT_STATUSES = new Set(["Admitted", "Under Treatment", "Critical"]);

interface PressureInput {
  occupancyRate: number;
  icuBeds: number;
  icuAvailable: number;
  ventilators: number;
  ventilatorsInUse: number;
  waitingTimeMin: number;
}

// Composite 0-100 "criticality score", blending currently-admitted patient severity
// with bed/ICU/ventilator strain, so the worst emergency situations surface first.
function computeCriticalityScore(h: PressureInput, activePatients: number, criticalPatients: number, severePatients: number) {
  const criticalRatio = activePatients > 0 ? ((criticalPatients + severePatients) / activePatients) * 100 : 0;
  const icuPressure = h.icuBeds > 0 ? (1 - h.icuAvailable / h.icuBeds) * 100 : 0;
  const ventilatorPressure = h.ventilators > 0 ? (h.ventilatorsInUse / h.ventilators) * 100 : 0;
  const waitingPressure = Math.min(h.waitingTimeMin / 180, 1) * 100;
  const criticalityScore =
    criticalRatio * 0.35 + h.occupancyRate * 0.25 + icuPressure * 0.2 + ventilatorPressure * 0.1 + waitingPressure * 0.1;
  return { criticalRatio, icuPressure, ventilatorPressure, waitingPressure, criticalityScore };
}

// Short, scannable reasons a hospital is flagged — surfaced directly on cards/rows
// so the problem is legible without reading the composite score.
function buildConcerns(h: PressureInput & { criticalPatients: number; severePatients: number; activeDistrictIncidents: number }): string[] {
  const concerns: string[] = [];
  if (h.criticalPatients > 0) concerns.push(`${h.criticalPatients} critical patient${h.criticalPatients > 1 ? "s" : ""}`);
  if (h.severePatients > 0) concerns.push(`${h.severePatients} severe patient${h.severePatients > 1 ? "s" : ""}`);
  if (h.icuBeds > 0 && h.icuAvailable === 0) concerns.push("No ICU beds available");
  else if (h.icuBeds > 0 && h.icuAvailable / h.icuBeds < 0.15) concerns.push("ICU beds nearly full");
  if (h.ventilators > 0 && h.ventilatorsInUse >= h.ventilators) concerns.push("No ventilators available");
  else if (h.ventilators > 0 && h.ventilatorsInUse / h.ventilators > 0.85) concerns.push("Ventilators nearly exhausted");
  if (h.occupancyRate >= 95) concerns.push(`Beds almost full (${h.occupancyRate.toFixed(0)}% occupancy)`);
  else if (h.occupancyRate >= 85) concerns.push(`High bed occupancy (${h.occupancyRate.toFixed(0)}%)`);
  if (h.waitingTimeMin >= 120) concerns.push(`Long waiting time (${h.waitingTimeMin} min)`);
  if (h.activeDistrictIncidents > 0)
    concerns.push(`${h.activeDistrictIncidents} active emergency incident${h.activeDistrictIncidents > 1 ? "s" : ""} nearby`);
  return concerns;
}

export async function getCriticalHospitals(): Promise<CriticalHospital[]> {
  const [hospitals, patientGroups, incidentGroups] = await Promise.all([
    prisma.hospital.findMany({ include: { district: { include: { division: true } } } }),
    prisma.patient.groupBy({ by: ["hospitalId", "status", "severity"], _count: { _all: true } }),
    prisma.emergencyIncident.groupBy({ by: ["districtId"], where: { status: "Active" }, _count: { _all: true } }),
  ]);

  const incidentsByDistrict = new Map(incidentGroups.map((g) => [g.districtId, g._count._all]));

  const patientStatsByHospital = new Map<string, { active: number; critical: number; severe: number }>();
  for (const g of patientGroups) {
    if (!ACTIVE_PATIENT_STATUSES.has(g.status)) continue;
    const entry = patientStatsByHospital.get(g.hospitalId) ?? { active: 0, critical: 0, severe: 0 };
    entry.active += g._count._all;
    if (g.severity === "Critical") entry.critical += g._count._all;
    if (g.severity === "Severe") entry.severe += g._count._all;
    patientStatsByHospital.set(g.hospitalId, entry);
  }

  const results = hospitals.map((h) => {
    const p = patientStatsByHospital.get(h.id) ?? { active: 0, critical: 0, severe: 0 };
    const activeDistrictIncidents = incidentsByDistrict.get(h.districtId) ?? 0;
    const { criticalRatio, criticalityScore } = computeCriticalityScore(h, p.active, p.critical, p.severe);

    return {
      id: h.id,
      name: h.name,
      type: h.type,
      districtName: h.district.name,
      divisionName: h.district.division.name,
      districtRiskLevel: h.district.riskLevel,
      beds: h.beds,
      availableBeds: h.availableBeds,
      occupancyRate: h.occupancyRate,
      icuBeds: h.icuBeds,
      icuAvailable: h.icuAvailable,
      ventilators: h.ventilators,
      ventilatorsInUse: h.ventilatorsInUse,
      waitingTimeMin: h.waitingTimeMin,
      hasEmergency: h.hasEmergency,
      activePatients: p.active,
      criticalPatients: p.critical,
      severePatients: p.severe,
      criticalRatio: Math.round(criticalRatio * 10) / 10,
      activeDistrictIncidents,
      criticalityScore: Math.round(criticalityScore * 10) / 10,
      concerns: buildConcerns({ ...h, criticalPatients: p.critical, severePatients: p.severe, activeDistrictIncidents }),
    };
  });

  return results.sort((a, b) => b.criticalityScore - a.criticalityScore);
}

export async function getCriticalHospitalDetail(id: string): Promise<CriticalHospitalDetail | null> {
  const hospital = await prisma.hospital.findUnique({
    where: { id },
    include: { district: { include: { division: true } }, doctors: { select: { available: true } } },
  });
  if (!hospital) return null;

  const [patientGroups, activeDistrictIncidents, recentIncidents, recentAlerts] = await Promise.all([
    prisma.patient.groupBy({ by: ["status", "severity"], where: { hospitalId: id }, _count: { _all: true } }),
    prisma.emergencyIncident.count({ where: { districtId: hospital.districtId, status: "Active" } }),
    prisma.emergencyIncident.findMany({ where: { districtId: hospital.districtId }, orderBy: { startedAt: "desc" }, take: 5 }),
    prisma.alert.findMany({ where: { districtId: hospital.districtId }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const severityBreakdown = { mild: 0, moderate: 0, severe: 0, critical: 0 };
  let activePatients = 0;
  for (const g of patientGroups) {
    if (!ACTIVE_PATIENT_STATUSES.has(g.status)) continue;
    activePatients += g._count._all;
    const key = g.severity.toLowerCase() as keyof typeof severityBreakdown;
    if (key in severityBreakdown) severityBreakdown[key] += g._count._all;
  }
  const criticalPatients = severityBreakdown.critical;
  const severePatients = severityBreakdown.severe;

  const { criticalRatio, icuPressure, ventilatorPressure, waitingPressure, criticalityScore } = computeCriticalityScore(
    hospital,
    activePatients,
    criticalPatients,
    severePatients
  );

  return {
    id: hospital.id,
    name: hospital.name,
    type: hospital.type,
    districtName: hospital.district.name,
    divisionName: hospital.district.division.name,
    districtRiskLevel: hospital.district.riskLevel,
    beds: hospital.beds,
    availableBeds: hospital.availableBeds,
    occupancyRate: hospital.occupancyRate,
    icuBeds: hospital.icuBeds,
    icuAvailable: hospital.icuAvailable,
    ventilators: hospital.ventilators,
    ventilatorsInUse: hospital.ventilatorsInUse,
    waitingTimeMin: hospital.waitingTimeMin,
    hasEmergency: hospital.hasEmergency,
    activePatients,
    criticalPatients,
    severePatients,
    criticalRatio: Math.round(criticalRatio * 10) / 10,
    activeDistrictIncidents,
    criticalityScore: Math.round(criticalityScore * 10) / 10,
    concerns: buildConcerns({ ...hospital, criticalPatients, severePatients, activeDistrictIncidents }),
    nursesCount: hospital.nursesCount,
    doctorsTotal: hospital.doctors.length,
    doctorsAvailable: hospital.doctors.filter((d) => d.available).length,
    scoreBreakdown: {
      patientSeverityPressure: Math.round(criticalRatio * 10) / 10,
      occupancyPressure: Math.round(hospital.occupancyRate * 10) / 10,
      icuPressure: Math.round(icuPressure * 10) / 10,
      ventilatorPressure: Math.round(ventilatorPressure * 10) / 10,
      waitingPressure: Math.round(waitingPressure * 10) / 10,
    },
    severityBreakdown,
    recentIncidents: recentIncidents.map((i) => ({
      id: i.id,
      type: i.type,
      severity: i.severity,
      status: i.status,
      startedAt: i.startedAt.toISOString(),
      affectedPopulation: i.affectedPopulation,
      description: i.description,
    })),
    recentAlerts: recentAlerts.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      category: a.category,
      priority: a.priority,
      aiGenerated: a.aiGenerated,
      createdAt: a.createdAt.toISOString(),
    })),
  };
}
