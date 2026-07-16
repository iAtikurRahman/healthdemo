"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MapPinned, Users, BedDouble, Building2, Gauge } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { StatusBadge, riskToTone } from "@/components/shared/status-badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BangladeshMapClient } from "@/features/gis/bangladesh-map-client";
import { formatCompact } from "@/lib/format";
import type { DistrictMapDatum } from "@/types";

async function fetchMap() {
  const res = await fetch("/api/map");
  if (!res.ok) throw new Error("Failed to load map data");
  return (await res.json()).data as { districts: DistrictMapDatum[] };
}

export function DistrictMapCard() {
  const { data, isLoading } = useQuery({ queryKey: ["map", "dashboard"], queryFn: fetchMap });
  const [selected, setSelected] = useState<DistrictMapDatum | null>(null);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }}>
      <GlassCard className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPinned className="size-4 text-[var(--brand-primary)]" />
            <h3 className="text-sm font-semibold">National GIS Overview</h3>
          </div>
          <p className="text-xs text-muted-foreground">Click a district for details</p>
        </div>
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
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
