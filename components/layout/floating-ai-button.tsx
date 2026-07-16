"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

export function FloatingAiButton() {
  const pathname = usePathname();
  if (pathname?.startsWith("/ai-insights") || pathname === "/" || pathname?.startsWith("/command-center")) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.6, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <Link href="/ai-insights">
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-full bg-[var(--brand-primary)] px-4 py-3.5 text-sm font-medium text-white shadow-lg shadow-[var(--brand-primary)]/40"
          >
            <motion.span
              animate={{ rotate: [0, 15, -10, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2 }}
            >
              <Sparkles className="size-4" />
            </motion.span>
            Ask AI
          </motion.button>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
