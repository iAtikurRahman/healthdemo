import type { StatusTone } from "@/components/shared/status-badge";

export function scoreTone(score: number): StatusTone {
  if (score >= 75) return "critical";
  if (score >= 55) return "serious";
  if (score >= 35) return "warning";
  return "good";
}

export function scoreLabel(score: number): string {
  if (score >= 75) return "Needs Support Now";
  if (score >= 55) return "Elevated";
  if (score >= 35) return "Watch";
  return "Stable";
}

export const SCORE_BORDER: Record<StatusTone, string> = {
  critical: "border-l-[var(--status-critical)]",
  serious: "border-l-[var(--status-serious)]",
  warning: "border-l-[var(--status-warning)]",
  good: "border-l-[var(--status-good)]",
  neutral: "border-l-border",
};
