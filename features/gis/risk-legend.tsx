const LEVELS: { label: string; color: string }[] = [
  { label: "Low", color: "#0ca30c" },
  { label: "Moderate", color: "#c98500" },
  { label: "High", color: "#ec835a" },
  { label: "Severe", color: "#d03b3b" },
];

export function RiskLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">Risk Level:</span>
      {LEVELS.map((l) => (
        <span key={l.label} className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ background: l.color }} />
          {l.label}
        </span>
      ))}
      <span className="ml-2 text-muted-foreground/70">Circle size = active cases (14-day)</span>
    </div>
  );
}
