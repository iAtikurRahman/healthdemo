"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronRight } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { DIVISIONS } from "@/mock-data/geo";
import { scoreTone } from "./score-utils";
import type { CriticalHospital } from "@/types";

export function HotspotTable({
  hospitals,
  isLoading,
  search,
  onSearchChange,
  division,
  onDivisionChange,
}: {
  hospitals?: CriticalHospital[];
  isLoading?: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  division: string;
  onDivisionChange: (v: string) => void;
}) {
  const router = useRouter();

  const filtered = useMemo(() => {
    if (!hospitals) return undefined;
    const q = search.trim().toLowerCase();
    return hospitals.filter(
      (h) =>
        (division === "all" || h.divisionName === division) &&
        (q === "" || h.name.toLowerCase().includes(q) || h.districtName.toLowerCase().includes(q))
    );
  }, [hospitals, search, division]);

  return (
    <GlassCard className="p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold">All Hospitals, Ranked by Criticality</h3>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search hospitals..."
              className="w-56 pl-8"
            />
          </div>
          <Select value={division} onValueChange={onDivisionChange}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Division" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Divisions</SelectItem>
              {DIVISIONS.map((d) => <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hospital</TableHead>
              <TableHead>District</TableHead>
              <TableHead>Primary Issue</TableHead>
              <TableHead className="text-right">Occupancy</TableHead>
              <TableHead className="text-right">ICU Free</TableHead>
              <TableHead className="text-right">Ventilators Free</TableHead>
              <TableHead className="text-right">Critical + Severe</TableHead>
              <TableHead className="text-right">Criticality</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || !filtered
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 9 }).map((__, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : filtered.slice(0, 60).map((h) => (
                  <TableRow
                    key={h.id}
                    onClick={() => router.push(`/actiondashboard/${h.id}`)}
                    className="cursor-pointer"
                  >
                    <TableCell className="max-w-[220px] truncate font-medium">{h.name}</TableCell>
                    <TableCell className="text-muted-foreground">{h.districtName}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                      {h.concerns[0] ?? "No active concerns"}
                    </TableCell>
                    <TableCell className="text-right">
                      <StatusBadge
                        showIcon={false}
                        tone={h.occupancyRate > 90 ? "critical" : h.occupancyRate > 75 ? "warning" : "good"}
                        label={`${h.occupancyRate.toFixed(0)}%`}
                      />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{h.icuAvailable}/{h.icuBeds}</TableCell>
                    <TableCell className="text-right tabular-nums">{h.ventilators - h.ventilatorsInUse}/{h.ventilators}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums text-[var(--status-critical)]">{h.criticalPatients + h.severePatients}</TableCell>
                    <TableCell className="text-right">
                      <StatusBadge showIcon={false} tone={scoreTone(h.criticalityScore)} label={h.criticalityScore.toFixed(1)} />
                    </TableCell>
                    <TableCell><ChevronRight className="size-4 text-muted-foreground" /></TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        {!isLoading && filtered && filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No hospitals match your search.</p>
        )}
      </div>
    </GlassCard>
  );
}
