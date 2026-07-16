import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function GlassCard({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "glass rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
