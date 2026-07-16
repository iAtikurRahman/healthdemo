"use client";

import { useState, type KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function ChatInput({ onSend, disabled }: { onSend: (message: string) => void; disabled?: boolean }) {
  const [value, setValue] = useState("");

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about disease risk, hospital capacity, resources, or request an executive summary..."
        className="min-h-11 resize-none border-none shadow-none focus-visible:ring-0"
        rows={1}
      />
      <Button
        size="icon"
        disabled={disabled || !value.trim()}
        onClick={submit}
        className="shrink-0 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90"
      >
        <Send className="size-4" />
      </Button>
    </div>
  );
}
