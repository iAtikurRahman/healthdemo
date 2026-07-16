"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function LiveClock({ className }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={cn("flex-col items-end leading-tight px-2", className)}>
      <span className="text-xs font-medium tabular-nums">
        {now ? now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--:--"}
      </span>
      <span className="text-[10px] text-muted-foreground">
        {now ? now.toLocaleDateString("en-US", { weekday: "short", day: "2-digit", month: "short" }) : ""}
      </span>
    </div>
  );
}
