import { prisma } from "@/lib/prisma";
import type { AmbulanceMapDatum } from "@/types";

export async function getAmbulanceMapData(): Promise<AmbulanceMapDatum[]> {
  const ambulances = await prisma.ambulance.findMany({
    include: { district: { select: { name: true } } },
  });
  return ambulances.map((a) => ({
    id: a.id,
    code: a.code,
    districtName: a.district.name,
    status: a.status,
    lat: a.lat,
    lng: a.lng,
  }));
}

export async function getAmbulanceStatusCounts() {
  const grouped = await prisma.ambulance.groupBy({ by: ["status"], _count: { _all: true } });
  return grouped.map((g) => ({ status: g.status, count: g._count._all }));
}
