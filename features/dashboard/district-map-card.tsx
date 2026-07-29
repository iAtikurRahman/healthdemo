"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MapPinned, Users, BedDouble, Building2, Gauge, Landmark, MapPin } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { StatusBadge, riskToTone } from "@/components/shared/status-badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BangladeshMapClient } from "@/features/gis/bangladesh-map-client";
import { formatCompact } from "@/lib/format";
import type { DistrictMapDatum, NationalGisOverview, DistrictHospitalGroup } from "@/types";

async function fetchMap() {
  const res = await fetch("/api/map");
  if (!res.ok) throw new Error("Failed to load map data");
  return (await res.json()).data as { districts: DistrictMapDatum[] };
}

async function fetchGisOverview() {
  const res = await fetch("/api/gis-overview");
  if (!res.ok) throw new Error("Failed to load GIS overview");
  return (await res.json()).data as NationalGisOverview;
}

export function DistrictMapCard() {
  const { data, isLoading } = useQuery({ queryKey: ["map", "dashboard"], queryFn: fetchMap });
  const { data: overview } = useQuery({ queryKey: ["gis-overview", "dashboard"], queryFn: fetchGisOverview });
  const [selected, setSelected] = useState<DistrictMapDatum | null>(null);

  const districtStatsByName = useMemo(() => {
    const map = new Map<string, DistrictHospitalGroup>();
    if (!overview) return map;
    for (const division of overview.divisions) {
      for (const district of division.districts) {
        map.set(district.name.toLowerCase(), district);
      }
    }
    return map;
  }, [overview]);

  const selectedDistrictStats = selected ? districtStatsByName.get(selected.name.toLowerCase()) : undefined;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }}>
      <GlassCard className="p-5">
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPinned className="size-4 text-[var(--brand-primary)]" />
            <h3 className="text-sm font-semibold">National GIS Overview</h3>
          </div>
          <p className="text-xs text-muted-foreground">Click a district for details</p>
        </div>
        {overview && (
          <p className="mb-3 text-xs text-muted-foreground">
            <strong className="text-foreground">{overview.totals.divisions}</strong> Division &middot;{" "}
            <strong className="text-foreground">{overview.totals.districts}</strong> District &middot;{" "}
            <strong className="text-foreground">{overview.totals.upazilas}</strong> Upazila &middot;{" "}
            <strong className="text-foreground">{overview.totals.hospitals}</strong> Hospitals ({overview.reportYear} report)
          </p>
        )}
        {isLoading || !data ? (
          <div className="h-[420px] animate-pulse rounded-xl bg-muted" />
        ) : (
          <BangladeshMapClient districts={data.districts} onSelectDistrict={setSelected} height={420} />
        )}
      </GlassCard>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selected.name}
                  <StatusBadge tone={riskToTone(selected.riskLevel)} label={selected.riskLevel} />
                </DialogTitle>
                <DialogDescription>{selected.division} Division &middot; {selected.nameBn}</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { icon: Users, label: "Population", value: formatCompact(selected.population) },
                  { icon: Gauge, label: "Health Index", value: `${selected.healthIndex}/100` },
                  { icon: Building2, label: "Hospitals", value: `${selected.hospitalsCount}` },
                  { icon: BedDouble, label: "Beds Available", value: formatCompact(selected.bedsAvailable) },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg border border-border p-3">
                    <stat.icon className="size-4 text-muted-foreground" />
                    <p className="mt-2 text-lg font-semibold tabular-nums">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
                Active disease cases (14-day): <strong className="text-foreground">{selected.activeCases}</strong>
              </div>

              {selectedDistrictStats && selectedDistrictStats.upazilas.length > 0 && (
                <div className="pt-1">
                  <div className="mb-2 flex items-center gap-2">
                    <Landmark className="size-4 text-muted-foreground" />
                    <p className="text-xs font-semibold">
                      Upazila-wise Hospitals ({selectedDistrictStats.hospitalsCount} across {selectedDistrictStats.upazilas.length} upazilas)
                    </p>
                  </div>
                  <p className="mb-2 text-xs text-muted-foreground">
                    District total &mdash; Beds: <strong className="text-foreground">{formatCompact(selectedDistrictStats.stats.beds)}</strong>
                    {" · "}Admissions: <strong className="text-foreground">{formatCompact(selectedDistrictStats.stats.admissionTotal)}</strong>
                    {" · "}Deaths: <strong className="text-foreground">{formatCompact(selectedDistrictStats.stats.deathTotal)}</strong>
                    {" · "}Outdoor Visits: <strong className="text-foreground">{formatCompact(selectedDistrictStats.stats.outdoorVisitTotal)}</strong>
                  </p>
                  <ScrollArea className="h-56 rounded-lg border border-border">
                    <div className="divide-y divide-border">
                      {selectedDistrictStats.upazilas.map((upazila) => (
                        <div key={upazila.id} className="p-3">
                          <div className="mb-1 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="size-3.5 text-muted-foreground" />
                              <p className="text-xs font-medium">{upazila.name}</p>
                            </div>
                            <span className="text-xs text-muted-foreground">{upazila.hospitalsCount} hospital{upazila.hospitalsCount === 1 ? "" : "s"}</span>
                          </div>
                          <p className="mb-1.5 text-[11px] text-muted-foreground">
                            Beds: <strong className="text-foreground">{formatCompact(upazila.stats.beds)}</strong>
                            {" · "}Admissions: <strong className="text-foreground">{formatCompact(upazila.stats.admissionTotal)}</strong>
                            {" "}(M {formatCompact(upazila.stats.admissionMale)}/F {formatCompact(upazila.stats.admissionFemale)})
                            {" · "}Deaths: <strong className="text-foreground">{formatCompact(upazila.stats.deathTotal)}</strong>
                            {" · "}Outdoor Visits: <strong className="text-foreground">{formatCompact(upazila.stats.outdoorVisitTotal)}</strong>
                          </p>
                          {upazila.hospitals.length > 0 && (
                            <ul className="ml-5 list-disc space-y-0.5 text-xs text-muted-foreground">
                              {upazila.hospitals.map((h) => (
                                <li key={h.id}>{h.hospitalName}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
