import { prisma } from "@/lib/prisma";
import { createRng, randInt } from "@/utils/random";

export async function getResourceOverview() {
  const [doctorAgg, doctorAvailable, hospitalAgg, medicineByCategory, medicineCritical, ambulanceGrouped] = await Promise.all([
    prisma.doctor.aggregate({ _count: { _all: true } }),
    prisma.doctor.count({ where: { available: true } }),
    prisma.hospital.aggregate({
      _sum: { nursesCount: true, icuBeds: true, icuAvailable: true, ventilators: true, ventilatorsInUse: true, beds: true, availableBeds: true },
    }),
    prisma.medicineStock.groupBy({
      by: ["category"],
      _sum: { stockLevel: true, capacity: true },
    }),
    prisma.medicineStock.count({ where: { status: { in: ["Critical", "Low"] } } }),
    prisma.ambulance.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  // Blood bank isn't modeled in the schema — deterministic synthetic figures, clearly demo-only.
  const rng = createRng("blood-bank-overview");
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const bloodBank = bloodGroups.map((group) => {
    const capacity = randInt(rng, 800, 2500);
    const units = randInt(rng, 100, capacity);
    return { group, units, capacity, status: units / capacity < 0.2 ? "Critical" : units / capacity < 0.4 ? "Low" : "Adequate" };
  });

  return {
    doctors: { total: doctorAgg._count._all, available: doctorAvailable },
    nurses: { total: hospitalAgg._sum.nursesCount ?? 0 },
    icu: { total: hospitalAgg._sum.icuBeds ?? 0, available: hospitalAgg._sum.icuAvailable ?? 0 },
    ventilators: { total: hospitalAgg._sum.ventilators ?? 0, inUse: hospitalAgg._sum.ventilatorsInUse ?? 0 },
    beds: { total: hospitalAgg._sum.beds ?? 0, available: hospitalAgg._sum.availableBeds ?? 0 },
    medicineByCategory: medicineByCategory.map((m) => ({
      category: m.category,
      stockLevel: m._sum.stockLevel ?? 0,
      capacity: m._sum.capacity ?? 0,
    })),
    medicineCriticalCount: medicineCritical,
    ambulances: ambulanceGrouped.map((a) => ({ status: a.status, count: a._count._all })),
    bloodBank,
  };
}

export async function getMedicineStockAlerts(limit = 20) {
  const stocks = await prisma.medicineStock.findMany({
    where: { status: { in: ["Critical", "Low"] } },
    include: { hospital: { select: { name: true, district: { select: { name: true } } } } },
    orderBy: { stockLevel: "asc" },
    take: limit,
  });
  return stocks.map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    hospitalName: s.hospital.name,
    districtName: s.hospital.district.name,
    stockLevel: s.stockLevel,
    capacity: s.capacity,
    status: s.status,
    unit: s.unit,
  }));
}
