"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, BedDouble, Stethoscope, Siren, Activity, ChevronRight, Trophy, ArrowUpRight } from "lucide-react";
import { FcIdea } from "react-icons/fc";
import { GlassCard } from "@/components/shared/glass-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProgressMeter } from "@/components/shared/progress-meter";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { scoreTone, scoreLabel, SCORE_BORDER } from "@/features/actiondashboard/score-utils";
import type { CriticalHospitalDetail, AiSuggestionsResponse } from "@/types";

async function fetchHospitalDetail(id: string): Promise<CriticalHospitalDetail> {
  const res = await fetch(`/api/actiondashboard/${id}`);
  if (!res.ok) throw new Error("Failed to load hospital detail");
  return (await res.json()).data;
}

async function fetchAiSuggestions(id: string): Promise<AiSuggestionsResponse> {
  const res = await fetch(`/api/actiondashboard/${id}/suggestions`);
  if (!res.ok) throw new Error("Failed to load AI suggestions");
  return (await res.json()).data;
}

const PRIORITY_TONE: Record<AiSuggestionsResponse["suggestions"][number]["priority"], "critical" | "warning" | "good"> = {
  High: "critical",
  Medium: "warning",
  Low: "good",
};

function pressureTone(value: number, highThreshold: number, midThreshold: number): "critical" | "warning" | "good" {
  if (value >= highThreshold) return "critical";
  if (value >= midThreshold) return "warning";
  return "good";
}

