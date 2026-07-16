"use client";

import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCard } from "@/components/shared/alert-card";
import type { AlertItem } from "@/types";

async function fetchAlerts(): Promise<AlertItem[]> {
  const res = await fetch("/api/alerts?limit=20");
  if (!res.ok) throw new Error("Failed to load alerts");
  const json = await res.json();
  return json.data;
}

export function NotificationPanel() {
  const { data, isLoading } = useQuery({ queryKey: ["alerts", "panel"], queryFn: fetchAlerts });
  const criticalCount = data?.filter((a) => a.priority === "Critical").length ?? 0;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="size-4" />
          {criticalCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-[var(--brand-danger)] text-[9px] font-bold text-white">
              {criticalCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Live Alerts & Notifications</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-6rem)] px-4">
          <div className="space-y-3 pb-6">
            {isLoading && <p className="text-sm text-muted-foreground">Loading alerts...</p>}
            {data?.map((alert, i) => <AlertCard key={alert.id} alert={alert} index={i} />)}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
