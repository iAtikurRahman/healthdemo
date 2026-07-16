import { prisma } from "@/lib/prisma";

export async function getEmergencyIncidents() {
  const incidents = await prisma.emergencyIncident.findMany({
    include: { district: { select: { name: true, lat: true, lng: true } } },
    orderBy: { startedAt: "desc" },
  });
  return incidents.map((i) => ({
    id: i.id,
    type: i.type,
    districtName: i.district.name,
    lat: i.district.lat,
    lng: i.district.lng,
    severity: i.severity,
    status: i.status,
    startedAt: i.startedAt.toISOString(),
    affectedPopulation: i.affectedPopulation,
    description: i.description,
  }));
}

export async function getEmergencyStats() {
  const [byType, byStatus, totalAffected, activeCount, emergencyHospitalsCount] = await Promise.all([
    prisma.emergencyIncident.groupBy({ by: ["type"], _count: { _all: true } }),
    prisma.emergencyIncident.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.emergencyIncident.aggregate({ where: { status: "Active" }, _sum: { affectedPopulation: true } }),
    prisma.emergencyIncident.count({ where: { status: "Active" } }),
    prisma.hospital.count({ where: { hasEmergency: true } }),
  ]);
  return {
    byType: byType.map((t) => ({ type: t.type, count: t._count._all })),
    byStatus: byStatus.map((s) => ({ status: s.status, count: s._count._all })),
    activeAffectedPopulation: totalAffected._sum.affectedPopulation ?? 0,
    activeCount,
    emergencyHospitalsCount,
  };
}
