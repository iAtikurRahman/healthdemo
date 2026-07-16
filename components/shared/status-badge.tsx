import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, XCircle, Info } from "lucide-react";

export type StatusTone = "good" | "warning" | "serious" | "critical" | "neutral";

const TONE_STYLES: Record<StatusTone, string> = {
  good: "bg-[color-mix(in_oklab,var(--status-good)_16%,transparent)] text-[var(--status-good)] border-[color-mix(in_oklab,var(--status-good)_35%,transparent)]",
  warning: "bg-[color-mix(in_oklab,var(--status-warning)_18%,transparent)] text-[var(--status-warning)] border-[color-mix(in_oklab,var(--status-warning)_38%,transparent)]",
  serious: "bg-[color-mix(in_oklab,var(--status-serious)_18%,transparent)] text-[var(--status-serious)] border-[color-mix(in_oklab,var(--status-serious)_38%,transparent)]",
  critical: "bg-[color-mix(in_oklab,var(--status-critical)_16%,transparent)] text-[var(--status-critical)] border-[color-mix(in_oklab,var(--status-critical)_35%,transparent)]",
  neutral: "bg-muted text-muted-foreground border-border",
};

const TONE_ICON: Record<StatusTone, React.ElementType> = {
  good: CheckCircle2,
  warning: AlertTriangle,
  serious: AlertTriangle,
  critical: XCircle,
  neutral: Info,
};

export function StatusBadge({
  tone,
  label,
  className,
  showIcon = true,
}: {
  tone: StatusTone;
  label: string;
  className?: string;
  showIcon?: boolean;
}) {
  const Icon = TONE_ICON[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        TONE_STYLES[tone],
        className
      )}
    >
      {showIcon && <Icon className="size-3.5 shrink-0" />}
      {label}
    </span>
  );
}

export function priorityToTone(priority: string): StatusTone {
  switch (priority.toLowerCase()) {
    case "critical":
      return "critical";
    case "high":
      return "serious";
    case "medium":
      return "warning";
    default:
      return "good";
  }
}

export function riskToTone(risk: string): StatusTone {
  switch (risk.toLowerCase()) {
    case "severe":
      return "critical";
    case "high":
      return "serious";
    case "moderate":
      return "warning";
    default:
      return "good";
  }
}
