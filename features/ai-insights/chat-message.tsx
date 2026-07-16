"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles, User, Lightbulb, Gauge } from "lucide-react";
import { MessageChart } from "./message-chart";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";

function RiskGauge({ score }: { score: number }) {
  const tone = score > 65 ? "var(--status-critical)" : score > 40 ? "var(--status-warning)" : "var(--status-good)";
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card/60 p-4">
      <div className="relative flex size-14 items-center justify-center rounded-full" style={{ background: `conic-gradient(${tone} ${score * 3.6}deg, var(--muted) 0deg)` }}>
        <div className="flex size-11 items-center justify-center rounded-full bg-card text-sm font-semibold">{score}</div>
      </div>
      <div>
        <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Gauge className="size-3.5" /> AI Risk Score
        </p>
        <p className="text-xs text-muted-foreground">Composite index derived from live surveillance signals</p>
      </div>
    </div>
  );
}

export function ChatMessageView({ message, index = 0 }: { message: ChatMessage; index?: number }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.02, 0.3) }}
      className={cn("flex gap-3", isUser && "flex-row-reverse")}
    >
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-[var(--brand-secondary)] text-white" : "bg-[var(--brand-primary)] text-white"
        )}
      >
        {isUser ? <User className="size-4" /> : <Sparkles className="size-4" />}
      </div>

      <div className={cn("min-w-0 max-w-[90%] space-y-3", isUser && "flex flex-col items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser ? "bg-[var(--brand-secondary)] text-white" : "bg-card border border-border"
          )}
        >
          <div className={cn("prose prose-sm max-w-none", isUser ? "prose-invert" : "dark:prose-invert", "prose-p:my-1.5 prose-headings:mt-1 prose-headings:mb-2 prose-table:text-xs")}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        </div>

        {message.riskScore !== undefined && <RiskGauge score={message.riskScore} />}

        {message.charts?.map((chart, i) => <MessageChart key={i} chart={chart} />)}

        {message.table && (
          <div className="w-full overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-xs">
              <thead className="bg-muted/60">
                <tr>
                  {message.table.columns.map((col) => (
                    <th key={col} className="whitespace-nowrap px-3 py-2 text-left font-semibold">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {message.table.rows.map((row, i) => (
                  <tr key={i} className="border-t border-border">
                    {row.map((cell, j) => (
                      <td key={j} className="whitespace-nowrap px-3 py-2 tabular-nums">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {message.recommendations && message.recommendations.length > 0 && (
          <div className="w-full space-y-2 rounded-xl border border-[var(--brand-accent)]/30 bg-[var(--brand-accent)]/5 p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-primary)]">
              <Lightbulb className="size-3.5" /> AI Recommendations
            </p>
            <ul className="space-y-1.5">
              {message.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-2 text-xs text-foreground/90">
                  <span className="text-[var(--brand-primary)]">&bull;</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
}
