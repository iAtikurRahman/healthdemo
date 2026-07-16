"use client";

import Link from "next/link";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";

export function LandingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[var(--brand-primary)] text-white shadow-md shadow-[var(--brand-primary)]/30">
            <Activity className="size-5" />
          </div>
          <span className="text-sm font-semibold">NHDSP</span>
        </div>
        <nav className="ml-8 hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="#stats" className="hover:text-foreground transition-colors">Platform</a>
          <a href="#technology" className="hover:text-foreground transition-colors">Technology</a>
          <Link href="/architecture" className="hover:text-foreground transition-colors">Architecture</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/command-center">View Demo</Link>
          </Button>
          <Button asChild className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90">
            <Link href="/dashboard">Explore Platform</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
