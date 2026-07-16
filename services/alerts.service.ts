import { prisma } from "@/lib/prisma";
import type { AlertItem } from "@/types";

export interface AlertFilters {
  limit?: number;
  priority?: string;
  category?: string;
}

export async function getAlerts(filters: AlertFilters = {}): Promise<AlertItem[]> {
  const alerts = await prisma.alert.findMany({
    where: {
      ...(filters.priority ? { priority: filters.priority } : {}),
      ...(filters.category ? { category: filters.category } : {}),
    },
    include: { district: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: filters.limit ?? 30,
  });

  return alerts.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    category: a.category,
    priority: a.priority as AlertItem["priority"],
    districtName: a.district?.name ?? null,
    aiGenerated: a.aiGenerated,
    createdAt: a.createdAt.toISOString(),
  }));
}
