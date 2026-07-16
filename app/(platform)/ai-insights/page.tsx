"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { ChatSidebar } from "@/features/ai-insights/chat-sidebar";
import { ChatInput } from "@/features/ai-insights/chat-input";
import { ChatMessageView } from "@/features/ai-insights/chat-message";
import { EXAMPLE_PROMPTS } from "@/features/ai-insights/saved-reports";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";
import type { ChatMessage } from "@/types";

async function askAi(message: string): Promise<ChatMessage> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error("AI request failed");
  return (await res.json()).data;
}

export default function AiInsightsPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking]);

  async function handleSend(content: string) {
    const userMessage: ChatMessage = {
      id: `u_${Date.now()}`,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);
    try {
      const response = await askAi(content);
      setMessages((prev) => [...prev, response]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `e_${Date.now()}`, role: "assistant", content: "Something went wrong generating a response. Please try again.", createdAt: new Date().toISOString() },
      ]);
    } finally {
      setIsThinking(false);
    }
  }

  const sidebarContent = (
    <ChatSidebar onSelectReport={handleSend} onNewChat={() => setMessages([])} />
  );

  return (
    <div className="mx-auto flex h-[calc(100vh-4.5rem)] max-w-[1600px] gap-0 overflow-hidden rounded-2xl border border-border">
      <div className="hidden w-72 shrink-0 lg:block">{sidebarContent}</div>

      <div className="flex min-w-0 flex-1 flex-col bg-background">
        <div className="flex items-center gap-2 border-b border-border p-3 lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon"><PanelLeft className="size-4" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Saved Reports</SheetTitle>
              {sidebarContent}
            </SheetContent>
          </Sheet>
          <p className="text-sm font-semibold">AI Executive Assistant</p>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
          {messages.length === 0 ? (
            <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]"
              >
                <Sparkles className="size-7" />
              </motion.div>
              <h2 className="text-lg font-semibold">AI Executive Assistant</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Ask a question about national health data, or try one of these:
              </p>
              <div className="mt-5 grid w-full gap-2 sm:grid-cols-2">
                {EXAMPLE_PROMPTS.map((prompt) => (
                  <motion.button
                    key={prompt}
                    whileHover={{ y: -2 }}
                    onClick={() => handleSend(prompt)}
                    className="rounded-xl border border-border bg-card px-4 py-3 text-left text-xs font-medium hover:border-[var(--brand-primary)]/40 hover:bg-accent"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.map((m, i) => <ChatMessageView key={m.id} message={m} index={i} />)}
              {isThinking && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex size-8 items-center justify-center rounded-full bg-[var(--brand-primary)] text-white">
                    <Sparkles className="size-4 animate-pulse" />
                  </span>
                  AI is analyzing national health data...
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mx-auto w-full max-w-3xl px-4 pb-4 lg:px-8">
          <ChatInput onSend={handleSend} disabled={isThinking} />
        </div>
      </div>
    </div>
  );
}
