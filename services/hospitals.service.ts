import { prisma } from "@/lib/prisma";
import type { HospitalMapDatum } from "@/types";

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
