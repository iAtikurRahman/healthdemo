"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Activity } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import { SearchCommand } from "./search-command";
import { ThemeToggle } from "./theme-toggle";
import { NotificationPanel } from "./notification-panel";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LiveClock } from "@/components/shared/live-clock";

export function TopNav() {
  const pathname = usePathname();
  const current = NAV_ITEMS.find((n) => pathname?.startsWith(n.href));

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex items-center gap-2.5 px-5 py-5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[var(--brand-primary)] text-white">
              <Activity className="size-5" />
            </div>
            <p className="text-sm font-semibold">NHDSP</p>
          </div>
          <nav className="space-y-1 px-3">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-accent">
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="hidden min-w-0 flex-col lg:flex">
        <h1 className="truncate text-sm font-semibold">{current?.label ?? "National Health Executive Platform"}</h1>
        <p className="truncate text-xs text-muted-foreground">{current?.description ?? "Decision Support Platform"}</p>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden md:block">
          <SearchCommand />
        </div>
        <LiveClock className="hidden xl:flex" />
        <NotificationPanel />
        <ThemeToggle />
      </div>
    </header>
  );
}
