"use client";

import { FileText, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { CATEGORIES, SAVED_REPORTS } from "./saved-reports";
import { cn } from "@/lib/utils";

export function ChatSidebar({ onSelectReport, onNewChat }: { onSelectReport: (prompt: string) => void; onNewChat: () => void }) {
  return (
    <div className="flex h-full w-full flex-col border-r border-border bg-card/40">
      <div className="p-4">
        <Button onClick={onNewChat} className="w-full gap-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90">
          <Plus className="size-4" /> New Conversation
        </Button>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-5 pb-6">
          {CATEGORIES.map((category) => (
            <div key={category}>
              <p className="px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{category}</p>
              <div className="mt-1.5 space-y-0.5">
                {SAVED_REPORTS.filter((r) => r.category === category).map((report) => (
                  <button
                    key={report.id}
                    onClick={() => onSelectReport(report.prompt)}
                    className={cn(
                      "flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-xs transition-colors hover:bg-accent"
                    )}
                  >
                    <FileText className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                    <span>
                      <span className="block font-medium leading-snug">{report.title}</span>
                      <span className="text-[10px] text-muted-foreground">{report.createdAt}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