export default function HospitalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ["actiondashboard", id],
    queryFn: () => fetchHospitalDetail(id),
  });
  const {
    data: aiSuggestions,
    isLoading: aiLoading,
    isError: aiError,
  } = useQuery({
    queryKey: ["actiondashboard", id, "ai-suggestions"],
    queryFn: () => fetchAiSuggestions(id),
    enabled: !!id,
    retry: false,
  });

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-[1200px] space-y-6">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const tone = scoreTone(data.criticalityScore);

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <Link href="/actiondashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to Action Dashboard
      </Link>

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <GlassCard className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight">{data.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {data.upazilaName}, {data.districtName}, {data.divisionName} &middot; {data.reportYear} report
              </p>
              {data.concerns.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {data.concerns.map((c) => (
                    <span
                      key={c}
                      className="rounded-full bg-[color-mix(in_oklab,var(--status-critical)_10%,transparent)] px-2.5 py-1 text-xs font-medium text-[var(--status-critical)]"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
              <StatusBadge tone={tone} label={scoreLabel(data.criticalityScore)} />
              <span className="text-3xl font-semibold tabular-nums">
                {data.criticalityScore.toFixed(0)}
                <span className="text-sm text-muted-foreground">/100</span>
              </span>
              <span className="text-xs text-muted-foreground">Care risk score</span>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <GlassCard className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FcIdea className="size-4" />
            <h3 className="text-sm font-semibold">Actionable Insight From AI</h3>
          </div>
        </div>

        {aiLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
            </div>
          </div>
        ) : aiError || !aiSuggestions ? (
          <p className="text-sm text-muted-foreground">AI suggestions are unavailable right now.</p>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">{aiSuggestions.summary}</p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {aiSuggestions.suggestions.map((s, i) => (
                <div key={i} className="rounded-lg border border-border p-3">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{s.title}</p>
                    <StatusBadge showIcon={false} tone={PRIORITY_TONE[s.priority]} label={s.priority} className="shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground">{s.detail}</p>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mt-4 flex justify-end">
          <Button asChild size="sm" className="bg-sky-600 text-white hover:bg-sky-700">
            <Link href={`/ai-insights?hospitalId=${data.id}&hospitalName=${encodeURIComponent(data.name)}`}>
              More <ArrowUpRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <GlassCard className="p-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
            <BedDouble className="size-4.5" />
          </div>
          <AnimatedCounter value={data.beds} className="mt-3 block text-2xl font-semibold tabular-nums" />
          <p className="mt-1 text-xs text-muted-foreground">Beds &middot; {data.admissionsPerBed.toFixed(0)} admissions/bed</p>
        </GlassCard>
        <GlassCard className="p-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--status-warning)]/10 text-[var(--status-warning)]">
            <Stethoscope className="size-4.5" />
          </div>
          <AnimatedCounter value={data.admissionTotal} className="mt-3 block text-2xl font-semibold tabular-nums" />
          <p className="mt-1 text-xs text-muted-foreground">Admissions &middot; M {data.admissionMale.toLocaleString()} / F {data.admissionFemale.toLocaleString()}</p>
        </GlassCard>
        <GlassCard className="p-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--status-critical)]/10 text-[var(--status-critical)]">
            <Siren className="size-4.5" />
          </div>
          <AnimatedCounter value={data.deathTotal} className="mt-3 block text-2xl font-semibold tabular-nums" />
          <p className="mt-1 text-xs text-muted-foreground">Deaths &middot; {data.caseFatalityRate.toFixed(1)}% case fatality rate</p>
        </GlassCard>
        <GlassCard className="p-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--status-good)]/10 text-[var(--status-good)]">
            <Activity className="size-4.5" />
          </div>
          <AnimatedCounter value={data.outdoorVisitTotal} className="mt-3 block text-2xl font-semibold tabular-nums" />
          <p className="mt-1 text-xs text-muted-foreground">Outdoor visits &middot; incl. {data.outdoorVisitChild.toLocaleString()} child</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard className="p-5">
          <h3 className="mb-4 text-sm font-semibold">Why This Score</h3>
          <div className="space-y-4">
            <ProgressMeter
              label="Fatality pressure"
              value={data.scoreBreakdown.fatalityPressure}
              tone={pressureTone(data.scoreBreakdown.fatalityPressure, 60, 30)}
            />
            <ProgressMeter
              label="Overcrowding pressure"
              value={data.scoreBreakdown.overcrowdingPressure}
              tone={pressureTone(data.scoreBreakdown.overcrowdingPressure, 70, 40)}
            />
            <ProgressMeter
              label="Outdoor visit burden"
              value={data.scoreBreakdown.outdoorBurdenPressure}
              tone={pressureTone(data.scoreBreakdown.outdoorBurdenPressure, 55, 30)}
            />
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="mb-4 text-sm font-semibold">{data.reportYear} Activity by Gender</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead className="text-right">Male</TableHead>
                <TableHead className="text-right">Female</TableHead>
                <TableHead className="text-right">Child</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Admissions</TableCell>
                <TableCell className="text-right tabular-nums">{data.admissionMale.toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums">{data.admissionFemale.toLocaleString()}</TableCell>
                <TableCell className="text-right text-muted-foreground">&mdash;</TableCell>
                <TableCell className="text-right font-medium tabular-nums">{data.admissionTotal.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Deaths</TableCell>
                <TableCell className="text-right tabular-nums">{data.deathMale.toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums">{data.deathFemale.toLocaleString()}</TableCell>
                <TableCell className="text-right text-muted-foreground">&mdash;</TableCell>
                <TableCell className="text-right font-medium tabular-nums text-[var(--status-critical)]">{data.deathTotal.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Outdoor Visits</TableCell>
                <TableCell className="text-right tabular-nums">{data.outdoorVisitMale.toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums">{data.outdoorVisitFemale.toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums">{data.outdoorVisitChild.toLocaleString()}</TableCell>
                <TableCell className="text-right font-medium tabular-nums">{data.outdoorVisitTotal.toLocaleString()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Trophy className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Ranking</h3>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">National</p>
              <p className="mt-1 text-lg font-semibold tabular-nums">#{data.nationalRank} <span className="text-xs font-normal text-muted-foreground">of {data.totalHospitalsNational}</span></p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">{data.divisionName} Division</p>
              <p className="mt-1 text-lg font-semibold tabular-nums">#{data.divisionRank} <span className="text-xs font-normal text-muted-foreground">of {data.totalHospitalsInDivision}</span></p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">{data.districtName} District</p>
              <p className="mt-1 text-lg font-semibold tabular-nums">#{data.districtRank} <span className="text-xs font-normal text-muted-foreground">of {data.totalHospitalsInDistrict}</span></p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="mb-4 text-sm font-semibold">Other Hospitals in {data.districtName}</h3>
          {data.districtPeers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No other reporting hospitals in this district.</p>
          ) : (
            <div className="space-y-2">
              {data.districtPeers.map((peer) => {
                const peerTone = scoreTone(peer.criticalityScore);
                return (
                  <Link
                    key={peer.id}
                    href={`/actiondashboard/${peer.id}`}
                    className={`group flex items-center justify-between gap-3 rounded-lg border border-l-4 border-border ${SCORE_BORDER[peerTone]} bg-card/40 px-3 py-2 transition-colors hover:bg-muted/60`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{peer.name}</p>
                      <p className="text-xs text-muted-foreground">{peer.upazilaName}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-sm font-semibold tabular-nums">{peer.criticalityScore.toFixed(0)}</span>
                      <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
