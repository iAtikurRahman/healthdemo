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
  view = "negative",
  isLoading,
  search,
  onSearchChange,
  division,
  onDivisionChange,
}: {
  hospitals?: CriticalHospital[];
  view?: "negative" | "positive";
  isLoading?: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  division: string;
  onDivisionChange: (v: string) => void;
}) {
  const isPositive = view === "positive";
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
        <h3 className="text-sm font-semibold">{isPositive ? "Top Performing Hospitals, Ranked Best First" : "All Hospitals, Ranked by Criticality"}</h3>
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
              <TableHead>{isPositive ? "Status" : "Primary Issue"}</TableHead>
              <TableHead className="text-right">Beds</TableHead>
              <TableHead className="text-right">Admissions</TableHead>
              <TableHead className="text-right">Case Fatality Rate</TableHead>
              <TableHead className="text-right">Criticality</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || !filtered
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
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
                      {h.concerns[0] ?? (isPositive ? "No concerns — stable" : "No active concerns")}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{h.beds}</TableCell>
                    <TableCell className="text-right tabular-nums">{h.admissionTotal.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <StatusBadge
                        showIcon={false}
                        tone={h.caseFatalityRate >= 3 ? "critical" : h.caseFatalityRate >= 1 ? "warning" : "good"}
                        label={`${h.caseFatalityRate.toFixed(1)}%`}
                      />
                    </TableCell>
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
