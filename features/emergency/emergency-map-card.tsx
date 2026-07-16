"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Ambulance } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { BangladeshMapClient } from "@/features/gis/bangladesh-map-client";
import type { DistrictMapDatum, HospitalMapDatum, AmbulanceMapDatum } from "@/types";

async function fetchMap() {
  const res = await fetch("/api/map");
  if (!res.ok) throw new Error("Failed to load map data");
  return (await res.json()).data as { districts: DistrictMapDatum[]; hospitals: HospitalMapDatum[]; ambulances: AmbulanceMapDatum[] };
}

export function EmergencyMapCard() {
  const { data, isLoading } = useQuery({ queryKey: ["map", "emergency"], queryFn: fetchMap });

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }}>
      <GlassCard className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Ambulance className="size-4 text-[var(--brand-secondary)]" />
          <h3 className="text-sm font-semibold">Live Ambulance & Emergency Hospital Tracking</h3>
        </div>
        {isLoading || !data ? (
          <div className="h-[460px] animate-pulse rounded-xl bg-muted" />
        ) : (
          <BangladeshMapClient
            districts={data.districts}
            hospitals={data.hospitals.filter((h) => h.hasEmergency)}
            ambulances={data.ambulances}
            showHospitals
            showAmbulances
            height={460}
          />
        )}
      </GlassCard>
    </motion.div>
  );
}
